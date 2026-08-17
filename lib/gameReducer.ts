import { CATEGORIES } from './categories';
import { CATEGORIES_ADULT } from './categoriesAdult';
import { buildReviewResults, randomBonusLetter, scoreItem } from './scoring';
import type { DieFace, GameState, Player, RoundRecord } from './types';

export type Action =
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'REORDER_PLAYERS'; orderedIds: string[] }
  | { type: 'START_GAME'; raunchy: boolean }
  | { type: 'PASS_CATEGORY'; raunchy: boolean }
  | { type: 'GO_BACK_CATEGORY' }
  | { type: 'REROLL_LETTER' }
  | { type: 'END_WRITING'; mode: 'entry' | 'manualScore' }
  | { type: 'SUBMIT_ENTRY'; playerId: string; items: string[] }
  | { type: 'SUBMIT_MANUAL_SCORES'; scores: Record<string, number> }
  | { type: 'EDIT_ROUND_SCORES' }
  | { type: 'SET_ITEM_COUNTS'; playerId: string; itemIndex: number; counts: boolean }
  | { type: 'SUBMIT_PLAYER_SCORE'; playerId: string }
  | { type: 'GO_TO_DICE' }
  | { type: 'ROLL_DICE'; face: DieFace }
  | { type: 'CONFIRM_DICE_WINNERS'; playerIds: string[]; nominations: Record<string, string> }
  | { type: 'SKIP_DICE_BONUS' }
  | { type: 'NEXT_ROUND'; raunchy: boolean }
  | { type: 'END_GAME' }
  | { type: 'PLAY_ANOTHER_GAME'; raunchy: boolean }
  | { type: 'PLAY_AGAIN' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'JUSTIN_GOT_PISSED' }
  | { type: 'LOAD_STATE'; state: GameState };

export function createInitialState(): GameState {
  return {
    phase: 'setup',
    players: [],
    usedCategories: [],
    currentCategory: null,
    currentCategoryIsRaunchy: false,
    currentBonusLetter: null,
    roundNumber: 0,
    entryPlayerIndex: 0,
    roundEntries: {},
    currentRoundResults: null,
    categoryHistory: [],
    lastRoundWasManual: false,
    diceFace: null,
    history: [],
    soundEnabled: true,
    justinPissedCount: 0,
  };
}

function pickCategory(used: string[], raunchy: boolean): { category: string; used: string[] } {
  const source = raunchy ? CATEGORIES_ADULT : CATEGORIES;
  let pool = source.filter((c) => !used.includes(c));
  let nextUsed = used;
  if (pool.length === 0) {
    // Every category has been played this session — reshuffle the pool
    // rather than stall the game.
    pool = source;
    nextUsed = [];
  }
  const category = pool[Math.floor(Math.random() * pool.length)];
  return { category, used: [...nextUsed, category] };
}

