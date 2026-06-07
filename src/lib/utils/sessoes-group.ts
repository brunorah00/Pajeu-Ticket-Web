import type { Sessao } from '@/lib/api/types';

export function agruparSessoesPorFilme(sessoes: Sessao[]): Map<number, Sessao[]> {
  const map = new Map<number, Sessao[]>();
  const ordenadas = [...sessoes].sort((a, b) => {
    const cmpData = b.data.localeCompare(a.data);
    if (cmpData !== 0) return cmpData;
    return b.horario.localeCompare(a.horario);
  });
  for (const s of ordenadas) {
    const id = s.filme.id;
    const arr = map.get(id) ?? [];
    arr.push(s);
    map.set(id, arr);
  }
  return map;
}
