'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/components/auth/AuthContext';

const drawerNav = [
  { href: '/painel/dashboard', label: 'Painel', icon: 'dashboard', staffOnly: true },
  { href: '#', label: 'Club Cine São José', icon: 'star' },
  { href: '/programacao', label: 'Programação', icon: 'movie' },
  { href: '/bomboniere', label: 'Bomboniere', icon: 'fastfood' },
  { href: '/ingressos/comprar', label: 'Comprar Ingresso', icon: 'confirmation_number' },
  { href: '#', label: 'Trabalhe Conosco', icon: 'work' },
];

export function Header() {
  const pathname = usePathname();
  const { user, ready, isAuthenticated, logout, hasRole } = useAuth();
  const isStaff = hasRole('ADMIN', 'FUNCIONARIO');
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open);
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  useEffect(() => {
    if (isAuthenticated) setLoginOpen(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (loginOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [loginOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-outline-variant bg-surface px-margin-mobile py-4 shadow-md">
        <Link
          href="/"
          className="col-start-2 text-center font-headline-lg-mobile text-headline-lg-mobile font-bold uppercase leading-tight tracking-wide text-on-surface sm:font-headline-lg sm:text-headline-lg md:text-[2.25rem]"
        >
          CINE SÃO JOSÉ
        </Link>
        <div className="col-start-3 flex items-center justify-end gap-1 sm:gap-2">
          {ready &&
            (isAuthenticated && user ? (
              <div className="flex max-w-[9rem] items-center gap-1 sm:max-w-[12rem] sm:gap-2">
                <span
                  className="truncate text-label-sm font-label-sm text-on-surface sm:max-w-[10rem] sm:text-label-lg sm:font-label-lg md:max-w-[14rem]"
                  title={user.nome}
                >
                  {user.nome}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg p-1.5 text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
                  aria-label="Sair da conta"
                  title="Sair"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setLoginOpen(true)}
                className="rounded-lg px-2 py-1.5 text-label-sm font-label-sm text-primary transition hover:bg-primary/10 sm:px-3 sm:text-label-lg sm:font-label-lg"
              >
                Entrar
              </button>
            ))}
          <button
            type="button"
            className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary active:opacity-80"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {loginOpen && !isAuthenticated && (
        <AuthModal area="site" onClose={() => setLoginOpen(false)} />
      )}

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
