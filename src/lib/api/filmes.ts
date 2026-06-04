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

export async function listFilmesAtivos(): Promise<Filme[]> {
  const page = await listFilmes(0, 200);
  return page.content.filter((f) => f.status);
}
