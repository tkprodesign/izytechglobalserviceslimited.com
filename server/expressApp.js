const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailRoutes = require('./routes/email');
const { initInvoicesTable, createInvoiceRouter } = require('./invoices_endpoint');
const {
  contactAutoReply,
  contactNotification,
  siteAssessmentAutoReply,
  siteAssessmentNotification,
  assessmentChargeEmail,
} = require('./lib/emailTemplate');
const { sendResendEmail } = require('./lib/resend');
const {
  PUBLIC_BUCKET,
  PRIVATE_BUCKET,
  publicUrl,
  createKey,
  createUpload,
  createPrivateDownload,
  isPrivateKey,
} = require('./lib/r2');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.SESSION_SECRET || 'izy-dev-secret-change-in-prod';

// ── Database ──────────────────────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

emailRoutes.setArchiveStore({
  async list(source) {
    const { rows } = await db.query(
      'SELECT provider_id FROM email_archives WHERE source = $1',
      [source],
    );
    return rows.map(row => row.provider_id);
  },
  async set({ source, providerId, archivedBy }) {
    await db.query(`
      INSERT INTO email_archives (source, provider_id, archived_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (source, provider_id) DO UPDATE
        SET archived_at = NOW(), archived_by = EXCLUDED.archived_by
    `, [source, providerId, archivedBy || null]);
  },
  async remove(source, providerId) {
    await db.query(
      'DELETE FROM email_archives WHERE source = $1 AND provider_id = $2',
      [source, providerId],
    );
  },
});

db.connect()
  .then(() => {
    console.log('Connected to Neon PostgreSQL');
    return initTestimonialsTable();
  })
  .then(() => initSiteSettingsTable())
  .then(() => initEmailArchiveTable())
  .then(() => initCoreTables())
  .then(() => initQuoteRequestFields())
  .then(() => initStoreTable())
  .then(() => initMilestonesTable())
  .then(() => initFounderTable())
  .then(() => initProjectsTable())
  .then(() => initInvoicesTable(db))
    .then(() => initSiteAnalyticsTable())
  .catch((err) => {
    console.error('Failed to connect to database:', err.message);
    process.exit(1);
  });

async function initTestimonialsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id         SERIAL PRIMARY KEY,
      name       TEXT        NOT NULL,
      role       TEXT        NOT NULL,
      company    TEXT        NOT NULL,
      text       TEXT        NOT NULL,
      rating     SMALLINT    NOT NULL DEFAULT 5,
      avatar     TEXT        NOT NULL,
      metric     TEXT        NOT NULL,
      sort_order SMALLINT    NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM testimonials');
  if (rows[0].n === 0) {
    await db.query(`
      INSERT INTO testimonials (name, role, company, text, rating, avatar, metric, sort_order) VALUES
      ('Amb Mrs Margaret Adebisi', 'Factory Manager',        'Port Harcourt', 'IZY Technologies transformed our factory''s electrical system. The industrial wiring and CCTV installation was completed on time and within budget. Our energy costs dropped by 60% after they added the solar component. Absolutely world-class service.',  5, 'MA', '60% energy cost reduction',  1),
      ('Mrs Helen Douye Miebi',    'Hospital Administrator', 'Nigeria',       'The electrical overhaul they carried out for our hospital was exceptional. Every detail was thought through — backup systems, UPS integration, clean installation. We''ve had zero power issues since the upgrade. Highly recommend.',                   5, 'HM', 'Zero downtime since upgrade', 2),
      ('Mrs Dominica Onyia',      'Property Developer',     'Port Harcourt', 'We contracted IZY Technologies for smart home automation across 20 luxury units. The results exceeded client expectations — from lighting scenes to integrated security, everything just works. Our buyers love it.',                                     5, 'DO', '20 luxury units automated',  3),
      ('Moni Pulo',               'School Principal',       'Nigeria',       'The solar installation has been a game changer for our school. We used to lose 4-5 hours daily to NEPA issues. Now we run all day on solar. The team was professional, fast and very tidy in their work.',                                            5, 'MP', 'Full-day solar independence', 4),
      ('Mr Kingsley Anyanwu',     'CEO',                    'Port Harcourt', 'Our hotel security was a headache before IZY took over. After their complete CCTV and access control overhaul, we can monitor the entire property from one screen, on our phones, anywhere. Outstanding work.',                                           5, 'KA', 'Full property remote access', 5)
    `);
    console.log('Testimonials table seeded with initial data');
  }
}

async function initSiteSettingsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Default platform configs: {enabled, url}
  const defaults = [
    { key: 'social_facebook',  val: JSON.stringify({ enabled: true,  url: '' }) },
    { key: 'social_instagram', val: JSON.stringify({ enabled: true,  url: '' }) },
    { key: 'social_whatsapp',  val: JSON.stringify({ enabled: true,  url: '' }) },
    { key: 'social_x',        val: JSON.stringify({ enabled: false, url: '' }) },
    { key: 'social_linkedin',  val: JSON.stringify({ enabled: false, url: '' }) },
    { key: 'social_youtube',   val: JSON.stringify({ enabled: false, url: '' }) },
    { key: 'social_telegram',  val: JSON.stringify({ enabled: false, url: '' }) },
  ];

  for (const { key, val } of defaults) {
    await db.query(`
      INSERT INTO site_settings (key, value) VALUES ($1, $2)
      ON CONFLICT (key) DO UPDATE
        SET value = EXCLUDED.value
        WHERE site_settings.value NOT LIKE '{%'
    `, [key, val]);
    // If key didn't exist yet (new platforms), insert it
    await db.query(`
      INSERT INTO site_settings (key, value) VALUES ($1, $2)
      ON CONFLICT (key) DO NOTHING
    `, [key, val]);
  }

  // Service cards are stored as one JSON array so the developer editor can
  // update the public homepage and Services page together. Do not overwrite
  // an existing value on startup: unlike the legacy social defaults, this
  // value begins with "[" rather than "{".
  await db.query(`
    INSERT INTO site_settings (key, value) VALUES ($1, $2)
    ON CONFLICT (key) DO NOTHING
  `, [
    'service_content',
    JSON.stringify([
      {
        id: 'solar',
        num: '01',
        title: 'Solar Energy Systems',
        description: 'Solar design, installation and energy storage for homes, businesses and industrial facilities. We build practical systems around your load profile, from hybrid backup to large commercial installations.',
        features: ['System Design & Sizing', 'Solar Installation', 'Inverter & Battery Systems', 'Off-Grid & Hybrid Systems', 'Preventive Maintenance', 'Performance Monitoring'],
        image: '/site-images/project-commercial-solar.jpg',
        color: '#F0A20E',
        featured: true,
      },
      {
        id: 'industrial',
        num: '02',
        title: 'Industrial Wiring',
        description: 'Electrical infrastructure for facilities that need dependable distribution and backup power, including distribution boards, UPS systems, transfer switches and industrial power equipment.',
        features: ['Electrical Design', 'Distribution Boards', 'UPS & Backup Systems', 'Transfer Switches', 'Industrial Power Equipment', 'Testing & Commissioning'],
        image: '/site-images/project-power-unit.jpg',
        color: '#3B82F6',
        featured: false,
      },
      {
        id: 'smartHome',
        num: '03',
        title: 'Smart Home Automation',
        description: 'We assess your property and plan connected home systems around lighting, access, security and everyday convenience, with the right infrastructure for a smooth integrated installation.',
        features: ['Lighting Control', 'Smart Locks & Entry', 'Security Integration', 'Perimeter Security', 'System Planning', 'Site Assessment'],
        image: '/site-images/project-site-team.jpg',
        color: '#8B5CF6',
        featured: false,
      },
      {
        id: 'security',
        num: '04',
        title: 'CCTV & Security',
        description: 'Professional CCTV installation and surveillance for homes, businesses, vessels and industrial sites, with camera placement designed around the areas that need visibility most.',
        features: ['CCTV Installation', 'Site Surveillance', 'Remote Monitoring', 'Access Control', 'Perimeter Protection', 'Security System Design'],
        image: '/site-images/project-cctv.jpg',
        color: '#EF4444',
        featured: false,
      },
      {
        id: 'itTech',
        num: '05',
        title: 'IT & Tech Services',
        description: 'Practical technology support for organisations, from computer and network installations to websites and digital brand systems that help teams connect and businesses show up online.',
        features: ['Computer Networking', 'Network Infrastructure', 'Device & Wi-Fi Setup', 'Website Development', 'Digital Brand Management', 'IT Consulting'],
        image: '/site-images/project-network-installation.jpg',
        color: '#10B981',
        featured: false,
      },
      {
        id: 'electrical',
        num: '06',
        title: 'General Electrical',
        description: 'Electrical installation and finishing work for residential and commercial spaces, from lighting installations to safe power distribution, upgrades and ongoing maintenance.',
        features: ['Lighting Installation', 'Electrical Installation', 'Power Distribution', 'Fault Finding', 'Rewiring & Upgrades', 'Electrical Maintenance'],
        image: '/site-images/project-electrical-installation.jpg',
        color: '#F59E0B',
        featured: false,
      },
    ]),
  ]);

  await db.query(`
    INSERT INTO site_settings (key, value) VALUES ($1, $2)
    ON CONFLICT (key) DO NOTHING
  `, ['company_contact', JSON.stringify(DEFAULT_COMPANY_CONTACT)]);
}

