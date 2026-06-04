'use client';

import { useAuth } from '@/components/auth/AuthContext';
import { AuthGate } from '@/components/auth/AuthGate';
import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isPainel = pathname.startsWith('/painel');

  return (
    <AuthGate>
      {isAuthenticated && !isPainel && <Header />}
      {children}
    </AuthGate>
  );
}
