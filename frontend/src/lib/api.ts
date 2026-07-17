/**
 * IZY Technologies API client
 *
 * Set VITE_API_URL in your Cloudflare Pages environment variables to point at
 * your Railway backend, e.g. https://izytech-website.up.railway.app
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error: string }).error ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export interface ContactPayload {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface QuotePayload {
  name: string;
  email: string;
  company?: string;
  service: string;
  details?: string;
}

export const api = {
  contact: (data: ContactPayload) =>
    post<{ success: boolean }>('/api/contact', data),

  quote: (data: QuotePayload) =>
    post<{ success: boolean }>('/api/quote', data),
};
