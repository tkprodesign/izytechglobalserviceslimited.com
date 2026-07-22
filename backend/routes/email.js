'use strict';

const express = require('express');
const router = express.Router();
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');

// ── Account registry ──────────────────────────────────────────────────────────
function getAccounts() {
  return [
    { id: 'info',     label: 'Info',     email: process.env.INFO_EMAIL,     password: process.env.INFO_EMAIL_PASSWORD,     color: '#1a56db' },
    { id: 'admin',    label: 'Admin',    email: process.env.ADMIN_EMAIL,    password: process.env.ADMIN_EMAIL_PASSWORD,    color: '#7c3aed' },
    { id: 'careers',  label: 'Careers',  email: process.env.CAREERS_EMAIL,  password: process.env.CAREERS_EMAIL_PASSWORD,  color: '#059669' },
    { id: 'sales',    label: 'Sales',    email: process.env.SALES_EMAIL,    password: process.env.SALES_EMAIL_PASSWORD,    color: '#d97706' },
    { id: 'support',  label: 'Support',  email: process.env.SUPPORT_EMAIL,  password: process.env.SUPPORT_EMAIL_PASSWORD,  color: '#dc2626' },
    { id: 'noreply',  label: 'No-Reply', email: process.env.NOREPLY_EMAIL,  password: null, sendOnly: true,                color: '#6b7280' },
  ].filter(a => a.email);
}

