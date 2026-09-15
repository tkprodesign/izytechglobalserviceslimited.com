import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { DashboardLayout } from './DashboardLayout';
import { getToken, removeToken } from '../../lib/auth';
import {
  Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle,
  Lightbulb, Building2, Zap, Home, TrendingUp, Award, Globe,
  Star, Rocket, Shield, Calendar, Target, Compass, Sun, Wrench,
  Package, Flag, Heart, Layers, Map, Settings, User,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

// Available icons for milestones
const ICONS: { name: string; icon: React.ElementType }[] = [
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Building2', icon: Building2 },
  { name: 'Zap',       icon: Zap },
  { name: 'Home',      icon: Home },
  { name: 'TrendingUp',icon: TrendingUp },
  { name: 'Award',     icon: Award },
  { name: 'Globe',     icon: Globe },
  { name: 'Star',      icon: Star },
  { name: 'Rocket',    icon: Rocket },
  { name: 'Shield',    icon: Shield },
  { name: 'Calendar',  icon: Calendar },
  { name: 'Target',    icon: Target },
  { name: 'Compass',   icon: Compass },
  { name: 'Sun',       icon: Sun },
  { name: 'Wrench',    icon: Wrench },
  { name: 'Package',   icon: Package },
  { name: 'Flag',      icon: Flag },
  { name: 'Heart',     icon: Heart },
  { name: 'Layers',    icon: Layers },
  { name: 'Map',       icon: Map },
  { name: 'Settings',  icon: Settings },
  { name: 'User',      icon: User },
];

const ICON_MAP = Object.fromEntries(ICONS.map(i => [i.name, i.icon]));

interface Milestone {
  id: number;
  year: string;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
}

const emptyForm = (): Omit<Milestone, 'id'> => ({
  year: '',
  title: '',
  description: '',
  icon_name: 'Star',
  sort_order: 0,
});

const inputCls = 'w-full px-3 py-2.5 text-sm rounded-lg outline-none transition-all border border-[#dce8ff] focus:border-blue-400 focus:ring-2 focus:ring-blue-100';
const inputStyle = { color: '#041627', background: '#fff' };

export function MilestonesPage() {
  const token = getToken();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUnauth = () => { removeToken(); navigate('/admin/login'); };

  async function load() {
    try {
      const res = await fetch(`${API}/api/admin/milestones`, { headers });
      if (res.status === 401 || res.status === 403) return handleUnauth();
      const d = await res.json();
      setMilestones(d.data || []);
    } catch { /* network */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditId(null);
    setForm(emptyForm());
    setError('');
    setFormOpen(true);
  }

  function openEdit(m: Milestone) {
    setEditId(m.id);
    setForm({ year: m.year, title: m.title, description: m.description, icon_name: m.icon_name, sort_order: m.sort_order });
    setError('');
    setFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.year.trim() || !form.title.trim()) return setError('Year and title are required.');
    setSaving(true); setError('');
    try {
      const url = editId ? `${API}/api/admin/milestones/${editId}` : `${API}/api/admin/milestones`;
      const res = await fetch(url, { method: editId ? 'PUT' : 'POST', headers, body: JSON.stringify(form) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to save');
      setSuccess(editId ? 'Milestone updated.' : 'Milestone added.');
      setFormOpen(false);
      await load();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this milestone? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await fetch(`${API}/api/admin/milestones/${id}`, { method: 'DELETE', headers });
      setMilestones(prev => prev.filter(m => m.id !== id));
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#041627]" style={{ fontFamily: 'var(--font-display)' }}>
              Company Milestones
            </h1>
            <p className="text-sm text-[#5a6a82] mt-1">
              These appear on the public About section. Drag to reorder using the sort order field.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
            style={{ background: '#1a56db' }}
          >
            <Plus size={15} /> Add Milestone
          </button>
        </div>

        {success && (
          <div className="mb-5 flex items-center gap-2 text-sm px-4 py-3 rounded-lg" style={{ background: 'rgba(5,150,105,0.08)', color: '#059669' }}>
            <CheckCircle size={15} /> {success}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={24} className="animate-spin" style={{ color: '#1a56db' }} />
          </div>
        ) : milestones.length === 0 ? (
          <div className="text-center py-16 text-[#8fadc8]">No milestones yet. Add one above.</div>
        ) : (
          <div className="space-y-3">
            {milestones.map(m => {
              const IconComp = ICON_MAP[m.icon_name] || Star;
              return (
                <div
                  key={m.id}
                  className="flex items-start gap-4 p-5 bg-white border border-[#eef1f6] rounded-xl group hover:border-[#dce8ff] transition-colors"
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(240,162,14,0.1)' }}>
                    <IconComp size={16} style={{ color: '#F0A20E' }} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold" style={{ color: '#F0A20E' }}>{m.year}</span>
                      <span className="text-xs text-[#8fadc8]">·</span>
                      <span className="text-xs text-[#8fadc8]">Order: {m.sort_order}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#041627] mb-1">{m.title}</p>
                    <p className="text-xs text-[#5a6a82] leading-relaxed line-clamp-2">{m.description}</p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => openEdit(m)}
                      className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={13} style={{ color: '#1a56db' }} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={deleting === m.id}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      {deleting === m.id
                        ? <Loader2 size={13} className="animate-spin" style={{ color: '#dc2626' }} />
                        : <Trash2 size={13} style={{ color: '#dc2626' }} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Slide-over form */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(4,22,39,0.4)' }}>
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#eef1f6]">
              <h2 className="font-semibold text-[#041627]">{editId ? 'Edit Milestone' : 'Add Milestone'}</h2>
              <button onClick={() => setFormOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={16} style={{ color: '#5a6a82' }} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 flex flex-col px-6 py-6 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#5a6a82]">Year / Period</label>
                <input
                  value={form.year}
                  onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                  placeholder="e.g. 2018, Late 2017, March 2018"
                  className={inputCls} style={inputStyle} required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#5a6a82]">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Official Incorporation"
                  className={inputCls} style={inputStyle} required
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#5a6a82]">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="A brief description of this milestone..."
                  rows={4}
                  className={inputCls + ' resize-none'} style={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-[#5a6a82]">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {ICONS.map(({ name, icon: IconComp }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon_name: name }))}
                      title={name}
                      className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg border transition-all text-center"
                      style={{
                        borderColor: form.icon_name === name ? '#1a56db' : '#eef1f6',
                        background: form.icon_name === name ? 'rgba(26,86,219,0.06)' : '#fff',
                      }}
                    >
                      <IconComp size={16} style={{ color: form.icon_name === name ? '#1a56db' : '#8fadc8' }} />
                      <span className="text-[9px] text-[#8fadc8] leading-none">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#5a6a82]">Sort Order <span className="font-normal">(lower = appears first)</span></label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  className={inputCls} style={inputStyle}
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                  <AlertCircle size={14} /> {error}
                </p>
              )}

              <div className="flex gap-3 pt-2 mt-auto">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="flex-1 py-2.5 text-sm rounded-lg font-medium hover:bg-gray-100 transition-colors text-[#5a6a82]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm rounded-lg font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: '#1a56db' }}
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
