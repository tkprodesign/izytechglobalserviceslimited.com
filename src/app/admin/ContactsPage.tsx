import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { getToken } from '../../lib/auth';
import { ngDateTime } from '../../lib/ngtime';
import { Save } from 'lucide-react';

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

function fmt(iso: string) {
  return ngDateTime(iso);
}

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [followUpStatus, setFollowUpStatus] = useState<FollowUpStatus>('new');
  const [internalNotes, setInternalNotes] = useState('');
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState(false);
  const token = getToken();

  function selectContact(contact: Contact) {
    setSelected(contact);
    setFollowUpStatus(contact.status ?? 'new');
    setInternalNotes(contact.internal_notes ?? '');
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

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>Contacts</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6a82' }}>{contacts.length} total submissions</p>
        </div>

        <div className="flex gap-6">
          {/* List */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--izy-blue)', borderTopColor: 'transparent' }} />
              </div>
            ) : contacts.length === 0 ? (
              <p className="p-8 text-sm text-center" style={{ color: '#8fadc8' }}>No contact submissions yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: '#eef1f6' }}>
                {contacts.map(c => (
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
            <div className="w-96 flex-shrink-0 bg-white rounded-2xl shadow-sm p-6 self-start sticky top-8">
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
              <p className="text-xs" style={{ color: '#8fadc8' }}>{fmt(selected.created_at)}</p>
              {selected.email && <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || 'Your enquiry')}`}
                className="mt-4 w-full flex items-center justify-center py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--izy-blue)' }}
              >
                Reply via email
              </a>}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
