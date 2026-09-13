import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { DashboardLayout } from './DashboardLayout';
import { getToken } from '../../lib/auth';
import {
  Mail,
  FileText,
  TrendingUp,
  Clock,
  ClipboardCheck,
  ShoppingBag,
  ClipboardList,
  FolderOpen,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

interface Stats {
  contacts: number;
  quotes: number;
  contactsThisWeek: number;
  quotesThisWeek: number;
}

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface Quote {
  id: number;
  name: string;
  email: string;
  company: string;
  service: string;
  details: string;
  created_at: string;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number; sub: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: '#5a6a82' }}>{label}</p>
          <p className="text-3xl font-bold mt-1" style={{ color: 'var(--izy-navy)' }}>{value}</p>
          <p className="text-xs mt-1" style={{ color: '#8fadc8' }}>{sub}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const quickAccessItems = [
  { to: '/admin/contacts', label: 'Contacts', description: 'Review incoming messages', icon: Mail, color: '#1d70c9' },
  { to: '/admin/quotes', label: 'Quote Requests', description: 'Follow up on new opportunities', icon: FileText, color: '#f26522' },
  { to: '/admin/assessments', label: 'Site Assessments', description: 'Track paid assessments', icon: ClipboardCheck, color: '#16a34a' },
  { to: '/admin/enquiries', label: 'Store Enquiries', description: 'Respond to product interest', icon: ClipboardList, color: '#8b5cf6' },
  { to: '/admin/products', label: 'Store Products', description: 'Manage the product catalogue', icon: ShoppingBag, color: '#0f766e' },
  { to: '/admin/projects', label: 'Projects', description: 'Update published work', icon: FolderOpen, color: '#2563eb' },
  { to: '/admin/invoices', label: 'Invoices', description: 'Create and send invoices', icon: Receipt, color: '#b45309' },
];

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/api/admin/stats`, { headers }).then(r => r.json()),
      fetch(`${API}/api/admin/contacts?limit=5`, { headers }).then(r => r.json()),
      fetch(`${API}/api/admin/quotes?limit=5`, { headers }).then(r => r.json()),
    ]).then(([s, c, q]) => {
      setStats(s);
      setContacts(c.data ?? []);
      setQuotes(q.data ?? []);
    }).finally(() => setLoading(false));
  }, [token]);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6a82' }}>Overview of incoming contacts and quote requests</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--izy-blue)', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Mail} label="Total Contacts" value={stats?.contacts ?? 0} sub="All time" color="var(--izy-blue)" />
              <StatCard icon={FileText} label="Quote Requests" value={stats?.quotes ?? 0} sub="All time" color="var(--izy-orange)" />
              <StatCard icon={TrendingUp} label="Contacts This Week" value={stats?.contactsThisWeek ?? 0} sub="Last 7 days" color="var(--izy-green)" />
              <StatCard icon={Clock} label="Quotes This Week" value={stats?.quotesThisWeek ?? 0} sub="Last 7 days" color="var(--izy-yellow)" />
            </div>

            {/* CEO shortcuts */}
            <section className="mb-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold" style={{ color: 'var(--izy-navy)' }}>Quick access</h2>
                  <p className="mt-1 text-sm" style={{ color: '#5a6a82' }}>
                    Go straight to the areas you manage most.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {quickAccessItems.map(({ to, label, description, icon: Icon, color }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ '--tw-ring-color': color } as React.CSSProperties}
                  >
                    <span
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${color}16`, color }}
                    >
                      <Icon size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold" style={{ color: 'var(--izy-navy)' }}>{label}</span>
                      <span className="mt-0.5 block truncate text-xs" style={{ color: '#8fadc8' }}>{description}</span>
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="flex-shrink-0 opacity-40 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                      style={{ color }}
                    />
                  </Link>
                ))}
              </div>
            </section>

            {/* Recent contacts */}
            <div className="bg-white rounded-2xl shadow-sm mb-6">
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#eef1f6' }}>
                <h2 className="font-semibold text-sm" style={{ color: 'var(--izy-navy)' }}>Recent Contacts</h2>
                <a href="/admin/contacts" className="text-xs font-medium" style={{ color: 'var(--izy-blue)' }}>View all →</a>
              </div>
              <div className="divide-y" style={{ borderColor: '#eef1f6' }}>
                {contacts.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-center" style={{ color: '#8fadc8' }}>No contacts yet</p>
                ) : contacts.map(c => (
                  <div key={c.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'var(--izy-blue)' }}>
                      {c.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="font-medium text-sm" style={{ color: 'var(--izy-navy)' }}>{c.name}</p>
                        <p className="text-xs" style={{ color: '#8fadc8' }}>{c.email}</p>
                      </div>
                      <p className="text-xs mt-0.5 truncate" style={{ color: '#5a6a82' }}>{c.subject || c.message}</p>
                    </div>
                    <p className="text-xs flex-shrink-0" style={{ color: '#8fadc8' }}>{fmt(c.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent quotes */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#eef1f6' }}>
                <h2 className="font-semibold text-sm" style={{ color: 'var(--izy-navy)' }}>Recent Quote Requests</h2>
                <a href="/admin/quotes" className="text-xs font-medium" style={{ color: 'var(--izy-blue)' }}>View all →</a>
              </div>
              <div className="divide-y" style={{ borderColor: '#eef1f6' }}>
                {quotes.length === 0 ? (
                  <p className="px-6 py-8 text-sm text-center" style={{ color: '#8fadc8' }}>No quote requests yet</p>
                ) : quotes.map(q => (
                  <div key={q.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'var(--izy-orange)' }}>
                      {q.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <p className="font-medium text-sm" style={{ color: 'var(--izy-navy)' }}>{q.name}</p>
                        {q.company && <p className="text-xs" style={{ color: '#8fadc8' }}>{q.company}</p>}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#5a6a82' }}>{q.service}</p>
                    </div>
                    <p className="text-xs flex-shrink-0" style={{ color: '#8fadc8' }}>{fmt(q.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
