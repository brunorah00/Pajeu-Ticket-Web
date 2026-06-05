'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { painelShellClass } from '@/lib/painel/layout';
import type { UserRole } from '@/lib/auth/types';

const links = [
  { href: '/painel/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN', 'FUNCIONARIO'] as const },
  { href: '/painel/filmes/novo', label: 'Filmes', icon: 'movie', roles: ['ADMIN', 'FUNCIONARIO'] as const },
  {
    href: '/painel/sessoes',
    label: 'Sessões',
    icon: 'schedule',
    roles: ['ADMIN', 'FUNCIONARIO'] as const,
  },
  { href: '/painel/bomboniere', label: 'Bomboniere', icon: 'fastfood', roles: ['ADMIN', 'FUNCIONARIO'] as const },
  { href: '/painel/pedidos', label: 'Pedidos', icon: 'receipt_long', roles: ['ADMIN', 'FUNCIONARIO'] as const },
  {
    href: '/painel/funcionarios',
    label: 'Funcionários',
    icon: 'group',
    roles: ['ADMIN'] as const,
  },
];

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  FUNCIONARIO: 'Funcionário',
  CLIENTE: 'Cliente',
};

function userInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PainelNav() {
  const pathname = usePathname();
  const { user, hasRole } = useAuth();

  const visible = links.filter((l) => l.roles.some((r) => hasRole(r)));

  return (
    <nav className="border-b border-outline-variant bg-gradient-to-b from-surface-container to-surface-container-low">
      <div className={`${painelShellClass} py-4`}>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-2.5 text-label-lg font-label-lg text-on-surface-variant transition hover:border-primary/50 hover:bg-surface-container-high hover:text-primary"
          >
            <span className="material-symbols-outlined text-xl transition group-hover:-translate-x-0.5">
              arrow_back
            </span>
            Voltar
          </Link>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-container shadow-md shadow-primary-container/25">
              <span className="material-symbols-outlined text-2xl text-white">admin_panel_settings</span>
            </div>
            <div className="min-w-0">
              <p className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
                Painel
              </p>
              <p className="text-body-sm text-on-surface-variant">Gestão Cine São José</p>
            </div>
          </div>

          {user && (
            <div className="flex w-full min-w-0 items-center gap-3 rounded-xl border border-outline-variant/80 bg-surface/80 px-4 py-3 shadow-sm backdrop-blur-sm sm:ml-auto sm:w-auto">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-lg font-bold text-on-primary shadow-inner"
                aria-hidden
              >
                {userInitials(user.nome)}
              </div>
              <div className="min-w-0 flex-1 sm:flex-initial">
                <p className="truncate text-title-md font-title-md leading-tight text-on-surface">
                  {user.nome}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-0.5 text-label-sm font-label-sm text-primary">
                  <span className="material-symbols-outlined text-sm">
                    {user.role === 'ADMIN' ? 'shield_person' : 'badge'}
                  </span>
                  {roleLabels[user.role]}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${painelShellClass} flex gap-2 overflow-x-auto pb-4`}>
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-label-lg font-label-lg transition ${
                active
                  ? 'bg-primary-container text-white shadow-md shadow-primary-container/30'
                  : 'bg-surface text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
