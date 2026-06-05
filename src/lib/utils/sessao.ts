import type { Sessao } from '@/lib/api/types';

/** Minutos após o horário de início em que a sessão é considerada encerrada. */
export const SESSAO_MINUTOS_ENCERRAMENTO = 10;

/** Calcula no cliente (fallback se a API não enviar `encerrada`). */
export function calcularSessaoEncerrada(data: string, horario: string): boolean {
  const inicio = new Date(`${data}T${horario.length >= 8 ? horario : `${horario}:00`}`);
  if (Number.isNaN(inicio.getTime())) return false;
  const limite = inicio.getTime() + SESSAO_MINUTOS_ENCERRAMENTO * 60 * 1000;
  return Date.now() >= limite;
}

export function sessaoEncerrada(sessao: Sessao): boolean {
  if (sessao.encerrada !== undefined) return sessao.encerrada;
  return calcularSessaoEncerrada(sessao.data, sessao.horario);
}

export function sessaoDisponivelParaVenda(sessao: Sessao): boolean {
  return sessao.lugaresDisponiveis > 0 && !sessaoEncerrada(sessao) && sessao.filme?.status !== false;
}
