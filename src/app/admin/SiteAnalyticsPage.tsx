import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Activity,
  BarChart3,
  Clock3,
  Globe2,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Tablet,
  Users,
} from 'lucide-react';
import { DevDashboardLayout } from './DevDashboardLayout';
import { getToken, removeToken } from '../../lib/auth';
import { ngDateTime } from '../../lib/ngtime';

const API = import.meta.env.VITE_API_URL ?? '';

interface CountRow {
  label: string;
  visits: number;
}

interface DailyRow {
  day: string;
  visits: number;
  session_groups: number;
}

interface RecentVisit {
  visited_at: string;
  route: string;
  referrer_origin: string | null;
  device_type: string;
  browser_family: string;
  os_family: string;
  language: string | null;
  timezone: string | null;
  screen_bucket: string | null;
  viewport_bucket: string | null;
  connection_type: string | null;
}

interface AnalyticsReport {
  range: { days: number; since: string };
  summary: { visits: number; session_groups: number };
  daily: DailyRow[];
  routes: CountRow[];
  devices: CountRow[];
  browsers: CountRow[];
  operatingSystems: CountRow[];
  referrers: CountRow[];
  recent: RecentVisit[];
  privacy: {
    consentVersion: string;
    stored: string[];
    notStored: string[];
  };
}

