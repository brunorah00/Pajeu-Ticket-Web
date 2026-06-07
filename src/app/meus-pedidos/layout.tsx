'use client';

import { AuthGate } from '@/components/auth/AuthGate';

export default function MeusPedidosLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate area="site">{children}</AuthGate>;
}
