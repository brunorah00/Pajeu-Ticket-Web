'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { ApiRequestError } from '@/lib/api/http';
import { getApiErrorMessage } from '@/lib/api/error-message';
import {
  cadastrarFuncionario,
  excluirFuncionario,
  listarFuncionarios,
  redefinirSenhaFuncionario,
} from '@/lib/api/funcionarios';
import type { Funcionario } from '@/lib/api/types';
import { useCallback, useEffect, useState } from 'react';

export default function FuncionariosPage() {
  const { user } = useAuth();
  const [lista, setLista] = useState<Funcionario[]>([]);
  const [nome, setNome] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const carregar = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    setError(null);
    try {
      setLista(await listarFuncionarios(user.token));
    } catch (err) {
      setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao listar funcionários.');
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.token) return;

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem.');
      setSuccess(null);
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const loginNorm = login.trim().toLowerCase();
      await cadastrarFuncionario(user.token, {
        nome: nome.trim(),
        login: loginNorm,
        senha,
      });
      setNome('');
      setLogin('');
      setSenha('');
      setConfirmarSenha('');
      setSuccess(
        `Funcionário cadastrado. Login: ${loginNorm} — use exatamente esse login e a senha definida ao entrar.`,
      );
      await carregar();
    } catch (err) {
      setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao cadastrar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleExcluir(id: number) {
    if (!user?.token || !confirm('Excluir este funcionário?')) return;
    setError(null);
    setSuccess(null);
    try {
      await excluirFuncionario(user.token, id);
      await carregar();
    } catch (err) {
      setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao excluir.');
    }
  }

  async function handleRedefinirSenha(f: Funcionario) {
    if (!user?.token) return;
    const novaSenha = prompt(`Nova senha para ${f.login}:`);
    if (!novaSenha) return;
    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await redefinirSenhaFuncionario(user.token, f.id, novaSenha);
      setSuccess(`Senha de ${f.login} atualizada. Informe o funcionário para entrar com a nova senha.`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? getApiErrorMessage(err) : 'Erro ao redefinir senha.');
    }
  }

  const inputClass =
    'w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-body-md text-on-surface outline-none focus:border-primary';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">Funcionários</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Se o funcionário já criou conta no site (cliente), use o mesmo login aqui para promover o acesso ao
          painel.
        </p>
      </div>

      <form
        onSubmit={handleCadastro}
        className="w-full space-y-4 rounded-xl border border-outline-variant p-6 lg:max-w-xl xl:max-w-2xl"
      >
        <h2 className="text-title-md font-title-md text-on-surface">Novo funcionário</h2>
        <label className="block">
          <span className="text-label-sm text-on-surface-variant">Nome</span>
          <input className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} required />
        </label>
        <label className="block">
          <span className="text-label-sm text-on-surface-variant">Login</span>
          <input
            className={inputClass}
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            autoComplete="off"
            placeholder="ex.: joao.silva ou email@empresa.com"
          />
        </label>
        <label className="block">
          <span className="text-label-sm text-on-surface-variant">Senha</span>
          <input
            type="password"
            className={inputClass}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <label className="block">
          <span className="text-label-sm text-on-surface-variant">Confirmar senha</span>
          <input
            type="password"
            className={inputClass}
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-6 py-3 text-label-lg font-label-lg text-on-primary disabled:opacity-60"
        >
          {saving ? 'Salvando…' : 'Adicionar funcionário'}
        </button>
      </form>

      {success && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-body-sm text-primary">
          {success}
        </p>
      )}
      {error && (
        <p className="rounded-lg bg-error-container/30 px-4 py-3 text-body-sm text-error">{error}</p>
      )}

      <section>
        <h2 className="text-title-md font-title-md text-on-surface">Cadastrados</h2>
        {loading ? (
          <p className="mt-3 text-on-surface-variant">Carregando…</p>
        ) : lista.length === 0 ? (
          <p className="mt-3 text-on-surface-variant">Nenhum funcionário cadastrado.</p>
        ) : (
          <ul className="mt-3 divide-y divide-outline-variant rounded-xl border border-outline-variant">
            {lista.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-title-md text-title-md text-on-surface">{f.nome}</p>
                  <p className="text-body-sm text-on-surface-variant">Login: {f.login}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRedefinirSenha(f)}
                    className="rounded-lg border border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant hover:border-primary hover:text-primary"
                  >
                    Redefinir senha
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExcluir(f.id)}
                    className="rounded-lg border border-error/50 px-3 py-2 text-label-sm text-error hover:bg-error-container/20"
                  >
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
