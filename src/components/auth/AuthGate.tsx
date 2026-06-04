'use client';

import { useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { useAuth } from './AuthContext';

export function AuthGate({ children }: { children: React.ReactNode }) {
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

      {!isAuthenticated && <AuthModal />}
    </>
  );
}
