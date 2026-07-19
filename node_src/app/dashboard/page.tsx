'use client';

import { RequireAuth } from '@/components/providers/require-auth';

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  return (
    <div className="pt-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Dashboard</h1>
      <p className="mb-6 text-sm text-ink-faint">Spend overview.</p>

      <div className="rounded-card border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-ink-faint">
          Expense API endpoints not connected yet. Dashboard will show charts and
          summaries once expenses are available.
        </p>
      </div>
    </div>
  );
}
