const validStatuses = ['new', 'contacted', 'quoted', 'won', 'closed'];

function createContactFollowupHandler(db) {
  return async (req, res) => {
    const id = Number(req.params.id);
    const { status, internalNotes } = req.body || {};

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid contact ID.' });
    }
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid follow-up status.' });
    }
    if (typeof internalNotes !== 'string' || internalNotes.length > 5000) {
      return res.status(400).json({ error: 'Internal notes must be 5,000 characters or fewer.' });
    }

    try {
      const client = await db.connect();
      try {
        await client.query('BEGIN');
        const currentResult = await client.query(
          'SELECT * FROM contact_submissions WHERE id = $1 FOR UPDATE',
          [id],
        );
        if (!currentResult.rows.length) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: 'Contact not found.' });
        }

        const current = currentResult.rows[0];
        const cleanNotes = internalNotes.trim();
        const currentStatus = current.status || 'new';
        const currentNotes = current.internal_notes || '';
        const events = [];

        if (currentStatus !== status) {
          events.push({ eventType: 'status', fromValue: currentStatus, toValue: status });
        }
        if (currentNotes !== cleanNotes) {
          events.push({ eventType: 'note', fromValue: currentNotes, toValue: cleanNotes });
        }

        let contact = current;
        if (events.length) {
          const updatedResult = await client.query(`
            UPDATE contact_submissions
            SET status = $1, internal_notes = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
          `, [status, cleanNotes, id]);
          contact = updatedResult.rows[0];

          for (const event of events) {
            await client.query(`
              INSERT INTO contact_followup_events
                (contact_id, event_type, from_value, to_value, actor)
              VALUES ($1, $2, $3, $4, $5)
            `, [id, event.eventType, event.fromValue, event.toValue, req.user?.email || 'Unknown user']);
          }
        }

        const activityResult = await client.query(`
          SELECT id, event_type, from_value, to_value, actor, created_at
          FROM contact_followup_events
          WHERE contact_id = $1
          ORDER BY created_at DESC, id DESC
          LIMIT 100
        `, [id]);
        await client.query('COMMIT');
        res.json({ data: contact, activity: activityResult.rows });
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Contact follow-up update failed:', err.message);
      res.status(500).json({ error: 'Could not save follow-up details.' });
    }
  };
}

function createContactFollowupActivityHandler(db) {
  return async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid contact ID.' });
    }

    try {
      const contact = await db.query('SELECT id FROM contact_submissions WHERE id = $1', [id]);
      if (!contact.rows.length) return res.status(404).json({ error: 'Contact not found.' });
      const { rows } = await db.query(`
        SELECT id, event_type, from_value, to_value, actor, created_at
        FROM contact_followup_events
        WHERE contact_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 100
      `, [id]);
      res.json({ data: rows });
    } catch (err) {
      console.error('Contact follow-up activity fetch failed:', err.message);
      res.status(500).json({ error: 'Could not load follow-up history.' });
    }
  };
}

module.exports = { createContactFollowupHandler, createContactFollowupActivityHandler };