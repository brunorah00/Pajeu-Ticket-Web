'use client';

import { useState } from 'react';
import type { AuthArea } from '@/lib/auth/protected-areas';
import { AUTH_AREA_COPY } from '@/lib/auth/protected-areas';
import { useAuth } from './AuthContext';

type Tab = 'login' | 'cadastro';

type AuthModalProps = {
  area?: AuthArea;
  onClose?: () => void;
};

export function AuthModal({ area = 'ingressos', onClose }: AuthModalProps) {
  const copy = AUTH_AREA_COPY[area];
  const { login, cadastro } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ login: '', senha: '' });
  const [cadastroForm, setCadastroForm] = useState({
    nome: '',
    login: '',
    senha: '',
    confirmar: '',
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    try {
      await login({
        login: loginForm.login.trim().toLowerCase(),
        senha: loginForm.senha,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (cadastroForm.senha !== cadastroForm.confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (cadastroForm.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await cadastro({
        nome: cadastroForm.nome.trim(),
        login: cadastroForm.login.trim().toLowerCase(),
        senha: cadastroForm.senha,
      });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
        role="presentation"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant bg-surface-container shadow-2xl">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-lg p-1 text-on-surface-variant transition hover:bg-surface hover:text-on-surface"
            aria-label="Fechar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
        <div className="border-b border-outline-variant bg-surface px-6 py-5 text-center">
          <p className="text-label-lg font-label-lg text-primary">Cine São José</p>
          <h2 id="auth-modal-title" className="mt-1 font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            {copy.title}
          </h2>
          <p className="mt-2 text-body-sm text-on-surface-variant">{copy.subtitle}</p>
        </div>

        {area !== 'painel' && (
          <div className="flex border-b border-outline-variant">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErro(null);
              }}
              className={`flex-1 py-3 text-label-lg font-label-lg transition-colors ${
                tab === 'login'
                  ? 'border-b-2 border-primary-container text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('cadastro');
                setErro(null);
              }}
              className={`flex-1 py-3 text-label-lg font-label-lg transition-colors ${
                tab === 'cadastro'
                  ? 'border-b-2 border-primary-container text-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Criar conta
            </button>
          </div>
        )}

        <div className="p-6">
          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant">Login</span>
                <input
                  required
                  autoComplete="username"
                  value={loginForm.login}
                  onChange={(e) => setLoginForm((f) => ({ ...f, login: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
                  placeholder="seu.login"
                />
              </label>
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant">Senha</span>
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={loginForm.senha}
                  onChange={(e) => setLoginForm((f) => ({ ...f, senha: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
                  placeholder="••••••••"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary-container py-3.5 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">login</span>
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCadastro} className="flex flex-col gap-4">
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant">Nome completo</span>
                <input
                  required
                  value={cadastroForm.nome}
                  onChange={(e) => setCadastroForm((f) => ({ ...f, nome: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
                  placeholder="Seu nome"
                />
              </label>
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant">Login</span>
                <input
                  required
                  autoComplete="username"
                  value={cadastroForm.login}
                  onChange={(e) => setCadastroForm((f) => ({ ...f, login: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
                  placeholder="escolha um login"
                />
              </label>
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant">Senha</span>
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={cadastroForm.senha}
                  onChange={(e) => setCadastroForm((f) => ({ ...f, senha: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
                />
              </label>
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant">Confirmar senha</span>
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={cadastroForm.confirmar}
                  onChange={(e) => setCadastroForm((f) => ({ ...f, confirmar: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary-container py-3.5 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">person_add</span>
                {loading ? 'Cadastrando…' : 'Criar conta e entrar'}
              </button>
            </form>
          )}

          {erro && (
            <p className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-body-sm text-primary">
              {erro}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
