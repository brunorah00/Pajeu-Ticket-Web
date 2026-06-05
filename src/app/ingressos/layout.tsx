'use client';

import { AuthGate } from '@/components/auth/AuthGate';

export default function IngressosLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate area="ingressos">{children}</AuthGate>;
}
