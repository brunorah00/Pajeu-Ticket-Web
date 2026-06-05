'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import type { AuthArea } from '@/lib/auth/protected-areas';
import { AuthModal } from './AuthModal';
import { useAuth } from './AuthContext';

type AuthGateProps = {
  children: React.ReactNode;
  area: AuthArea;
  backHref?: string;
};

export function AuthGate({ children, area, backHref = '/' }: AuthGateProps) {
  const { ready, isAuthenticated } = useAuth();

  useEffect(() => {
    document.body.style.overflow = isAuthenticated ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAuthenticated]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-pulse text-4xl text-primary">movie</span>
      </div>
    );
  }

  return (
    <>
      <div
        className={
          isAuthenticated
            ? 'min-h-dvh'
            : 'pointer-events-none min-h-dvh select-none blur-md brightness-[0.35]'
        }
        aria-hidden={!isAuthenticated}
      >
        {children}
      </div>

      {!isAuthenticated && (
        <>
          <AuthModal area={area} />
          <div className="fixed bottom-6 left-0 right-0 z-[101] flex justify-center px-4">
            <Link
              href={backHref}
              className="rounded-full border border-outline-variant bg-surface-container px-6 py-3 text-label-lg font-label-lg text-on-surface shadow-lg transition hover:border-primary hover:text-primary"
            >
              Voltar ao site sem entrar
            </Link>
          </div>
        </>
      )}
    </>
  );
}
