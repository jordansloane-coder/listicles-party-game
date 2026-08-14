export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export type DieFace = 'Trashy' | 'WTF' | 'Ew' | 'Hot' | 'Basic' | 'OMG';

export type ItemScore = {
  text: string;
  points: number;
  status: 'unique' | 'duplicate' | 'blank';
};

export interface PlayerRoundResult {
  playerId: string;
  items: ItemScore[];
  subtotal: number;
}

export interface RoundRecord {
  roundNumber: number;
  category: string;
  bonusLetter: string;
  results: PlayerRoundResult[];
  manual: boolean;
  dieFace: DieFace | null;
  diceBonusPlayerId: string | null;
}

export type Phase =
  | 'setup'
  | 'writing'
  | 'entry'
  | 'manualScore'
  | 'scoring'
  | 'dice'
  | 'roundEnd'
  | 'final';

export interface GameState {
  phase: Phase;
  players: Player[];
  usedCategories: string[];
  currentCategory: string | null;
  currentBonusLetter: string | null;
  roundNumber: number;
  entryPlayerIndex: number;
  roundEntries: Record<string, string[]>;
  currentRoundResults: PlayerRoundResult[] | null;
  categoryHistory: string[];
  lastRoundWasManual: boolean;
  diceFace: DieFace | null;
  diceBonusPlayerId: string | null;
  history: RoundRecord[];
  soundEnabled: boolean;
}
