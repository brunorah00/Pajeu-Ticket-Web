'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { atualizarStatusPedido, listarPedidosBomboniere } from '@/lib/api/pedidos-bomboniere';
import type { StatusPedidoBomboniere, VendaProduto } from '@/lib/api/types';
import {
  STATUS_ACOES,
  STATUS_PEDIDO_FILTROS,
  STATUS_PEDIDO_LABEL,
} from '@/lib/bomboniere/status-pedido';
import { formatMoeda } from '@/lib/utils/format';

function formatHora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function codigoExibicao(pedido: VendaProduto): string {
  return pedido.codigoPedido ?? `#${pedido.id}`;
}

function statusBadgeClass(status: StatusPedidoBomboniere | undefined): string {
  switch (status) {
    case 'PENDENTE':
      return 'bg-amber-500/20 text-amber-200 border-amber-500/40';
    case 'EM_PREPARO':
      return 'bg-sky-500/20 text-sky-200 border-sky-500/40';
    case 'PRONTO':
      return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40';
    case 'ENTREGUE':
      return 'bg-on-surface-variant/20 text-on-surface-variant border-outline-variant';
    case 'CANCELADO':
      return 'bg-primary/15 text-primary border-primary/30';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
}

export function PedidosBomboniere() {
  const { user } = useAuth();
  const [filtro, setFiltro] = useState<StatusPedidoBomboniere | 'TODOS'>('TODOS');
  const [pedidos, setPedidos] = useState<VendaProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setErro(null);
    try {
      const lista = await listarPedidosBomboniere(
        user.token,
        filtro === 'TODOS' ? undefined : filtro,
      );
      setPedidos(lista);
    } catch (err) {
      setErro(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.token, filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    const interval = setInterval(carregar, 20_000);
    return () => clearInterval(interval);
  }, [carregar]);

  async function mudarStatus(pedidoId: number, status: StatusPedidoBomboniere) {
    if (!user?.token) return;
    setAtualizandoId(pedidoId);
    try {
      await atualizarStatusPedido(user.token, pedidoId, status);
      await carregar();
    } catch (err) {
      setErro(getApiErrorMessage(err));
    } finally {
      setAtualizandoId(null);
    }
  }

  const pendentes = pedidos.filter((p) => p.status === 'PENDENTE').length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">
            Pedidos da bomboniere
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Fila de pedidos dos clientes — cada pedido tem um código único para retirada.
          </p>
        </div>
        {pendentes > 0 && (
          <span className="rounded-full bg-primary px-4 py-1.5 text-label-lg font-label-lg text-on-primary">
            {pendentes} aguardando
          </span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS_PEDIDO_FILTROS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFiltro(f.value)}
            className={`rounded-xl px-4 py-2 text-label-lg font-label-lg transition ${
              filtro === f.value
                ? 'bg-primary-container text-white'
                : 'bg-surface-elevated text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          type="button"
          onClick={carregar}
          className="ml-auto flex items-center gap-1 rounded-xl border border-outline-variant px-4 py-2 text-label-lg text-on-surface-variant hover:border-primary hover:text-primary"
        >
          <span className="material-symbols-outlined text-xl">refresh</span>
          Atualizar
        </button>
      </div>

      {erro && (
        <p className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-body-sm text-primary">
          {erro}
        </p>
      )}

      {loading && pedidos.length === 0 ? (
        <p className="mt-10 text-center text-body-md text-on-surface-variant">Carregando pedidos…</p>
      ) : pedidos.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-outline-variant bg-surface-elevated px-6 py-12 text-center text-body-md text-on-surface-variant">
          Nenhum pedido para este filtro hoje.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 lg:grid-cols-2">
          {pedidos.map((pedido) => {
            const status = pedido.status ?? 'PENDENTE';
            const busy = atualizandoId === pedido.id;
            return (
              <li
                key={pedido.id}
                className="rounded-xl border border-outline-variant bg-surface-elevated p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-2xl font-bold tracking-wider text-primary">
                      {codigoExibicao(pedido)}
                    </p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {formatHora(pedido.dataVenda)} · {formatMoeda(pedido.valorTotal)}
                    </p>
                  </div>
                  <span
                    className={`rounded-lg border px-3 py-1 text-label-sm font-label-sm ${statusBadgeClass(status)}`}
                  >
                    {STATUS_PEDIDO_LABEL[status]}
                  </span>
                </div>

                {(pedido.clienteNome || pedido.clienteLogin) && (
                  <p className="mt-3 flex items-center gap-2 text-body-md text-on-surface">
                    <span className="material-symbols-outlined text-lg text-on-surface-variant">
                      person
                    </span>
                    {pedido.clienteNome ?? pedido.clienteLogin}
                  </p>
                )}

                <ul className="mt-4 space-y-1 border-t border-outline-variant pt-4">
                  {(pedido.itens ?? []).map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-2 text-body-sm text-on-surface-variant"
                    >
                      <span>
                        {item.quantidade}× {item.produto?.nome ?? 'Item'}
                      </span>
                      <span className="text-on-surface">{formatMoeda(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>

                {status !== 'ENTREGUE' && status !== 'CANCELADO' && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {STATUS_ACOES.filter((a) => a.status !== status).map((acao) => (
                      <button
                        key={acao.status}
                        type="button"
                        disabled={busy}
                        onClick={() => mudarStatus(pedido.id, acao.status)}
                        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-label-sm font-label-sm transition disabled:opacity-50 ${
                          acao.status === 'CANCELADO'
                            ? 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                            : 'bg-primary-container text-white hover:opacity-90'
                        }`}
                      >
                        <span className="material-symbols-outlined text-base">{acao.icon}</span>
                        {acao.label}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
