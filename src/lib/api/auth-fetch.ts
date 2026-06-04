import { getApiBaseUrl } from './config';
import type { ApiError } from './types';
import { ApiRequestError } from './http';

type AuthFetchOptions = RequestInit & {
  token: string;
  searchParams?: Record<string, string | number | undefined>;
  json?: unknown;
};

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

  let res: Response;
  try {
    res = await fetch(url.toString(), {
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

  if (!res.ok) {
    let errBody: ApiError | undefined;
    try {
      errBody = (await res.json()) as ApiError;
    } catch {
      /* ignore */
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
