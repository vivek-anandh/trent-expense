'use client';

import { useState } from 'react';
import { RequireAuth } from '@/components/providers/require-auth';
import { useMasters } from '@/lib/queries/masters';
import { useCreateExpenseBook } from '@/lib/queries/expenses';
import { useAuth } from 'react-oidc-context';
import { getUsername } from '@/lib/auth-utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  cat: z.string().min(1, 'Category is required'),
  amt: z.coerce.number().positive('Amount must be positive'),
  remark: z.string().max(15, 'Max 15 characters').optional(),
  year: z.string().min(1, 'Year is required'),
  month: z.string().min(1, 'Month is required'),
  day: z.string().min(1, 'Day is required'),
});

type FormValues = z.infer<typeof formSchema>;

function randomId(len = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

const now = new Date();
const CURRENT_YEAR = now.getFullYear();

const YEARS = Array.from({ length: 4 }, (_, i) => String(CURRENT_YEAR - 1 + i));
const MONTHS = Array.from({ length: 12 }, (_, i) => pad(i + 1));
const DAYS = Array.from({ length: 31 }, (_, i) => pad(i + 1));

export default function CapturePage() {
  return (
    <RequireAuth>
      <CaptureContent />
    </RequireAuth>
  );
}

function CaptureContent() {
  const auth = useAuth();
  const masters = useMasters();
  const createExpense = useCreateExpenseBook();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: String(now.getFullYear()),
      month: pad(now.getMonth() + 1),
      day: pad(now.getDate()),
    },
  });

  if (masters.isLoading) {
    return <div className="pt-10 text-center text-sm text-ink-faint">Loading...</div>;
  }

  if (masters.isError) {
    return (
      <div className="pt-10 text-center text-sm text-down">
        Failed to load categories. Check your connection.
      </div>
    );
  }

  const onSubmit = (values: FormValues) => {
    const time = new Date();
    const user = getUsername(auth.user);

    createExpense.mutate(
      {
        year_month: `${values.year}_${values.month}`,
        date_uuid: `${values.year}_${values.month}_${values.day}_${randomId()}`,
        cat: values.cat,
        amt: values.amt,
        rem: values.remark ?? '',
        user,
        time: `${pad(time.getHours())}:${pad(time.getMinutes())}:${pad(time.getSeconds())}`,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          reset({
            cat: '',
            amt: undefined,
            remark: '',
            year: String(now.getFullYear()),
            month: pad(now.getMonth() + 1),
            day: pad(now.getDate()),
          });
          setTimeout(() => setSuccess(false), 3000);
        },
      },
    );
  };

  return (
    <div className="pt-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Add Expense</h1>
      <p className="mb-6 text-sm text-ink-faint">Log a new expense.</p>

      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Expense saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-card border border-gray-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Category
        </label>
        <select {...register('cat')} required className="input mb-4">
          <option value="">Select category</option>
          {masters.data?.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
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
          className="input mb-4"
          placeholder="0.00"
        />
        {errors.amt && <p className="mb-2 text-xs text-down">{errors.amt.message}</p>}

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Remark (max 15 chars)
        </label>
        <input
          type="text"
          maxLength={15}
          {...register('remark')}
          className="input mb-4"
          placeholder="Optional"
        />
        {errors.remark && <p className="mb-2 text-xs text-down">{errors.remark.message}</p>}

        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Date
        </label>
        <div className="mb-4 flex gap-2">
          <select {...register('day')} className="input">
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select {...register('month')} className="input">
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select {...register('year')} className="input">
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        {(errors.year || errors.month || errors.day) && (
          <p className="mb-2 text-xs text-down">Date is required</p>
        )}

        <button
          type="submit"
          disabled={createExpense.isPending || !isValid}
          className="w-full rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createExpense.isPending ? 'Saving...' : 'Add Expense'}
        </button>

        {createExpense.isError && (
          <p className="mt-2 text-xs text-down">Failed to save. Try again.</p>
        )}
      </form>
    </div>
  );
}
