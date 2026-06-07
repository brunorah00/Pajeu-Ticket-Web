'use client';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function isGoogleOAuthEnabled() {
  return Boolean(googleClientId);
}

export function isFacebookOAuthEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_FACEBOOK_APP_ID);
}

export function getGoogleClientId() {
  return googleClientId;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
  }
}
