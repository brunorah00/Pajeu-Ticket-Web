import { ApiUnavailable } from '@/components/cinema/ApiUnavailable';
import { SessaoCard } from '@/components/cinema/SessaoCard';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { listSessoesDisponiveis } from '@/lib/api/sessoes';

export default async function ProgramacaoPage() {
  try {
    const sessoes = await listSessoesDisponiveis();

    return (
      <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24 md:pb-8">
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Programação</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Horários de exibição na tela 2D — atualizado em tempo real.
        </p>

        {sessoes.length === 0 ? (
          <p className="mt-12 text-center text-body-md text-on-surface-variant">
            Nenhuma sessão com lugares disponíveis.
          </p>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {sessoes.map((s) => (
              <SessaoCard key={s.id} sessao={s} />
            ))}
          </div>
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
