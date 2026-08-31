export interface ServiceEntry {
  /** ISO date string, YYYY-MM-DD, local calendar day */
  date: string;
  hours: number;
  note?: string;
}

export interface Settings {
  monthlyGoal: number;
  yearlyGoal: number;
  /** Month (1-12) the service year starts on. JW service year starts in September. */
  serviceYearStartMonth: number;
  theme: 'light' | 'dark' | 'system';
}

export type EntriesByDate = Record<string, ServiceEntry>;