interface OnlineVisitor {
  last_seen: string;
  route: string;
  device_type: string;
  browser_family: string;
  os_family: string;
  language: string | null;
  timezone: string | null;
  screen_bucket: string | null;
  viewport_bucket: string | null;
  connection_type: string | null;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  detail: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5a6a82]">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[#041627]">{value}</p>
          <p className="mt-1 text-xs text-[#8fadc8]">{detail}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}18`, color }}>
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
}

function Distribution({ title, rows, icon: Icon }: { title: string; rows: CountRow[]; icon: React.ElementType }) {
  const max = Math.max(...rows.map(row => row.visits), 1);
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={16} className="text-[#f26522]" />
        <h2 className="text-sm font-semibold text-[#041627]">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="py-4 text-sm text-[#8fadc8]">No visit data in this period.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(row => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-[#5a6a82]">{row.label}</span>
                <span className="shrink-0 font-semibold text-[#041627]">{row.visits}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#eef1f6]">
                <div
                  className="h-full rounded-full bg-[#f26522] transition-all"
                  style={{ width: `${Math.max((row.visits / max) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function dayLabel(value: string) {
  const date = new Date(`${value}T00:00:00+01:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

export function SiteAnalyticsPage() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const [onlineVisitors, setOnlineVisitors] = useState<OnlineVisitor[]>([]);
  const [onlineError, setOnlineError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const token = getToken();
  const navigate = useNavigate();

  const load = useCallback(async (range: number, initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/dev/analytics?days=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        removeToken();
        navigate('/dev/login');
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load analytics');
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, token]);

  const loadOnline = useCallback(async () => {
    setOnlineError('');
    try {
      const response = await fetch(`${API}/api/dev/analytics/online`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401 || response.status === 403) {
        removeToken();
        navigate('/dev/login');
        return;
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load current users');
      setOnlineCount(Number(data.online) || 0);
      setOnlineVisitors(Array.isArray(data.visitors) ? data.visitors : []);
    } catch (err) {
      setOnlineError(err instanceof Error ? err.message : 'Unable to load current users');
    }
  }, [navigate, token]);

  useEffect(() => {
    load(days, true);
  }, [days, load]);

  useEffect(() => {
    loadOnline();
    const timer = window.setInterval(loadOnline, 30_000);
    return () => window.clearInterval(timer);
  }, [loadOnline]);

  return (
    <DevDashboardLayout>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f26522]/15">
                <Activity size={16} className="text-[#f26522]" />
              </div>
              <h1 className="text-2xl font-bold text-[#041627]">Site Analytics</h1>
            </div>
            <p className="max-w-2xl text-sm text-[#5a6a82]">
              Privacy-safe, consent-based visit trends for the public site. Session groups rotate daily and are not persistent visitor identities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="analytics-range" className="text-xs font-medium text-[#5a6a82]">Range</label>
            <select
              id="analytics-range"
              value={days}
              onChange={event => setDays(Number(event.target.value))}
              className="rounded-lg border border-[#dfe5ee] bg-white px-3 py-2 text-sm text-[#041627] outline-none focus:border-[#f26522]"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              type="button"
              onClick={() => load(days)}
              disabled={refreshing || loading}
              title="Refresh analytics"
              className="rounded-lg border border-[#dfe5ee] bg-white p-2 text-[#5a6a82] transition hover:border-[#f26522] hover:text-[#f26522] disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(item => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/70" />)}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">{error}</div>
        ) : report ? (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard icon={Users} label="Currently online" value={onlineCount ?? '—'} detail="Consent-based, last 2 minutes" color="#16803c" />
              <MetricCard icon={Activity} label="Recorded visits" value={report.summary.visits} detail={`Last ${report.range.days} days`} color="#f26522" />
              <MetricCard icon={Users} label="Session groups" value={report.summary.session_groups} detail="Daily-rotated, not persistent" color="#1d70c9" />
              <MetricCard icon={Globe2} label="Routes reached" value={report.routes.length} detail="Top routes shown below" color="#16a34a" />
              <MetricCard icon={Clock3} label="Latest visit" value={report.recent[0] ? ngDateTime(report.recent[0].visited_at) : '—'} detail="Nigeria time (WAT)" color="#8b5cf6" />
            </div>

            <section className="mb-6 overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="flex flex-col gap-1 border-b border-[#eef1f6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#041627]">Currently online</h2>
                  <p className="mt-1 text-xs text-[#8fadc8]">All consented visitors with a heartbeat in the last 2 minutes. Refreshes every 30 seconds.</p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#eaf7ef] px-3 py-1 text-xs font-semibold text-[#16803c]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#16803c]" />
                  {onlineCount ?? '—'} online
                </span>
              </div>
              {onlineError ? (
                <p className="px-5 py-4 text-sm text-red-700">{onlineError}</p>
              ) : onlineVisitors.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-[#8fadc8]">No consented visitors are online right now.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-xs">
                    <thead className="bg-[#f8fafc] text-[10px] uppercase tracking-wide text-[#8fadc8]">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Last signal</th>
                        <th className="px-5 py-3 font-semibold">Route</th>
                        <th className="px-5 py-3 font-semibold">Device</th>
                        <th className="px-5 py-3 font-semibold">Browser / OS</th>
                        <th className="px-5 py-3 font-semibold">Language / zone</th>
                        <th className="px-5 py-3 font-semibold">Network</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eef1f6]">
                      {onlineVisitors.map((visitor, index) => (
                        <tr key={`${visitor.last_seen}-${visitor.route}-${index}`} className="text-[#5a6a82]">
                          <td className="whitespace-nowrap px-5 py-3 text-[#041627]">{ngDateTime(visitor.last_seen)}</td>
                          <td className="px-5 py-3 font-mono text-[#041627]">{visitor.route}</td>
                          <td className="px-5 py-3 capitalize">{visitor.device_type}<br /><span className="text-[10px] text-[#8fadc8]">{visitor.viewport_bucket || '—'} viewport</span></td>
                          <td className="px-5 py-3">{visitor.browser_family}<br /><span className="text-[10px] text-[#8fadc8]">{visitor.os_family}</span></td>
                          <td className="px-5 py-3">{visitor.language || '—'}<br /><span className="text-[10px] text-[#8fadc8]">{visitor.timezone || '—'}</span></td>
                          <td className="px-5 py-3">{visitor.connection_type || 'network n/a'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <section className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#f26522]" />
                  <h2 className="text-sm font-semibold text-[#041627]">Visits by day</h2>
                </div>
                {report.daily.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#8fadc8]">No consented visits in this period.</p>
                ) : (
                  <div className="flex h-48 items-end gap-1.5 overflow-x-auto border-b border-[#eef1f6] pb-6">
                    {report.daily.map(row => {
                      const max = Math.max(...report.daily.map(item => item.visits), 1);
                      return (
                        <div key={row.day} className="flex h-full min-w-[28px] flex-1 flex-col items-center justify-end gap-2">
                          <span className="text-[10px] font-semibold text-[#5a6a82]">{row.visits}</span>
                          <div className="w-full rounded-t-md bg-[#f26522] transition-all" style={{ height: `${Math.max((row.visits / max) * 100, 4)}%` }} />
                          <span className="whitespace-nowrap text-[9px] text-[#8fadc8]">{dayLabel(row.day)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
              <Distribution title="Top routes" rows={report.routes} icon={Globe2} />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
              <Distribution title="Device type" rows={report.devices} icon={Smartphone} />
              <Distribution title="Browser family" rows={report.browsers} icon={Monitor} />
              <Distribution title="Operating system" rows={report.operatingSystems} icon={Tablet} />
            </div>

            <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <Distribution title="Referrer origins" rows={report.referrers} icon={Globe2} />
              <section className="rounded-2xl border border-[#d9e8df] bg-[#f5fbf7] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck size={17} className="text-[#16803c]" />
                  <h2 className="text-sm font-semibold text-[#123b23]">Collection boundaries</h2>
                </div>
                <p className="mb-4 text-xs leading-relaxed text-[#42624d]">
                  Visits are recorded only after the visitor chooses “Allow analytics”. This dashboard is operational reporting, not an identity or advertising profile.
                </p>
                <div className="grid gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <p className="mb-1 font-semibold text-[#16803c]">Stored</p>
                    {report.privacy.stored.map(item => <p key={item} className="text-[#42624d]">• {item}</p>)}
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-[#16803c]">Not stored</p>
                    {report.privacy.notStored.map(item => <p key={item} className="text-[#42624d]">• {item}</p>)}
                  </div>
                </div>
              </section>
            </div>

            <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b border-[#eef1f6] px-5 py-4">
                <h2 className="text-sm font-semibold text-[#041627]">Recent visits</h2>
                <p className="mt-1 text-xs text-[#8fadc8]">Coarse technical details only; session hashes are never shown.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-[#f8fafc] text-[10px] uppercase tracking-wide text-[#8fadc8]">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Time</th>
                      <th className="px-5 py-3 font-semibold">Route</th>
                      <th className="px-5 py-3 font-semibold">Device</th>
                      <th className="px-5 py-3 font-semibold">Browser / OS</th>
                      <th className="px-5 py-3 font-semibold">Language / zone</th>
                      <th className="px-5 py-3 font-semibold">Referrer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef1f6]">
                    {report.recent.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-[#8fadc8]">No visits recorded yet.</td></tr>
                    ) : report.recent.map((visit, index) => (
                      <tr key={`${visit.visited_at}-${visit.route}-${index}`} className="text-[#5a6a82]">
                        <td className="whitespace-nowrap px-5 py-3 text-[#041627]">{ngDateTime(visit.visited_at)}</td>
                        <td className="px-5 py-3 font-mono text-[#041627]">{visit.route}</td>
                        <td className="px-5 py-3 capitalize">{visit.device_type}<br /><span className="text-[10px] text-[#8fadc8]">{visit.viewport_bucket || '—'} viewport</span></td>
                        <td className="px-5 py-3">{visit.browser_family}<br /><span className="text-[10px] text-[#8fadc8]">{visit.os_family}</span></td>
                        <td className="px-5 py-3">{visit.language || '—'}<br /><span className="text-[10px] text-[#8fadc8]">{visit.timezone || '—'} · {visit.connection_type || 'network n/a'}</span></td>
                        <td className="max-w-[190px] truncate px-5 py-3" title={visit.referrer_origin || 'Direct / none'}>{visit.referrer_origin || 'Direct / none'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </DevDashboardLayout>
  );
}