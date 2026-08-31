export const toISODate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1);
export const endOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** Days for a calendar month grid, Sunday-first, including leading/trailing days from adjacent months. */
export const getMonthGridDays = (monthDate: Date): Date[] => {
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const days: Date[] = [];

  const leading = first.getDay();
  for (let i = leading; i > 0; i--) {
    days.push(new Date(first.getFullYear(), first.getMonth(), 1 - i));
  }
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(first.getFullYear(), first.getMonth(), d));
  }
  const trailing = 6 - last.getDay();
  for (let i = 1; i <= trailing; i++) {
    days.push(new Date(first.getFullYear(), first.getMonth() + 1, i));
  }
  return days;
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export interface ServiceYearInfo {
  /** e.g. "2025-2026" */
  label: string;
  start: Date;
  end: Date;
}

/**
 * Given any date, returns the JW-style service year that contains it.
 * startMonth is 1-12 (9 = September). The year runs startMonth 1 -> (startMonth-1) of the next
 * calendar year, e.g. Sept 1 2025 - Aug 31 2026.
 */
export const getServiceYear = (date: Date, startMonth: number): ServiceYearInfo => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1; // 1-12
  const startCalendarYear = m >= startMonth ? y : y - 1;
  const start = new Date(startCalendarYear, startMonth - 1, 1);
  const end = new Date(startCalendarYear + 1, startMonth - 1, 0); // last day of month before start month, next year
  return {
    label: `${startCalendarYear}-${startCalendarYear + 1}`,
    start,
    end,
  };
};

/** All 12 calendar months belonging to the given service year, in order. */
export const getServiceYearMonths = (info: ServiceYearInfo): Date[] => {
  const months: Date[] = [];
  const cursor = new Date(info.start.getFullYear(), info.start.getMonth(), 1);
  for (let i = 0; i < 12; i++) {
    months.push(new Date(cursor.getFullYear(), cursor.getMonth() + i, 1));
  }
  return months;
};

export const daysBetweenInclusive = (a: Date, b: Date): number => {
  const msPerDay = 24 * 60 * 60 * 1000;
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((end - start) / msPerDay) + 1;
};
