import type { StatusPedidoBomboniere } from '@/lib/api/types';

export function statusBadgeClassCliente(status: StatusPedidoBomboniere | undefined): string {
  switch (status) {
    case 'PENDENTE':
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'EM_PREPARO':
      return 'bg-sky-100 text-sky-900 border-sky-200';
    case 'PRONTO':
      return 'bg-emerald-100 text-emerald-900 border-emerald-200';
    case 'ENTREGUE':
      return 'bg-on-surface/8 text-on-surface-variant border-outline-variant';
    case 'CANCELADO':
      return 'bg-primary/10 text-primary border-primary/30';
    default:
      return 'bg-surface-container text-on-surface-variant border-outline-variant';
  }
}

export function formatDataHoraPedido(iso: string): string {
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}
