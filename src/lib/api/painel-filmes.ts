import { authFetch, authUpload } from './auth-fetch';
import type { Filme, FilmeRequest, PageResponse } from './types';

export function listarFilmesPainel(token: string, page = 0, size = 200): Promise<PageResponse<Filme>> {
  return authFetch<PageResponse<Filme>>('/filmes', {
    token,
    searchParams: { page, size, sort: 'id,desc' },
  });
}

/** Lista todo o catálogo (todas as páginas), do mais recente ao mais antigo. */
export async function listarTodosFilmesPainel(token: string): Promise<Filme[]> {
  const size = 100;
  const filmes: Filme[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const res = await authFetch<PageResponse<Filme>>('/filmes', {
      token,
      searchParams: { page, size, sort: 'id,desc' },
    });
    filmes.push(...res.content);
    totalPages = res.totalPages;
    page += 1;
  }

  return filmes.sort((a, b) => b.id - a.id);
}

export function cadastrarFilme(token: string, data: FilmeRequest): Promise<Filme> {
  return authFetch<Filme>('/filmes', { token, method: 'POST', json: data });
}

export function atualizarFilme(token: string, filmeId: number, data: FilmeRequest): Promise<Filme> {
  return authFetch<Filme>(`/filmes/${filmeId}`, { token, method: 'PUT', json: data });
}

export function uploadFilmePoster(token: string, filmeId: number, file: File): Promise<Filme> {
  return authUpload<Filme>(`/filmes/${filmeId}/poster`, token, file);
}

export function removerFilmePoster(token: string, filmeId: number): Promise<Filme> {
  return authFetch<Filme>(`/filmes/${filmeId}/poster`, { token, method: 'DELETE' });
}

export function excluirFilme(token: string, filmeId: number): Promise<void> {
  return authFetch<void>(`/filmes/${filmeId}`, { token, method: 'DELETE' });
}
