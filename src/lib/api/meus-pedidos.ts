import { authFetch } from './auth-fetch';
import type { VendaIngresso, VendaProduto } from './types';

export function listarMeusPedidosBomboniere(token: string): Promise<VendaProduto[]> {
  return authFetch<VendaProduto[]>('/vendas-produto/meus-pedidos', { token });
}

export function listarMeusPedidosIngresso(token: string): Promise<VendaIngresso[]> {
  return authFetch<VendaIngresso[]>('/vendas-ingresso/meus-pedidos', { token });
}
