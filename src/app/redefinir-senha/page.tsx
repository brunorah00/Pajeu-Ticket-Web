'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import {
  redefinirSenhaApi,
  validarTokenRecuperacaoApi,
} from '@/lib/auth/password-recovery';

function RedefinirSenhaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [validando, setValidando] = useState(true);
  const [valido, setValido] = useState(false);
  const [login, setLogin] = useState<string | null>(null);
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setValidando(false);
      setValido(false);
      return;
    }

    validarTokenRecuperacaoApi(token).then((result) => {
      setValido(result.valido);
      setLogin(result.login ?? null);
      setValidando(false);
    });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const msg = await redefinirSenhaApi(token, senha);
      setSucesso(msg);
      setTimeout(() => router.push('/'), 2500);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container p-6 shadow-xl sm:p-8">
      <p className="text-center text-label-lg font-label-lg text-primary">Cine São José</p>
      <h1 className="mt-2 text-center font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
        Redefinir senha
      </h1>

      {validando && (
        <p className="mt-6 text-center text-body-md text-on-surface-variant">Validando link…</p>
      )}

      {!validando && !valido && (
        <div className="mt-6 space-y-4 text-center">
          <p className="text-body-md text-on-surface-variant">
            Este link é inválido ou expirou. Solicite uma nova recuperação de senha.
          </p>
          <Link
            href="/"
            className="inline-block rounded-lg bg-primary-container px-6 py-3 text-label-lg font-label-lg text-white"
          >
            Voltar ao site
          </Link>
        </div>
      )}

      {!validando && valido && !sucesso && (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {login && (
            <p className="text-body-sm text-on-surface-variant">
              Conta: <span className="font-medium text-on-surface">{login}</span>
            </p>
          )}
          <label className="block">
            <span className="text-label-sm font-label-sm text-on-surface-variant">Nova senha</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
            />
          </label>
          <label className="block">
            <span className="text-label-sm font-label-sm text-on-surface-variant">Confirmar senha</span>
            <input
              required
              type="password"
              autoComplete="new-password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none focus:border-primary-container"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-primary-container py-3.5 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Salvando…' : 'Salvar nova senha'}
          </button>
        </form>
      )}

      {sucesso && (
        <div className="mt-6 space-y-3 text-center">
          <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-body-md text-on-surface">
            {sucesso}
          </p>
          <p className="text-body-sm text-on-surface-variant">Redirecionando…</p>
        </div>
      )}

      {erro && (
        <p className="mt-4 rounded-lg border border-error/30 bg-error-container/20 px-4 py-3 text-body-sm text-error">
          {erro}
        </p>
      )}
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-margin-mobile py-12">
      <Suspense fallback={<p className="text-on-surface-variant">Carregando…</p>}>
        <RedefinirSenhaForm />
      </Suspense>
    </div>
  );
}
