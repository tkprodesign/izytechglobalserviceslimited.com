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
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export function getUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  return parseToken(token);
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}

export function isDeveloper(): boolean {
  return getUser()?.role === 'developer';
}
