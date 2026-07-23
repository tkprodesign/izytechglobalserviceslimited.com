import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { getToken } from '../../lib/auth';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Star, X, Save, ImagePlus, Link, ChevronLeft, ChevronRight, Upload } from 'lucide-react';

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
  images: string[];
}

const blank: Omit<Product, 'id' | 'sort_order' | 'created_at'> = {
  name: '', category: 'Solar', tag: 'Solar', unit: 'per unit',
  description: '', badge: null, rating: 5, reviews: 0, in_stock: true, featured: false,
  images: [],
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

function ProductThumb({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const valid = (images || []).filter(Boolean);
  if (!valid.length) {
    return (
      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f0f3f8' }}>
        <ImagePlus size={16} style={{ color: '#b0bec5' }} />
      </div>
    );
  }
  return (
    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group" style={{ background: '#f0f3f8' }}>
      <img src={valid[idx]} alt="" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      {valid.length > 1 && (
        <>
          <button
            className="absolute left-0 inset-y-0 px-0.5 hidden group-hover:flex items-center bg-black/30 text-white"
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + valid.length) % valid.length); }}
          ><ChevronLeft size={10} /></button>
          <button
            className="absolute right-0 inset-y-0 px-0.5 hidden group-hover:flex items-center bg-black/30 text-white"
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % valid.length); }}
          ><ChevronRight size={10} /></button>
        </>
      )}
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
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setNewImageUrl('');
    setFormOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, tag: p.tag, unit: p.unit,
      description: p.description, badge: p.badge, rating: p.rating,
      reviews: p.reviews, in_stock: p.in_stock, featured: p.featured,
      images: p.images || [],
    });
    setNewImageUrl('');
    setFormOpen(true);
  }

  function closeForm() { setFormOpen(false); setEditing(null); }

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function addImage() {
    const url = newImageUrl.trim();
    if (!url) return;
    setForm(f => ({ ...f, images: [...f.images, url] }));
    setNewImageUrl('');
  }

  async function uploadFile(file: File) {
    setUploadingImage(true);
    setUploadError('');
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await fetch(`${API}/api/admin/store/images/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Upload failed');
      setForm(f => ({ ...f, images: [...f.images, json.url] }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeImage(idx: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  function moveImage(from: number, to: number) {
    setForm(f => {
      const imgs = [...f.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...f, images: imgs };
    });
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
                  {['', 'Product', 'Category', 'Badge', 'Rating', 'Featured', 'Stock', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#8fadc8' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="transition-colors hover:bg-[#f8fafc]" style={{ borderBottom: '1px solid #eef1f6' }}>
                    <td className="pl-4 py-3">
                      <ProductThumb images={p.images || []} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--izy-navy)' }}>{p.name}</p>
                      <p className="text-xs mt-0.5 text-gray-400">{p.unit}</p>
                      {(p.images || []).length > 0 && (
                        <p className="text-xs mt-0.5" style={{ color: '#8fadc8' }}>{p.images.length} image{p.images.length !== 1 ? 's' : ''}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#f0f6ff', color: 'var(--izy-blue)' }}>
                        {p.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.badge ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 text-white" style={{ background: BADGE_COLORS[p.badge] ?? '#041627' }}>
                          {p.badge}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><Stars n={p.rating} /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.featured ? 'text-amber-700' : 'text-gray-400'}`}
                        style={{ background: p.featured ? 'rgba(240,162,14,0.12)' : '#f8fafc' }}>
                        {p.featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStock(p)} className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70">
                        {p.in_stock
                          ? <><ToggleRight size={18} style={{ color: '#10B981' }} /><span style={{ color: '#10B981' }}>In stock</span></>
                          : <><ToggleLeft size={18} style={{ color: '#94a3b8' }} /><span style={{ color: '#94a3b8' }}>Out of stock</span></>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg transition-colors hover:bg-blue-50" title="Edit">
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
          <div className="flex-1 bg-black/30" onClick={closeForm} />
          <div className="w-[520px] bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
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

              {/* Images */}
              <Field label="Product Images">
                {/* Current images */}
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border" style={{ borderColor: '#e2e8f0', aspectRatio: '4/3' }}>
                        <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                        {/* Position badge */}
                        {i === 0 && (
                          <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: 'var(--izy-blue)' }}>MAIN</span>
                        )}
                        {/* Overlay controls */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {i > 0 && (
                            <button
                              onClick={() => moveImage(i, i - 1)}
                              className="p-1 rounded bg-white/80 text-gray-700 hover:bg-white text-xs"
                              title="Move left"
                            ><ChevronLeft size={12} /></button>
                          )}
                          <button
                            onClick={() => removeImage(i)}
                            className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                            title="Remove"
                          ><X size={12} /></button>
                          {i < form.images.length - 1 && (
                            <button
                              onClick={() => moveImage(i, i + 1)}
                              className="p-1 rounded bg-white/80 text-gray-700 hover:bg-white"
                              title="Move right"
                            ><ChevronRight size={12} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Upload from device */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ borderColor: uploadingImage ? '#8fadc8' : '#c7d9ef', color: uploadingImage ? '#8fadc8' : 'var(--izy-blue)', background: '#f7faff' }}
                >
                  {uploadingImage
                    ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Uploading to Cloudflare…</>
                    : <><Upload size={14} /> Upload image from device</>}
                </button>
                {uploadError && (
                  <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                )}

                {/* Divider */}
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                  <span className="text-xs" style={{ color: '#94a3b8' }}>or paste URL</span>
                  <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                </div>

                {/* Add image URL */}
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 border rounded-lg px-3 py-2.5" style={{ borderColor: '#e2e8f0' }}>
                    <Link size={13} style={{ color: '#8fadc8', flexShrink: 0 }} />
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 text-sm focus:outline-none bg-transparent"
                      style={{ color: 'var(--izy-navy)' }}
                    />
                  </div>
                  <button
                    onClick={addImage}
                    disabled={!newImageUrl.trim()}
                    className="px-3 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
                    style={{ background: 'var(--izy-blue)' }}
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                  First image is the main photo. Hover an image to reorder or remove.
                </p>
              </Field>

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
