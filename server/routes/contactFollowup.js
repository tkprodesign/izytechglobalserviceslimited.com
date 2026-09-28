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
      const { rows } = await db.query(`
        UPDATE contact_submissions
        SET status = $1, internal_notes = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `, [status, internalNotes.trim(), id]);
      if (!rows.length) return res.status(404).json({ error: 'Contact not found.' });
      res.json({ data: rows[0] });
    } catch (err) {
      console.error('Contact follow-up update failed:', err.message);
      res.status(500).json({ error: 'Could not save follow-up details.' });
    }
  };
}

module.exports = { createContactFollowupHandler };