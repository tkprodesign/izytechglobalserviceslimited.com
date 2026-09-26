const express = require('express');
const { sendResendEmail } = require('./lib/resend');
const { invoiceEmail } = require('./lib/emailTemplate');
const { generateInvoicePdf } = require('./lib/invoicePdf');
const { generateAltBankLetterPdf } = require('./lib/altBankLetterPdf');

// ── Invoices ────────────────────────────────────────────────────────────────

const DEFAULT_INVOICE_TITLE = 'Invoice';
const DEFAULT_BANK_ACCOUNT_NAME = 'Izy Technologies Global Services Limited';
const DEFAULT_BANK_ACCOUNT_NUMBER = '0512121038';
const DEFAULT_BANK_NAME = 'Alternative Bank';

async function initInvoicesTable(db) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id              SERIAL PRIMARY KEY,
      invoice_number  TEXT NOT NULL UNIQUE,
      title           TEXT NOT NULL DEFAULT 'Invoice',
      customer_name   TEXT NOT NULL,
      customer_email  TEXT NOT NULL,
      customer_phone  TEXT NOT NULL DEFAULT '',
      customer_address TEXT NOT NULL DEFAULT '',
      line_items      JSONB NOT NULL DEFAULT '[]',
      sections        JSONB NOT NULL DEFAULT '[]',
      subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
      logistics       NUMERIC(12,2) NOT NULL DEFAULT 0,
      service_charge  NUMERIC(12,2) NOT NULL DEFAULT 0,
      tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 7.50,
      tax_label       TEXT NOT NULL DEFAULT 'VAT (7.5%)',
      tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
      discount        NUMERIC(12,2) NOT NULL DEFAULT 0,
      total           NUMERIC(12,2) NOT NULL DEFAULT 0,
      notes           TEXT NOT NULL DEFAULT '',
      status          TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled')),
      due_date        DATE,
      paid_date       TIMESTAMPTZ,
      bank_account_name   TEXT NOT NULL DEFAULT 'Izy Technologies Global Services Limited',
      bank_account_number TEXT NOT NULL DEFAULT '0512121038',
      bank_name           TEXT NOT NULL DEFAULT 'Alternative Bank',
      created_by      TEXT NOT NULL DEFAULT '',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await db.query(`
    ALTER TABLE invoices
      ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Invoice',
      ADD COLUMN IF NOT EXISTS logistics NUMERIC(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS service_charge NUMERIC(12,2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS bank_account_name TEXT NOT NULL DEFAULT 'Izy Technologies Global Services Limited',
      ADD COLUMN IF NOT EXISTS bank_account_number TEXT NOT NULL DEFAULT '0512121038',
      ADD COLUMN IF NOT EXISTS bank_name TEXT NOT NULL DEFAULT 'Alternative Bank',
      ADD COLUMN IF NOT EXISTS sections JSONB NOT NULL DEFAULT '[]'
  `);
  await db.query(`
    UPDATE invoices
    SET
      sections = COALESCE(sections, '[]')::jsonb
    WHERE sections IS NULL OR BTRIM(sections::text) = '' OR sections = '[]'
  `);
  await db.query(`
    UPDATE invoices
    SET
      title = COALESCE(NULLIF(BTRIM(title), ''), 'Invoice'),
      logistics = COALESCE(logistics, 0),
      service_charge = COALESCE(service_charge, 0),
      bank_account_name = COALESCE(NULLIF(BTRIM(bank_account_name), ''), 'Izy Technologies Global Services Limited'),
      bank_account_number = COALESCE(NULLIF(BTRIM(bank_account_number), ''), '0512121038'),
      bank_name = COALESCE(NULLIF(BTRIM(bank_name), ''), 'Alternative Bank')
    WHERE title IS NULL
       OR BTRIM(title) = ''
       OR logistics IS NULL
       OR service_charge IS NULL
       OR bank_account_name IS NULL
       OR BTRIM(bank_account_name) = ''
       OR bank_account_number IS NULL
       OR BTRIM(bank_account_number) = ''
       OR bank_name IS NULL
       OR BTRIM(bank_name) = ''
  `);
  await db.query(`
    ALTER TABLE invoices
      ALTER COLUMN title SET DEFAULT 'Invoice',
      ALTER COLUMN title SET NOT NULL,
      ALTER COLUMN logistics SET DEFAULT 0,
      ALTER COLUMN logistics SET NOT NULL,
      ALTER COLUMN service_charge SET DEFAULT 0,
      ALTER COLUMN service_charge SET NOT NULL,
      ALTER COLUMN bank_account_name SET DEFAULT 'Izy Technologies Global Services Limited',
      ALTER COLUMN bank_account_name SET NOT NULL,
      ALTER COLUMN bank_account_number SET DEFAULT '0512121038',
      ALTER COLUMN bank_account_number SET NOT NULL,
      ALTER COLUMN bank_name SET DEFAULT 'Alternative Bank',
      ALTER COLUMN bank_name SET NOT NULL
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
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 7.5;
}

function parseMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

/**
 * Normalize the dual-format input (`line_items` + `sections`) into the
 * flat array the PDF/email renderers and the `line_items` JSONB column already
 * expect, so both editors always produce the same persisted totals.
 */
function flattenToLineItems(sections) {
  const items = [];
  for (const section of Array.isArray(sections) ? sections : []) {
    if (section && typeof section === 'object' && Array.isArray(section.rows)) {
      for (const row of section.rows) {
        if (typeof row === 'string') {
          // JSON-stringified row from the client (e.g. `[{"description":"..."}]`).
          try { items.push(...JSON.parse(row)); } catch { /* fall through */ }
        } else if (row && typeof row === 'object') {
          items.push({
            description: String(row.description || '').trim(),
            quantity: Number(row.quantity) || 1,
            unit_price: Number(row.unit_price) || 0,
            amount: Number(row.amount) || 0,
          });
        }
      }
    } else if (typeof section === 'string') {
      try { items.push(...JSON.parse(section)); } catch { /* fall through */ }
    }
  }
  return items;
}

function parseRate(tax_rate) {
/**
 * Emails an invoice to the customer address on the invoice.
 * The email body IS the invoice (branded template) and a PDF copy is attached.
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
async function sendInvoiceEmail(inv) {
  const recipientEmail = String(inv.customer_email || '').trim();
  if (!recipientEmail) {
    throw new Error('Customer email is required to send this invoice');
  }
  const pdfBuffer = await generateInvoicePdf(inv);
  const html = invoiceEmail({ invoice: inv });
  const naira = n => '\u20A6' + (Number(n) || 0).toLocaleString('en-NG');

  await sendResendEmail({
    from: process.env.INVOICE_EMAIL || 'invoice@izytechglobalservices.com',
    to: recipientEmail,
    subject: `Invoice ${inv.invoice_number} from Izy Technologies Global Services Limited${inv.status === 'paid' ? ' \u2014 Paid' : ''}`,
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

router.get('/api/admin/invoices/:id/pdf', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    const invoice = rows[0];
    const pdf = await generateInvoicePdf(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoice_number}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('Invoice PDF error:', err.message);
    res.status(500).json({ error: 'Could not generate invoice PDF: ' + err.message });
  }
});

router.get('/api/admin/invoices/:id/alt-bank-pdf', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
    const invoice = rows[0];
    const pdf = await generateAltBankLetterPdf(invoice);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Alt_Bank_Funding_${invoice.invoice_number}.pdf"`);
    res.send(pdf);
  } catch (err) {
    console.error('Alternative Bank letter PDF error:', err.message);
    res.status(500).json({ error: 'Could not generate Alternative Bank letter PDF: ' + err.message });
  }
});

