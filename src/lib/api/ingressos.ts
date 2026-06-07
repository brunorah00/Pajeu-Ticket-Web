import { apiFetch } from './http';
import type { VendaIngresso, VendaIngressoRequest } from './types';

export async function registrarVendaIngresso(
  payload: VendaIngressoRequest,
  token?: string,
): Promise<VendaIngresso> {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return apiFetch<VendaIngresso>('/vendas-ingresso/registrar', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers,
  });
}
