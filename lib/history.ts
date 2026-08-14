export interface BankedPlayerResult {
  name: string;
  score: number;
  rank: number;
}

export interface BankedGame {
  id: string;
  playedAt: number;
  roundsPlayed: number;
  categories: string[];
  results: BankedPlayerResult[];
}

const STORAGE_KEY = 'listicles-history';

export function loadHistory(): BankedGame[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BankedGame[];
  } catch {
    return [];
  }
}

export function appendToHistory(game: Omit<BankedGame, 'id' | 'playedAt'>): void {
  try {
    const existing = loadHistory();
    const entry: BankedGame = { ...game, id: crypto.randomUUID(), playedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...existing]));
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
