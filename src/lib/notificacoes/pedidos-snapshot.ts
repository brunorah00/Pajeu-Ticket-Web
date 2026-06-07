import type { PedidoSnapshot } from './types';

const STORAGE_PREFIX = 'pajeu-pedido-status';

function storageKey(login: string): string {
  return `${STORAGE_PREFIX}-${login}`;
}

export function loadPedidoSnapshot(login: string): PedidoSnapshot {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(storageKey(login));
    return raw ? (JSON.parse(raw) as PedidoSnapshot) : {};
  } catch {
    return {};
  }
}

export function savePedidoSnapshot(login: string, snapshot: PedidoSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey(login), JSON.stringify(snapshot));
  } catch {
    /* ignore quota errors */
  }
}

export function pedidoKey(tipo: 'bomboniere' | 'ingresso', pedidoId: number): string {
  return `${tipo}-${pedidoId}`;
}
