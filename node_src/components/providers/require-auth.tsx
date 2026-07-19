'use client';

import { useAuth } from 'react-oidc-context';
import { useEffect, type ReactNode } from 'react';

export function RequireAuth({ children }: { children: ReactNode }) {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator) {
      auth.signinRedirect();
    }
  }, [auth]);

  if (auth.isLoading || !auth.isAuthenticated) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-sm text-ink-faint">
        Signing you in…
      </div>
    );
  }

  return <>{children}</>;
}
