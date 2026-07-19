// Money is always in minor units (paise) once inside the app; format at render time.

// ── Masters (matches real API shape) ──────────────────────────────────────────
export interface Master {
  name: string;
  desc: string;
}

export type NewMaster = Master;

// ── Expense Book (POST /expense-book) ────────────────────────────────────────
export interface ExpenseBook {
  year_month: string; // "2026_07"
  date_uuid: string; // "2026_07_19_<random>"
  cat: string;
  amt: number;
  rem: string;
  user: string;
  time: string; // "HH:MM:SS"
}

export type NewExpenseBook = ExpenseBook;

// ── Dashboard (placeholder) ─────────────────────────────────────────────────
export interface DashboardSummary {
  totalSpend: number;
  byCategory: { categoryId: string; amount: number }[];
  byDate: { date: string; amount: number }[];
}
