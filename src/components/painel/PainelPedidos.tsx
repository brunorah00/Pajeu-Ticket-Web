'use client';

import { useState } from 'react';
import { PedidosBomboniere } from '@/components/painel/PedidosBomboniere';
import { PedidosIngresso } from '@/components/painel/PedidosIngresso';

type AbaPedidos = 'bomboniere' | 'ingressos';

export function PainelPedidos() {
  const [aba, setAba] = useState<AbaPedidos>('bomboniere');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Pedidos</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Acompanhe pedidos da bomboniere e ingressos do dia em tempo real.
        </p>
      </div>

      {/* Abas — telas menores */}
      <div className="mb-6 flex gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setAba('bomboniere')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-label-lg font-label-lg transition ${
            aba === 'bomboniere'
              ? 'bg-primary-container text-white'
              : 'bg-surface-elevated text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">fastfood</span>
          Bomboniere
        </button>
        <button
          type="button"
          onClick={() => setAba('ingressos')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-label-lg font-label-lg transition ${
            aba === 'ingressos'
              ? 'bg-primary-container text-white'
              : 'bg-surface-elevated text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined">confirmation_number</span>
          Ingressos
        </button>
      </div>

      {/* Mobile — uma aba por vez */}
      <div className="lg:hidden">
        {aba === 'bomboniere' ? <PedidosBomboniere embedded /> : <PedidosIngresso embedded />}
      </div>

      {/* Desktop — lado a lado */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <section className="min-w-0 rounded-xl border border-outline-variant bg-surface/30 p-5">
          <PedidosBomboniere embedded />
        </section>
        <section className="min-w-0 rounded-xl border border-outline-variant bg-surface/30 p-5">
          <PedidosIngresso embedded />
        </section>
      </div>
    </div>
  );
}
