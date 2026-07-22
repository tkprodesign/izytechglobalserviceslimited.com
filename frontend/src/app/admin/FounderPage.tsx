import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { DashboardLayout } from './DashboardLayout';
import { getToken, removeToken } from '../../lib/auth';
import { Loader2, AlertCircle, CheckCircle, User } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

interface FounderData {
  name: string;
  title: string;
  bio: string;
  photo_url: string;
}

const inputCls = 'w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all border border-[#dce8ff] focus:border-blue-400 focus:ring-2 focus:ring-blue-100';
const inputStyle = { color: '#041627', background: '#fff' };

export function FounderPage() {
  const token = getToken();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [form, setForm] = useState<FounderData>({ name: '', title: '', bio: '', photo_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUnauth = () => { removeToken(); navigate('/admin/login'); };

  useEffect(() => {
    fetch(`${API}/api/admin/founder`, { headers })
      .then(r => {
        if (r.status === 401 || r.status === 403) { handleUnauth(); return null; }
        return r.json();
      })
      .then(d => {
        if (d?.data) setForm({ name: d.data.name, title: d.data.title, bio: d.data.bio, photo_url: d.data.photo_url });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await fetch(`${API}/api/admin/founder`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to save');
      setSuccess('Founder profile saved successfully.');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#041627]" style={{ fontFamily: 'var(--font-display)' }}>
            Founder Profile
          </h1>
          <p className="text-sm text-[#5a6a82] mt-1">
            This information appears in the About section of the public site.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={24} className="animate-spin" style={{ color: '#1a56db' }} />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Photo preview */}
            <div className="flex items-center gap-6 p-5 bg-white border border-[#eef1f6] rounded-xl">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: 'rgba(240,162,14,0.1)', border: '2px dashed rgba(240,162,14,0.4)' }}
              >
                {form.photo_url ? (
                  <img src={form.photo_url} alt="Founder" className="w-full h-full object-cover object-top" />
                ) : (
                  <User size={28} style={{ color: 'rgba(240,162,14,0.6)' }} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#041627]">{form.name || 'Founder Name'}</p>
                <p className="text-xs text-[#5a6a82]">{form.title || 'Title'}</p>
                <p className="text-xs text-[#8fadc8] mt-1">
                  {form.photo_url ? 'Photo linked' : 'No photo set yet — paste a URL below'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#5a6a82]">Full Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Israel Ideozu"
                className={inputCls} style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#5a6a82]">Title / Role</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Founder & Chief Executive Officer"
                className={inputCls} style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#5a6a82]">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="A short biography of the founder..."
                rows={7}
                className={inputCls + ' resize-none'} style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#5a6a82]">
                Photo URL{' '}
                <span className="font-normal text-[#8fadc8]">
                  — paste a direct link to the image (hosted online or on the server)
                </span>
              </label>
              <input
                value={form.photo_url}
                onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))}
                placeholder="https://example.com/founder-photo.jpg"
                className={inputCls} style={inputStyle}
              />
              <p className="text-xs text-[#8fadc8] mt-1.5">
                You can also link to a photo uploaded to <code className="bg-gray-100 px-1 py-0.5 rounded">/site-images/</code> on the server (e.g. <code className="bg-gray-100 px-1 py-0.5 rounded">/site-images/founder.jpg</code>).
              </p>
            </div>

            {error && (
              <p className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                <AlertCircle size={14} /> {error}
              </p>
            )}
            {success && (
              <p className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(5,150,105,0.08)', color: '#059669' }}>
                <CheckCircle size={14} /> {success}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 text-sm rounded-lg font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ background: '#1a56db' }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              {saving ? 'Saving…' : 'Save Founder Profile'}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
