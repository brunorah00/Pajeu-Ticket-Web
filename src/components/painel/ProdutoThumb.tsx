import { resolveUploadUrl } from '@/lib/api/media';
import Image from 'next/image';

type ProdutoThumbProps = {
  nome: string;
  urlImagem?: string | null;
  className?: string;
};

export function ProdutoThumb({ nome, urlImagem, className = 'size-16' }: ProdutoThumbProps) {
  const src = resolveUploadUrl(urlImagem);

  if (src) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-lg bg-surface-container ${className}`}>
        <Image src={src} alt={nome} fill className="object-cover" sizes="64px" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-on-surface-variant ${className}`}
      aria-hidden
    >
      <span className="material-symbols-outlined text-2xl">fastfood</span>
    </div>
  );
}
