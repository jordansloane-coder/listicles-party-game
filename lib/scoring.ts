import type { ItemScore, Player, PlayerRoundResult } from './types';

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

// Scores every player's list for a round:
// - blank entries score 0 and don't count toward duplicate detection
// - an item written by exactly one player is "unique": 1 point, or 3 if it
//   starts with the round's bonus letter
// - an item written by two or more players is a "duplicate": 0 points,
//   regardless of the bonus letter
export function scoreRound(
  players: Player[],
  entries: Record<string, string[]>,
  bonusLetter: string
): PlayerRoundResult[] {
  const writerCount = new Map<string, Set<string>>();

  for (const player of players) {
    const items = entries[player.id] ?? [];
    const seenByThisPlayer = new Set<string>();
    for (const raw of items) {
      const norm = normalize(raw);
      if (!norm || seenByThisPlayer.has(norm)) continue;
      seenByThisPlayer.add(norm);
      if (!writerCount.has(norm)) writerCount.set(norm, new Set());
      writerCount.get(norm)!.add(player.id);
    }
  }

  const bonus = bonusLetter.toLowerCase();

  return players.map((player) => {
    const items = entries[player.id] ?? [];
    const scored: ItemScore[] = items.map((raw) => {
      const norm = normalize(raw);
      if (!norm) return { text: raw, points: 0, status: 'blank' };
      const writers = writerCount.get(norm)?.size ?? 0;
      if (writers >= 2) return { text: raw, points: 0, status: 'duplicate' };
      const startsWithBonus = norm.startsWith(bonus);
      return { text: raw, points: startsWithBonus ? 3 : 1, status: 'unique' };
    });
    const subtotal = scored.reduce((sum, item) => sum + item.points, 0);
    return { playerId: player.id, items: scored, subtotal };
  });
}

export function randomBonusLetter(): string {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}
