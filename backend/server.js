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
    const seed = [
      ['400W Monocrystalline Solar Panel',  'Solar',     'Solar',     'per panel', 'High-efficiency mono panel with 25-year performance warranty. Ideal for residential and commercial rooftop installations.',   'BESTSELLER', 5, 48, true,  true,  1],
      ['550W Bifacial Solar Panel',          'Solar',     'Solar',     'per panel', 'Dual-sided bifacial cell technology captures reflected light for up to 30% more energy output.',                             null,         5, 21, true,  false, 2],
      ['5kVA Hybrid Solar Inverter',         'Inverters', 'Inverters', 'per unit',  'All-in-one hybrid inverter with built-in MPPT charge controller. Supports grid-tie, off-grid and battery backup modes.',     'SALE',       5, 33, true,  true,  3],
      ['10kVA Three-Phase Inverter',         'Inverters', 'Inverters', 'per unit',  'Industrial-grade three-phase inverter for factories, hospitals and commercial buildings with 24/7 critical loads.',           null,         4, 12, true,  false, 4],
      ['200Ah Lithium LiFePO4 Battery',      'Batteries', 'Batteries', 'per unit',  'Lithium iron phosphate battery with 6,000+ cycle life. Lightweight, safe and virtually maintenance-free.',                   'NEW',        5, 19, true,  true,  5],
      ['100Ah AGM Deep Cycle Battery',       'Batteries', 'Batteries', 'per unit',  'Sealed AGM deep cycle battery, ideal for solar backup systems. Spill-proof, vibration-resistant and reliable.',              null,         4, 37, true,  false, 6],
      ['4-Channel 4K CCTV Kit',              'Security',  'Security',  'per kit',   'Complete kit with 4× 4K outdoor cameras, 4-channel NVR, 1TB HDD and all cables. Night vision up to 30m.',                   'POPULAR',    5, 55, true,  true,  7],
      ['Smart Wi-Fi Video Doorbell',         'Security',  'Security',  'per unit',  '1080p HD doorbell with two-way audio, motion alerts and cloud recording. Works with any smartphone.',                        null,         4, 26, true,  false, 8],
      ['Smart Home Starter Pack',            'Smart Home','Smart Home','per pack',  '4 smart switches + Zigbee hub + app control. Turn any home smart — works with Alexa, Google Home and Apple HomeKit.',        'NEW',        5, 14, true,  true,  9],
      ['50W Smart LED Flood Light',          'Smart Home','Smart Home','per unit',  'App-controlled outdoor flood light with colour temperature adjustment, scheduling and motion trigger.',                        null,         4,  8, false, false, 10],
      ['6-Outlet Surge Protector Strip',     'Electrical','Electrical','per unit',  'Heavy-duty surge protector with 6 outlets, 2 USB ports and 2500 joule protection rating. 3-metre cable.',                   null,         4, 62, true,  false, 11],
      ['63A Automatic Transfer Switch',      'Electrical','Electrical','per unit',  'Automatic changeover switch that seamlessly transfers between mains and generator power. Suitable for homes and offices.',    null,         5, 29, true,  true,  12],
    ];
    for (const [name, category, tag, unit, description, badge, rating, reviews, in_stock, featured, sort_order] of seed) {
      await db.query(
        `INSERT INTO store_products (name,category,tag,unit,description,badge,rating,reviews,in_stock,featured,sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [name, category, tag, unit, description, badge, rating, reviews, in_stock, featured, sort_order]
      );
    }
    console.log('Store products seeded with 12 initial products');
  }
}

// ── Store: Products (public) ───────────────────────────────────────────────────
app.get('/api/store/products', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id,name,category,tag,unit,description,badge,rating,reviews,in_stock,featured FROM store_products ORDER BY sort_order ASC, id ASC'
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
  const { name, category, tag, unit, description, badge, rating, reviews, in_stock, featured } = req.body || {};
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  try {
    const { rows } = await db.query(
      `INSERT INTO store_products (name,category,tag,unit,description,badge,rating,reviews,in_stock,featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, category, tag || category, unit || 'per unit', description || '', badge || null,
       rating ?? 5, reviews ?? 0, in_stock !== false, featured === true]
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/store/products/:id', requireAuth, async (req, res) => {
  const { name, category, tag, unit, description, badge, rating, reviews, in_stock, featured } = req.body || {};
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  try {
    const { rows } = await db.query(
      `UPDATE store_products SET name=$1,category=$2,tag=$3,unit=$4,description=$5,badge=$6,
       rating=$7,reviews=$8,in_stock=$9,featured=$10 WHERE id=$11 RETURNING *`,
      [name, category, tag || category, unit || 'per unit', description || '', badge || null,
       rating ?? 5, reviews ?? 0, in_stock !== false, featured === true, req.params.id]
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

// ── Dev: Email management ─────────────────────────────────────────────────────
app.use('/api/dev/email', requireDev, emailRoutes);

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
