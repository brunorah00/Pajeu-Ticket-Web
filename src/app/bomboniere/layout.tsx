'use client';

import { AuthGate } from '@/components/auth/AuthGate';

export default function BomboniereLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate area="bomboniere">{children}</AuthGate>;
}