const DEFAULT_COMPANY_CONTACT = {
  addressLine1: 'No 1 Pathfinder close',
  addressLine2: 'Sandfield, Borikiri',
  city: 'Port Harcourt',
  state: 'Rivers State',
};

function normalizeCompanyContact(value) {
  if (!value || typeof value !== 'object') return null;

  const data = {
    addressLine1: String(value.addressLine1 || '').trim(),
    addressLine2: String(value.addressLine2 || '').trim(),
    city: String(value.city || '').trim(),
    state: String(value.state || '').trim(),
  };

  if (!data.addressLine1 || !data.city || !data.state) return null;
  return data;
}

const SERVICE_IDS = ['solar', 'industrial', 'smartHome', 'security', 'itTech', 'electrical'];

function normalizeServiceContent(value) {
  if (!Array.isArray(value)) return null;

  const services = value
    .filter(service => service && SERVICE_IDS.includes(service.id))
    .map(service => ({
      id: service.id,
      num: String(service.num || ''),
      title: String(service.title || '').trim(),
      description: String(service.description || '').trim(),
      features: Array.isArray(service.features)
        ? service.features.map(feature => String(feature || '').trim()).filter(Boolean).slice(0, 12)
        : [],
      image: String(service.image || '').trim(),
      color: String(service.color || '').trim(),
      featured: Boolean(service.featured),
    }));

  if (services.length !== SERVICE_IDS.length) return null;
  if (services.some(service =>
    !service.title ||
    !service.description ||
    !service.image ||
    !service.color ||
    service.features.length === 0
  )) return null;

  return SERVICE_IDS.map(id => services.find(service => service.id === id));
}

async function initEmailArchiveTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS email_archives (
      source      TEXT        NOT NULL CHECK (source IN ('received', 'sent')),
      provider_id TEXT        NOT NULL,
      archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      archived_by TEXT,
      PRIMARY KEY (source, provider_id)
    )
  `);
}

async function initCoreTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id         SERIAL PRIMARY KEY,
      name       TEXT        NOT NULL,
      email      TEXT        NOT NULL,
      subject    TEXT,
      message    TEXT        NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS quote_requests (
      id         SERIAL PRIMARY KEY,
      name       TEXT        NOT NULL,
      email      TEXT        NOT NULL,
      company    TEXT,
      service    TEXT        NOT NULL,
      details    TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function initSiteAnalyticsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS site_visits (
      id               BIGSERIAL PRIMARY KEY,
      visited_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      route            TEXT NOT NULL,
      referrer_origin  TEXT,
      device_type      TEXT NOT NULL CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
      browser_family   TEXT NOT NULL DEFAULT 'Other',
      os_family        TEXT NOT NULL DEFAULT 'Other',
      language         TEXT,
      timezone         TEXT,
      screen_bucket    TEXT,
      viewport_bucket  TEXT,
      connection_type  TEXT,
      session_hash     TEXT NOT NULL,
      consent_version  TEXT NOT NULL DEFAULT 'v1'
    )
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS site_visits_visited_at_idx
    ON site_visits (visited_at DESC)
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS site_visits_session_hash_idx
    ON site_visits (session_hash)
  `);
}

async function initQuoteRequestFields() {
  const columns = [
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'quote'`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS public_token TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS phone TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS address_line_1 TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS address_line_2 TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS city TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS state TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS landmark TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS property_type TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS project_stage TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS preferred_visit_date DATE`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS preferred_visit_time TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS attachments JSONB NOT NULL DEFAULT '[]'::jsonb`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'new'`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS assessment_fee NUMERIC(12,2)`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'not_requested'`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_instructions TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_reference TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_proof_url TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_notes TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_requested_at TIMESTAMPTZ`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS site_notes TEXT`,
    `ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  ];
  for (const statement of columns) await db.query(statement);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS quote_requests_public_token_idx
    ON quote_requests (public_token)
    WHERE public_token IS NOT NULL
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS quote_requests_assessment_idx
    ON quote_requests (request_type, created_at DESC)
  `);
}

// Prevent dropped connections from crashing the process — pg Pool will reconnect automatically
db.on('error', (err) => {
  console.error('PostgreSQL pool error (will reconnect):', err.message);
});

// Keep the pool alive — Neon closes idle connections after ~5 minutes
setInterval(() => {
  db.query('SELECT 1').catch(err => console.error('Keep-alive ping failed:', err.message));
}, 4 * 60 * 1000); // every 4 minutes

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Auth middleware ───────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireDev(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'developer') return res.status(403).json({ error: 'Developer access required' });
    next();
  });
}

app.use(createInvoiceRouter({ db, requireAuth }));