router.post('/api/admin/invoices', requireAuth, async (req, res) => {
  const {
    title, customer_name, customer_email, customer_phone, customer_address,
    line_items, sections, logistics, service_charge, tax_rate, tax_label, discount,
    notes, due_date, status, bank_account_name, bank_account_number, bank_name,
  } = req.body || {};
  const customerName = String(customer_name || '').trim();
  const customerEmail = String(customer_email || '').trim();
  const customerPhone = String(customer_phone || '').trim();
  const customerAddress = String(customer_address || '').trim();
  if (!customerName) return res.status(400).json({ error: 'Customer name is required' });
  if (customerEmail && !isValidEmail(customerEmail)) return res.status(400).json({ error: 'Enter a valid customer email address' });
  if (!Array.isArray(line_items) || !line_items.length) return res.status(400).json({ error: 'At least one line item is required' });

  // Sections are flattened into the same line-items array the PDF/email
  // renderers already consume, so the two editors never diverge.
  const flattened = flattenToLineItems(line_items || []);
  const items = flattened.map(item => ({
    description: item.description || '',
    quantity: Number(item.quantity) || 1,
    unit_price: Number(item.unit_price) || 0,
    amount: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
  }));

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const logisticsAmount = parseMoney(logistics);
  const serviceCharge = parseMoney(service_charge);
  const rate = parseRate(tax_rate);
  const taxableSubtotal = subtotal + logisticsAmount + serviceCharge;
  const taxAmt = Math.round(taxableSubtotal * rate) / 100;
  const disc = parseMoney(discount);
  if (disc > taxableSubtotal) return res.status(400).json({ error: 'Discount cannot exceed the invoice subtotal and charges' });
  const total = taxableSubtotal + taxAmt - disc;
  const invoice_number = generateInvoiceNumber();
  const user = req.user;

  try {
    const { rows } = await db.query(
      'INSERT INTO invoices (invoice_number, title, customer_name, customer_email, customer_phone, customer_address, line_items, sections, subtotal, logistics, service_charge, tax_rate, tax_label, tax_amount, discount, total, notes, status, due_date, bank_account_name, bank_account_number, bank_name, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING *',
      [
        invoice_number,
        title?.trim() || DEFAULT_INVOICE_TITLE,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        JSON.stringify(items),
        JSON.stringify(sections || []),
        subtotal,
        logisticsAmount,
        serviceCharge,
        rate,
        tax_label || 'VAT (7.5%)',
        taxAmt,
        disc,
        total,
        notes || '',
        status || 'unpaid',
        due_date || null,
        bank_account_name?.trim() || DEFAULT_BANK_ACCOUNT_NAME,
        bank_account_number?.trim() || DEFAULT_BANK_ACCOUNT_NUMBER,
        bank_name?.trim() || DEFAULT_BANK_NAME,
        user.email || user.role || 'admin',
      ]
    );
    const inv = rows[0];

    // Auto-send invoice email (with PDF attached) to the customer on creation.
    let emailResult = { ok: false, skipped: true };
    if (inv.customer_email) {
      try {
        emailResult = await sendInvoiceEmail(inv);
      } catch (emailErr) {
        console.error('Invoice email error:', emailErr.message);
        emailResult = { ok: false, error: emailErr.message };
      }
    }

    res.status(201).json({
      data: inv,
      email_sent: emailResult.ok,
      email_skipped: Boolean(emailResult.skipped),
      email_error: emailResult.ok || emailResult.skipped ? null : (emailResult.error || 'Email could not be sent'),
      saved_as_draft: false,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: persist an in-progress invoice as a draft (no email, no PDF) ─────

router.post('/api/admin/invoices/:id/save-draft', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });

    const payload = {
      title: String(rest.title || '').trim() || 'Invoice',
      customer_name: String(rest.customer_name || '').trim(),
      customer_email: String(rest.customer_email || '').trim(),
      customer_phone: String(rest.customer_phone || '').trim(),
      customer_address: String(rest.customer_address || '').trim(),
      sections: JSON.stringify(sections ?? []),
      line_items: JSON.stringify(line_items ?? []),
      logistics: parseMoney(rest.logistics),
      service_charge: parseMoney(rest.service_charge),
      tax_rate: parseRate(rest.tax_rate),
      tax_label: String(rest.tax_label || 'VAT (7.5%)').trim() || 'VAT (7.5%)',
      discount: parseMoney(rest.discount),
      notes: String(rest.notes || '').trim(),
      due_date: rest.due_date || null,
      status: 'draft',
      bank_account_name: String(rest.bank_account_name || '').trim() || DEFAULT_BANK_ACCOUNT_NAME,
      bank_account_number: String(rest.bank_account_number || '').trim() || DEFAULT_BANK_ACCOUNT_NUMBER,
      bank_name: String(rest.bank_name || '').trim() || DEFAULT_BANK_NAME,
    };

    try {
      const { rows } = await db.query(
        `UPDATE invoices SET
          title = $1, customer_name = $2, customer_email = $3, customer_phone = $4,
          customer_address = $5, line_items = $6, sections = $7, subtotal = $8,
          logistics = $9, service_charge = $10, tax_rate = $11, tax_label = $12,
          tax_amount = $13, discount = $14, total = $15, notes = $16, status = $17,
          due_date = $18, bank_account_name = $19, bank_account_number = $20,
          bank_name = $21, updated_at = NOW() WHERE id = $22 RETURNING *`,
        [
          payload.title, payload.customer_name, payload.customer_email, payload.customer_phone,
          payload.customer_address, payload.line_items, payload.sections,
          payload.logistics, payload.service_charge, payload.tax_rate, payload.tax_label,
          payload.tax_amount, payload.discount, payload.total, payload.notes, payload.status,
          payload.due_date, payload.bank_account_name, payload.bank_account_number,
          payload.bank_name, req.params.id,
        ]
      );
      if (!rows.length) return res.status(404).json({ error: 'Invoice not found' });
      res.json({ data: rows[0], saved_as_draft: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

}


  return router;

}
module.exports = { initInvoicesTable, createInvoiceRouter };
