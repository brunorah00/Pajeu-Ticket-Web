export const CATEGORIAS_BOMBONIERE = ['Pipoca', 'Doces', 'Refrigerantes'] as const;

export type CategoriaBomboniere = (typeof CATEGORIAS_BOMBONIERE)[number];
