import { apiFetch } from './http';
import type { PageResponse, Sessao } from './types';
import { getProximosDiasProgramacao } from '@/lib/utils/programacao-datas';
import { agruparSessoesPorFilme } from '@/lib/utils/sessoes-group';
import { sessaoDisponivelParaVenda } from '@/lib/utils/sessao';

export { agruparSessoesPorFilme };

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

export async function listSessoesDisponiveis(): Promise<Sessao[]> {
  const page = await listSessoes(0, 500);
  const diasValidos = new Set(getProximosDiasProgramacao(7).map((d) => d.iso));
  return page.content.filter((s) => diasValidos.has(s.data) && sessaoDisponivelParaVenda(s));
}

export async function listSessoesPorFilme(filmeId: number): Promise<Sessao[]> {
  const todas = await listSessoesDisponiveis();
  return todas
    .filter((s) => s.filme.id === filmeId)
    .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`));
}

export async function listSessoesHoje(): Promise<Sessao[]> {
  const hoje = getProximosDiasProgramacao(1)[0].iso;
  const todas = await listSessoesDisponiveis();
  return todas.filter((s) => s.data === hoje);
}
