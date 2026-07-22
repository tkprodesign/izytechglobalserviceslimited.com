import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { api, type SocialPlatform } from '../../lib/api';
import {
  Share2, Save, CheckCircle, AlertCircle,
  Facebook, Twitter, Instagram, MessageCircle, Linkedin, Youtube, Send,
} from 'lucide-react';

// Master list of all supported platforms — order here = order in UI
const PLATFORM_META: Record<string, {
  label: string;
  Icon: React.ElementType;
  placeholder: string;
  hint: string;
}> = {
  facebook:  { label: 'Facebook',    Icon: Facebook,       placeholder: 'https://facebook.com/yourpage',    hint: 'Full URL to your Facebook page' },
  instagram: { label: 'Instagram',   Icon: Instagram,      placeholder: 'https://instagram.com/yourprofile', hint: 'Full URL to your Instagram profile' },
  whatsapp:  { label: 'WhatsApp',    Icon: MessageCircle,  placeholder: 'https://wa.me/2348101262814',      hint: 'Format: https://wa.me/COUNTRYCODENUMBER — no +, spaces or dashes' },
  x:         { label: 'X (Twitter)', Icon: Twitter,        placeholder: 'https://x.com/yourhandle',         hint: 'Full URL to your X / Twitter profile' },
  linkedin:  { label: 'LinkedIn',    Icon: Linkedin,       placeholder: 'https://linkedin.com/company/izy', hint: 'Full URL to your LinkedIn company page' },
  youtube:   { label: 'YouTube',     Icon: Youtube,        placeholder: 'https://youtube.com/@izytech',     hint: 'Full URL to your YouTube channel' },
  telegram:  { label: 'Telegram',    Icon: Send,           placeholder: 'https://t.me/izytech',             hint: 'Full URL to your Telegram channel or group' },
};

const PLATFORM_ORDER = ['facebook', 'instagram', 'whatsapp', 'x', 'linkedin', 'youtube', 'telegram'];

export function SocialsPage() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.socials()
      .then(({ platforms: raw }) => {
        // Merge API data with master list so all platforms always appear, in order
        const map = Object.fromEntries(raw.map(p => [p.key, p]));
        const ordered = PLATFORM_ORDER.map(key => map[key] ?? { key, enabled: false, url: '' });
        setPlatforms(ordered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function setEnabled(key: string, enabled: boolean) {
    setPlatforms(prev => prev.map(p => p.key === key ? { ...p, enabled } : p));
  }

  function setUrl(key: string, url: string) {
    setPlatforms(prev => prev.map(p => p.key === key ? { ...p, url } : p));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    try {
      await api.updateSocials({ platforms });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save');
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  const enabledCount = platforms.filter(p => p.enabled).length;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Share2 size={20} className="text-[#F0A20E]" />
            <h1 className="text-xl font-bold text-gray-900">Social Media</h1>
          </div>
          <p className="text-sm text-gray-500 ml-8">
            Toggle which platforms appear in the website footer. Set the URL for each one you turn on.
            {platforms.length > 0 && (
              <span className="ml-2 font-medium text-gray-700">{enabledCount} of {platforms.length} enabled.</span>
            )}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            {platforms.map(({ key, enabled, url }) => {
              const meta = PLATFORM_META[key];
              if (!meta) return null;
              const { label, Icon, placeholder, hint } = meta;
              return (
                <div
                  key={key}
                  className="bg-white rounded-xl border transition-all"
                  style={{ borderColor: enabled ? 'rgba(30,100,200,0.25)' : '#e5e7eb' }}
                >
                  {/* Top row: icon + name + toggle */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                        style={{ background: enabled ? 'var(--izy-navy)' : '#f3f4f6' }}
                      >
                        <Icon size={16} style={{ color: enabled ? '#F0A20E' : '#9ca3af' }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-400">{enabled ? 'Visible in footer' : 'Hidden'}</p>
                      </div>
                    </div>

                    {/* Toggle */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() => setEnabled(key, !enabled)}
                      className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#F0A20E]/40"
                      style={{ background: enabled ? 'var(--izy-blue)' : '#d1d5db' }}
                    >
                      <span
                        className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform mt-0.5 ml-0.5"
                        style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }}
                      />
                    </button>
                  </div>

                  {/* URL input — always visible but dimmed when off */}
                  <div className="px-5 pb-4">
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(key, e.target.value)}
                      placeholder={placeholder}
                      disabled={!enabled}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F0A20E]/40 focus:border-[#F0A20E] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ color: '#1f2937' }}
                    />
                    <p className="text-xs text-gray-400 mt-1">{hint}</p>
                  </div>
                </div>
              );
            })}

            {/* Save bar */}
            <div className="flex items-center justify-between pt-3">
              <div className="text-sm">
                {status === 'saved' && (
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <CheckCircle size={15} /> Saved — changes are live
                  </span>
                )}
                {status === 'error' && (
                  <span className="flex items-center gap-1.5 text-red-600 font-medium">
                    <AlertCircle size={15} /> {errorMsg}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 hover:opacity-90"
                style={{ background: 'var(--izy-blue)' }}
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
