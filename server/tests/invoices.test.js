'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

// Exercise the real routes and PDF generator without a database or email service.
const deliveries = [];
require.cache[require.resolve('../lib/resend')] = {
  exports: { sendResendEmail: async message => { deliveries.push(message); } },
};
const { createInvoiceRouter } = require('../invoices_endpoint');
const { generateInvoicePdf } = require('../lib/invoicePdf');
const { generateAltBankLetterPdf } = require('../lib/altBankLetterPdf');

const records = new Map();
let nextId = 1;
const db = {
  async query(sql, values) {
    if (sql.startsWith('INSERT INTO invoices')) {
      const columns = sql.match(/\(([^)]+)\) VALUES/)[1].split(', ');
      const record = Object.fromEntries(columns.map((name, index) => [name, values[index]]));
      record.id = nextId++;
      record.created_at = '2026-09-25T12:00:00Z';
      record.line_items = JSON.parse(record.line_items);
      record.sections = JSON.parse(record.sections || '[]');
      records.set(record.id, record);
      return { rows: [record] };
    }
    if (sql.startsWith('UPDATE invoices SET')) {
      const record = records.get(Number(values[20]));
      if (!record) return { rows: [] };
      for (const match of sql.matchAll(/(\w+)=\$(\d+)/g)) {
        if (match[1] !== 'id') record[match[1]] = values[Number(match[2]) - 1];
      }
      record.line_items = JSON.parse(record.line_items);
      record.sections = JSON.parse(record.sections || '[]');
      return { rows: [record] };
    }
    if (sql.startsWith('SELECT * FROM invoices WHERE id')) {
      const record = records.get(Number(values[0]));
      return { rows: record ? [record] : [] };
    }
    throw new Error('Unexpected query in invoice tests: ' + sql);
  },
};

let server, base;
before(async () => {
  const app = express();
  app.use(express.json());
  app.use(createInvoiceRouter({ db, requireAuth: (req, res, next) => {
    req.user = { role: 'admin' };
    next();
  } }));
  server = await new Promise(resolve => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  base = `http://127.0.0.1:${server.address().port}/api/admin/invoices`;
});
after(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
});

