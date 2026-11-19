import { useEffect, useState } from 'react';
import { ExternalLink, Eye, FileText } from 'lucide-react';
import { authJson } from '../../lib/adminApi';
import { getToken } from '../../lib/auth';

const API = import.meta.env.VITE_API_URL ?? '';

async function downloadLog(format: 'md' | 'jsonl') {
  const token = getToken();
  if (!token) return;
  const response = await fetch(`${API}/api/dev/previews/export.${format}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Could not download the preview log.');
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = format === 'md' ? 'PREVIEW_LOG.md' : 'preview-events.jsonl';
  link.click();
  URL.revokeObjectURL(objectUrl);
}
import { Link } from 'react-router';
import { DevDashboardLayout } from '../admin/DevDashboardLayout';

const previewGroups = [
  {
    title: 'Website pages',
    description: 'Cloned production pages and proposed page updates.',
    pages: [
      {
        title: 'About Us — Baseline Clone',
        description: 'An unchanged copy of the current production About Us page. This is the starting point before leadership content is added.',
        category: 'Company',
        status: 'Baseline clone',
        updated: '19 November 2026',
        href: '/dev/previews/about-us',
      },
    ],
  },
];

interface PreviewEvent {
  id: number;
  event_type: string;
  page_title: string;
  page_url: string;
  actor: string;
  created_at: string;
}

export function PagePreviewsPage() {
  const [events, setEvents] = useState<PreviewEvent[]>([]);

  useEffect(() => {
    let active = true;
    authJson<{ data: PreviewEvent[] }>('/api/dev/previews/events?limit=12', {}, '/dev/login')
      .then(result => { if (active) setEvents(result.data || []); })
      .catch(() => { if (active) setEvents([]); });
    return () => { active = false; };
  }, []);

  return (
    <DevDashboardLayout>
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Eye size={18} />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600">Developer workspace</p>
          </div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Page Previews</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Review unpublished page work and production-page clones without changing the live website.
            Each preview opens separately so you can keep this catalogue available.
          </p>
        </div>

        {previewGroups.map(group => (
          <section key={group.title} className="mb-8">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-[#1a1a2e]">{group.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{group.description}</p>
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              {group.pages.map(page => (
                <article key={page.href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <FileText size={20} />
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">{page.status}</span>
                  </div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{page.category}</p>
                  <h3 className="text-lg font-semibold text-[#1a1a2e]">{page.title}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{page.description}</p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-400">Last updated: {page.updated}</span>
                    <a
                      href={page.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a2e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f26522]"
                    >
                      Open preview <ExternalLink size={15} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#1a1a2e]">Recent activity</h2>
            <p className="mt-1 text-sm text-slate-500">Recorded preview events, with timestamps supplied by the server.</p>
          </div>
          {events.length ? (
            <div className="divide-y divide-slate-100">
              {events.map(event => (
                <div key={event.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium capitalize text-slate-700">{event.event_type.replace(/_/g, ' ')}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{event.page_title || event.page_url} · {event.actor}</p>
                  </div>
                  <time className="text-xs text-slate-400">{new Date(event.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Lagos' })}</time>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No activity has been recorded yet.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-100 pt-4 text-xs font-semibold">
            <button type="button" onClick={() => void downloadLog('md')} className="text-orange-600 hover:underline">Download Markdown log</button>
            <button type="button" onClick={() => void downloadLog('jsonl')} className="text-orange-600 hover:underline">Download JSONL log</button>
          </div>
        </section>
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-5 text-sm leading-6 text-slate-500">
          New preview pages will appear here under their relevant categories. Page history and activity logging will be connected to the preview-management API before this workspace is treated as production-ready.
        </div>
        <p className="mt-5 text-xs text-slate-400"><Link to="/dev/dashboard" className="underline underline-offset-4">Back to Command Centre</Link></p>
      </div>
    </DevDashboardLayout>
  );
}
