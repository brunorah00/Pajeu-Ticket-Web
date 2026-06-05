'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { FilmePoster } from '@/components/cinema/FilmePoster';
import type { Filme, Sessao } from '@/lib/api/types';
import { formatDuracao } from '@/lib/utils/format';

const INTERVALO_MS = 6000;

export type DestaqueItem = {
  filme: Filme;
  sessao?: Sessao;
};

type HomeDestaqueRotativoProps = {
  items: DestaqueItem[];
};

export function HomeDestaqueRotativo({ items }: HomeDestaqueRotativoProps) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  const avancar = useCallback(() => {
    setIndice((atual) => (atual + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1 || pausado) return;
    const timer = setInterval(avancar, INTERVALO_MS);
    return () => clearInterval(timer);
  }, [items.length, pausado, avancar]);

  if (items.length === 0) return null;

  const item = items[indice];

  return (
    <section
      className="py-stack-lg mt-4"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      aria-roledescription="carrossel"
      aria-label="Filmes em destaque"
    >
      <div className="relative overflow-hidden rounded-xl bg-surface-container shadow-2xl">
        <div className="relative aspect-[2/3] w-full md:aspect-[21/9]">
          {items.map((entry, i) => (
            <div
              key={entry.filme.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === indice ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-hidden={i !== indice}
            >
              <FilmePoster filme={entry.filme} fillParent />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div key={item.filme.id}>
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded bg-accent-orange px-2 py-1 text-label-lg font-label-lg text-white">
                {item.filme.classificacao}
              </span>
              <span className="text-label-lg text-on-surface/80">
                {formatDuracao(item.filme.duracao)}
              </span>
            </div>
            <h2 className="font-display-lg text-headline-lg-mobile text-white md:text-display-lg">
              {item.filme.titulo}
            </h2>
            {item.filme.sinopse && (
              <p className="mt-3 line-clamp-2 max-w-2xl text-body-md text-on-surface-variant">
                {item.filme.sinopse}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-4 md:flex-row">
              {item.sessao ? (
                <Link
                  href={`/ingressos/comprar?sessaoId=${item.sessao.id}`}
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

          {items.length > 1 && (
            <div className="mt-6 flex items-center gap-3">
              {items.map((entry, i) => (
                <button
                  key={entry.filme.id}
                  type="button"
                  onClick={() => setIndice(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === indice ? 'w-8 bg-primary-container' : 'w-2 bg-on-surface/40 hover:bg-on-surface/60'
                  }`}
                  aria-label={`Destaque ${i + 1}: ${entry.filme.titulo}`}
                  aria-current={i === indice ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
