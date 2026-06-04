import { getApiBaseUrl } from './config';
import type { ApiError } from './types';

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: ApiError,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

type FetchOptions = RequestInit & {
  token?: string;
  searchParams?: Record<string, string | number | undefined>;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, searchParams, headers, ...init } = options;
  const url = new URL(`${getApiBaseUrl()}${path}`);

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      cache: init.cache ?? 'no-store',
    });
  } catch (cause) {
    const hint =
      cause instanceof Error && cause.message.includes('ECONNREFUSED')
        ? ` Conexão recusada em ${url.origin} — a API não está rodando.`
        : ` Verifique se o Pajeu-Ticket-API está ativo em ${getApiBaseUrl()}.`;
    throw new ApiRequestError(`Não foi possível conectar à API.${hint}`, 0);
  }

  if (!res.ok) {
    let body: ApiError | undefined;
    try {
      body = (await res.json()) as ApiError;
    } catch {
      /* resposta não-JSON */
    }
    throw new ApiRequestError(body?.message ?? res.statusText, res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
