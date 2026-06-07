import Link from 'next/link';
import type { Sessao } from '@/lib/api/types';
import { formatData, formatHorario, formatMoeda, formatSessaoExibicao } from '@/lib/utils/format';
import { filmePath } from '@/lib/utils/slug';

type SessaoCardProps = {
  sessao: Sessao;
  compact?: boolean;
};

export function SessaoCard({ sessao, compact = false }: SessaoCardProps) {
  const comprarHref = `/ingressos/comprar?sessaoId=${sessao.id}`;

  if (compact) {
    return (
      <Link
        href={comprarHref}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary-container px-4 py-2.5 text-label-lg font-label-lg text-white transition hover:opacity-90"
      >
        <span className="material-symbols-outlined text-base">confirmation_number</span>
        Comprar {formatHorario(sessao.horario)}
      </Link>
    );
  }

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-elevated p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-4">
        <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-surface-container px-4 py-3 text-center">
          <span className="text-label-sm font-label-sm uppercase text-on-surface-variant">
            {formatData(sessao.data).split(',')[0]}
          </span>
          <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
            {formatHorario(sessao.horario)}
          </span>
          <span className="mt-1 rounded bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">
            2D
          </span>
        </div>
        <div className="min-w-0">
          <Link
            href={filmePath(sessao.filme)}
            className="font-title-md text-title-md text-on-surface hover:text-primary"
          >
            {sessao.filme.titulo}
          </Link>
          <p className="mt-1 text-body-sm text-on-surface-variant">{formatSessaoExibicao(sessao.data, sessao.horario)}</p>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            {sessao.lugaresDisponiveis} lugares · {formatMoeda(sessao.valorIngresso)} / ingresso
          </p>
        </div>
      </div>
      <Link
        href={comprarHref}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-label-lg font-label-lg text-white transition hover:opacity-90"
      >
        <span className="material-symbols-outlined text-base">confirmation_number</span>
        Comprar
      </Link>
    </article>
  );
}
