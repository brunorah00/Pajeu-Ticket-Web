'use client';

import { RoleGuard } from '@/components/auth/RoleGuard';
import { PainelNav } from '@/components/painel/PainelNav';
import { painelShellClass } from '@/lib/painel/layout';

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow={['ADMIN', 'FUNCIONARIO']}>
      <PainelNav />
      <main className={`${painelShellClass} py-8`}>{children}</main>
    </RoleGuard>
  );
}
