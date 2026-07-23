const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const emailRoutes = require('./routes/email');

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

db.connect()
  .then(() => {
    console.log('Connected to Neon PostgreSQL');
    return initTestimonialsTable();
  })
  .then(() => initSiteSettingsTable())
  .then(() => initStoreTable())
  .then(() => initMilestonesTable())
  .then(() => initFounderTable())
  .then(() => initProjectsTable())
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
      ('Emeka Okonkwo',   'Factory Manager',        'PrecisionPack Industries, Aba',    'IZY Technologies transformed our factory''s electrical system. The industrial wiring and CCTV installation was completed on time and within budget. Our energy costs dropped by 60% after they added the solar component. Absolutely world-class service.',  5, 'EO', '60% energy cost reduction',  1),
      ('Dr. Amara Nwosu', 'Hospital Administrator', 'Grace Medical Centre, Abuja',      'The electrical overhaul they carried out for our hospital was exceptional. Every detail was thought through — backup systems, UPS integration, clean installation. We''ve had zero power issues since the upgrade. Highly recommend.',                   5, 'AN', 'Zero downtime since upgrade', 2),
      ('Chidi Adeyemi',   'Property Developer',     'Lekki Luxury Estates',             'We contracted IZY Technologies for smart home automation across 20 luxury units. The results exceeded client expectations — from lighting scenes to integrated security, everything just works. Our buyers love it.',                                     5, 'CA', '20 luxury units automated',  3),
      ('Mrs. Funke Bello','School Principal',       'Sunshine Academy, Port Harcourt',  'The solar installation has been a game changer for our school. We used to lose 4-5 hours daily to NEPA issues. Now we run all day on solar. The team was professional, fast and very tidy in their work.',                                            5, 'FB', 'Full-day solar independence', 4),
      ('Tunde Afolabi',   'CEO',                    'Meridian Hotels, Victoria Island', 'Our hotel security was a headache before IZY took over. After their complete CCTV and access control overhaul, we can monitor the entire property from one screen, on our phones, anywhere. Outstanding work.',                                           5, 'TA', 'Full property remote access', 5)
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

