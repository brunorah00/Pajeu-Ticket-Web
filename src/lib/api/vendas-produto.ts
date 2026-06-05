import { authFetch } from './auth-fetch';
import type { VendaProduto, VendaProdutoRequest } from './types';

export function registrarVendaProduto(
  token: string,
  payload: VendaProdutoRequest,
): Promise<VendaProduto> {
  return authFetch<VendaProduto>('/vendas-produto/registrar', {
    token,
    method: 'POST',
    json: payload,
  });
}
