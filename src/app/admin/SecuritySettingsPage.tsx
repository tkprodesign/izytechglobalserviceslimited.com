import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { DevDashboardLayout } from './DevDashboardLayout';
import { authJson } from '../../lib/adminApi';
import { getUser, removeToken } from '../../lib/auth';

const RECOVERY_EMAIL = 'izytechgsl@proton.me';

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[#041627]">{label}</label>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={event => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          className="w-full rounded-lg border border-[#dfe5ee] bg-white px-4 py-3 pr-12 text-sm text-[#041627] outline-none transition focus:border-[#1d70c9] focus:ring-2 focus:ring-[#1d70c9]/10"
        />
        <button
          type="button"
          onClick={() => setVisible(current => !current)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#8fadc8] hover:text-[#041627]"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

export function SecuritySettingsPage() {
  const user = getUser();
  const navigate = useNavigate();
  const isDeveloper = user?.role === 'developer';
  const Layout = isDeveloper ? DevDashboardLayout : DashboardLayout;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function requestCode() {
    setError('');
    setMessage('');
    setRequestingCode(true);
    try {
      const result = await authJson<{ success: boolean; destination: string }>('/api/auth/password/change-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, isDeveloper ? '/dev/login' : '/admin/login');
      setCodeSent(true);
      setMessage(`A confirmation code was sent to ${result.destination || RECOVERY_EMAIL}. It expires in 10 minutes.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send confirmation code.');
    } finally {
      setRequestingCode(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }
    if (newPassword.length < 12) {
      setError('Use at least 12 characters for the new password.');
      return;
    }
    if (!/^\d{6}$/.test(confirmationCode.trim())) {
      setError('Enter the 6-digit confirmation code.');
      return;
    }

    setSaving(true);
    try {
      await authJson<{ success: boolean }>('/api/auth/password/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmationCode: confirmationCode.trim(),
        }),
      }, isDeveloper ? '/dev/login' : '/admin/login');

      removeToken();
      navigate(isDeveloper ? '/dev/login' : '/admin/login', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to change password.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1d70c9]/10 text-[#1d70c9]">
              <KeyRound size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#041627]">Password & Security</h1>
              <p className="mt-1 text-sm text-[#5a6a82]">Change the password for your {user?.role} control-panel account.</p>
            </div>
          </div>
        </div>

        <section className="mb-5 rounded-2xl border border-[#d9e8df] bg-[#f5fbf7] p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#16803c]" />
            <div>
              <h2 className="text-sm font-semibold text-[#123b23]">Domain-owner confirmation</h2>
              <p className="mt-1 text-sm leading-relaxed text-[#42624d]">
                Every password change requires a one-time code sent to <strong>{RECOVERY_EMAIL}</strong>, the domain-registration email. Codes expire after 10 minutes and are never shown inside the control panel.
              </p>
            </div>
          </div>
        </section>

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[#eef1f6] bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 text-[#f26522]" />
              <div>
                <p className="text-sm font-semibold text-[#041627]">Confirmation code</p>
                <p className="mt-0.5 text-xs text-[#5a6a82]">Send a fresh 6-digit code before submitting the password change.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={requestCode}
              disabled={requestingCode}
              className="shrink-0 rounded-lg bg-[#041627] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0b2741] disabled:opacity-60"
            >
              {requestingCode ? 'Sending…' : codeSent ? 'Send another code' : 'Send confirmation code'}
            </button>
          </div>

          <form onSubmit={changePassword} className="space-y-5">
            <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
            <PasswordField label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
            <PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#041627]">6-digit confirmation code</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={confirmationCode}
                onChange={event => setConfirmationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                className="w-full rounded-lg border border-[#dfe5ee] bg-white px-4 py-3 font-mono text-lg tracking-[0.35em] text-[#041627] outline-none transition focus:border-[#1d70c9] focus:ring-2 focus:ring-[#1d70c9]/10"
              />
            </div>

            {message && <p className="rounded-lg bg-[#eef8f1] px-4 py-3 text-sm text-[#16803c]">{message}</p>}
            {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="flex flex-col-reverse gap-3 border-t border-[#eef1f6] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-[#8fadc8]">After a successful change, all existing control-panel sessions for this account are invalidated and you will sign in again.</p>
              <button
                type="submit"
                disabled={saving || !codeSent}
                className="shrink-0 rounded-lg bg-[#1d70c9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#155da9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Changing…' : 'Change password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
