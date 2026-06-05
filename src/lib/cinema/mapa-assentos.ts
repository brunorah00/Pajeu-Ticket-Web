export type TipoAssento = 'normal' | 'cadeirante';

export type AssentoMapa = {
  codigo: string;
  fileira: string;
  numero: number;
  tipo: TipoAssento;
  bloco: 'esquerdo' | 'direito';
};

type FileiraConfig = {
  fileira: string;
  esquerdo: number[];
  direito: number[];
  cadeirante?: string[];
};

/** Layout da sala conforme mapa físico (fileiras A–P). */
const FILEIRAS: FileiraConfig[] = [
  { fileira: 'A', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'B', esquerdo: [2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15] },
  { fileira: 'C', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'D', esquerdo: [2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15] },
  { fileira: 'E', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'F', esquerdo: [1, 2, 3, 4, 5, 6, 7], direito: [10, 11, 12, 13, 14, 15, 16], cadeirante: ['F7', 'F10'] },
  { fileira: 'G', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'H', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'I', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'J', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'K', esquerdo: [1, 2, 3, 4, 5, 6, 7], direito: [10, 11, 12, 13, 14, 15, 16], cadeirante: ['K7', 'K10'] },
  { fileira: 'L', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'M', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'N', esquerdo: [2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15] },
  { fileira: 'O', esquerdo: [1, 2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15, 16] },
  { fileira: 'P', esquerdo: [2, 3, 4, 5, 6, 7, 8], direito: [9, 10, 11, 12, 13, 14, 15] },
];

function criarAssento(
  fileira: string,
  numero: number,
  bloco: 'esquerdo' | 'direito',
  cadeirantes: Set<string>,
): AssentoMapa {
  const codigo = `${fileira}${numero}`;
  return {
    codigo,
    fileira,
    numero,
    bloco,
    tipo: cadeirantes.has(codigo) ? 'cadeirante' : 'normal',
  };
}

const CADEIRANTES = new Set(
  FILEIRAS.flatMap((f) => f.cadeirante ?? []),
);

export const MAPA_ASSENTOS: AssentoMapa[] = FILEIRAS.flatMap((f) => [
  ...f.esquerdo.map((n) => criarAssento(f.fileira, n, 'esquerdo', CADEIRANTES)),
  ...f.direito.map((n) => criarAssento(f.fileira, n, 'direito', CADEIRANTES)),
]);

export const CODIGOS_ASSENTOS_VALIDOS = new Set(MAPA_ASSENTOS.map((a) => a.codigo));

export const TOTAL_ASSENTOS_SALA = MAPA_ASSENTOS.length;

export type FileiraMapa = {
  fileira: string;
  esquerdo: AssentoMapa[];
  direito: AssentoMapa[];
};

export const FILEIRAS_MAPA: FileiraMapa[] = FILEIRAS.map((f) => ({
  fileira: f.fileira,
  esquerdo: f.esquerdo.map((n) => criarAssento(f.fileira, n, 'esquerdo', CADEIRANTES)),
  direito: f.direito.map((n) => criarAssento(f.fileira, n, 'direito', CADEIRANTES)),
}));

export function assentoValido(codigo: string): boolean {
  return CODIGOS_ASSENTOS_VALIDOS.has(codigo.toUpperCase());
}
