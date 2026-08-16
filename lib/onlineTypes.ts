import type { DieFace, ItemScore } from './types';

export type OnlinePhase = 'lobby' | 'writing' | 'scoring' | 'dice' | 'roundEnd' | 'final';

export interface OnlineSettings {
  itemsPerRound: number;
  roundsPerGame: number;
  roundSeconds: number;
  raunchyMode: boolean;
}

export const DEFAULT_ONLINE_SETTINGS: OnlineSettings = {
  itemsPerRound: 7,
  roundsPerGame: 4,
  roundSeconds: 90,
  raunchyMode: false,
};

export interface OnlinePlayer {
  name: string;
  joinedAt: number;
  connected: boolean;
  totalScore: number;
  // null = hasn't submitted this round yet. Reset to null at the start of
  // every round.
  currentAnswers: string[] | null;
}

export interface OnlineRoundResult {
  items: ItemScore[];
  subtotal: number; // live, recomputed as the host taps through items
  appliedSubtotal: number; // what's already been added to totalScore (0 until Submit)
  submitted: boolean; // host has hit Submit for this player at least once this round
}

// Everything lives under rooms/{code} in Firebase Realtime Database. Only the
// host ever writes game-flow fields (phase/category/timer/dice/round); guest
// devices only ever write their own players/{id}.currentAnswers.
export interface OnlineRoom {
  code: string;
  hostId: string;
  createdAt: number;
  settings: OnlineSettings;
  phase: OnlinePhase;
  players: Record<string, OnlinePlayer>;
  currentCategory: string | null;
  currentCategoryIsRaunchy: boolean;
  currentBonusLetter: string | null;
  roundNumber: number;
  usedCategories: string[];
  // Deadline-based sync (like the existing local useCountdown) rather than
  // pushing a live tick every second — every device computes its own
  // remaining time from Date.now() vs this timestamp, immune to network lag.
  timerDeadline: number | null;
  timerRemainingWhenPaused: number | null;
  timerEverStarted: boolean;
  currentRoundResults: Record<string, OnlineRoundResult> | null;
  diceFace: DieFace | null;
  diceNominations: Record<string, string>;
  diceBonusPlayerIds: string[];
  justinPissedCount: number;
}
