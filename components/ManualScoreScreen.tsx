'use client';

import { useState } from 'react';
import type { Player } from '@/lib/types';

interface Props {
  players: Player[];
  category: string;
  onSubmit: (scores: Record<string, number>) => void;
}

export default function ManualScoreScreen({ players, category, onSubmit }: Props) {
  const [scores, setScores] = useState<Record<string, string>>({});

  function setScore(playerId: string, value: string) {
    setScores((prev) => ({ ...prev, [playerId]: value }));
  }

  function handleSubmit() {
    const parsed: Record<string, number> = {};
    for (const p of players) {
      const raw = scores[p.id];
      const n = raw ? parseInt(raw, 10) : 0;
      parsed[p.id] = Number.isFinite(n) ? n : 0;
    }
    onSubmit(parsed);
  }

  return (
    <div className="flex-1 flex flex-col px-5 py-8 gap-5 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <h2 className="text-2xl font-extrabold">Scorecard</h2>
        <p className="text-sm opacity-60">{category} — enter each player&apos;s total for this round</p>
      </div>

      <div className="flex flex-col gap-3">
        {players.map((p) => (
          <label key={p.id} className="flex items-center justify-between gap-3 rounded-2xl bg-card shadow px-4 py-3">
            <span className="font-bold text-lg">{p.name}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={scores[p.id] ?? ''}
              onChange={(e) => setScore(p.id, e.target.value)}
              placeholder="0"
              className="w-24 rounded-xl bg-background px-3 py-2 text-lg font-bold text-right shadow-inner outline-none ring-2 ring-transparent focus:ring-electric"
            />
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-auto w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
      >
        Save Scores →
      </button>
    </div>
  );
}
