import { ApiUnavailable } from '@/components/cinema/ApiUnavailable';
import { ProgramacaoPorFilme } from '@/components/cinema/ProgramacaoPorFilme';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { listFilmesAtivos } from '@/lib/api/filmes';
import { agruparSessoesPorFilme, listSessoesDisponiveis } from '@/lib/api/sessoes';

export const dynamic = 'force-dynamic';

export default async function ProgramacaoPage() {
  try {
    const [filmes, sessoes] = await Promise.all([listFilmesAtivos(), listSessoesDisponiveis()]);
    const sessoesPorFilme = agruparSessoesPorFilme(sessoes);

    return (
      <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24 md:pb-8">
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Programação</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Filmes em cartaz na tela 2D — os mais recentes aparecem primeiro.
        </p>

        <ProgramacaoPorFilme filmes={filmes} sessoesPorFilme={sessoesPorFilme} />
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