async function initStoreTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS store_products (
      id          SERIAL PRIMARY KEY,
      name        TEXT        NOT NULL,
      category    TEXT        NOT NULL,
      tag         TEXT        NOT NULL,
      unit        TEXT        NOT NULL DEFAULT 'per unit',
      description TEXT        NOT NULL DEFAULT '',
      badge       TEXT,
      rating      SMALLINT    NOT NULL DEFAULT 5,
      reviews     INT         NOT NULL DEFAULT 0,
      in_stock    BOOLEAN     NOT NULL DEFAULT TRUE,
      featured    BOOLEAN     NOT NULL DEFAULT FALSE,
      sort_order  SMALLINT    NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Add images column if it doesn't exist yet (safe migration)
  await db.query(`ALTER TABLE store_products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}'`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS store_enquiries (
      id          SERIAL PRIMARY KEY,
      name        TEXT        NOT NULL,
      phone       TEXT        NOT NULL,
      email       TEXT        NOT NULL,
      company     TEXT,
      location    TEXT        NOT NULL,
      message     TEXT,
      items       JSONB       NOT NULL DEFAULT '[]',
      status      TEXT        NOT NULL DEFAULT 'new',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM store_products');
  if (rows[0].n === 0) {
    await db.query(
      `INSERT INTO store_products (name,category,tag,unit,description,badge,rating,reviews,in_stock,featured,sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      ['400W Monocrystalline Solar Panel', 'Solar', 'Solar', 'per panel',
       'High-efficiency mono panel with 25-year performance warranty. Ideal for residential and commercial rooftop installations.',
       'BESTSELLER', 5, 48, true, true, 1]
    );
    console.log('Store products seeded with 1 initial product');
  }

}

// ── Store: Products (public) ───────────────────────────────────────────────────
app.get('/api/store/products', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id,name,category,tag,unit,description,badge,rating,reviews,in_stock,featured,images FROM store_products ORDER BY sort_order ASC, id ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Store: Submit enquiry (public) ────────────────────────────────────────────
app.post('/api/store/enquire', async (req, res) => {
  const { name, phone, email, company, location, message, items } = req.body || {};
  if (!name || !phone || !email || !location || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'name, phone, email, location and items are required' });
  try {
    await db.query(
      `INSERT INTO store_enquiries (name,phone,email,company,location,message,items) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [name, phone, email, company || null, location, message || null, JSON.stringify(items)]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Store enquiries ─────────────────────────────────────────────────────
app.get('/api/admin/store/enquiries', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 200, 500);
    const { rows } = await db.query(
      'SELECT * FROM store_enquiries ORDER BY created_at DESC LIMIT $1', [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/store/enquiries/:id/status', requireAuth, async (req, res) => {
  const { status } = req.body || {};
  if (!['new','reviewed','closed'].includes(status)) return res.status(400).json({ error: 'invalid status' });
  try {
    await db.query('UPDATE store_enquiries SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Store products CRUD ────────────────────────────────────────────────
app.get('/api/admin/store/products', requireAuth, async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM store_products ORDER BY sort_order ASC, id ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/store/products', requireAuth, async (req, res) => {
  const { name, category, tag, unit, description, badge, rating, reviews, in_stock, featured, images } = req.body || {};
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  try {
    const { rows } = await db.query(
      `INSERT INTO store_products (name,category,tag,unit,description,badge,rating,reviews,in_stock,featured,images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [name, category, tag || category, unit || 'per unit', description || '', badge || null,
       rating ?? 5, reviews ?? 0, in_stock !== false, featured === true,
       Array.isArray(images) ? images.filter(Boolean) : []]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/store/products/:id', requireAuth, async (req, res) => {
  const { name, category, tag, unit, description, badge, rating, reviews, in_stock, featured, images } = req.body || {};
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  try {
    const { rows } = await db.query(
      `UPDATE store_products SET name=$1,category=$2,tag=$3,unit=$4,description=$5,badge=$6,
       rating=$7,reviews=$8,in_stock=$9,featured=$10,images=$11 WHERE id=$12 RETURNING *`,
      [name, category, tag || category, unit || 'per unit', description || '', badge || null,
       rating ?? 5, reviews ?? 0, in_stock !== false, featured === true,
       Array.isArray(images) ? images.filter(Boolean) : [], req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/store/products/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM store_products WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: public image upload → Cloudflare R2 ───────────────────────────────
// The browser uploads directly to R2 with a short-lived signed PUT URL. The
// backend stores only the public delivery URL in the project/store record.
async function createPublicUpload(req, res, scope) {
  const MAX_BYTES = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  const { contentType, fileSize, fileName } = req.body || {};
  const normalizedType = String(contentType || '').toLowerCase().split(';')[0].trim();
  const size = Number(fileSize);

  if (!ALLOWED_TYPES.includes(normalizedType)) {
    return res.status(400).json({ error: 'Please upload a JPEG, PNG, WebP, GIF, or SVG image.' });
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return res.status(400).json({ error: 'Images must be larger than 0 bytes and no larger than 10 MB.' });
  }

  try {
    const key = createKey(scope, fileName, normalizedType);
    const uploadURL = await createUpload({
      bucket: PUBLIC_BUCKET,
      key,
      contentType: normalizedType,
    });
    res.json({ uploadURL, key, url: publicUrl(key) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

app.post('/api/admin/store/images/direct-upload', requireAuth, (req, res) => createPublicUpload(req, res, 'products'));

// ── Testimonials (public) ─────────────────────────────────────────────────────
app.get('/api/testimonials', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, role, company, text, rating, avatar, metric FROM testimonials ORDER BY sort_order ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Testimonials CRUD ───────────────────────────────────────────────────
app.get('/api/admin/testimonials', requireAuth, async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, role, company, text, rating, avatar, metric, sort_order, created_at FROM testimonials ORDER BY sort_order ASC, id ASC'
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/testimonials', requireAuth, async (req, res) => {
  const { name, role, company, text, rating, avatar, metric, sort_order } = req.body || {};
  const cleanName = String(name || '').trim();
  const cleanRole = String(role || '').trim();
  const cleanCompany = String(company || '').trim();
  const cleanText = String(text || '').trim();
  const cleanMetric = String(metric || '').trim();
  const cleanAvatar = String(avatar || '').trim();
  const numericRating = Number(rating);
  const numericSortOrder = Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0;

  if (!cleanName || !cleanRole || !cleanCompany || !cleanText || !cleanMetric) {
    return res.status(400).json({ error: 'name, role, company, text and metric are required' });
  }
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'rating must be a whole number from 1 to 5' });
  }
  if (numericSortOrder < 0) {
    return res.status(400).json({ error: 'sort_order cannot be negative' });
  }

  const initials = cleanName
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  try {
    const { rows } = await db.query(
      `INSERT INTO testimonials (name, role, company, text, rating, avatar, metric, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [cleanName, cleanRole, cleanCompany, cleanText, numericRating, cleanAvatar || initials, cleanMetric, numericSortOrder]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/testimonials/:id', requireAuth, async (req, res) => {
  const { name, role, company, text, rating, avatar, metric, sort_order } = req.body || {};
  const cleanName = String(name || '').trim();
  const cleanRole = String(role || '').trim();
  const cleanCompany = String(company || '').trim();
  const cleanText = String(text || '').trim();
  const cleanMetric = String(metric || '').trim();
  const cleanAvatar = String(avatar || '').trim();
  const numericRating = Number(rating);
  const numericSortOrder = Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0;

  if (!cleanName || !cleanRole || !cleanCompany || !cleanText || !cleanMetric) {
    return res.status(400).json({ error: 'name, role, company, text and metric are required' });
  }
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: 'rating must be a whole number from 1 to 5' });
  }
  if (numericSortOrder < 0) {
    return res.status(400).json({ error: 'sort_order cannot be negative' });
  }

  const initials = cleanName
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  try {
    const { rows } = await db.query(
      `UPDATE testimonials
       SET name=$1, role=$2, company=$3, text=$4, rating=$5, avatar=$6, metric=$7, sort_order=$8
       WHERE id=$9 RETURNING *`,
      [cleanName, cleanRole, cleanCompany, cleanText, numericRating, cleanAvatar || initials, cleanMetric, numericSortOrder, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'testimonial not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/testimonials/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM testimonials WHERE id=$1', [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'testimonial not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Site Settings: Socials (public read, auth write) ─────────────────────────
const SOCIAL_KEYS = ['social_facebook','social_instagram','social_whatsapp','social_x','social_linkedin','social_youtube','social_telegram'];

app.get('/api/settings/socials', async (_req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT key, value FROM site_settings WHERE key LIKE 'social_%' ORDER BY key"
    );
    const platforms = rows.map(r => {
      const slug = r.key.replace('social_', '');
      let parsed = { enabled: false, url: '' };
      try { parsed = JSON.parse(r.value); } catch { /* legacy empty string */ }
      return { key: slug, enabled: parsed.enabled ?? false, url: parsed.url ?? '' };
    });
    res.json({ platforms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/socials', requireAuth, async (req, res) => {
  const { platforms } = req.body || {};
  if (!Array.isArray(platforms)) return res.status(400).json({ error: 'platforms array required' });
  try {
    for (const { key, enabled, url } of platforms) {
      const dbKey = `social_${key}`;
      if (!SOCIAL_KEYS.includes(dbKey)) continue; // safety — ignore unknown keys
      const val = JSON.stringify({ enabled: Boolean(enabled), url: (url ?? '').trim() });
      await db.query(`
        INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `, [dbKey, val]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Site Settings: Services content (public read, developer write) ────────────
app.get('/api/settings/services', async (_req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT value FROM site_settings WHERE key = 'service_content' LIMIT 1"
    );
    const parsed = rows[0] ? JSON.parse(rows[0].value) : null;
    const data = normalizeServiceContent(parsed);
    if (!data) return res.status(500).json({ error: 'Service content is invalid' });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/services', requireDev, async (req, res) => {
  const data = normalizeServiceContent(req.body?.services);
  if (!data) {
    return res.status(400).json({
      error: 'Six valid service cards are required, with title, writeup, image, color and at least one feature each',
    });
  }

  try {
    await db.query(`
      INSERT INTO site_settings (key, value, updated_at) VALUES ('service_content', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [JSON.stringify(data)]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Site Settings: Company address (public read, authenticated write) ─────────
app.get('/api/settings/company-contact', async (_req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT value FROM site_settings WHERE key = 'company_contact' LIMIT 1"
    );
    const data = rows[0] ? normalizeCompanyContact(JSON.parse(rows[0].value)) : DEFAULT_COMPANY_CONTACT;
    if (!data) return res.status(500).json({ error: 'Company contact address is invalid' });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings/company-contact', requireAuth, async (req, res) => {
  const data = normalizeCompanyContact(req.body?.data);
  if (!data) {
    return res.status(400).json({
      error: 'Address line 1, city and state are required',
    });
  }

  try {
    await db.query(`
      INSERT INTO site_settings (key, value, updated_at) VALUES ('company_contact', $1, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `, [JSON.stringify(data)]);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health/db', async (_req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const DEVELOPER_EMAIL = process.env.DEVELOPER_EMAIL || 'developer@izytechglobalservices.com';
  const DEVELOPER_PASS  = process.env.DEVELOPER_EMAIL_PASSWORD;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASS  = process.env.ADMIN_EMAIL_PASSWORD;

  let role = null;
  if (email === DEVELOPER_EMAIL && password === DEVELOPER_PASS) role = 'developer';
  if (email === ADMIN_EMAIL && password === ADMIN_PASS) role = 'admin';

  if (!role) return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ email, role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, role });
});

// ── Admin: Stats ──────────────────────────────────────────────────────────────
app.get('/api/admin/stats', requireAuth, async (_req, res) => {
  try {
    const [contacts, quotes, contactsWeek, quotesWeek] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS n FROM contact_submissions'),
      db.query('SELECT COUNT(*)::int AS n FROM quote_requests'),
      db.query("SELECT COUNT(*)::int AS n FROM contact_submissions WHERE created_at >= NOW() - INTERVAL '7 days'"),
      db.query("SELECT COUNT(*)::int AS n FROM quote_requests WHERE created_at >= NOW() - INTERVAL '7 days'"),
    ]);
    res.json({
      contacts: contacts.rows[0].n,
      quotes: quotes.rows[0].n,
      contactsThisWeek: contactsWeek.rows[0].n,
      quotesThisWeek: quotesWeek.rows[0].n,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Contacts ───────────────────────────────────────────────────────────
app.get('/api/admin/contacts', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const { rows } = await db.query(
      'SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT $1', [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Quotes ─────────────────────────────────────────────────────────────
app.get('/api/admin/quotes', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const { rows } = await db.query(
      'SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT $1', [limit]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Submit contact form (public) ───────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, service, message, subject } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message required' });
  try {
    const enquirySubject = subject || (service ? `${service} enquiry` : 'Website contact enquiry');
    await db.query(
      'INSERT INTO contact_submissions (name, email, subject, message, created_at) VALUES ($1,$2,$3,$4,NOW())',
      [name, email, enquirySubject, [
        phone ? `Phone: ${phone}` : '',
        service ? `Service: ${service}` : '',
        message,
      ].filter(Boolean).join('\n\n')]
    );

    const from = process.env.NOREPLY_EMAIL;
    const recipient = process.env.INFO_EMAIL;
    if (!from || !recipient) {
      console.error('Contact submission saved, but email sender or recipient is not configured');
      return res.status(500).json({ error: 'Your message was saved, but email notification is not configured.' });
    }

    const notificationHtml = contactNotification({
      name, email, phone, service, subject: enquirySubject, message,
    });
    const autoReplyHtml = contactAutoReply({
      name, subject: enquirySubject, message: [
        phone ? `Phone: ${phone}` : '',
        service ? `Service: ${service}` : '',
        message,
      ].filter(Boolean).join('\n\n'),
    });
    const results = await Promise.allSettled([
      sendResendEmail({
        from: `IZY Technologies <${from}>`,
        to: recipient,
        subject: `New website enquiry: ${enquirySubject}`,
        html: notificationHtml,
        text: `New website enquiry from ${name}\n\nEmail: ${email}\n${phone ? `Phone: ${phone}\n` : ''}${service ? `Service: ${service}\n` : ''}\n${message}`,
        replyTo: email,
      }),
      sendResendEmail({
        from: `IZY Technologies <${from}>`,
        to: email,
        subject: "We've received your message — IZY Technologies",
        html: autoReplyHtml,
        text: `Hi ${name},\n\nThank you for contacting IZY Technologies Global Services Limited. We've received your message and our team will get back to you within 24–48 hours.\n\n${message}`,
        replyTo: recipient,
      }),
    ]);
    const failed = results.filter(result => result.status === 'rejected');
    if (failed.length > 0) {
      failed.forEach(result => console.error('Contact email delivery error:', result.reason?.message || result.reason));
      return res.status(502).json({ error: 'Your message was saved, but email delivery failed. Please try again or call us directly.' });
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Contact submission error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Public: Site assessment uploads ───────────────────────────────────────────
// Assessment files are private R2 objects. The browser uploads directly with a
// short-lived signed URL; only the object key is saved in PostgreSQL.
app.post('/api/site-assessments/uploads/direct-upload', async (req, res) => {
  const MAX_BYTES = 10 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const { contentType, fileSize, fileName } = req.body || {};
  const normalizedType = String(contentType || '').toLowerCase().split(';')[0].trim();
  const size = Number(fileSize);

  if (!ALLOWED_TYPES.includes(normalizedType)) {
    return res.status(400).json({ error: 'Please upload a JPEG, PNG, WebP, or GIF image.' });
  }
  if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
    return res.status(400).json({ error: 'Images must be larger than 0 bytes and no larger than 10 MB.' });
  }

  try {
    const key = createKey('assessments', fileName, normalizedType);
    const uploadURL = await createUpload({
      bucket: PRIVATE_BUCKET,
      key,
      contentType: normalizedType,
    });
    res.json({ uploadURL, key });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

function isLegacyAssessmentImage(url) {
  return typeof url === 'string'
    && /^https:\/\/imagedelivery\.net\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/public(?:$|[?#])/.test(url);
}

function isAllowedAssessmentFile(value) {
  return isPrivateKey(value) || isLegacyAssessmentImage(value);
}

function normalizeAssessmentAttachments(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(item => item && isAllowedAssessmentFile(item.key || item.url))
    .slice(0, 5)
    .map(item => ({
      ...(isPrivateKey(item.key || item.url)
        ? { key: item.key || item.url }
        : { url: item.url }),
      name: String(item.name || 'Site image').slice(0, 120),
      type: String(item.type || 'image/*').slice(0, 80),
    }));
}

async function signedAssessmentValue(value) {
  return isPrivateKey(value) ? createPrivateDownload(value) : value;
}

async function adminAssessmentRow(row) {
  const attachments = Array.isArray(row.attachments)
    ? await Promise.all(row.attachments.map(async item => {
      if (!item || typeof item !== 'object') return item;
      const key = item.key || item.url;
      return isPrivateKey(key)
        ? { ...item, url: await createPrivateDownload(key) }
        : item;
    }))
    : [];
  return {
    ...row,
    attachments,
    payment_proof_url: await signedAssessmentValue(row.payment_proof_url),
  };
}

// ── Public: Request a paid site assessment ─────────────────────────────────────
app.post('/api/site-assessments', async (req, res) => {
  const {
    name, email, phone, service, propertyType, projectStage,
    addressLine1, addressLine2, city, state, landmark,
    preferredVisitDate, preferredVisitTime, details, attachments,
  } = req.body || {};

  const required = { name, email, phone, service, propertyType, projectStage, addressLine1, city, state, details };
  const missing = Object.entries(required).filter(([, value]) => !String(value || '').trim()).map(([key]) => key);
  if (missing.length) {
    return res.status(400).json({ error: `Please complete the required fields: ${missing.join(', ')}` });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (preferredVisitDate && !/^\d{4}-\d{2}-\d{2}$/.test(String(preferredVisitDate))) {
    return res.status(400).json({ error: 'Preferred visit date must be a valid date.' });
  }

  const publicToken = crypto.randomUUID();
  const safeAttachments = normalizeAssessmentAttachments(attachments);
  try {
    const { rows } = await db.query(`
      INSERT INTO quote_requests (
        name, email, company, service, details, created_at,
        request_type, public_token, phone, address_line_1, address_line_2,
        city, state, landmark, property_type, project_stage,
        preferred_visit_date, preferred_visit_time, attachments, status, payment_status, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,NOW(),
        'site_assessment',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
        'new','not_requested',NOW()
      )
      RETURNING id
    `, [
      String(name).trim(), String(email).trim(), null, String(service).trim(),
      String(details).trim(), publicToken, String(phone).trim(),
      String(addressLine1).trim(), String(addressLine2 || '').trim() || null,
      String(city).trim(), String(state).trim(), String(landmark || '').trim() || null,
      String(propertyType).trim(), String(projectStage).trim(),
      preferredVisitDate || null, String(preferredVisitTime || '').trim() || null,
      JSON.stringify(safeAttachments),
    ]);

    const requestId = rows[0].id;
    const from = process.env.NOREPLY_EMAIL;
    const recipient = process.env.INFO_EMAIL;
    if (!from || !recipient) {
      return res.status(500).json({ error: 'Your request was saved, but email notification is not configured.' });
    }

    const notificationHtml = siteAssessmentNotification({
      id: requestId, name, email, phone, service, propertyType, projectStage,
      addressLine1, addressLine2, city, state, landmark, preferredVisitDate,
      preferredVisitTime, details,
    });
    const autoReplyHtml = siteAssessmentAutoReply({ name, service, publicToken });
    const results = await Promise.allSettled([
      sendResendEmail({
        from: `IZY Technologies <${from}>`,
        to: recipient,
        subject: `New site assessment request: ${name}`,
        html: notificationHtml,
        text: `New site assessment request #${requestId}\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nProperty: ${propertyType}\nProject stage: ${projectStage}\nSite: ${[addressLine1, addressLine2, city, state, landmark].filter(Boolean).join(', ')}\nPreferred visit: ${[preferredVisitDate, preferredVisitTime].filter(Boolean).join(' — ') || 'Not specified'}\n\n${details}`,
        replyTo: email,
      }),
      sendResendEmail({
        from: `IZY Technologies <${from}>`,
        to: email,
        subject: 'Your site assessment request is received — IZY Technologies',
        html: autoReplyHtml,
        text: `Hello ${name},\n\nWe received your request for a paid on-site assessment for ${service}. Our team will review your project and location before sending payment instructions.\n\nRequest status: Under review\n\nView request status: https://izytechglobalservices.com/assessment/${publicToken}`,
        replyTo: recipient,
      }),
    ]);
    const failed = results.filter(result => result.status === 'rejected');
    if (failed.length) {
      failed.forEach(result => console.error('Site assessment email error:', result.reason?.message || result.reason));
      return res.status(502).json({ error: 'Your request was saved, but email delivery failed. Please call us directly if you do not receive a confirmation.' });
    }
    res.status(201).json({ success: true, requestId, token: publicToken });
  } catch (err) {
    console.error('Site assessment submission error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

function publicAssessmentStatus(row) {
  return {
    requestId: row.id,
    name: row.name,
    service: row.service,
    status: row.status,
    paymentStatus: row.payment_status,
    assessmentFee: row.assessment_fee,
    paymentInstructions: row.payment_instructions,
    preferredVisitDate: row.preferred_visit_date,
    preferredVisitTime: row.preferred_visit_time,
    scheduledFor: row.scheduled_for,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

app.get('/api/site-assessments/:token', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, service, status, payment_status, assessment_fee, payment_instructions,
              preferred_visit_date, preferred_visit_time, scheduled_for, created_at, updated_at
       FROM quote_requests WHERE public_token = $1 AND request_type = 'site_assessment'`,
      [req.params.token],
    );
    if (!rows.length) return res.status(404).json({ error: 'Assessment request not found.' });
    res.json({ data: publicAssessmentStatus(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/site-assessments/:token/payment-proof', async (req, res) => {
  const { key, url, name, reference } = req.body || {};
  const fileKey = key || url;
  if (!isAllowedAssessmentFile(fileKey)) {
    return res.status(400).json({ error: 'Please upload a valid receipt or invoice image.' });
  }
  try {
    const { rows } = await db.query(
      `UPDATE quote_requests
       SET payment_proof_url = $1, payment_reference = $2,
           payment_status = 'proof_submitted', status = 'payment_proof_submitted', updated_at = NOW()
       WHERE public_token = $3 AND request_type = 'site_assessment'
         AND payment_status IN ('pending', 'rejected')
         AND payment_status NOT IN ('confirmed') AND status NOT IN ('cancelled', 'completed')
       RETURNING id`,
       [fileKey, String(reference || name || '').trim().slice(0, 160) || null, req.params.token],
    );
    if (!rows.length) return res.status(404).json({ error: 'This request cannot accept payment proof.' });
    res.json({ success: true, status: 'payment_proof_submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Site assessment queue ───────────────────────────────────────────────
app.get('/api/admin/site-assessments', requireAuth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);
    const status = String(req.query.status || '').trim();
    const values = [];
    const where = [`request_type = 'site_assessment'`];
    if (status) {
      values.push(status);
      where.push(`status = $${values.length}`);
    }
    values.push(limit);
    const { rows } = await db.query(
      `SELECT * FROM quote_requests WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT $${values.length}`,
      values,
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/site-assessments/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT * FROM quote_requests WHERE id = $1 AND request_type = 'site_assessment'`,
      [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Site assessment not found.' });
    res.json({ data: await adminAssessmentRow(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/site-assessments/:id', requireAuth, async (req, res) => {
  const {
    status, paymentStatus, assessmentFee, paymentInstructions,
    paymentReference, paymentNotes, scheduledFor, siteNotes,
  } = req.body || {};
  const validStatuses = ['new', 'under_review', 'charge_sent', 'payment_proof_submitted', 'paid', 'scheduled', 'completed', 'proposal_sent', 'cancelled'];
  const validPaymentStatuses = ['not_requested', 'pending', 'proof_submitted', 'confirmed', 'rejected'];
  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid assessment status.' });
  }
  if (paymentStatus !== undefined && !validPaymentStatuses.includes(paymentStatus)) {
    return res.status(400).json({ error: 'Invalid payment status.' });
  }
  const fee = assessmentFee === undefined || assessmentFee === null || assessmentFee === ''
    ? null : Number(assessmentFee);
  if (fee !== null && (!Number.isFinite(fee) || fee <= 0)) {
    return res.status(400).json({ error: 'Assessment fee must be a positive amount.' });
  }
  try {
    const { rows } = await db.query(`
      UPDATE quote_requests
      SET status = COALESCE($1, status),
          payment_status = COALESCE($2, payment_status),
          assessment_fee = COALESCE($3, assessment_fee),
          payment_instructions = COALESCE($4, payment_instructions),
          payment_reference = COALESCE($5, payment_reference),
          payment_notes = COALESCE($6, payment_notes),
          scheduled_for = COALESCE($7::timestamptz, scheduled_for),
          site_notes = COALESCE($8, site_notes),
          payment_confirmed_at = CASE
            WHEN $2 = 'confirmed' THEN COALESCE(payment_confirmed_at, NOW())
            ELSE payment_confirmed_at
          END,
          updated_at = NOW()
      WHERE id = $9 AND request_type = 'site_assessment'
      RETURNING *
    `, [
      status ?? null, paymentStatus ?? null, fee,
      paymentInstructions === undefined ? null : String(paymentInstructions).trim(),
      paymentReference === undefined ? null : String(paymentReference).trim(),
      paymentNotes === undefined ? null : String(paymentNotes).trim(),
      scheduledFor || null, siteNotes === undefined ? null : String(siteNotes).trim(),
      req.params.id,
    ]);
    if (!rows.length) return res.status(404).json({ error: 'Site assessment not found.' });
    res.json({ data: await adminAssessmentRow(rows[0]) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/site-assessments/:id/send-charge', requireAuth, async (req, res) => {
  const { assessmentFee, paymentInstructions, currency = 'NGN' } = req.body || {};
  const fee = Number(assessmentFee);
  if (!Number.isFinite(fee) || fee <= 0 || !String(paymentInstructions || '').trim()) {
    return res.status(400).json({ error: 'A positive assessment fee and payment instructions are required.' });
  }
  const from = process.env.NOREPLY_EMAIL;
  if (!from) return res.status(500).json({ error: 'No-reply email is not configured.' });

  try {
    const { rows } = await db.query(
      `SELECT id, name, email, service, public_token FROM quote_requests WHERE id = $1 AND request_type = 'site_assessment'`,
      [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ error: 'Site assessment not found.' });
    const assessment = rows[0];
    const html = assessmentChargeEmail({
      name: assessment.name,
      service: assessment.service,
      fee: fee.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      currency: String(currency).slice(0, 8).toUpperCase(),
      instructions: String(paymentInstructions).trim(),
      publicToken: assessment.public_token,
    });
    await sendResendEmail({
      from: `IZY Technologies <${from}>`,
      to: assessment.email,
      subject: `Site assessment charge — IZY Technologies`,
      html,
      text: `Hello ${assessment.name},\n\nYour site assessment fee is ${String(currency).toUpperCase()} ${fee.toLocaleString('en-NG', { minimumFractionDigits: 2 })}.\n\nPayment instructions:\n${String(paymentInstructions).trim()}\n\nSubmit payment proof: https://izytechglobalservices.com/assessment/${assessment.public_token}`,
      replyTo: process.env.INFO_EMAIL || from,
    });
    const { rows: updated } = await db.query(`
      UPDATE quote_requests
      SET assessment_fee = $1, payment_instructions = $2,
          payment_status = 'pending', status = 'charge_sent',
          payment_requested_at = NOW(), updated_at = NOW()
      WHERE id = $3 AND request_type = 'site_assessment'
      RETURNING *
    `, [fee, String(paymentInstructions).trim(), req.params.id]);
    res.json({ success: true, data: await adminAssessmentRow(updated[0]) });
  } catch (err) {
    console.error('Site assessment charge error:', err.message);
    res.status(err.status || 502).json({ error: err.message });
  }
});

// ── Admin: Submit quote (public) ──────────────────────────────────────────────
app.post('/api/quote', async (req, res) => {
  const { name, email, company, service, details } = req.body || {};
  if (!name || !email || !service) return res.status(400).json({ error: 'name, email and service required' });
  try {
    await db.query(
      'INSERT INTO quote_requests (name, email, company, service, details, created_at) VALUES ($1,$2,$3,$4,$5,NOW())',
      [name, email, company || null, service, details || null]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Milestones ────────────────────────────────────────────────────────────────
async function initMilestonesTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS milestones (
      id          SERIAL PRIMARY KEY,
      year        TEXT        NOT NULL,
      title       TEXT        NOT NULL,
      description TEXT        NOT NULL DEFAULT '',
      icon_name   TEXT        NOT NULL DEFAULT 'Star',
      sort_order  SMALLINT    NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM milestones');
  if (rows[0].n === 0) {
    const seed = [
      ['Late 2017', 'The Idea Takes Shape',        'A vision to bring reliable solar energy to Nigerian communities begins to take shape — driven by the belief that energy independence should be accessible to all.',                                                                                              'Lightbulb',  1],
      ['March 2018','Official Incorporation',       'IZY Technologies Global Services Limited is officially founded by Israel Ideozu, launching with a clear mission: accessible, reliable solar energy solutions for every Nigerian home and business.',                                                           'Building2',  2],
      ['2019',      'First Major Installations',    'First major residential and commercial solar installations completed across Rivers State, earning early recognition for engineering quality and professional service delivery.',                                                                                 'Zap',        3],
      ['2020',      'Expanding Our Reach',          'Service portfolio expands to include Smart Home Automation and CCTV Security Systems, establishing IZY as a full-spectrum energy and technology company.',                                                                                                     'Home',       4],
      ['2022',      '1,000+ Jobs Delivered',        'Reached more than 1,000 completed jobs across solar energy, electrical systems, security, smart home and IT services — a milestone affirming our reputation for excellence and reliability.',                       'TrendingUp', 5],
      ['2023',      'Industry Recognition',         'Received industry recognition for innovation and outstanding contribution to Nigeria\'s energy and technology sector.',                                                                                                                        'Award',      6],
      ['2024',      'Nationwide & Community Impact','Deepened reach across all 36 states and FCT while launching community solar education programmes, advocating for sustainability and energy independence nationwide.',                                                                                           'Globe',      7],
    ];
    for (const [year, title, description, icon_name, sort_order] of seed) {
      await db.query(
        `INSERT INTO milestones (year, title, description, icon_name, sort_order) VALUES ($1,$2,$3,$4,$5)`,
        [year, title, description, icon_name, sort_order]
      );
    }
    console.log('Milestones table seeded with initial data');
  }
}

// ── Founder profile ───────────────────────────────────────────────────────────
async function initFounderTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS founder_profile (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL DEFAULT '',
      title      TEXT NOT NULL DEFAULT '',
      bio        TEXT NOT NULL DEFAULT '',
      photo_url  TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM founder_profile');
  if (rows[0].n === 0) {
    await db.query(
      `INSERT INTO founder_profile (name, title, bio, photo_url) VALUES ($1,$2,$3,$4)`,
      [
        'Israel Ideozu',
        'Founder & Chief Executive Officer',
        'Israel Ideozu founded IZY Technologies Global Services Limited on March 8, 2018, driven by a conviction that quality solar energy and technology solutions should be within reach for every Nigerian. Under his leadership, the company has grown from a small team of solar enthusiasts into a trusted name across the country, completing more than 1,000 jobs across energy and technology services and earning recognition for innovation in Nigeria\'s renewable energy sector. His commitment to excellence, community impact, and a cleaner future continues to shape every project IZY undertakes.',
        '',
      ]
    );
    console.log('Founder profile seeded');
  }
}

// ── Projects ──────────────────────────────────────────────────────────────────
async function initProjectsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id                SERIAL PRIMARY KEY,
      title             TEXT        NOT NULL,
      slug              TEXT        NOT NULL UNIQUE,
      category          TEXT        NOT NULL,
      location          TEXT        NOT NULL DEFAULT '',
      year              TEXT        NOT NULL DEFAULT '',
      short_description TEXT        NOT NULL DEFAULT '',
      full_description  TEXT        NOT NULL DEFAULT '',
      result_metric     TEXT        NOT NULL DEFAULT '',
      services          TEXT[]      NOT NULL DEFAULT '{}',
      images            TEXT[]      NOT NULL DEFAULT '{}',
      main_image_url    TEXT        NOT NULL DEFAULT '',
      featured          BOOLEAN     NOT NULL DEFAULT FALSE,
      sort_order        SMALLINT    NOT NULL DEFAULT 0,
      published         BOOLEAN     NOT NULL DEFAULT FALSE,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  // Additive migration: add show_year column if it doesn't exist yet
  await db.query(`
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS show_year BOOLEAN NOT NULL DEFAULT FALSE
  `);

  // Additive migration: multi-category support
  await db.query(`
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}'
  `);

  // Rename legacy combined category to the proper service name
  await db.query(`UPDATE projects SET category = 'IT & Tech' WHERE category = 'Solar + IT'`);

  // Backfill categories array from category for existing rows
  await db.query(`
    UPDATE projects SET categories = ARRAY[category]
    WHERE categories = '{}' OR categories IS NULL
  `);

  await db.query('CREATE INDEX IF NOT EXISTS projects_category_idx ON projects (category)');
  await db.query('CREATE INDEX IF NOT EXISTS projects_published_order_idx ON projects (published, sort_order, id)');

  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM projects');
  if (rows[0].n === 0) {
    const seed = [
      ['150kW Commercial Solar Farm', '150kw-commercial-solar-farm', 'Solar Energy', 'Trans Amadi, Port Harcourt', '2024', 'A 150kW grid-tie solar system designed and installed for a manufacturing facility — cutting electricity costs by 78% from day one.', 'Izy Tech Services designed, supplied and installed a 150kW grid-tie solar power system for a leading manufacturing facility in Trans Amadi, Port Harcourt. The system comprises 300 high-efficiency monocrystalline panels, 4 industrial-grade string inverters, and a 200kWh lithium iron phosphate battery bank for overnight load shifting. Within the first billing cycle, the client recorded a 78% reduction in grid electricity consumption — translating to millions of naira in annual savings. The installation was completed in 21 days with zero disruption to factory operations.', '78% bill reduction', ['Solar design', 'Panel installation', 'Inverter systems', 'Battery storage'], ['/site-images/project-commercial-solar.jpg']],
      ['Luxury Smart Villa — GRA Phase 2', 'luxury-smart-villa-gra-phase-2', 'Smart Home', 'GRA Phase 2, Port Harcourt', '2024', 'Full smart home transformation for a 5-bedroom luxury villa — lighting, climate, security and entertainment unified under one intelligent system.', 'Izy Tech Services delivered a comprehensive smart home solution for a 5-bedroom luxury villa in GRA Phase 2, Port Harcourt. The scope covered automated lighting scenes across all rooms, intelligent HVAC scheduling, whole-home audio distribution, motorised blinds, biometric door locks, and an integrated security system with interior and perimeter cameras. Every subsystem is controlled through a single touchscreen panel and mobile app, allowing the homeowner to manage the entire property from anywhere in the world.', 'Full home integration', ['Smart home automation', 'Lighting control', 'HVAC scheduling', 'Security integration'], ['/site-images/project-smart-home.jpg']],
      ['Industrial Security Complex — Aba', 'industrial-security-complex-aba', 'Security', 'Aba, Abia State', '2023', 'A 96-camera CCTV network with biometric access control deployed across a 20-acre industrial facility — delivering round-the-clock surveillance and site-wide access management.', 'Izy Tech Services designed and deployed a 96-camera high-definition CCTV network with biometric access control for a 20-acre industrial complex in Aba, Abia State. The system features facial recognition entry points at all gates, ANPR (automatic number-plate recognition) at vehicle access lanes, and a centralised monitoring station with 30-day encrypted storage. Remote viewing is available on mobile and desktop, giving the facility manager complete visibility across the entire site at any time.', '96 cameras deployed', ['CCTV installation', 'Biometric access control', 'ANPR systems', 'Remote monitoring'], ['/site-images/project-industrial.jpg']],
      ['Hospital Solar Power & Electrical Overhaul', 'hospital-solar-electrical-overhaul', 'Solar Energy', 'Abuja, FCT', '2023', 'Solar power system and critical electrical infrastructure upgrade for a 200-bed hospital — delivering zero downtime and 24/7 power reliability for life-saving equipment.', 'Izy Tech Services designed and installed a hybrid solar power system alongside a complete electrical infrastructure upgrade for a 200-bed hospital in Abuja, FCT. The scope included rooftop solar panels, battery backup, UPS systems for critical medical equipment, new distribution boards, automatic transfer switches, and emergency lighting circuits. Since completion, the hospital has experienced zero unplanned downtime — ensuring continuous power for operating theatres, ICU, diagnostic imaging and all patient wards.', 'Zero downtime post-install', ['Solar power system', 'UPS systems', 'Electrical distribution', 'Emergency backup'], ['/site-images/project-power-unit.jpg']],
      ['School Solar & IT Infrastructure', 'school-solar-it-infrastructure', 'IT & Tech', 'Port Harcourt, Rivers', '2022', 'Off-grid solar installation and complete IT infrastructure upgrade for a private school — powering 40 classrooms, computer labs and the administrative block around the clock.', 'Izy Tech Services delivered a combined off-grid solar power installation and full IT infrastructure upgrade for a private school in Port Harcourt. The solar system powers 40 classrooms, two computer labs and the administrative block entirely off-grid, eliminating dependency on the national grid and diesel generators. The IT upgrade included structured cabling, network switches, a server room, and Wi-Fi coverage across the entire campus — transforming the school into a fully connected, energy-independent learning environment.', '40 classrooms powered', ['Off-grid solar', 'Network infrastructure', 'Server room setup', 'Power backup'], ['/site-images/project-residential-solar.jpg']],
      ['Luxury Hotel Security Suite — Peter Odili Road', 'luxury-hotel-security-suite-peter-odili', 'Security', 'Peter Odili Road, Port Harcourt', '2022', 'A comprehensive security overhaul for a luxury hotel — 128 CCTV cameras, smart locks, perimeter sensors, and centralised monitoring accessible from any device.', 'Izy Tech Services conducted a full security overhaul for a luxury hotel on Peter Odili Road, Port Harcourt. The deployment includes 128 high-definition CCTV cameras covering all public areas, corridors, parking and perimeter zones. Smart electronic locks were fitted to every guest room and restricted area, with centralised access logging. Perimeter intrusion sensors and panic buttons are integrated into a unified monitoring dashboard — giving the security team complete visibility and instant alerts across the entire property, accessible on desktop or mobile.', 'Full remote access', ['CCTV installation', 'Smart electronic locks', 'Perimeter sensors', 'Centralised monitoring'], ['/site-images/project-site-team.jpg']],
    ];

    for (let index = 0; index < seed.length; index += 1) {
      const [title, slug, category, location, year, shortDescription, fullDescription, metric, services, images] = seed[index];
      await db.query(
        `INSERT INTO projects
          (title, slug, category, location, year, short_description, full_description,
           result_metric, services, images, main_image_url, featured, sort_order, published)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (slug) DO NOTHING`,
        [title, slug, category, location, year, shortDescription, fullDescription, metric, services, images, images[0], index === 0, index + 1, true]
      );
    }
    console.log('Projects table seeded with existing portfolio entries');
  }

  // ── Additive migration: upgrade lazily-input project records ──────────
  // Updates existing rows by slug only when their content is minimal.
  const upgrades = [
    {
      slug: 'cctv-project',
      title: 'CCTV Surveillance Complex — Trans Amadi',
      category: 'Security',
      categories: ['CCTV & Security'],
      location: 'Trans Amadi, Port Harcourt',
      shortDescription: 'A full-scale CCTV surveillance deployment for an industrial complex in Trans Amadi — delivering high-definition coverage, remote monitoring and 30-day encrypted storage across every zone.',
      fullDescription: 'Izy Tech Services designed and deployed a comprehensive high-definition CCTV surveillance system for an industrial complex in Trans Amadi, Port Harcourt. The project covered all production areas, warehouses, access roads and perimeter zones with weatherproof HD cameras, night-vision capability and a centralised monitoring station. Footage is stored on encrypted servers with 30-day retention, and the entire system is accessible remotely via desktop and mobile — giving the facility manager complete visibility around the clock.',
      metric: 'Full-site HD coverage',
      services: ['CCTV installation', 'Remote monitoring', 'Encrypted storage', 'Night-vision cameras'],
    },
    {
      slug: 'solar-project',
      title: 'Commercial Solar Installation — Eleme',
      category: 'Solar Energy',
      categories: ['Solar Energy Systems'],
      location: 'Eleme, Port Harcourt',
      shortDescription: 'A grid-tie solar power system designed and installed for a commercial facility in Eleme — reducing grid dependency and delivering significant electricity savings.',
      fullDescription: 'Izy Tech Services designed, supplied and installed a grid-tie solar power system for a commercial facility in Eleme, Port Harcourt. The installation comprises high-efficiency monocrystalline panels, industrial-grade string inverters and battery storage for load shifting. The system was commissioned with minimal disruption to daily operations, and the client has seen a measurable reduction in monthly electricity expenditure since activation.',
      metric: 'Significant bill reduction',
      services: ['Solar panel installation', 'Inverter systems', 'Battery storage', 'Grid-tie design'],
    },
    {
      slug: 'wiring-project',
      title: 'Industrial Wiring Overhaul — Trans Amadi',
      category: 'Industrial Wiring',
      categories: ['Industrial Wiring'],
      location: 'Trans Amadi, Port Harcourt',
      shortDescription: 'A complete electrical wiring overhaul for an industrial facility in Trans Amadi — replacing aging infrastructure with modern, code-compliant distribution systems.',
      fullDescription: 'Izy Tech Services carried out a complete electrical wiring overhaul for a manufacturing facility in Trans Amadi, Port Harcourt. The project involved replacing aging cables, distribution boards and switchgear with modern, code-compliant components rated for industrial loads. New dedicated circuits were installed for heavy machinery, and the entire facility was brought up to current Nigerian electrical safety standards. The upgrade has improved energy efficiency and eliminated the recurring faults that previously caused production downtime.',
      metric: 'Zero faults since upgrade',
      services: ['Electrical rewiring', 'Distribution board upgrade', 'Industrial switchgear', 'Safety compliance'],
    },
    {
      slug: 'home-automation-project',
      title: 'Smart Home Automation — GRA Phase 1',
      category: 'Smart Home',
      categories: ['Smart Home Automation'],
      location: 'GRA Phase 1, Port Harcourt',
      shortDescription: 'Smart home automation for a modern residence in GRA Phase 1 — integrating lighting, climate, security and entertainment into a single intelligent control system.',
      fullDescription: 'Izy Tech Services delivered a smart home automation solution for a modern residence in GRA Phase 1, Port Harcourt. The system integrates automated lighting scenes, intelligent climate scheduling, a multi-zone audio setup, motorised blinds and a biometric access-controlled front door — all managed through a central touchscreen panel and companion mobile app. The homeowner can monitor and control every subsystem remotely, ensuring comfort and security whether at home or abroad.',
      metric: 'Single-app control',
      services: ['Lighting automation', 'Climate control', 'Security integration', 'Audio distribution'],
    },
    {
      slug: 'electrical-project',
      title: 'General Electrical Installation — Okporokpo',
      category: 'General Electrical',
      categories: ['General Electrical'],
      location: 'Okporokpo, Port Harcourt',
      shortDescription: 'A general electrical installation for a commercial property in Okporokpo — complete wiring, lighting design, earthing systems and distribution board setup.',
      fullDescription: 'Izy Tech Services handled the complete electrical installation for a new commercial property in Okporokpo, Port Harcourt. The project included full internal and external wiring, a custom lighting design tailored to the client\'s operational needs, earth-leakage protection systems, and a main distribution board with labelled sub-circuits. All work was carried out to Nigerian electrical standards and certified upon completion, giving the client a safe, reliable and future-ready electrical infrastructure.',
      metric: 'Standards-certified',
      services: ['Full electrical wiring', 'Lighting design', 'Earthing systems', 'Distribution boards'],
    },
    {
      slug: 'it-infrastructure-project',
      title: 'IT & Network Infrastructure — Diobu',
      category: 'IT & Tech',
      categories: ['IT & Tech Services'],
      location: 'Diobu, Port Harcourt',
      shortDescription: 'Complete IT infrastructure deployment for a business centre in Diobu — structured cabling, network switching, server room setup and campus-wide Wi-Fi.',
      fullDescription: 'Izy Tech Services designed and deployed a complete IT infrastructure for a business centre in Diobu, Port Harcourt. The project encompassed structured cabling throughout the building, managed network switches, a climate-controlled server room with UPS backup, and enterprise-grade Wi-Fi access points providing seamless coverage across all floors. The result is a reliable, high-speed network environment that supports the centre\'s day-to-day operations without interruption.',
      metric: 'Campus-wide connectivity',
      services: ['Structured cabling', 'Network switching', 'Server room setup', 'Wi-Fi deployment'],
    },
    {
      slug: 'solar-installer',
      title: 'Residential Solar System — Woji',
      category: 'Solar Energy',
      categories: ['Solar Energy Systems'],
      location: 'Woji, Port Harcourt',
      shortDescription: 'A residential solar power system installed in Woji — reducing electricity bills and providing reliable backup power for a family home.',
      fullDescription: 'Izy Tech Services designed and installed a residential solar power system for a family home in Woji, Port Harcourt. The system features high-efficiency monocrystalline panels mounted on the rooftop, a hybrid inverter, and a lithium iron phosphate battery bank for overnight and cloudy-day backup. Since commissioning, the household has seen a significant reduction in electricity bills and no longer relies on the national grid during daytime hours. The installation was completed within three days with no disruption to the household.',
      metric: 'Daytime energy independence',
      services: ['Solar panel installation', 'Hybrid inverter setup', 'Battery backup', 'Roof mounting'],
    },
    {
      slug: 'cctv-installer',
      title: 'CCTV & Access Control — Okocha Road',
      category: 'Security',
      categories: ['CCTV & Security'],
      location: 'Okocha Road, Port Harcourt',
      shortDescription: 'CCTV cameras and biometric access control for a commercial property on Okocha Road — delivering real-time surveillance and secure entry management.',
      fullDescription: 'Izy Tech Services installed a network of high-definition CCTV cameras and biometric access control systems for a commercial property on Okocha Road, Port Harcourt. The deployment covers all entry points, corridors, car parks and perimeter areas with day-night capable cameras linked to a centralised recording system. Biometric readers at main entrances ensure only authorised personnel gain access, with full audit logs available to the property manager. Remote viewing is supported on both mobile and desktop platforms.',
      metric: 'Secure entry + full surveillance',
      services: ['CCTV installation', 'Biometric access control', 'Centralised recording', 'Remote monitoring'],
    },
    {
      slug: 'solar-power-system',
      title: 'Hospital Solar Power System — Trans Amadi',
      category: 'Solar Energy',
      categories: ['Solar Energy Systems'],
      location: 'Trans Amadi, Port Harcourt',
      shortDescription: 'A solar power system installed for a hospital in Trans Amadi — ensuring uninterrupted power for critical medical equipment and patient wards.',
      fullDescription: 'Izy Tech Services designed and installed a solar power system for a hospital in Trans Amadi, Port Harcourt. The system was engineered to provide uninterrupted power for critical medical equipment including operating theatres, diagnostic imaging machines and intensive care units. It features rooftop solar panels, industrial-grade inverters and a lithium iron phosphate battery bank sized for overnight operation. Since installation, the hospital has experienced consistent power availability with no unplanned downtime, directly supporting patient safety and clinical operations.',
      metric: 'Zero unplanned downtime',
      services: ['Solar power system', 'Battery storage', 'Hospital-grade power', 'Load management'],
    },
  ];

  for (const u of upgrades) {
    try {
      const { rows } = await db.query(
        'SELECT id, short_description FROM projects WHERE slug = $1 LIMIT 1',
        [u.slug]
      );
      if (rows.length && rows[0].short_description.length < 120) {
        await db.query(
          `UPDATE projects SET
            title = $1, category = $2, categories = $3, location = $4,
            short_description = $5, full_description = $6,
            result_metric = $7, services = $8, updated_at = NOW()
           WHERE slug = $9`,
          [u.title, u.category, u.categories, u.location,
           u.shortDescription, u.fullDescription, u.metric, u.services, u.slug]
        );
        console.log(`Upgraded project: ${u.slug}`);
      }
    } catch (err) {
      // If the slug doesn't exist yet, skip silently
    }
  }
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function cleanText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function cleanTextArray(value) {
  return Array.isArray(value)
    ? value.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean)
    : [];
}

function projectPayload(body = {}) {
  const categories = cleanTextArray(body.categories);
  // Primary category = first selected; fall back to legacy single `category` field
  const category = categories[0] || cleanText(body.category);
  const images = cleanTextArray(body.images);
  const sortOrder = Number.isFinite(Number(body.sort_order)) ? Math.trunc(Number(body.sort_order)) : 0;
  return {
    title: cleanText(body.title),
    slug: slugify(body.slug || cleanText(body.title)),
    category,
    categories,
    location: cleanText(body.location),
    year: cleanText(body.year),
    short_description: cleanText(body.short_description),
    full_description: cleanText(body.full_description),
    result_metric: cleanText(body.result_metric),
    services: cleanTextArray(body.services),
    images,
    main_image_url: cleanText(body.main_image_url) || images[0] || '',
    featured: body.featured === true,
    show_year: body.show_year === true,
    sort_order: sortOrder,
    published: body.published === true,
  };
}

function validateProject(project) {
  if (!project.title) return 'Project title is required';
  if (!project.categories || project.categories.length === 0) return 'Select at least one service category';
  if (!project.slug) return 'A valid project slug is required';
  if (project.title.length > 200) return 'Project title must be 200 characters or fewer';
  if (project.slug.length > 120) return 'Project slug must be 120 characters or fewer';
  if (project.year.length > 20) return 'Project year must be 20 characters or fewer';
  return null;
}

const PROJECT_FIELDS = `id, title, slug, category, categories, location, year, show_year,
  short_description, full_description, result_metric, services, images, main_image_url,
  featured, sort_order, published, created_at, updated_at`;

// ── Projects: public ──────────────────────────────────────────────────────────
app.get('/api/projects', async (req, res) => {
  const category = cleanText(req.query.category);
  try {
    const params = [];
    let where = 'WHERE published = TRUE';
    if (category && category.toLowerCase() !== 'all') {
      params.push(category);
      where += ` AND EXISTS (SELECT 1 FROM unnest(categories) c WHERE LOWER(c) = LOWER($${params.length}))`;
    }
    const { rows } = await db.query(
      `SELECT ${PROJECT_FIELDS} FROM projects ${where} ORDER BY featured DESC, sort_order ASC, id ASC`,
      params
    );
    const categoryResult = await db.query(
      `SELECT DISTINCT unnest(categories) AS category FROM projects
       WHERE published = TRUE AND array_length(categories, 1) > 0
       ORDER BY category ASC`
    );
    res.json({ data: rows, categories: categoryResult.rows.map(row => row.category) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:slug', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT ${PROJECT_FIELDS} FROM projects WHERE slug = $1 AND published = TRUE LIMIT 1`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Projects: admin and developer management ──────────────────────────────────
app.get('/api/admin/projects', requireAuth, async (req, res) => {
  const search = cleanText(req.query.search);
  const category = cleanText(req.query.category);
  const params = [];
  const filters = [];
  if (search) {
    params.push(`%${search}%`);
    filters.push(`(title ILIKE $${params.length} OR location ILIKE $${params.length})`);
  }
  if (category && category.toLowerCase() !== 'all') {
    params.push(category);
    filters.push(`EXISTS (SELECT 1 FROM unnest(categories) c WHERE LOWER(c) = LOWER($${params.length}))`);
  }
  try {
    const { rows } = await db.query(
      `SELECT ${PROJECT_FIELDS} FROM projects
       ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
       ORDER BY sort_order ASC, id ASC`,
      params
    );
    const categoryResult = await db.query(
      `SELECT DISTINCT unnest(categories) AS category FROM projects
       WHERE array_length(categories, 1) > 0
       ORDER BY category ASC`
    );
    res.json({ data: rows, categories: categoryResult.rows.map(row => row.category) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/projects', requireAuth, async (req, res) => {
  const project = projectPayload(req.body);
  const validationError = validateProject(project);
  if (validationError) return res.status(400).json({ error: validationError });
  try {
    const { rows } = await db.query(
      `INSERT INTO projects
        (title, slug, category, categories, location, year, show_year, short_description, full_description,
         result_metric, services, images, main_image_url, featured, sort_order, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING ${PROJECT_FIELDS}`,
      [
        project.title, project.slug, project.category, project.categories,
        project.location, project.year, project.show_year,
        project.short_description, project.full_description, project.result_metric,
        project.services, project.images, project.main_image_url, project.featured,
        project.sort_order, project.published,
      ]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'That project slug is already in use' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/projects/:id', requireAuth, async (req, res) => {
  const project = projectPayload(req.body);
  const validationError = validateProject(project);
  if (validationError) return res.status(400).json({ error: validationError });
  try {
    const { rows } = await db.query(
      `UPDATE projects SET
        title=$1, slug=$2, category=$3, categories=$4, location=$5, year=$6, show_year=$7,
        short_description=$8, full_description=$9, result_metric=$10, services=$11,
        images=$12, main_image_url=$13, featured=$14, sort_order=$15, published=$16,
        updated_at=NOW()
       WHERE id=$17
       RETURNING ${PROJECT_FIELDS}`,
      [
        project.title, project.slug, project.category, project.categories,
        project.location, project.year, project.show_year,
        project.short_description, project.full_description, project.result_metric,
        project.services, project.images, project.main_image_url, project.featured,
        project.sort_order, project.published, req.params.id,
      ]
    );
    if (!rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'That project slug is already in use' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/projects/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'DELETE FROM projects WHERE id=$1 RETURNING id, title, featured',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, deleted: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/projects/images/direct-upload', requireAuth, async (req, res) => {
  return createPublicUpload(req, res, 'projects');
});

// ── Public: Milestones ────────────────────────────────────────────────────────
app.get('/api/public/milestones', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, year, title, description, icon_name, sort_order FROM milestones ORDER BY sort_order ASC, id ASC'
    );
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Milestones CRUD ────────────────────────────────────────────────────
app.get('/api/admin/milestones', requireAuth, async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM milestones ORDER BY sort_order ASC, id ASC');
    res.json({ data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/milestones', requireAuth, async (req, res) => {
  const { year, title, description, icon_name, sort_order } = req.body || {};
  if (!year || !title) return res.status(400).json({ error: 'year and title required' });
  try {
    const { rows } = await db.query(
      `INSERT INTO milestones (year, title, description, icon_name, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [year, title, description || '', icon_name || 'Star', sort_order ?? 0]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/milestones/:id', requireAuth, async (req, res) => {
  const { year, title, description, icon_name, sort_order } = req.body || {};
  if (!year || !title) return res.status(400).json({ error: 'year and title required' });
  try {
    const { rows } = await db.query(
      `UPDATE milestones SET year=$1, title=$2, description=$3, icon_name=$4, sort_order=$5 WHERE id=$6 RETURNING *`,
      [year, title, description || '', icon_name || 'Star', sort_order ?? 0, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not found' });
    res.json({ data: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/milestones/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM milestones WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Public: Founder profile ───────────────────────────────────────────────────
app.get('/api/public/founder', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT name, title, bio, photo_url FROM founder_profile ORDER BY id LIMIT 1'
    );
    res.json({ data: rows[0] || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: Founder profile ────────────────────────────────────────────────────
app.get('/api/admin/founder', requireAuth, async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM founder_profile ORDER BY id LIMIT 1');
    res.json({ data: rows[0] || null });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/founder', requireAuth, async (req, res) => {
  const { name, title, bio, photo_url } = req.body || {};
  try {
    const existing = await db.query('SELECT id FROM founder_profile LIMIT 1');
    if (existing.rows.length) {
      const { rows } = await db.query(
        `UPDATE founder_profile SET name=$1, title=$2, bio=$3, photo_url=$4, updated_at=NOW() WHERE id=$5 RETURNING *`,
        [name || '', title || '', bio || '', photo_url || '', existing.rows[0].id]
      );
      res.json({ data: rows[0] });
    } else {
      const { rows } = await db.query(
        `INSERT INTO founder_profile (name, title, bio, photo_url) VALUES ($1,$2,$3,$4) RETURNING *`,
        [name || '', title || '', bio || '', photo_url || '']
      );
      res.status(201).json({ data: rows[0] });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Dev: Email management ─────────────────────────────────────────────────────
app.use('/api/dev/email', requireDev, emailRoutes);
app.use('/api/admin/email', requireAuth, emailRoutes);

// ── Dev: System info ──────────────────────────────────────────────────────────
app.get('/api/dev/system', requireDev, (_req, res) => {
  const mem = process.memoryUsage();
  const secrets = [
    'DATABASE_URL', 'SESSION_SECRET', 'RESEND_API_KEY',
    'NOREPLY_EMAIL', 'INFO_EMAIL', 'INFO_EMAIL_PASSWORD',
    'DEVELOPER_EMAIL', 'DEVELOPER_EMAIL_PASSWORD',
    'SALES_EMAIL', 'SALES_EMAIL_PASSWORD',
    'SUPPORT_EMAIL', 'SUPPORT_EMAIL_PASSWORD',
    'INVOICE_EMAIL', 'INVOICE_EMAIL_PASSWORD',
    'ADMIN_EMAIL', 'ADMIN_EMAIL_PASSWORD',
    'ALLOWED_ORIGINS',
    // Note: VITE_API_URL is a Cloudflare Pages frontend variable — not present on the backend
  ];
  res.json({
    uptime: process.uptime(),
    nodeVersion: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV || 'development',
    memoryUsed: mem.heapUsed,
    memoryTotal: mem.heapTotal,
    dbConnected: true,
    configuredSecrets: Object.fromEntries(secrets.map(k => [k, !!process.env[k]])),
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────

// Exported for reuse (Next.js API bridge and the production entry point).
module.exports = app;
