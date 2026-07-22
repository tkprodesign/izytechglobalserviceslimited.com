import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { getToken } from '../../lib/auth';
import { Package, MapPin, Building2, Phone, Mail, CheckCircle, Clock, XCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

interface EnquiryItem {
  id: number;
  name: string;
  tag: string;
  unit: string;
  quantity: number;
}

interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  company: string | null;
  location: string;
  message: string | null;
  items: EnquiryItem[];
  status: 'new' | 'reviewed' | 'closed';
  created_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string; icon: React.ElementType }> = {
  new:      { bg: 'rgba(240,162,14,0.12)', color: '#b97c08', label: 'New',      icon: Clock },
  reviewed: { bg: 'rgba(59,130,246,0.12)', color: '#1d4ed8', label: 'Reviewed', icon: CheckCircle },
  closed:   { bg: 'rgba(100,116,139,0.12)', color: '#475569', label: 'Closed', icon: XCircle },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function StoreEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [updating, setUpdating] = useState(false);
  const token = getToken();

  function load() {
    fetch(`${API}/api/admin/store/enquiries`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setEnquiries(d.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [token]);

  async function setStatus(enquiry: Enquiry, status: string) {
    setUpdating(true);
    await fetch(`${API}/api/admin/store/enquiries/${enquiry.id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    const updated = { ...enquiry, status: status as Enquiry['status'] };
    setEnquiries(prev => prev.map(e => e.id === enquiry.id ? updated : e));
    setSelected(updated);
    setUpdating(false);
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>Store Enquiries</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6a82' }}>{enquiries.length} total enquiries</p>
        </div>

        <div className="flex gap-6">
          {/* List */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--izy-blue)', borderTopColor: 'transparent' }} />
              </div>
            ) : enquiries.length === 0 ? (
              <p className="p-8 text-sm text-center" style={{ color: '#8fadc8' }}>No store enquiries yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: '#eef1f6' }}>
                {enquiries.map(e => {
                  const s = STATUS_STYLES[e.status] ?? STATUS_STYLES.new;
                  const Icon = s.icon;
                  return (
                    <button
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className="w-full px-6 py-4 flex items-start gap-4 text-left transition-colors hover:bg-[#f8fafc]"
                      style={selected?.id === e.id ? { background: '#f0f6ff' } : {}}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'var(--izy-blue)' }}>
                        {e.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="font-medium text-sm truncate" style={{ color: 'var(--izy-navy)' }}>{e.name}</p>
                          <p className="text-xs flex-shrink-0" style={{ color: '#8fadc8' }}>{fmt(e.created_at)}</p>
                        </div>
                        <p className="text-xs truncate mt-0.5" style={{ color: '#5a6a82' }}>
                          {e.items.length} product{e.items.length !== 1 ? 's' : ''} · {e.location}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: s.bg, color: s.color }}>
                        <Icon size={10} /> {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail */}
          {selected && (() => {
            const s = STATUS_STYLES[selected.status] ?? STATUS_STYLES.new;
            return (
              <div className="w-[420px] flex-shrink-0 bg-white rounded-2xl shadow-sm p-6 self-start sticky top-8 space-y-5">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--izy-blue)' }}>
                    {selected.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--izy-navy)' }}>{selected.name}</p>
                    <p className="text-xs" style={{ color: '#8fadc8' }}>{fmt(selected.created_at)}</p>
                  </div>
                </div>

                {/* Contact details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: '#f8fafc', color: 'var(--izy-navy)' }}>
                    <Mail size={13} style={{ color: 'var(--izy-blue)' }} /> <span className="truncate">{selected.email}</span>
                  </a>
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: '#f8fafc', color: 'var(--izy-navy)' }}>
                    <Phone size={13} style={{ color: 'var(--izy-blue)' }} /> <span className="truncate">{selected.phone}</span>
                  </a>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: '#f8fafc', color: 'var(--izy-navy)' }}>
                    <MapPin size={13} style={{ color: 'var(--izy-blue)' }} /> <span className="truncate">{selected.location}</span>
                  </div>
                  {selected.company && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: '#f8fafc', color: 'var(--izy-navy)' }}>
                      <Building2 size={13} style={{ color: 'var(--izy-blue)' }} /> <span className="truncate">{selected.company}</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#5a6a82' }}>Products requested</p>
                  <div className="space-y-2">
                    {selected.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#f8fafc' }}>
                        <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(240,162,14,0.1)' }}>
                          <Package size={14} style={{ color: '#F0A20E' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--izy-navy)' }}>{item.name}</p>
                          <p className="text-[11px]" style={{ color: '#8fadc8' }}>{item.tag} · {item.unit}</p>
                        </div>
                        <span className="text-xs font-bold flex-shrink-0" style={{ color: 'var(--izy-navy)' }}>×{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selected.message && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#5a6a82' }}>Notes</p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--izy-navy)' }}>{selected.message}</p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#5a6a82' }}>Status</p>
                  <div className="flex gap-2">
                    {(['new', 'reviewed', 'closed'] as const).map(st => {
                      const ss = STATUS_STYLES[st];
                      const SIcon = ss.icon;
                      return (
                        <button
                          key={st}
                          disabled={updating || selected.status === st}
                          onClick={() => setStatus(selected, st)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all disabled:opacity-60"
                          style={{
                            background: selected.status === st ? ss.bg : '#f8fafc',
                            color: selected.status === st ? ss.color : '#8fadc8',
                            border: selected.status === st ? `1.5px solid ${ss.color}40` : '1.5px solid #eef1f6',
                          }}
                        >
                          <SIcon size={11} /> {ss.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <a
                  href={`mailto:${selected.email}?subject=Re: Your IZY Store Enquiry&body=Dear ${encodeURIComponent(selected.name)},%0A%0AThank you for your interest in our products.`}
                  className="w-full flex items-center justify-center py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--izy-blue)' }}
                >
                  Reply via email
                </a>
              </div>
            );
          })()}
        </div>
      </div>
    </DashboardLayout>
  );
}
