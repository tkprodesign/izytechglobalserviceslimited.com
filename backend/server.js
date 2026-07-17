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
