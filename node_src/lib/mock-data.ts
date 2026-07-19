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
let expenses: ExpenseBook[] = [];

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
