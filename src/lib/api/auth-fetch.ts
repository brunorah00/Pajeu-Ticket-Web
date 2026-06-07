import { getApiBaseUrl } from './config';
import type { ApiError } from './types';
import { ApiRequestError } from './http';
import { ensureValidAccessToken, refreshStoredSession } from './refresh-session';

type AuthFetchOptions = RequestInit & {
  token: string;
  searchParams?: Record<string, string | number | undefined>;
  json?: unknown;
};

async function authFetchOnce<T>(
  url: URL,
  token: string,
  options: Omit<AuthFetchOptions, 'token' | 'searchParams' | 'json'>,
  requestBody: BodyInit | null | undefined,
  json?: unknown,
): Promise<Response> {
  const { headers, ...init } = options;
  try {
    return await fetch(url.toString(), {
      ...init,
      body: requestBody,
      headers: {
        Accept: 'application/json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        Authorization: `Bearer ${token}`,
        ...headers,
      },
      cache: init.cache ?? 'no-store',
    });
  } catch (cause) {
    const hint =
      cause instanceof Error && cause.message.includes('ECONNREFUSED')
        ? ` Conexão recusada em ${url.origin}.`
        : '';
    throw new ApiRequestError(`Não foi possível conectar à API.${hint}`, 0);
  }
}

export async function authFetch<T>(path: string, options: AuthFetchOptions): Promise<T> {
  const { token, searchParams, json, headers, body, ...init } = options;
  const url = new URL(`${getApiBaseUrl()}${path}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const requestBody = json !== undefined ? JSON.stringify(json) : body;
  let accessToken = await ensureValidAccessToken(token);

  let res = await authFetchOnce(url, accessToken, { headers, ...init }, requestBody, json);

  if ((res.status === 401 || res.status === 403) && accessToken === token) {
    const refreshed = await refreshStoredSession();
    if (refreshed) {
      accessToken = refreshed.token;
      res = await authFetchOnce(url, accessToken, { headers, ...init }, requestBody, json);
    }
  }

  if (!res.ok) {
    let errBody: ApiError | undefined;
    try {
      errBody = (await res.json()) as ApiError;
    } catch {
      /* ignore */
    }
    if (res.status === 401 || res.status === 403) {
      const { clearStoredAuth } = await import('@/lib/auth/storage');
      const { notifyAuthUpdated } = await import('@/lib/auth/token');
      clearStoredAuth();
      notifyAuthUpdated();
      throw new ApiRequestError('Sessão expirada. Faça login novamente.', res.status, errBody);
    }
    throw new ApiRequestError(errBody?.message ?? res.statusText, res.status, errBody);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function authUpload<T>(
  path: string,
  token: string,
  file: File,
  fieldName = 'file',
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`;
  const form = new FormData();
  form.append(fieldName, file);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      body: form,
    });
  } catch {
    throw new ApiRequestError('Não foi possível enviar o arquivo.', 0);
  }

  if (!res.ok) {
    let errBody: ApiError | undefined;
    try {
      errBody = (await res.json()) as ApiError;
    } catch {
      /* ignore */
    }
    throw new ApiRequestError(errBody?.message ?? res.statusText, res.status, errBody);
  }

  return res.json() as Promise<T>;
}
