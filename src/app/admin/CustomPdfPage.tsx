import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AlertCircle, CheckCircle, Download, FileText, Loader2 } from 'lucide-react';
import { DevDashboardLayout } from './DevDashboardLayout';
import { getToken, removeToken } from '../../lib/auth';

const API = import.meta.env.VITE_API_URL ?? '';

type FormState = {
  recipientName: string;
  recipientOrganization: string;
  recipientLocation: string;
  documentDate: string;
  title: string;
  system: string;
  finding: string;
  connectedLoads: string;
  operatingHours: string;
  observation: string;
  recommendation: string;
  conclusion: string;
};

const INITIAL_FORM: FormState = {
  recipientName: 'The Manager',
  recipientOrganization: 'The Alternative Bank',
  recipientLocation: 'Port Harcourt, Rivers State.',
  documentDate: '2026-09-22',
  title: 'SOLAR SYSTEM AUDIT REPORT',
  system: '6 kW Hybrid Inverter / 10 kWh Lithium Battery',
  finding: 'Undersized Solar Panel Array',
  connectedLoads: '- 5 Ceiling Fans\n- 2 Freezers\n- 1 HP Inverter Air Conditioner',
  operatingHours: 'The system is used mainly during the daytime and evening hours. The connected appliances are not operated simultaneously, and the actual load varies depending on the appliances in use.',
  observation: 'During system inspection, it was observed that the installed solar panel capacity is inadequate for the 10 kWh lithium battery and 6 kW hybrid inverter.\n\nThe available PV generation is insufficient to provide effective battery charging during the available sunlight hours. This is causing extended charging time and reduced battery availability.',
  recommendation: 'The existing solar panel array should be upgraded by increasing the total PV capacity to a suitable level for the inverter and battery system. This will improve charging performance and ensure the battery can be adequately charged during normal solar hours.',
  conclusion: 'The low PV capacity is the main cause of the poor battery charging performance. PV array upgrade is recommended.',
};

const fields: Array<{
  key: keyof FormState;
  label: string;
  multiline?: boolean;
  wide?: boolean;
}> = [
  { key: 'recipientName', label: 'Recipient name' },
  { key: 'recipientOrganization', label: 'Organisation' },
  { key: 'recipientLocation', label: 'Location' },
  { key: 'documentDate', label: 'Date' },
  { key: 'title', label: 'Document title', wide: true },
  { key: 'system', label: 'System', wide: true },
  { key: 'finding', label: 'Primary finding', wide: true },
  { key: 'connectedLoads', label: 'Connected loads', multiline: true, wide: true },
  { key: 'operatingHours', label: 'Operating hours', multiline: true, wide: true },
  { key: 'observation', label: 'Observation', multiline: true, wide: true },
  { key: 'recommendation', label: 'Recommendation', multiline: true, wide: true },
  { key: 'conclusion', label: 'Conclusion', multiline: true, wide: true },
];

export function CustomPdfPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const navigate = useNavigate();

  function updateField(key: keyof FormState, value: string) {
    setForm(current => ({ ...current, [key]: value }));
    setStatus(null);
  }

  async function downloadPdf() {
    setGenerating(true);
    setStatus(null);

    try {
      const response = await fetch(`${API}/api/dev/custom-documents/letterhead-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.status === 401 || response.status === 403) {
        removeToken();
        navigate('/dev/login');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'PDF generation failed.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${form.title.trim().replace(/[^a-z0-9]+/gi, '_') || 'custom-report'}_${form.documentDate || 'undated'}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setStatus({ type: 'success', message: 'PDF downloaded successfully.' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'PDF generation failed.',
      });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <DevDashboardLayout>
      <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'rgba(242,101,34,0.15)' }}>
                <FileText size={16} style={{ color: '#f26522' }} />
              </div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--izy-navy)' }}>Letterhead PDF</h1>
            </div>
            <p className="text-sm" style={{ color: '#5a6a82' }}>
              Create and download a branded custom report using the invoice letterhead.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={generating}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: '#f26522' }}
          >
            {generating ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
            {generating ? 'Generating…' : 'Download PDF'}
          </button>
        </div>

        {status && (
          <div
            className="mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{
              background: status.type === 'success' ? 'rgba(57,181,74,0.1)' : 'rgba(212,24,61,0.1)',
              color: status.type === 'success' ? 'var(--izy-green)' : 'var(--destructive)',
            }}
          >
            {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {status.message}
          </div>
        )}

        <form
          className="space-y-6"
          onSubmit={event => {
            event.preventDefault();
            void downloadPdf();
          }}
        >
          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-sm font-semibold" style={{ color: 'var(--izy-navy)' }}>Document details</h2>
              <p className="mt-1 text-xs" style={{ color: '#8fadc8' }}>The fields below are prefilled for the Alternative Bank solar audit report. Clear the recipient fields to create a general report with no addressee.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(field => (
                <label key={field.key} className={field.wide ? 'sm:col-span-2' : ''}>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide" style={{ color: '#5a6a82' }}>
                    {field.label}
                  </span>
                  {field.multiline ? (
                    <textarea
                      value={form[field.key]}
                      onChange={event => updateField(field.key, event.target.value)}
                      rows={field.key === 'observation' ? 6 : 4}
                      className="w-full resize-y rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
                      style={{ borderColor: '#dbe3ee', color: 'var(--izy-navy)', ['--tw-ring-color' as string]: '#f26522' }}
                    />
                  ) : (
                    <input
                      type={field.key === 'documentDate' ? 'date' : 'text'}
                      value={form[field.key]}
                      onChange={event => updateField(field.key, event.target.value)}
                      className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2"
                      style={{ borderColor: '#dbe3ee', color: 'var(--izy-navy)', ['--tw-ring-color' as string]: '#f26522' }}
                    />
                  )}
                </label>
              ))}
            </div>
          </section>

          <div className="flex items-start gap-2 rounded-xl border px-4 py-3 text-xs" style={{ borderColor: '#dbe3ee', color: '#5a6a82' }}>
            <FileText size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#f26522' }} />
            The downloaded PDF includes the IZY logo, company header, footer, page numbering, and explicit pagination for longer report text.
          </div>
        </form>
      </div>
    </DevDashboardLayout>
  );
}