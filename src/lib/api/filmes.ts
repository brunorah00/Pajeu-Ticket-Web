import { apiFetch } from './http';
import type { Filme, PageResponse } from './types';

export async function listFilmes(page = 0, size = 100): Promise<PageResponse<Filme>> {
  return apiFetch<PageResponse<Filme>>('/filmes', {
    searchParams: { page, size, sort: 'titulo,asc' },
  });
}

export async function getFilme(id: number): Promise<Filme> {
  return apiFetch<Filme>(`/filmes/${id}`);
}

export async function listFilmesRecentesAtivos(limit = 3): Promise<Filme[]> {
  const page = await apiFetch<PageResponse<Filme>>('/filmes', {
    searchParams: { page: 0, size: 50, sort: 'id,desc' },
  });
  return page.content.filter((f) => f.status).slice(0, limit);
}

export async function listFilmesAtivos(): Promise<Filme[]> {
  const page = await apiFetch<PageResponse<Filme>>('/filmes', {
    searchParams: { page: 0, size: 200, sort: 'id,desc' },
  });
  return page.content
    .filter((f) => f.status)
    .sort((a, b) => b.id - a.id);
}
