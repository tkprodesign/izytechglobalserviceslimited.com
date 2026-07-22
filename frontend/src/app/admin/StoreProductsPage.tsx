import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { getToken } from '../../lib/auth';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star, X, Save } from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

const CATEGORIES = ['Solar', 'Inverters', 'Batteries', 'Security', 'Smart Home', 'Electrical'];
const BADGES = ['', 'BESTSELLER', 'SALE', 'NEW', 'POPULAR'];
const BADGE_COLORS: Record<string, string> = {
  BESTSELLER: '#041627',
  SALE: '#EF4444',
  NEW: '#10B981',
  POPULAR: '#3B82F6',
};

interface Product {
  id: number;
  name: string;
  category: string;
  tag: string;
  unit: string;
  description: string;
  badge: string | null;
  rating: number;
  reviews: number;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
}

const blank: Omit<Product, 'id' | 'sort_order' | 'created_at'> = {
  name: '', category: 'Solar', tag: 'Solar', unit: 'per unit',
  description: '', badge: null, rating: 5, reviews: 0, in_stock: true, featured: false,
};

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={10} fill={i < n ? '#F0A20E' : 'transparent'} style={{ color: i < n ? '#F0A20E' : '#d1d5db' }} />
      ))}
    </div>
  );
}

export function StoreProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const token = getToken();

  function load() {
    setLoading(true);
    fetch(`${API}/api/admin/store/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setProducts(d.data ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [token]);

  function openNew() {
    setEditing(null);
    setForm({ ...blank });
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, tag: p.tag, unit: p.unit,
      description: p.description, badge: p.badge, rating: p.rating,
      reviews: p.reviews, in_stock: p.in_stock, featured: p.featured,
    });
    setFormOpen(true);
  }

  function closeForm() { setFormOpen(false); setEditing(null); }

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function save() {
    if (!form.name.trim()) return;
    setSaving(true);
    const url = editing
      ? `${API}/api/admin/store/products/${editing.id}`
      : `${API}/api/admin/store/products`;
    const method = editing ? 'PUT' : 'POST';
    const body = { ...form, tag: form.category, badge: form.badge || null };
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    setSaving(false);
    closeForm();
    load();
  }

  async function toggleStock(p: Product) {
    await fetch(`${API}/api/admin/store/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...p, in_stock: !p.in_stock, tag: p.category }),
    });
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, in_stock: !x.in_stock } : x));
  }

  async function remove(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeleting(p.id);
    await fetch(`${API}/api/admin/store/products/${p.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleting(null);
    setProducts(prev => prev.filter(x => x.id !== p.id));
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>Store Products</h1>
            <p className="text-sm mt-1" style={{ color: '#5a6a82' }}>{products.length} products in catalogue</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--izy-blue)' }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--izy-blue)', borderTopColor: 'transparent' }} />
            </div>
          ) : products.length === 0 ? (
            <p className="p-8 text-sm text-center" style={{ color: '#8fadc8' }}>No products yet. Add your first one.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #eef1f6' }}>
                  {['Product', 'Category', 'Badge', 'Rating', 'Featured', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#8fadc8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="transition-colors hover:bg-[#f8fafc]" style={{ borderBottom: '1px solid #eef1f6' }}>
                    <td className="px-5 py-4">
                      <p className="font-medium" style={{ color: 'var(--izy-navy)' }}>{p.name}</p>
                      <p className="text-xs mt-0.5 text-gray-400">{p.unit}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#f0f6ff', color: 'var(--izy-blue)' }}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {p.badge ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 text-white" style={{ background: BADGE_COLORS[p.badge] ?? '#041627' }}>
                          {p.badge}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4"><Stars n={p.rating} /></td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.featured ? 'text-amber-700' : 'text-gray-400'}`}
                        style={{ background: p.featured ? 'rgba(240,162,14,0.12)' : '#f8fafc' }}>
                        {p.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleStock(p)} className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70">
                        {p.in_stock
                          ? <><ToggleRight size={18} style={{ color: '#10B981' }} /><span style={{ color: '#10B981' }}>In stock</span></>
                          : <><ToggleLeft size={18} style={{ color: '#94a3b8' }} /><span style={{ color: '#94a3b8' }}>Out of stock</span></>}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg transition-colors hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={14} style={{ color: 'var(--izy-blue)' }} />
                        </button>
                        <button
                          onClick={() => remove(p)}
                          disabled={deleting === p.id}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-50 disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Slide-over form ── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/30" onClick={closeForm} />
          {/* Panel */}
          <div className="w-[480px] bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b" style={{ borderColor: '#eef1f6' }}>
              <h2 className="font-bold text-base" style={{ color: 'var(--izy-navy)' }}>
                {editing ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={16} style={{ color: '#5a6a82' }} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 px-7 py-6 space-y-5">
              {/* Name */}
              <Field label="Product Name *">
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. 400W Monocrystalline Solar Panel"
                  className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e2e8f0', color: 'var(--izy-navy)' }}
                />
              </Field>

              {/* Category */}
              <Field label="Category *">
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: '#e2e8f0', color: 'var(--izy-navy)' }}
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>

              {/* Unit */}
              <Field label="Unit label">
                <input
                  type="text"
                  value={form.unit}
                  onChange={e => set('unit', e.target.value)}
                  placeholder="per unit / per panel / per kit"
                  className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: '#e2e8f0', color: 'var(--izy-navy)' }}
                />
              </Field>

              {/* Description */}
              <Field label="Description">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Short product description shown on the store…"
                  className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none resize-none"
                  style={{ borderColor: '#e2e8f0', color: 'var(--izy-navy)' }}
                />
              </Field>

              {/* Badge */}
              <Field label="Badge">
                <select
                  value={form.badge ?? ''}
                  onChange={e => set('badge', e.target.value || null)}
                  className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: '#e2e8f0', color: 'var(--izy-navy)' }}
                >
                  {BADGES.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                </select>
              </Field>

              {/* Rating + Reviews */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rating (1–5)">
                  <input
                    type="number"
                    min={1} max={5}
                    value={form.rating}
                    onChange={e => set('rating', Number(e.target.value))}
                    className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none"
                    style={{ borderColor: '#e2e8f0', color: 'var(--izy-navy)' }}
                  />
                </Field>
                <Field label="Review count">
                  <input
                    type="number"
                    min={0}
                    value={form.reviews}
                    onChange={e => set('reviews', Number(e.target.value))}
                    className="w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none"
                    style={{ borderColor: '#e2e8f0', color: 'var(--izy-navy)' }}
                  />
                </Field>
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <Toggle label="In stock" value={form.in_stock} onChange={v => set('in_stock', v)} />
                <Toggle label="Featured on homepage" value={form.featured} onChange={v => set('featured', v)} />
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-5 border-t flex gap-3" style={{ borderColor: '#eef1f6' }}>
              <button
                onClick={closeForm}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#e2e8f0', color: '#5a6a82' }}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !form.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--izy-blue)' }}
              >
                {saving ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : <Save size={15} />}
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#5a6a82' }}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-2.5 text-sm font-medium transition-colors"
      style={{ color: value ? 'var(--izy-navy)' : '#94a3b8' }}
    >
      {value
        ? <ToggleRight size={22} style={{ color: '#10B981' }} />
        : <ToggleLeft size={22} style={{ color: '#cbd5e1' }} />}
      {label}
    </button>
  );
}
