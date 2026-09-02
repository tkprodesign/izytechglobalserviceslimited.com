'use strict';

const express = require('express');
const router = express.Router();

// ── Account registry ──────────────────────────────────────────────────────────
function getAccounts() {
  return [
    { id: 'info',     label: 'Info',     email: process.env.INFO_EMAIL,    color: '#1a56db' },
    { id: 'admin',    label: 'Admin',    email: process.env.ADMIN_EMAIL,   color: '#7c3aed' },
    { id: 'sales',    label: 'Sales',   email: process.env.SALES_EMAIL,   color: '#d97706' },
    { id: 'support',  label: 'Support', email: process.env.SUPPORT_EMAIL, color: '#dc2626' },
    { id: 'noreply',  label: 'No-Reply', email: process.env.NOREPLY_EMAIL, sendOnly: true, color: '#6b7280' },
  ].filter(a => a.email);
}

// ── Resend helpers ────────────────────────────────────────────────────────────
const RESEND_API = 'https://api.resend.com';

async function resendRequest(path, options = {}) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    const error = new Error('RESEND_API_KEY not configured');
    error.status = 500;
    throw error;
  }

  const response = await fetch(`${RESEND_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Resend request failed (${response.status})`);
    error.status = response.status;
    error.detail = data;
    throw error;
  }
  return data;
}

function normalizeMailbox(value) {
  if (!value) return null;
  if (Array.isArray(value)) return normalizeMailbox(value[0]);
  if (typeof value === 'object') {
    return {
      name: value.name || undefined,
      address: value.address || value.email || undefined,
    };
  }

  const text = String(value).trim();
  const match = text.match(/^(.*?)\s*<([^>]+)>$/);
  return match
    ? { name: match[1].trim().replace(/^["']|["']$/g, '') || undefined, address: match[2].trim() }
    : { address: text };
}

function addressValues(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(addressValues);
  if (typeof value === 'object') {
    return [value.address || value.email].filter(Boolean).map(String);
  }
  return [String(value).replace(/^.*<([^>]+)>.*$/, '$1')];
}

function emailBelongsToAccount(message, accountEmail) {
  const target = String(accountEmail).toLowerCase();
  return [
    ...addressValues(message.to),
    ...addressValues(message.received_for),
    ...addressValues(message.cc),
    ...addressValues(message.bcc),
  ].some(address => address.toLowerCase() === target);
}

function headerValue(headers, name) {
  if (!headers) return undefined;
  if (Array.isArray(headers)) {
    const header = headers.find(item => String(item?.name || '').toLowerCase() === name.toLowerCase());
    return header?.value;
  }
  const key = Object.keys(headers).find(item => item.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : undefined;
}

function messageSummary(message) {
  return {
    uid: String(message.id),
    subject: message.subject || '(no subject)',
    from: normalizeMailbox(message.from),
    to: normalizeMailbox(message.to),
    date: message.created_at || message.date || null,
    // Resend Receiving does not expose a persistent read/unread flag.
    seen: true,
    messageId: message.message_id || headerValue(message.headers, 'message-id') || undefined,
  };
}

async function receivedMessages(account) {
  const result = await resendRequest('/emails/receiving?limit=100');
  const data = Array.isArray(result?.data) ? result.data : [];
  return data
    .filter(message => emailBelongsToAccount(message, account.email))
    .map(messageSummary)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
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

  try {
    const messages = await receivedMessages(acct);
    res.json({
      messages,
      source: 'resend-receiving',
      note: messages.length === 0
        ? 'No received messages yet. Resend will show inbound mail after the domain MX records point to Resend.'
        : 'Resend Receiving provides inbound messages in one Inbox; folders and read status are not available.',
    });
  } catch (err) {
    console.error(`Resend receiving error for ${acct.email}:`, err.message);
    res.status(err.status || 502).json({ error: err.message, detail: err.detail });
  }
});

// ── Message body ──────────────────────────────────────────────────────────────
router.get('/message/:accountId/:uid', async (req, res) => {
  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === req.params.accountId);
  if (!acct || acct.sendOnly) return res.status(404).json({ error: 'Not available' });

  try {
    const message = await resendRequest(`/emails/receiving/${encodeURIComponent(req.params.uid)}`);
    if (!emailBelongsToAccount(message, acct.email)) {
      return res.status(404).json({ error: 'Message not found for this account' });
    }
    const messageId = message.message_id || headerValue(message.headers, 'message-id');
    const inReplyTo = headerValue(message.headers, 'in-reply-to');
    const references = headerValue(message.headers, 'references');
    res.json({
      html: message.html || '',
      text: message.text || '',
      headers: {
        subject: message.subject || '',
        from: normalizeMailbox(message.from),
        to: normalizeMailbox(message.to),
        date: message.created_at || null,
        messageId,
        inReplyTo,
        references,
      },
    });
  } catch (err) {
    console.error('Resend received message error:', err.message);
    res.status(err.status || 502).json({ error: err.message, detail: err.detail });
  }
});

// ── Send (all accounts via Resend HTTPS API; no SMTP dependency) ──────────────
router.post('/send', async (req, res) => {
  const { accountId, to, subject, bodyHtml, bodyText, replyTo, headers: replyHeaders } = req.body || {};
  if (!accountId || !to || !subject) {
    return res.status(400).json({ error: 'accountId, to, and subject are required' });
  }

  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === accountId);
  if (!acct) return res.status(404).json({ error: 'Account not found' });

  try {
    const data = await resendRequest('/emails', {
      method: 'POST',
      body: JSON.stringify({
        from: `IZY Technologies <${acct.email}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html: bodyHtml || '',
        text: bodyText || subject,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(replyHeaders && typeof replyHeaders === 'object' ? { headers: replyHeaders } : {}),
      }),
    });
    return res.json({ success: true, messageId: data.id, via: 'resend' });
  } catch (err) {
    console.error('Resend send error:', err.message);
    return res.status(err.status || 502).json({ error: err.message, detail: err.detail });
  }
});

// ── Messages by folder ────────────────────────────────────────────────────────
// Resend Receiving is inbound-only, so INBOX is the only supported folder.
router.get('/messages/:accountId/*', async (req, res) => {
  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === req.params.accountId);
  if (!acct) return res.status(404).json({ error: 'Account not found' });
  if (acct.sendOnly) return res.json({ messages: [], note: 'Send-only account' });

  const folder = String(req.params[0] || 'INBOX');
  if (folder.toUpperCase() !== 'INBOX') {
    return res.json({
      messages: [],
      source: 'resend-receiving',
      note: 'Resend Receiving provides inbound messages in one Inbox; this folder is not available.',
    });
  }

  try {
    const messages = await receivedMessages(acct);
    res.json({
      messages,
      source: 'resend-receiving',
      note: messages.length === 0
        ? 'No received messages yet. Resend will show inbound mail after the domain MX records point to Resend.'
        : 'Resend Receiving provides inbound messages in one Inbox; folders and read status are not available.',
    });
  } catch (err) {
    console.error(`Resend folder error for ${acct.email} [${folder}]:`, err.message);
    res.status(err.status || 502).json({ error: err.message, detail: err.detail });
  }
});

// ── Mailbox folders ───────────────────────────────────────────────────────────
router.get('/folders/:accountId', async (req, res) => {
  const accounts = getAccounts();
  const acct = accounts.find(a => a.id === req.params.accountId);
  res.json({ folders: acct?.sendOnly ? [] : ['INBOX'], source: 'resend-receiving' });
});

module.exports = router;
