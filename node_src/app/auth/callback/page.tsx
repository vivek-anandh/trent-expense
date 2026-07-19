'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

// react-oidc-context's <AuthProvider> (mounted in app/layout.tsx) processes the
// code/state query params automatically on mount. This page just waits for that
// to finish, then sends the user on to the dashboard.
export default function AuthCallbackPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated) {
      router.replace('/capture');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  return (
    <div className="flex h-[60vh] items-center justify-center text-sm text-ink-faint">
      Signing you in…
    </div>
  );
}
