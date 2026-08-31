import { EntriesByDate, Settings } from '../types';

const ENTRIES_KEY = 'mst.entries.v1';
const SETTINGS_KEY = 'mst.settings.v1';

export const DEFAULT_SETTINGS: Settings = {
  monthlyGoal: 50,
  yearlyGoal: 600,
  serviceYearStartMonth: 9, // September
  theme: 'system',
};

export const loadEntries = (): EntriesByDate => {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    return raw ? (JSON.parse(raw) as EntriesByDate) : {};
  } catch {
    return {};
  }
};

export const saveEntries = (entries: EntriesByDate): void => {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
};

export const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (settings: Settings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const exportData = (entries: EntriesByDate, settings: Settings): string =>
  JSON.stringify({ entries, settings, exportedAt: new Date().toISOString(), version: 1 }, null, 2);

export const parseImportedData = (json: string): { entries: EntriesByDate; settings?: Partial<Settings> } => {
  const parsed = JSON.parse(json);
  if (!parsed || typeof parsed !== 'object' || typeof parsed.entries !== 'object') {
    throw new Error('Invalid backup file');
  }
  return { entries: parsed.entries, settings: parsed.settings };
};
