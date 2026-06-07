export default function NovidadesPage() {
  return (
    <main className="mx-auto max-w-container-max px-margin-mobile py-stack-lg pb-24 md:pb-8">
      <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Novidades</h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Fique por dentro das promoções, estreias e eventos do Cine São José.
      </p>

      <div className="mt-10 rounded-xl border border-dashed border-outline-variant px-6 py-12 text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant">new_releases</span>
        <p className="mt-4 text-body-md text-on-surface-variant">
          Em breve você encontrará aqui as últimas novidades do cinema.
        </p>
      </div>
    </main>
  );
}
