'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPainel = pathname.startsWith('/painel');

  return (
    <>
      {!isPainel && <Header />}
      {children}
    </>
  );
}
