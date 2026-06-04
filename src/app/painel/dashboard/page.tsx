'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { ProdutoThumb } from '@/components/painel/ProdutoThumb';
import { getDashboard } from '@/lib/api/dashboard';
import { ApiRequestError } from '@/lib/api/http';
import { getApiErrorMessage } from '@/lib/api/error-message';
import type { DashboardData, Produto } from '@/lib/api/types';
import { CATEGORIAS_BOMBONIERE } from '@/lib/bomboniere/categorias';
import { formatMoeda } from '@/lib/utils/format';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4">
      <p className="text-label-sm text-on-surface-variant">{label}</p>
      <p className="mt-1 text-headline-sm font-headline-sm text-on-surface">{value}</p>
    </div>
  );
}

function EstoqueRow({ p }: { p: Produto }) {
  const baixo = p.quantidadeEstoque < p.estoqueMinimo;
  return (
    <tr className="border-t border-outline-variant/60">
      <td className="py-3 pr-4">
        <ProdutoThumb nome={p.nome} urlImagem={p.urlImagem} className="size-12" />
      </td>
      <td className="py-3 pr-4 text-body-md text-on-surface">{p.nome}</td>
      <td className="py-3 pr-4 text-body-sm text-on-surface-variant">{p.categoria}</td>
      <td className={`py-3 pr-4 text-body-md ${baixo ? 'font-semibold text-error' : 'text-on-surface'}`}>
        {p.quantidadeEstoque}
        <span className="text-on-surface-variant"> / {p.estoqueMinimo}</span>
      </td>
      <td className="py-3 text-body-md text-on-surface">{formatMoeda(Number(p.preco))}</td>
    </tr>
  );
}

export default function PainelDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.token) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const dash = await getDashboard(user.token);
        if (!cancelled) setData(dash);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao carregar dashboard.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const estoquePorCategoria = useMemo(() => {
    const itens = data?.estoqueBomboniere ?? [];
    const map = new Map<string, Produto[]>();
    for (const cat of CATEGORIAS_BOMBONIERE) {
      map.set(cat, []);
    }
    for (const p of itens) {
      const arr = map.get(p.categoria) ?? [];
      arr.push(p);
      map.set(p.categoria, arr);
    }
    return map;
  }, [data?.estoqueBomboniere]);

  if (loading) {
    return <p className="text-on-surface-variant">Carregando relatórios…</p>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-error/40 bg-error-container/20 p-4 text-on-surface">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const estoque = data.estoqueBomboniere ?? [];
  const totalBaixo = data.produtosComEstoqueBaixo.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Dashboard</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Resumo de vendas e operação de hoje</p>
        </div>
        <Link
          href="/painel/bomboniere"
          className="inline-flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-label-lg font-label-lg text-white"
        >
          <span className="material-symbols-outlined text-xl">fastfood</span>
          Gerenciar bomboniere
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard label="Vendas hoje" value={formatMoeda(Number(data.totalVendidoHoje))} />
        <StatCard label="Ingressos vendidos" value={String(data.totalIngressosVendidosHoje)} />
        <StatCard label="Produtos vendidos" value={String(data.totalProdutosVendidosHoje)} />
        <StatCard label="Filmes cadastrados" value={String(data.quantidadeFilmes)} />
        <StatCard label="Sessões" value={String(data.quantidadeSessoes)} />
        <StatCard label="Itens bomboniere" value={String(data.quantidadeProdutos)} />
      </div>

      <section className="rounded-xl border border-outline-variant bg-surface-container/40 p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-title-md font-title-md text-on-surface">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            Estoque da bomboniere
          </h2>
          {totalBaixo > 0 && (
            <span className="rounded-lg bg-error-container/25 px-3 py-1 text-label-sm text-error">
              {totalBaixo} item(ns) abaixo do mínimo
            </span>
          )}
        </div>

        {estoque.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">
            Nenhum produto cadastrado.{' '}
            <Link href="/painel/bomboniere" className="text-primary underline">
              Cadastrar na bomboniere
            </Link>
          </p>
        ) : (
          <div className="space-y-6 overflow-x-auto">
            {CATEGORIAS_BOMBONIERE.map((cat) => {
              const itens = estoquePorCategoria.get(cat) ?? [];
              if (itens.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="mb-2 text-label-lg font-label-lg text-primary">{cat}</h3>
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="text-label-sm text-on-surface-variant">
                        <th className="pb-2 pr-4 font-label-sm"> </th>
                        <th className="pb-2 pr-4 font-label-sm">Produto</th>
                        <th className="pb-2 pr-4 font-label-sm">Categoria</th>
                        <th className="pb-2 pr-4 font-label-sm">Estoque</th>
                        <th className="pb-2 font-label-sm">Preço</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((p) => (
                        <EstoqueRow key={p.id} p={p} />
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {data.produtosComEstoqueBaixo.length > 0 && (
        <section>
          <h2 className="text-title-md font-title-md text-on-surface">Alertas de estoque baixo</h2>
          <ul className="mt-3 space-y-2">
            {data.produtosComEstoqueBaixo.map((p) => (
              <li
                key={p.id}
                className="flex justify-between rounded-lg bg-error-container/15 px-4 py-3 text-body-md"
              >
                <span>{p.nome}</span>
                <span className="text-error">
                  {p.quantidadeEstoque} / mín. {p.estoqueMinimo}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-8 md:grid-cols-2 xl:gap-10">
        <section>
          <h2 className="text-title-md font-title-md text-on-surface">Produtos mais vendidos</h2>
          <ul className="mt-3 space-y-2">
            {data.produtosMaisVendidos.length === 0 ? (
              <li className="text-body-sm text-on-surface-variant">Sem vendas registradas.</li>
            ) : (
              data.produtosMaisVendidos.map((p) => (
                <li
                  key={p.produtoId}
                  className="flex justify-between rounded-lg bg-surface-container px-4 py-3"
                >
                  <span>{p.nome}</span>
                  <span className="text-primary">{p.quantidadeVendida}</span>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <h2 className="text-title-md font-title-md text-on-surface">Sessões mais vendidas</h2>
          <ul className="mt-3 space-y-2">
            {data.sessoesMaisVendidas.length === 0 ? (
              <li className="text-body-sm text-on-surface-variant">Sem vendas registradas.</li>
            ) : (
              data.sessoesMaisVendidas.map((s) => (
                <li
                  key={s.sessaoId}
                  className="flex justify-between rounded-lg bg-surface-container px-4 py-3"
                >
                  <span>{s.filmeTitulo}</span>
                  <span className="text-primary">{s.quantidadeVendida}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
