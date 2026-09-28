import { useState } from 'react';
import { useNavigate } from 'react-router';
import { saveToken, parseToken } from '../../lib/auth';
import logoIcon from '../../imports/izy-technologies_icon_v1.png';
import { Eye, EyeOff } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      saveToken(data.token);
      const user = parseToken(data.token);
      navigate(user?.role === 'developer' ? '/dev/dashboard' : '/admin/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--izy-navy)' }}>
      <div className="w-full max-w-md px-8">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--izy-blue)' }}>
              <img src={logoIcon} alt="Izy Tech" className="h-full w-full rounded-xl object-cover" />
            </div>
            <span className="text-white font-semibold text-xl">Control Panel</span>
          </div>
          <p className="text-sm" style={{ color: '#8fadc8' }}>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#a8c0d6' }}>
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg text-white text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              placeholder="you@izytechglobalservices.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#a8c0d6' }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg px-4 py-3 pr-12 text-sm text-white outline-none transition-all focus:ring-2 focus:ring-[#1d70c9]/60"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#8fadc8] transition hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1d70c9]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(212,24,61,0.15)', color: '#f87171' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white text-sm transition-opacity disabled:opacity-60"
            style={{ background: 'var(--izy-blue)' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