// ── Admin: Store image upload → Cloudflare Images ────────────────────────────
// The backend only creates a short-lived upload URL. Image bytes go directly
// from the admin browser to Cloudflare, so Railway never stores the file.
app.post('/api/admin/store/images/direct-upload', requireAuth, async (_req, res) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken  = process.env.CLOUDFLARE_API_TOKEN;
  const imagesHash = process.env.CLOUDFLARE_IMAGE_HASH || process.env.CLOUDFLARE_IMAGES_HASH;
  if (!accountId || !apiToken || !imagesHash)
    return res.status(500).json({ error: 'Cloudflare credentials not configured on server' });

  try {
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiToken}` },
      }
    );
    const data = await cfRes.json();
    if (!data.success)
      return res.status(502).json({ error: data.errors?.[0]?.message || 'Cloudflare upload failed' });

    const imageId = data.result?.id;
    const uploadURL = data.result?.uploadURL;
    if (!imageId || !uploadURL) {
      return res.status(502).json({ error: 'Cloudflare did not return an upload URL' });
    }
    res.json({
      uploadURL,
      url: `https://imagedelivery.net/${imagesHash}/${imageId}/public`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

  const INFO_EMAIL = process.env.INFO_EMAIL;
  const INFO_PASS  = process.env.INFO_EMAIL_PASSWORD;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASS  = process.env.ADMIN_EMAIL_PASSWORD;

  let role = null;
  if (email === INFO_EMAIL && password === INFO_PASS)   role = 'developer';
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
  const { name, email, message, subject } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message required' });
  try {
    await db.query(
      'INSERT INTO contact_submissions (name, email, subject, message, created_at) VALUES ($1,$2,$3,$4,NOW())',
      [name, email, subject || null, message]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
      ['2022',      '500+ Installations Milestone', 'Celebrated 500 successful installations across residential and commercial clients — a milestone affirming our reputation for excellence and reliability.',                                                                                                     'TrendingUp', 5],
      ['2023',      'Industry Recognition',         'Surpassed 1,000 installations and received industry recognition for innovation and outstanding contribution to Nigeria\'s renewable energy sector.',                                                                                                            'Award',      6],
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
        'Israel Ideozu founded IZY Technologies Global Services Limited on March 8, 2018, driven by a conviction that quality solar energy and technology solutions should be within reach for every Nigerian. Under his leadership, the company has grown from a small team of solar enthusiasts into a trusted name across the country, completing thousands of installations and earning recognition for innovation in Nigeria\'s renewable energy sector. His commitment to excellence, community impact, and a cleaner future continues to shape every project IZY undertakes.',
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

  await db.query('CREATE INDEX IF NOT EXISTS projects_category_idx ON projects (category)');
  await db.query('CREATE INDEX IF NOT EXISTS projects_published_order_idx ON projects (published, sort_order, id)');

  const { rows } = await db.query('SELECT COUNT(*)::int AS n FROM projects');
  if (rows[0].n === 0) {
    const seed = [
      ['150kW Commercial Solar Farm', '150kw-commercial-solar-farm', 'Solar Energy', 'Trans Amadi, Port Harcourt', '2024', 'Full design and installation of a 150kW grid-tie solar system for a manufacturing facility.', 'Full design and installation of a 150kW grid-tie solar system for a manufacturing facility, reducing their electricity bill by 78%. Project included 300 panels, 4 industrial inverters and a 200kWh battery bank.', '78% bill reduction', ['Solar design', 'Solar installation', 'Battery storage'], ['/site-images/project-commercial-solar.jpg']],
      ['Smart Villa Automation', 'smart-villa-automation', 'Smart Home', 'GRA Phase 2, Port Harcourt', '2024', 'Complete smart home integration for a 5-bedroom villa.', 'Complete smart home integration for a 5-bedroom villa including lighting, HVAC control, entertainment and security. All systems integrated into a single app interface.', 'Full home integration', ['Smart home automation', 'Lighting control', 'Security integration'], ['/site-images/project-smart-home.jpg']],
      ['Factory CCTV & Access Control', 'factory-cctv-access-control', 'Security', 'Aba, Abia State', '2023', '96-camera CCTV network with biometric access control for a 20-acre industrial facility.', '96-camera CCTV network with biometric access control for a 20-acre industrial facility. Full remote monitoring capability with 30-day storage and licence plate recognition.', '96 cameras deployed', ['CCTV installation', 'Access control', 'Remote monitoring'], ['/site-images/project-industrial.jpg']],
      ['Hospital Electrical Overhaul', 'hospital-electrical-overhaul', 'Industrial Wiring', 'Abuja, FCT', '2023', 'Complete electrical infrastructure upgrade for a 200-bed hospital.', 'Complete electrical infrastructure upgrade for a 200-bed hospital including UPS systems, distribution boards, transfer switches and emergency backup. Zero downtime since completion.', 'Zero downtime post-install', ['Electrical design', 'UPS systems', 'Emergency backup'], ['/site-images/project-power-unit.jpg']],
      ['School Solar + IT Upgrade', 'school-solar-it-upgrade', 'Solar + IT', 'Port Harcourt, Rivers', '2022', 'Off-grid solar installation and complete IT infrastructure upgrade for a private school.', 'Off-grid solar installation and complete IT infrastructure upgrade for a private school. Powers 40 classrooms, computer labs and administrative block around the clock.', '40 classrooms powered', ['Off-grid solar', 'IT infrastructure', 'Power backup'], ['/site-images/project-residential-solar.jpg']],
      ['Hotel Smart Security Suite', 'hotel-smart-security-suite', 'Security', 'Peter Odili Road, Port Harcourt', '2022', 'Luxury hotel security overhaul with smart locks, CCTV cameras and perimeter sensors.', 'Luxury hotel security overhaul with smart locks, 128 CCTV cameras, perimeter sensors and centralised monitoring. Complete visibility from a single dashboard, on any device.', 'Full remote access', ['CCTV installation', 'Smart locks', 'Perimeter security'], ['/site-images/project-site-team.jpg']],
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
  const title = cleanText(body.title);
  const category = cleanText(body.category);
  const images = cleanTextArray(body.images);
  const sortOrder = Number.isFinite(Number(body.sort_order)) ? Math.trunc(Number(body.sort_order)) : 0;
  return {
    title,
    slug: slugify(body.slug || title),
    category,
    location: cleanText(body.location),
    year: cleanText(body.year),
    short_description: cleanText(body.short_description),
    full_description: cleanText(body.full_description),
    result_metric: cleanText(body.result_metric),
    services: cleanTextArray(body.services),
    images,
    main_image_url: cleanText(body.main_image_url) || images[0] || '',
    featured: body.featured === true,
    sort_order: sortOrder,
    published: body.published === true,
  };
}

function validateProject(project) {
  if (!project.title) return 'Project title is required';
  if (!project.category) return 'Project category is required';
  if (!project.slug) return 'A valid project slug is required';
  if (project.title.length > 200) return 'Project title must be 200 characters or fewer';
  if (project.slug.length > 120) return 'Project slug must be 120 characters or fewer';
  if (project.category.length > 100) return 'Project category must be 100 characters or fewer';
  if (project.year.length > 20) return 'Project year must be 20 characters or fewer';
  return null;
}

const PROJECT_FIELDS = `id, title, slug, category, location, year, short_description,
  full_description, result_metric, services, images, main_image_url, featured,
  sort_order, published, created_at, updated_at`;

// ── Projects: public ──────────────────────────────────────────────────────────
app.get('/api/projects', async (req, res) => {
  const category = cleanText(req.query.category);
  try {
    const params = [];
    let where = 'WHERE published = TRUE';
    if (category && category.toLowerCase() !== 'all') {
      params.push(category);
      where += ` AND LOWER(category) = LOWER($${params.length})`;
    }
    const { rows } = await db.query(
      `SELECT ${PROJECT_FIELDS} FROM projects ${where} ORDER BY featured DESC, sort_order ASC, id ASC`,
      params
    );
    const categoryResult = await db.query(
      'SELECT DISTINCT category FROM projects WHERE published = TRUE ORDER BY category ASC'
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
    filters.push(`LOWER(category) = LOWER($${params.length})`);
  }
  try {
    const { rows } = await db.query(
      `SELECT ${PROJECT_FIELDS} FROM projects
       ${filters.length ? `WHERE ${filters.join(' AND ')}` : ''}
       ORDER BY sort_order ASC, id ASC`,
      params
    );
    const categoryResult = await db.query(
      'SELECT DISTINCT category FROM projects ORDER BY category ASC'
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
        (title, slug, category, location, year, short_description, full_description,
         result_metric, services, images, main_image_url, featured, sort_order, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING ${PROJECT_FIELDS}`,
      [
        project.title, project.slug, project.category, project.location, project.year,
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
        title=$1, slug=$2, category=$3, location=$4, year=$5, short_description=$6,
        full_description=$7, result_metric=$8, services=$9, images=$10, main_image_url=$11,
        featured=$12, sort_order=$13, published=$14, updated_at=NOW()
       WHERE id=$15
       RETURNING ${PROJECT_FIELDS}`,
      [
        project.title, project.slug, project.category, project.location, project.year,
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

app.post('/api/admin/projects/images/direct-upload', requireAuth, async (_req, res) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const imagesHash = process.env.CLOUDFLARE_IMAGE_HASH || process.env.CLOUDFLARE_IMAGES_HASH;
  if (!accountId || !apiToken || !imagesHash) {
    return res.status(500).json({ error: 'Cloudflare credentials not configured on server' });
  }
  try {
    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      { method: 'POST', headers: { Authorization: `Bearer ${apiToken}` } }
    );
    const data = await cfRes.json();
    if (!data.success) return res.status(502).json({ error: data.errors?.[0]?.message || 'Cloudflare upload failed' });
    const imageId = data.result?.id;
    const uploadURL = data.result?.uploadURL;
    if (!imageId || !uploadURL) return res.status(502).json({ error: 'Cloudflare did not return an upload URL' });
    res.json({ uploadURL, url: `https://imagedelivery.net/${imagesHash}/${imageId}/public` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
app.use('/api/dev/email', requireAuth, emailRoutes);

// ── Dev: System info ──────────────────────────────────────────────────────────
app.get('/api/dev/system', requireDev, (_req, res) => {
  const mem = process.memoryUsage();
  const secrets = [
    'DATABASE_URL', 'SESSION_SECRET', 'RESEND_API_KEY',
    'NOREPLY_EMAIL', 'INFO_EMAIL', 'INFO_EMAIL_PASSWORD',
    'SALES_EMAIL', 'SALES_EMAIL_PASSWORD',
    'SUPPORT_EMAIL', 'SUPPORT_EMAIL_PASSWORD',
    'CAREERS_EMAIL', 'CAREERS_EMAIL_PASSWORD',
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
app.listen(PORT, () => {
  console.log(`IZY Tech API running on port ${PORT}`);
});
