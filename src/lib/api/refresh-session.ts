import { getApiBaseUrl } from './config';
import { ApiRequestError } from './http';
import type { AuthUser } from '@/lib/auth/types';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '@/lib/auth/storage';
import { isAccessTokenExpired, notifyAuthUpdated } from '@/lib/auth/token';

type RefreshResponse = {
  token: string;
  refreshToken: string;
  login: string;
  nome: string;
  role: AuthUser['role'];
};

let refreshPromise: Promise<AuthUser | null> | null = null;

export async function refreshStoredSession(): Promise<AuthUser | null> {
  const stored = getStoredAuth();
  if (!stored?.refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken: stored.refreshToken }),
        });

        const data = (await res.json()) as RefreshResponse & { message?: string };
        if (!res.ok) {
          clearStoredAuth();
          notifyAuthUpdated();
          return null;
        }

        const user: AuthUser = {
          token: data.token,
          refreshToken: data.refreshToken,
          login: data.login,
          nome: data.nome,
          role: data.role,
        };
        setStoredAuth(user);
        notifyAuthUpdated();
        return user;
      } catch {
        clearStoredAuth();
        notifyAuthUpdated();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

export async function ensureValidAccessToken(token: string): Promise<string> {
  const stored = getStoredAuth();
  if (!stored || stored.token !== token) return token;

  if (!isAccessTokenExpired(token)) return token;

  const refreshed = await refreshStoredSession();
  if (!refreshed) {
    throw new ApiRequestError('Sessão expirada. Faça login novamente.', 401);
  }
  return refreshed.token;
}
