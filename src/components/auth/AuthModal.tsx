'use client';

import { useState } from 'react';
import type { AuthArea } from '@/lib/auth/protected-areas';
import { AUTH_AREA_COPY } from '@/lib/auth/protected-areas';
import { recuperarSenhaApi } from '@/lib/auth/password-recovery';
import { getEmailValidationError } from '@/lib/utils/email';
import { OAuthButtons } from './OAuthButtons';
import { useAuth } from './AuthContext';

type Tab = 'login' | 'cadastro' | 'recuperar';

type AuthModalProps = {
  area?: AuthArea;
  onClose?: () => void;
};

export function AuthModal({ area = 'ingressos', onClose }: AuthModalProps) {
  const copy = AUTH_AREA_COPY[area];
  const { login, loginOAuth, cadastro } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [loginForm, setLoginForm] = useState({ login: '', senha: '' });
  const [recuperarEmail, setRecuperarEmail] = useState('');
  const [cadastroForm, setCadastroForm] = useState({
    nome: '',
    login: '',
    senha: '',
    confirmar: '',
  });

  function switchTab(next: Tab) {
    setTab(next);
    setErro(null);
    setInfo(null);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setInfo(null);
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

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setInfo(null);

    const emailErr = getEmailValidationError(recuperarEmail);
    if (emailErr) {
      setErro(emailErr);
      return;
    }

    setLoading(true);
    try {
      const msg = await recuperarSenhaApi(recuperarEmail.trim().toLowerCase());
      setInfo(msg);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao solicitar recuperação');
    } finally {
      setLoading(false);
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setInfo(null);

    if (cadastroForm.senha !== cadastroForm.confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (cadastroForm.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const emailErr = getEmailValidationError(cadastroForm.login);
    if (emailErr) {
      setErro(emailErr);
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

      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container shadow-2xl">
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
            {tab === 'recuperar' ? 'Recuperar senha' : copy.title}
          </h2>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            {tab === 'recuperar'
              ? 'Informe o e-mail cadastrado para receber o link de redefinição.'
              : copy.subtitle}
          </p>
        </div>

        {area !== 'painel' && tab !== 'recuperar' && (
          <div className="flex border-b border-outline-variant">
            <button
              type="button"
              onClick={() => switchTab('login')}
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
              onClick={() => switchTab('cadastro')}
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
          {tab === 'login' && (
            <>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant">
                  {area === 'painel' ? 'Login' : 'E-mail'}
                </span>
                  <input
                    required
                    type={area === 'painel' ? 'text' : 'email'}
                    autoComplete="username"
                    value={loginForm.login}
                    onChange={(e) => setLoginForm((f) => ({ ...f, login: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
                    placeholder={area === 'painel' ? 'seu.login ou e-mail' : 'seu@email.com'}
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
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchTab('recuperar')}
                    className="text-label-sm text-primary underline-offset-2 hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary-container py-3.5 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">login</span>
                  {loading ? 'Entrando…' : 'Entrar'}
                </button>
              </form>

              <div className="mt-5">
                <OAuthButtons
                  disabled={loading}
                  onOAuth={async (provider, token) => {
                    setLoading(true);
                    setErro(null);
                    try {
                      await loginOAuth(provider, token);
                    } catch (err) {
                      setErro(err instanceof Error ? err.message : 'Erro no login social');
                      throw err;
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </div>
            </>
          )}

          {tab === 'recuperar' && (
            <form onSubmit={handleRecuperar} className="flex flex-col gap-4">
              <label className="block">
                <span className="text-label-sm font-label-sm text-on-surface-variant">E-mail cadastrado</span>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={recuperarEmail}
                  onChange={(e) => setRecuperarEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
                  placeholder="seu@email.com"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-primary-container py-3.5 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Enviando…' : 'Enviar link de recuperação'}
              </button>
              <button
                type="button"
                onClick={() => switchTab('login')}
                className="text-label-sm text-on-surface-variant hover:text-primary"
              >
                Voltar ao login
              </button>
            </form>
          )}

          {tab === 'cadastro' && (
            <>
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
                  <span className="text-label-sm font-label-sm text-on-surface-variant">E-mail</span>
                  <input
                    required
                    type="email"
                    autoComplete="username"
                    value={cadastroForm.login}
                    onChange={(e) => setCadastroForm((f) => ({ ...f, login: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
                    placeholder="seu@email.com"
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
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary-container py-3.5 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">person_add</span>
                  {loading ? 'Cadastrando…' : 'Criar conta e entrar'}
                </button>
              </form>

              <div className="mt-5">
                <OAuthButtons
                  disabled={loading}
                  onOAuth={async (provider, token) => {
                    setLoading(true);
                    setErro(null);
                    try {
                      await loginOAuth(provider, token);
                    } catch (err) {
                      setErro(err instanceof Error ? err.message : 'Erro no login social');
                      throw err;
                    } finally {
                      setLoading(false);
                    }
                  }}
                />
              </div>
            </>
          )}

          {info && (
            <p className="mt-4 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-body-sm text-on-surface">
              {info}
            </p>
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
