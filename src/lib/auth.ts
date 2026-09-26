const TOKEN_KEY = 'izy_admin_token';

export interface AuthUser {
  email: string;
  role: 'admin' | 'developer';
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function parseToken(token: string): AuthUser | null {
  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return null;

    // JWT payloads use base64url, while browser atob expects regular base64.
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')));
    if (typeof payload.email !== 'string' || !['admin', 'developer'].includes(payload.role)) {
      return null;
    }

    // The API signs sessions with an expiry. Treat an expired token as logged
    // out before rendering a protected route or making another API request.
    if (typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return { email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  const user = parseToken(token);
  if (!user) removeToken();
  return user;
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

export function isDeveloper(): boolean {
  return getUser()?.role === 'developer';
}

export function loginPathForRoute(pathname: string): '/admin/login' | '/dev/login' {
  return pathname.startsWith('/dev') ? '/dev/login' : '/admin/login';
}
