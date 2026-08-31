import { useEffect, useMemo, useState } from 'react';
import { EntriesByDate, ServiceEntry, Settings } from './types';
import { loadEntries, saveEntries, loadSettings, saveSettings } from './lib/storage';
import {
  MONTH_NAMES,
  toISODate,
  startOfMonth,
  endOfMonth,
  getServiceYear,
  daysBetweenInclusive,
} from './lib/date';
import Calendar from './components/Calendar';
import EntryModal from './components/EntryModal';
import GoalProgress from './components/GoalProgress';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';

type Tab = 'calendar' | 'stats' | 'settings';

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M7 3v3M17 3v3M3.5 9h17M5 5h14a1.5 1.5 0 011.5 1.5V19a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 19V6.5A1.5 1.5 0 015 5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><path d="M4 20V10M12 20V4M20 20v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
);
const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5"/></svg>
);

export default function App() {
  const [entries, setEntries] = useState<EntriesByDate>(() => loadEntries());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [tab, setTab] = useState<Tab>('calendar');

  useEffect(() => saveEntries(entries), [entries]);
  useEffect(() => saveSettings(settings), [settings]);

  useEffect(() => {
    const root = document.documentElement;
    const applyDark = (dark: boolean) => root.classList.toggle('dark', dark);
    if (settings.theme === 'dark') applyDark(true);
    else if (settings.theme === 'light') applyDark(false);
    else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      applyDark(mq.matches);
      const listener = (e: MediaQueryListEvent) => applyDark(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  const monthTotal = useMemo(() => {
    const start = startOfMonth(viewMonth);
    const end = endOfMonth(viewMonth);
    let total = 0;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const entry = entries[toISODate(d)];
      if (entry) total += entry.hours;
    }
    return total;
  }, [entries, viewMonth]);

  const serviceYear = useMemo(() => getServiceYear(viewMonth, settings.serviceYearStartMonth), [viewMonth, settings.serviceYearStartMonth]);

  const yearTotal = useMemo(() => {
    let total = 0;
    for (const iso in entries) {
      const d = new Date(iso + 'T00:00:00');
      if (d >= serviceYear.start && d <= serviceYear.end) total += entries[iso].hours;
    }
    return total;
  }, [entries, serviceYear]);

  const yearRemainingInfo = useMemo(() => {
    const today = new Date();
    const clampedToday = today > serviceYear.end ? serviceYear.end : today < serviceYear.start ? serviceYear.start : today;
    const daysLeft = Math.max(0, daysBetweenInclusive(clampedToday, serviceYear.end) - 1);
    const hoursLeft = Math.max(0, settings.yearlyGoal - yearTotal);
    if (daysLeft === 0) return null;
    const perDay = hoursLeft / daysLeft;
    return `${hoursLeft.toFixed(1)}h left · ~${perDay.toFixed(1)}h/day to reach goal`;
  }, [serviceYear, settings.yearlyGoal, yearTotal]);

  const handleSelectDay = (date: Date) => setSelectedDay(date);

  const handleSaveEntry = (hours: number, note: string) => {
    if (!selectedDay) return;
    const iso = toISODate(selectedDay);
    const entry: ServiceEntry = { date: iso, hours, note: note || undefined };
    setEntries((prev) => ({ ...prev, [iso]: entry }));
    setSelectedDay(null);
  };

  const handleDeleteEntry = () => {
    if (!selectedDay) return;
    const iso = toISODate(selectedDay);
    setEntries((prev) => {
      const next = { ...prev };
      delete next[iso];
      return next;
    });
    setSelectedDay(null);
  };

  const goToPrevMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goToNextMonth = () => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const goToPrevYear = () => setViewMonth((m) => new Date(m.getFullYear() - 1, m.getMonth(), 1));
  const goToNextYear = () => setViewMonth((m) => new Date(m.getFullYear() + 1, m.getMonth(), 1));

  const selectedEntry = selectedDay ? entries[toISODate(selectedDay)] : undefined;

  return (
    <div className="max-w-md mx-auto min-h-dvh flex flex-col">
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-extrabold text-teal-700 dark:text-teal-400">Ministry Service Tracker</h1>
        <p className="text-xs text-slate-400 dark:text-slate-500">Service year {serviceYear.label}</p>
      </header>

      <main className="flex-1 overflow-y-auto pb-4">
        {tab === 'calendar' && (
          <div className="px-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm mb-4 space-y-4">
              <GoalProgress label="This month" current={monthTotal} goal={settings.monthlyGoal} accent="amber" />
              <GoalProgress
                label="Service year"
                current={yearTotal}
                goal={settings.yearlyGoal}
                sublabel={yearRemainingInfo ?? undefined}
              />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={goToPrevMonth}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  ‹
                </button>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  ›
                </button>
              </div>
              <Calendar monthDate={viewMonth} entries={entries} onSelectDay={handleSelectDay} />
            </div>
          </div>
        )}

        {tab === 'stats' && (
          <StatsView
            referenceDate={viewMonth}
            entries={entries}
            settings={settings}
            onPrevYear={goToPrevYear}
            onNextYear={goToNextYear}
          />
        )}

        {tab === 'settings' && (
          <SettingsView
            settings={settings}
            entries={entries}
            onUpdateSettings={setSettings}
            onImport={(importedEntries, importedSettings) => {
              setEntries(importedEntries);
              if (importedSettings) setSettings((prev) => ({ ...prev, ...importedSettings }));
            }}
            onClearAll={() => setEntries({})}
          />
        )}
      </main>

      <nav className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex">
        {([
          { id: 'calendar' as Tab, label: 'Calendar', icon: <CalendarIcon /> },
          { id: 'stats' as Tab, label: 'Stats', icon: <ChartIcon /> },
          { id: 'settings' as Tab, label: 'Settings', icon: <GearIcon /> },
        ]).map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${
              tab === item.id ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {selectedDay && (
        <EntryModal
          date={selectedDay}
          existing={selectedEntry}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
