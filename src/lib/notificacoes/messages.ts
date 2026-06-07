import type { StatusPedidoBomboniere } from '@/lib/api/types';
import { STATUS_PEDIDO_LABEL } from '@/lib/bomboniere/status-pedido';
import { INGRESSO_STATUS_LABEL } from '@/lib/ingressos/status-pedido-ingresso';
import type { TipoPedidoNotificacao } from './types';

function statusLabel(tipo: TipoPedidoNotificacao, status: StatusPedidoBomboniere): string {
  return tipo === 'ingresso' ? INGRESSO_STATUS_LABEL[status] : STATUS_PEDIDO_LABEL[status];
}

export function mensagemNovoPedidoStaff(
  tipo: TipoPedidoNotificacao,
  codigo: string,
): string {
  if (tipo === 'ingresso') {
    return `Nova solicitação de ingresso: ${codigo}`;
  }
  return `Novo pedido na bomboniere: ${codigo}`;
}

export function mensagemAtualizacaoStatus(
  tipo: TipoPedidoNotificacao,
  codigo: string,
  status: StatusPedidoBomboniere,
  paraCliente: boolean,
): string {
  const label = statusLabel(tipo, status);
  if (paraCliente) {
    return `Seu pedido ${codigo} — ${label}`;
  }
  return `Pedido ${codigo} atualizado para ${label}`;
}
