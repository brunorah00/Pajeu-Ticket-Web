import Link from 'next/link';

type PageProps = {
  searchParams: Promise<{ vendaId?: string }>;
};

export default async function ConfirmacaoPage({ searchParams }: PageProps) {
  const { vendaId } = await searchParams;

  return (
    <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24 text-center md:pb-8">
      <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>
      <h1 className="mt-4 font-headline-lg text-headline-lg text-on-surface">Compra confirmada!</h1>
      {vendaId && (
        <p className="mt-2 text-body-md text-on-surface-variant">
          Pedido nº <strong className="text-on-surface">{vendaId}</strong>
        </p>
      )}
      <p className="mt-4 text-body-sm text-on-surface-variant">
        Os ingressos foram registrados no sistema Pajeu Ticket.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/programacao"
          className="rounded-lg bg-primary px-8 py-3 text-label-lg font-label-lg text-on-primary"
        >
          Ver programação
        </Link>
        <Link href="/" className="text-primary underline">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
