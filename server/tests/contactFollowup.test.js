const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  createContactFollowupActivityHandler,
  createContactFollowupHandler,
} = require('../routes/contactFollowup');

async function update(id, body, current = { id: Number(id), status: 'new', internal_notes: '' }, fail = false) {
  const queries = [];
  const client = {
    async query(sql, values) {
      queries.push({ sql, values });
      if (fail && /INSERT INTO contact_followup_events/.test(sql)) throw new Error('Database unavailable');
      if (/SELECT \* FROM contact_submissions/.test(sql)) return { rows: current ? [current] : [] };
      if (/UPDATE contact_submissions/.test(sql)) return { rows: [{ ...current, status: values[0], internal_notes: values[1] }] };
      if (/FROM contact_followup_events/.test(sql)) {
        return { rows: queries.filter(query => /INSERT INTO contact_followup_events/.test(query.sql)).map((query, index) => ({
          id: index + 1,
          event_type: query.values[1],
          from_value: query.values[2],
          to_value: query.values[3],
          actor: query.values[4],
          created_at: '2026-09-28T10:00:00.000Z',
        })) };
      }
      return { rows: [] };
    },
    release() { queries.push({ sql: 'RELEASE', values: [] }); },
  };
  const handler = createContactFollowupHandler({ connect: async () => client });
  const response = { code: 200, status(code) { this.code = code; return this; }, json(value) { this.body = value; } };
  await handler({ params: { id }, body, user: { email: 'admin@example.com' } }, response);
  return { ...response, queries };
}

test('updates follow-up fields and records status/note changes with the authenticated actor', async () => {
  const result = await update('12', { status: 'contacted', internalNotes: '  Called; follow up Friday.  ' });
  assert.equal(result.code, 200);
  assert.deepEqual(result.body.data, { id: 12, status: 'contacted', internal_notes: 'Called; follow up Friday.' });
  const events = result.queries.filter(query => /INSERT INTO contact_followup_events/.test(query.sql));
  assert.deepEqual(events.map(query => query.values), [
    [12, 'status', 'new', 'contacted', 'admin@example.com'],
    [12, 'note', '', 'Called; follow up Friday.', 'admin@example.com'],
  ]);
  assert.equal(result.body.activity.length, 2);
  assert.ok(result.queries.some(query => query.sql === 'COMMIT'));
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
  const result = await update('12', { status: 'new', internalNotes: '' }, null);
  assert.equal(result.code, 404);
});

test('rolls back contact update when writing its history fails', async () => {
  const result = await update('12', { status: 'contacted', internalNotes: '' }, undefined, true);
  assert.equal(result.code, 500);
  assert.equal(result.body.data, undefined);
  assert.ok(result.queries.some(query => query.sql === 'ROLLBACK'));
  assert.ok(!result.queries.some(query => query.sql === 'COMMIT'));
});

test('returns the contact activity history', async () => {
  const queries = [];
  const handler = createContactFollowupActivityHandler({
    query: async (sql, values) => {
      queries.push({ sql, values });
      return /SELECT id FROM contact_submissions/.test(sql)
        ? { rows: [{ id: 12 }] }
        : { rows: [{ id: 3, event_type: 'status', from_value: 'new', to_value: 'contacted', actor: 'admin@example.com' }] };
    },
  });
  const response = { code: 200, status(code) { this.code = code; return this; }, json(value) { this.body = value; } };
  await handler({ params: { id: '12' } }, response);
  assert.equal(response.code, 200);
  assert.equal(response.body.data[0].actor, 'admin@example.com');
  assert.deepEqual(queries[0].values, [12]);
});