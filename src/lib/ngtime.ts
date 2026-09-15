/**
 * Nigeria-wide date/time formatting (Africa/Lagos, UTC+1, no DST).
 * Every timestamp shown anywhere on the site must use these helpers so the
 * whole business — a Nigerian company — always reads Nigerian time,
 * regardless of the visitor's device timezone or the server's timezone.
 */

export const NG_TIMEZONE = 'Africa/Lagos';
const NG_LOCALE = 'en-NG';

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/** "13 Sept 2026" */
export function ngDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleDateString(NG_LOCALE, {
    timeZone: NG_TIMEZONE,
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** "13 Sept 2026, 14:35" */
export function ngDateTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleString(NG_LOCALE, {
    timeZone: NG_TIMEZONE,
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

/** "14:35" */
export function ngTime(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleTimeString(NG_LOCALE, {
    timeZone: NG_TIMEZONE,
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

/** "13 Sept 2026, 14:35 WAT" — used where clarity about the timezone matters */
export function ngDateTimeWAT(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleString(NG_LOCALE, {
    timeZone: NG_TIMEZONE,
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZoneName: 'short',
  });
}

/**
 * Smart relative label for message lists: time today, weekday within a week,
 * otherwise a short date — all evaluated in Nigeria time.
 */
export function ngSmartDate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '';
  const now = new Date();
  const dayStart = (x: Date) =>
    Number(new Date(x.toLocaleDateString('en-US', { timeZone: NG_TIMEZONE })));
  const today = dayStart(now);
  const then = dayStart(d);
  const diffDays = Math.round((today - then) / 86400000);

  if (diffDays <= 0) return ngTime(d);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) {
    return d.toLocaleDateString(NG_LOCALE, { timeZone: NG_TIMEZONE, weekday: 'short' });
  }
  return d.toLocaleDateString(NG_LOCALE, { timeZone: NG_TIMEZONE, day: 'numeric', month: 'short' });
}

/** d/M/yyyy in Nigeria time — for native <input type="date"> comparisons */
export function ngISODate(value: string | Date | null | undefined): string {
  const d = toDate(value);
  if (!d) return '';
  return d.toLocaleDateString('en-CA', { timeZone: NG_TIMEZONE }); // yyyy-mm-dd
}
