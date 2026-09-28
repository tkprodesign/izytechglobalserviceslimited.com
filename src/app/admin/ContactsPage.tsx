import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { getToken } from '../../lib/auth';
import { ngDateTime } from '../../lib/ngtime';
import { ArrowLeft, Download, History, Mail, MessageCircle, Phone, Save, Search } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';
const followUpStatuses = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'won', label: 'Won' },
  { value: 'closed', label: 'Closed' },
] as const;
type FollowUpStatus = typeof followUpStatuses[number]['value'];

interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  created_at: string;
  status?: FollowUpStatus;
  internal_notes?: string;
  updated_at?: string;
}

interface FollowUpEvent {
  id: number;
  event_type: 'status' | 'note';
  from_value: string;
  to_value: string;
  actor: string;
  created_at: string;
}

function fmt(iso: string) {
  return ngDateTime(iso);
}

function csvCell(value: unknown) {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function whatsappHref(contact: Contact) {
  const rawPhone = contact.phone?.trim() ?? '';
  let digits = rawPhone.replace(/\D/g, '');
  if (rawPhone.startsWith('+')) {
    // International numbers already include their country code.
  } else if (digits.startsWith('0')) {
    digits = `234${digits.slice(1)}`;
  } else if (digits.length === 10 && !digits.startsWith('234')) {
    digits = `234${digits}`;
  }
  if (digits.length < 7 || digits.length > 15) return null;

  const subject = contact.subject ? ` about ${contact.subject}` : '';
  const message = `Hello ${contact.name}, this is IZY Technologies following up on your enquiry${subject}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('new');
  const [internalNotes, setInternalNotes] = useState('');
  const [activity, setActivity] = useState<FollowUpEvent[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FollowUpStatus>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const token = getToken();

  const filteredContacts = contacts.filter(contact => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [contact.name, contact.email, contact.phone, contact.subject, contact.message]
      .some(value => value?.toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'all' || (contact.status ?? 'new') === statusFilter;
    const createdDate = contact.created_at.slice(0, 10);
    return matchesSearch && matchesStatus && (!dateFrom || createdDate >= dateFrom) && (!dateTo || createdDate <= dateTo);
  });

  function exportContacts() {
    const columns: (keyof Contact)[] = ['name', 'email', 'phone', 'subject', 'status', 'created_at', 'updated_at'];
    const rows = [columns.join(','), ...filteredContacts.map(contact => columns.map(column => csvCell(column === 'status' ? contact.status ?? 'new' : contact[column])).join(','))];
    const url = URL.createObjectURL(new Blob([`\uFEFF${rows.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `izy-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function selectContact(contact: Contact) {
    setSelected(contact);
    setFollowUpStatus(contact.status ?? 'new');
    setInternalNotes(contact.internal_notes ?? '');
    setActivity([]);
    setActivityError('');
    setSaveMessage('');
    setSaveError(false);
  }

  async function saveFollowUp() {
    if (!selected || savingFollowUp) return;
    setSavingFollowUp(true);
    setSaveMessage('');
    setSaveError(false);
    try {
      const response = await fetch(`${API}/api/admin/contacts/${selected.id}/follow-up`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: followUpStatus, internalNotes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not save follow-up details.');
      const updated: Contact = result.data;
      setContacts(current => current.map(contact => contact.id === updated.id ? updated : contact));
      setSelected(updated);
      setFollowUpStatus(updated.status ?? 'new');
      setInternalNotes(updated.internal_notes ?? '');
      setActivity(result.activity ?? []);
      setSaveMessage('Follow-up saved');
    } catch (error) {
      setSaveError(true);
      setSaveMessage(error instanceof Error ? error.message : 'Could not save follow-up details.');
    } finally {
      setSavingFollowUp(false);
    }
  }

  useEffect(() => {
    fetch(`${API}/api/admin/contacts`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setContacts(d.data ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!selected) return;
    let active = true;
    setActivityLoading(true);
    setActivityError('');
    fetch(`${API}/api/admin/contacts/${selected.id}/activity`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Could not load follow-up history.');
        return result;
      })
      .then(result => { if (active) setActivity(result.data ?? []); })
      .catch(error => {
        if (active) setActivityError(error instanceof Error ? error.message : 'Could not load follow-up history.');
      })
      .finally(() => { if (active) setActivityLoading(false); });
    return () => { active = false; };
  }, [selected?.id, token]);

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>Contacts</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6a82' }}>{filteredContacts.length} shown · {contacts.length} loaded</p>
        </div>

        <div className="mb-5 flex flex-wrap items-end gap-3">
          <label className="min-w-[220px] flex-1 text-xs font-medium" style={{ color: '#5a6a82' }}>
            Search contacts
            <span className="mt-1 flex items-center gap-2 rounded-lg border border-[#d8e0e7] bg-white px-3">
              <Search size={15} />
              <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, email, phone, or enquiry" className="min-w-0 flex-1 py-2.5 text-sm outline-none" />
            </span>
          </label>
          <label className="text-xs font-medium" style={{ color: '#5a6a82' }}>
            Status
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value as 'all' | FollowUpStatus)} className="mt-1 block w-full rounded-lg border border-[#d8e0e7] bg-white px-3 py-2.5 text-sm">
              <option value="all">All statuses</option>
              {followUpStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </label>
          <label className="text-xs font-medium" style={{ color: '#5a6a82' }}>
            From
            <input type="date" value={dateFrom} max={dateTo || undefined} onChange={event => setDateFrom(event.target.value)} className="mt-1 block rounded-lg border border-[#d8e0e7] bg-white px-3 py-2.5 text-sm" />
          </label>
          <label className="text-xs font-medium" style={{ color: '#5a6a82' }}>
            To
            <input type="date" value={dateTo} min={dateFrom || undefined} onChange={event => setDateTo(event.target.value)} className="mt-1 block rounded-lg border border-[#d8e0e7] bg-white px-3 py-2.5 text-sm" />
          </label>
          <button type="button" onClick={exportContacts} disabled={!filteredContacts.length} className="inline-flex items-center gap-2 rounded-lg border border-[#d8e0e7] bg-white px-3 py-2.5 text-sm font-semibold disabled:opacity-50" style={{ color: 'var(--izy-navy)' }}>
            <Download size={15} /> Export {filteredContacts.length ? `(${filteredContacts.length})` : ''}
          </button>
        </div>

        <div className="flex flex-col gap-6 xl:flex-row">
          {/* List */}
          <div className={`flex-1 overflow-hidden rounded-2xl bg-white shadow-sm ${selected ? 'hidden xl:block' : ''}`}>
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--izy-blue)', borderTopColor: 'transparent' }} />
              </div>
            ) : contacts.length === 0 ? (
              <p className="p-8 text-sm text-center" style={{ color: '#8fadc8' }}>No contact submissions yet</p>
            ) : filteredContacts.length === 0 ? (
              <p className="p-8 text-sm text-center" style={{ color: '#8fadc8' }}>No contacts match these filters</p>
            ) : (
              <div className="divide-y" style={{ borderColor: '#eef1f6' }}>
                {filteredContacts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => selectContact(c)}
                    className="w-full px-6 py-4 flex items-start gap-4 text-left transition-colors hover:bg-[#f8fafc]"
                    style={selected?.id === c.id ? { background: '#f0f6ff' } : {}}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'var(--izy-blue)' }}>
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--izy-navy)' }}>{c.name}</p>
                        <p className="text-xs flex-shrink-0" style={{ color: '#8fadc8' }}>{fmt(c.created_at)}</p>
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#5a6a82' }}>{c.subject || '(no subject)'}</p>
                      <span className="mt-2 inline-flex rounded-full bg-[#eef4fb] px-2 py-0.5 text-[10px] font-semibold capitalize" style={{ color: 'var(--izy-blue)' }}>
                        {followUpStatuses.find(status => status.value === c.status)?.label ?? 'New'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          {selected && (
            <div className="w-full flex-shrink-0 self-start rounded-2xl bg-white p-4 shadow-sm sm:p-6 xl:sticky xl:top-8 xl:w-96">
              <button type="button" onClick={() => setSelected(null)} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1a56db] xl:hidden">
                <ArrowLeft size={16} /> Back to contacts
              </button>
              {(() => {
                const whatsapp = selected.phone ? whatsappHref(selected) : null;
                return (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {selected.email && (
                      <a
                        href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.subject || 'Your enquiry'}`)}&body=${encodeURIComponent(`Hello ${selected.name},\n\nThank you for your enquiry.\n\nIZY Technologies`)}`}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white"
                        style={{ background: 'var(--izy-blue)' }}
                      >
                        <Mail size={14} /> Email
                      </a>
                    )}
                    {selected.phone && (
                      <a
                        href={`tel:${selected.phone}`}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#d8e0e7] px-3 py-2 text-xs font-semibold"
                        style={{ color: 'var(--izy-navy)' }}
                      >
                        <Phone size={14} /> Call
                      </a>
                    )}
                    {whatsapp && (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white"
                        style={{ background: '#168a57' }}
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    )}
                  </div>
                );
              })()}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--izy-blue)' }}>
                  {selected.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--izy-navy)' }}>{selected.name}</p>
                  {selected.email && <a href={`mailto:${selected.email}`} className="block text-xs" style={{ color: 'var(--izy-blue)' }}>{selected.email}</a>}
                  {selected.phone && <a href={`tel:${selected.phone}`} className="block text-xs" style={{ color: 'var(--izy-blue)' }}>{selected.phone}</a>}
                </div>
              </div>
              {selected.subject && (
                <div className="mb-3">
                  <p className="text-xs font-medium mb-1" style={{ color: '#5a6a82' }}>Subject</p>
                  <p className="text-sm" style={{ color: 'var(--izy-navy)' }}>{selected.subject}</p>
                </div>
              )}
              <div className="mb-4 space-y-4 border-y py-4" style={{ borderColor: '#eef1f6' }}>
                <label className="block text-xs font-medium" style={{ color: '#5a6a82' }}>
                  Follow-up status
                  <select
                    value={followUpStatus}
                    onChange={event => setFollowUpStatus(event.target.value as FollowUpStatus)}
                    disabled={savingFollowUp}
                    className="mt-1 block w-full rounded-lg border border-[#d8e0e7] bg-white px-3 py-2.5 text-sm"
                  >
                    {followUpStatuses.map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-medium" style={{ color: '#5a6a82' }}>
                  Internal notes
                  <textarea
                    rows={4}
                    maxLength={5000}
                    value={internalNotes}
                    onChange={event => setInternalNotes(event.target.value)}
                    disabled={savingFollowUp}
                    placeholder="Record calls, next steps, or context for your team"
                    className="mt-1 block w-full resize-y rounded-lg border border-[#d8e0e7] bg-white px-3 py-2.5 text-sm text-[#0d1b2e]"
                  />
                  <span className="mt-1 block text-[11px] font-normal">Private notes for your team.</span>
                </label>
                <div className="flex items-center justify-between gap-3">
                  <p role="status" aria-live="polite" className="text-xs" style={{ color: saveError ? '#b42318' : '#5a6a82' }}>
                    {saveMessage || `Updated ${fmt(selected.updated_at || selected.created_at)}`}
                  </p>
                  <button
                    type="button"
                    onClick={saveFollowUp}
                    disabled={savingFollowUp}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                    style={{ background: 'var(--izy-blue)' }}
                  >
                    <Save size={15} /> {savingFollowUp ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs font-medium mb-1" style={{ color: '#5a6a82' }}>Message</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--izy-navy)' }}>{selected.message}</p>
              </div>
              <section className="mt-5 border-t pt-4" style={{ borderColor: '#eef1f6' }} aria-label="Follow-up history">
                <div className="mb-3 flex items-center gap-2">
                  <History size={15} style={{ color: 'var(--izy-blue)' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--izy-navy)' }}>Follow-up history</h3>
                </div>
                {activityLoading ? (
                  <p className="text-xs" style={{ color: '#8fadc8' }}>Loading history…</p>
                ) : activityError ? (
                  <p role="alert" className="text-xs text-red-700">{activityError}</p>
                ) : activity.length === 0 ? (
                  <p className="text-xs" style={{ color: '#8fadc8' }}>No follow-up changes recorded yet.</p>
                ) : (
                  <ol className="space-y-3">
                    {activity.map(event => (
                      <li key={event.id} className="border-l-2 border-[#dce7f2] pl-3">
                        <p className="text-xs font-semibold" style={{ color: 'var(--izy-navy)' }}>
                          {event.event_type === 'status'
                            ? `Status: ${followUpStatuses.find(status => status.value === event.from_value)?.label ?? event.from_value} → ${followUpStatuses.find(status => status.value === event.to_value)?.label ?? event.to_value}`
                            : 'Internal notes updated'}
                        </p>
                        {event.event_type === 'note' && (
                          <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed" style={{ color: '#5a6a82' }}>
                            {event.to_value || 'Notes cleared'}
                          </p>
                        )}
                        <p className="mt-1 text-[10px]" style={{ color: '#8fadc8' }}>
                          {event.actor} · {fmt(event.created_at)}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
              <p className="text-xs" style={{ color: '#8fadc8' }}>{fmt(selected.created_at)}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
