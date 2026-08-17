import { ref, get, set, update, onValue, onDisconnect, runTransaction } from 'firebase/database';
import { ensureSignedIn, getFirebaseDb } from './firebase';
import { generateRoomCode } from './roomCode';
import { CATEGORIES } from './categories';
import { CATEGORIES_ADULT } from './categoriesAdult';
import { normalize, randomBonusLetter, scoreItem } from './scoring';
import type { DieFace } from './types';
import { DEFAULT_ONLINE_SETTINGS, type OnlinePlayer, type OnlineRoom, type OnlineSettings } from './onlineTypes';

const MAX_PLAYERS = 8;
const MAX_CREATE_ATTEMPTS = 5;

function roomRef(code: string) {
  return ref(getFirebaseDb(), `rooms/${code}`);
}

function pickCategory(used: string[], raunchy: boolean): { category: string; usedCategories: string[] } {
  const source = raunchy ? CATEGORIES_ADULT : CATEGORIES;
  let pool = source.filter((c) => !used.includes(c));
  let nextUsed = used;
  if (pool.length === 0) {
    pool = source;
    nextUsed = [];
  }
  const category = pool[Math.floor(Math.random() * pool.length)];
  return { category, usedCategories: [...nextUsed, category] };
}

function freshRoundPlayers(players: Record<string, OnlinePlayer>): Record<string, OnlinePlayer> {
  const next: Record<string, OnlinePlayer> = {};
  for (const [id, p] of Object.entries(players)) next[id] = { ...p, currentAnswers: null };
  return next;
}

// ---- Create / join / presence ----

export async function createRoom(
  hostName: string,
  settings: OnlineSettings = DEFAULT_ONLINE_SETTINGS
): Promise<{ code: string; playerId: string }> {
  const playerId = await ensureSignedIn();
  const db = getFirebaseDb();

  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
    const code = generateRoomCode();
    const snap = await get(roomRef(code));
    if (snap.exists()) continue;

    const room: OnlineRoom = {
      code,
      hostId: playerId,
      createdAt: Date.now(),
      settings,
      phase: 'lobby',
      players: {
        [playerId]: { name: hostName, joinedAt: Date.now(), connected: true, totalScore: 0, currentAnswers: null },
      },
      currentCategory: null,
      currentCategoryIsRaunchy: false,
      currentBonusLetter: null,
      roundNumber: 0,
      usedCategories: [],
      timerDeadline: null,
      timerRemainingWhenPaused: null,
      timerEverStarted: false,
      currentRoundResults: null,
      diceFace: null,
      diceNominations: {},
      diceBonusPlayerIds: [],
      justinPissedCount: 0,
    };
    await set(roomRef(code), room);
    onDisconnect(ref(db, `rooms/${code}/players/${playerId}/connected`)).set(false);
    return { code, playerId };
  }
  throw new Error('Could not find a free room code — please try again.');
}

export async function joinRoom(
  codeInput: string,
  playerName: string
): Promise<{ code: string; playerId: string } | { error: string }> {
  const playerId = await ensureSignedIn();
  const code = codeInput.toUpperCase();
  const snap = await get(roomRef(code));
  if (!snap.exists()) return { error: 'No room with that code — double-check and try again.' };
  const room = snap.val() as OnlineRoom;

  if (room.players[playerId]) {
    // Already in this room (e.g. reconnect after a refresh) — just mark connected.
    await update(ref(getFirebaseDb(), `rooms/${code}/players/${playerId}`), { connected: true });
  } else {
    if (room.phase !== 'lobby') return { error: 'This game already started — ask the host for a new code.' };
    if (Object.keys(room.players).length >= MAX_PLAYERS) return { error: 'This room is full (8 players max).' };
    await set(ref(getFirebaseDb(), `rooms/${code}/players/${playerId}`), {
      name: playerName,
      joinedAt: Date.now(),
      connected: true,
      totalScore: 0,
      currentAnswers: null,
    } satisfies OnlinePlayer);
  }
  onDisconnect(ref(getFirebaseDb(), `rooms/${code}/players/${playerId}/connected`)).set(false);
  return { code, playerId };
}

