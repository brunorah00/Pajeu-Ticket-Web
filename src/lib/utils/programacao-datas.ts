export type DiaProgramacao = {
  iso: string;
  labelTopo: string;
  dia: number;
  mes: string;
};

function toIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function labelDia(date: Date, indice: number): string {
  if (indice === 0) return 'HOJE';
  if (indice === 1) return 'AMANHÃ';
  return date
    .toLocaleDateString('pt-BR', { weekday: 'long' })
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

/** Próximos N dias a partir de hoje (fuso local), com o dia atual primeiro. */
export function getProximosDiasProgramacao(quantidade = 7): DiaProgramacao[] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return Array.from({ length: quantidade }, (_, i) => {
    const date = new Date(hoje);
    date.setDate(hoje.getDate() + i);

    return {
      iso: toIsoLocal(date),
      labelTopo: labelDia(date, i),
      dia: date.getDate(),
      mes: date
        .toLocaleDateString('pt-BR', { month: 'short' })
        .replace('.', '')
        .toUpperCase(),
    };
  });
}

export function hojeIsoLocal(): string {
  return toIsoLocal(new Date());
}
