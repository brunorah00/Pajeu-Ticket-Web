import { getApiBaseUrl } from './config';

export function apiMessage(data: unknown, fallback: string): string {
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return fallback;
}

export async function proxyAuthPost(path: string, body: unknown) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function proxyAuthGet(path: string) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: { Accept: 'application/json' },
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}
