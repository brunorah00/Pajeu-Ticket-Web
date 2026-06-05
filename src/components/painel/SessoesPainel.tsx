'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { ApiRequestError } from '@/lib/api/http';
import { getApiErrorMessage } from '@/lib/api/error-message';
import { listarTodosFilmesPainel } from '@/lib/api/painel-filmes';
import {
  atualizarSessao,
  cadastrarSessao,
  excluirSessao,
  listarTodasSessoesPainel,
} from '@/lib/api/painel-sessoes';
import type { Filme, Sessao } from '@/lib/api/types';
import { formatData, formatHorario, formatMoeda, formatSessaoExibicao } from '@/lib/utils/format';
import { sessaoEncerrada } from '@/lib/utils/sessao';

function horarioParaInput(horario: string): string {
  return horario.length >= 5 ? horario.slice(0, 5) : horario;
}

function horarioParaApi(horario: string): string {
  return horario.length === 5 ? `${horario}:00` : horario;
}

export function SessoesPainel() {
  const { user, ready, isAuthenticated } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [formAberto, setFormAberto] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [filmeId, setFilmeId] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [horario, setHorario] = useState('19:00');
  const [valorIngresso, setValorIngresso] = useState('20');
  const [lugares, setLugares] = useState('200');

  const carregar = useCallback(async () => {
    if (!ready) return;
    if (!isAuthenticated || !user?.token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErro(null);
    const erros: string[] = [];

    try {
      const todosFilmes = await listarTodosFilmesPainel(user.token);
      setFilmes(todosFilmes);
    } catch (err) {
      erros.push(
        err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Não foi possível carregar os filmes.',
      );
      setFilmes([]);
    }

    try {
      const todasSessoes = await listarTodasSessoesPainel(user.token);
      setSessoes(todasSessoes);
    } catch (err) {
      erros.push(
        err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Não foi possível carregar as sessões.',
      );
      setSessoes([]);
    }

    if (erros.length > 0) {
      setErro(erros.join(' '));
    }
    setLoading(false);
  }, [ready, isAuthenticated, user?.token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function limparFormulario() {
    setEditId(null);
    setFilmeId(filmes[0] ? String(filmes[0].id) : '');
    setData(new Date().toISOString().slice(0, 10));
    setHorario('19:00');
    setValorIngresso('20');
    setLugares('200');
    setErro(null);
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

  function iniciarEdicao(sessao: Sessao) {
    setEditId(sessao.id);
    setFilmeId(String(sessao.filme.id));
    setData(sessao.data);
    setHorario(horarioParaInput(sessao.horario));
    setValorIngresso(String(sessao.valorIngresso));
    setLugares(String(sessao.lugaresDisponiveis));
    setErro(null);
    setSuccess(null);
    setFormAberto(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.token || !filmeId) return;
    setSalvando(true);
    setErro(null);
    setSuccess(null);

    const payload = {
      filmeId: Number(filmeId),
      data,
      horario: horarioParaApi(horario),
      valorIngresso: Number(valorIngresso),
      lugaresDisponiveis: Number(lugares),
    };

    try {
      if (editId) {
        await atualizarSessao(user.token, editId, payload);
        setSuccess('Sessão atualizada.');
        fecharFormulario();
      } else {
        await cadastrarSessao(user.token, payload);
        setSuccess('Sessão cadastrada. Já aparece na programação pública.');
        fecharFormulario();
      }
      await carregar();
    } catch (err) {
      setErro(
        err instanceof ApiRequestError
          ? getApiErrorMessage(err)
          : editId
            ? 'Não foi possível atualizar a sessão.'
            : 'Não foi possível cadastrar a sessão.',
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(sessao: Sessao) {
    if (!user?.token) return;
    if (
      !confirm(
        `Excluir sessão de "${sessao.filme.titulo}" em ${formatSessaoExibicao(sessao.data, sessao.horario)}? Vendas de ingresso vinculadas também serão removidas.`,
      )
    ) {
      return;
    }
    setErro(null);
    try {
      await excluirSessao(user.token, sessao.id);
      if (editId === sessao.id) fecharFormulario();
      setSuccess('Sessão removida.');
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Não foi possível excluir.');
    }
  }

  const inputClass =
    'w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none focus:border-primary';

  const hoje = new Date().toISOString().slice(0, 10);
  const editando = editId !== null;

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Sessões / Programação</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Gerencie horários de exibição. A sala é única: não cadastre sessões que sobreponham a duração de outra no
            mesmo dia. Sessões encerram 10 minutos após o horário de início.
          </p>
        </div>
        {!formAberto && (
          <button
            type="button"
            onClick={abrirCadastro}
            disabled={filmes.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary-container px-5 py-3 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined">add</span>
            Cadastrar nova sessão
          </button>
        )}
      </div>

      {success && (
        <p className="mb-6 flex items-start gap-2 rounded-lg bg-secondary-container/30 px-4 py-3 text-body-sm text-on-surface">
          <span className="material-symbols-outlined shrink-0 text-secondary">check_circle</span>
          {success}
        </p>
      )}

      {erro && (
        <p className="mb-6 flex items-start gap-2 rounded-lg bg-error-container/30 px-4 py-3 text-body-sm text-error">
          <span className="material-symbols-outlined shrink-0">error</span>
          {erro}
        </p>
      )}

      {formAberto && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="mb-10 space-y-4 rounded-xl border border-outline-variant bg-surface-container/50 p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-title-md font-title-md text-on-surface">
              {editando ? 'Editar sessão' : 'Nova sessão'}
            </h2>
            <button
              type="button"
              onClick={fecharFormulario}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">close</span>
              Fechar
            </button>
          </div>

          <label className="block">
            <span className="text-label-sm text-on-surface-variant">Filme</span>
            <select
              className={inputClass}
              value={filmeId}
              onChange={(e) => setFilmeId(e.target.value)}
              required
            >
              <option value="">Selecione…</option>
              {filmes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.titulo}
                  {!f.status ? ' (inativo)' : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block">
              <span className="text-label-sm text-on-surface-variant">Data</span>
              <input
                type="date"
                className={inputClass}
                value={data}
                min={editando ? undefined : hoje}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-label-sm text-on-surface-variant">Horário</span>
              <input
                type="time"
                className={inputClass}
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-label-sm text-on-surface-variant">Ingresso (R$)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className={inputClass}
                value={valorIngresso}
                onChange={(e) => setValorIngresso(e.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="text-label-sm text-on-surface-variant">Lugares</span>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={lugares}
                onChange={(e) => setLugares(e.target.value)}
                required
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-outline-variant pt-6">
            <button
              type="submit"
              disabled={salvando || filmes.length === 0}
              className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 text-label-lg font-label-lg text-white disabled:opacity-50"
            >
              <span className="material-symbols-outlined">schedule</span>
              {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Adicionar à programação'}
            </button>
            <button
              type="button"
              onClick={fecharFormulario}
              className="rounded-lg border border-outline-variant px-6 py-3 text-label-lg text-on-surface-variant hover:border-primary hover:text-primary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {filmes.length === 0 && !loading && !erro && (
        <p className="mb-6 text-body-sm text-on-surface-variant">
          Nenhum filme cadastrado. Cadastre um filme em{' '}
          <Link href="/painel/filmes/novo" className="text-primary underline">
            Filmes
          </Link>{' '}
          antes de criar sessões.
        </p>
      )}

      <section className="border-t border-outline-variant pt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-title-md font-title-md text-on-surface">
              <span className="material-symbols-outlined text-primary">event</span>
              Sessões cadastradas
            </h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              {sessoes.length} sessão{sessoes.length === 1 ? '' : 'ões'} no sistema
            </p>
          </div>
          <button
            type="button"
            onClick={() => carregar()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-label-sm text-on-surface hover:border-primary disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">refresh</span>
            Atualizar
          </button>
        </div>

        {loading && sessoes.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">Carregando…</p>
        ) : sessoes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-outline-variant px-6 py-10 text-center text-body-md text-on-surface-variant">
            Nenhuma sessão cadastrada. Clique em &quot;Cadastrar nova sessão&quot; para começar.
          </p>
        ) : (
          <ul className="space-y-2">
            {sessoes.map((s) => (
              <li
                key={s.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-surface-elevated px-4 py-3 ${editId === s.id ? 'border-primary ring-2 ring-primary/30' : sessaoEncerrada(s) ? 'border-outline-variant/60 opacity-75' : 'border-outline-variant'}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body-md font-medium text-on-surface">{s.filme.titulo}</p>
                    {sessaoEncerrada(s) && (
                      <span className="rounded bg-on-surface/15 px-2 py-0.5 text-label-sm text-on-surface-variant">
                        Encerrada
                      </span>
                    )}
                  </div>
                  <p className="text-body-sm text-on-surface-variant">
                    {formatData(s.data)} · {formatHorario(s.horario)} · {formatMoeda(s.valorIngresso)} ·{' '}
                    {s.lugaresDisponiveis} lugares
                    {!s.filme.status && ' · filme inativo'}
                    {sessaoEncerrada(s) && ' · encerrada'}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => iniciarEdicao(s)}
                    className="flex items-center gap-1 rounded-lg border border-primary/40 px-3 py-1.5 text-label-sm text-primary hover:bg-primary/10"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExcluir(s)}
                    className="flex items-center gap-1 rounded-lg border border-error/40 px-3 py-1.5 text-label-sm text-error hover:bg-error-container/20"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
