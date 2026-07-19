'use client';

import { useState } from 'react';
import { RequireAuth } from '@/components/providers/require-auth';
import { useMasters } from '@/lib/queries/masters';
import {
  useExpenseBooksByDateRange,
  useUpdateExpenseBook,
  useDeleteExpenseBook,
} from '@/lib/queries/expenses';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ExpenseBook } from '@/types/expense';

const PAGE_SIZE = 10;

type RangeKey = '1w' | '2w' | '1m';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}`;
}

function dateForRange(key: RangeKey): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  if (key === '1w') start.setDate(start.getDate() - 7);
  else if (key === '2w') start.setDate(start.getDate() - 14);
  else start.setMonth(start.getMonth() - 1);
  return { start: toYmd(start), end: toYmd(end) };
}

function displayDate(uuid: string): string {
  return uuid.slice(0, 10).replace(/_/g, '-');
}

const editSchema = z.object({
  cat: z.string().min(1, 'Category is required'),
  amt: z.coerce.number().positive('Amount must be positive'),
  rem: z.string().max(15, 'Max 15 characters').optional(),
});

type EditValues = z.infer<typeof editSchema>;

export default function ManagePage() {
  return (
    <RequireAuth>
      <ManageContent />
    </RequireAuth>
  );
}

function ManageContent() {
  const [range, setRange] = useState<RangeKey>('1w');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ExpenseBook | null>(null);

  const dates = dateForRange(range);
  const expenses = useExpenseBooksByDateRange(dates.start, dates.end);
  const updateExpense = useUpdateExpenseBook();
  const deleteExpense = useDeleteExpenseBook();

  const data = (expenses.data ?? []).filter(
    (e): e is ExpenseBook => !!e && typeof e.date_uuid === 'string',
  );
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const pageData = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (page > totalPages) setPage(totalPages);

  const handleDelete = (row: ExpenseBook) => {
    if (window.confirm('Delete this expense?')) {
      deleteExpense.mutate({
        year_month: row.year_month,
        date_uuid: row.date_uuid,
      });
    }
  };

  return (
    <div className="pt-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Manage Expenses</h1>
      <p className="mb-6 text-sm text-ink-faint">View, edit, and delete expenses.</p>

      {/* search buttons */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['1w', '2w', '1m'] as RangeKey[]).map((r) => (
          <button
            key={r}
            onClick={() => { setRange(r); setPage(1); }}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
              range === r
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-ink-soft hover:bg-gray-200'
            }`}
          >
            {r === '1w' ? 'Last 1 Week' : r === '2w' ? 'Last 2 Weeks' : 'Last 1 Month'}
          </button>
        ))}
        <span className="ml-auto text-xs text-ink-faint">
          {data.length} record{data.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* table */}
      <div className="rounded-card border border-gray-200 bg-white shadow-sm">
        {expenses.isLoading ? (
          <div className="p-8 text-center text-sm text-ink-faint">Loading...</div>
        ) : expenses.isError ? (
          <div className="p-8 text-center text-sm text-down">Failed to load expenses.</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-faint">No records found.</div>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2">Remark</th>
                    <th className="px-4 py-2">User</th>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((row) => (
                    <tr key={row.date_uuid} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-2 text-ink">{displayDate(row.date_uuid)}</td>
                      <td className="px-4 py-2 text-ink">{row.cat}</td>
                      <td className="px-4 py-2 text-right text-ink">{row.amt}</td>
                      <td className="px-4 py-2 text-ink-faint">{row.rem}</td>
                      <td className="px-4 py-2 text-ink-faint">{row.user}</td>
                      <td className="px-4 py-2 text-ink-faint">{row.time}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => setEditing(row)}
                          className="mr-2 text-xs font-medium text-brand hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          disabled={deleteExpense.isPending}
                          className="text-xs font-medium text-down hover:underline disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {pageData.map((row) => (
                <div key={row.date_uuid} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-ink">{row.cat}</span>
                        <span className="text-xs text-ink-faint">{displayDate(row.date_uuid)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-ink-faint">
                        {row.rem && <span>{row.rem}</span>}
                        <span>{row.user}</span>
                        <span>{row.time}</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-ink whitespace-nowrap">₹{row.amt}</span>
                  </div>
                  <div className="mt-2 flex gap-3">
                    <button
                      onClick={() => setEditing(row)}
                      className="text-xs font-medium text-brand hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(row)}
                      disabled={deleteExpense.isPending}
                      className="text-xs font-medium text-down hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 border-t border-gray-100 px-4 py-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded px-3 py-1 text-xs font-medium text-ink-soft hover:bg-gray-100 disabled:opacity-40"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`e${i}`} className="px-1 text-xs text-ink-faint">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`rounded px-3 py-1 text-xs font-medium ${
                          page === p
                            ? 'bg-brand text-white'
                            : 'text-ink-soft hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded px-3 py-1 text-xs font-medium text-ink-soft hover:bg-gray-100 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* edit modal */}
      {editing && (
        <EditModal
          expense={editing}
          onClose={() => setEditing(null)}
          onSave={(values) => {
            updateExpense.mutate(
              { ...editing, ...values },
              { onSuccess: () => setEditing(null) },
            );
          }}
          isPending={updateExpense.isPending}
        />
      )}
    </div>
  );
}

function EditModal({
  expense,
  onClose,
  onSave,
  isPending,
}: {
  expense: ExpenseBook;
  onClose: () => void;
  onSave: (values: EditValues) => void;
  isPending: boolean;
}) {
  const masters = useMasters();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      cat: expense.cat,
      amt: expense.amt,
      rem: expense.rem,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-sm mx-4 rounded-card bg-white p-5 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-3 text-sm font-semibold text-ink">Edit Expense</h3>

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Category
        </label>
        <select {...register('cat')} required className="input mb-3">
          {masters.data?.map((m) => (
            <option key={m.name} value={m.name}>{m.name}</option>
          ))}
        </select>
        {errors.cat && <p className="mb-2 text-xs text-down">{errors.cat.message}</p>}

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Amount
        </label>
        <input
          type="number"
          step="0.01"
          required
          {...register('amt')}
          className="input mb-3"
        />
        {errors.amt && <p className="mb-2 text-xs text-down">{errors.amt.message}</p>}

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Remark
        </label>
        <input
          type="text"
          maxLength={15}
          {...register('rem')}
          className="input mb-4"
        />
        {errors.rem && <p className="mb-2 text-xs text-down">{errors.rem.message}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-ink-soft hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSave)}
            disabled={isPending || !isValid}
            className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
