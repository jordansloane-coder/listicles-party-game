import type { ItemScore, Player, PlayerRoundResult } from './types';

export function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

// The app never decides whether an answer counts — that's the host's call,
// made live during scoring (see SET_ITEM_COUNTS). This just turns each
// player's raw typed list into a review-ready shape: blanks are excluded
// from scoring outright (nothing to judge), everything else starts as "not
// counted yet" until the host says otherwise.
export function buildReviewResults(players: Player[], entries: Record<string, string[]>): PlayerRoundResult[] {
  return players.map((player) => {
    const items = entries[player.id] ?? [];
    const scored: ItemScore[] = items.map((raw) => {
      const norm = normalize(raw);
      if (!norm) return { text: raw, points: 0, status: 'blank' };
      return { text: raw, points: 0, status: 'duplicate' };
    });
    return { playerId: player.id, items: scored, subtotal: 0, appliedSubtotal: 0, submitted: false };
  });
}

// Recomputes one item's points/status from the host's counts/doesn't-count
// call — 3 points if the answer starts with the round's bonus letter, 1
// otherwise, or 0 if the host says it doesn't count.
export function scoreItem(item: ItemScore, counts: boolean, bonusLetter: string): ItemScore {
  if (item.status === 'blank') return item;
  if (!counts) return { ...item, status: 'duplicate', points: 0 };
  const startsWithBonus = normalize(item.text).startsWith(bonusLetter.toLowerCase());
  return { ...item, status: 'unique', points: startsWithBonus ? 3 : 1 };
}

export function randomBonusLetter(): string {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}
