const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createContactFollowupHandler } = require('../routes/contactFollowup');

async function update(id, body, rows = [{ id: Number(id), status: body?.status, internal_notes: body?.internalNotes }], fail = false) {
  const queries = [];
  const handler = createContactFollowupHandler({ query: async (sql, values) => {
    if (fail) throw new Error('Database unavailable');
    queries.push({ sql, values });
    return { rows };
  } });
  const response = { code: 200, status(code) { this.code = code; return this; }, json(value) { this.body = value; } };
  await handler({ params: { id }, body }, response);
  return { ...response, queries };
}

test('updates follow-up status and private notes', async () => {
  const result = await update('12', { status: 'contacted', internalNotes: '  Called; follow up Friday.  ' });
  assert.equal(result.code, 200);
  assert.match(result.queries[0].sql, /UPDATE contact_submissions/);
  assert.deepEqual(result.queries[0].values, ['contacted', 'Called; follow up Friday.', 12]);
});

test('rejects invalid IDs, statuses, and oversized notes without writing', async () => {
  for (const [id, body] of [
    ['abc', { status: 'new', internalNotes: '' }],
    ['1', { status: 'pending', internalNotes: '' }],
    ['1', { status: 'new', internalNotes: 'x'.repeat(5001) }],
  ]) {
    const result = await update(id, body);
    assert.equal(result.code, 400);
    assert.equal(result.queries.length, 0);
  }
});

test('returns not found when the contact ID does not exist', async () => {
  const result = await update('12', { status: 'new', internalNotes: '' }, []);
  assert.equal(result.code, 404);
});

test('does not report success when the database update fails', async () => {
  const result = await update('12', { status: 'new', internalNotes: '' }, [], true);
  assert.equal(result.code, 500);
  assert.equal(result.body.data, undefined);
});