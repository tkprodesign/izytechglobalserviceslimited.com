import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

const CONSENT_KEY = 'izy-site-analytics-consent';
const SESSION_KEY = 'izy-site-analytics-session';
const CONSENT_VERSION = 'v1';
const API = import.meta.env.VITE_API_URL ?? '';

type Consent = 'unknown' | 'granted' | 'denied';

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

function readConsent(): Consent {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : 'unknown';
  } catch {
    return 'unknown';
  }
}

function saveConsent(value: Exclude<Consent, 'unknown'>) {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // A storage-restricted browser should simply keep the choice in memory.
  }
}

function sendVisit(pathname: string) {
  if (navigator.doNotTrack === '1') return;
  const sessionId = getSessionId();
  if (!sessionId) return;

  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string };
  }).connection;

  const payload = {
    route: analyticsRoute(pathname),
    referrerOrigin: getReferrerOrigin(),
    sessionId,
    language: navigator.language?.slice(0, 16) || null,
    timezone: coarseTimezone(),
    screenBucket: coarseBucket(window.screen?.width || window.innerWidth || 0),
    viewportBucket: coarseBucket(window.innerWidth || 0),
    connectionType: connection?.effectiveType || null,
    consentVersion: CONSENT_VERSION,
  };

  fetch(`${API}/api/analytics/visit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Analytics must never affect the visitor's page.
  });
}

export function SiteAnalyticsConsent() {
  const { pathname } = useLocation();
  const [consent, setConsent] = useState<Consent>(() => (
    typeof window === 'undefined' ? 'unknown' : readConsent()
  ));

  useEffect(() => {
    if (consent === 'granted' && !isPrivateRoute(pathname)) {
      sendVisit(pathname);
    }
  }, [consent, pathname]);

  if (isPrivateRoute(pathname) || consent !== 'unknown') return null;

  function choose(value: Exclude<Consent, 'unknown'>) {
    saveConsent(value);
    setConsent(value);
  }

  return (
    <aside
      role="dialog"
      aria-label="Site analytics choice"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-white/10 bg-[#041627] p-4 text-white shadow-2xl sm:inset-x-auto sm:bottom-5 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Help us understand site visits</p>
          <p className="mt-1 text-xs leading-relaxed text-white/65">
            With your permission, we collect coarse visit information such as the page,
            device family and browser family. We do not store raw IP addresses, form
            contents, or a persistent identifier.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/75 transition hover:border-white/40 hover:text-white"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="rounded-lg bg-[#F0A20E] px-3 py-2 text-xs font-bold text-[#041627] transition hover:bg-[#ffb830]"
          >
            Allow analytics
          </button>
        </div>
      </div>
    </aside>
  );
}