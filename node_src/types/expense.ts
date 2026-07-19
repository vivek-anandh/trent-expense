// Money is always in minor units (paise) once inside the app; format at render time.

// ── Masters (matches real API shape) ──────────────────────────────────────────
export interface Master {
  name: string;
  desc: string;
}

export type NewMaster = Master;

// ── Expenses (placeholder — pending real API) ─────────────────────────────────
export interface Expense {
  id: string;
  date: string; // ISO 8601
  amount: number; // paise
  categoryId: string;
  paymentMethodId: string;
  note?: string;
  createdAt: string;
}

export type NewExpense = Omit<Expense, 'id' | 'createdAt'>;

export interface DashboardSummary {
  totalSpend: number; // paise, for the selected range
  byCategory: { categoryId: string; amount: number }[];
  byDate: { date: string; amount: number }[];
}
