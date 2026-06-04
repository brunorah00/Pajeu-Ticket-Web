'use client';

import { useAuth } from '@/components/auth/AuthContext';
import type { UserRole } from '@/lib/auth/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

type RoleGuardProps = {
  children: React.ReactNode;
  allow: UserRole[];
  adminOnlyPaths?: string[];
};

export function RoleGuard({ children, allow, adminOnlyPaths = ['/painel/funcionarios'] }: RoleGuardProps) {
  const { user, ready, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated || !user) {
      router.replace('/');
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace('/');
      return;
    }
    if (user.role !== 'ADMIN' && adminOnlyPaths.some((p) => pathname.startsWith(p))) {
      router.replace('/painel/dashboard');
    }
  }, [ready, isAuthenticated, user, allow, adminOnlyPaths, pathname, router]);

  if (!ready || !user || !allow.includes(user.role)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-margin-mobile">
        <p className="text-body-md text-on-surface-variant">Carregando painel…</p>
      </div>
    );
  }

  if (user.role !== 'ADMIN' && adminOnlyPaths.some((p) => pathname.startsWith(p))) {
    return null;
  }

  return <>{children}</>;
}

export function PainelAccessDenied() {
  return (
    <div className="mx-auto max-w-md px-margin-mobile py-16 text-center">
      <p className="text-title-md text-on-surface">Acesso restrito</p>
      <p className="mt-2 text-body-md text-on-surface-variant">
        Esta área é exclusiva para funcionários e administradores.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-label-lg font-label-lg text-on-primary"
      >
        Voltar ao site
      </Link>
    </div>
  );
}
