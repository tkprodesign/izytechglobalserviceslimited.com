import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { getToken } from '../../lib/auth';
import {
  Mail, Send, RefreshCw, PenSquare, X, ChevronRight,
  Inbox, AlertCircle, Loader2, Reply, Trash2
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

interface Account {
  id: string;
  label: string;
  email: string;
  color: string;
  sendOnly: boolean;
}

interface EmailMeta {
  uid: number;
  seq: number;
  subject: string;
  from: { name?: string; address?: string } | null;
  to: { name?: string; address?: string } | null;
  date: string | null;
  seen: boolean;
}

interface EmailBody {
  html: string;
  text: string;
  headers: {
    subject?: string;
    from?: { name?: string; address?: string } | null;
    to?: { name?: string; address?: string } | null;
    date?: string;
  };
}

function fmt(d: string | null) {
  if (!d) return '';
  const dt = new Date(d);
  const now = new Date();
  const sameDay = dt.toDateString() === now.toDateString();
  return sameDay
    ? dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function initials(name?: string, address?: string) {
  const n = name || address || '?';
  return n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function senderName(from: EmailMeta['from']) {
  if (!from) return 'Unknown';
  return from.name || from.address || 'Unknown';
}

// ── Compose Modal ─────────────────────────────────────────────────────────────
function ComposeModal({
  accounts,
  defaultAccount,
  defaultTo = '',
  defaultSubject = '',
  onClose,
}: {
  accounts: Account[];
  defaultAccount: string;
  defaultTo?: string;
  defaultSubject?: string;
  onClose: () => void;
}) {
  const token = getToken();
  const [from, setFrom] = useState(defaultAccount);
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to || !subject || !body) return setError('To, subject and body are required.');
    setSending(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/dev/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          accountId: from,
          to,
          subject,
          bodyHtml: `<p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#3a4a5c">${body.replace(/\n/g, '<br/>')}</p>`,
          bodyText: body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setSent(true);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all border focus:border-blue-400 focus:ring-2 focus:ring-blue-100';
  const inputStyle = { borderColor: '#dce8ff', color: '#041627', background: '#fff' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(4,22,39,0.6)' }}>
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#eef1f6' }}>
          <div className="flex items-center gap-2.5">
            <PenSquare size={16} style={{ color: '#1a56db' }} />
            <span className="font-semibold text-sm" style={{ color: '#041627' }}>New Message</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} style={{ color: '#5a6a82' }} />
          </button>
        </div>

        <form onSubmit={handleSend} className="flex flex-col" style={{ maxHeight: 'calc(90vh - 56px)' }}>
          <div className="px-6 py-4 overflow-y-auto flex-1 space-y-3">
            {/* From */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#5a6a82' }}>From</label>
              <select
                value={from}
                onChange={e => setFrom(e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.label} — {a.email}</option>
                ))}
              </select>
            </div>
            {/* To */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#5a6a82' }}>To</label>
              <input
                type="email"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className={inputCls}
                style={inputStyle}
                required
              />
            </div>
            {/* Subject */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#5a6a82' }}>Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject"
                className={inputCls}
                style={inputStyle}
                required
              />
            </div>
            {/* Body */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#5a6a82' }}>Message</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Type your message here…"
                rows={8}
                className={inputCls + ' resize-none'}
                style={inputStyle}
                required
              />
            </div>

            {error && (
              <p className="text-sm px-3 py-2.5 rounded-lg flex items-center gap-2" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                <AlertCircle size={14} /> {error}
              </p>
            )}
            {sent && (
              <p className="text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(5,150,105,0.08)', color: '#059669' }}>
                ✓ Message sent successfully!
              </p>
            )}
          </div>

          <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#eef1f6' }}>
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg font-medium hover:bg-gray-100 transition-colors" style={{ color: '#5a6a82' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending || sent}
              className="px-5 py-2 text-sm rounded-lg font-semibold text-white flex items-center gap-2 disabled:opacity-60 transition-opacity"
              style={{ background: '#1a56db' }}
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? 'Sending…' : sent ? 'Sent!' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export function EmailPage() {
  const token = getToken();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [messages, setMessages] = useState<EmailMeta[]>([]);
  const [selected, setSelected] = useState<EmailBody | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<EmailMeta | null>(null);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [compose, setCompose] = useState(false);
  const [composeDefaults, setComposeDefaults] = useState({ to: '', subject: '' });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API}/api/dev/email/accounts`, { headers })
      .then(r => r.json())
      .then(d => {
        setAccounts(d.accounts || []);
        if (d.accounts?.length) setActiveAccount(d.accounts[0]);
      });
  }, []);

  const loadInbox = useCallback(async (acct: Account) => {
    setMessages([]);
    setSelected(null);
    setSelectedMeta(null);
    setInboxError('');
    if (acct.sendOnly) return;
    setLoadingInbox(true);
    try {
      const res = await fetch(`${API}/api/dev/email/inbox/${acct.id}`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load inbox');
      setMessages(data.messages || []);
    } catch (err: unknown) {
      setInboxError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoadingInbox(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeAccount) loadInbox(activeAccount);
  }, [activeAccount]);

  async function openMessage(msg: EmailMeta) {
    if (!activeAccount) return;
    setSelectedMeta(msg);
    setSelected(null);
    setLoadingMsg(true);
    try {
      const res = await fetch(`${API}/api/dev/email/message/${activeAccount.id}/${msg.uid}`, { headers });
      const data = await res.json();
      setSelected(data);
      // Mark as seen in state
      setMessages(prev => prev.map(m => m.uid === msg.uid ? { ...m, seen: true } : m));
    } catch {
      setSelected({ html: '', text: '(Could not load message body)', headers: {} });
    } finally {
      setLoadingMsg(false);
    }
  }

  function handleReply() {
    if (!selectedMeta) return;
    setComposeDefaults({
      to: selectedMeta.from?.address || '',
      subject: `Re: ${selectedMeta.subject || ''}`,
    });
    setCompose(true);
  }

  const unread = messages.filter(m => !m.seen).length;

  return (
    <DashboardLayout>
      <div className="flex h-screen overflow-hidden" style={{ background: '#f0f3f8' }}>

        {/* Account sidebar */}
        <div className="w-52 flex-shrink-0 border-r overflow-y-auto" style={{ background: '#fff', borderColor: '#eef1f6' }}>
          <div className="px-4 py-5 border-b" style={{ borderColor: '#eef1f6' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a6a82' }}>Mailboxes</p>
          </div>
          <div className="py-2">
            {accounts.map(acct => (
              <button
                key={acct.id}
                onClick={() => setActiveAccount(acct)}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors text-left"
                style={{
                  background: activeAccount?.id === acct.id ? '#f0f6ff' : 'transparent',
                  borderRight: activeAccount?.id === acct.id ? `3px solid ${acct.color}` : '3px solid transparent',
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: acct.color }}
                >
                  {acct.label[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: activeAccount?.id === acct.id ? acct.color : '#041627' }}>{acct.label}</p>
                  <p className="text-xs truncate" style={{ color: '#8fadc8' }}>{acct.sendOnly ? 'Send only' : 'Inbox'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message list */}
        <div className="w-72 flex-shrink-0 border-r flex flex-col overflow-hidden" style={{ background: '#fff', borderColor: '#eef1f6' }}>
          <div className="px-4 py-4 border-b flex items-center justify-between" style={{ borderColor: '#eef1f6' }}>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#041627' }}>
                {activeAccount?.label || 'Inbox'}
                {unread > 0 && (
                  <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: '#1a56db' }}>
                    {unread}
                  </span>
                )}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#8fadc8' }}>{activeAccount?.email}</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => activeAccount && loadInbox(activeAccount)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={14} style={{ color: '#5a6a82' }} />
              </button>
              <button
                onClick={() => { setComposeDefaults({ to: '', subject: '' }); setCompose(true); }}
                className="p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                title="Compose"
              >
                <PenSquare size={14} style={{ color: '#1a56db' }} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeAccount?.sendOnly ? (
              <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                <Send size={28} style={{ color: '#dce8ff' }} />
                <p className="text-sm mt-3 font-medium" style={{ color: '#5a6a82' }}>Send-only account</p>
                <p className="text-xs mt-1" style={{ color: '#8fadc8' }}>This mailbox doesn't have inbox access</p>
                <button
                  onClick={() => { setComposeDefaults({ to: '', subject: '' }); setCompose(true); }}
                  className="mt-4 px-4 py-2 text-sm rounded-lg font-medium text-white"
                  style={{ background: '#1a56db' }}
                >
                  Compose
                </button>
              </div>
            ) : loadingInbox ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={24} className="animate-spin" style={{ color: '#1a56db' }} />
              </div>
            ) : inboxError ? (
              <div className="px-5 py-8 text-center">
                <AlertCircle size={24} style={{ color: '#dc2626' }} className="mx-auto mb-2" />
                <p className="text-sm font-medium" style={{ color: '#dc2626' }}>Connection error</p>
                <p className="text-xs mt-1" style={{ color: '#8fadc8' }}>{inboxError}</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48">
                <Inbox size={28} style={{ color: '#dce8ff' }} />
                <p className="text-sm mt-3" style={{ color: '#8fadc8' }}>No messages</p>
              </div>
            ) : (
              <div>
                {messages.map(msg => (
                  <button
                    key={msg.uid}
                    onClick={() => openMessage(msg)}
                    className="w-full text-left px-4 py-3.5 border-b transition-colors hover:bg-[#f8fafc]"
                    style={{
                      borderColor: '#f0f3f8',
                      background: selectedMeta?.uid === msg.uid ? '#f0f6ff' : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-sm truncate"
                        style={{ color: '#041627', fontWeight: msg.seen ? 400 : 600 }}
                      >
                        {senderName(msg.from)}
                      </span>
                      <span className="text-xs flex-shrink-0" style={{ color: '#8fadc8' }}>{fmt(msg.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!msg.seen && (
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#1a56db' }} />
                      )}
                      <p className="text-xs truncate" style={{ color: '#5a6a82' }}>{msg.subject || '(no subject)'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message detail */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedMeta ? (
            <div className="flex-1 flex flex-col items-center justify-center" style={{ color: '#8fadc8' }}>
              <Mail size={48} style={{ color: '#dce8ff' }} />
              <p className="mt-4 text-sm font-medium">Select a message to read</p>
              <p className="text-xs mt-1">Or compose a new one</p>
              <button
                onClick={() => { setComposeDefaults({ to: '', subject: '' }); setCompose(true); }}
                className="mt-6 px-5 py-2.5 text-sm rounded-lg font-semibold text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                style={{ background: '#1a56db' }}
              >
                <PenSquare size={14} /> Compose
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Message header */}
              <div className="px-8 py-5 border-b" style={{ borderColor: '#eef1f6', background: '#fff' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold leading-tight" style={{ color: '#041627' }}>
                      {selectedMeta.subject || '(no subject)'}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: activeAccount?.color || '#1a56db' }}
                      >
                        {initials(selectedMeta.from?.name, selectedMeta.from?.address)}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#041627' }}>{senderName(selectedMeta.from)}</p>
                        <p className="text-xs" style={{ color: '#8fadc8' }}>{selectedMeta.from?.address} · {fmt(selectedMeta.date)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleReply}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-blue-50"
                      style={{ color: '#1a56db' }}
                    >
                      <Reply size={14} /> Reply
                    </button>
                  </div>
                </div>
              </div>

              {/* Message body */}
              <div className="flex-1 overflow-y-auto p-8">
                {loadingMsg ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 size={24} className="animate-spin" style={{ color: '#1a56db' }} />
                  </div>
                ) : selected ? (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {selected.html ? (
                      <iframe
                        srcDoc={selected.html}
                        className="w-full"
                        style={{ minHeight: '500px', border: 'none' }}
                        sandbox="allow-same-origin"
                        onLoad={e => {
                          const iframe = e.currentTarget;
                          iframe.style.height = iframe.contentDocument?.body?.scrollHeight + 32 + 'px';
                        }}
                      />
                    ) : (
                      <pre className="p-6 text-sm whitespace-pre-wrap font-sans leading-relaxed" style={{ color: '#3a4a5c' }}>
                        {selected.text || '(empty message)'}
                      </pre>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>

      {compose && (
        <ComposeModal
          accounts={accounts}
          defaultAccount={activeAccount?.id || ''}
          defaultTo={composeDefaults.to}
          defaultSubject={composeDefaults.subject}
          onClose={() => setCompose(false)}
        />
      )}
    </DashboardLayout>
  );
}
