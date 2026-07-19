import type { Master } from '@/types/expense';

export const MOCK_MASTERS: Master[] = [
  { name: 'Food', desc: 'Meals, groceries, snacks' },
  { name: 'Transport', desc: 'Auto, cab, metro, fuel' },
  { name: 'Rent', desc: 'Monthly rent' },
  { name: 'Utilities', desc: 'Electricity, water, internet' },
  { name: 'Shopping', desc: 'Clothes, electronics, misc' },
  { name: 'Health', desc: 'Medicine, doctor visits' },
];

let masters = [...MOCK_MASTERS];

export function mockGet(path: string): unknown {
  if (path === '/expense') return [...masters];
  return null;
}

export function mockPost(path: string, body: unknown): unknown {
  if (path !== '/expense') return null;
  const data = body as { name: string; desc: string; action?: string };

  if (data.action === 'remove') {
    masters = masters.filter((m) => m.name !== data.name);
    return null;
  }

  masters = [...masters, { name: data.name, desc: data.desc }];
  return { name: data.name, desc: data.desc };
}
