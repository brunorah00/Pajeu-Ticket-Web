import type { AuthUser } from './types';

const STORAGE_KEY = 'pajeu_auth';

export function getStoredAuth(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed.token || !parsed.login) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAuth(user: AuthUser): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAuthToken(): string | null {
  return getStoredAuth()?.token ?? null;
}
