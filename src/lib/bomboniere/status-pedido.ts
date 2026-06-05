import type { StatusPedidoBomboniere } from '@/lib/api/types';

export const STATUS_PEDIDO_LABEL: Record<StatusPedidoBomboniere, string> = {
  PENDENTE: 'Aguardando',
  EM_PREPARO: 'Em preparo',
  PRONTO: 'Pronto para retirada',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export const STATUS_PEDIDO_FILTROS: { value: StatusPedidoBomboniere | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos (hoje)' },
  { value: 'PENDENTE', label: 'Aguardando' },
  { value: 'EM_PREPARO', label: 'Em preparo' },
  { value: 'PRONTO', label: 'Prontos' },
  { value: 'ENTREGUE', label: 'Entregues' },
];

export const STATUS_ACOES: {
  status: StatusPedidoBomboniere;
  label: string;
  icon: string;
}[] = [
  { status: 'EM_PREPARO', label: 'Preparar', icon: 'skillet' },
  { status: 'PRONTO', label: 'Marcar pronto', icon: 'check_circle' },
  { status: 'ENTREGUE', label: 'Entregue', icon: 'done_all' },
  { status: 'CANCELADO', label: 'Cancelar', icon: 'cancel' },
];
