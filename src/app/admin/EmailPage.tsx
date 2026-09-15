import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { DashboardLayout } from './DashboardLayout';
import { getToken, removeToken, isDeveloper } from '../../lib/auth';
import { ngSmartDate, ngDateTimeWAT } from '../../lib/ngtime';
import {
  Mail, Send, RefreshCw, PenSquare, X, ChevronLeft,
  Inbox, Archive, ArchiveRestore, AlertCircle, Loader2, Reply,
  Search, Clock,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface Account {
  id: string;
  label: string;
  email: string;
  color: string;
  sendOnly: boolean;
  isVirtual?: boolean;
}

interface EmailMeta {
  uid: string;
  source: 'received' | 'sent';
  subject: string;
  from: { name?: string; address?: string } | null;
  to: { name?: string; address?: string } | null;
  date: string | null;
  status?: string;
  archived: boolean;
  seen: boolean;
  messageId?: string;
}

interface EmailBody {
  html: string;
  text: string;
  headers: {
    source?: 'received' | 'sent';
    subject?: string;
    from?: { name?: string; address?: string } | null;
    to?: { name?: string; address?: string } | null;
    date?: string;
    messageId?: string;
    inReplyTo?: string;
    references?: string;
  };
}

interface Folder {
  name: string;
  key: string;
  icon: React.ReactNode;
}

/* ── Constants ─────────────────────────────────────────────────────────────── */

const FOLDERS: Folder[] = [
  { name: 'All Mail', key: 'ALL', icon: <Mail size={16} /> },
  { name: 'Inbox', key: 'INBOX', icon: <Inbox size={16} /> },
  { name: 'Sent', key: 'SENT', icon: <Send size={16} /> },
  { name: 'Archived', key: 'ARCHIVED', icon: <Archive size={16} /> },
];

const ALL_MAIL: Account = {
  id: 'all',
  label: 'All Mail',
  email: 'All configured mailboxes',
  color: '#6366f1',
  sendOnly: false,
  isVirtual: true,
};

type ThreadHeaders = Pick<EmailBody['headers'], 'messageId' | 'inReplyTo' | 'references'>;
type ComposeDefaults = { to: string; subject: string; replyHeaders?: ThreadHeaders };

/* ── Helpers ───────────────────────────────────────────────────────────────── */

function fmtDate(d: string | null) {
  return ngSmartDate(d);
}

function senderDisplay(from: EmailMeta['from']) {
  if (!from) return 'Unknown';
  return from.name || from.address || 'Unknown';
}

function senderInitial(from: EmailMeta['from']) {
  const name = senderDisplay(from);
  return name[0]?.toUpperCase() || '?';
}

function truncate(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + '…' : text;
}

/* ── Compose Modal ─────────────────────────────────────────────────────────── */

function ComposeModal({
  accounts,
  apiBase,
  defaultAccount,
  defaultTo = '',
  defaultSubject = '',
  replyHeaders,
  onClose,
}: {
  accounts: Account[];
  apiBase: string;
  defaultAccount: string;
  defaultTo?: string;
  defaultSubject?: string;
  replyHeaders?: ThreadHeaders;
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
      const res = await fetch(`${API}${apiBase}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          accountId: from,
          to,
          subject,
          bodyText: body,
          ...(replyHeaders?.messageId || replyHeaders?.references
            ? {
                headers: {
                  ...(replyHeaders.messageId ? { 'In-Reply-To': replyHeaders.messageId } : {}),
                  References: [replyHeaders.references, replyHeaders.messageId].filter(Boolean).join(' '),
                },
              }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setSent(true);
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(4,22,39,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: '92vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: '#eef1f6' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#eff6ff' }}>
              <PenSquare size={14} style={{ color: '#2563eb' }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: '#0f172a' }}>
              {replyHeaders ? 'Reply' : 'New Message'}
            </span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X size={15} style={{ color: '#94a3b8' }} />
          </button>
        </div>

        <form onSubmit={handleSend} className="flex flex-col flex-1 min-h-0">
          <div className="px-5 py-4 space-y-3 overflow-y-auto flex-1">
            {/* From */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>From</label>
              <select
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                style={{ borderColor: '#e2e8f0', color: '#0f172a', background: '#f8fafc' }}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>{a.label} — {a.email}</option>
                ))}
              </select>
            </div>
            {/* To */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>To</label>
              <input
                type="email"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="recipient@example.com"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                style={{ borderColor: '#e2e8f0', color: '#0f172a', background: '#f8fafc' }}
                required
              />
            </div>
            {/* Subject */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="What is this about?"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
                style={{ borderColor: '#e2e8f0', color: '#0f172a', background: '#f8fafc' }}
                required
              />
            </div>
            {/* Body */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94a3b8' }}>Message</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write your message…"
                rows={7}
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
                style={{ borderColor: '#e2e8f0', color: '#0f172a', background: '#f8fafc' }}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
                <AlertCircle size={14} /> {error}
              </div>
            )}
            {sent && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                ✓ Message sent successfully!
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: '#eef1f6' }}>
            <p className="text-[11px]" style={{ color: '#94a3b8' }}>
              {replyHeaders ? 'Replying to thread' : 'Composing new message'}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="px-3 py-2 text-sm rounded-lg font-medium hover:bg-gray-100 transition-colors" style={{ color: '#64748b' }}>
                Discard
              </button>
              <button
                type="submit"
                disabled={sending || sent}
                className="px-5 py-2 text-sm rounded-lg font-semibold text-white flex items-center gap-2 disabled:opacity-50 transition-all hover:shadow-md"
                style={{ background: '#2563eb' }}
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {sending ? 'Sending…' : sent ? 'Sent!' : 'Send'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */

export function EmailPage() {
  const token = getToken();
  const navigate = useNavigate();
  const location = useLocation();
  const dev = isDeveloper();

  // The same page is mounted at /dev/email (developer panel) and /admin/email
  // (admin panel). API base follows the mount point — the backend mirrors the
  // router at both /api/dev/email and /api/admin/email.
  const apiBase = location.pathname.startsWith('/admin/') ? '/api/admin/email' : '/api/dev/email';

  // Data
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [activeFolder, setActiveFolder] = useState<Folder>(FOLDERS[0]);
  const [messages, setMessages] = useState<EmailMeta[]>([]);
  const [selected, setSelected] = useState<EmailBody | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<EmailMeta | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [inboxError, setInboxError] = useState('');
  const [inboxNote, setInboxNote] = useState('');
  const [archiveError, setArchiveError] = useState('');
  const [archiving, setArchiving] = useState(false);
  const [bodyView, setBodyView] = useState<'rendered' | 'text'>('rendered');
  const [compose, setCompose] = useState(false);
  const [composeDefaults, setComposeDefaults] = useState<ComposeDefaults>({ to: '', subject: '' });

  // Mobile: 'list' = message list, 'detail' = reading a message
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);
  const handleUnauth = useCallback(() => { removeToken(); navigate(dev ? '/dev/login' : '/admin/login'); }, [navigate, dev]);

  // Filtered messages
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(m =>
      m.subject?.toLowerCase().includes(q) ||
      m.from?.name?.toLowerCase().includes(q) ||
      m.from?.address?.toLowerCase().includes(q) ||
      m.to?.name?.toLowerCase().includes(q) ||
      m.to?.address?.toLowerCase().includes(q)
    );
  }, [messages, searchQuery]);

  const unreadCount = useMemo(() => messages.filter(m => !m.seen && m.source === 'received').length, [messages]);

  // Load accounts on mount
  useEffect(() => {
    fetch(`${API}${apiBase}/accounts`, { headers })
      .then(r => {
        if (r.status === 401 || r.status === 403) { handleUnauth(); return null; }
        return r.json();
      })
      .then(d => {
        if (!d) return;
        setAccounts(d.accounts || []);
        if (d.accounts?.length) setActiveAccount(ALL_MAIL);
      });
  }, []);

  // Load folder messages
  const loadFolder = useCallback(async (acct: Account, folder: Folder) => {
    setMessages([]);
    setSelected(null);
    setSelectedMeta(null);
    setInboxError('');
    setInboxNote('');
    setLoadingInbox(true);
    try {
      const res = await fetch(
        `${API}${apiBase}/messages/${acct.id}/${encodeURIComponent(folder.key)}`,
        { headers }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load folder');
      setMessages(data.messages || []);
      setInboxNote(data.note || '');
    } catch (err: unknown) {
      setInboxError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoadingInbox(false);
    }
  }, [headers]);

  // Reload when account/folder changes
  useEffect(() => {
    if (activeAccount) loadFolder(activeAccount, activeFolder);
  }, [activeAccount, activeFolder, loadFolder]);

  // Switch account
  function switchAccount(acct: Account) {
    setActiveAccount(acct);
    setActiveFolder(acct.sendOnly ? FOLDERS[2] : FOLDERS[0]);
    setSearchQuery('');
    setMobileView('list');
  }

  // Open a message
  async function openMessage(msg: EmailMeta) {
    if (!activeAccount) return;
    setSelectedMeta(msg);
    setSelected(null);
    setBodyView('rendered');
    setMobileView('detail');
    setLoadingMsg(true);
    try {
      const res = await fetch(
        `${API}${apiBase}/message/${activeAccount.id}/${encodeURIComponent(msg.uid)}?source=${msg.source}`,
        { headers }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load message');
      setSelected(data);
      setMessages(prev => prev.map(m => m.uid === msg.uid ? { ...m, seen: true } : m));
    } catch {
      setSelected({ html: '', text: '(Could not load message body)', headers: {} });
    } finally {
      setLoadingMsg(false);
    }
  }

  // Reply
  function handleReply() {
    if (!selectedMeta) return;
    setComposeDefaults({
      to: (selectedMeta.source === 'sent' ? selectedMeta.to?.address : selectedMeta.from?.address) || '',
      subject: `Re: ${selectedMeta.subject || ''}`,
      replyHeaders: selected?.headers,
    });
    setCompose(true);
  }

  // Toggle archive
  async function toggleArchive() {
    if (!activeAccount || !selectedMeta) return;
    const nextArchived = !selectedMeta.archived;
    setArchiving(true);
    setArchiveError('');
    try {
      const res = await fetch(
        `${API}${apiBase}/archive/${activeAccount.id}/${encodeURIComponent(selectedMeta.uid)}`,
        {
          method: 'PATCH',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: selectedMeta.source, archived: nextArchived }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update');

      // Reload current folder
      await loadFolder(activeAccount, activeFolder);
      setSelected(null);
      setSelectedMeta(null);
      setMobileView('list');
    } catch (err: unknown) {
      setArchiveError(err instanceof Error ? err.message : 'Could not update');
    } finally {
      setArchiving(false);
    }
  }

  function composeAccountId() {
    return activeAccount?.isVirtual
      ? accounts.find(a => !a.sendOnly)?.id || accounts[0]?.id || ''
      : activeAccount?.id || '';
  }

  const visibleFolders = activeAccount?.sendOnly ? [FOLDERS[2], FOLDERS[3]] : FOLDERS;

  return (
    <DashboardLayout>
      <div
        className="flex min-h-0 h-full overflow-hidden"
        style={{ background: '#f5f7fb' }}
      >

        {/* ═══ MAILROOM RAIL ═══ */}
        <aside className="hidden md:flex w-[248px] flex-shrink-0 flex-col p-3 text-white" style={{ background: '#071b2d' }}>
          <div className="px-3 py-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs" style={{ background: '#f0a20e', color: '#071b2d' }}>
                IZY
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">Mailroom</p>
                <p className="text-[10px] tracking-widest uppercase text-white/40">Company communications</p>
              </div>
            </div>
          </div>

          <div className="px-1 pb-4">
            <button
              onClick={() => { setComposeDefaults({ to: '', subject: '' }); setCompose(true); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:shadow-lg active:scale-[0.98]"
              style={{ background: '#f0a20e', color: '#071b2d' }}
            >
              <PenSquare size={15} />
              New message
            </button>
          </div>

          <div className="px-1 pb-3">
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Mailboxes</p>
              <span className="text-[10px] text-white/30">{accounts.length} active</span>
            </div>
            <div className="space-y-1">
              {[ALL_MAIL, ...accounts].map(acct => {
                const isActive = activeAccount?.id === acct.id;
                return (
                  <button
                    key={acct.id}
                    onClick={() => switchAccount(acct)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group"
                    style={{ background: isActive ? 'rgba(240,162,14,0.14)' : 'transparent' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 transition-transform group-hover:scale-105"
                      style={{ background: acct.isVirtual ? '#596579' : acct.color }}
                    >
                      {acct.isVirtual ? <Mail size={13} /> : acct.label[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold truncate" style={{ color: isActive ? '#f0a20e' : '#e2e8f0' }}>
                        {acct.label}
                      </p>
                      <p className="text-[10px] truncate text-white/35">
                        {acct.isVirtual ? 'Every mailbox' : acct.sendOnly ? 'Send only' : acct.email}
                      </p>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#f0a20e' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-1 pt-4 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2 text-white/40">
              Views
            </p>
            <div className="space-y-1">
              {visibleFolders.map(folder => {
                const isActive = activeFolder.key === folder.key;
                return (
                  <button
                    key={folder.key}
                    onClick={() => setActiveFolder(folder)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                    style={{ background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                  >
                    <span style={{ color: isActive ? '#f0a20e' : '#94a3b8' }}>{folder.icon}</span>
                    <span className="text-[13px] flex-1" style={{ color: isActive ? '#fff' : '#94a3b8', fontWeight: isActive ? 600 : 400 }}>
                      {folder.name}
                    </span>
                    {folder.key === 'INBOX' && unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: '#f0a20e', color: '#071b2d', minWidth: '18px', textAlign: 'center' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto mx-1 p-3 rounded-xl border border-white/10" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-semibold text-white/70">Mail sync active</span>
            </div>
            <p className="text-[10px] leading-relaxed text-white/35">Messages are fetched from Resend and organized here for the team.</p>
          </div>
        </aside>

        {/* ═══ MESSAGE LIST ═══ */}
        <div className={`min-h-0 flex-1 md:flex-[0_0_370px] flex flex-col border-r ${mobileView === 'detail' ? 'hidden md:flex' : 'flex'}`} style={{ background: '#fff', borderColor: '#e7ecf3' }}>
          {/* Header */}
          <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: '#e7ecf3' }}>
            {/* Mobile back to mailboxes */}
            <div className="md:hidden mb-3">
              <button
                onClick={() => navigate(dev ? '/dev/dashboard' : '/admin/dashboard')}
                className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#2563eb' }}
              >
                <ChevronLeft size={14} /> Dashboard
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#94a3b8' }}>
                  Workspace
                </p>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: '#0f172a' }}>
                  {activeAccount?.label || 'Select mailbox'}
                </h2>
                <p className="text-[11px] mt-0.5 truncate max-w-[240px]" style={{ color: '#94a3b8' }}>
                  {activeAccount?.email || 'Choose a mailbox to begin'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => activeAccount && loadFolder(activeAccount, activeFolder)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors"
                  title="Refresh"
                >
                  <RefreshCw size={15} style={{ color: '#64748b' }} className={loadingInbox ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => { setComposeDefaults({ to: '', subject: '' }); setCompose(true); }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-colors md:hidden"
                  title="Compose"
                >
                  <PenSquare size={14} style={{ color: '#2563eb' }} />
                </button>
              </div>
            </div>

            <select
              value={activeAccount?.id || ''}
              onChange={e => {
                const acct = [ALL_MAIL, ...accounts].find(a => a.id === e.target.value);
                if (acct) switchAccount(acct);
              }}
              className="md:hidden w-full mb-3 px-3 py-2.5 text-sm rounded-xl border outline-none"
              style={{ borderColor: '#e2e8f0', color: '#334155', background: '#f8fafc' }}
            >
              {[ALL_MAIL, ...accounts].map(acct => <option key={acct.id} value={acct.id}>{acct.label}</option>)}
            </select>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages…"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-50"
                style={{ borderColor: '#e2e8f0', background: '#f8fafc', color: '#0f172a' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center hover:bg-gray-200"
                >
                  <X size={12} style={{ color: '#94a3b8' }} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 mt-3 overflow-x-auto">
              {visibleFolders.map(folder => (
                <button
                  key={folder.key}
                  onClick={() => setActiveFolder(folder)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
                  style={{
                    background: activeFolder.key === folder.key ? '#eaf2ff' : 'transparent',
                    color: activeFolder.key === folder.key ? '#2563eb' : '#94a3b8',
                  }}
                >
                  {folder.name}
                </button>
              ))}
            </div>
            {inboxNote && <p className="text-[10px] mt-2 text-slate-400">{inboxNote}</p>}
          </div>

          {/* Message list */}
          <div className="flex-1 overflow-y-auto">
            {loadingInbox ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Loader2 size={22} className="animate-spin" style={{ color: '#2563eb' }} />
                <p className="text-xs" style={{ color: '#94a3b8' }}>Loading messages…</p>
              </div>
            ) : inboxError ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 px-6 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fef2f2' }}>
                  <AlertCircle size={18} style={{ color: '#dc2626' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: '#dc2626' }}>Connection error</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{inboxError}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                  <Inbox size={22} style={{ color: '#cbd5e1' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: '#64748b' }}>
                    {searchQuery ? 'No matching messages' : `No messages in ${activeFolder.name}`}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                    {searchQuery ? 'Try a different search term' : 'Messages will appear here'}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {filtered.map(msg => {
                  const isActive = selectedMeta?.uid === msg.uid;
                  const party = msg.source === 'sent'
                    ? `To ${senderDisplay(msg.to)}`
                    : senderDisplay(msg.from);
                  const partyAddr = msg.source === 'sent' ? msg.to?.address : msg.from?.address;

                  return (
                    <button
                      key={msg.uid}
                      onClick={() => openMessage(msg)}
                      className="w-full text-left px-5 py-3.5 border-b transition-all hover:bg-slate-50 active:bg-slate-100"
                      style={{
                        borderColor: '#edf1f5',
                        background: isActive ? '#f5f9ff' : undefined,
                        borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent',
                      }}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: msg.source === 'sent' ? '#6366f1' : '#2563eb' }}
                        >
                          {msg.source === 'sent' ? <Send size={13} /> : senderInitial(msg.from)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span
                              className="text-[13px] truncate"
                              style={{ color: '#0f172a', fontWeight: msg.seen ? 400 : 600 }}
                            >
                              {party}
                            </span>
                            <span className="text-[11px] flex-shrink-0 tabular-nums" style={{ color: '#94a3b8' }}>
                              {fmtDate(msg.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mb-1">
                            {!msg.seen && (
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#2563eb' }} />
                            )}
                            <p className="text-[13px] truncate" style={{ color: msg.seen ? '#64748b' : '#334155', fontWeight: msg.seen ? 500 : 700 }}>
                              {msg.subject || '(no subject)'}
                            </p>
                          </div>
                          {partyAddr && (
                            <p className="text-[11px] truncate" style={{ color: '#a8b4c4' }}>
                              {partyAddr}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ═══ MESSAGE DETAIL ═══ */}
        <div className={`min-h-0 flex-1 flex-col overflow-hidden ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
          {!selectedMeta ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: '#eaf2ff' }}>
                <Mail size={30} style={{ color: '#2563eb' }} />
              </div>
              <div className="text-center">
                <p className="text-base font-bold" style={{ color: '#0f172a' }}>Your reading space</p>
                <p className="text-sm mt-1 max-w-xs" style={{ color: '#94a3b8' }}>Select a message from {activeAccount?.label || 'a mailbox'} to read, reply, or archive it.</p>
              </div>
              <button
                onClick={() => { setComposeDefaults({ to: '', subject: '' }); setCompose(true); }}
                className="px-5 py-2.5 text-sm rounded-xl font-semibold text-white flex items-center gap-2 hover:shadow-lg transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
              >
                <PenSquare size={14} /> Compose
              </button>
            </div>
          ) : (
            <div className="flex h-full flex-col overflow-hidden">
              {/* Mobile back button */}
              <div className="md:hidden px-4 py-2 border-b bg-white" style={{ borderColor: '#e7ecf3' }}>
                <button
                  onClick={() => { setMobileView('list'); setSelected(null); setSelectedMeta(null); }}
                  className="flex items-center gap-1 text-xs font-medium" style={{ color: '#2563eb' }}
                >
                  <ChevronLeft size={14} /> Back to messages
                </button>
              </div>

              {/* Message header */}
              <div className="px-5 md:px-8 py-5 border-b bg-white" style={{ borderColor: '#e7ecf3' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: selectedMeta.source === 'sent' ? '#f0edff' : '#eaf2ff',
                          color: selectedMeta.source === 'sent' ? '#6366f1' : '#2563eb',
                        }}
                      >
                        {selectedMeta.source === 'sent' ? 'Sent message' : 'Incoming message'}
                      </span>
                      <span className="text-[11px] flex items-center gap-1" style={{ color: '#94a3b8' }}>
                        <Clock size={11} /> {selectedMeta.date ? ngSmartDate(selectedMeta.date) : ''}
                      </span>
                    </div>
                    <h2 className="text-base font-bold leading-snug" style={{ color: '#0f172a' }}>
                      {selectedMeta.subject || '(no subject)'}
                    </h2>
                    <div className="flex items-center gap-2.5 mt-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: selectedMeta.source === 'sent' ? '#6366f1' : '#2563eb' }}
                      >
                        {selectedMeta.source === 'sent'
                          ? <Send size={14} />
                          : senderInitial(selectedMeta.from)}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#0f172a' }}>
                          {selectedMeta.source === 'sent' ? 'To' : 'From'}{' '}
                          {senderDisplay(selectedMeta.source === 'sent' ? selectedMeta.to : selectedMeta.from)}
                        </p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>
                          {selectedMeta.source === 'sent' ? selectedMeta.to?.address : selectedMeta.from?.address}
                          {' · '}
                          {selectedMeta.date ? ngDateTimeWAT(selectedMeta.date) : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={handleReply}
                      disabled={loadingMsg || !selected}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-blue-50 disabled:opacity-40"
                      style={{ color: '#2563eb' }}
                    >
                      <Reply size={14} /> <span className="hidden sm:inline">Reply</span>
                    </button>
                    <button
                      onClick={toggleArchive}
                      disabled={archiving || loadingMsg || !selected}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-amber-50 disabled:opacity-40"
                      style={{ color: '#d97706' }}
                    >
                      {selectedMeta.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                      <span className="hidden sm:inline">
                        {archiving ? '…' : selectedMeta.archived ? 'Unarchive' : 'Archive'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Error */}
              {archiveError && (
                <div className="mx-6 mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm" style={{ background: '#fef2f2', color: '#dc2626' }}>
                  <AlertCircle size={14} /> {archiveError}
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8">
                {loadingMsg ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3">
                    <Loader2 size={22} className="animate-spin" style={{ color: '#2563eb' }} />
                    <p className="text-xs" style={{ color: '#94a3b8' }}>Loading message…</p>
                  </div>
                ) : selected ? (
                  <div className="max-w-4xl bg-white rounded-2xl shadow-sm border overflow-hidden" style={{ borderColor: '#e7ecf3' }}>
                    {selected.html && (
                      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: '#f1f5f9' }}>
                        <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>Content</span>
                        <div className="flex items-center gap-0.5 p-0.5 rounded-lg" style={{ background: '#f1f5f9' }}>
                          {(['rendered', 'text'] as const).map(view => (
                            <button
                              key={view}
                              onClick={() => setBodyView(view)}
                              className="px-2.5 py-1 text-[11px] rounded-md font-medium transition-all"
                              style={{
                                background: bodyView === view ? '#fff' : 'transparent',
                                color: bodyView === view ? '#2563eb' : '#94a3b8',
                                boxShadow: bodyView === view ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                              }}
                            >
                              {view === 'rendered' ? 'HTML' : 'Plain text'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {selected.html && bodyView === 'rendered' ? (
                      <iframe
                        srcDoc={selected.html}
                        title="Email content"
                        className="w-full"
                        style={{ minHeight: 400, height: 400, border: 'none', background: '#fff' }}
                        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                        onLoad={e => {
                          const iframe = e.currentTarget;
                          const h = Math.max(
                            iframe.contentDocument?.documentElement?.scrollHeight || 0,
                            iframe.contentDocument?.body?.scrollHeight || 0,
                          );
                          iframe.style.height = `${Math.max(400, Math.min(h + 32, 5000))}px`;
                        }}
                      />
                    ) : (
                      <pre className="p-6 text-sm whitespace-pre-wrap font-sans leading-relaxed" style={{ color: '#334155' }}>
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

      {/* Compose modal */}
      {compose && (
        <ComposeModal
          accounts={accounts}
          apiBase={apiBase}
          defaultAccount={composeAccountId()}
          defaultTo={composeDefaults.to}
          defaultSubject={composeDefaults.subject}
          replyHeaders={composeDefaults.replyHeaders}
          onClose={() => setCompose(false)}
        />
      )}
    </DashboardLayout>
  );
}
