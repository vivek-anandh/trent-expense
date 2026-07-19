import { useMemo } from 'react';
import { useAuth } from 'react-oidc-context';
import { createApiClient } from '@/lib/api-client';

export function useApiClient() {
  const auth = useAuth();
  return useMemo(
    () => createApiClient(auth.user?.access_token),
    [auth.user?.access_token],
  );
}
