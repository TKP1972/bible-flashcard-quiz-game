import { EntriesByDate } from '../types';
import { getMonthGridDays, toISODate, isSameDay, WEEKDAY_LABELS } from '../lib/date';

interface CalendarProps {
  monthDate: Date;
  entries: EntriesByDate;
  onSelectDay: (date: Date) => void;
}

export default function Calendar({ monthDate, entries, onSelectDay }: CalendarProps) {
  const days = getMonthGridDays(monthDate);
  const today = new Date();

  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i} className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const inMonth = day.getMonth() === monthDate.getMonth();
          const iso = toISODate(day);
          const entry = entries[iso];
          const isToday = isSameDay(day, today);

          return (
            <button
              key={i}
              onClick={() => onSelectDay(day)}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-colors
                ${inMonth ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-700'}
                ${entry ? 'bg-teal-600 text-white hover:bg-teal-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}
                ${isToday && !entry ? 'ring-2 ring-teal-500' : ''}
              `}
            >
              <span className={`text-sm ${entry ? 'font-bold' : 'font-medium'}`}>{day.getDate()}</span>
              {entry && (
                <span className="text-[10px] leading-none mt-0.5 font-semibold opacity-90">
                  {entry.hours}h
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
