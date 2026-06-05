'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { PosterUpload } from '@/components/painel/PosterUpload';
import { ApiRequestError } from '@/lib/api/http';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { FilmesCadastradosLista } from '@/components/painel/FilmesCadastradosLista';
import {
  atualizarFilme,
  cadastrarFilme,
  uploadFilmePoster,
} from '@/lib/api/painel-filmes';
import type { Filme } from '@/lib/api/types';
import { useRef, useState } from 'react';

export default function NovoFilmePage() {
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editPosterUrl, setEditPosterUrl] = useState<string | null>(null);
  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [classificacao, setClassificacao] = useState('Livre');
  const [duracao, setDuracao] = useState('120');
  const [sinopse, setSinopse] = useState('');
  const [status, setStatus] = useState(true);
  const [poster, setPoster] = useState<File | null>(null);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listaRefresh, setListaRefresh] = useState(0);

  function limparFormulario() {
    setEditId(null);
    setEditPosterUrl(null);
    setTitulo('');
    setGenero('');
    setClassificacao('Livre');
    setDuracao('120');
    setSinopse('');
    setStatus(true);
    setPoster(null);
    setPosterError(null);
    setError(null);
  }

  function fecharFormulario() {
    limparFormulario();
    setFormAberto(false);
  }

  function abrirCadastro() {
    limparFormulario();
    setSuccess(null);
    setFormAberto(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function iniciarEdicao(filme: Filme) {
    setEditId(filme.id);
    setEditPosterUrl(filme.urlImagem ?? null);
    setTitulo(filme.titulo);
    setGenero(filme.genero);
    setClassificacao(filme.classificacao);
    setDuracao(String(filme.duracao));
    setSinopse(filme.sinopse ?? '');
    setStatus(filme.status);
    setPoster(null);
    setPosterError(null);
    setError(null);
    setSuccess(null);
    setFormAberto(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.token) return;
    if (posterError) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      titulo: titulo.trim(),
      genero: genero.trim(),
      classificacao: classificacao.trim(),
      duracao: Number(duracao),
      sinopse: sinopse.trim() || null,
      status,
    };

    try {
      let filme: Filme;
      if (editId) {
        filme = await atualizarFilme(user.token, editId, payload);
        if (poster) {
          filme = await uploadFilmePoster(user.token, filme.id, poster);
        }
        setSuccess(`"${filme.titulo}" atualizado com sucesso.`);
        fecharFormulario();
      } else {
        filme = await cadastrarFilme(user.token, payload);
        if (poster) {
          filme = await uploadFilmePoster(user.token, filme.id, poster);
        }
        setSuccess(`"${filme.titulo}" cadastrado com sucesso.`);
        fecharFormulario();
      }
      setListaRefresh((k) => k + 1);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? getApiErrorMessage(err)
          : editId
            ? 'Não foi possível atualizar o filme.'
            : 'Não foi possível cadastrar o filme.',
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30';

  const editando = editId !== null;

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Filmes</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Gerencie o catálogo, cartazes e informações dos filmes em cartaz.
          </p>
        </div>
        {!formAberto && (
          <button
            type="button"
            onClick={abrirCadastro}
            className="flex items-center gap-2 rounded-lg bg-primary-container px-5 py-3 text-label-lg font-label-lg text-white transition hover:opacity-90"
          >
            <span className="material-symbols-outlined">add</span>
            Cadastrar novo filme
          </button>
        )}
      </div>

      {success && (
        <p className="mb-6 flex items-start gap-2 rounded-lg bg-secondary-container/30 px-4 py-3 text-body-sm text-on-surface">
          <span className="material-symbols-outlined shrink-0 text-secondary">check_circle</span>
          {success}
        </p>
      )}

      {formAberto && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mb-10 rounded-xl border border-outline-variant bg-surface-container/30 p-5 sm:p-6"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-title-md font-title-md text-on-surface">
              <span className="material-symbols-outlined text-primary">
                {editando ? 'edit' : 'movie'}
              </span>
              {editando ? 'Editar filme' : 'Cadastrar novo filme'}
            </h2>
            <button
              type="button"
              onClick={fecharFormulario}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant transition hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">close</span>
              Fechar
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(240px,300px)_1fr] lg:gap-10 xl:grid-cols-[minmax(260px,320px)_1fr] 2xl:gap-12">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <PosterUpload
                value={poster}
                onChange={setPoster}
                disabled={loading}
                error={posterError}
                onValidationError={setPosterError}
                existingImageUrl={editPosterUrl}
                existingAlt={`Poster de ${titulo || 'filme'}`}
              />
            </aside>

            <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container/50 p-5 sm:p-6">
              <h3 className="text-label-sm font-medium uppercase tracking-wide text-on-surface-variant">
                Informações do filme
              </h3>

              <label className="block">
                <span className="text-label-sm text-on-surface-variant">Título</span>
                <input
                  className={inputClass}
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                  placeholder="Ex.: Interestelar"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-label-sm text-on-surface-variant">Gênero</span>
                  <input
                    className={inputClass}
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    required
                    placeholder="Ex.: Ficção científica"
                  />
                </label>
                <label className="block">
                  <span className="text-label-sm text-on-surface-variant">Classificação</span>
                  <select
                    className={inputClass}
                    value={classificacao}
                    onChange={(e) => setClassificacao(e.target.value)}
                  >
                    <option value="Livre">Livre</option>
                    <option value="10">10 anos</option>
                    <option value="12">12 anos</option>
                    <option value="14">14 anos</option>
                    <option value="16">16 anos</option>
                    <option value="18">18 anos</option>
                  </select>
                </label>
              </div>

              <label className="block sm:max-w-[200px]">
                <span className="text-label-sm text-on-surface-variant">Duração (minutos)</span>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={duracao}
                  onChange={(e) => setDuracao(e.target.value)}
                  required
                />
              </label>

              <label className="block">
                <span className="text-label-sm text-on-surface-variant">Sinopse</span>
                <textarea
                  className={`${inputClass} min-h-[120px] resize-y`}
                  value={sinopse}
                  onChange={(e) => setSinopse(e.target.value)}
                  placeholder="Breve descrição exibida na página do filme…"
                />
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-outline-variant/60 bg-surface px-4 py-3">
                <input
                  type="checkbox"
                  checked={status}
                  onChange={(e) => setStatus(e.target.checked)}
                  className="size-5 accent-primary-container"
                />
                <span>
                  <span className="block text-body-md text-on-surface">Exibir na programação</span>
                  <span className="text-body-sm text-on-surface-variant">
                    Filmes inativos ficam ocultos do público
                  </span>
                </span>
              </label>
            </div>
          </div>

          {error && (
            <p className="mt-6 flex items-start gap-2 rounded-lg bg-error-container/30 px-4 py-3 text-body-sm text-error">
              <span className="material-symbols-outlined shrink-0">error</span>
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3 border-t border-outline-variant pt-6">
            <button
              type="submit"
              disabled={loading || !!posterError}
              className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3.5 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <span className="material-symbols-outlined">
                {loading ? 'hourglass_top' : editando ? 'save' : poster ? 'cloud_upload' : 'save'}
              </span>
              {loading
                ? 'Salvando…'
                : editando
                  ? poster
                    ? 'Salvar e trocar poster'
                    : 'Salvar alterações'
                  : poster
                    ? 'Cadastrar e enviar poster'
                    : 'Cadastrar filme'}
            </button>
            <button
              type="button"
              onClick={fecharFormulario}
              className="rounded-lg border border-outline-variant px-6 py-3.5 text-label-lg text-on-surface-variant transition hover:border-primary hover:text-primary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <FilmesCadastradosLista
        refreshKey={listaRefresh}
        onEditar={iniciarEdicao}
        editId={editId}
        onExcluido={fecharFormulario}
      />
    </div>
  );
}
