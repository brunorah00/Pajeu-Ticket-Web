import { authFetch } from './auth-fetch';
import type { PageResponse, Sessao, SessaoRequest } from './types';

export function listarSessoesPainel(token: string, page = 0, size = 200): Promise<PageResponse<Sessao>> {
  return authFetch<PageResponse<Sessao>>('/sessoes', {
    token,
    searchParams: { page, size, sort: 'data,desc' },
  });
}

/** Lista todas as sessões (todas as páginas), da mais recente à mais antiga. */
export async function listarTodasSessoesPainel(token: string): Promise<Sessao[]> {
  const size = 100;
  const sessoes: Sessao[] = [];
  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    const res = await authFetch<PageResponse<Sessao>>('/sessoes', {
      token,
      searchParams: { page, size, sort: 'data,desc' },
    });
    sessoes.push(...res.content);
    totalPages = res.totalPages;
    page += 1;
  }

  return sessoes.sort((a, b) => {
    const cmpData = b.data.localeCompare(a.data);
    if (cmpData !== 0) return cmpData;
    return b.horario.localeCompare(a.horario);
  });
}

export function cadastrarSessao(token: string, data: SessaoRequest): Promise<Sessao> {
  return authFetch<Sessao>('/sessoes', { token, method: 'POST', json: data });
}

export function atualizarSessao(token: string, id: number, data: SessaoRequest): Promise<Sessao> {
  return authFetch<Sessao>(`/sessoes/${id}`, { token, method: 'PUT', json: data });
}

export function excluirSessao(token: string, id: number): Promise<void> {
  return authFetch<void>(`/sessoes/${id}`, { token, method: 'DELETE' });
}
