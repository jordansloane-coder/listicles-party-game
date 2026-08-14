import { CATEGORIES } from './categories';
import { randomBonusLetter, scoreRound } from './scoring';
import type { DieFace, GameState, Player, RoundRecord } from './types';

export type Action =
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'START_GAME' }
  | { type: 'END_WRITING' }
  | { type: 'SUBMIT_ENTRY'; playerId: string; items: string[] }
  | { type: 'GO_TO_DICE' }
  | { type: 'ROLL_DICE'; face: DieFace }
  | { type: 'PICK_DICE_WINNER'; playerId: string }
  | { type: 'SKIP_DICE_BONUS' }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'PLAY_AGAIN' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'LOAD_STATE'; state: GameState };

export function createInitialState(): GameState {
  return {
    phase: 'setup',
    players: [],
    usedCategories: [],
    currentCategory: null,
    currentBonusLetter: null,
    roundNumber: 0,
    entryPlayerIndex: 0,
    roundEntries: {},
    currentRoundResults: null,
    diceFace: null,
    diceBonusPlayerId: null,
    history: [],
    soundEnabled: true,
  };
}

function pickCategory(used: string[]): { category: string; used: string[] } {
  let pool = CATEGORIES.filter((c) => !used.includes(c));
  let nextUsed = used;
  if (pool.length === 0) {
    // Every category has been played this session — reshuffle the pool
    // rather than stall the game.
    pool = CATEGORIES;
    nextUsed = [];
  }
  const category = pool[Math.floor(Math.random() * pool.length)];
  return { category, used: [...nextUsed, category] };
}

function startRound(state: GameState): GameState {
  const { category, used } = pickCategory(state.usedCategories);
  return {
    ...state,
    phase: 'writing',
    currentCategory: category,
    usedCategories: used,
    currentBonusLetter: randomBonusLetter(),
    roundNumber: state.roundNumber + 1,
    entryPlayerIndex: 0,
    roundEntries: {},
    currentRoundResults: null,
    diceFace: null,
    diceBonusPlayerId: null,
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

    case 'START_GAME': {
      if (state.players.length < 1) return state;
      return startRound(state);
    }

    case 'END_WRITING':
      return { ...state, phase: 'entry', entryPlayerIndex: 0 };

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
        phase: 'scoring',
      };
    }

    case 'GO_TO_DICE':
      return { ...state, phase: 'dice' };

    case 'ROLL_DICE':
      return { ...state, diceFace: action.face };

    case 'PICK_DICE_WINNER': {
      const players = state.players.map((p) =>
        p.id === action.playerId ? { ...p, totalScore: p.totalScore + 3 } : p
      );
      const record: RoundRecord = {
        roundNumber: state.roundNumber,
        category: state.currentCategory ?? '',
        bonusLetter: state.currentBonusLetter ?? '',
        results: state.currentRoundResults ?? [],
        dieFace: state.diceFace,
        diceBonusPlayerId: action.playerId,
      };
      return {
        ...state,
        players,
        diceBonusPlayerId: action.playerId,
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
        dieFace: state.diceFace,
        diceBonusPlayerId: null,
      };
      return { ...state, history: [...state.history, record], phase: 'roundEnd' };
    }

    case 'NEXT_ROUND':
      return startRound(state);

    case 'END_GAME':
      return { ...state, phase: 'final' };

    case 'PLAY_AGAIN':
      return createInitialState();

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}
