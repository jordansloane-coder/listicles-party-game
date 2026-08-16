import { CATEGORIES } from './categories';
import { CATEGORIES_ADULT } from './categoriesAdult';
import { randomBonusLetter, scoreRound } from './scoring';
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
  | { type: 'EDIT_MANUAL_SCORES' }
  | { type: 'TOGGLE_ITEM_STATUS'; playerId: string; itemIndex: number }
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
      const results = scoreRound(state.players, roundEntries, state.currentBonusLetter ?? 'A');
      const players = state.players.map((p) => {
        const result = results.find((r) => r.playerId === p.id);
        return result ? { ...p, totalScore: p.totalScore + result.subtotal } : p;
      });
      return {
        ...state,
        roundEntries,
        players,
        currentRoundResults: results,
        lastRoundWasManual: false,
        phase: 'scoring',
      };
    }

    case 'SUBMIT_MANUAL_SCORES': {
      // Undo whatever this round previously contributed before adding the new
      // values, so re-submitting after EDIT_MANUAL_SCORES corrects totals
      // instead of double-counting (previous is [] on a first-time submit).
      const previous = state.currentRoundResults ?? [];
      const results = state.players.map((p) => ({
        playerId: p.id,
        items: [],
        subtotal: action.scores[p.id] ?? 0,
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

    case 'EDIT_MANUAL_SCORES': {
      if (!state.lastRoundWasManual || state.phase !== 'dice') return state;
      return { ...state, phase: 'manualScore', diceFace: null };
    }

    // Lets the host overrule the auto-detected unique/duplicate call on a
    // single answer — flips it and recomputes that player's subtotal and
    // running total score to match.
    case 'TOGGLE_ITEM_STATUS': {
      const results = state.currentRoundResults;
      if (!results) return state;
      const bonus = (state.currentBonusLetter ?? 'A').toLowerCase();
      let delta = 0;
      const nextResults = results.map((r) => {
        if (r.playerId !== action.playerId) return r;
        const items = r.items.map((item, i) => {
          if (i !== action.itemIndex || item.status === 'blank') return item;
          if (item.status === 'unique') {
            delta -= item.points;
            return { ...item, status: 'duplicate' as const, points: 0 };
          }
          const points = item.text.trim().toLowerCase().startsWith(bonus) ? 3 : 1;
          delta += points;
          return { ...item, status: 'unique' as const, points };
        });
        const subtotal = items.reduce((sum, it) => sum + it.points, 0);
        return { ...r, items, subtotal };
      });
      const players = state.players.map((p) =>
        p.id === action.playerId ? { ...p, totalScore: p.totalScore + delta } : p
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

    case 'LOAD_STATE':
      // Old persisted states from before this field existed won't have it.
      return { ...action.state, justinPissedCount: action.state.justinPissedCount ?? 0 };

    default:
      return state;
  }
}
