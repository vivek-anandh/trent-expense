'use client';

import { RequireAuth } from '@/components/providers/require-auth';

export default function CapturePage() {
  return (
    <RequireAuth>
      <CapturePlaceholder />
    </RequireAuth>
  );
}

function CapturePlaceholder() {
  return (
    <div className="pt-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Add Expense</h1>
      <p className="mb-6 text-sm text-ink-faint">Log a new expense.</p>

      <div className="rounded-card border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-ink-faint">
          Expense API endpoints not connected yet. The capture form will be wired
          up once the expense CRUD is available.
        </p>
      </div>
    </div>
  );
}
