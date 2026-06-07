'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useNotificacoes } from '@/components/notificacoes/NotificacaoProvider';
import { formatDataHoraPedido } from '@/lib/pedidos/status-badge';

type NotificacaoSinoProps = {
  compact?: boolean;
};

function iconeTipo(tipo: 'bomboniere' | 'ingresso'): string {
  return tipo === 'bomboniere' ? 'fastfood' : 'confirmation_number';
}

export function NotificacaoSino({ compact = false }: NotificacaoSinoProps) {
  const { notificacoes, naoLidas, marcarComoLida, marcarTodasComoLidas, limparNotificacoes } =
    useNotificacoes();
  const [aberto, setAberto] = useState(false);
  const painelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;

    function handleClickFora(e: MouseEvent) {
      if (painelRef.current && !painelRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }

    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, [aberto]);

  return (
    <div ref={painelRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setAberto((v) => !v);
          if (!aberto && naoLidas > 0) marcarTodasComoLidas();
        }}
        className={`relative rounded-lg text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary ${
          compact ? 'p-1.5' : 'p-1.5'
        }`}
        aria-label={`Notificações${naoLidas > 0 ? `, ${naoLidas} não lidas` : ''}`}
        aria-expanded={aberto}
        title="Notificações"
      >
        <span
          className="material-symbols-outlined text-xl"
          style={naoLidas > 0 ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          notifications
        </span>
        {naoLidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-on-primary">
            {naoLidas > 9 ? '9+' : naoLidas}
          </span>
        )}
      </button>

      {aberto && (
        <div
          className={`absolute z-[80] mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-xl ${
            compact ? 'right-0 w-80' : 'right-0 w-[min(20rem,calc(100vw-2rem))]'
          }`}
        >
          <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
            <p className="text-title-sm font-title-sm text-on-surface">Notificações</p>
            {notificacoes.length > 0 && (
              <button
                type="button"
                onClick={limparNotificacoes}
                className="text-label-sm text-on-surface-variant hover:text-primary"
              >
                Limpar
              </button>
            )}
          </div>

          {notificacoes.length === 0 ? (
            <p className="px-4 py-8 text-center text-body-sm text-on-surface-variant">
              Nenhuma notificação por enquanto.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {notificacoes.map((notif) => (
                <li key={notif.id}>
                  <Link
                    href={notif.href}
                    onClick={() => {
                      marcarComoLida(notif.id);
                      setAberto(false);
                    }}
                    className={`flex gap-3 border-b border-outline-variant/60 px-4 py-3 transition hover:bg-surface-container-high ${
                      notif.lida ? 'opacity-70' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined mt-0.5 shrink-0 text-primary">
                      {iconeTipo(notif.tipo)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-body-sm text-on-surface">{notif.mensagem}</p>
                      <p className="mt-0.5 text-label-sm text-on-surface-variant">
                        {formatDataHoraPedido(notif.criadaEm)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
