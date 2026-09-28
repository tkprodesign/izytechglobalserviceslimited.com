import { getToken, loginPathForRoute, removeToken } from './auth';

const API = import.meta.env.VITE_API_URL ?? '';

type LoginPath = '/admin/login' | '/dev/login';

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function redirectToLogin(loginPath?: LoginPath) {
  removeToken();
  if (typeof window === 'undefined') return;
  const target = loginPath ?? loginPathForRoute(window.location.pathname);
  if (window.location.pathname !== target) window.location.replace(target);
}

export async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  config: { auth?: boolean; loginPath?: LoginPath } = {},
): Promise<T> {
  const auth = config.auth !== false;
  const headers = new Headers(options.headers);

  if (auth) {
    const token = getToken();
    if (!token) {
      redirectToLogin(config.loginPath);
      throw new ApiRequestError('Your session has expired. Please sign in again.', 401);
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API}${path}`, { ...options, headers });
  const body = await parseResponse(response);

  if (auth && (response.status === 401 || response.status === 403)) {
    redirectToLogin(config.loginPath);
  }

  if (!response.ok) {
    const message = body && typeof body === 'object' && 'error' in body
      ? String((body as { error?: unknown }).error || `Request failed (${response.status})`)
      : `Request failed (${response.status})`;
    throw new ApiRequestError(message, response.status);
  }

  return body as T;
}

export function authJson<T>(path: string, options: RequestInit = {}, loginPath?: LoginPath) {
  return requestJson<T>(path, options, { auth: true, loginPath });
}

export function publicJson<T>(path: string, options: RequestInit = {}) {
  return requestJson<T>(path, options, { auth: false });
}