function startRound(state: GameState, raunchy: boolean): GameState {
  const { category, used } = pickCategory(state.usedCategories, raunchy);
  return {
    ...state,
    phase: 'writing',
    currentCategory: category,
    currentCategoryIsRaunchy: raunchy,
    usedCategories: used,
    currentBonusLetter: randomBonusLetter(),
    roundNumber: state.roundNumber + 1,
    entryPlayerIndex: 0,
    roundEntries: {},
    currentRoundResults: null,
    categoryHistory: [],
    diceFace: null,
  };
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const name = action.name.trim();
      if (!name || state.players.length >= 8) return state;
      const player: Player = { id: crypto.randomUUID(), name, totalScore: 0 };
      return { ...state, players: [...state.players, player] };
    }

    case 'REMOVE_PLAYER':
      return { ...state, players: state.players.filter((p) => p.id !== action.id) };

    case 'REORDER_PLAYERS': {
      const byId = new Map(state.players.map((p) => [p.id, p]));
      const players = action.orderedIds.map((id) => byId.get(id)).filter((p): p is Player => !!p);
      if (players.length !== state.players.length) return state;
      return { ...state, players };
    }

    case 'START_GAME': {
      if (state.players.length < 1) return state;
      return startRound(state, action.raunchy);
    }

    case 'PASS_CATEGORY': {
      const { category, used } = pickCategory(state.usedCategories, action.raunchy);
      return {
        ...state,
        currentCategory: category,
        currentCategoryIsRaunchy: action.raunchy,
        usedCategories: used,
        categoryHistory: [...state.categoryHistory, state.currentCategory ?? ''],
      };
    }

    case 'GO_BACK_CATEGORY': {
      if (state.categoryHistory.length === 0) return state;
      const prev = state.categoryHistory[state.categoryHistory.length - 1];
      return {
        ...state,
        currentCategory: prev,
        currentCategoryIsRaunchy: (CATEGORIES_ADULT as string[]).includes(prev),
        categoryHistory: state.categoryHistory.slice(0, -1),
      };
    }

    case 'REROLL_LETTER':
      return { ...state, currentBonusLetter: randomBonusLetter() };

    case 'END_WRITING':
      return {
        ...state,
        phase: action.mode === 'manualScore' ? 'manualScore' : 'entry',
        entryPlayerIndex: 0,
      };

    case 'SUBMIT_ENTRY': {
      const roundEntries = { ...state.roundEntries, [action.playerId]: action.items };
      const nextIndex = state.entryPlayerIndex + 1;
      if (nextIndex < state.players.length) {
        return { ...state, roundEntries, entryPlayerIndex: nextIndex };
      }
      // No auto-scoring: every answer starts as "doesn't count" until the
      // host reviews that player and says otherwise (see SET_ITEM_COUNTS /
      // SUBMIT_PLAYER_SCORE). totalScore is untouched until then.
      const results = buildReviewResults(state.players, roundEntries);
      return {
        ...state,
        roundEntries,
        currentRoundResults: results,
        lastRoundWasManual: false,
        phase: 'scoring',
      };
    }

    case 'SUBMIT_MANUAL_SCORES': {
      // Undo whatever this round previously contributed before adding the new
      // values, so re-submitting after EDIT_ROUND_SCORES corrects totals
      // instead of double-counting (previous is [] on a first-time submit).
      const previous = state.currentRoundResults ?? [];
      const results = state.players.map((p) => ({
        playerId: p.id,
        items: [],
        subtotal: action.scores[p.id] ?? 0,
        appliedSubtotal: action.scores[p.id] ?? 0,
        submitted: true,
      }));
      const players = state.players.map((p) => {
        const prevSubtotal = previous.find((r) => r.playerId === p.id)?.subtotal ?? 0;
        const nextSubtotal = action.scores[p.id] ?? 0;
        return { ...p, totalScore: p.totalScore - prevSubtotal + nextSubtotal };
      });
      return {
        ...state,
        players,
        currentRoundResults: results,
        lastRoundWasManual: true,
        phase: 'dice',
      };
    }

    // Lets the host back out of the dice round to fix a mistake — routes to
    // whichever scoring screen this round actually used.
    case 'EDIT_ROUND_SCORES': {
      if (state.phase !== 'dice') return state;
      return { ...state, phase: state.lastRoundWasManual ? 'manualScore' : 'scoring', diceFace: null };
    }

    // Host reviewing one player's answers taps counts/doesn't per item; this
    // only updates the live (not-yet-applied) subtotal shown during review.
    case 'SET_ITEM_COUNTS': {
      const results = state.currentRoundResults;
      if (!results) return state;
      const nextResults = results.map((r) => {
        if (r.playerId !== action.playerId) return r;
        const items = r.items.map((item, i) =>
          i === action.itemIndex ? scoreItem(item, action.counts, state.currentBonusLetter ?? 'A') : item
        );
        const subtotal = items.reduce((sum, it) => sum + it.points, 0);
        return { ...r, items, subtotal };
      });
      return { ...state, currentRoundResults: nextResults };
    }

    // Host hits "Submit" after reviewing a player — applies that player's
    // live subtotal to their running total score (diffed against whatever
    // was applied last time, so re-submitting after further edits is safe).
    case 'SUBMIT_PLAYER_SCORE': {
      const results = state.currentRoundResults;
      if (!results) return state;
      const result = results.find((r) => r.playerId === action.playerId);
      if (!result) return state;
      const delta = result.subtotal - result.appliedSubtotal;
      const players = state.players.map((p) =>
        p.id === action.playerId ? { ...p, totalScore: p.totalScore + delta } : p
      );
      const nextResults = results.map((r) =>
        r.playerId === action.playerId ? { ...r, appliedSubtotal: r.subtotal, submitted: true } : r
      );
      return { ...state, players, currentRoundResults: nextResults };
    }

    case 'GO_TO_DICE':
      return { ...state, phase: 'dice' };

    case 'ROLL_DICE':
      return { ...state, diceFace: action.face };

    case 'CONFIRM_DICE_WINNERS': {
      const winnerIds = new Set(action.playerIds);
      const players = state.players.map((p) => (winnerIds.has(p.id) ? { ...p, totalScore: p.totalScore + 3 } : p));
      const record: RoundRecord = {
        roundNumber: state.roundNumber,
        category: state.currentCategory ?? '',
        bonusLetter: state.currentBonusLetter ?? '',
        results: state.currentRoundResults ?? [],
        manual: state.lastRoundWasManual,
        dieFace: state.diceFace,
        diceNominations: action.nominations,
        diceBonusPlayerIds: action.playerIds,
      };
      return {
        ...state,
        players,
        history: [...state.history, record],
        phase: 'roundEnd',
      };
    }

    case 'SKIP_DICE_BONUS': {
      const record: RoundRecord = {
        roundNumber: state.roundNumber,
        category: state.currentCategory ?? '',
        bonusLetter: state.currentBonusLetter ?? '',
        results: state.currentRoundResults ?? [],
        manual: state.lastRoundWasManual,
        dieFace: state.diceFace,
        diceNominations: {},
        diceBonusPlayerIds: [],
      };
      return { ...state, history: [...state.history, record], phase: 'roundEnd' };
    }

    case 'NEXT_ROUND':
      return startRound(state, action.raunchy);

    case 'END_GAME':
      return { ...state, phase: 'final' };

    case 'PLAY_ANOTHER_GAME': {
      const players = state.players.map((p) => ({ ...p, totalScore: 0 }));
      return startRound(
        { ...state, players, history: [], roundNumber: 0, justinPissedCount: 0 },
        action.raunchy
      );
    }

    case 'PLAY_AGAIN':
      return createInitialState();

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };

    case 'JUSTIN_GOT_PISSED':
      return { ...state, justinPissedCount: state.justinPissedCount + 1 };

    case 'LOAD_STATE': {
      // Old persisted states from before today's scoring rewrite won't have
      // appliedSubtotal/submitted on currentRoundResults — backfill them as
      // "already applied" (true for the old auto-scoring model, where a
      // saved subtotal always meant it was already added to totalScore) so
      // a leftover save can't NaN-corrupt scores via SUBMIT_PLAYER_SCORE.
      const currentRoundResults =
        action.state.currentRoundResults?.map((r) => ({
          ...r,
          appliedSubtotal: r.appliedSubtotal ?? r.subtotal ?? 0,
          submitted: r.submitted ?? true,
        })) ?? null;
      return {
        ...action.state,
        justinPissedCount: action.state.justinPissedCount ?? 0,
        currentRoundResults,
      };
    }

    default:
      return state;
  }
}