// ── IMAP helpers ──────────────────────────────────────────────────────────────
async function withImap(email, password, fn) {
  const client = new ImapFlow({
    host: 'mail.spacemail.com',
    port: 993,
    secure: true,
    auth: { user: email, pass: password },
    logger: false,
    tls: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.logout().catch(() => {});
  }
}

// ── List accounts ─────────────────────────────────────────────────────────────
router.get('/accounts', (req, res) => {
  const accounts = getAccounts().map(({ id, label, email, color, sendOnly }) => ({
    id, label, email, color, sendOnly: !!sendOnly,
  }));
  res.json({ accounts });
});

// ── Inbox ─────────────────────────────────────────────────────────────────────
router.get('/inbox/:accountId', async (req, res) => {
  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === req.params.accountId);
  if (!acct) return res.status(404).json({ error: 'Account not found' });
  if (acct.sendOnly) return res.json({ messages: [], note: 'Send-only account' });
  if (!acct.password) return res.status(400).json({ error: 'No IMAP credentials for this account' });

  try {
    const messages = await withImap(acct.email, acct.password, async (client) => {
      const mailbox = await client.mailboxOpen('INBOX');
      const total = mailbox.exists;
      if (total === 0) return [];

      const fetchFrom = Math.max(1, total - 49); // last 50
      const msgs = [];
      for await (const msg of client.fetch(`${fetchFrom}:*`, {
        envelope: true,
        flags: true,
        bodyStructure: false,
      })) {
        msgs.push({
          uid: msg.uid,
          seq: msg.seq,
          subject: msg.envelope?.subject || '(no subject)',
          from: msg.envelope?.from?.[0] || null,
          to: msg.envelope?.to?.[0] || null,
          date: msg.envelope?.date || null,
          seen: msg.flags?.has('\\Seen') ?? false,
        });
      }
      return msgs.reverse();
    });
    res.json({ messages });
  } catch (err) {
    console.error(`IMAP error for ${acct.email}:`, err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Message body ──────────────────────────────────────────────────────────────
// Uses mailparser (simpleParser) on the raw RFC-822 source so that all
// Content-Transfer-Encodings (base64, quoted-printable) and charsets are
// handled correctly without fragile manual MIME walking.
router.get('/message/:accountId/:uid', async (req, res) => {
  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === req.params.accountId);
  if (!acct || acct.sendOnly || !acct.password) return res.status(404).json({ error: 'Not available' });

  try {
    const uid = parseInt(req.params.uid, 10);
    const folder = String(req.query.folder || 'INBOX');
    const result = await withImap(acct.email, acct.password, async (client) => {
      await client.mailboxOpen(folder);
      let rawSource = null;
      let envelope = null;

      // Fetch the full raw source — no other IMAP commands inside this loop
      // (imapflow deadlocks if you call another command while FETCH is in-flight)
      for await (const msg of client.fetch({ uid }, { source: true, envelope: true })) {
        rawSource = msg.source;
        envelope = msg.envelope;
      }

      // Mark as seen only after the fetch loop has fully completed
      await client.messageFlagsAdd({ uid }, ['\\Seen']).catch(() => {});

      if (!rawSource) return { html: '', text: '(message not found)', headers: {} };

      // mailparser handles all MIME types, QP, base64, charsets automatically
      const parsed = await simpleParser(rawSource);

      return {
        html: parsed.html || '',
        text: parsed.text || '',
        headers: {
          subject: envelope?.subject ?? parsed.subject ?? '',
          from: envelope?.from?.[0] ?? null,
          to: envelope?.to?.[0] ?? null,
          date: envelope?.date ?? parsed.date ?? null,
        },
      };
    });
    res.json(result);
  } catch (err) {
    console.error('IMAP fetch error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Send (all accounts via Resend — SMTP is blocked on Railway) ───────────────
router.post('/send', async (req, res) => {
  const { accountId, to, subject, bodyHtml, bodyText, replyTo } = req.body || {};
  if (!accountId || !to || !subject) {
    return res.status(400).json({ error: 'accountId, to, and subject are required' });
  }

  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === accountId);
  if (!acct) return res.status(404).json({ error: 'Account not found' });

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `IZY Technologies <${acct.email}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: bodyHtml || '',
        text: bodyText || subject,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Resend error', detail: data });
    return res.json({ success: true, messageId: data.id, via: 'resend' });
  } catch (err) {
    console.error('Resend send error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── Messages by folder (generic) ──────────────────────────────────────────────
// Used by the Email Manager for Inbox, Drafts, Sent, Spam, Trash, Archive.
// Folder name is passed as a URL segment; use encodeURIComponent on the client.
router.get('/messages/:accountId/*', async (req, res) => {
  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === req.params.accountId);
  if (!acct) return res.status(404).json({ error: 'Account not found' });
  if (acct.sendOnly) return res.json({ messages: [], note: 'Send-only account' });
  if (!acct.password) return res.status(400).json({ error: 'No IMAP credentials for this account' });

  const folder = req.params[0] || 'INBOX';

  try {
    const messages = await withImap(acct.email, acct.password, async (client) => {
      const mailbox = await client.mailboxOpen(folder);
      const total = mailbox.exists;
      if (total === 0) return [];

      const fetchFrom = Math.max(1, total - 49);
      const msgs = [];
      for await (const msg of client.fetch(`${fetchFrom}:*`, {
        envelope: true,
        flags: true,
        bodyStructure: false,
      })) {
        msgs.push({
          uid: msg.uid,
          seq: msg.seq,
          subject: msg.envelope?.subject || '(no subject)',
          from: msg.envelope?.from?.[0] || null,
          to: msg.envelope?.to?.[0] || null,
          date: msg.envelope?.date || null,
          seen: msg.flags?.has('\\Seen') ?? false,
        });
      }
      return msgs.reverse();
    });
    res.json({ messages });
  } catch (err) {
    console.error(`IMAP folder error for ${acct.email} [${folder}]:`, err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Mailbox folders ───────────────────────────────────────────────────────────
router.get('/folders/:accountId', async (req, res) => {
  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === req.params.accountId);
  if (!acct || acct.sendOnly || !acct.password) return res.json({ folders: ['INBOX'] });

  try {
    const folders = await withImap(acct.email, acct.password, async (client) => {
      const list = [];
      for await (const mbox of client.list()) list.push(mbox.path);
      return list;
    });
    res.json({ folders });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;
