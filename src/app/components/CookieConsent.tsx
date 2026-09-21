import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  COOKIE_CONSENT_EVENT,
  readCookiePreferences,
  saveCookiePreferences,
  type CookiePreferences,
} from '../../lib/cookieConsent';

const ANALYTICS_CONSENT_VERSION = 'v1';
const SESSION_KEY = 'izy-site-analytics-session';
const API = import.meta.env.VITE_API_URL ?? '';

const DEFAULT_PREFERENCES: CookiePreferences = {
  analytics: false,
};

type LegacyConsent = 'granted' | 'denied' | null;

function isPrivateRoute(pathname: string) {
  return pathname.startsWith('/admin') || pathname.startsWith('/dev');
}

function analyticsRoute(pathname: string) {
  if (/^\/assessment\/[^/]+$/.test(pathname)) return '/assessment/:token';
  if (/^\/projects\/[^/]+$/.test(pathname)) return '/projects/:slug';
  return pathname || '/';
}

function coarseBucket(value: number) {
  if (value < 768) return 'small';
  if (value < 1280) return 'medium';
  return 'large';
}

function coarseTimezone() {
  const offset = -new Date().getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absolute = Math.abs(offset);
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0');
  const minutes = String(absolute % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
}

function getSessionId() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) return existing;

    const generated = typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID().replace(/-/g, '')
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(SESSION_KEY, generated);
    return generated;
  } catch {
    return null;
  }
}

function getReferrerOrigin() {
  try {
    if (!document.referrer) return null;
    const referrer = new URL(document.referrer);
    if (referrer.origin === window.location.origin) return null;
    return referrer.origin;
  } catch {
    return null;
  }
}

function readLegacyAnalyticsConsent(): LegacyConsent {
  try {
    const value = window.localStorage.getItem('izy-site-analytics-consent');
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

function getInitialPreferences() {
  const saved = readCookiePreferences();
  if (saved) return saved;

  // Migrate the previous analytics-only choice into the new cookie preferences.
  const legacy = readLegacyAnalyticsConsent();
  if (!legacy) return null;
  return { analytics: legacy === 'granted' };
}

function sendVisit(pathname: string) {
  if (navigator.doNotTrack === '1') return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string };
  }).connection;

  fetch(`${API}/api/analytics/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      route: analyticsRoute(pathname),
      referrerOrigin: getReferrerOrigin(),
      sessionId,
      language: navigator.language?.slice(0, 16) || null,
      timezone: coarseTimezone(),
      screenBucket: coarseBucket(window.screen?.width || window.innerWidth || 0),
      viewportBucket: coarseBucket(window.innerWidth || 0),
      connectionType: connection?.effectiveType || null,
      consentVersion: ANALYTICS_CONSENT_VERSION,
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never affect the visitor's page.
  });
}

function sendPresence(pathname: string) {
  if (navigator.doNotTrack === '1') return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string };
  }).connection;

  fetch(`${API}/api/analytics/presence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      route: analyticsRoute(pathname),
      referrerOrigin: getReferrerOrigin(),
      sessionId,
      language: navigator.language?.slice(0, 16) || null,
      timezone: coarseTimezone(),
      screenBucket: coarseBucket(window.screen?.width || window.innerWidth || 0),
      viewportBucket: coarseBucket(window.innerWidth || 0),
      connectionType: connection?.effectiveType || null,
      consentVersion: ANALYTICS_CONSENT_VERSION,
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never affect the visitor's page.
  });
}

function PreferenceToggle({
  checked,
  title,
  description,
  disabled = false,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-white/55">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={event => onChange?.(event.target.checked)}
        className="mt-1 h-4 w-4 accent-[#F0A20E]"
      />
    </label>
  );
}

export function CookieConsent() {
  const { pathname } = useLocation();
  const [preferences, setPreferences] = useState<CookiePreferences | null>(() => (
    typeof window === 'undefined' ? null : getInitialPreferences()
  ));
  const [draft, setDraft] = useState<CookiePreferences>(preferences ?? DEFAULT_PREFERENCES);
  const [manageOpen, setManageOpen] = useState(false);

  useEffect(() => {
    function handleOpenSettings() {
      setDraft(preferences ?? DEFAULT_PREFERENCES);
      setManageOpen(true);
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, handleOpenSettings);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleOpenSettings);
  }, [preferences]);

  useEffect(() => {
    if (preferences?.analytics && !isPrivateRoute(pathname)) {
      sendVisit(pathname);
      sendPresence(pathname);
      const presenceTimer = window.setInterval(() => sendPresence(pathname), 30_000);
      return () => window.clearInterval(presenceTimer);
    }
    return undefined;
  }, [pathname, preferences]);

  if (isPrivateRoute(pathname)) return null;

  function save(preferencesToSave: CookiePreferences) {
    saveCookiePreferences(preferencesToSave);
    setPreferences(preferencesToSave);
    setDraft(preferencesToSave);
    setManageOpen(false);
  }

  if (!manageOpen && preferences) return null;

  if (manageOpen) {
    return (
      <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#041627]/70 p-3 sm:items-center">
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#041627] p-5 text-white shadow-2xl sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#F0A20E]">Cookie settings</p>
              <h2 id="cookie-settings-title" className="mt-2 text-xl font-bold">Choose what we can use</h2>
            </div>
            <button type="button" onClick={() => setManageOpen(false)} className="text-sm text-white/55 hover:text-white">
              Close
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Necessary storage and support chat are always active. Analytics is optional and can be changed at any time.
          </p>
          <div className="mt-5 space-y-3">
            <PreferenceToggle
              checked
              disabled
              title="Necessary"
              description="Keeps the site secure and remembers essential operation settings."
            />
            <PreferenceToggle
              checked={draft.analytics}
              title="Analytics"
              description="Allows coarse, consent-based visit measurement. We do not store raw IP addresses, raw user-agent strings, form contents, or persistent visitor IDs."
              onChange={value => setDraft(current => ({ ...current, analytics: value }))}
            />
            <PreferenceToggle
              checked
              disabled
              title="Support chat"
              description="Smartsupp is always available so you can contact our support team. The provider may set its own chat cookies."
            />
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => save(DEFAULT_PREFERENCES)}
              className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white/75 hover:border-white/40 hover:text-white"
            >
              Only necessary
            </button>
            <button
              type="button"
              onClick={() => save(draft)}
              className="rounded-lg bg-[#F0A20E] px-4 py-2.5 text-sm font-bold text-[#041627] hover:bg-[#ffb830]"
            >
              Save preferences
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <aside
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#041627] p-4 text-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">We use cookies and similar storage</p>
          <p className="mt-1 text-xs leading-relaxed text-white/65">
            Necessary storage and support chat are always active. With your permission, analytics helps us understand visits.
            {' '}<Link to="/cookies" className="font-semibold text-[#F0A20E] hover:text-[#ffb830]">See our cookie policy.</Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save(DEFAULT_PREFERENCES)}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/40 hover:text-white"
          >
            Only necessary
          </button>
          <button
            type="button"
            onClick={() => setManageOpen(true)}
            className="rounded-lg border border-[#F0A20E]/50 px-3 py-2 text-xs font-semibold text-[#F0A20E] transition hover:border-[#F0A20E] hover:text-[#ffb830]"
          >
            Manage
          </button>
          <button
            type="button"
            onClick={() => save({ analytics: true })}
            className="rounded-lg bg-[#F0A20E] px-3 py-2 text-xs font-bold text-[#041627] transition hover:bg-[#ffb830]"
          >
            Allow analytics
          </button>
        </div>
      </div>
    </aside>
  );
}