import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/use-api-client';
import type { ExpenseBook, NewExpenseBook } from '@/types/expense';

export function useExpenseBooks(yearMonth: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: ['expense-books', yearMonth],
    queryFn: () =>
      api.get<ExpenseBook[]>(`/expense-book?year_month=${yearMonth}`),
    enabled: !!yearMonth,
  });
}

export function useExpenseBooksByDateRange(startDate: string, endDate: string) {
  const api = useApiClient();

  const yearMonths = getYearMonths(startDate, endDate);

  return useQuery({
    queryKey: ['expense-books-range', startDate, endDate],
    queryFn: async () => {
      const results = await Promise.all(
        yearMonths.map(({ yearMonth, startData, endData }) =>
          api.get<ExpenseBook[]>(
            `/expense-book?year_month=${yearMonth}&start_data=${startData}&end_date=${endData}`,
          ),
        ),
      );
      return results
        .flat()
        .sort((a, b) => b.uuid.localeCompare(a.uuid));
    },
    enabled: !!startDate && !!endDate,
  });
}

export function useCreateExpenseBook() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expense: NewExpenseBook) =>
      api.post<ExpenseBook>('/expense-book', expense),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['expense-books', variables.year_month],
      });
      queryClient.invalidateQueries({ queryKey: ['expense-books-range'] });
    },
  });
}

export function useUpdateExpenseBook() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expense: ExpenseBook) =>
      api.post<ExpenseBook>('/expense-book', expense),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['expense-books', variables.year_month],
      });
      queryClient.invalidateQueries({ queryKey: ['expense-books-range'] });
    },
  });
}

export function useDeleteExpenseBook() {
  const api = useApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expense: { year_month: string; uuid: string }) =>
      api.post<void>('/expense-book', { ...expense, action: 'remove' }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['expense-books', variables.year_month],
      });
      queryClient.invalidateQueries({ queryKey: ['expense-books-range'] });
    },
  });
}

// ── helpers ──────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}`;
}

function getYearMonths(startDate: string, endDate: string) {
  const [sy = 0, sm = 1, sd = 1] = startDate.split('_').map(Number);
  const [ey = 0, em = 1, ed = 1] = endDate.split('_').map(Number);

  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);

  const result: { yearMonth: string; startData: string; endData: string }[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cur <= endMonth) {
    const ym = `${cur.getFullYear()}_${pad(cur.getMonth() + 1)}`;

    const monthStart = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const monthEnd = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);

    const sd2 = start > monthStart ? start : monthStart;
    const ed2 = end < monthEnd ? end : monthEnd;

    result.push({
      yearMonth: ym,
      startData: toYmd(sd2),
      endData: `${toYmd(ed2)}_z`,
    });

    cur.setMonth(cur.getMonth() + 1);
  }

  return result;
}
