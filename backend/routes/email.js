'use strict';

const express = require('express');
const router = express.Router();
const { ImapFlow } = require('imapflow');

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

// ── Body structure walker ─────────────────────────────────────────────────────
// Returns { html: { section, encoding, charset }, text: { section, encoding, charset } }
function findTextParts(struct, path) {
  if (!struct) return {};
  const type = (struct.type || '').toLowerCase();
  const subtype = (struct.subtype || '').toLowerCase();

  if (type === 'text') {
    const section = path || '1';
    const meta = {
      section,
      encoding: (struct.encoding || '7bit').toLowerCase(),
      charset: (struct.parameters?.charset || 'utf-8').toLowerCase(),
    };
    if (subtype === 'html') return { html: meta };
    if (subtype === 'plain') return { text: meta };
    return {};
  }

  if (Array.isArray(struct.childNodes) && struct.childNodes.length) {
    let html = null, text = null;
    for (let i = 0; i < struct.childNodes.length; i++) {
      const childPath = path ? `${path}.${i + 1}` : `${i + 1}`;
      const parts = findTextParts(struct.childNodes[i], childPath);
      if (parts.html && !html) html = parts.html;
      if (parts.text && !text) text = parts.text;
    }
    return { html, text };
  }

  return {};
}

// ── Content-Transfer-Encoding decoder ─────────────────────────────────────────
function decodeBodyPart(buffer, encoding, charset) {
  const enc = (encoding || '').toLowerCase();
  let decoded;

  if (enc === 'base64') {
    decoded = Buffer.from(buffer.toString().replace(/\s+/g, ''), 'base64');
  } else if (enc === 'quoted-printable') {
    const raw = buffer.toString('binary');
    const bytes = raw
      .replace(/=\r?\n/g, '')  // soft line breaks
      .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    decoded = Buffer.from(bytes, 'binary');
  } else {
    decoded = buffer;
  }

  return decoded.toString('utf-8');
}

// ── Message body ──────────────────────────────────────────────────────────────
router.get('/message/:accountId/:uid', async (req, res) => {
  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === req.params.accountId);
  if (!acct || acct.sendOnly || !acct.password) return res.status(404).json({ error: 'Not available' });

  try {
    const uid = parseInt(req.params.uid, 10);
    const result = await withImap(acct.email, acct.password, async (client) => {
      await client.mailboxOpen('INBOX');
      let html = '', text = '', envelope = null, bodyStructure = null;

      // Pass 1: fetch envelope + body structure (no body download yet)
      // IMPORTANT: no IMAP commands (e.g. messageFlagsAdd) inside this loop —
      // imapflow deadlocks if you issue a command while a FETCH is in progress.
      for await (const msg of client.fetch({ uid }, { envelope: true, flags: true, bodyStructure: true })) {
        envelope = msg.envelope;
        bodyStructure = msg.bodyStructure;
      }

      // Mark as seen now that the fetch loop has fully completed
      await client.messageFlagsAdd({ uid }, ['\\Seen']).catch(() => {});

      // Determine which IMAP sections hold the text parts (with encoding/charset meta)
      const { html: htmlMeta, text: textMeta } = findTextParts(bodyStructure, '');
      const sections = [...new Set([htmlMeta?.section, textMeta?.section].filter(Boolean))];
      if (sections.length === 0) sections.push('1'); // fallback for unknown structures

      // Pass 2: fetch only the needed body parts, then decode properly
      for await (const msg of client.fetch({ uid }, { bodyParts: sections })) {
        if (htmlMeta && msg.bodyParts?.get(htmlMeta.section)) {
          html = decodeBodyPart(msg.bodyParts.get(htmlMeta.section), htmlMeta.encoding, htmlMeta.charset);
        }
        if (textMeta && msg.bodyParts?.get(textMeta.section)) {
          text = decodeBodyPart(msg.bodyParts.get(textMeta.section), textMeta.encoding, textMeta.charset);
        }
        // Fallback: if neither section resolved, use whatever came back for '1'
        if (!html && !text && msg.bodyParts?.get('1')) {
          text = msg.bodyParts.get('1').toString('utf-8');
        }
      }

      return {
        html,
        text,
        headers: {
          subject: envelope?.subject,
          from: envelope?.from?.[0],
          to: envelope?.to?.[0],
          date: envelope?.date,
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
