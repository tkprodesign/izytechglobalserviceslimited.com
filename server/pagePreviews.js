const express = require('express');

const EVENT_TYPES = new Set([
  'page_created',
  'page_updated',
  'page_renamed',
  'url_changed',
  'category_changed',
  'status_changed',
  'page_deleted',
  'page_restored',
  'page_published',
  'page_unpublished',
  'asset_added',
  'asset_replaced',
  'asset_removed',
  'preview_opened',
  'operation_failed',
]);

function createPagePreviewsRouter({ db, requireDev }) {
  const router = express.Router();
  let tableReady;

  async function ensureTable() {
    if (!tableReady) {
      tableReady = db.query(`
        CREATE TABLE IF NOT EXISTS dev_preview_events (
          id BIGSERIAL PRIMARY KEY,
          page_id TEXT NOT NULL,
          event_type TEXT NOT NULL,
          page_title TEXT NOT NULL DEFAULT '',
          page_url TEXT NOT NULL DEFAULT '',
          previous_value TEXT,
          new_value TEXT,
          details JSONB NOT NULL DEFAULT '{}'::jsonb,
          actor TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `).then(() => db.query(`
        CREATE INDEX IF NOT EXISTS dev_preview_events_created_idx
        ON dev_preview_events (created_at DESC, id DESC)
      `)).then(() => db.query(`
        INSERT INTO dev_preview_events
          (page_id, event_type, page_title, page_url, details, actor)
        SELECT 'about-us-baseline', 'page_created', 'About Us — Baseline Clone',
               '/dev/previews/about-us',
               '{"source":"repository clone","note":"Copied from the current production About Us page without content additions."}'::jsonb,
               'system'
        WHERE NOT EXISTS (
          SELECT 1 FROM dev_preview_events
          WHERE page_id = 'about-us-baseline' AND event_type = 'page_created'
        )
      `));
    }
    return tableReady;
  }

  router.use(requireDev);

  router.get('/events', async (req, res) => {
    try {
      await ensureTable();
      const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 200, 1), 1000);
      const { rows } = await db.query(
        `SELECT id, page_id, event_type, page_title, page_url, previous_value,
                new_value, details, actor, created_at
         FROM dev_preview_events ORDER BY id DESC LIMIT $1`,
        [limit],
      );
      res.json({ data: rows });
    } catch (error) {
      console.error('Preview event history failed:', error.message);
      res.status(500).json({ error: 'Could not load preview history.' });
    }
  });

  router.post('/events', async (req, res) => {
    const body = req.body || {};
    const pageId = String(body.page_id || '').trim().slice(0, 120);
    const eventType = String(body.event_type || '').trim();
    const pageTitle = String(body.page_title || '').trim().slice(0, 240);
    const pageUrl = String(body.page_url || '').trim().slice(0, 500);
    if (!pageId || !EVENT_TYPES.has(eventType)) {
      return res.status(400).json({ error: 'A valid page_id and event_type are required.' });
    }

    try {
      await ensureTable();
      const { rows } = await db.query(
        `INSERT INTO dev_preview_events
          (page_id, event_type, page_title, page_url, previous_value, new_value, details, actor)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
         RETURNING id, page_id, event_type, page_title, page_url, previous_value,
                   new_value, details, actor, created_at`,
        [
          pageId,
          eventType,
          pageTitle,
          pageUrl,
          body.previous_value == null ? null : String(body.previous_value).slice(0, 1000),
          body.new_value == null ? null : String(body.new_value).slice(0, 1000),
          JSON.stringify(body.details && typeof body.details === 'object' ? body.details : {}),
          String(req.user.email || 'developer').slice(0, 320),
        ],
      );
      res.status(201).json({ data: rows[0] });
    } catch (error) {
      console.error('Preview event write failed:', error.message);
      res.status(500).json({ error: 'Could not record preview activity.' });
    }
  });

  router.get('/export.jsonl', async (_req, res) => {
    try {
      await ensureTable();
      const { rows } = await db.query(
        'SELECT * FROM dev_preview_events ORDER BY id ASC',
      );
      res.type('application/x-ndjson').send(rows.map(row => JSON.stringify(row)).join('\n') + (rows.length ? '\n' : ''));
    } catch (error) {
      console.error('Preview JSONL export failed:', error.message);
      res.status(500).json({ error: 'Could not export preview activity.' });
    }
  });

  router.get('/export.md', async (_req, res) => {
    try {
      await ensureTable();
      const { rows } = await db.query(
        'SELECT * FROM dev_preview_events ORDER BY id ASC',
      );
      const lines = [
        '# Preview Activity Log',
        '',
        'Generated from the append-only preview event database.',
        '',
        ...rows.map(row => [
          `## ${row.event_type.replace(/_/g, ' ')} — ${new Date(row.created_at).toISOString()}`,
          '',
          `- Page: ${row.page_title || row.page_id}`,
          `- Page ID: ${row.page_id}`,
          `- URL: ${row.page_url || 'Not recorded'}`,
          `- Actor: ${row.actor}`,
          row.previous_value ? `- Previous: ${row.previous_value}` : null,
          row.new_value ? `- New: ${row.new_value}` : null,
          '',
        ].filter(Boolean).join('\n')),
      ];
      res.type('text/markdown; charset=utf-8').send(lines.join('\n'));
    } catch (error) {
      console.error('Preview Markdown export failed:', error.message);
      res.status(500).json({ error: 'Could not export preview activity.' });
    }
  });

  return router;
}

module.exports = { createPagePreviewsRouter };
