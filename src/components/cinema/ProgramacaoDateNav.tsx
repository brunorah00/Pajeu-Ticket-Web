'use client';

import type { DiaProgramacao } from '@/lib/utils/programacao-datas';

type ProgramacaoDateNavProps = {
  dias: DiaProgramacao[];
  selecionado: string;
  onSelecionar: (iso: string) => void;
};

function labelCompacto(label: string): string {
  if (label === 'HOJE' || label === 'AMANHÃ') return label;
  const curto = label.split('-')[0]?.slice(0, 3) ?? label.slice(0, 3);
  return curto;
}

export function ProgramacaoDateNav({ dias, selecionado, onSelecionar }: ProgramacaoDateNavProps) {
  return (
    <div className="grid w-full grid-cols-7 gap-2">
      {dias.map((dia) => {
        const ativo = dia.iso === selecionado;
        return (
          <button
            key={dia.iso}
            type="button"
            onClick={() => onSelecionar(dia.iso)}
            aria-pressed={ativo}
            aria-label={`Programação de ${dia.labelTopo}, ${dia.dia} de ${dia.mes}`}
            className={`flex min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-3 transition sm:px-2 ${
              ativo
                ? 'border-primary-container bg-primary-container text-white shadow-md shadow-primary-container/25'
                : 'border-outline-variant bg-surface-container-high text-on-surface hover:border-primary/40 hover:bg-surface-container'
            }`}
          >
            <span
              className={`max-w-full truncate text-[9px] font-semibold uppercase tracking-wide sm:text-[10px] ${
                ativo ? 'text-white/90' : 'text-on-surface-variant'
              }`}
            >
              <span className="hidden sm:inline">{dia.labelTopo}</span>
              <span className="sm:hidden">{labelCompacto(dia.labelTopo)}</span>
            </span>
            <span className="my-0.5 text-xl font-bold leading-none sm:text-2xl">{dia.dia}</span>
            <span
              className={`text-[9px] font-semibold uppercase tracking-wide sm:text-[10px] ${
                ativo ? 'text-white/80' : 'text-on-surface-variant'
              }`}
            >
              {dia.mes}
            </span>
          </button>
        );
      })}
    </div>
  );
}
