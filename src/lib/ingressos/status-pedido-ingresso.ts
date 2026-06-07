import type { StatusPedidoBomboniere } from '@/lib/api/types';

/** Labels específicos para solicitações de ingresso (sem pagamento online). */
export const INGRESSO_STATUS_LABEL: Record<StatusPedidoBomboniere, string> = {
  PENDENTE: 'Solicitado',
  EM_PREPARO: 'Em análise',
  PRONTO: 'Pronto',
  ENTREGUE: 'Confirmado',
  CANCELADO: 'Cancelado',
};

export const INGRESSO_STATUS_FILTROS: { value: StatusPedidoBomboniere | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos (hoje)' },
  { value: 'PENDENTE', label: 'Solicitados' },
  { value: 'ENTREGUE', label: 'Confirmados' },
  { value: 'CANCELADO', label: 'Cancelados' },
];

export const INGRESSO_STATUS_ACOES: {
  status: StatusPedidoBomboniere;
  label: string;
  icon: string;
}[] = [
  { status: 'ENTREGUE', label: 'Confirmar solicitação', icon: 'done_all' },
  { status: 'CANCELADO', label: 'Cancelar', icon: 'cancel' },
];
