import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/use-api-client';
import type { Expense, NewExpense } from '@/types/expense';

export function useExpenses(range?: { from: string; to: string }) {
  const api = useApiClient();
  const query = range ? `?from=${range.from}&to=${range.to}` : '';

  return useQuery({
    queryKey: ['expenses', range],
    queryFn: () => api.get<Expense[]>(`/expenses${query}`),
  });
}

export function useCreateExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expense: NewExpense) => api.post<Expense>('/expenses', expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
