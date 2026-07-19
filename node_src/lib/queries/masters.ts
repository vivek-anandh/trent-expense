import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/use-api-client';
import type { Master, NewMaster } from '@/types/expense';

export function useMasters() {
  const api = useApiClient();
  return useQuery({
    queryKey: ['masters'],
    queryFn: () => api.get<Master[]>('/expense'),
  });
}

export function useCreateMaster() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (master: NewMaster) => api.post<Master>('/expense', master),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['masters'] }),
  });
}

export function useDeleteMaster() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (master: Master) =>
      api.post<void>('/expense', { ...master, action: 'remove' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['masters'] }),
  });
}
