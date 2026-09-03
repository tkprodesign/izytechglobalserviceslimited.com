import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { DashboardLayout } from './DashboardLayout';
import { getToken, removeToken } from '../../lib/auth';
import {
  Plus, Pencil, Trash2, X, Loader2, AlertCircle, CheckCircle,
  Star, MessageSquare,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  text: string;
  rating: number;
  avatar: string;
  metric: string;
  sort_order: number;
  created_at: string;
}

type FormState = Omit<Testimonial, 'id' | 'created_at'>;

const blank = (): FormState => ({
  name: '',
  role: '',
  company: '',
  text: '',
  rating: 5,
  avatar: '',
  metric: '',
  sort_order: 0,
});

const inputCls = 'w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all';
const inputStyle = { borderColor: '#e2e8f0', color: 'var(--izy-navy)' };

export function TestimonialsManagerPage() {
  const token = getToken();
  const navigate = useNavigate();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(blank());
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  function handleUnauth() {
    removeToken();
    navigate('/admin/login');
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/testimonials`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) return handleUnauth();
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not load testimonials');
      setTestimonials(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load testimonials');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

  function openNew() {
    setEditing(null);
    setForm(blank());
    setError('');
    setFormOpen(true);
  }

  function openEdit(item: Testimonial) {
    setEditing(item);
    setForm({
      name: item.name,
      role: item.role,
      company: item.company,
      text: item.text,
      rating: item.rating,
      avatar: item.avatar,
      metric: item.metric,
      sort_order: item.sort_order,
    });
    setError('');
    setFormOpen(true);
  }

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(current => ({ ...current, [field]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim() || !form.company.trim() || !form.text.trim() || !form.metric.trim()) {
      setError('Name, role, company, testimonial, and result are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = editing
        ? `${API}/api/admin/testimonials/${editing.id}`
        : `${API}/api/admin/testimonials`;
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save testimonial');
      setFormOpen(false);
      setToast(editing ? 'Testimonial updated.' : 'Testimonial added.');
      await load();
      window.setTimeout(() => setToast(''), 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Testimonial) {
    if (!window.confirm(`Delete the testimonial from ${item.name}? This cannot be undone.`)) return;
    setDeleting(item.id);
    try {
      const res = await fetch(`${API}/api/admin/testimonials/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete testimonial');
      setTestimonials(current => current.filter(testimonial => testimonial.id !== item.id));
      setToast('Testimonial deleted.');
      window.setTimeout(() => setToast(''), 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete testimonial');
    } finally {
      setDeleting(null);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)', fontFamily: 'var(--font-display)' }}>
              Testimonials
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#5a6a82' }}>
              Add, edit, or remove the customer stories shown across the public site.
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--izy-blue)' }}
          >
            <Plus size={16} /> Add Testimonial
          </button>
        </div>

        {error && !formOpen && (
          <div className="mb-5 flex items-center gap-2 rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 size={26} className="animate-spin" style={{ color: 'var(--izy-blue)' }} />
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center text-sm" style={{ color: '#8fadc8' }}>
            No testimonials yet. Add the first customer story above.
          </div>
        ) : (
          <div className="space-y-3">
            {testimonials.map(item => (
              <article key={item.id} className="rounded-2xl border bg-white p-4 shadow-sm transition-colors hover:border-[#c7d9ef] sm:p-5" style={{ borderColor: '#eef1f6' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: 'var(--izy-blue)' }}>
                    {item.avatar || item.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h2 className="text-sm font-semibold" style={{ color: 'var(--izy-navy)' }}>{item.name}</h2>
                      <span className="text-xs" style={{ color: '#8fadc8' }}>·</span>
                      <span className="text-xs" style={{ color: '#5a6a82' }}>{item.role}</span>
                    </div>
                    <p className="mt-0.5 text-xs" style={{ color: '#8fadc8' }}>{item.company}</p>
                    <div className="mt-2 flex items-center gap-0.5" aria-label={`${item.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={13} fill={index < item.rating ? '#F0A20E' : 'transparent'} style={{ color: index < item.rating ? '#F0A20E' : '#cbd5e1' }} />
                      ))}
                      <span className="ml-2 text-[11px]" style={{ color: '#8fadc8' }}>Order {item.sort_order}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: '#5a6a82' }}>{item.text}</p>
                    <span className="mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: '#fff8e6', color: '#b45309' }}>
                      {item.metric}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => openEdit(item)} className="rounded-lg p-2 transition-colors hover:bg-blue-50" title="Edit testimonial" aria-label={`Edit testimonial from ${item.name}`}>
                      <Pencil size={14} style={{ color: 'var(--izy-blue)' }} />
                    </button>
                    <button onClick={() => remove(item)} disabled={deleting === item.id} className="rounded-lg p-2 transition-colors hover:bg-red-50 disabled:opacity-40" title="Delete testimonial" aria-label={`Delete testimonial from ${item.name}`}>
                      {deleting === item.id
                        ? <Loader2 size={14} className="animate-spin" style={{ color: '#dc2626' }} />
                        : <Trash2 size={14} style={{ color: '#dc2626' }} />}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(4,22,39,0.4)' }}>
          <div className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-5 sm:px-7" style={{ borderColor: '#eef1f6' }}>
              <h2 className="font-semibold" style={{ color: 'var(--izy-navy)' }}>
                {editing ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button onClick={() => setFormOpen(false)} className="rounded-lg p-1.5 hover:bg-gray-100" aria-label="Close">
                <X size={16} style={{ color: '#5a6a82' }} />
              </button>
            </div>

            <form onSubmit={save} className="flex-1 space-y-4 px-5 py-6 sm:px-7">
              <Field label="Customer name *">
                <input value={form.name} onChange={e => setField('name', e.target.value)} placeholder="e.g. Emeka Okonkwo" className={inputCls} style={inputStyle} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Role *">
                  <input value={form.role} onChange={e => setField('role', e.target.value)} placeholder="e.g. Factory Manager" className={inputCls} style={inputStyle} />
                </Field>
                <Field label="Company *">
                  <input value={form.company} onChange={e => setField('company', e.target.value)} placeholder="e.g. PrecisionPack Industries" className={inputCls} style={inputStyle} />
                </Field>
              </div>
              <Field label="Testimonial *">
                <textarea rows={6} value={form.text} onChange={e => setField('text', e.target.value)} placeholder="What did the customer say about working with Izy Technologies?" className={inputCls + ' resize-none'} style={inputStyle} />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Rating *">
                  <select value={form.rating} onChange={e => setField('rating', Number(e.target.value))} className={inputCls} style={inputStyle}>
                    {[5, 4, 3, 2, 1].map(value => <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}
                  </select>
                </Field>
                <Field label="Result / metric *">
                  <input value={form.metric} onChange={e => setField('metric', e.target.value)} placeholder="e.g. 60% energy cost reduction" className={inputCls} style={inputStyle} />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Avatar initials">
                  <input value={form.avatar} onChange={e => setField('avatar', e.target.value.slice(0, 3).toUpperCase())} placeholder="Auto from name" maxLength={3} className={inputCls} style={inputStyle} />
                </Field>
                <Field label="Display order">
                  <input type="number" min={0} value={form.sort_order} onChange={e => setField('sort_order', Math.max(0, Number(e.target.value) || 0))} className={inputCls} style={inputStyle} />
                </Field>
              </div>
              <p className="text-xs" style={{ color: '#8fadc8' }}>Leave avatar initials blank to generate them from the customer’s name. Lower display order appears first.</p>

              {error && (
                <p className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                  <AlertCircle size={14} /> {error}
                </p>
              )}

              <div className="flex gap-3 border-t pt-5" style={{ borderColor: '#eef1f6' }}>
                <button type="button" onClick={() => setFormOpen(false)} className="flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors hover:bg-gray-50" style={{ borderColor: '#e2e8f0', color: '#5a6a82' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: 'var(--izy-blue)' }}>
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-xl" style={{ background: '#059669' }}>
          <CheckCircle size={16} /> {toast}
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: '#5a6a82' }}>{label}</label>
      {children}
    </div>
  );
}