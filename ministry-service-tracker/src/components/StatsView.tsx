import { EntriesByDate, Settings } from '../types';
import { getServiceYear, getServiceYearMonths, MONTH_NAMES, toISODate, startOfMonth, endOfMonth } from '../lib/date';
import GoalProgress from './GoalProgress';

interface StatsViewProps {
  referenceDate: Date;
  entries: EntriesByDate;
  settings: Settings;
  onPrevYear: () => void;
  onNextYear: () => void;
}

const monthTotal = (entries: EntriesByDate, monthDate: Date): number => {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  let total = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const entry = entries[toISODate(d)];
    if (entry) total += entry.hours;
  }
  return total;
};

export default function StatsView({ referenceDate, entries, settings, onPrevYear, onNextYear }: StatsViewProps) {
  const serviceYear = getServiceYear(referenceDate, settings.serviceYearStartMonth);
  const months = getServiceYearMonths(serviceYear);
  const monthlyTotals = months.map((m) => ({ month: m, total: monthTotal(entries, m) }));
  const yearTotal = monthlyTotals.reduce((sum, m) => sum + m.total, 0);
  const maxTotal = Math.max(settings.monthlyGoal, ...monthlyTotals.map((m) => m.total), 1);
  const now = new Date();

  return (
    <div className="px-4 pb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevYear}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          ‹
        </button>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
          Service Year {serviceYear.label}
        </h2>
        <button
          onClick={onNextYear}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
        >
          ›
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm mb-5">
        <GoalProgress label="Service year total" current={yearTotal} goal={settings.yearlyGoal} accent="teal" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">Hours by month</h3>
        <div className="space-y-3">
          {monthlyTotals.map(({ month, total }) => {
            const met = total >= settings.monthlyGoal;
            const isCurrent = month.getMonth() === now.getMonth() && month.getFullYear() === now.getFullYear();
            const barPct = Math.min(100, (total / maxTotal) * 100);
            return (
              <div key={toISODate(month)} className="flex items-center gap-3">
                <div className={`w-9 text-xs font-semibold shrink-0 ${isCurrent ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {MONTH_NAMES[month.getMonth()].slice(0, 3)}
                </div>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full ${met ? 'bg-emerald-500' : 'bg-teal-600'}`}
                    style={{ width: `${barPct}%` }}
                  />
                </div>
                <div className="w-14 text-right text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
                  {total > 0 ? total : '–'}
                  {met && total > 0 ? ' ✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
