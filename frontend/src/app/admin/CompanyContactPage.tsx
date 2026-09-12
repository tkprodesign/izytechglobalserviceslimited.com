import { useEffect, useState } from 'react';
import { MapPin, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { api, type CompanyContact } from '../../lib/api';
import { DEFAULT_COMPANY_CONTACT, formatCompanyAddress } from '../hooks/useCompanyContact';

type Status = 'idle' | 'saved' | 'error';

export function CompanyContactPage() {
  const [contact, setContact] = useState<CompanyContact>(DEFAULT_COMPANY_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    api.companyContact()
      .then(({ data }) => setContact(data))
      .catch(error => {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load company address');
      })
      .finally(() => setLoading(false));
  }, []);

  function update(field: keyof CompanyContact, value: string) {
    setContact(current => ({ ...current, [field]: value }));
    setStatus('idle');
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setStatus('idle');

    try {
      const { data } = await api.updateCompanyContact({ data: contact });
      setContact(data);
      setStatus('saved');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save company address');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="mb-1 flex items-center gap-3">
            <MapPin size={20} className="text-[#F0A20E]" />
            <h1 className="text-xl font-bold text-gray-900">Company Address</h1>
          </div>
          <p className="ml-8 text-sm text-gray-500">
            Update the head-office address shown on the public contact sections.
          </p>
        </div>

        <form onSubmit={handleSave} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(item => <div key={item} className="h-10 animate-pulse rounded-lg bg-gray-100" />)}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ['addressLine1', 'Address line 1', 'No 1 Pathfinder close'],
                  ['addressLine2', 'Address line 2', 'Sandfield, Borikiri'],
                  ['city', 'City', 'Port Harcourt'],
                  ['state', 'State', 'Rivers State'],
                ] as const).map(([field, label, placeholder]) => (
                  <label key={field} className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
                    <input
                      value={contact[field]}
                      onChange={event => update(field, event.target.value)}
                      placeholder={placeholder}
                      required={field !== 'addressLine2'}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#F0A20E] focus:ring-2 focus:ring-[#F0A20E]/20"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-[#e5ebf1] bg-[#f8fafc] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Public address preview</p>
                <p className="mt-1 text-sm font-medium text-[#041627]">{formatCompanyAddress(contact)}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  {status === 'saved' && <span className="flex items-center gap-1.5 font-medium text-green-600"><CheckCircle size={15} /> Saved — changes are live</span>}
                  {status === 'error' && <span className="flex items-center gap-1.5 font-medium text-red-600"><AlertCircle size={15} /> {errorMessage}</span>}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--izy-blue)' }}
                >
                  <Save size={15} />
                  {saving ? 'Saving…' : 'Save Address'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}