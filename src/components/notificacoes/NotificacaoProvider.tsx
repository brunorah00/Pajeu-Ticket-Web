'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { listarMeusPedidosBomboniere, listarMeusPedidosIngresso } from '@/lib/api/meus-pedidos';
import { listarPedidosBomboniere } from '@/lib/api/pedidos-bomboniere';
import { listarPedidosIngresso } from '@/lib/api/pedidos-ingresso';
import type { StatusPedidoBomboniere, VendaIngresso, VendaProduto } from '@/lib/api/types';
import {
  mensagemAtualizacaoStatus,
  mensagemNovoPedidoStaff,
} from '@/lib/notificacoes/messages';
import {
  loadPedidoSnapshot,
  pedidoKey,
  savePedidoSnapshot,
} from '@/lib/notificacoes/pedidos-snapshot';
import type { NotificacaoPedido, PedidoSnapshot, TipoPedidoNotificacao } from '@/lib/notificacoes/types';

const POLL_MS = 15_000;
const MAX_NOTIFICACOES = 50;

type NotificacaoContextValue = {
  notificacoes: NotificacaoPedido[];
  naoLidas: number;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  limparNotificacoes: () => void;
  registrarPedidoConhecido: (
    tipo: TipoPedidoNotificacao,
    pedidoId: number,
    status: StatusPedidoBomboniere,
  ) => void;
};

const NotificacaoContext = createContext<NotificacaoContextValue | null>(null);

function codigoPedido(id: number, codigo?: string | null): string {
  return codigo ?? `#${id}`;
}

function criarNotificacao(
  pedidoId: number,
  tipo: TipoPedidoNotificacao,
  codigo: string,
  statusNovo: StatusPedidoBomboniere,
  mensagem: string,
  href: string,
  statusAnterior?: StatusPedidoBomboniere,
): NotificacaoPedido {
  return {
    id: `${tipo}-${pedidoId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    pedidoId,
    tipo,
    codigoPedido: codigo,
    statusAnterior,
    statusNovo,
    mensagem,
    lida: false,
    criadaEm: new Date().toISOString(),
    href,
  };
}

export function NotificacaoProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, hasRole } = useAuth();
  const isStaff = hasRole('ADMIN', 'FUNCIONARIO');
  const [notificacoes, setNotificacoes] = useState<NotificacaoPedido[]>([]);
  const snapshotRef = useRef<PedidoSnapshot>({});
  const baselineRef = useRef(false);

  const hrefPedidos = isStaff ? '/painel/pedidos' : '/meus-pedidos';

  const persistSnapshot = useCallback(() => {
    if (user?.login) {
      savePedidoSnapshot(user.login, snapshotRef.current);
    }
  }, [user?.login]);

  const registrarPedidoConhecido = useCallback(
    (tipo: TipoPedidoNotificacao, pedidoId: number, status: StatusPedidoBomboniere) => {
      snapshotRef.current[pedidoKey(tipo, pedidoId)] = status;
      persistSnapshot();
    },
    [persistSnapshot],
  );

  const processarPedidos = useCallback(
    (
      tipo: TipoPedidoNotificacao,
      pedidos: Array<{ id: number; codigoPedido?: string | null; status?: StatusPedidoBomboniere }>,
      novas: NotificacaoPedido[],
    ) => {
      for (const pedido of pedidos) {
        const key = pedidoKey(tipo, pedido.id);
        const statusAtual = pedido.status ?? 'PENDENTE';
        const codigo = codigoPedido(pedido.id, pedido.codigoPedido);
        const anterior = snapshotRef.current[key];

        if (baselineRef.current && anterior !== undefined && anterior !== statusAtual) {
          novas.push(
            criarNotificacao(
              pedido.id,
              tipo,
              codigo,
              statusAtual,
              mensagemAtualizacaoStatus(tipo, codigo, statusAtual, !isStaff),
              hrefPedidos,
              anterior,
            ),
          );
        } else if (
          baselineRef.current &&
          isStaff &&
          anterior === undefined &&
          statusAtual === 'PENDENTE'
        ) {
          novas.push(
            criarNotificacao(
              pedido.id,
              tipo,
              codigo,
              statusAtual,
              mensagemNovoPedidoStaff(tipo, codigo),
              hrefPedidos,
            ),
          );
        }

        snapshotRef.current[key] = statusAtual;
      }
    },
    [hrefPedidos, isStaff],
  );

  const verificarPedidos = useCallback(async () => {
    if (!user?.token || !isAuthenticated) return;

    try {
      let bomboniere: VendaProduto[] = [];
      let ingressos: VendaIngresso[] = [];

      if (isStaff) {
        [bomboniere, ingressos] = await Promise.all([
          listarPedidosBomboniere(user.token),
          listarPedidosIngresso(user.token),
        ]);
      } else {
        [bomboniere, ingressos] = await Promise.all([
          listarMeusPedidosBomboniere(user.token),
          listarMeusPedidosIngresso(user.token),
        ]);
      }

      const novas: NotificacaoPedido[] = [];
      processarPedidos('bomboniere', bomboniere, novas);
      processarPedidos('ingresso', ingressos, novas);

      if (novas.length > 0) {
        setNotificacoes((prev) => [...novas, ...prev].slice(0, MAX_NOTIFICACOES));
      }

      baselineRef.current = true;
      persistSnapshot();
    } catch {
      /* polling silencioso */
    }
  }, [user?.token, isAuthenticated, isStaff, processarPedidos, persistSnapshot]);

  useEffect(() => {
    if (!user?.login) {
      snapshotRef.current = {};
      baselineRef.current = false;
      setNotificacoes([]);
      return;
    }

    snapshotRef.current = loadPedidoSnapshot(user.login);
    baselineRef.current = Object.keys(snapshotRef.current).length > 0;

    verificarPedidos();
    const interval = setInterval(verificarPedidos, POLL_MS);
    return () => clearInterval(interval);
  }, [user?.login, verificarPedidos]);

  const marcarComoLida = useCallback((id: string) => {
    setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  }, []);

  const marcarTodasComoLidas = useCallback(() => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }, []);

  const limparNotificacoes = useCallback(() => {
    setNotificacoes([]);
  }, []);

  const naoLidas = useMemo(() => notificacoes.filter((n) => !n.lida).length, [notificacoes]);

  const value = useMemo<NotificacaoContextValue>(
    () => ({
      notificacoes,
      naoLidas,
      marcarComoLida,
      marcarTodasComoLidas,
      limparNotificacoes,
      registrarPedidoConhecido,
    }),
    [notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas, limparNotificacoes, registrarPedidoConhecido],
  );

  return <NotificacaoContext.Provider value={value}>{children}</NotificacaoContext.Provider>;
}

export function useNotificacoes() {
  const ctx = useContext(NotificacaoContext);
  if (!ctx) {
    throw new Error('useNotificacoes deve ser usado dentro de NotificacaoProvider');
  }
  return ctx;
}
