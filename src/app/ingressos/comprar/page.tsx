import Link from 'next/link';
import { ApiUnavailable } from '@/components/cinema/ApiUnavailable';
import { ComprarIngressoForm } from '@/components/cinema/ComprarIngressoForm';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { getSessao } from '@/lib/api/sessoes';

type PageProps = {
  searchParams: Promise<{ sessaoId?: string }>;
};

export default async function ComprarIngressoPage({ searchParams }: PageProps) {
  const { sessaoId } = await searchParams;
  const id = Number(sessaoId);

  if (!sessaoId || Number.isNaN(id)) {
    return (
      <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24">
        <p className="text-body-md text-on-surface-variant">
          Selecione uma sessão na{' '}
          <Link href="/programacao" className="text-primary underline">
            programação
          </Link>
          .
        </p>
      </main>
    );
  }

  try {
    const sessao = await getSessao(id);

    if (sessao.lugaresDisponiveis < 1) {
      return (
        <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24">
          <p className="text-body-md text-on-surface-variant">
            Esta sessão não possui lugares disponíveis.
          </p>
          <Link href="/programacao" className="mt-4 inline-block text-primary underline">
            Ver outras sessões
          </Link>
        </main>
      );
    }

    return (
      <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24 md:pb-8">
        <ComprarIngressoForm sessao={sessao} />
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
