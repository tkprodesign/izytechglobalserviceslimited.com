const express = require('express');

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
  const rate = Number(tax_rate) ?? 7.5;
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
    res.status(201).json({ data: rows[0] });
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
  const rate = Number(tax_rate) ?? 7.5;
  const taxAmt = Math.round(subtotal * rate) / 100;
  const disc = Number(discount) || 0;
  const total = subtotal + taxAmt - disc;

  try {
    const { rows } = await db.query(
      'UPDATE invoices SET customer_name=$1, customer_email=$2, customer_phone=$3, customer_address=$4, line_items=$5, subtotal=$6, tax_rate=$7, tax_label=$8, tax_amount=$9, discount=$10, total=$11, notes=$12, status=$13, due_date=$14, paid_date=CASE WHEN $13=\'paid\' AND paid_date IS NULL THEN NOW() ELSE paid_date END, updated_at=NOW() WHERE id=$15 RETURNING *',
      [customer_name, customer_email, customer_phone || '', customer_address || '', JSON.stringify(items), subtotal, rate, tax_label || 'VAT (7.5%)', taxAmt, disc, total, notes || '', status || 'unpaid', due_date || null, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ data: rows[0] });
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

// ── Admin: Send invoice email ───────────────────────────────────────────────

router.post('/api/admin/invoices/:id/send', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    const inv = rows[0];
    const { customEmail } = require('./lib/emailTemplate');

    const itemsHtml = inv.line_items.map(item =>
      '<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#334155">' + item.description + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;color:#64748b">' + item.quantity + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;color:#64748b">&#8358;' + Number(item.unit_price).toLocaleString('en-NG', { minimumFractionDigits: 2 }) + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;color:#0f172a">&#8358;' + Number(item.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 }) + '</td></tr>'
    ).join('');

    const emailHtml = '<div style="font-family:Inter,system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f8fafc">' +
      '<div style="background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.06)">' +
      '<div style="text-align:center;margin-bottom:24px"><h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0">Izy Tech Services</h1><p style="font-size:12px;color:#94a3b8;margin:4px 0 0">Technology and Energy Solutions</p></div>' +
      '<div style="background:#2563eb;color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:24px"><h2 style="margin:0;font-size:16px;font-weight:600">Invoice ' + inv.invoice_number + '</h2><p style="margin:4px 0 0;font-size:13px;opacity:0.9">Status: ' + (inv.status === 'paid' ? 'Paid' : 'Unpaid') + '</p></div>' +
      '<div style="margin-bottom:24px;font-size:13px"><p style="color:#94a3b8;margin:0 0 4px;font-size:11px;text-transform:uppercase;font-weight:600">Bill To</p><p style="color:#0f172a;margin:0;font-weight:600">' + inv.customer_name + '</p><p style="color:#64748b;margin:2px 0 0">' + inv.customer_email + '</p>' + (inv.customer_phone ? '<p style="color:#64748b;margin:2px 0 0">' + inv.customer_phone + '</p>' : '') + (inv.customer_address ? '<p style="color:#64748b;margin:2px 0 0">' + inv.customer_address + '</p>' : '') + '</div>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px"><thead><tr style="background:#f1f5f9"><th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Description</th><th style="padding:8px 12px;text-align:center;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Qty</th><th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Unit Price</th><th style="padding:8px 12px;text-align:right;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:600">Amount</th></tr></thead><tbody>' + itemsHtml + '</tbody></table>' +
      '<div style="text-align:right;margin-bottom:24px"><p style="margin:4px 0;font-size:13px;color:#64748b">Subtotal: &#8358;' + Number(inv.subtotal).toLocaleString('en-NG', { minimumFractionDigits: 2 }) + '</p><p style="margin:4px 0;font-size:13px;color:#64748b">' + inv.tax_label + ': &#8358;' + Number(inv.tax_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 }) + '</p>' + (Number(inv.discount) > 0 ? '<p style="margin:4px 0;font-size:13px;color:#dc2626">Discount: -&#8358;' + Number(inv.discount).toLocaleString('en-NG', { minimumFractionDigits: 2 }) + '</p>' : '') + '<p style="margin:8px 0 0;font-size:18px;font-weight:700;color:#0f172a;border-top:2px solid #e2e8f0;padding-top:8px">Total: &#8358;' + Number(inv.total).toLocaleString('en-NG', { minimumFractionDigits: 2 }) + '</p></div>' +
      (inv.notes ? '<div style="background:#f8fafc;padding:12px 16px;border-radius:8px;margin-bottom:20px"><p style="font-size:12px;color:#64748b;margin:0"><strong>Note:</strong> ' + inv.notes + '</p></div>' : '') +
      '<div style="text-align:center;padding-top:16px;border-top:1px solid #e2e8f0"><p style="font-size:11px;color:#94a3b8;margin:0">Izy Technologies Global Services Limited</p><p style="font-size:11px;color:#94a3b8;margin:2px 0 0">+234 810 126 2814 | info@izytechglobalservices.com</p></div>' +
      '</div></div>';

    try {
      await customEmail({
        from: process.env.INFO_EMAIL || 'info@izytechglobalservices.com',
        to: inv.customer_email,
        subject: 'Invoice ' + inv.invoice_number + ' - Izy Tech Services',
        html: emailHtml,
        text: 'Invoice ' + inv.invoice_number + ' | Total: N' + Number(inv.total).toLocaleString('en-NG') + ' | Please find details in the attached invoice.',
      });
    } catch (emailErr) {
      console.error('Invoice email error:', emailErr.message);
      return res.status(500).json({ error: 'Invoice saved but email could not be sent: ' + emailErr.message });
    }

    res.json({ success: true, message: 'Invoice sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
  });

  return router;
}

module.exports = { initInvoicesTable, createInvoiceRouter };
