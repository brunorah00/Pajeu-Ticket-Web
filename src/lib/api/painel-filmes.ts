import { authFetch, authUpload } from './auth-fetch';
import type { Filme, FilmeRequest } from './types';

export function cadastrarFilme(token: string, data: FilmeRequest): Promise<Filme> {
  return authFetch<Filme>('/filmes', { token, method: 'POST', json: data });
}

export function uploadFilmePoster(token: string, filmeId: number, file: File): Promise<Filme> {
  return authUpload<Filme>(`/filmes/${filmeId}/poster`, token, file);
}
