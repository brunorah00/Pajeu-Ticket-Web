'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { PosterUpload } from '@/components/painel/PosterUpload';
import { ApiRequestError } from '@/lib/api/http';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { cadastrarFilme, uploadFilmePoster } from '@/lib/api/painel-filmes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NovoFilmePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [genero, setGenero] = useState('');
  const [classificacao, setClassificacao] = useState('Livre');
  const [duracao, setDuracao] = useState('120');
  const [sinopse, setSinopse] = useState('');
  const [status, setStatus] = useState(true);
  const [poster, setPoster] = useState<File | null>(null);
  const [posterError, setPosterError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.token) return;
    if (posterError) return;

    setLoading(true);
    setError(null);

    try {
      const filme = await cadastrarFilme(user.token, {
        titulo: titulo.trim(),
        genero: genero.trim(),
        classificacao: classificacao.trim(),
        duracao: Number(duracao),
        sinopse: sinopse.trim() || null,
        status,
      });

      if (poster) {
        await uploadFilmePoster(user.token, filme.id, poster);
      }

      router.push('/programacao');
    } catch (err) {
      setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Não foi possível cadastrar o filme.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/30';

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Cadastrar filme</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Preencha os dados e envie o poster. O filme ativo aparece na programação após salvar.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-[minmax(240px,300px)_1fr] lg:gap-10 xl:grid-cols-[minmax(260px,320px)_1fr] 2xl:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <PosterUpload
              value={poster}
              onChange={setPoster}
              disabled={loading}
              error={posterError}
              onValidationError={setPosterError}
            />
          </aside>

          <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container/50 p-5 sm:p-6">
            <h2 className="flex items-center gap-2 text-title-md font-title-md text-on-surface">
              <span className="material-symbols-outlined text-primary">movie</span>
              Informações do filme
            </h2>

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
                <span className="text-body-sm text-on-surface-variant">Filmes inativos ficam ocultos do público</span>
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
              {loading ? 'hourglass_top' : poster ? 'cloud_upload' : 'save'}
            </span>
            {loading ? 'Salvando…' : poster ? 'Cadastrar e enviar poster' : 'Cadastrar filme'}
          </button>
          <Link
            href="/painel/dashboard"
            className="rounded-lg border border-outline-variant px-6 py-3.5 text-label-lg text-on-surface-variant transition hover:border-primary hover:text-primary"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
