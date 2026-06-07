'use client';

import { useState } from 'react';
import { MeusPedidosBomboniere } from '@/components/pedidos/MeusPedidosBomboniere';
import { MeusPedidosIngresso } from '@/components/pedidos/MeusPedidosIngresso';

type AbaPedidos = 'bomboniere' | 'ingressos';

export function MeusPedidosView() {
  const [aba, setAba] = useState<AbaPedidos>('bomboniere');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Meus pedidos</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Acompanhe suas solicitações de bomboniere e ingressos. Quando o funcionário atualizar o status, ele
          aparece aqui automaticamente.
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setAba('bomboniere')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-label-lg font-label-lg transition sm:flex-none sm:px-6 ${
            aba === 'bomboniere'
              ? 'bg-primary-container text-white'
              : 'bg-surface-elevated text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">fastfood</span>
          Bomboniere
        </button>
        <button
          type="button"
          onClick={() => setAba('ingressos')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-label-lg font-label-lg transition sm:flex-none sm:px-6 ${
            aba === 'ingressos'
              ? 'bg-primary-container text-white'
              : 'bg-surface-elevated text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined">confirmation_number</span>
          Ingressos
        </button>
      </div>

      {aba === 'bomboniere' ? <MeusPedidosBomboniere /> : <MeusPedidosIngresso />}
    </div>
  );
}
