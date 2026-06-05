'use client';

import { useCallback, useEffect, useState } from 'react';
import { FilmePoster } from '@/components/cinema/FilmePoster';
import { useAuth } from '@/components/auth/AuthContext';
import { ApiRequestError } from '@/lib/api/http';
import { getApiErrorMessage } from '@/lib/api/error-message';
import {
  excluirFilme,
  listarTodosFilmesPainel,
  removerFilmePoster,
  uploadFilmePoster,
} from '@/lib/api/painel-filmes';
import type { Filme } from '@/lib/api/types';
import { formatDuracao } from '@/lib/utils/format';

type FilmesCadastradosListaProps = {
  refreshKey?: number;
  onEditar?: (filme: Filme) => void;
  editId?: number | null;
  onExcluido?: () => void;
};

export function FilmesCadastradosLista({
  refreshKey = 0,
  onEditar,
  editId = null,
  onExcluido,
}: FilmesCadastradosListaProps) {
  const { user } = useAuth();
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [acaoId, setAcaoId] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setErro(null);
    try {
      const todos = await listarTodosFilmesPainel(user.token);
      setFilmes(todos);
    } catch (err) {
      setErro(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao carregar filmes.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    carregar();
  }, [carregar, refreshKey]);

  async function handleRemoverPoster(filme: Filme) {
    if (!user?.token || !filme.urlImagem) return;
    if (!confirm(`Remover o cartaz de "${filme.titulo}"?`)) return;
    setAcaoId(filme.id);
    try {
      await removerFilmePoster(user.token, filme.id);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Não foi possível remover o cartaz.');
    } finally {
      setAcaoId(null);
    }
  }

  async function handleTrocarPoster(filme: Filme, file: File) {
    if (!user?.token) return;
    setAcaoId(filme.id);
    try {
      await uploadFilmePoster(user.token, filme.id, file);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Não foi possível enviar o cartaz.');
    } finally {
      setAcaoId(null);
    }
  }

  async function handleExcluir(filme: Filme) {
    if (!user?.token) return;

    const vendas = filme.quantidadeVendasIngresso ?? 0;
    const mensagem =
      vendas > 0
        ? `O filme "${filme.titulo}" possui ${vendas} venda(s) de ingresso registrada(s). Excluir também remove todas as sessões e vendas vinculadas. Esta ação não pode ser desfeita. Continuar?`
        : `Excluir o filme "${filme.titulo}" do catálogo? As sessões vinculadas também serão removidas.`;

    if (!confirm(mensagem)) return;

    setAcaoId(filme.id);
    setErro(null);
    try {
      await excluirFilme(user.token, filme.id);
      if (editId === filme.id) onExcluido?.();
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Não foi possível excluir o filme.');
    } finally {
      setAcaoId(null);
    }
  }

  return (
    <section className="mt-12 border-t border-outline-variant pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-title-md font-title-md text-on-surface">
            <span className="material-symbols-outlined text-primary">collections</span>
            Filmes cadastrados
          </h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Edite informações, gerencie cartazes e remova filmes do catálogo.
          </p>
        </div>
        <button
          type="button"
          onClick={carregar}
          disabled={loading}
          className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          Atualizar
        </button>
      </div>

      {erro && (
        <p className="mb-4 flex items-start gap-2 rounded-lg bg-error-container/30 px-4 py-3 text-body-sm text-error">
          <span className="material-symbols-outlined shrink-0">error</span>
          {erro}
        </p>
      )}

      {loading && filmes.length === 0 ? (
        <p className="text-body-md text-on-surface-variant">Carregando filmes…</p>
      ) : filmes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-outline-variant px-6 py-10 text-center text-body-md text-on-surface-variant">
          Nenhum filme cadastrado ainda.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filmes.map((filme) => {
            const busy = acaoId === filme.id;
            return (
              <li
                key={filme.id}
                className={`flex flex-col overflow-hidden rounded-xl border bg-surface-elevated ${editId === filme.id ? 'border-primary ring-2 ring-primary/30' : 'border-outline-variant'}`}
              >
                <div className="relative aspect-[2/3] w-full bg-surface-container">
                  <FilmePoster filme={filme} fillParent />
                  {!filme.status && (
                    <span className="absolute left-2 top-2 rounded bg-on-surface/80 px-2 py-0.5 text-label-sm text-surface">
                      Inativo
                    </span>
                  )}
                  {(filme.quantidadeVendasIngresso ?? 0) > 0 && (
                    <span className="absolute right-2 top-2 rounded bg-primary-container/90 px-2 py-0.5 text-label-sm text-white">
                      {filme.quantidadeVendasIngresso} venda(s)
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-2 text-body-md font-medium text-on-surface">{filme.titulo}</h3>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    {filme.genero} · {formatDuracao(filme.duracao)}
                  </p>
                  <div className="mt-3 flex flex-1 flex-col gap-2">
                    {onEditar && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onEditar(filme)}
                        className="flex items-center justify-center gap-1 rounded-lg border border-primary/40 py-2 text-label-sm text-primary transition hover:bg-primary/10 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">edit</span>
                        Editar informações
                      </button>
                    )}
                    <label
                      className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-outline-variant py-2 text-label-sm text-on-surface-variant transition hover:border-primary hover:text-primary ${busy ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <span className="material-symbols-outlined text-base">upload</span>
                      {filme.urlImagem ? 'Trocar cartaz' : 'Enviar cartaz'}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) void handleTrocarPoster(filme, file);
                        }}
                      />
                    </label>
                    {filme.urlImagem && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleRemoverPoster(filme)}
                        className="flex items-center justify-center gap-1 rounded-lg border border-outline-variant py-2 text-label-sm text-on-surface-variant transition hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-base">hide_image</span>
                        Remover cartaz
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleExcluir(filme)}
                      className="flex items-center justify-center gap-1 rounded-lg border border-error/40 py-2 text-label-sm text-error transition hover:bg-error-container/20 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                      Excluir filme
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
