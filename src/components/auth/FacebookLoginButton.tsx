'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';

type FacebookLoginButtonProps = {
  disabled?: boolean;
  onSuccess: (accessToken: string) => void;
  onError: (message: string) => void;
};

declare global {
  interface Window {
    FB?: {
      init: (opts: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (
        callback: (response: { authResponse?: { accessToken?: string }; status?: string }) => void,
        options: { scope: string },
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export function FacebookLoginButton({ disabled, onSuccess, onError }: FacebookLoginButtonProps) {
  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ?? '';
  const [ready, setReady] = useState(false);

  const initFacebook = useCallback(() => {
    if (!appId || !window.FB) return;
    window.FB.init({ appId, cookie: true, xfbml: false, version: 'v19.0' });
    setReady(true);
  }, [appId]);

  useEffect(() => {
    window.fbAsyncInit = initFacebook;
    initFacebook();
  }, [initFacebook]);

  const handleClick = useCallback(() => {
    if (!appId) {
      onError('Login com Facebook não configurado. Defina NEXT_PUBLIC_FACEBOOK_APP_ID no .env.local.');
      return;
    }
    if (!window.FB || !ready) {
      onError('Aguarde o carregamento do Facebook e tente novamente.');
      return;
    }

    window.FB.login(
      (response) => {
        const token = response.authResponse?.accessToken;
        if (token) {
          onSuccess(token);
          return;
        }
        if (response.status === 'unknown') {
          onError('Login com Facebook cancelado.');
          return;
        }
        onError('Não foi possível entrar com Facebook.');
      },
      { scope: 'email,public_profile' },
    );
  }, [appId, onError, onSuccess, ready]);

  return (
    <>
      <Script
        src="https://connect.facebook.net/pt_BR/sdk.js"
        strategy="afterInteractive"
        onLoad={initFacebook}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-4 py-3 text-label-lg font-label-lg text-white transition hover:opacity-90 disabled:opacity-50"
      >
        <FacebookIcon />
        Continuar com Facebook
      </button>
    </>
  );
}

function FacebookIcon() {
  return (
    <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.845c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}
