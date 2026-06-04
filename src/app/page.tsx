import Link from 'next/link';
import { ApiUnavailable } from '@/components/cinema/ApiUnavailable';
import { FilmeCard } from '@/components/cinema/FilmeCard';
import { FilmePoster } from '@/components/cinema/FilmePoster';
import { SessaoCard } from '@/components/cinema/SessaoCard';
import { listFilmesAtivos } from '@/lib/api/filmes';
import { listSessoesDisponiveis, listSessoesHoje } from '@/lib/api/sessoes';
import { formatDuracao } from '@/lib/utils/format';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { filmePath } from '@/lib/utils/slug';

export default async function HomePage() {
  try {
    const [filmes, sessoesHoje, sessoes] = await Promise.all([
      listFilmesAtivos(),
      listSessoesHoje(),
      listSessoesDisponiveis(),
    ]);

    const destaqueFilme =
      sessoes[0]?.filme ?? filmes[0] ?? null;
    const destaqueSessao = sessoes[0];

    return (
      <main className="mx-auto max-w-container-max px-margin-mobile pb-24 md:pb-8">
        {destaqueFilme && (
          <section className="py-stack-lg mt-4">
            <div className="relative overflow-hidden rounded-xl bg-surface-container shadow-2xl">
              <div className="relative aspect-[2/3] w-full md:aspect-[21/9]">
                <FilmePoster filme={destaqueFilme} fillParent />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded bg-accent-orange px-2 py-1 text-label-lg font-label-lg text-white">
                    {destaqueFilme.classificacao}
                  </span>
                  <span className="text-label-lg text-on-surface/80">
                    {formatDuracao(destaqueFilme.duracao)}
                  </span>
                </div>
                <h2 className="font-display-lg text-headline-lg-mobile text-white md:text-display-lg">
                  {destaqueFilme.titulo}
                </h2>
                {destaqueFilme.sinopse && (
                  <p className="mt-3 line-clamp-2 max-w-2xl text-body-md text-on-surface-variant">
                    {destaqueFilme.sinopse}
                  </p>
                )}
                <div className="mt-6 flex flex-col gap-4 md:flex-row">
                  {destaqueSessao ? (
                    <Link
                      href={`/ingressos/comprar?sessaoId=${destaqueSessao.id}`}
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-4 text-label-lg font-label-lg text-white shadow-lg shadow-primary/20 transition hover:opacity-90"
                    >
                      <span className="material-symbols-outlined">shopping_cart</span>
                      Comprar ingressos
                    </Link>
                  ) : null}
                  <Link
                    href="/programacao"
                    className="rounded-lg border border-outline bg-surface-elevated/80 px-8 py-4 text-center text-label-lg font-label-lg text-on-surface backdrop-blur-md transition hover:border-primary"
                  >
                    Ver programação
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {sessoesHoje.length > 0 && (
          <section className="py-stack-lg">
            <h2 className="mb-4 font-headline-lg text-headline-lg text-on-surface">Sessões de hoje</h2>
            <div className="flex flex-col gap-4">
              {sessoesHoje.slice(0, 5).map((s) => (
                <SessaoCard key={s.id} sessao={s} />
              ))}
            </div>
          </section>
        )}

        {filmes.length > 0 && (
          <section className="py-stack-lg">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Em cartaz</h2>
              <Link href="/programacao" className="text-label-lg font-label-lg text-primary hover:underline">
                Ver todos
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-gutter">
              {filmes.map((f) => (
                <FilmeCard key={f.id} filme={f} />
              ))}
            </div>
          </section>
        )}

        {filmes.length === 0 && (
          <p className="py-12 text-center text-body-md text-on-surface-variant">
            Nenhum filme ativo no momento. Cadastre filmes na API.
          </p>
        )}
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
