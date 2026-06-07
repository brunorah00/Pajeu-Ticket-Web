'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser, CadastroPayload, LoginPayload, UserRole } from '@/lib/auth/types';
import { oauthLoginApi, type OAuthProvider } from '@/lib/auth/password-recovery';
import { clearStoredAuth, getStoredAuth, setStoredAuth } from '@/lib/auth/storage';
import { AUTH_UPDATED_EVENT, isAccessTokenExpired } from '@/lib/auth/token';
import { refreshStoredSession } from '@/lib/api/refresh-session';

type AuthContextValue = {
  user: AuthUser | null;
  ready: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginOAuth: (provider: OAuthProvider, token: string) => Promise<void>;
  cadastro: (payload: CadastroPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: UserRole[]) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function loginApi(payload: LoginPayload): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? 'Falha no login');
  }
  return {
    token: data.token,
    refreshToken: data.refreshToken,
    login: data.login,
    nome: data.nome,
    role: data.role,
  };
}

async function cadastroAndLogin(payload: CadastroPayload): Promise<AuthUser> {
  const res = await fetch('/api/auth/cadastro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message ?? 'Falha no cadastro');
  }
  return loginApi({ login: payload.login, senha: payload.senha });
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = getStoredAuth();
      if (!stored) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }

      if (!isAccessTokenExpired(stored.token)) {
        if (!cancelled) {
          setUser(stored);
          setReady(true);
        }
        return;
      }

      const refreshed = await refreshStoredSession();
      if (!cancelled) {
        setUser(refreshed);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function syncFromStorage() {
      setUser(getStoredAuth());
    }
    window.addEventListener(AUTH_UPDATED_EVENT, syncFromStorage);
    return () => window.removeEventListener(AUTH_UPDATED_EVENT, syncFromStorage);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const auth = await loginApi(payload);
    setStoredAuth(auth);
    setUser(auth);
  }, []);

  const loginOAuth = useCallback(async (provider: OAuthProvider, token: string) => {
    const auth = await oauthLoginApi(provider, token);
    setStoredAuth(auth);
    setUser(auth);
  }, []);

  const cadastro = useCallback(async (payload: CadastroPayload) => {
    const auth = await cadastroAndLogin(payload);
    setStoredAuth(auth);
    setUser(auth);
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      loginOAuth,
      cadastro,
      logout,
      isAuthenticated: !!user,
      hasRole: (...roles) => (user ? roles.includes(user.role) : false),
    }),
    [user, ready, login, loginOAuth, cadastro, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
