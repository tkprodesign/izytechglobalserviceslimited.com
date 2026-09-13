'use strict';

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

async function sendResendEmail({ from, to, subject, html, text, replyTo, headers, attachments } = {}) {
  if (!from || !to || !subject) {
    throw new Error('from, to, and subject are required to send an email');
  }

  return resendRequest('/emails', {
    method: 'POST',
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(headers && typeof headers === 'object' ? { headers } : {}),
      ...(Array.isArray(attachments) && attachments.length
        ? {
            attachments: attachments.map(a => ({
              filename: a.filename,
              content: Buffer.isBuffer(a.content) ? a.content.toString('base64') : String(a.content),
            })),
          }
        : {}),
    }),
  });
}

module.exports = { resendRequest, sendResendEmail };