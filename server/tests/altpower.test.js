const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createAltPowerEnquiryHandler } = require('../routes/altpower');

async function submit(body, fail = false) {
  const writes = [];
  const handler = createAltPowerEnquiryHandler({ query: async (sql, values) => {
    if (fail) throw new Error('Database unavailable');
    writes.push({ sql, values });
  } });
  const response = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  await handler({ body }, response);
  return { ...response, writes };
}

test('saves email-only, phone-only, and both contact methods in admin contacts', async () => {
  for (const details of [{ email: 'customer@example.com' }, { phone: '+234 801 234 5678' }, { email: 'customer@example.com', phone: '08012345678' }]) {
    const result = await submit({ name: '  Customer Name  ', ...details });
    assert.equal(result.code, 201);
    assert.equal(result.writes.length, 1);
    assert.match(result.writes[0].sql, /INSERT INTO contact_submissions/);
    assert.deepEqual(result.writes[0].values.slice(0, 4), ['Customer Name', details.email || '', details.phone || null, 'AltPower / Alternative Bank enquiry']);
  }
});

test('rejects missing name, missing contact details, invalid types and invalid supplied contact methods', async () => {
  for (const body of [undefined, {}, { name: '   ', email: 'a@example.com' }, { name: 'Name', email: ' ', phone: ' ' }, { name: {}, phone: '08012345678' }, { name: 'Name', email: 'invalid', phone: '08012345678' }, { name: 'Name', phone: '123' }, { name: 'Name', phone: 'call-me-12345678' }]) {
    const result = await submit(body);
    assert.equal(result.code, 400);
    assert.equal(result.writes.length, 0);
  }
});

test('does not report success when saving fails', async () => {
  const result = await submit({ name: 'Customer', email: 'customer@example.com' }, true);
  assert.equal(result.code, 500);
  assert.equal(result.body.success, undefined);
});
