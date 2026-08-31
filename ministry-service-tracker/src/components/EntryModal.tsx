import { useState } from 'react';
import { ServiceEntry } from '../types';

interface EntryModalProps {
  date: Date;
  existing?: ServiceEntry;
  onSave: (hours: number, note: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

const QUICK_HOURS = [0.5, 1, 1.5, 2, 3, 4];

export default function EntryModal({ date, existing, onSave, onDelete, onClose }: EntryModalProps) {
  const [hours, setHours] = useState<string>(existing ? String(existing.hours) : '');
  const [note, setNote] = useState<string>(existing?.note ?? '');

  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const parsedHours = parseFloat(hours);
  const isValid = !isNaN(parsedHours) && parsedHours > 0 && parsedHours <= 24;

  const handleSave = () => {
    if (!isValid) return;
    onSave(parsedHours, note.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 pb-8 sm:pb-6 shadow-xl animate-[fade-in_0.15s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">{dateLabel}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Log your field service hours</p>

        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Hours</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.25"
          min="0"
          max="24"
          autoFocus
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="e.g. 2.5"
          className="w-full text-2xl font-bold text-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-3 mb-3 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_HOURS.map((h) => (
            <button
              key={h}
              onClick={() => setHours(String(h))}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-100 dark:hover:bg-teal-900/40"
            >
              {h}h
            </button>
          ))}
        </div>

        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Return visits, Bible study"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 mb-5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <div className="flex gap-2">
          {existing && (
            <button
              onClick={onDelete}
              className="px-4 py-3 rounded-2xl font-semibold text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/70"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex-1 py-3 rounded-2xl font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:hover:bg-teal-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
