import Link from 'next/link';
import { FilmePoster } from '@/components/cinema/FilmePoster';
import { SessaoCard } from '@/components/cinema/SessaoCard';
import type { Filme, Sessao } from '@/lib/api/types';
import { formatDuracao } from '@/lib/utils/format';
import { filmePath } from '@/lib/utils/slug';

type ProgramacaoPorFilmeProps = {
  filmes: Filme[];
  sessoesPorFilme: Map<number, Sessao[]>;
};

export function ProgramacaoPorFilme({ filmes, sessoesPorFilme }: ProgramacaoPorFilmeProps) {
  if (filmes.length === 0) {
    return (
      <p className="mt-12 text-center text-body-md text-on-surface-variant">
        Nenhum filme em cartaz no momento.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-10">
      {filmes.map((filme) => {
        const sessoes = sessoesPorFilme.get(filme.id) ?? [];
        return (
          <section
            key={filme.id}
            className="rounded-xl border border-outline-variant bg-surface-elevated/50 p-5 sm:p-6"
          >
            <div className="flex gap-4 sm:gap-6">
              <Link
                href={filmePath(filme)}
                className="relative aspect-[2/3] w-24 shrink-0 overflow-hidden rounded-lg sm:w-28"
              >
                <FilmePoster filme={filme} fillParent />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-accent-orange px-2 py-0.5 text-label-sm text-white">
                    {filme.classificacao}
                  </span>
                  <span className="text-body-sm text-on-surface-variant">{filme.genero}</span>
                  <span className="text-body-sm text-on-surface-variant">
                    {formatDuracao(filme.duracao)}
                  </span>
                </div>
                <Link
                  href={filmePath(filme)}
                  className="mt-1 block font-headline-lg-mobile text-headline-lg-mobile text-on-surface hover:text-primary"
                >
                  {filme.titulo}
                </Link>
                {filme.sinopse && (
                  <p className="mt-2 line-clamp-2 text-body-sm text-on-surface-variant">{filme.sinopse}</p>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {sessoes.length === 0 ? (
                <p className="rounded-lg border border-dashed border-outline-variant px-4 py-3 text-body-sm text-on-surface-variant">
                  Horários em breve. Consulte a bilheteria.
                </p>
              ) : (
                sessoes.map((s) => <SessaoCard key={s.id} sessao={s} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
