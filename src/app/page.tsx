import Link from 'next/link';
import { ApiUnavailable } from '@/components/cinema/ApiUnavailable';
import { FilmeCard } from '@/components/cinema/FilmeCard';
import { HomeDestaqueRotativo } from '@/components/cinema/HomeDestaqueRotativo';
import { SessaoCard } from '@/components/cinema/SessaoCard';
import { listFilmesAtivos, listFilmesRecentesAtivos } from '@/lib/api/filmes';
import { listSessoesDisponiveis, listSessoesHoje } from '@/lib/api/sessoes';
import { getApiErrorMessage } from '@/lib/api/error-message';

export default async function HomePage() {
  try {
    const [filmes, filmesRecentes, sessoesHoje, sessoes] = await Promise.all([
      listFilmesAtivos(),
      listFilmesRecentesAtivos(3),
      listSessoesHoje(),
      listSessoesDisponiveis(),
    ]);

    const destaqueItems = filmesRecentes.map((filme) => ({
      filme,
      sessao: sessoes.find((s) => s.filme.id === filme.id),
    }));

    return (
      <main className="mx-auto max-w-container-max px-margin-mobile pb-24 md:pb-8">
        <HomeDestaqueRotativo items={destaqueItems} />

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
