export const COOKIE_CONSENT_COOKIE = 'izy_cookie_consent';
export const COOKIE_CONSENT_VERSION = 'v2';
export const COOKIE_CONSENT_EVENT = 'izy:open-cookie-settings';

export interface CookiePreferences {
  analytics: boolean;
  support: boolean;
}

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function parsePreferences(value: string | undefined): CookiePreferences | null {
  if (!value) return null;

  try {
    const decoded = decodeURIComponent(value);
    const [version, analytics, support] = decoded.split('|');
    if (version !== COOKIE_CONSENT_VERSION) return null;
    if (analytics !== 'a0' && analytics !== 'a1') return null;
    if (support !== 's0' && support !== 's1') return null;
    return {
      analytics: analytics === 'a1',
      support: support === 's1',
    };
  } catch {
    return null;
  }
}

export function readCookiePreferences(): CookiePreferences | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith(`${COOKIE_CONSENT_COOKIE}=`));
  return parsePreferences(match?.slice(COOKIE_CONSENT_COOKIE.length + 1));
}

export function saveCookiePreferences(preferences: CookiePreferences) {
  if (typeof document === 'undefined') return;
  const value = encodeURIComponent(
    `${COOKIE_CONSENT_VERSION}|${preferences.analytics ? 'a1' : 'a0'}|${preferences.support ? 's1' : 's0'}`,
  );
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_CONSENT_COOKIE}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function openCookieSettings() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT));
  }
}