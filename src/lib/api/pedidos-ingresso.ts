import { authFetch } from './auth-fetch';
import type { StatusPedidoBomboniere, VendaIngresso } from './types';

export function listarPedidosIngresso(
  token: string,
  status?: StatusPedidoBomboniere,
): Promise<VendaIngresso[]> {
  return authFetch<VendaIngresso[]>('/vendas-ingresso/pedidos', {
    token,
    searchParams: status ? { status } : undefined,
  });
}

export function atualizarStatusPedidoIngresso(
  token: string,
  pedidoId: number,
  status: StatusPedidoBomboniere,
): Promise<VendaIngresso> {
  return authFetch<VendaIngresso>(`/vendas-ingresso/pedidos/${pedidoId}/status`, {
    token,
    method: 'PATCH',
    json: { status },
  });
}
