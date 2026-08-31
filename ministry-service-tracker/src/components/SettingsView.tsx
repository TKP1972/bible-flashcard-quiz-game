import { useRef, useState } from 'react';
import { EntriesByDate, Settings } from '../types';
import { exportData, parseImportedData } from '../lib/storage';
import { MONTH_NAMES } from '../lib/date';

interface SettingsViewProps {
  settings: Settings;
  entries: EntriesByDate;
  onUpdateSettings: (settings: Settings) => void;
  onImport: (entries: EntriesByDate, settings?: Partial<Settings>) => void;
  onClearAll: () => void;
}

export default function SettingsView({ settings, entries, onUpdateSettings, onImport, onClearAll }: SettingsViewProps) {
  const [message, setMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData(entries, settings);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ministry-service-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const { entries: importedEntries, settings: importedSettings } = parseImportedData(String(reader.result));
        onImport(importedEntries, importedSettings);
        setMessage('Backup imported successfully.');
      } catch {
        setMessage('That file could not be read as a valid backup.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="px-4 pb-6 space-y-5">
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">Goals</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Monthly goal (h)</label>
            <input
              type="number"
              min={0}
              value={settings.monthlyGoal}
              onChange={(e) => onUpdateSettings({ ...settings, monthlyGoal: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Yearly goal (h)</label>
            <input
              type="number"
              min={0}
              value={settings.yearlyGoal}
              onChange={(e) => onUpdateSettings({ ...settings, yearlyGoal: Number(e.target.value) || 0 })}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Service year starts</label>
          <select
            value={settings.serviceYearStartMonth}
            onChange={(e) => onUpdateSettings({ ...settings, serviceYearStartMonth: Number(e.target.value) })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Default is September, matching the standard JW service year (Sept 1 – Aug 31).</p>
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">Appearance</h3>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onUpdateSettings({ ...settings, theme: t })}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize ${
                settings.theme === t
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">Backup</h3>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-teal-600 text-white hover:bg-teal-700"
          >
            Export backup
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            Import backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImportFile(file);
              e.target.value = '';
            }}
          />
        </div>
        {message && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{message}</p>}
      </section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-2">Danger zone</h3>
        <button
          onClick={() => {
            if (confirm('This will permanently delete all logged hours. Continue?')) {
              onClearAll();
            }
          }}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
        >
          Clear all data
        </button>
      </section>
    </div>
  );
}
