export type AuthArea = 'ingressos' | 'bomboniere' | 'painel' | 'site';

export const AUTH_AREA_COPY: Record<
  AuthArea,
  { title: string; subtitle: string }
> = {
  site: {
    title: 'Acesse sua conta',
    subtitle: 'Entre ou crie uma conta no Cine São José.',
  },
  ingressos: {
    title: 'Acesse sua conta',
    subtitle: 'Entre ou crie uma conta para comprar ingressos.',
  },
  bomboniere: {
    title: 'Acesse sua conta',
    subtitle: 'Entre ou crie uma conta para pedir na bomboniere.',
  },
  painel: {
    title: 'Acesso ao painel',
    subtitle: 'Entre com sua conta de funcionário ou administrador.',
  },
};
