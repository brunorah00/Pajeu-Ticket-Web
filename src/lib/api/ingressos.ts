import { apiFetch } from './http';
import type { VendaIngresso, VendaIngressoRequest } from './types';

export async function registrarVendaIngresso(
  payload: VendaIngressoRequest,
): Promise<VendaIngresso> {
  return apiFetch<VendaIngresso>('/vendas-ingresso/registrar', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
