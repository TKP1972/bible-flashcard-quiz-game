interface GoalProgressProps {
  label: string;
  current: number;
  goal: number;
  sublabel?: string;
  accent?: 'teal' | 'amber';
}

export default function GoalProgress({ label, current, goal, sublabel, accent = 'teal' }: GoalProgressProps) {
  const pct = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
  const met = current >= goal;
  const barColor = met ? 'bg-emerald-500' : accent === 'amber' ? 'bg-amber-500' : 'bg-teal-600';

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {formatHours(current)} <span className="text-slate-400 dark:text-slate-500 font-medium">/ {formatHours(goal)}h</span>
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {sublabel && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sublabel}</div>}
    </div>
  );
}

export const formatHours = (h: number): string => {
  const rounded = Math.round(h * 100) / 100;
  return rounded.toString();
};
