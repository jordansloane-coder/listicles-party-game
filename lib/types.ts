export interface Player {
  id: string;
  name: string;
  totalScore: number;
}

export type DieFace = 'Trashy' | 'WTF' | 'Ew' | 'Hot' | 'Basic' | 'OMG';

// status: 'unique' = host says it counts, 'duplicate' = host says it doesn't,
// 'blank' = no answer was written (never counts, not host-editable).
export type ItemScore = {
  text: string;
  points: number;
  status: 'unique' | 'duplicate' | 'blank';
};

export interface PlayerRoundResult {
  playerId: string;
  items: ItemScore[];
  subtotal: number; // live, recomputed as the host taps through items
  appliedSubtotal: number; // what's already been added to totalScore (0 until Submit)
  submitted: boolean; // host has hit Submit for this player at least once this round
}

export interface RoundRecord {
  roundNumber: number;
  category: string;
  bonusLetter: string;
  results: PlayerRoundResult[];
  manual: boolean;
  dieFace: DieFace | null;
  diceNominations: Record<string, string>;
  diceBonusPlayerIds: string[];
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
  currentCategoryIsRaunchy: boolean;
  currentBonusLetter: string | null;
  roundNumber: number;
  entryPlayerIndex: number;
  roundEntries: Record<string, string[]>;
  currentRoundResults: PlayerRoundResult[] | null;
  categoryHistory: string[];
  lastRoundWasManual: boolean;
  diceFace: DieFace | null;
  history: RoundRecord[];
  soundEnabled: boolean;
  justinPissedCount: number;
}
