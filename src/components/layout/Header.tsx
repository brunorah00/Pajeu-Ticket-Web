'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/components/auth/AuthContext';
import { NotificacaoSino } from '@/components/notificacoes/NotificacaoSino';

type DrawerNavItem = {
  href: string;
  label: string;
  icon: string;
  staffOnly?: boolean;
  authOnly?: boolean;
  comingSoonMessage?: string;
};

const drawerNav: DrawerNavItem[] = [
  { href: '/painel/dashboard', label: 'Painel', icon: 'dashboard', staffOnly: true },
  { href: '/meus-pedidos', label: 'Meus pedidos', icon: 'receipt_long', authOnly: true },
  {
    href: '#',
    label: 'Club Cine São José',
    icon: 'star',
    comingSoonMessage:
      'Em breve teremos a inclusão de um clube para membros do Cine São José, com benefícios exclusivos para quem faz parte.',
  },
  { href: '/programacao', label: 'Programação', icon: 'movie' },
  { href: '/novidades', label: 'Novidades', icon: 'new_releases' },
  { href: '/bomboniere', label: 'Bomboniere', icon: 'fastfood' },
];

export function Header() {
  const pathname = usePathname();
  const { user, ready, isAuthenticated, logout, hasRole } = useAuth();
  const isStaff = hasRole('ADMIN', 'FUNCIONARIO');
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', open);
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  useEffect(() => {
    if (isAuthenticated) setLoginOpen(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (loginOpen || comingSoon) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [loginOpen, comingSoon]);

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
                <NotificacaoSino />
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

      {comingSoon && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Fechar"
            onClick={() => setComingSoon(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coming-soon-title"
            className="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/20 text-primary">
                <span className="material-symbols-outlined text-2xl">star</span>
              </div>
              <button
                type="button"
                onClick={() => setComingSoon(null)}
                className="rounded-lg p-1 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                aria-label="Fechar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <h2 id="coming-soon-title" className="mt-4 font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              {comingSoon.title}
            </h2>
            <p className="mt-3 text-body-md text-on-surface-variant">{comingSoon.message}</p>
            <button
              type="button"
              onClick={() => setComingSoon(null)}
              className="mt-6 w-full rounded-lg bg-primary-container py-3 text-label-lg font-label-lg text-white transition hover:opacity-90"
            >
              Entendi
            </button>
          </div>
        </div>
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
            .filter(
              (item) =>
                (!item.staffOnly || isStaff) &&
                (!item.authOnly || isAuthenticated),
            )
            .map((item) => {
              const active = pathname === item.href;
              const className = `flex w-full items-center gap-4 rounded-lg p-3 text-title-md font-title-md transition-colors ${
                active
                  ? 'bg-primary-container text-on-primary-container'
                  : 'text-on-surface-variant hover:bg-secondary-container'
              }`;

              if (item.comingSoonMessage) {
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setComingSoon({ title: item.label, message: item.comingSoonMessage! });
                      }}
                      className={className}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      {item.label}
                    </button>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <Link href={item.href} onClick={() => setOpen(false)} className={className}>
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
