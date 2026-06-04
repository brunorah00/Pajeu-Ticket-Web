import { resolveUploadUrl } from '@/lib/api/media';
import type { Filme } from '@/lib/api/types';
import Image from 'next/image';

type FilmePosterProps = {
  filme: Filme;
  className?: string;
  /** Preenche o container pai (use com pai `relative` + aspect-ratio ou altura fixa). */
  fillParent?: boolean;
};

export function FilmePoster({ filme, className = '', fillParent = false }: FilmePosterProps) {
  const src = resolveUploadUrl(filme.urlImagem);

  const sizeClass = fillParent
    ? 'absolute inset-0 size-full'
    : 'relative w-full min-h-[120px]';

  if (src) {
    return (
      <div className={`${sizeClass} overflow-hidden bg-surface-container ${className}`}>
        <Image
          src={src}
          alt={`Poster de ${filme.titulo}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} flex items-center justify-center bg-gradient-to-br from-surface-container-high via-surface-container to-background ${className}`}
      aria-hidden
    >
      <span className="px-4 text-center font-display-lg text-headline-lg-mobile text-on-surface/80">
        {filme.titulo}
      </span>
    </div>
  );
}
