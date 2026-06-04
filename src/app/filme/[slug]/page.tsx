import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiUnavailable } from '@/components/cinema/ApiUnavailable';
import { FilmePoster } from '@/components/cinema/FilmePoster';
import { SessaoCard } from '@/components/cinema/SessaoCard';
import { listFilmesAtivos } from '@/lib/api/filmes';
import { listSessoesPorFilme } from '@/lib/api/sessoes';
import { formatDuracao } from '@/lib/utils/format';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { findFilmeBySlug } from '@/lib/utils/slug';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function FilmePage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const filmes = await listFilmesAtivos();
    const filme = findFilmeBySlug(filmes, slug);
    if (!filme) notFound();

    const sessoes = await listSessoesPorFilme(filme.id);

    return (
      <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24 md:pb-8">
        <div className="grid gap-8 md:grid-cols-[280px_1fr]">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl">
            <FilmePoster filme={filme} fillParent className="rounded-xl" />
          </div>
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="rounded bg-accent-orange px-2 py-1 text-label-lg font-label-lg text-white">
                {filme.classificacao}
              </span>
              <span className="text-body-md text-on-surface-variant">{filme.genero}</span>
              <span className="text-body-md text-on-surface-variant">
                {formatDuracao(filme.duracao)}
              </span>
            </div>
            <h1 className="font-display-lg text-headline-lg text-on-surface">{filme.titulo}</h1>
            {filme.sinopse && (
              <p className="mt-4 text-body-md leading-relaxed text-on-surface-variant">{filme.sinopse}</p>
            )}
          </div>
        </div>

        <section className="mt-12">
          <h2 className="mb-6 font-headline-lg text-headline-lg text-on-surface">Horários disponíveis</h2>
          {sessoes.length === 0 ? (
            <p className="text-body-md text-on-surface-variant">Sem sessões abertas para este filme.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {sessoes.map((s) => (
                <SessaoCard key={s.id} sessao={s} />
              ))}
            </div>
          )}
        </section>

        <Link
          href="/programacao"
          className="mt-8 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Voltar à programação
        </Link>
      </main>
    );
  } catch (error) {
    return (
      <main className="pb-24">
        <ApiUnavailable message={getApiErrorMessage(error)} />
      </main>
    );
  }
}
