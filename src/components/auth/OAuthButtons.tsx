'use client';

import { useState } from 'react';
import type { OAuthProvider } from '@/lib/auth/password-recovery';
import { FacebookLoginButton } from './FacebookLoginButton';
import { GoogleLoginButton } from './GoogleLoginButton';

type OAuthButtonsProps = {
  disabled?: boolean;
  onOAuth: (provider: OAuthProvider, token: string) => Promise<void>;
};

export function OAuthButtons({ disabled, onOAuth }: OAuthButtonsProps) {
  const [erro, setErro] = useState<string | null>(null);

  async function handleSuccess(provider: OAuthProvider, token: string) {
    setErro(null);
    try {
      await onOAuth(provider, token);
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro no login social.');
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-outline-variant" />
        </div>
        <p className="relative mx-auto w-fit bg-surface-container px-3 text-label-sm text-on-surface-variant">
          ou entre com
        </p>
      </div>

      <div className="flex flex-col items-stretch gap-3">
        <GoogleLoginButton
          disabled={disabled}
          onSuccess={(token) => handleSuccess('GOOGLE', token)}
          onError={setErro}
        />
        <FacebookLoginButton
          disabled={disabled}
          onSuccess={(token) => handleSuccess('FACEBOOK', token)}
          onError={setErro}
        />
      </div>

      {erro && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-body-sm text-primary">
          {erro}
        </p>
      )}
    </div>
  );
}
