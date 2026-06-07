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
import { Fragment, useEffect, useMemo, useState } from 'react';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container p-4">
      <p className="text-label-sm text-on-surface-variant">{label}</p>
      <p className="mt-1 text-headline-sm font-headline-sm text-on-surface">{value}</p>
    </div>
  );
}

const estoqueColGroup = (
  <colgroup>
    <col className="w-[4.5rem]" />
    <col />
    <col className="w-[8.5rem]" />
    <col className="w-[7.5rem]" />
    <col className="w-[6.5rem]" />
  </colgroup>
);

function EstoqueRow({ p }: { p: Produto }) {
  const baixo = p.quantidadeEstoque < p.estoqueMinimo;
  return (
    <tr className="border-t border-outline-variant/60 align-middle">
      <td className="px-4 py-3">
        <ProdutoThumb nome={p.nome} urlImagem={p.urlImagem} className="size-12" />
      </td>
      <td className="px-4 py-3 text-body-md text-on-surface">{p.nome}</td>
      <td className="px-4 py-3 text-right text-body-sm tabular-nums text-on-surface-variant">
        {p.categoria}
      </td>
      <td
        className={`px-4 py-3 text-right text-body-md tabular-nums ${baixo ? 'font-semibold text-error' : 'text-on-surface'}`}
      >
        {p.quantidadeEstoque}
        <span className="text-on-surface-variant"> / {p.estoqueMinimo}</span>
      </td>
      <td className="px-4 py-3 text-right text-body-md tabular-nums text-on-surface">
        {formatMoeda(Number(p.preco))}
      </td>
    </tr>
  );
}

function RankingTable({
  title,
  emptyLabel,
  rows,
}: {
  title: string;
  emptyLabel: string;
  rows: { key: string | number; nome: string; valor: string | number }[];
}) {
  return (
    <section className="min-w-0">
      <h2 className="text-title-md font-title-md text-on-surface">{title}</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-outline-variant bg-surface-container/40">
        <table className="w-full min-w-[280px] table-fixed text-left">
          <colgroup>
            <col />
            <col className="w-[5.5rem]" />
          </colgroup>
          <thead>
            <tr className="border-b border-outline-variant/80 text-label-sm text-on-surface-variant">
              <th className="px-4 py-3 font-label-sm">Nome</th>
              <th className="px-4 py-3 text-right font-label-sm">Qtd.</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-4 text-body-sm text-on-surface-variant">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.key} className="border-t border-outline-variant/60 align-middle">
                  <td className="px-4 py-3 text-body-md text-on-surface">{row.nome}</td>
                  <td className="px-4 py-3 text-right text-body-md font-medium tabular-nums text-primary">
                    {row.valor}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function PainelDashboardPage() {
  const { user, ready, isAuthenticated } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated || !user?.token) {
      setLoading(false);
      return;
    }

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
  }, [ready, isAuthenticated, user?.token]);

  const categoriasEstoque = useMemo(() => {
    const itens = data?.estoqueBomboniere ?? [];
    const extras = new Set(itens.map((p) => p.categoria));
    const ordered: string[] = [];
    for (const cat of CATEGORIAS_BOMBONIERE) {
      if (extras.delete(cat)) ordered.push(cat);
    }
    return [...ordered, ...[...extras].sort((a, b) => a.localeCompare(b, 'pt-BR'))];
  }, [data?.estoqueBomboniere]);

  const estoquePorCategoria = useMemo(() => {
    const itens = data?.estoqueBomboniere ?? [];
    const map = new Map<string, Produto[]>();
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-fixed text-left">
              {estoqueColGroup}
              <thead>
                <tr className="border-b border-outline-variant/80 text-label-sm text-on-surface-variant">
                  <th className="px-4 py-3 font-label-sm" scope="col">
                    <span className="sr-only">Imagem</span>
                  </th>
                  <th className="px-4 py-3 font-label-sm" scope="col">
                    Produto
                  </th>
                  <th className="px-4 py-3 text-right font-label-sm" scope="col">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-right font-label-sm" scope="col">
                    Estoque
                  </th>
                  <th className="px-4 py-3 text-right font-label-sm" scope="col">
                    Preço
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoriasEstoque.map((cat) => {
                  const itens = estoquePorCategoria.get(cat) ?? [];
                  if (itens.length === 0) return null;
                  return (
                    <Fragment key={cat}>
                      <tr className="bg-surface-container/60">
                        <td
                          colSpan={5}
                          className="px-4 py-2.5 text-label-lg font-label-lg text-primary"
                        >
                          {cat}
                        </td>
                      </tr>
                      {itens.map((p) => (
                        <EstoqueRow key={p.id} p={p} />
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {data.produtosComEstoqueBaixo.length > 0 && (
        <section>
          <h2 className="text-title-md font-title-md text-on-surface">Alertas de estoque baixo</h2>
          <div className="mt-3 overflow-x-auto rounded-xl border border-error/30 bg-error-container/10">
            <table className="w-full min-w-[280px] table-fixed text-left">
              <colgroup>
                <col />
                <col className="w-[8rem]" />
              </colgroup>
              <thead>
                <tr className="border-b border-error/20 text-label-sm text-on-surface-variant">
                  <th className="px-4 py-3 font-label-sm">Produto</th>
                  <th className="px-4 py-3 text-right font-label-sm">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {data.produtosComEstoqueBaixo.map((p) => (
                  <tr key={p.id} className="border-t border-error/15 align-middle">
                    <td className="px-4 py-3 text-body-md text-on-surface">{p.nome}</td>
                    <td className="px-4 py-3 text-right text-body-md tabular-nums text-error">
                      {p.quantidadeEstoque} / mín. {p.estoqueMinimo}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="grid items-start gap-8 md:grid-cols-2 xl:gap-10">
        <RankingTable
          title="Produtos mais vendidos"
          emptyLabel="Sem vendas registradas."
          rows={data.produtosMaisVendidos.map((p) => ({
            key: p.produtoId,
            nome: p.nome,
            valor: p.quantidadeVendida,
          }))}
        />
        <RankingTable
          title="Sessões mais vendidas"
          emptyLabel="Sem vendas registradas."
          rows={data.sessoesMaisVendidas.map((s) => ({
            key: s.sessaoId,
            nome: s.filmeTitulo,
            valor: s.quantidadeVendida,
          }))}
        />
      </div>
    </div>
  );
}
