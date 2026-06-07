export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string, skewMs = 30_000): boolean {
  const payload = decodeJwtPayload(token);
  const exp = payload?.exp;
  if (typeof exp !== 'number') return true;
  return exp * 1000 <= Date.now() + skewMs;
}

export const AUTH_UPDATED_EVENT = 'pajeu-auth-updated';

export function notifyAuthUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
  }
}
