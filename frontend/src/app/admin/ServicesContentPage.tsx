import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Image, Palette, Save, Wrench } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { api, type ServiceContent } from '../../lib/api';
import { serviceContent } from '../data/services';

function blankServiceContent(): ServiceContent[] {
  return serviceContent.map(({ id, num, title, description, features, image, color, featured }) => ({
    id, num, title, description, features: [...features], image, color, featured,
  }));
}

export function ServicesContentPage() {
  const [services, setServices] = useState<ServiceContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.services()
      .then(({ data }) => setServices(data))
      .catch(() => setServices(blankServiceContent()))
      .finally(() => setLoading(false));
  }, []);

  function updateService(id: string, patch: Partial<ServiceContent>) {
    setServices(current => current.map(service => (
      service.id === id ? { ...service, ...patch } : service
    )));
    setStatus('idle');
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus('idle');
    setErrorMsg('');
    try {
      await api.updateServices({ services });
      setStatus('saved');
      window.setTimeout(() => setStatus('idle'), 4000);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to save service content');
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl p-5 sm:p-8">
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-3">
            <Wrench size={20} className="text-[#F0A20E]" />
            <h1 className="text-xl font-bold text-gray-900">Services Content</h1>
          </div>
          <p className="ml-8 max-w-2xl text-sm leading-relaxed text-gray-500">
            Edit the cards shown on the homepage and the full Services page. The card order and stable service IDs are fixed so links and quote forms keep working.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(item => <div key={item} className="h-64 animate-pulse rounded-2xl bg-gray-100" />)}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {services.map((service) => (
              <section key={service.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#F0A20E]">{service.num}</span>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">{service.title || 'Untitled service'}</h2>
                      <p className="text-xs text-gray-400">ID: {service.id}</p>
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={service.featured}
                      onChange={event => updateService(service.id, { featured: event.target.checked })}
                      className="h-4 w-4 accent-[#F0A20E]"
                    />
                    Show “Popular”
                  </label>
                </div>

                <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Card title</span>
                      <input
                        required
                        value={service.title}
                        onChange={event => updateService(service.id, { title: event.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#F0A20E] focus:ring-2 focus:ring-[#F0A20E]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Writeup</span>
                      <textarea
                        required
                        rows={4}
                        value={service.description}
                        onChange={event => updateService(service.id, { description: event.target.value })}
                        className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-relaxed text-gray-900 outline-none transition focus:border-[#F0A20E] focus:ring-2 focus:ring-[#F0A20E]/20"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Feature bullets</span>
                      <textarea
                        required
                        rows={6}
                        value={service.features.join('\n')}
                        onChange={event => updateService(service.id, {
                          features: event.target.value.split('\n').map(item => item.trim()).filter(Boolean),
                        })}
                        className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2.5 text-sm leading-relaxed text-gray-900 outline-none transition focus:border-[#F0A20E] focus:ring-2 focus:ring-[#F0A20E]/20"
                      />
                      <span className="mt-1 block text-xs text-gray-400">One bullet per line. The homepage shows the first four; the full Services page shows all.</span>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <label className="block">
                      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500"><Image size={13} /> Image URL</span>
                      <input
                        required
                        value={service.image}
                        onChange={event => updateService(service.id, { image: event.target.value })}
                        placeholder="/site-images/example.jpg"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[#F0A20E] focus:ring-2 focus:ring-[#F0A20E]/20"
                      />
                    </label>

                    <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <img src={service.image} alt="" className="h-32 w-full object-cover" onError={event => { event.currentTarget.style.display = 'none'; }} />
                      <p className="px-3 py-2 text-xs text-gray-400">Preview</p>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500"><Palette size={13} /> Accent color</span>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={/^#[0-9a-f]{6}$/i.test(service.color) ? service.color : '#F0A20E'}
                          onChange={event => updateService(service.id, { color: event.target.value })}
                          className="h-10 w-12 cursor-pointer rounded border border-gray-200 bg-white p-1"
                        />
                        <input
                          required
                          value={service.color}
                          onChange={event => updateService(service.id, { color: event.target.value })}
                          className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-[#F0A20E] focus:ring-2 focus:ring-[#F0A20E]/20"
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </section>
            ))}

            <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
              <div className="text-sm">
                {status === 'saved' && <span className="flex items-center gap-1.5 font-medium text-green-600"><CheckCircle size={15} /> Saved — changes are live</span>}
                {status === 'error' && <span className="flex items-center gap-1.5 font-medium text-red-600"><AlertCircle size={15} /> {errorMsg}</span>}
                {status === 'idle' && <span className="text-xs text-gray-400">{services.length} service cards</span>}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-[#1a56db] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                <Save size={15} />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}