const invoice = (contacts = {}, title = 'Invoice') => ({
  title, customer_name: 'Synthetic Test Customer', ...contacts,
  line_items: [{ description: 'Solar installation', quantity: 2, unit_price: 1000 }],
  tax_rate: 7.5, status: 'unpaid',
});
async function save(body, id) {
  const response = await fetch(base + (id ? '/' + id : ''), {
    method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, ...await response.json() };
}

for (const title of ['Invoice', 'Proforma Invoice for Solar Installation', 'Receipt']) {
  for (const [label, contacts] of Object.entries({
    omitted: {}, empty: { customer_email: '', customer_phone: '' },
    null: { customer_email: null, customer_phone: null },
    whitespace: { customer_email: '  ', customer_phone: '  ' },
    phoneOnly: { customer_phone: '+234 800 000 0000' },
  })) {
    test(`${title}: create and edit with ${label} contacts`, async () => {
      const sentBefore = deliveries.length;
      const result = await save(invoice(contacts, title));
      assert.equal(result.status, 201);
      assert.equal(result.data.customer_email, '');
      assert.equal(result.email_skipped, true);
      assert.equal(result.email_error, null);
      const updated = await save(invoice(contacts, title), result.data.id);
      assert.equal(updated.status, 200);
      assert.equal(updated.email_skipped, true);
      assert.equal(deliveries.length, sentBefore);
      for (const endpoint of ['pdf', 'alt-bank-pdf']) {
        const response = await fetch(`${base}/${result.data.id}/${endpoint}`);
        assert.equal(response.status, 200);
        const pdf = Buffer.from(await response.arrayBuffer());
        assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
        assert.ok(pdf.length > 1000);
      }
    });
  }
}

test('clearing existing contacts keeps the invoice and other records', async () => {
  const created = await save(invoice({ customer_email: 'test@example.com', customer_phone: '12345' }));
  assert.equal(created.email_sent, true);
  assert.ok(deliveries.at(-1).attachments[0].content.length > 1000);
  const snapshot = [...records].filter(([id]) => id !== created.data.id).map(([id, row]) => [id, JSON.stringify(row)]);
  const sentBefore = deliveries.length;
  const edited = await save(invoice({ customer_email: '', customer_phone: '' }), created.data.id);
  assert.equal(edited.status, 200);
  assert.equal(edited.data.invoice_number, created.data.invoice_number);
  assert.equal(edited.data.customer_phone, '');
  assert.equal(edited.data.customer_email, '');
  assert.equal(edited.email_skipped, true);
  assert.equal(deliveries.length, sentBefore);
  for (const [id, row] of snapshot) assert.equal(JSON.stringify(records.get(id)), row);
  const response = await fetch(`${base}/${created.data.id}/send`, { method: 'POST' });
  assert.equal(response.status, 400);
  assert.equal(deliveries.length, sentBefore);
});

test('email alone is accepted and malformed nonblank email is rejected', async () => {
  const created = await save(invoice({ customer_email: ' test@example.com ' }));
  assert.equal(created.status, 201);
  assert.equal(created.data.customer_phone, '');
  assert.equal(created.email_sent, true);
  assert.equal(deliveries.at(-1).to, 'test@example.com');
  for (const id of [undefined, created.data.id]) {
    const invalid = await save(invoice({ customer_email: 'invalid' }), id);
    assert.equal(invalid.status, 400);
  }
});

test('both PDF variants handle absent contacts and many line items', async () => {
  const baseInvoice = { ...invoice(), invoice_number: 'TEST-PAGINATION',
    created_at: '2026-09-25T12:00:00Z', subtotal: 80000, total: 86000, tax_amount: 6000,
    line_items: Array.from({ length: 80 }, (_, index) => ({
      description: `Test item ${index + 1} - solar installation equipment`,
      quantity: 1, unit_price: 1000, amount: 1000,
    })),
  };
  for (const generator of [generateInvoicePdf, generateAltBankLetterPdf]) {
    const pdf = await generator(baseInvoice);
    assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
    assert.ok((pdf.toString('latin1').match(/\/Type \/Page\b/g) || []).length > 1);
  }
});

for (const status of ['paid', 'overdue', 'cancelled']) {
  test(`${status} invoices can be saved without contacts`, async () => {
    const result = await save({ ...invoice(), status });
    assert.equal(result.status, 201);
    assert.equal(result.data.status, status);
    assert.equal(result.email_skipped, true);
    const updated = await save({ ...invoice(), status }, result.data.id);
    assert.equal(updated.status, 200);
    for (const endpoint of ['pdf', 'alt-bank-pdf']) {
      const response = await fetch(`${base}/${result.data.id}/${endpoint}`);
      assert.equal(response.status, 200);
      await response.arrayBuffer();
    }
  });
}

const ts = require('typescript');
const fs = require('node:fs');
const path = require('node:path');
const sectionModule = { exports: {} };
new Function('exports', ts.transpileModule(fs.readFileSync(path.join(__dirname, '../../src/lib/invoiceSections.ts'), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(sectionModule.exports);
const { appendInvoiceSection } = sectionModule.exports;

test('Add section preserves existing items and charges, then saves and reloads both sections', async () => {
  const original = { ...invoice(), sections: [], logistics: '250', service_charge: '100' };
  const converted = appendInvoiceSection(original);
  assert.equal(converted.sections.length, 2);
  assert.deepEqual(converted.sections[0].rows, original.line_items);
  assert.equal(converted.sections[0].logistics, '250');
  assert.equal(converted.sections[0].service_charge, '100');
  assert.equal(original.sections.length, 0);
  converted.sections[1].title = 'Maintenance';
  converted.sections[1].rows = [{ description: 'Maintenance service', quantity: 1, unit_price: 500, amount: 500 }];
  const saved = await save(converted);
  assert.equal(saved.status, 201);
  assert.equal(saved.data.subtotal, 2500);
  assert.equal(saved.data.logistics, 250);
  assert.equal(saved.data.service_charge, 100);
  assert.equal(saved.data.total, 3063.75);
  const response = await fetch(base + '/' + saved.data.id);
  const loaded = (await response.json()).data;
  assert.equal(loaded.sections.length, 2);
  assert.equal(loaded.sections[1].title, 'Maintenance');
  const added = appendInvoiceSection({ ...converted, sections: loaded.sections });
  added.sections[2].title = 'Additional work';
  added.sections[2].rows = [{ description: 'Extra service', quantity: 2, unit_price: 100, amount: 200 }];
  const updated = await save(added, saved.data.id);
  assert.equal(updated.status, 200);
  assert.equal(updated.data.total, 3278.75);
  for (const endpoint of ['pdf', 'alt-bank-pdf']) {
    const pdf = await fetch(`${base}/${saved.data.id}/${endpoint}`);
    assert.equal(pdf.status, 200);
    assert.ok((await pdf.arrayBuffer()).byteLength > 1000);
  }
});

test('Add section on an empty invoice starts with one section', () => {
  const result = appendInvoiceSection({ sections: [], line_items: [{description:'',quantity:1,unit_price:0,amount:0}], logistics:'0',service_charge:'0' });
  assert.equal(result.sections.length,1);
  assert.equal(result.sections[0].rows.length,1);
});
