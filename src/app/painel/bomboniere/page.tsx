'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { PosterUpload } from '@/components/painel/PosterUpload';
import { ProdutoThumb } from '@/components/painel/ProdutoThumb';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { ApiRequestError } from '@/lib/api/http';
import {
  atualizarProduto,
  cadastrarProduto,
  excluirProduto,
  listarProdutos,
  reporEstoque,
  uploadProdutoImagem,
} from '@/lib/api/produtos';
import type { Produto, ProdutoRequest } from '@/lib/api/types';
import { CATEGORIAS_BOMBONIERE } from '@/lib/bomboniere/categorias';
import { formatMoeda } from '@/lib/utils/format';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

const inputClass =
  'w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none focus:border-primary';

function emptyForm(): ProdutoRequest {
  return {
    nome: '',
    categoria: CATEGORIAS_BOMBONIERE[0],
    descricao: '',
    preco: 0,
    quantidadeEstoque: 0,
    estoqueMinimo: 5,
    ativo: true,
  };
}

export default function BombonierePage() {
  const { user, hasRole } = useAuth();
  const [lista, setLista] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProdutoRequest>(emptyForm);
  const [imagem, setImagem] = useState<File | null>(null);
  const [imagemErro, setImagemErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setError(null);
    try {
      const page = await listarProdutos(user.token, 0, 200);
      setLista(page.content);
    } catch (err) {
      setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao carregar produtos.');
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
      map.set(cat, []);
    }
    for (const p of lista) {
      const arr = map.get(p.categoria) ?? [];
      arr.push(p);
      map.set(p.categoria, arr);
    }
    return map;
  }, [lista]);

  function iniciarEdicao(p: Produto) {
    setEditId(p.id);
    setForm({
      nome: p.nome,
      categoria: p.categoria,
      descricao: p.descricao ?? '',
      preco: Number(p.preco),
      quantidadeEstoque: p.quantidadeEstoque,
      estoqueMinimo: p.estoqueMinimo,
      ativo: p.ativo,
    });
    setImagem(null);
    setImagemErro(null);
    setSuccess(null);
    setError(null);
  }

  function cancelarEdicao() {
    setEditId(null);
    setForm(emptyForm());
    setImagem(null);
    setImagemErro(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.token || imagemErro) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: ProdutoRequest = {
      nome: form.nome.trim(),
      categoria: form.categoria,
      descricao: form.descricao?.trim() || null,
      preco: Number(form.preco),
      quantidadeEstoque: Number(form.quantidadeEstoque),
      estoqueMinimo: Number(form.estoqueMinimo),
      ativo: form.ativo,
    };

    try {
      let produto: Produto;
      if (editId) {
        produto = await atualizarProduto(user.token, editId, payload);
        if (imagem) {
          produto = await uploadProdutoImagem(user.token, produto.id, imagem);
        }
        setSuccess('Produto atualizado.');
      } else {
        produto = await cadastrarProduto(user.token, payload);
        if (imagem) {
          produto = await uploadProdutoImagem(user.token, produto.id, imagem);
        }
        setSuccess('Produto cadastrado.');
      }
      cancelarEdicao();
      await carregar();
    } catch (err) {
      setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  }

  async function handleExcluir(id: number) {
    if (!user?.token || !hasRole('ADMIN') || !confirm('Excluir este produto?')) return;
    setError(null);
    try {
      await excluirProduto(user.token, id);
      if (editId === id) cancelarEdicao();
      await carregar();
      setSuccess('Produto removido.');
    } catch (err) {
      setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao excluir.');
    }
  }

  async function handleRepor(id: number) {
    if (!user?.token) return;
    const qtd = prompt('Quantidade a adicionar ao estoque:');
    if (!qtd) return;
    const quantidade = Number(qtd);
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      setError('Informe uma quantidade válida.');
      return;
    }
    try {
      await reporEstoque(user.token, id, quantidade);
      await carregar();
      setSuccess('Estoque reposto.');
    } catch (err) {
      setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao repor estoque.');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Bomboniere</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Cadastre pipoca, doces e refrigerantes com foto, descrição, preço e estoque.
          </p>
        </div>
        <Link
          href="/painel/dashboard"
          className="text-label-lg text-primary hover:underline"
        >
          Ver estoque no dashboard
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-outline-variant bg-surface-container/50 p-5 xl:sticky xl:top-24 xl:self-start"
        >
          <h2 className="flex items-center gap-2 text-title-md font-title-md text-on-surface">
            <span className="material-symbols-outlined text-primary">fastfood</span>
            {editId ? 'Editar produto' : 'Novo produto'}
          </h2>

          <label className="block">
            <span className="text-label-sm text-on-surface-variant">Nome</span>
            <input
              className={inputClass}
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              required
            />
          </label>

          <label className="block">
            <span className="text-label-sm text-on-surface-variant">Categoria</span>
            <select
              className={inputClass}
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
            >
              {CATEGORIAS_BOMBONIERE.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-label-sm text-on-surface-variant">Descrição</span>
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={form.descricao ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              placeholder="Ingredientes, tamanho, observações…"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-label-sm text-on-surface-variant">Preço (R$)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={form.preco}
                onChange={(e) => setForm((f) => ({ ...f, preco: Number(e.target.value) }))}
                required
              />
            </label>
            <label className="block">
              <span className="text-label-sm text-on-surface-variant">Qtd. estoque</span>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.quantidadeEstoque}
                onChange={(e) => setForm((f) => ({ ...f, quantidadeEstoque: Number(e.target.value) }))}
                required
              />
            </label>
          </div>

          <label className="block sm:max-w-[50%]">
            <span className="text-label-sm text-on-surface-variant">Estoque mínimo</span>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.estoqueMinimo}
              onChange={(e) => setForm((f) => ({ ...f, estoqueMinimo: Number(e.target.value) }))}
              required
            />
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
              className="size-5 accent-primary-container"
            />
            <span className="text-body-md text-on-surface">Disponível para venda</span>
          </label>

          <PosterUpload
            value={imagem}
            onChange={setImagem}
            disabled={saving}
            error={imagemErro}
            onValidationError={setImagemErro}
            titulo="Foto do produto"
            dica="Imagem quadrada ou vertical. JPEG, PNG ou WEBP, até 5 MB."
          />

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={saving || !!imagemErro}
              className="rounded-lg bg-primary-container px-5 py-3 text-label-lg font-label-lg text-white disabled:opacity-50"
            >
              {saving ? 'Salvando…' : editId ? 'Salvar alterações' : 'Cadastrar produto'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="rounded-lg border border-outline-variant px-5 py-3 text-label-lg text-on-surface-variant"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="space-y-6">
          {success && (
            <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-body-sm text-primary">
              {success}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-error-container/30 px-4 py-3 text-body-sm text-error">{error}</p>
          )}

          {loading ? (
            <p className="text-on-surface-variant">Carregando catálogo…</p>
          ) : lista.length === 0 ? (
            <p className="text-on-surface-variant">Nenhum produto cadastrado.</p>
          ) : (
            CATEGORIAS_BOMBONIERE.map((cat) => {
              const itens = porCategoria.get(cat) ?? [];
              if (itens.length === 0) return null;
              return (
                <section key={cat}>
                  <h3 className="mb-3 text-title-md font-title-md text-primary">{cat}</h3>
                  <ul className="space-y-3">
                    {itens.map((p) => {
                      const baixo = p.quantidadeEstoque < p.estoqueMinimo;
                      return (
                        <li
                          key={p.id}
                          className="flex flex-wrap items-start gap-4 rounded-xl border border-outline-variant bg-surface-elevated p-4"
                        >
                          <ProdutoThumb nome={p.nome} urlImagem={p.urlImagem} className="size-20" />
                          <div className="min-w-0 flex-1">
                            <p className="font-title-md text-title-md text-on-surface">{p.nome}</p>
                            {p.descricao && (
                              <p className="mt-1 line-clamp-2 text-body-sm text-on-surface-variant">
                                {p.descricao}
                              </p>
                            )}
                            <p className="mt-2 text-body-sm text-on-surface-variant">
                              {formatMoeda(Number(p.preco))} ·{' '}
                              <span className={baixo ? 'text-error' : ''}>
                                Estoque: {p.quantidadeEstoque} (mín. {p.estoqueMinimo})
                              </span>
                              {!p.ativo && (
                                <span className="ml-2 rounded bg-surface-container-high px-2 py-0.5 text-label-sm">
                                  Inativo
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleRepor(p.id)}
                              className="rounded-lg border border-outline-variant px-3 py-2 text-label-sm hover:border-primary hover:text-primary"
                            >
                              Repor
                            </button>
                            <button
                              type="button"
                              onClick={() => iniciarEdicao(p)}
                              className="rounded-lg border border-outline-variant px-3 py-2 text-label-sm hover:border-primary hover:text-primary"
                            >
                              Editar
                            </button>
                            {hasRole('ADMIN') && (
                              <button
                                type="button"
                                onClick={() => handleExcluir(p.id)}
                                className="rounded-lg border border-error/50 px-3 py-2 text-label-sm text-error"
                              >
                                Excluir
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
