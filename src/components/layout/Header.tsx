'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

const drawerNav = [
  { href: '/painel/dashboard', label: 'Painel', icon: 'dashboard', staffOnly: true },
  { href: '#', label: 'Club Cine São José', icon: 'star' },
  { href: '/programacao', label: 'Programação', icon: 'movie' },
  { href: '#', label: 'Bomboniere', icon: 'fastfood' },
  { href: '/ingressos/comprar', label: 'Comprar Ingresso', icon: 'confirmation_number' },
  { href: '#', label: 'Trabalhe Conosco', icon: 'work' },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const isStaff = hasRole('ADMIN', 'FUNCIONARIO');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open);
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-outline-variant bg-surface px-margin-mobile py-4 shadow-md">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined">location_on</span>
          <span className="text-label-sm font-label-sm">Serra Talhada - PE</span>
        </div>
        <Link
          href="/"
          className="max-w-[9.5rem] text-center text-sm font-bold leading-tight text-on-surface sm:max-w-none sm:text-headline-lg-mobile sm:font-headline-lg-mobile"
        >
          Cine São José
        </Link>
        <button
          type="button"
          className="text-on-surface-variant transition-colors hover:text-primary active:opacity-80"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      <div
        className={`fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      <nav
        className={`fixed right-0 top-0 z-[60] flex h-full w-64 flex-col rounded-l-xl bg-surface-container p-6 shadow-lg transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="text-title-md font-title-md text-primary">Menu</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {user && (
          <div className="mb-6 rounded-lg bg-surface p-3">
            <p className="text-body-sm text-on-surface-variant">Olá,</p>
            <p className="font-title-md text-title-md text-on-surface">{user.nome}</p>
            <button
              type="button"
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant py-2 text-label-sm font-label-sm text-on-surface-variant transition hover:border-primary hover:text-primary"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              Sair
            </button>
          </div>
        )}
        <ul className="flex flex-col gap-2">
          {drawerNav
            .filter((item) => !('staffOnly' in item && item.staffOnly) || isStaff)
            .map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 rounded-lg p-3 text-title-md font-title-md transition-colors ${
                    active
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-on-surface-variant hover:bg-secondary-container'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
