'use client';

import type { ReactNode } from 'react';
import { FILEIRAS_MAPA, type AssentoMapa } from '@/lib/cinema/mapa-assentos';

type MapaAssentosProps = {
  ocupados: Set<string>;
  selecionados: Set<string>;
  onToggle: (codigo: string) => void;
  maxSelecao?: number;
};

function AssentoBtn({
  assento,
  ocupado,
  selecionado,
  disabled,
  onToggle,
}: {
  assento: AssentoMapa;
  ocupado: boolean;
  selecionado: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const cadeirante = assento.tipo === 'cadeirante';

  let className =
    'relative flex h-8 w-8 items-center justify-center rounded-sm border text-[10px] font-semibold transition sm:h-9 sm:w-9 sm:text-[11px]';

  if (ocupado) {
    className += ' cursor-not-allowed border-on-surface/20 bg-on-surface/25 text-on-surface/40 line-through';
  } else if (selecionado) {
    className += ' border-primary bg-primary text-white shadow-md';
  } else {
    className += ' border-[#1e3a5f] bg-[#1e3a5f] text-white hover:border-primary hover:bg-[#2a4d7a]';
  }

  return (
    <button
      type="button"
      disabled={ocupado || (disabled && !selecionado)}
      onClick={onToggle}
      title={
        ocupado
          ? `${assento.codigo} — ocupado`
          : cadeirante
            ? `${assento.codigo} — cadeirante`
            : assento.codigo
      }
      aria-label={
        ocupado
          ? `Assento ${assento.codigo} ocupado`
          : selecionado
            ? `Desmarcar assento ${assento.codigo}`
            : `Selecionar assento ${assento.codigo}`
      }
      aria-pressed={selecionado}
      className={className}
    >
      {cadeirante ? (
        <span className="material-symbols-outlined text-sm sm:text-base">accessible</span>
      ) : (
        assento.numero
      )}
    </button>
  );
}

function CelulaVazia() {
  return <span className="inline-block h-8 w-8 sm:h-9 sm:w-9" aria-hidden />;
}

export function MapaAssentos({ ocupados, selecionados, onToggle, maxSelecao = 10 }: MapaAssentosProps) {
  const limiteAtingido = selecionados.size >= maxSelecao;

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white p-4 sm:p-6">
      <p className="mb-4 text-center text-sm font-medium text-on-surface-variant">
        Mapa da sala com as poltronas
      </p>

      <div className="mx-auto mb-6 max-w-2xl rounded-lg bg-[#1e3a5f] px-6 py-2 text-center text-sm font-bold tracking-[0.35em] text-white">
        TELA
      </div>

      <div className="mx-auto flex max-w-2xl flex-col gap-1.5">
        {FILEIRAS_MAPA.map((fileira) => (
          <div key={fileira.fileira} className="flex items-center justify-center gap-1 sm:gap-1.5">
            <span className="w-4 shrink-0 text-center text-xs font-bold text-on-surface-variant sm:w-5">
              {fileira.fileira}
            </span>

            <div className="flex gap-0.5 sm:gap-1">
              {renderBlocoEsquerdo(fileira.esquerdo, ocupados, selecionados, limiteAtingido, onToggle)}
            </div>

            <span className="mx-1 inline-block w-4 sm:mx-2 sm:w-8" aria-hidden />

            <div className="flex gap-0.5 sm:gap-1">
              {renderBlocoDireito(fileira.direito, ocupados, selecionados, limiteAtingido, onToggle)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-on-surface-variant sm:text-sm">
        <span className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-sm border border-[#1e3a5f] bg-[#1e3a5f]" />
          Disponível
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-sm border border-primary bg-primary" />
          Selecionado
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-sm border border-on-surface/20 bg-on-surface/25" />
          Ocupado
        </span>
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-[#1e3a5f]">accessible</span>
          Cadeirante
        </span>
      </div>
    </div>
  );
}

function renderBlocoEsquerdo(
  assentos: AssentoMapa[],
  ocupados: Set<string>,
  selecionados: Set<string>,
  limiteAtingido: boolean,
  onToggle: (codigo: string) => void,
): ReactNode[] {
  const porNumero = new Map(assentos.map((a) => [a.numero, a]));
  return [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
    const assento = porNumero.get(n);
    if (!assento) return <CelulaVazia key={`le-${n}`} />;
    return (
      <AssentoBtn
        key={assento.codigo}
        assento={assento}
        ocupado={ocupados.has(assento.codigo)}
        selecionado={selecionados.has(assento.codigo)}
        disabled={limiteAtingido}
        onToggle={() => onToggle(assento.codigo)}
      />
    );
  });
}

function renderBlocoDireito(
  assentos: AssentoMapa[],
  ocupados: Set<string>,
  selecionados: Set<string>,
  limiteAtingido: boolean,
  onToggle: (codigo: string) => void,
): ReactNode[] {
  const porNumero = new Map(assentos.map((a) => [a.numero, a]));
  return [9, 10, 11, 12, 13, 14, 15, 16].map((n) => {
    const assento = porNumero.get(n);
    if (!assento) return <CelulaVazia key={`ld-${n}`} />;
    return (
      <AssentoBtn
        key={assento.codigo}
        assento={assento}
        ocupado={ocupados.has(assento.codigo)}
        selecionado={selecionados.has(assento.codigo)}
        disabled={limiteAtingido}
        onToggle={() => onToggle(assento.codigo)}
      />
    );
  });
}
