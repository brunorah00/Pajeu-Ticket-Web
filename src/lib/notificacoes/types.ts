import type { StatusPedidoBomboniere } from '@/lib/api/types';

export type TipoPedidoNotificacao = 'bomboniere' | 'ingresso';

export type NotificacaoPedido = {
  id: string;
  pedidoId: number;
  tipo: TipoPedidoNotificacao;
  codigoPedido: string;
  statusAnterior?: StatusPedidoBomboniere;
  statusNovo: StatusPedidoBomboniere;
  mensagem: string;
  lida: boolean;
  criadaEm: string;
  href: string;
};

export type PedidoSnapshot = Record<string, StatusPedidoBomboniere>;
