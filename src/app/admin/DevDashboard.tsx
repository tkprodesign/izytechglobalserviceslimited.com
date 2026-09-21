import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { DevDashboardLayout } from './DevDashboardLayout';
import { getToken, removeToken } from '../../lib/auth';
import { ngDate } from '../../lib/ngtime';
import { useNavigate } from 'react-router';
import {
  Mail,
  FileText,
  TrendingUp,
  Clock,
  ClipboardCheck,
  ShoppingBag,
  ClipboardList,
  FolderOpen,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Server,
  Database,
  Activity,
  Terminal,
  Wrench,
  MessageSquare,
  Zap,
  FileOutput,
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

interface SystemInfo {
  uptime: number;
  nodeVersion: string;
  platform: string;
  memoryUsed: number;
  memoryTotal: number;
  env: string;
  dbConnected: boolean;
  configuredSecrets: Record<string, boolean>;
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: number | string; sub: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: '#5a6a82' }}>{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color: 'var(--izy-navy)' }}>{value}</p>
          <p className="text-xs mt-1" style={{ color: '#8fadc8' }}>{sub}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      {ok
        ? <CheckCircle size={14} style={{ color: 'var(--izy-green)' }} />
        : <XCircle size={14} style={{ color: 'var(--destructive)' }} />}
      <span className="text-xs" style={{ color: 'var(--izy-navy)' }}>{label}</span>
      <span className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{
        background: ok ? 'rgba(57,181,74,0.12)' : 'rgba(212,24,61,0.12)',
        color: ok ? 'var(--izy-green)' : 'var(--destructive)',
      }}>
        {ok ? 'OK' : 'DOWN'}
      </span>
    </div>
  );
}

function fmt(iso: string) {
  return ngDate(iso);
}

function fmtUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function fmtMem(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

const quickAccessItems = [
  { to: '/dev/services', label: 'Services Content', description: 'Manage service descriptions', icon: Wrench, color: '#f26522' },
  { to: '/dev/email', label: 'Email Manager', description: 'Monitor inbound email', icon: Mail, color: '#8b5cf6' },
  { to: '/dev/documents', label: 'Letterhead PDFs', description: 'Create branded reports', icon: FileOutput, color: '#f26522' },
  { to: '/admin/contacts', label: 'Contacts', description: 'Review incoming messages', icon: FileText, color: '#1d70c9' },
  { to: '/admin/quotes', label: 'Quote Requests', description: 'Follow up on opportunities', icon: ClipboardList, color: '#f26522' },
  { to: '/admin/assessments', label: 'Site Assessments', description: 'Track paid assessments', icon: ClipboardCheck, color: '#16a34a' },
  { to: '/admin/projects', label: 'Projects', description: 'Update published work', icon: FolderOpen, color: '#2563eb' },
  { to: '/admin/testimonials', label: 'Testimonials', description: 'Manage client reviews', icon: MessageSquare, color: '#db2777' },
  { to: '/admin/products', label: 'Store Products', description: 'Manage the catalogue', icon: ShoppingBag, color: '#0f766e' },
  { to: '/admin/enquiries', label: 'Store Enquiries', description: 'Respond to product interest', icon: ClipboardList, color: '#7c3aed' },
];

export function DevDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [apiHealth, setApiHealth] = useState<'loading' | 'ok' | 'error'>('loading');
  const [dbHealth, setDbHealth] = useState<'loading' | 'ok' | 'error'>('loading');
  const [loading, setLoading] = useState(true);
  const token = getToken();
  const navigate = useNavigate();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    // System health checks
    fetch(`${API}/api/health`)
      .then(r => r.ok ? setApiHealth('ok') : setApiHealth('error'))
      .catch(() => setApiHealth('error'));

    fetch(`${API}/api/health/db`)
      .then(r => r.ok ? setDbHealth('ok') : setDbHealth('error'))
      .catch(() => setDbHealth('error'));

    fetch(`${API}/api/dev/system`, { headers })
      .then(r => {
        if (r.status === 401 || r.status === 403) {
          removeToken();
          navigate('/dev/login');
          return null;
        }
        return r.json();
      })
      .then(d => { if (d && !d.error) setSystemInfo(d); })
      .catch(() => {});

    // Business stats
    Promise.all([
      fetch(`${API}/api/admin/stats`, { headers }).then(r => r.json()),
      fetch(`${API}/api/admin/contacts?limit=3`, { headers }).then(r => r.json()),
      fetch(`${API}/api/admin/quotes?limit=3`, { headers }).then(r => r.json()),
    ]).then(([s, c, q]) => {
      setStats(s);
      setContacts(c.data ?? []);
      setQuotes(q.data ?? []);
    }).finally(() => setLoading(false));
  }, [token, navigate]);

  const statusIcon = (s: 'loading' | 'ok' | 'error') =>
    s === 'loading' ? <AlertCircle size={14} style={{ color: '#ffc425' }} />
    : s === 'ok' ? <CheckCircle size={14} style={{ color: 'var(--izy-green)' }} />
    : <XCircle size={14} style={{ color: 'var(--destructive)' }} />;

  return (
    <DevDashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(242,101,34,0.15)' }}>
                <Eye size={16} style={{ color: '#f26522' }} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>Command Centre</h1>
            </div>
            <p className="text-sm" style={{ color: '#5a6a82' }}>System health, business metrics, and full platform access</p>
          </div>
          <div className="flex items-center gap-2">
            {statusIcon(apiHealth)}
            <span className="text-xs font-medium" style={{ color: 'var(--izy-navy)' }}>API</span>
            <span className="mx-1 text-gray-300">·</span>
            {statusIcon(dbHealth)}
            <span className="text-xs font-medium" style={{ color: 'var(--izy-navy)' }}>DB</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#f26522', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* System Health + Runtime */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
              {/* Service Health */}
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Server size={15} style={{ color: '#f26522' }} />
                  <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--izy-navy)' }}>Service Health</h2>
                </div>
                <div className="divide-y" style={{ borderColor: '#eef1f6' }}>
                  <StatusBadge ok={apiHealth === 'ok'} label="API Server" />
                  <StatusBadge ok={dbHealth === 'ok'} label="Neon PostgreSQL" />
                </div>
              </div>

              {/* Runtime */}
              {systemInfo && (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={15} style={{ color: '#f26522' }} />
                    <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--izy-navy)' }}>Runtime</h2>
                  </div>
                  <dl className="space-y-1.5">
                    {[
                      ['Node.js', systemInfo.nodeVersion],
                      ['Platform', systemInfo.platform],
                      ['Env', systemInfo.env],
                      ['Uptime', fmtUptime(systemInfo.uptime)],
                      ['Memory', fmtMem(systemInfo.memoryUsed)],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1.5 border-b last:border-0 text-xs" style={{ borderColor: '#eef1f6' }}>
                        <dt style={{ color: '#5a6a82' }}>{k}</dt>
                        <dd className="font-mono font-medium" style={{ color: 'var(--izy-navy)' }}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              {/* Secrets check */}
              {systemInfo?.configuredSecrets && (
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Database size={15} style={{ color: '#f26522' }} />
                    <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--izy-navy)' }}>Secrets</h2>
                  </div>
                  <div className="space-y-0.5 max-h-48 overflow-y-auto">
                    {Object.entries(systemInfo.configuredSecrets).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 py-1">
                        {v
                          ? <CheckCircle size={12} style={{ color: 'var(--izy-green)' }} />
                          : <XCircle size={12} style={{ color: 'var(--destructive)' }} />}
                        <span className="text-[11px] truncate" style={{ color: 'var(--izy-navy)' }}>{k}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Business Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={FileText} label="Contacts" value={stats?.contacts ?? 0} sub="All time" color="var(--izy-blue)" />
              <StatCard icon={ClipboardList} label="Quotes" value={stats?.quotes ?? 0} sub="All time" color="var(--izy-orange)" />
              <StatCard icon={TrendingUp} label="Contacts This Week" value={stats?.contactsThisWeek ?? 0} sub="Last 7 days" color="var(--izy-green)" />
              <StatCard icon={Clock} label="Quotes This Week" value={stats?.quotesThisWeek ?? 0} sub="Last 7 days" color="var(--izy-yellow)" />
            </div>

            {/* Full Platform Access */}
            <section className="mb-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold" style={{ color: 'var(--izy-navy)' }}>Full Platform Access</h2>
                  <p className="mt-1 text-sm" style={{ color: '#5a6a82' }}>
                    Complete access to all management areas.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent contacts */}
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#eef1f6' }}>
                  <h2 className="font-semibold text-sm" style={{ color: 'var(--izy-navy)' }}>Recent Contacts</h2>
                  <a href="/admin/contacts" className="text-xs font-medium" style={{ color: '#f26522' }}>View all →</a>
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
                  <a href="/admin/quotes" className="text-xs font-medium" style={{ color: '#f26522' }}>View all →</a>
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
            </div>
          </>
        )}
      </div>
    </DevDashboardLayout>
  );
}
