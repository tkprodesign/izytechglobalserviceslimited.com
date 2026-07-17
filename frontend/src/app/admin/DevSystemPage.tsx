import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { DashboardLayout } from './DashboardLayout';
import { getToken, removeToken } from '../../lib/auth';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

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

function StatusDot({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5 py-3 border-b last:border-0" style={{ borderColor: '#eef1f6' }}>
      {ok
        ? <CheckCircle size={16} style={{ color: 'var(--izy-green)' }} />
        : <XCircle size={16} style={{ color: 'var(--destructive)' }} />}
      <span className="text-sm" style={{ color: 'var(--izy-navy)' }}>{label}</span>
      <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full" style={{
        background: ok ? 'rgba(57,181,74,0.12)' : 'rgba(212,24,61,0.12)',
        color: ok ? 'var(--izy-green)' : 'var(--destructive)',
      }}>
        {ok ? 'OK' : 'Missing'}
      </span>
    </div>
  );
}

function fmtUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

function fmtMem(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export function DevSystemPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [apiHealth, setApiHealth] = useState<'loading' | 'ok' | 'error'>('loading');
  const [dbHealth, setDbHealth] = useState<'loading' | 'ok' | 'error'>('loading');
  const token = getToken();
  const navigate = useNavigate();

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

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
      .then(d => { if (d && !d.error) setInfo(d); })
      .catch(() => {});
  }, [token]);

  const statusIcon = (s: 'loading' | 'ok' | 'error') =>
    s === 'loading' ? <AlertCircle size={16} style={{ color: '#ffc425' }} />
    : s === 'ok' ? <CheckCircle size={16} style={{ color: 'var(--izy-green)' }} />
    : <XCircle size={16} style={{ color: 'var(--destructive)' }} />;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>System Status</h1>
          <p className="text-sm mt-1" style={{ color: '#5a6a82' }}>Developer-only view — live infrastructure health</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Health */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--izy-navy)' }}>Service Health</h2>
            <div className="space-y-0">
              <div className="flex items-center gap-2.5 py-3 border-b" style={{ borderColor: '#eef1f6' }}>
                {statusIcon(apiHealth)}
                <span className="text-sm" style={{ color: 'var(--izy-navy)' }}>API server</span>
                <span className="ml-auto text-xs" style={{ color: '#8fadc8' }}>{API || 'localhost'}</span>
              </div>
              <div className="flex items-center gap-2.5 py-3">
                {statusIcon(dbHealth)}
                <span className="text-sm" style={{ color: 'var(--izy-navy)' }}>Neon PostgreSQL</span>
                <span className="ml-auto text-xs" style={{ color: '#8fadc8' }}>DATABASE_URL</span>
              </div>
            </div>
          </div>

          {/* Runtime */}
          {info && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--izy-navy)' }}>Runtime</h2>
              <dl className="space-y-2">
                {[
                  ['Node.js', info.nodeVersion],
                  ['Platform', info.platform],
                  ['Environment', info.env],
                  ['Uptime', fmtUptime(info.uptime)],
                  ['Memory used', fmtMem(info.memoryUsed)],
                  ['Memory total', fmtMem(info.memoryTotal)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b last:border-0 text-sm" style={{ borderColor: '#eef1f6' }}>
                    <dt style={{ color: '#5a6a82' }}>{k}</dt>
                    <dd className="font-mono text-xs font-medium" style={{ color: 'var(--izy-navy)' }}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Secrets check */}
          {info?.configuredSecrets && (
            <div className="bg-white rounded-2xl shadow-sm p-6 lg:col-span-2">
              <h2 className="font-semibold text-sm mb-4" style={{ color: 'var(--izy-navy)' }}>Environment Secrets</h2>
              <div className="grid grid-cols-2 gap-x-8">
                <div>
                  {Object.entries(info.configuredSecrets).slice(0, Math.ceil(Object.entries(info.configuredSecrets).length / 2)).map(([k, v]) => (
                    <StatusDot key={k} ok={v} label={k} />
                  ))}
                </div>
                <div>
                  {Object.entries(info.configuredSecrets).slice(Math.ceil(Object.entries(info.configuredSecrets).length / 2)).map(([k, v]) => (
                    <StatusDot key={k} ok={v} label={k} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
