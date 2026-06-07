'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useNotificacoes } from '@/components/notificacoes/NotificacaoProvider';
import { PedidosBuscaInput } from '@/components/painel/PedidosBuscaInput';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { atualizarStatusPedidoIngresso, listarPedidosIngresso } from '@/lib/api/pedidos-ingresso';
import type { StatusPedidoBomboniere, VendaIngresso } from '@/lib/api/types';
import {
  INGRESSO_STATUS_ACOES,
  INGRESSO_STATUS_FILTROS,
  INGRESSO_STATUS_LABEL,
} from '@/lib/ingressos/status-pedido-ingresso';
import { filtrarPedidosIngresso } from '@/lib/painel/filtrar-pedidos';
import { formatHorario, formatSessaoExibicao } from '@/lib/utils/format';

type PedidosIngressoProps = {
  embedded?: boolean;
};

function formatHora(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function codigoExibicao(pedido: VendaIngresso): string {
  return pedido.codigoPedido ?? `#${pedido.id}`;
}

function statusBadgeClass(status: StatusPedidoBomboniere | undefined): string {
  switch (status) {
    case 'PENDENTE':
      return 'bg-amber-500/20 text-amber-200 border-amber-500/40';
    case 'ENTREGUE':
      return 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40';
    case 'CANCELADO':
      return 'bg-primary/15 text-primary border-primary/30';
    default:
      return 'bg-surface-container-high text-on-surface-variant';
  }
}

export function PedidosIngresso({ embedded = false }: PedidosIngressoProps) {
  const { user } = useAuth();
  const { registrarPedidoConhecido } = useNotificacoes();
  const [filtro, setFiltro] = useState<StatusPedidoBomboniere | 'TODOS'>('PENDENTE');
  const [busca, setBusca] = useState('');
  const [pedidos, setPedidos] = useState<VendaIngresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setErro(null);
    try {
      const lista = await listarPedidosIngresso(
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
      await atualizarStatusPedidoIngresso(user.token, pedidoId, status);
      registrarPedidoConhecido('ingresso', pedidoId, status);
      await carregar();
    } catch (err) {
      setErro(getApiErrorMessage(err));
    } finally {
      setAtualizandoId(null);
    }
  }

  const solicitados = pedidos.filter((p) => (p.status ?? 'PENDENTE') === 'PENDENTE').length;
  const pedidosFiltrados = useMemo(
    () => filtrarPedidosIngresso(pedidos, busca),
    [pedidos, busca],
  );

  return (
    <div className={embedded ? 'min-h-0' : ''}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {embedded ? (
            <h2 className="flex items-center gap-2 text-title-md font-title-md text-on-surface">
              <span className="material-symbols-outlined text-primary">confirmation_number</span>
              Ingressos
            </h2>
          ) : (
            <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">
              Solicitações de ingresso
            </h1>
          )}
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Confirme na bilheteria usando o código da solicitação (sem pagamento online).
          </p>
        </div>
        {solicitados > 0 && filtro !== 'ENTREGUE' && (
          <span className="rounded-full bg-primary px-3 py-1 text-label-sm font-label-sm text-on-primary">
            {solicitados} solicitado{solicitados === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {INGRESSO_STATUS_FILTROS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFiltro(f.value)}
            className={`rounded-xl px-3 py-1.5 text-label-sm font-label-sm transition ${
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
          className="ml-auto flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-1.5 text-label-sm text-on-surface-variant hover:border-primary hover:text-primary"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
        </button>
      </div>

      <PedidosBuscaInput
        value={busca}
        onChange={setBusca}
        placeholder="Buscar por código, cliente, filme ou assento…"
      />

      {erro && (
        <p className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-body-sm text-primary">
          {erro}
        </p>
      )}

      {loading && pedidos.length === 0 ? (
        <p className="mt-8 text-center text-body-sm text-on-surface-variant">Carregando…</p>
      ) : pedidos.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-outline-variant bg-surface-elevated px-4 py-10 text-center text-body-sm text-on-surface-variant">
          Nenhuma solicitação de ingresso para este filtro hoje.
        </p>
      ) : pedidosFiltrados.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-outline-variant bg-surface-elevated px-4 py-10 text-center text-body-sm text-on-surface-variant">
          Nenhuma solicitação encontrada para &ldquo;{busca}&rdquo;.
        </p>
      ) : (
        <ul className={`mt-4 grid gap-3 ${embedded ? '' : 'lg:grid-cols-2'}`}>
          {pedidosFiltrados.map((pedido) => {
            const status = pedido.status ?? 'PENDENTE';
            const busy = atualizandoId === pedido.id;
            const sessao = pedido.sessao;
            return (
              <li
                key={pedido.id}
                className="rounded-xl border border-outline-variant bg-surface-elevated p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Código da solicitação</p>
                    <p className="font-mono text-xl font-bold tracking-wider text-primary">
                      {codigoExibicao(pedido)}
                    </p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {formatHora(pedido.dataVenda)} · {pedido.quantidade} ingresso
                      {pedido.quantidade === 1 ? '' : 's'}
                    </p>
                  </div>
                  <span
                    className={`rounded-lg border px-2.5 py-0.5 text-label-sm font-label-sm ${statusBadgeClass(status)}`}
                  >
                    {INGRESSO_STATUS_LABEL[status]}
                  </span>
                </div>

                {sessao && (
                  <div className="mt-3 border-t border-outline-variant pt-3">
                    <p className="font-medium text-on-surface">{sessao.filme.titulo}</p>
                    <p className="mt-0.5 text-body-sm text-on-surface-variant">
                      {formatSessaoExibicao(sessao.data, sessao.horario)} · {formatHorario(sessao.horario)}
                    </p>
                  </div>
                )}

                {(pedido.clienteNome || pedido.clienteLogin) && (
                  <p className="mt-2 flex items-center gap-2 text-body-sm text-on-surface">
                    <span className="material-symbols-outlined text-base text-on-surface-variant">
                      person
                    </span>
                    {pedido.clienteNome ?? pedido.clienteLogin}
                  </p>
                )}

                {(pedido.assentos?.length ?? 0) > 0 && (
                  <p className="mt-2 text-body-sm text-on-surface-variant">
                    Assentos:{' '}
                    <span className="font-medium text-on-surface">{pedido.assentos!.join(', ')}</span>
                  </p>
                )}

                {status === 'PENDENTE' && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {INGRESSO_STATUS_ACOES.map((acao) => (
                      <button
                        key={acao.status}
                        type="button"
                        disabled={busy}
                        onClick={() => mudarStatus(pedido.id, acao.status)}
                        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-label-sm font-label-sm transition disabled:opacity-50 ${
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