export function subscribeRoom(code: string, onChange: (room: OnlineRoom | null) => void): () => void {
  const unsub = onValue(roomRef(code), (snap) => onChange(snap.exists() ? (snap.val() as OnlineRoom) : null));
  return unsub;
}

export async function leaveRoom(code: string, playerId: string): Promise<void> {
  await update(ref(getFirebaseDb(), `rooms/${code}/players/${playerId}`), { connected: false });
}

export async function removePlayer(code: string, playerId: string): Promise<void> {
  await set(ref(getFirebaseDb(), `rooms/${code}/players/${playerId}`), null);
}

// ---- Guest action: submit this device's answers for the round ----

export async function submitAnswers(code: string, playerId: string, answers: string[]): Promise<void> {
  await set(ref(getFirebaseDb(), `rooms/${code}/players/${playerId}/currentAnswers`), answers);
}

// ---- Host actions: everything below mutates game-flow state ----

export async function updateSettings(code: string, settings: OnlineSettings): Promise<void> {
  await update(roomRef(code), { settings });
}

async function startRound(code: string, room: OnlineRoom): Promise<void> {
  const { category, usedCategories } = pickCategory(room.usedCategories, room.settings.raunchyMode);
  await update(roomRef(code), {
    phase: 'writing',
    currentCategory: category,
    currentCategoryIsRaunchy: room.settings.raunchyMode,
    currentBonusLetter: randomBonusLetter(),
    usedCategories,
    roundNumber: room.roundNumber + 1,
    timerDeadline: null,
    timerRemainingWhenPaused: null,
    timerEverStarted: false,
    currentRoundResults: null,
    diceFace: null,
    diceNominations: {},
    diceBonusPlayerIds: [],
    players: freshRoundPlayers(room.players),
  });
}

export async function startGame(code: string, room: OnlineRoom): Promise<void> {
  await startRound(code, { ...room, roundNumber: 0, usedCategories: [] });
}

export async function passCategory(code: string, room: OnlineRoom, raunchy?: boolean): Promise<void> {
  const wantRaunchy = raunchy ?? room.settings.raunchyMode;
  const { category, usedCategories } = pickCategory(room.usedCategories, wantRaunchy);
  await update(roomRef(code), {
    currentCategory: category,
    currentCategoryIsRaunchy: wantRaunchy,
    usedCategories,
  });
}

export async function rerollLetter(code: string): Promise<void> {
  await update(roomRef(code), { currentBonusLetter: randomBonusLetter() });
}

export async function startTimer(code: string, seconds: number): Promise<void> {
  await update(roomRef(code), {
    timerDeadline: Date.now() + seconds * 1000,
    timerRemainingWhenPaused: null,
    timerEverStarted: true,
  });
}

export async function pauseTimer(code: string, remainingSeconds: number): Promise<void> {
  await update(roomRef(code), { timerDeadline: null, timerRemainingWhenPaused: remainingSeconds });
}

export async function resumeTimer(code: string, remainingSeconds: number): Promise<void> {
  await update(roomRef(code), { timerDeadline: Date.now() + remainingSeconds * 1000, timerRemainingWhenPaused: null });
}

export async function resetTimer(code: string): Promise<void> {
  await update(roomRef(code), { timerDeadline: null, timerRemainingWhenPaused: null, timerEverStarted: false });
}

// Host collects whatever every player has submitted so far (unsubmitted
// players score as a blank list, same as leaving paper blank). No
// auto-scoring: every answer starts as "doesn't count" until the host
// reviews that player and says otherwise (see setItemCounts /
// submitPlayerScore). Player totalScores are untouched until then.
export async function finishWriting(code: string, room: OnlineRoom): Promise<void> {
  const resultsByPlayer: OnlineRoom['currentRoundResults'] = {};
  for (const [id, p] of Object.entries(room.players)) {
    const items = (p.currentAnswers ?? []).map((raw) => {
      const norm = normalize(raw);
      if (!norm) return { text: raw, points: 0, status: 'blank' as const };
      return { text: raw, points: 0, status: 'duplicate' as const };
    });
    resultsByPlayer![id] = { items, subtotal: 0, appliedSubtotal: 0, submitted: false };
  }

  await update(roomRef(code), {
    phase: 'scoring',
    currentRoundResults: resultsByPlayer,
  });
}

