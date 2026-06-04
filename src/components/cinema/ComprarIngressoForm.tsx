'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Sessao } from '@/lib/api/types';
import { formatMoeda, formatSessaoExibicao } from '@/lib/utils/format';

type ComprarIngressoFormProps = {
  sessao: Sessao;
};

export function ComprarIngressoForm({ sessao }: ComprarIngressoFormProps) {
  const router = useRouter();
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const max = sessao.lugaresDisponiveis;
  const total = sessao.valorIngresso * quantidade;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    try {
      const res = await fetch('/api/ingressos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessaoId: sessao.id, quantidade }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? 'Falha ao registrar venda');
      }

      router.push(`/ingressos/confirmacao?vendaId=${data.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao comprar ingressos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg rounded-xl bg-surface-elevated p-6">
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
        Comprar ingresso
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        <strong className="text-on-surface">{sessao.filme.titulo}</strong>
        <br />
        {formatSessaoExibicao(sessao.data, sessao.horario)}
      </p>

      <label className="mt-6 block">
        <span className="text-label-lg font-label-lg text-on-surface-variant">Quantidade</span>
        <input
          type="number"
          min={1}
          max={max}
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          className="mt-2 w-full rounded-lg border border-outline-variant bg-surface-container px-4 py-3 text-on-surface outline-none focus:border-primary"
        />
        <span className="mt-1 block text-body-sm text-on-surface-variant">
          Máximo: {max} lugares
        </span>
      </label>

      <p className="mt-4 text-title-md font-title-md text-on-surface">
        Total: <span className="text-primary">{formatMoeda(total)}</span>
      </p>

      {erro && (
        <p className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-body-sm text-primary">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || quantidade < 1 || quantidade > max}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-8 py-4 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
      >
        <span className="material-symbols-outlined">shopping_cart</span>
        {loading ? 'Processando…' : 'Confirmar compra'}
      </button>
    </form>
  );
}
