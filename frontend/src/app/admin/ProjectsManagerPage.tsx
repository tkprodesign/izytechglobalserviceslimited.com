import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { getToken } from '../../lib/auth';
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Save,
  ImagePlus, Link as LinkIcon, ChevronLeft, ChevronRight, Upload,
  Star, Loader2, AlertCircle, CheckCircle, ExternalLink, Search,
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL ?? '';

const CATEGORIES = [
  'Solar Energy',
  'Solar + IT',
  'Industrial Wiring',
  'Security',
  'Smart Home',
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Solar Energy':      { bg: '#fff8e6', text: '#b45309' },
  'Solar + IT':        { bg: '#f0fdf4', text: '#166534' },
  'Industrial Wiring': { bg: '#eff6ff', text: '#1d4ed8' },
  'Security':          { bg: '#fef2f2', text: '#991b1b' },
  'Smart Home':        { bg: '#f5f3ff', text: '#6d28d9' },
};

interface Project {
  id: number;
  title: string;
  slug: string;
  category: string;
  location: string;
  year: string;
  short_description: string;
  full_description: string;
  result_metric: string;
  services: string[];
  images: string[];
  main_image_url: string;
  featured: boolean;
  sort_order: number;
  published: boolean;
  created_at: string;
}

type FormState = Omit<Project, 'id' | 'created_at' | 'main_image_url'>;

const blank = (): FormState => ({
  title: '',
  slug: '',
  category: 'Solar Energy',
  location: '',
  year: String(new Date().getFullYear()),
  short_description: '',
  full_description: '',
  result_metric: '',
  services: [],
  images: [],
  featured: false,
  sort_order: 0,
  published: false,
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* ── Thumbnail ── */
function ProjectThumb({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const valid = (images || []).filter(Boolean);
  if (!valid.length) {
    return (
      <div className="w-14 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#f0f3f8' }}>
        <ImagePlus size={15} style={{ color: '#b0bec5' }} />
      </div>
    );
  }
  return (
    <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 group" style={{ background: '#f0f3f8' }}>
      <img src={valid[idx]} alt="" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
      {valid.length > 1 && (
        <>
          <button className="absolute left-0 inset-y-0 px-0.5 hidden group-hover:flex items-center bg-black/30 text-white"
            onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + valid.length) % valid.length); }}>
            <ChevronLeft size={10} />
          </button>
          <button className="absolute right-0 inset-y-0 px-0.5 hidden group-hover:flex items-center bg-black/30 text-white"
            onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % valid.length); }}>
            <ChevronRight size={10} />
          </button>
        </>
      )}
    </div>
  );
}

