const STORAGE_KEY = 'listicles-frequent-players';

export const DEFAULT_FREQUENT_PLAYERS = ['Jordan', 'Bethany', 'Justin', 'Hillary', 'Greg', 'Marilyn'];

export function loadFrequentPlayers(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FREQUENT_PLAYERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FREQUENT_PLAYERS;
  } catch {
    return DEFAULT_FREQUENT_PLAYERS;
  }
}

export function saveFrequentPlayers(names: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  } catch {
    // ignore
  }
}
