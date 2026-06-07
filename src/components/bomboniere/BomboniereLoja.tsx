'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { useNotificacoes } from '@/components/notificacoes/NotificacaoProvider';
import { ProdutoThumb } from '@/components/painel/ProdutoThumb';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { listarProdutos } from '@/lib/api/produtos';
import type { Produto } from '@/lib/api/types';
import { registrarVendaProduto } from '@/lib/api/vendas-produto';
import { CATEGORIAS_BOMBONIERE } from '@/lib/bomboniere/categorias';
import { formatMoeda } from '@/lib/utils/format';

type Carrinho = Record<number, number>;

export function BomboniereLoja() {
  const { user } = useAuth();
  const { registrarPedidoConhecido } = useNotificacoes();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<Carrinho>({});
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<{
    codigo: string;
    total: number;
  } | null>(null);

  const carregar = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setErro(null);
    try {
      const page = await listarProdutos(user.token, 0, 200);
      setProdutos(
        page.content.filter((p) => p.ativo && p.quantidadeEstoque > 0),
      );
    } catch (err) {
      setErro(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const porCategoria = useMemo(() => {
    const map = new Map<string, Produto[]>();
    for (const cat of CATEGORIAS_BOMBONIERE) {
      map.set(
        cat,
        produtos.filter((p) => p.categoria === cat),
      );
    }
    return map;
  }, [produtos]);

  const itensCarrinho = useMemo(() => {
    return Object.entries(carrinho)
      .map(([id, qtd]) => {
        const produto = produtos.find((p) => p.id === Number(id));
        if (!produto || qtd < 1) return null;
        return { produto, quantidade: qtd };
      })
      .filter(Boolean) as { produto: Produto; quantidade: number }[];
  }, [carrinho, produtos]);

  const total = useMemo(
    () =>
      itensCarrinho.reduce(
        (acc, { produto, quantidade }) => acc + produto.preco * quantidade,
        0,
      ),
    [itensCarrinho],
  );

  function alterarQuantidade(produto: Produto, delta: number) {
    setCarrinho((prev) => {
      const atual = prev[produto.id] ?? 0;
      const next = Math.min(
        produto.quantidadeEstoque,
        Math.max(0, atual + delta),
      );
      if (next === 0) {
        const { [produto.id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [produto.id]: next };
    });
  }

  useEffect(() => {
    if (!pedidoConfirmado) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [pedidoConfirmado]);

  async function finalizarPedido() {
    if (!user?.token || itensCarrinho.length === 0) return;
    setCheckout(true);
    setErro(null);
    try {
      const venda = await registrarVendaProduto(user.token, {
        itens: itensCarrinho.map(({ produto, quantidade }) => ({
          produtoId: produto.id,
          quantidade,
        })),
      });
      setCarrinho({});
      setPedidoConfirmado({
        codigo: venda.codigoPedido ?? String(venda.id),
        total: venda.valorTotal,
      });
      registrarPedidoConhecido('bomboniere', venda.id, venda.status ?? 'PENDENTE');
      await carregar();
    } catch (err) {
      setErro(getApiErrorMessage(err));
    } finally {
      setCheckout(false);
    }
  }

  if (loading) {
    return (
      <p className="text-center text-body-md text-on-surface-variant">Carregando cardápio…</p>
    );
  }

  return (
    <div className="mx-auto max-w-container-max">
      {pedidoConfirmado && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Fechar"
            onClick={() => setPedidoConfirmado(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pedido-bomboniere-title"
            className="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container p-6 text-center shadow-2xl"
          >
            <span
              className="material-symbols-outlined text-5xl text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <h2
              id="pedido-bomboniere-title"
              className="mt-4 font-headline-lg-mobile text-headline-lg-mobile text-on-surface"
            >
              Pedido confirmado!
            </h2>
            <p className="mt-2 text-body-sm text-on-surface-variant">Número do pedido</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-wider text-primary">
              {pedidoConfirmado.codigo}
            </p>
            <p className="mt-4 text-body-md text-on-surface-variant">
              Total:{' '}
              <span className="text-xl font-semibold text-on-surface">
                {formatMoeda(pedidoConfirmado.total)}
              </span>
            </p>
            <p className="mt-3 text-body-sm text-on-surface-variant">
              Apresente este código na retirada do seu pedido.
            </p>
            <button
              type="button"
              onClick={() => setPedidoConfirmado(null)}
              className="mt-6 w-full rounded-lg bg-primary-container py-3 text-label-lg font-label-lg text-white transition hover:opacity-90"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
        Bomboniere
      </h1>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Escolha seus itens e finalize o pedido na retirada.
      </p>

      {erro && (
        <p className="mt-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-body-sm text-primary">
          {erro}
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          {CATEGORIAS_BOMBONIERE.map((cat) => {
            const itens = porCategoria.get(cat) ?? [];
            if (itens.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="text-title-md font-title-md text-primary">{cat}</h2>
                <ul className="mt-4 flex flex-col gap-4">
                  {itens.map((p) => {
                    const qtd = carrinho[p.id] ?? 0;
                    return (
                      <li
                        key={p.id}
                        className="flex gap-4 rounded-xl border border-outline-variant bg-surface-elevated p-4"
                      >
                        <ProdutoThumb nome={p.nome} urlImagem={p.urlImagem} className="size-20" />
                        <div className="min-w-0 flex-1">
                          <p className="font-title-md text-title-md text-on-surface">{p.nome}</p>
                          {p.descricao && (
                            <p className="mt-1 line-clamp-2 text-body-sm text-on-surface-variant">
                              {p.descricao}
                            </p>
                          )}
                          <p className="mt-2 text-label-lg font-label-lg text-primary">
                            {formatMoeda(p.preco)}
                          </p>
                          <div className="mt-3 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(p, -1)}
                              disabled={qtd < 1}
                              className="flex size-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface disabled:opacity-40"
                              aria-label={`Menos ${p.nome}`}
                            >
                              <span className="material-symbols-outlined text-xl">remove</span>
                            </button>
                            <span className="min-w-[2ch] text-center text-title-md text-on-surface">
                              {qtd}
                            </span>
                            <button
                              type="button"
                              onClick={() => alterarQuantidade(p, 1)}
                              disabled={qtd >= p.quantidadeEstoque}
                              className="flex size-9 items-center justify-center rounded-lg border border-outline-variant text-on-surface disabled:opacity-40"
                              aria-label={`Mais ${p.nome}`}
                            >
                              <span className="material-symbols-outlined text-xl">add</span>
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
          {produtos.length === 0 && !erro && (
            <p className="text-body-md text-on-surface-variant">
              Nenhum item disponível no momento.
            </p>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-outline-variant bg-surface-elevated p-5 lg:sticky lg:top-24">
          <h2 className="text-title-md font-title-md text-on-surface">Seu pedido</h2>
          {itensCarrinho.length === 0 ? (
            <p className="mt-3 text-body-sm text-on-surface-variant">Adicione itens ao carrinho.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {itensCarrinho.map(({ produto, quantidade }) => (
                <li
                  key={produto.id}
                  className="flex justify-between gap-2 text-body-sm text-on-surface-variant"
                >
                  <span>
                    {quantidade}× {produto.nome}
                  </span>
                  <span className="text-on-surface">{formatMoeda(produto.preco * quantidade)}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 border-t border-outline-variant pt-4 text-title-md font-title-md text-on-surface">
            Total: <span className="text-primary">{formatMoeda(total)}</span>
          </p>
          <button
            type="button"
            disabled={checkout || itensCarrinho.length === 0}
            onClick={finalizarPedido}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3.5 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            {checkout ? 'Processando…' : 'Finalizar pedido'}
          </button>
        </aside>
      </div>
    </div>
  );
}
