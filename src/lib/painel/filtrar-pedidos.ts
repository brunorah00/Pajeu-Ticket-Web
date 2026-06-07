import type { VendaIngresso, VendaProduto } from '@/lib/api/types';

function normalizar(q: string): string {
  return q.trim().toLowerCase();
}

export function filtrarPedidosBomboniere(pedidos: VendaProduto[], busca: string): VendaProduto[] {
  const q = normalizar(busca);
  if (!q) return pedidos;

  return pedidos.filter((p) => {
    const codigo = (p.codigoPedido ?? `#${p.id}`).toLowerCase();
    const cliente = [p.clienteNome, p.clienteLogin].filter(Boolean).join(' ').toLowerCase();
    const itens = (p.itens ?? [])
      .map((i) => i.produto?.nome ?? '')
      .join(' ')
      .toLowerCase();
    return codigo.includes(q) || cliente.includes(q) || itens.includes(q);
  });
}

export function filtrarPedidosIngresso(pedidos: VendaIngresso[], busca: string): VendaIngresso[] {
  const q = normalizar(busca);
  if (!q) return pedidos;

  return pedidos.filter((p) => {
    const codigo = (p.codigoPedido ?? `#${p.id}`).toLowerCase();
    const cliente = [p.clienteNome, p.clienteLogin].filter(Boolean).join(' ').toLowerCase();
    const filme = p.sessao?.filme?.titulo?.toLowerCase() ?? '';
    const assentos = (p.assentos ?? []).join(' ').toLowerCase();
    return codigo.includes(q) || cliente.includes(q) || filme.includes(q) || assentos.includes(q);
  });
}
