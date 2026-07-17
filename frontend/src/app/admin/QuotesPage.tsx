import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { getToken } from '../../lib/auth';

const API = import.meta.env.VITE_API_URL ?? '';

interface Quote {
  id: number;
  name: string;
  email: string;
  company: string;
  service: string;
  details: string;
  created_at: string;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Quote | null>(null);
  const token = getToken();

  useEffect(() => {
    fetch(`${API}/api/admin/quotes`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setQuotes(d.data ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>Quote Requests</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6a82' }}>{quotes.length} total requests</p>
        </div>

        <div className="flex gap-6">
          <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--izy-orange)', borderTopColor: 'transparent' }} />
              </div>
            ) : quotes.length === 0 ? (
              <p className="p-8 text-sm text-center" style={{ color: '#8fadc8' }}>No quote requests yet</p>
            ) : (
              <div className="divide-y" style={{ borderColor: '#eef1f6' }}>
                {quotes.map(q => (
                  <button
                    key={q.id}
                    onClick={() => setSelected(q)}
                    className="w-full px-6 py-4 flex items-start gap-4 text-left transition-colors hover:bg-[#f8fafc]"
                    style={selected?.id === q.id ? { background: '#fff7f0' } : {}}
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'var(--izy-orange)' }}>
                      {q.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--izy-navy)' }}>{q.name}</p>
                        <p className="text-xs flex-shrink-0" style={{ color: '#8fadc8' }}>{fmt(q.created_at)}</p>
                      </div>
                      <p className="text-xs truncate mt-0.5" style={{ color: '#5a6a82' }}>{q.service}{q.company ? ` · ${q.company}` : ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <div className="w-96 flex-shrink-0 bg-white rounded-2xl shadow-sm p-6 self-start sticky top-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'var(--izy-orange)' }}>
                  {selected.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--izy-navy)' }}>{selected.name}</p>
                  <a href={`mailto:${selected.email}`} className="text-xs" style={{ color: 'var(--izy-blue)' }}>{selected.email}</a>
                </div>
              </div>
              {selected.company && (
                <div className="mb-3">
                  <p className="text-xs font-medium mb-1" style={{ color: '#5a6a82' }}>Company</p>
                  <p className="text-sm" style={{ color: 'var(--izy-navy)' }}>{selected.company}</p>
                </div>
              )}
              <div className="mb-3">
                <p className="text-xs font-medium mb-1" style={{ color: '#5a6a82' }}>Service Required</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: 'var(--izy-orange)' }}>
                  {selected.service}
                </span>
              </div>
              {selected.details && (
                <div className="mb-4">
                  <p className="text-xs font-medium mb-1" style={{ color: '#5a6a82' }}>Details</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--izy-navy)' }}>{selected.details}</p>
                </div>
              )}
              <p className="text-xs" style={{ color: '#8fadc8' }}>{fmt(selected.created_at)}</p>
              <a
                href={`mailto:${selected.email}?subject=Re: Quote Request - ${encodeURIComponent(selected.service)}`}
                className="mt-4 w-full flex items-center justify-center py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--izy-orange)' }}
              >
                Reply via email
              </a>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
