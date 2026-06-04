import type { Filme } from '@/lib/api/types';

export function filmeSlug(titulo: string): string {
  return titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function findFilmeBySlug(filmes: Filme[], slug: string): Filme | undefined {
  return filmes.find((f) => filmeSlug(f.titulo) === slug);
}

export function filmePath(filme: Filme): string {
  return `/filme/${filmeSlug(filme.titulo)}`;
}