/* ── Success toast ── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-sm font-semibold text-white animate-in slide-in-from-bottom-4"
      style={{ background: '#059669' }}>
      <CheckCircle size={16} />
      {message}
    </div>
  );
}

/* ── Main component ── */
export function ProjectsManagerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(blank());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  /* Search + filter */
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  /* Image upload state */
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Services state */
  const [newService, setNewService] = useState('');

  /* Slug was manually edited */
  const slugManual = useRef(false);

  const token = getToken();
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  function load() {
    setLoading(true);
    fetch(`${API}/api/admin/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setProjects(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [token]);

  /* Filtered view */
  const visible = projects.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.location ?? '').toLowerCase().includes(q);
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  /* ── Form helpers ── */
  function openNew() {
    slugManual.current = false;
    setEditing(null);
    setForm(blank());
    setNewImageUrl('');
    setNewService('');
    setUploadError('');
    setError('');
    setFormOpen(true);
  }

  function openEdit(p: Project) {
    slugManual.current = true;
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      category: p.category,
      location: p.location,
      year: p.year,
      short_description: p.short_description,
      full_description: p.full_description,
      result_metric: p.result_metric,
      services: p.services ?? [],
      images: p.images ?? [],
      featured: p.featured,
      sort_order: p.sort_order,
      published: p.published,
    });
    setNewImageUrl('');
    setNewService('');
    setUploadError('');
    setError('');
    setFormOpen(true);
  }

  function closeForm() { setFormOpen(false); setEditing(null); }

  function setf<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function handleTitleChange(title: string) {
    setForm(f => ({
      ...f,
      title,
      slug: slugManual.current ? f.slug : slugify(title),
    }));
  }

  /* ── Image helpers ── */
  function addImageUrl() {
    const url = newImageUrl.trim();
    if (!url) return;
    setForm(f => ({ ...f, images: [...f.images, url] }));
    setNewImageUrl('');
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith('image/')) { setUploadError('Please choose an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError('Images must be 10 MB or smaller.'); return; }
    setUploadingImage(true);
    setUploadError('');
    try {
      const res = await fetch(`${API}/api/admin/projects/images/direct-upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const du = await res.json();
      if (!res.ok || du.error) throw new Error(du.error || 'Could not start upload');
      const fd = new FormData();
      fd.append('file', file);
      const up = await fetch(du.uploadURL, { method: 'POST', body: fd });
      const ur = await up.json().catch(() => ({}));
      if (!up.ok || ur.success === false) throw new Error(ur.errors?.[0]?.message || 'Cloudflare upload failed');
      setForm(f => ({ ...f, images: [...f.images, du.url] }));
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeImage(i: number) {
    setForm(f => ({ ...f, images: f.images.filter((_, j) => j !== i) }));
  }

  function moveImage(from: number, to: number) {
    setForm(f => {
      const imgs = [...f.images];
      const [item] = imgs.splice(from, 1);
      imgs.splice(to, 0, item);
      return { ...f, images: imgs };
    });
  }

  /* ── Service helpers ── */
  function addService() {
    const s = newService.trim();
    if (!s || form.services.includes(s)) return;
    setForm(f => ({ ...f, services: [...f.services, s] }));
    setNewService('');
  }

  function removeService(s: string) {
    setForm(f => ({ ...f, services: f.services.filter(x => x !== s) }));
  }

  /* ── Save ── */
  async function save() {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.slug.trim()) { setError('Slug is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const url = editing
        ? `${API}/api/admin/projects/${editing.id}`
        : `${API}/api/admin/projects`;
      const method = editing ? 'PUT' : 'POST';
      const body: Record<string, unknown> = {
        ...form,
        main_image_url: form.images[0] ?? '',
      };
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to save');
      closeForm();
      load();
      setToast(editing ? 'Project updated.' : 'Project added.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  /* ── Quick toggles ── */
  async function toggleField(p: Project, field: 'published' | 'featured') {
    const updated = { ...p, [field]: !p[field] };
    setProjects(prev => prev.map(x => x.id === p.id ? { ...x, [field]: !x[field] } : x));
    await fetch(`${API}/api/admin/projects/${p.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ ...updated, main_image_url: (updated.images ?? [])[0] ?? updated.main_image_url }),
    });
  }

  /* ── Delete — with featured warning and unpublish-first option ── */
  async function remove(p: Project) {
    if (p.featured) {
      const go = confirm(
        `"${p.title}" is currently featured on the homepage.\n\nConsider unpublishing it first instead of deleting.\n\nClick OK to permanently delete anyway, or Cancel to go back.`
      );
      if (!go) return;
    } else if (p.published) {
      const go = confirm(
        `"${p.title}" is currently live on the public site.\n\nConsider unpublishing it first instead of deleting.\n\nClick OK to permanently delete anyway, or Cancel to go back.`
      );
      if (!go) return;
    } else {
      if (!confirm(`Permanently delete "${p.title}"? This cannot be undone.`)) return;
    }

    setDeleting(p.id);
    await fetch(`${API}/api/admin/projects/${p.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeleting(null);
    setProjects(prev => prev.filter(x => x.id !== p.id));
    setToast('Project deleted.');
  }

  const inputCls = 'w-full border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all';
  const inputStyle = { borderColor: '#e2e8f0', color: 'var(--izy-navy)' };

  /* Unique categories from loaded projects for the filter dropdown */
  const loadedCategories = Array.from(new Set(projects.map(p => p.category))).sort();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>Projects</h1>
            <p className="text-sm mt-1" style={{ color: '#5a6a82' }}>
              {projects.filter(p => p.published).length} published · {projects.filter(p => !p.published).length} draft
            </p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--izy-blue)' }}
          >
            <Plus size={16} /> Add Project
          </button>
        </div>

        {/* Search + category filter */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] border rounded-xl px-3.5 py-2.5 bg-white" style={{ borderColor: '#e2e8f0' }}>
            <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or location…"
              className="flex-1 text-sm focus:outline-none bg-transparent"
              style={{ color: 'var(--izy-navy)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="hover:opacity-70">
                <X size={13} style={{ color: '#94a3b8' }} />
              </button>
            )}
          </div>
          <select
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none bg-white"
            style={{ borderColor: '#e2e8f0', color: filterCat ? 'var(--izy-navy)' : '#94a3b8' }}
          >
            <option value="">All categories</option>
            {loadedCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="animate-spin" size={28} style={{ color: 'var(--izy-blue)' }} />
            </div>
          ) : visible.length === 0 ? (
            <p className="p-8 text-sm text-center" style={{ color: '#8fadc8' }}>
              {projects.length === 0 ? 'No projects yet. Add your first one.' : 'No projects match your search.'}
            </p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[860px] text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eef1f6' }}>
                      {['', 'Project', 'Category', 'Year', 'Featured', 'Published', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#8fadc8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(p => {
                      const cc = CATEGORY_COLORS[p.category] ?? { bg: '#f0f3f8', text: '#5a6a82' };
                      return (
                        <tr key={p.id} className="transition-colors hover:bg-[#f8fafc]" style={{ borderBottom: '1px solid #eef1f6' }}>
                          <td className="pl-4 py-3">
                            <ProjectThumb images={p.images || []} />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium" style={{ color: 'var(--izy-navy)' }}>{p.title}</p>
                            <p className="text-xs mt-0.5 font-mono" style={{ color: '#94a3b8' }}>{p.slug}</p>
                            {p.location && <p className="text-xs mt-0.5" style={{ color: '#8fadc8' }}>{p.location}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: cc.bg, color: cc.text }}>
                              {p.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: '#5a6a82' }}>{p.year}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleField(p, 'featured')} className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70" title={p.featured ? 'Remove featured' : 'Mark as featured'}>
                              {p.featured
                                ? <><Star size={15} fill="#F0A20E" style={{ color: '#F0A20E' }} /><span style={{ color: '#b45309' }}>Yes</span></>
                                : <><Star size={15} style={{ color: '#cbd5e1' }} /><span style={{ color: '#94a3b8' }}>No</span></>}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleField(p, 'published')} className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70" title={p.published ? 'Unpublish' : 'Publish'}>
                              {p.published
                                ? <><ToggleRight size={18} style={{ color: '#10B981' }} /><span style={{ color: '#10B981' }}>Live</span></>
                                : <><ToggleLeft size={18} style={{ color: '#94a3b8' }} /><span style={{ color: '#94a3b8' }}>Draft</span></>}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {p.published && (
                                <a
                                  href={`/projects/${p.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg transition-colors hover:bg-green-50"
                                  title="Preview live page"
                                >
                                  <ExternalLink size={14} style={{ color: '#10B981' }} />
                                </a>
                              )}
                              <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg transition-colors hover:bg-blue-50" title="Edit">
                                <Pencil size={14} style={{ color: 'var(--izy-blue)' }} />
                              </button>
                              <button
                                onClick={() => remove(p)}
                                disabled={deleting === p.id}
                                className="p-1.5 rounded-lg transition-colors hover:bg-red-50 disabled:opacity-40"
                                title="Delete"
                              >
                                {deleting === p.id
                                  ? <Loader2 size={14} className="animate-spin" style={{ color: '#ef4444' }} />
                                  : <Trash2 size={14} style={{ color: '#ef4444' }} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y sm:hidden" style={{ borderColor: '#eef1f6' }}>
                {visible.map(p => {
                  const cc = CATEGORY_COLORS[p.category] ?? { bg: '#f0f3f8', text: '#5a6a82' };
                  return (
                    <article key={p.id} className="flex min-w-0 gap-3 px-4 py-4">
                      <ProjectThumb images={p.images || []} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="break-words text-sm font-semibold leading-snug" style={{ color: 'var(--izy-navy)' }}>{p.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#8fadc8' }}>{p.location} · {p.year}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            {p.published && (
                              <a href={`/projects/${p.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 hover:bg-green-50" aria-label="Preview">
                                <ExternalLink size={14} style={{ color: '#10B981' }} />
                              </a>
                            )}
                            <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 hover:bg-blue-50" aria-label={`Edit ${p.title}`}>
                              <Pencil size={14} style={{ color: 'var(--izy-blue)' }} />
                            </button>
                            <button onClick={() => remove(p)} disabled={deleting === p.id} className="rounded-lg p-1.5 hover:bg-red-50 disabled:opacity-40" aria-label={`Delete ${p.title}`}>
                              {deleting === p.id
                                ? <Loader2 size={14} className="animate-spin" style={{ color: '#ef4444' }} />
                                : <Trash2 size={14} style={{ color: '#ef4444' }} />}
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: cc.bg, color: cc.text }}>{p.category}</span>
                          <button onClick={() => toggleField(p, 'published')} className="flex items-center gap-1 text-xs font-medium hover:opacity-70">
                            {p.published
                              ? <><ToggleRight size={16} style={{ color: '#10B981' }} /><span style={{ color: '#10B981' }}>Live</span></>
                              : <><ToggleLeft size={16} style={{ color: '#94a3b8' }} /><span style={{ color: '#94a3b8' }}>Draft</span></>}
                          </button>
                          {p.featured && <span className="text-xs font-medium text-amber-700">★ Featured</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Result count when filtering */}
        {(search || filterCat) && !loading && (
          <p className="mt-3 text-xs text-center" style={{ color: '#94a3b8' }}>
            Showing {visible.length} of {projects.length} projects
          </p>
        )}
      </div>

      {/* ── Slide-over form ── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={closeForm} />
          <div className="flex h-full w-[min(560px,100vw)] flex-col overflow-y-auto bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-5 sm:px-7" style={{ borderColor: '#eef1f6' }}>
              <h2 className="font-bold text-base" style={{ color: 'var(--izy-navy)' }}>
                {editing ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={16} style={{ color: '#5a6a82' }} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-5 px-5 py-6 sm:px-7">

              {/* Images */}
              <Field label="Images">
                {form.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border" style={{ borderColor: '#e2e8f0', aspectRatio: '4/3' }}>
                        <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                        {i === 0 && <span className="absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: 'var(--izy-blue)' }}>MAIN</span>}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          {i > 0 && (
                            <button onClick={() => moveImage(i, i - 1)} className="p-1 rounded bg-white/80 text-gray-700 hover:bg-white" title="Move left"><ChevronLeft size={12} /></button>
                          )}
                          <button onClick={() => removeImage(i)} className="p-1 rounded bg-red-500 text-white hover:bg-red-600" title="Remove"><X size={12} /></button>
                          {i < form.images.length - 1 && (
                            <button onClick={() => moveImage(i, i + 1)} className="p-1 rounded bg-white/80 text-gray-700 hover:bg-white" title="Move right"><ChevronRight size={12} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed text-sm font-semibold transition-colors disabled:opacity-50"
                  style={{ borderColor: uploadingImage ? '#8fadc8' : '#c7d9ef', color: uploadingImage ? '#8fadc8' : 'var(--izy-blue)', background: '#f7faff' }}
                >
                  {uploadingImage
                    ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg> Uploading…</>
                    : <><Upload size={14} /> Upload from device</>}
                </button>
                {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                  <span className="text-xs" style={{ color: '#94a3b8' }}>or paste URL</span>
                  <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="flex-1 flex items-center gap-2 border rounded-lg px-3 py-2.5" style={{ borderColor: '#e2e8f0' }}>
                    <LinkIcon size={13} style={{ color: '#8fadc8', flexShrink: 0 }} />
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                      placeholder="https://imagedelivery.net/…"
                      className="flex-1 text-sm focus:outline-none bg-transparent"
                      style={{ color: 'var(--izy-navy)' }}
                    />
                  </div>
                  <button onClick={addImageUrl} disabled={!newImageUrl.trim()} className="px-3 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition-opacity hover:opacity-90" style={{ background: 'var(--izy-blue)' }}>Add</button>
                </div>
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>First image is the cover. Hover to reorder or remove.</p>
              </Field>

              {/* Title */}
              <Field label="Title *">
                <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. 150kW Commercial Solar Farm" className={inputCls} style={inputStyle} />
              </Field>

              {/* Slug */}
              <Field label="Slug *">
                <div className="flex items-center gap-2 border rounded-lg px-3.5 py-2.5" style={{ borderColor: '#e2e8f0' }}>
                  <span className="text-xs select-none shrink-0" style={{ color: '#94a3b8' }}>/projects/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => { slugManual.current = true; setf('slug', slugify(e.target.value)); }}
                    placeholder="auto-generated-from-title"
                    className="flex-1 text-sm focus:outline-none bg-transparent font-mono"
                    style={{ color: 'var(--izy-navy)' }}
                  />
                </div>
              </Field>

              {/* Category + Year */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category *">
                  <select value={form.category} onChange={e => setf('category', e.target.value)} className={inputCls} style={inputStyle}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Year">
                  <input type="text" value={form.year} onChange={e => setf('year', e.target.value)} placeholder="2024" className={inputCls} style={inputStyle} />
                </Field>
              </div>

              {/* Location */}
              <Field label="Location">
                <input type="text" value={form.location} onChange={e => setf('location', e.target.value)}
                  placeholder="e.g. Trans Amadi, Port Harcourt" className={inputCls} style={inputStyle} />
              </Field>

              {/* Short description */}
              <Field label="Short Description">
                <textarea rows={2} value={form.short_description} onChange={e => setf('short_description', e.target.value)}
                  placeholder="One or two sentences shown on the project card…" className={inputCls + ' resize-none'} style={inputStyle} />
              </Field>

              {/* Full description */}
              <Field label="Full Description">
                <textarea rows={5} value={form.full_description} onChange={e => setf('full_description', e.target.value)}
                  placeholder="Full project write-up shown on the detail page…" className={inputCls + ' resize-none'} style={inputStyle} />
              </Field>

              {/* Result metric */}
              <Field label="Project Result">
                <input type="text" value={form.result_metric} onChange={e => setf('result_metric', e.target.value)}
                  placeholder="e.g. 78% bill reduction" className={inputCls} style={inputStyle} />
              </Field>

              {/* Services */}
              <Field label="Services Involved">
                {form.services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.services.map(s => (
                      <span key={s} className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: '#f0f6ff', color: 'var(--izy-blue)' }}>
                        {s}
                        <button onClick={() => removeService(s)} className="ml-0.5 hover:opacity-70"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" value={newService} onChange={e => setNewService(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
                    placeholder="e.g. Solar Installation" className={inputCls} style={inputStyle} />
                  <button onClick={addService} disabled={!newService.trim()}
                    className="px-3 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
                    style={{ background: 'var(--izy-blue)' }}>Add</button>
                </div>
              </Field>

              {/* Sort order */}
              <Field label="Sort Order">
                <input type="number" value={form.sort_order} onChange={e => setf('sort_order', parseInt(e.target.value) || 0)}
                  className={inputCls} style={inputStyle} />
                <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Lower number appears first on the public page.</p>
              </Field>

              {/* Toggles */}
              <div className="flex gap-6 pt-1">
                <Toggle label="Published" value={form.published} onChange={v => setf('published', v)} />
                <Toggle label="Featured on homepage" value={form.featured} onChange={v => setf('featured', v)} />
              </div>

              {error && (
                <p className="flex items-center gap-2 text-sm px-3 py-2.5 rounded-lg" style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626' }}>
                  <AlertCircle size={14} /> {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 border-t px-5 py-5 sm:px-7" style={{ borderColor: '#eef1f6' }}>
              <button onClick={closeForm}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-gray-50"
                style={{ borderColor: '#e2e8f0', color: '#5a6a82' }}>Cancel</button>
              <button onClick={save} disabled={saving || !form.title.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--izy-blue)' }}>
                {saving
                  ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                  : <Save size={15} />}
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </DashboardLayout>
  );
}

/* ── Helpers ── */
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
    <button type="button" onClick={() => onChange(!value)}
      className="flex items-center gap-2.5 text-sm font-medium transition-colors"
      style={{ color: value ? 'var(--izy-navy)' : '#94a3b8' }}>
      {value
        ? <ToggleRight size={22} style={{ color: '#10B981' }} />
        : <ToggleLeft size={22} style={{ color: '#cbd5e1' }} />}
      {label}
    </button>
  );
}
