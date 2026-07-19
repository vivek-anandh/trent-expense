import type { Master, ExpenseBook } from '@/types/expense';

const INITIAL_MASTERS: Master[] = [
  { name: 'Food', desc: 'Meals, groceries, snacks' },
  { name: 'Transport', desc: 'Auto, cab, metro, fuel' },
  { name: 'Rent', desc: 'Monthly rent' },
  { name: 'Utilities', desc: 'Electricity, water, internet' },
  { name: 'Shopping', desc: 'Clothes, electronics, misc' },
  { name: 'Health', desc: 'Medicine, doctor visits' },
];

let masters = [...INITIAL_MASTERS];

function randomId(len = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function seedExpenses(): ExpenseBook[] {
  const cats = ['Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Health'];
  const remarks = ['', '', '', 'lunch', 'dinner', 'cab', 'grocery', 'electric', 'meds', 'snacks'];
  const result: ExpenseBook[] = [];
  let count = 0;

  for (let day = 1; day <= 19 && count < 100; day++) {
    const perDay = day <= 14 ? 5 : 6;
    for (let i = 0; i < perDay && count < 100; i++) {
      const cat = cats[count % cats.length]!;
      const amt = Math.round((50 + Math.random() * 950) * 100) / 100;
      const h = 8 + Math.floor(Math.random() * 12);
      const m = Math.floor(Math.random() * 60);
      const s = Math.floor(Math.random() * 60);
      result.push({
        year_month: '2026_07',
        date_uuid: `2026_07_${pad(day)}_${randomId()}`,
        cat,
        amt,
        rem: remarks[count % remarks.length],
        user: 'vivek',
        time: `${pad(h)}:${pad(m)}:${pad(s)}`,
      });
      count++;
    }
  }
  return result;
}

let expenses: ExpenseBook[] = seedExpenses();

function uuidDate(dateUuid: string): string {
  return dateUuid.slice(0, 10);
}

export function mockGet(path: string): unknown {
  if (path === '/expense') return [...masters];

  if (path.startsWith('/expense-book')) {
    const params = new URLSearchParams(path.split('?')[1] ?? '');
    const yearMonth = params.get('year_month');
    const dateUuid = params.get('date_uuid');
    const startData = params.get('start_data');
    const endDate = params.get('end_date');

    if (dateUuid) {
      return expenses.find((e) => e.year_month === yearMonth && e.date_uuid === dateUuid) ?? null;
    }

    let result = expenses.filter((e) => e.year_month === yearMonth);

    if (startData && endDate) {
      const endClean = endDate.replace(/_z$/, '');
      result = result.filter((e) => {
        const d = uuidDate(e.date_uuid);
        return d >= startData && d <= endClean;
      });
    }

    return result;
  }

  return null;
}

export function mockPost(path: string, body: unknown): unknown {
  if (path === '/expense') {
    const data = body as { name: string; desc: string; action?: string };

    if (data.action === 'remove') {
      masters = masters.filter((m) => m.name !== data.name);
      return null;
    }

    masters = [...masters, { name: data.name, desc: data.desc }];
    return { name: data.name, desc: data.desc };
  }

  if (path === '/expense-book') {
    const data = body as ExpenseBook & { action?: string };

    if (data.action === 'remove') {
      expenses = expenses.filter(
        (e) => !(e.year_month === data.year_month && e.date_uuid === data.date_uuid),
      );
      return null;
    }

    const existing = expenses.findIndex(
      (e) => e.year_month === data.year_month && e.date_uuid === data.date_uuid,
    );
    if (existing >= 0) {
      expenses = expenses.map((e, i) => (i === existing ? { ...data } : e));
    } else {
      expenses = [...expenses, { ...data }];
    }
    return { ...data };
  }

  return null;
}
