import Link from 'next/link';
import type { Filme } from '@/lib/api/types';
import { formatDuracao } from '@/lib/utils/format';
import { filmePath } from '@/lib/utils/slug';
import { FilmePoster } from './FilmePoster';

type FilmeCardProps = {
  filme: Filme;
};

export function FilmeCard({ filme }: FilmeCardProps) {
  return (
    <Link
      href={filmePath(filme)}
      className="group flex flex-col overflow-hidden rounded-xl bg-surface-elevated transition-colors hover:bg-surface-container"
    >
      <div className="relative aspect-[2/3] w-full">
        <FilmePoster filme={filme} fillParent />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded bg-accent-orange px-2 py-0.5 text-label-sm font-label-sm text-white">
            {filme.classificacao}
          </span>
          <span className="text-body-sm text-on-surface-variant">{formatDuracao(filme.duracao)}</span>
        </div>
        <h3 className="font-title-md text-title-md text-on-surface group-hover:text-primary">{filme.titulo}</h3>
        <p className="mt-1 text-body-sm text-on-surface-variant">{filme.genero}</p>
      </div>
    </Link>
  );
}
