'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapaAssentos } from '@/components/cinema/MapaAssentos';
import type { Sessao } from '@/lib/api/types';
import { listAssentosOcupados } from '@/lib/api/sessoes';
import { formatMoeda, formatSessaoExibicao } from '@/lib/utils/format';

type ComprarIngressoFormProps = {
  sessao: Sessao;
};

export function ComprarIngressoForm({ sessao }: ComprarIngressoFormProps) {
  const router = useRouter();
  const [ocupados, setOcupados] = useState<Set<string>>(new Set());
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [loadingMapa, setLoadingMapa] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const maxSelecao = Math.min(sessao.lugaresDisponiveis, 10);
  const quantidade = selecionados.size;
  const total = sessao.valorIngresso * quantidade;
  const assentosOrdenados = useMemo(
    () => Array.from(selecionados).sort((a, b) => a.localeCompare(b)),
    [selecionados],
  );

  const carregarOcupados = useCallback(async () => {
    setLoadingMapa(true);
    try {
      const data = await listAssentosOcupados(sessao.id);
      setOcupados(new Set(data.ocupados));
    } catch {
      setErro('Não foi possível carregar o mapa de assentos.');
    } finally {
      setLoadingMapa(false);
    }
  }, [sessao.id]);

  useEffect(() => {
    carregarOcupados();
  }, [carregarOcupados]);

  function toggleAssento(codigo: string) {
    setErro(null);
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) {
        next.delete(codigo);
      } else if (next.size < maxSelecao) {
        next.add(codigo);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (quantidade === 0) {
      setErro('Selecione pelo menos um assento no mapa.');
      return;
    }

    setErro(null);
    setLoading(true);

    try {
      const res = await fetch('/api/ingressos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessaoId: sessao.id,
          assentos: assentosOrdenados,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? 'Falha ao registrar venda');
      }

      const assentosParam = assentosOrdenados.join(',');
      router.push(`/ingressos/confirmacao?vendaId=${data.id}&assentos=${encodeURIComponent(assentosParam)}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao comprar ingressos');
      await carregarOcupados();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
          Escolha seus assentos
        </h1>
        <p className="mt-2 text-body-md text-on-surface-variant">
          <strong className="text-on-surface">{sessao.filme.titulo}</strong>
          <br />
          {formatSessaoExibicao(sessao.data, sessao.horario)} · {formatMoeda(sessao.valorIngresso)} / ingresso
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
        <div>
          {loadingMapa ? (
            <p className="rounded-xl border border-outline-variant bg-surface-elevated p-10 text-center text-body-md text-on-surface-variant">
              Carregando mapa da sala…
            </p>
          ) : (
            <MapaAssentos
              ocupados={ocupados}
              selecionados={selecionados}
              onToggle={toggleAssento}
              maxSelecao={maxSelecao}
            />
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-outline-variant bg-surface-elevated p-5 shadow-sm"
          >
            <h2 className="flex items-center gap-2 text-title-md font-title-md text-on-surface">
              <span className="material-symbols-outlined text-primary">shopping_cart</span>
              Carrinho
            </h2>

            {quantidade === 0 ? (
              <p className="mt-4 text-body-sm text-on-surface-variant">
                Clique nos assentos disponíveis no mapa para adicionar ingressos.
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {assentosOrdenados.map((codigo) => (
                  <li
                    key={codigo}
                    className="flex items-center justify-between rounded-lg bg-surface-container px-3 py-2 text-body-sm"
                  >
                    <span className="font-medium text-on-surface">Assento {codigo}</span>
                    <span className="text-on-surface-variant">{formatMoeda(sessao.valorIngresso)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 space-y-2 border-t border-outline-variant pt-4 text-body-md">
              <div className="flex justify-between text-on-surface-variant">
                <span>Quantidade</span>
                <span className="font-medium text-on-surface">{quantidade}</span>
              </div>
              <div className="flex justify-between text-title-md font-title-md text-on-surface">
                <span>Total</span>
                <span className="text-primary">{formatMoeda(total)}</span>
              </div>
            </div>

            {erro && (
              <p className="mt-4 rounded-lg border border-error/40 bg-error-container/20 px-3 py-2 text-body-sm text-error">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || loadingMapa || quantidade === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-6 py-3.5 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">confirmation_number</span>
              {loading ? 'Processando…' : 'Confirmar compra'}
            </button>

            <p className="mt-3 text-center text-label-sm text-on-surface-variant">
              Máx. {maxSelecao} assento{maxSelecao === 1 ? '' : 's'} por compra
            </p>
          </form>
        </aside>
      </div>
    </div>
  );
}
