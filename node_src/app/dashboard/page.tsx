'use client';

import { useMemo, useState } from 'react';
import { RequireAuth } from '@/components/providers/require-auth';
import { useExpenseBooksByDateRange } from '@/lib/queries/expenses';
import type { ExpenseBook } from '@/types/expense';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toYmd(d: Date): string {
  return `${d.getFullYear()}_${pad(d.getMonth() + 1)}_${pad(d.getDate())}`;
}

function fmt(n: number): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function ExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-ink-faint hover:bg-gray-100 hover:text-ink-soft"
      title="Expand"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
      </svg>
    </button>
  );
}

function ChartModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl max-h-[85vh] overflow-auto rounded-t-card sm:rounded-card bg-white p-4 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-faint hover:bg-gray-100 hover:text-ink-soft"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// custom tick for week labels
function WeekTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  if (!payload || x == null || y == null) return null;
  const w = parseInt(payload.value.replace(/\D/g, ''), 10);
  const start = (w - 1) * 7 + 1;
  const end = Math.min(w * 7, 31);
  return (
    <text x={x} y={y} dy={16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475467">
      <tspan>W{w}</tspan>
      <tspan x={x} dy={14} fontSize={10} fontWeight={400} fill="#98A2B3">({start}-{end})</tspan>
    </text>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}

function Dashboard() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = toYmd(new Date(year, month, 1));
  const endDate = toYmd(now);

  const expenses = useExpenseBooksByDateRange(startDate, endDate);

  const data = useMemo(
    () =>
      (expenses.data ?? []).filter(
        (e): e is ExpenseBook => !!e && typeof e.date_uuid === 'string',
      ),
    [expenses.data],
  );

  if (expenses.isLoading) {
    return <div className="pt-10 text-center text-sm text-ink-faint">Loading...</div>;
  }

  if (expenses.isError) {
    return (
      <div className="pt-10 text-center text-sm text-down">
        Failed to load expenses.
      </div>
    );
  }

  const total = data.reduce((s, e) => s + e.amt, 0);

  // category breakdown
  const catMap = new Map<string, number>();
  for (const e of data) {
    catMap.set(e.cat, (catMap.get(e.cat) ?? 0) + e.amt);
  }
  const catSorted = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amt]) => ({ cat, amt, pct: total > 0 ? Math.round((amt / total) * 100) : 0 }));
  const top3 = catSorted.slice(0, 3);

  // daily totals
  const dayMap = new Map<string, number>();
  for (const e of data) {
    const day = e.date_uuid.slice(0, 10);
    dayMap.set(day, (dayMap.get(day) ?? 0) + e.amt);
  }
  const dailyData = [...dayMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, amt]) => ({
      day: day.split('_')[2],
      amt: Math.round(amt),
    }));

  // weekly totals
  const weekMap = new Map<number, number>();
  for (const e of data) {
    const dayNum = parseInt(e.date_uuid.split('_')[2], 10);
    const weekNum = Math.ceil(dayNum / 7);
    weekMap.set(weekNum, (weekMap.get(weekNum) ?? 0) + e.amt);
  }
  const weekData = [...weekMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([w, amt]) => ({
      week: `Week ${w}`,
      amt: Math.round(amt),
    }));

  const monthName = MONTH_NAMES[month];

  return (
    <div className="pt-6">
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Dashboard</h1>
      <p className="mb-6 text-sm text-ink-faint">{monthName} {year} — spend overview.</p>

      {/* summary tile */}
      <div className="mb-6 rounded-card border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink-faint uppercase tracking-wide">
              {monthName} {year}
            </h2>
            <p className="mt-1 text-3xl font-extrabold text-ink">₹{fmt(total)}</p>
            <p className="text-xs text-ink-faint">{data.length} expense{data.length !== 1 ? 's' : ''} till today</p>
          </div>
          {top3.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Top 3 Categories</p>
              <div className="flex flex-wrap gap-4">
                {top3.map((c) => (
                  <div key={c.cat} className="min-w-[80px] text-center">
                    <p className="text-lg font-bold text-ink">₹{fmt(c.amt)}</p>
                    <p className="text-xs font-medium text-ink-soft">{c.cat}</p>
                    <p className="text-xs text-brand font-semibold">{c.pct}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* category bar chart */}
        <div className="rounded-card border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">By Category</h3>
            <ExpandButton onClick={() => setExpanded('category')} />
          </div>
          {catSorted.length === 0 ? (
            <p className="text-center text-sm text-ink-faint py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(150, catSorted.length * 40)}>
              <BarChart
                data={catSorted}
                layout="vertical"
                margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="cat"
                  width={70}
                  tick={{ fontSize: 11, fill: '#475467' }}
                />
                <Tooltip
                  formatter={(v: number) => `₹${fmt(v)}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="amt" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={24}>
                  <LabelList
                    dataKey="pct"
                    position="right"
                    formatter={(v: number) => `${v}%`}
                    style={{ fontSize: 11, fill: '#475467', fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* weekly bar chart */}
        <div className="rounded-card border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">By Week</h3>
            <ExpandButton onClick={() => setExpanded('week')} />
          </div>
          {weekData.length === 0 ? (
            <p className="text-center text-sm text-ink-faint py-8">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={weekData} margin={{ top: 30, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={<WeekTick />}
                  axisLine={false}
                  tickLine={false}
                  height={40}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#98A2B3' }}
                  axisLine={false}
                  tickLine={false}
                  width={50}
                />
                <Tooltip
                  formatter={(v: number) => `₹${fmt(v)}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Bar dataKey="amt" fill="#7C3AED" radius={[6, 6, 0, 0]} barSize={36}>
                  <LabelList
                    dataKey="amt"
                    position="top"
                    formatter={(v: number) => `₹${fmt(v)}`}
                    style={{ fontSize: 11, fill: '#475467', fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* daily trend */}
      <div className="mt-6 rounded-card border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Daily Trend</h3>
          <ExpandButton onClick={() => setExpanded('daily')} />
        </div>
        {dailyData.length === 0 ? (
          <p className="text-center text-sm text-ink-faint py-8">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#98A2B3' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#98A2B3' }}
                axisLine={false}
                tickLine={false}
                width={50}
              />
              <Tooltip
                formatter={(v: number) => `₹${fmt(v)}`}
                labelFormatter={(l) => `Day ${l}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="amt"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2563EB' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* expand modals */}
      {expanded === 'category' && (
        <ChartModal title="By Category" onClose={() => setExpanded(null)}>
          <ResponsiveContainer width="100%" height={Math.max(300, catSorted.length * 48)}>
            <BarChart
              data={catSorted}
              layout="vertical"
              margin={{ top: 0, right: 50, bottom: 0, left: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="cat"
                width={100}
                tick={{ fontSize: 13, fill: '#475467' }}
              />
              <Tooltip
                formatter={(v: number) => `₹${fmt(v)}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="amt" fill="#2563EB" radius={[0, 6, 6, 0]} barSize={28}>
                <LabelList
                  dataKey="pct"
                  position="right"
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: 12, fill: '#475467', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartModal>
      )}

      {expanded === 'week' && (
        <ChartModal title="By Week" onClose={() => setExpanded(null)}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={weekData} margin={{ top: 40, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
              <XAxis
                dataKey="week"
                tick={<WeekTick />}
                axisLine={false}
                tickLine={false}
                height={50}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#98A2B3' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(v: number) => `₹${fmt(v)}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="amt" fill="#7C3AED" radius={[6, 6, 0, 0]} barSize={48}>
                <LabelList
                  dataKey="amt"
                  position="top"
                  formatter={(v: number) => `₹${fmt(v)}`}
                  style={{ fontSize: 12, fill: '#475467', fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartModal>
      )}

      {expanded === 'daily' && (
        <ChartModal title="Daily Trend" onClose={() => setExpanded(null)}>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dailyData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2F4F7" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#98A2B3' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#98A2B3' }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip
                formatter={(v: number) => `₹${fmt(v)}`}
                labelFormatter={(l) => `Day ${l}`}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="amt"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#2563EB' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartModal>
      )}
    </div>
  );
}
