export function formatDuracao(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`;
}

export function formatMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatData(data: string): string {
  const [y, m, d] = data.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}

export function formatHorario(horario: string): string {
  return horario.slice(0, 5);
}

/** Rótulo de exibição da sessão (data, horário, formato 2D). */
export function formatSessaoExibicao(data: string, horario: string): string {
  return `${formatData(data)} às ${formatHorario(horario)} · 2D`;
}
