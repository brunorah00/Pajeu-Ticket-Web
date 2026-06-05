import { apiFetch } from './http';
import type { PageResponse, Sessao } from './types';
import { sessaoDisponivelParaVenda } from '@/lib/utils/sessao';

export async function listSessoes(page = 0, size = 200): Promise<PageResponse<Sessao>> {
  return apiFetch<PageResponse<Sessao>>('/sessoes', {
    searchParams: { page, size, sort: 'data,asc' },
  });
}

export async function getSessao(id: number): Promise<Sessao> {
  return apiFetch<Sessao>(`/sessoes/${id}`);
}

export type SessaoAssentosResponse = {
  ocupados: string[];
  totalAssentos: number;
};

export async function listAssentosOcupados(sessaoId: number): Promise<SessaoAssentosResponse> {
  return apiFetch<SessaoAssentosResponse>(`/sessoes/${sessaoId}/assentos`);
}

function hojeIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function listSessoesDisponiveis(): Promise<Sessao[]> {
  const page = await listSessoes(0, 500);
  const hoje = hojeIso();
  return page.content.filter((s) => s.data >= hoje && sessaoDisponivelParaVenda(s));
}

export function agruparSessoesPorFilme(sessoes: Sessao[]): Map<number, Sessao[]> {
  const map = new Map<number, Sessao[]>();
  const ordenadas = [...sessoes].sort((a, b) => {
    const cmpData = b.data.localeCompare(a.data);
    if (cmpData !== 0) return cmpData;
    return b.horario.localeCompare(a.horario);
  });
  for (const s of ordenadas) {
    const id = s.filme.id;
    const arr = map.get(id) ?? [];
    arr.push(s);
    map.set(id, arr);
  }
  return map;
}

export async function listSessoesPorFilme(filmeId: number): Promise<Sessao[]> {
  const todas = await listSessoesDisponiveis();
  return todas
    .filter((s) => s.filme.id === filmeId)
    .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`));
}

export async function listSessoesHoje(): Promise<Sessao[]> {
  const hoje = new Date().toISOString().slice(0, 10);
  const todas = await listSessoesDisponiveis();
  return todas.filter((s) => s.data === hoje);
}
