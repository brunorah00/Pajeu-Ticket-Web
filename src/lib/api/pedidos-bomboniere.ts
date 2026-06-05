import { authFetch } from './auth-fetch';
import type { StatusPedidoBomboniere, VendaProduto } from './types';

export function listarPedidosBomboniere(
  token: string,
  status?: StatusPedidoBomboniere,
): Promise<VendaProduto[]> {
  return authFetch<VendaProduto[]>('/vendas-produto/pedidos', {
    token,
    searchParams: status ? { status } : undefined,
  });
}

export function atualizarStatusPedido(
  token: string,
  pedidoId: number,
  status: StatusPedidoBomboniere,
): Promise<VendaProduto> {
  return authFetch<VendaProduto>(`/vendas-produto/pedidos/${pedidoId}/status`, {
    token,
    method: 'PATCH',
    json: { status },
  });
}
