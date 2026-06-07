import type { AuthUser } from './types';

export type OAuthProvider = 'GOOGLE' | 'FACEBOOK';

export async function oauthLoginApi(provider: OAuthProvider, token: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, token }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? 'Falha no login social');
  }
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    login: data.login,
    nome: data.nome,
    role: data.role,
  };
}

export async function recuperarSenhaApi(login: string): Promise<string> {
  const res = await fetch('/api/auth/recuperar-senha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? 'Não foi possível enviar o e-mail.');
  }
  return data.message as string;
}

export async function validarTokenRecuperacaoApi(token: string): Promise<{ valido: boolean; login?: string }> {
  const { getApiBaseUrl } = await import('@/lib/api/config');
  const res = await fetch(
    `${getApiBaseUrl()}/auth/redefinir-senha/validar?token=${encodeURIComponent(token)}`,
    { headers: { Accept: 'application/json' }, cache: 'no-store' },
  );
  if (!res.ok) return { valido: false };
  return res.json();
}

export async function redefinirSenhaApi(token: string, senhaNova: string): Promise<string> {
  const res = await fetch('/api/auth/redefinir-senha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, senhaNova }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? 'Não foi possível redefinir a senha.');
  }
  return data.message as string;
}
