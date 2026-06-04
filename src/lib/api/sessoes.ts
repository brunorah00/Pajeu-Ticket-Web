import { apiFetch } from './http';
import type { PageResponse, Sessao } from './types';

export async function listSessoes(page = 0, size = 200): Promise<PageResponse<Sessao>> {
  return apiFetch<PageResponse<Sessao>>('/sessoes', {
    searchParams: { page, size, sort: 'data,asc' },
  });
}

export async function getSessao(id: number): Promise<Sessao> {
  return apiFetch<Sessao>(`/sessoes/${id}`);
}

export async function listSessoesDisponiveis(): Promise<Sessao[]> {
  const page = await listSessoes();
  return page.content.filter((s) => s.lugaresDisponiveis > 0);
}

export async function listSessoesPorFilme(filmeId: number): Promise<Sessao[]> {
  const todas = await listSessoesDisponiveis();
  return todas.filter((s) => s.filme.id === filmeId);
}

export async function listSessoesHoje(): Promise<Sessao[]> {
  const hoje = new Date().toISOString().slice(0, 10);
  const todas = await listSessoesDisponiveis();
  return todas.filter((s) => s.data === hoje);
}
