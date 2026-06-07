import Link from 'next/link';

type PageProps = {
  searchParams: Promise<{ codigo?: string; vendaId?: string; assentos?: string }>;
};

export default async function ConfirmacaoPage({ searchParams }: PageProps) {
  const { codigo, vendaId, assentos } = await searchParams;
  const codigoPedido = codigo ?? vendaId;
  const listaAssentos = assentos ? assentos.split(',').filter(Boolean) : [];

  return (
    <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24 text-center md:pb-8">
      <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>
      <h1 className="mt-4 font-headline-lg text-headline-lg text-on-surface">Compra confirmada!</h1>
      {codigoPedido && (
        <>
          <p className="mt-4 text-body-sm text-on-surface-variant">Código do pedido</p>
          <p className="mt-1 font-mono text-3xl font-bold tracking-wider text-primary">{codigoPedido}</p>
          <p className="mt-3 text-body-sm text-on-surface-variant">
            Apresente este código na bilheteria para retirar seus ingressos.
          </p>
        </>
      )}
      {listaAssentos.length > 0 && (
        <p className="mt-4 text-body-md text-on-surface">
          Assentos:{' '}
          <strong>{listaAssentos.join(', ')}</strong>
          {' · '}
          {listaAssentos.length} ingresso{listaAssentos.length === 1 ? '' : 's'}
        </p>
      )}
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
