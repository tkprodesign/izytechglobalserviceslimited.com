const express = require('express');
const { sendResendEmail } = require('./lib/resend');
const { invoiceEmail } = require('./lib/emailTemplate');
const { generateInvoicePdf } = require('./lib/invoicePdf');

// ── Invoices ────────────────────────────────────────────────────────────────

async function initInvoicesTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id              SERIAL PRIMARY KEY,
      invoice_number  TEXT NOT NULL UNIQUE,
      customer_name   TEXT NOT NULL,
      customer_email  TEXT NOT NULL,
      customer_phone  TEXT NOT NULL DEFAULT '',
      customer_address TEXT NOT NULL DEFAULT '',
      line_items      JSONB NOT NULL DEFAULT '[]',
      subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
      tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 7.50,
      tax_label       TEXT NOT NULL DEFAULT 'VAT (7.5%)',
      tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
      discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
      total           NUMERIC(12,2) NOT NULL DEFAULT 0,
      notes           TEXT NOT NULL DEFAULT '',
      status          TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled')),
      due_date        DATE,
      paid_date       TIMESTAMPTZ,
      created_by      TEXT NOT NULL DEFAULT '',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log('Invoices table ready');
}

function generateInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return 'IZY-' + year + month + '-' + rand;
}

function parseRate(tax_rate) {
  const n = Number(tax_rate);
  return Number.isFinite(n) ? n : 7.5;
}

/**
 * Emails an invoice to the customer address on the invoice.
 * The email body IS the invoice (branded template) and a PDF copy is attached.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
async function sendInvoiceEmail(inv) {
  const pdfBuffer = await generateInvoicePdf(inv);
  const html = invoiceEmail({ invoice: inv });
  const naira = n => '\u20A6' + (Number(n) || 0).toLocaleString('en-NG');

  await sendResendEmail({
    from: process.env.INFO_EMAIL || 'info@izytechglobalservices.com',
    to: inv.customer_email,
    subject: `Invoice ${inv.invoice_number} from Izy Tech Services${inv.status === 'paid' ? ' \u2014 Paid' : ''}`,
    html,
    text: `Invoice ${inv.invoice_number}\nBill to: ${inv.customer_name}\nTotal: ${naira(inv.total)} (${inv.status === 'paid' ? 'PAID' : 'UNPAID'})\n\nThe full invoice is attached as a PDF. Questions? Call +234 810 126 2814 or reply to this email.`,
    attachments: [
      {
        filename: `${inv.invoice_number}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
  return { ok: true };
}

function createInvoiceRouter({ db, requireAuth }) {
  const router = express.Router();

// ── Admin: Invoices CRUD ────────────────────────────────────────────────────

router.get('/api/admin/invoices', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM invoices ORDER BY created_at DESC');
    res.json({ data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/admin/invoices/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ data: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/api/admin/invoices', requireAuth, async (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_address, line_items, tax_rate, tax_label, discount, notes, due_date, status } = req.body || {};
  if (!customer_name || !customer_email) return res.status(400).json({ error: 'Customer name and email are required' });
  if (!line_items || !line_items.length) return res.status(400).json({ error: 'At least one line item is required' });

  const items = line_items.map(item => ({
    description: item.description || '',
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
    amount: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const rate = parseRate(tax_rate);
  const taxAmt = Math.round(subtotal * rate) / 100;
  const disc = Number(discount) || 0;
  const total = subtotal + taxAmt - disc;
  const invoice_number = generateInvoiceNumber();
  const user = req.user;

  try {
    const { rows } = await db.query(
      'INSERT INTO invoices (invoice_number, customer_name, customer_email, customer_phone, customer_address, line_items, subtotal, tax_rate, tax_label, tax_amount, discount, total, notes, status, due_date, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *',
      [invoice_number, customer_name, customer_email, customer_phone || '', customer_address || '', JSON.stringify(items), subtotal, rate, tax_label || 'VAT (7.5%)', taxAmt, disc, total, notes || '', status || 'unpaid', due_date || null, user.email || user.role || 'admin']
    );
    const inv = rows[0];

    // Auto-send invoice email (with PDF attached) to the customer on creation.
    let emailResult = { ok: false, error: 'not attempted' };
    try {
      emailResult = await sendInvoiceEmail(inv);
    } catch (emailErr) {
      console.error('Invoice email error:', emailErr.message);
      emailResult = { ok: false, error: emailErr.message };
    }

    res.status(201).json({
      data: inv,
      email_sent: emailResult.ok,
      email_error: emailResult.ok ? null : (emailResult.error || 'Email could not be sent'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/admin/invoices/:id', requireAuth, async (req, res) => {
  const { customer_name, customer_email, customer_phone, customer_address, line_items, tax_rate, tax_label, discount, notes, due_date, status } = req.body || {};
  const items = (line_items || []).map(item => ({
    description: item.description || '',
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
    amount: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
  }));
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const rate = parseRate(tax_rate);
  const taxAmt = Math.round(subtotal * rate) / 100;
  const disc = Number(discount) || 0;
  const total = subtotal + taxAmt - disc;

  try {
    const { rows } = await db.query(
      'UPDATE invoices SET customer_name=$1, customer_email=$2, customer_phone=$3, customer_address=$4, line_items=$5, subtotal=$6, tax_rate=$7, tax_label=$8, tax_amount=$9, discount=$10, total=$11, notes=$12, status=$13, due_date=$14, paid_date=CASE WHEN $13=\'paid\' AND paid_date IS NULL THEN NOW() ELSE paid_date END, updated_at=NOW() WHERE id=$15 RETURNING *',
      [customer_name, customer_email, customer_phone || '', customer_address || '', JSON.stringify(items), subtotal, rate, tax_label || 'VAT (7.5%)', taxAmt, disc, total, notes || '', status || 'unpaid', due_date || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    const inv = rows[0];

    // Auto-send the updated invoice to the customer address on every update.
    let emailResult = { ok: false, error: 'not attempted' };
    try {
      emailResult = await sendInvoiceEmail(inv);
    } catch (emailErr) {
      console.error('Invoice email error:', emailErr.message);
      emailResult = { ok: false, error: emailErr.message };
    }

    res.json({
      data: inv,
      email_sent: emailResult.ok,
      email_error: emailResult.ok ? null : (emailResult.error || 'Email could not be sent'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/api/admin/invoices/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('DELETE FROM invoices WHERE id=$1 RETURNING id, invoice_number', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ success: true, deleted: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: Re-send invoice email on demand ─────────────────────────────────

router.post('/api/admin/invoices/:id/send', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    await sendInvoiceEmail(rows[0]);
    res.json({ success: true, message: 'Invoice emailed to ' + rows[0].customer_email });
  } catch (err) {
    console.error('Invoice email error:', err.message);
    res.status(500).json({ error: 'Invoice saved but email could not be sent: ' + err.message });
  }
});

  return router;
}

module.exports = { initInvoicesTable, createInvoiceRouter };
