'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { listarMeusPedidosIngresso } from '@/lib/api/meus-pedidos';
import type { StatusPedidoBomboniere, VendaIngresso } from '@/lib/api/types';
import { INGRESSO_STATUS_LABEL } from '@/lib/ingressos/status-pedido-ingresso';
import { formatDataHoraPedido, statusBadgeClassCliente } from '@/lib/pedidos/status-badge';
import { formatHorario, formatMoeda, formatSessaoExibicao } from '@/lib/utils/format';

const STATUS_HINT_CLIENTE: Record<StatusPedidoBomboniere, string> = {
  PENDENTE: 'Solicitação enviada. Apresente o código na bilheteria para confirmar.',
  EM_PREPARO: 'Sua solicitação está sendo analisada.',
  PRONTO: 'Solicitação pronta para retirada na bilheteria.',
  ENTREGUE: 'Ingresso confirmado. Apresente-se na sessão com antecedência.',
  CANCELADO: 'Esta solicitação foi cancelada.',
};

function codigoExibicao(pedido: VendaIngresso): string {
  return pedido.codigoPedido ?? `#${pedido.id}`;
}

function pedidoAtivo(status: StatusPedidoBomboniere): boolean {
  return status !== 'ENTREGUE' && status !== 'CANCELADO';
}

export function MeusPedidosIngresso() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<VendaIngresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user?.token) return;
    setErro(null);
    try {
      const lista = await listarMeusPedidosIngresso(user.token);
      setPedidos(lista);
    } catch (err) {
      setErro(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    const interval = setInterval(carregar, 15_000);
    return () => clearInterval(interval);
  }, [carregar]);

  const ativos = pedidos.filter((p) => pedidoAtivo(p.status ?? 'PENDENTE')).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-title-md font-title-md text-on-surface">
            <span className="material-symbols-outlined text-primary">confirmation_number</span>
            Ingressos
          </h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Solicitações dos últimos 30 dias — o status atualiza automaticamente.
          </p>
        </div>
        {ativos > 0 && (
          <span className="rounded-full bg-primary px-3 py-1 text-label-sm font-label-sm text-on-primary">
            {ativos} em andamento
          </span>
        )}
        <button
          type="button"
          onClick={carregar}
          className="ml-auto flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-1.5 text-label-sm text-on-surface-variant hover:border-primary hover:text-primary"
          aria-label="Atualizar solicitações"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
        </button>
      </div>

      {erro && (
        <p className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-body-sm text-primary">
          {erro}
        </p>
      )}

      {loading && pedidos.length === 0 ? (
        <p className="mt-10 text-center text-body-md text-on-surface-variant">Carregando solicitações…</p>
      ) : pedidos.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-outline-variant bg-surface-elevated px-6 py-12 text-center text-body-md text-on-surface-variant">
          Você ainda não solicitou ingressos.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {pedidos.map((pedido) => {
            const status = pedido.status ?? 'PENDENTE';
            const sessao = pedido.sessao;
            return (
              <li
                key={pedido.id}
                className="rounded-xl border border-outline-variant bg-surface-elevated p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Código da solicitação</p>
                    <p className="font-mono text-2xl font-bold tracking-wider text-primary">
                      {codigoExibicao(pedido)}
                    </p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {formatDataHoraPedido(pedido.dataVenda)} · {pedido.quantidade} ingresso
                      {pedido.quantidade === 1 ? '' : 's'} · {formatMoeda(pedido.valorTotal)}
                    </p>
                  </div>
                  <span
                    className={`rounded-lg border px-3 py-1 text-label-sm font-label-sm ${statusBadgeClassCliente(status)}`}
                  >
                    {INGRESSO_STATUS_LABEL[status]}
                  </span>
                </div>

                <p className="mt-3 text-body-sm text-on-surface-variant">{STATUS_HINT_CLIENTE[status]}</p>

                {sessao && (
                  <div className="mt-4 border-t border-outline-variant pt-4">
                    <p className="font-medium text-on-surface">{sessao.filme.titulo}</p>
                    <p className="mt-0.5 text-body-sm text-on-surface-variant">
                      {formatSessaoExibicao(sessao.data, sessao.horario)} · {formatHorario(sessao.horario)}
                    </p>
                  </div>
                )}

                {(pedido.assentos?.length ?? 0) > 0 && (
                  <p className="mt-3 text-body-sm text-on-surface-variant">
                    Assentos:{' '}
                    <span className="font-medium text-on-surface">{pedido.assentos!.join(', ')}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