// Host reviewing one player's answers taps counts/doesn't per item; this
// only updates the live (not-yet-applied) subtotal shown during review.
export async function setItemCounts(
  code: string,
  room: OnlineRoom,
  playerId: string,
  itemIndex: number,
  counts: boolean
): Promise<void> {
  const result = room.currentRoundResults?.[playerId];
  if (!result) return;

  const items = result.items.map((item, i) =>
    i === itemIndex ? scoreItem(item, counts, room.currentBonusLetter ?? 'A') : item
  );
  const subtotal = items.reduce((sum, it) => sum + it.points, 0);

  await update(roomRef(code), {
    [`currentRoundResults/${playerId}/items`]: items,
    [`currentRoundResults/${playerId}/subtotal`]: subtotal,
  });
}

// Host hits "Submit" after reviewing a player — applies that player's live
// subtotal to their running total score (diffed against whatever was
// applied last time, so re-submitting after further edits is safe).
export async function submitPlayerScore(code: string, room: OnlineRoom, playerId: string): Promise<void> {
  const result = room.currentRoundResults?.[playerId];
  const player = room.players[playerId];
  if (!result || !player) return;

  const delta = result.subtotal - result.appliedSubtotal;
  await update(roomRef(code), {
    [`currentRoundResults/${playerId}/appliedSubtotal`]: result.subtotal,
    [`currentRoundResults/${playerId}/submitted`]: true,
    [`players/${playerId}/totalScore`]: player.totalScore + delta,
  });
}

export async function goToDice(code: string): Promise<void> {
  await update(roomRef(code), { phase: 'dice' });
}

// Lets the host back out of the dice round to fix a scoring mistake.
export async function returnToScoring(code: string): Promise<void> {
  await update(roomRef(code), { phase: 'scoring', diceFace: null, diceNominations: {}, diceBonusPlayerIds: [] });
}

export async function rollDice(code: string, face: DieFace): Promise<void> {
  await update(roomRef(code), { diceFace: face });
}

export async function confirmDiceWinners(
  code: string,
  room: OnlineRoom,
  playerIds: string[],
  nominations: Record<string, string>
): Promise<void> {
  const updatedPlayers: Record<string, OnlinePlayer> = {};
  for (const id of playerIds) {
    const existing = room.players[id];
    if (existing) updatedPlayers[id] = { ...existing, totalScore: existing.totalScore + 3 };
  }
  await update(roomRef(code), {
    phase: 'roundEnd',
    diceNominations: nominations,
    diceBonusPlayerIds: playerIds,
    players: { ...room.players, ...updatedPlayers },
  });
}

export async function skipDiceBonus(code: string): Promise<void> {
  await update(roomRef(code), { phase: 'roundEnd', diceNominations: {}, diceBonusPlayerIds: [] });
}

export async function nextRound(code: string, room: OnlineRoom): Promise<void> {
  await startRound(code, room);
}

export async function showWinner(code: string): Promise<void> {
  await update(roomRef(code), { phase: 'final' });
}

export async function playAnotherGame(code: string, room: OnlineRoom): Promise<void> {
  const resetPlayers: Record<string, OnlinePlayer> = {};
  for (const [id, p] of Object.entries(room.players)) resetPlayers[id] = { ...p, totalScore: 0, currentAnswers: null };
  await startRound(code, { ...room, players: resetPlayers, roundNumber: 0, usedCategories: [] });
}

export async function justinGotPissed(code: string): Promise<void> {
  await runTransaction(ref(getFirebaseDb(), `rooms/${code}/justinPissedCount`), (current: number | null) => (current ?? 0) + 1);
}

export async function closeRoom(code: string): Promise<void> {
  await set(roomRef(code), null);
}
