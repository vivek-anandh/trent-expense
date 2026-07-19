import type { AuthProviderProps } from 'react-oidc-context';

// Copy authority/client_id from trent-web's OIDC app registration.
// The redirect_uri below must be registered as an additional allowed
// redirect URI on that same registration — it will not work otherwise.
export const oidcConfig: AuthProviderProps = {
  authority: process.env.NEXT_PUBLIC_OIDC_AUTHORITY ?? '',
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? '',
  redirect_uri: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI ?? '',
  scope: process.env.NEXT_PUBLIC_OIDC_SCOPE ?? 'openid profile email',
  onSigninCallback: () => {
    // Strip the auth response params from the URL after login.
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};
