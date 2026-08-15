export interface Settings {
  itemsPerRound: number;
  roundsPerGame: number;
  roundSeconds: number;
  manualScoringDefault: boolean;
  raunchyMode: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  itemsPerRound: 7,
  roundsPerGame: 4,
  roundSeconds: 90,
  manualScoringDefault: true,
  raunchyMode: false,
};

const STORAGE_KEY = 'listicles-settings';

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
