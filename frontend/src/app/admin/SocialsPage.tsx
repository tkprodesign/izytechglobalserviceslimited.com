import { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { api, type SocialLinks } from '../../lib/api';
import { Share2, Save, CheckCircle, AlertCircle, Facebook, Twitter, Instagram, MessageCircle } from 'lucide-react';

const PLATFORMS = [
  {
    key: 'facebook' as keyof SocialLinks,
    label: 'Facebook',
    Icon: Facebook,
    placeholder: 'https://facebook.com/izytech',
    hint: 'Full URL to your Facebook page',
  },
  {
    key: 'instagram' as keyof SocialLinks,
    label: 'Instagram',
    Icon: Instagram,
    placeholder: 'https://instagram.com/izytech',
    hint: 'Full URL to your Instagram profile',
  },
  {
    key: 'x' as keyof SocialLinks,
    label: 'X (Twitter)',
    Icon: Twitter,
    placeholder: 'https://x.com/izytech',
    hint: 'Full URL to your X / Twitter profile',
  },
  {
    key: 'whatsapp' as keyof SocialLinks,
    label: 'WhatsApp',
    Icon: MessageCircle,
    placeholder: 'https://wa.me/2348101262814',
    hint: 'Use format: https://wa.me/COUNTRYCODE+NUMBER (no + or spaces)',
  },
] as const;

export function SocialsPage() {
  const [links, setLinks] = useState<SocialLinks>({ facebook: '', instagram: '', x: '', whatsapp: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api.socials()
      .then(setLinks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus('idle');
    try {
      await api.updateSocials(links);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save');
      setStatus('error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Share2 size={20} className="text-[#F0A20E]" />
            <h1 className="text-xl font-bold text-gray-900">Social Media Links</h1>
          </div>
          <p className="text-sm text-gray-500 ml-8">
            Set the social media accounts shown in the website footer. Leave a field blank to hide that platform.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {PLATFORMS.map(({ key, label, Icon, placeholder, hint }) => (
              <div key={key} className="bg-white rounded-xl border border-gray-200 p-5">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Icon size={16} className="text-gray-400" />
                  {label}
                </label>
                <input
                  type="url"
                  value={links[key]}
                  onChange={e => setLinks(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F0A20E]/40 focus:border-[#F0A20E] transition-all"
                />
                <p className="text-xs text-gray-400 mt-1.5">{hint}</p>
              </div>
            ))}

            {/* Footer: status + save */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm">
                {status === 'saved' && (
                  <span className="flex items-center gap-1.5 text-green-600 font-medium">
                    <CheckCircle size={15} /> Saved successfully
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
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
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
