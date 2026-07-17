'use strict';

const express = require('express');
const router = express.Router();
const { ImapFlow } = require('imapflow');
const nodemailer = require('nodemailer');

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
router.get('/message/:accountId/:uid', async (req, res) => {
  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === req.params.accountId);
  if (!acct || acct.sendOnly || !acct.password) return res.status(404).json({ error: 'Not available' });

  try {
    const uid = parseInt(req.params.uid, 10);
    const result = await withImap(acct.email, acct.password, async (client) => {
      await client.mailboxOpen('INBOX');
      let html = '', text = '', headers = {};
      for await (const msg of client.fetch({ uid }, { source: true, envelope: true, flags: true })) {
        // Mark as seen
        await client.messageFlagsAdd({ uid }, ['\\Seen']).catch(() => {});
        const raw = msg.source.toString();
        // Simple extract of HTML / text parts from raw
        const htmlMatch = raw.match(/Content-Type: text\/html[^\r\n]*[\r\n]{1,4}([\s\S]*?)(?=--|\Z)/i);
        const textMatch = raw.match(/Content-Type: text\/plain[^\r\n]*[\r\n]{1,4}([\s\S]*?)(?=--|\Z)/i);
        html = htmlMatch?.[1]?.trim() || '';
        text = textMatch?.[1]?.trim() || raw.slice(raw.lastIndexOf('\r\n\r\n') + 4);
        headers = {
          subject: msg.envelope?.subject,
          from: msg.envelope?.from?.[0],
          to: msg.envelope?.to?.[0],
          date: msg.envelope?.date,
        };
      }
      return { html, text, headers };
    });
    res.json(result);
  } catch (err) {
    console.error('IMAP fetch error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Send ──────────────────────────────────────────────────────────────────────
router.post('/send', async (req, res) => {
  const { accountId, to, subject, bodyHtml, bodyText, replyTo } = req.body || {};
  if (!accountId || !to || !subject) {
    return res.status(400).json({ error: 'accountId, to, and subject are required' });
  }

  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === accountId);
  if (!acct) return res.status(404).json({ error: 'Account not found' });

  // noreply → use Resend API
  if (acct.sendOnly || accountId === 'noreply') {
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (!resendKey) return res.status(500).json({ error: 'RESEND_API_KEY not configured' });

      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `IZY Technologies <${acct.email}>`,
          to: Array.isArray(to) ? to : [to],
          subject,
          html: bodyHtml || '',
          text: bodyText || '',
          ...(replyTo ? { reply_to: replyTo } : {}),
        }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data?.message || 'Resend error', detail: data });
      return res.json({ success: true, messageId: data.id, via: 'resend' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // All other accounts → SMTP via nodemailer
  if (!acct.password) return res.status(400).json({ error: 'No SMTP credentials for this account' });

  try {
    const transport = nodemailer.createTransport({
      host: 'smtp.spacemail.com',
      port: 587,
      secure: false,
      auth: { user: acct.email, pass: acct.password },
      tls: { rejectUnauthorized: false },
    });

    const info = await transport.sendMail({
      from: `IZY Technologies <${acct.email}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html: bodyHtml || '',
      text: bodyText || subject,
      ...(replyTo ? { replyTo } : {}),
    });

    res.json({ success: true, messageId: info.messageId, via: 'smtp' });
  } catch (err) {
    console.error('SMTP send error:', err.message);
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
