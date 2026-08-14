'use client';

import type { Player } from '@/lib/types';

interface Props {
  players: Player[];
  roundsPlayed: number;
  onPlayAgain: () => void;
}

export default function FinalScreen({ players, roundsPlayed, onPlayAgain }: Props) {
  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const winner = sorted[0];

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <p className="text-6xl mb-2">🏆</p>
        <h1 className="text-3xl font-extrabold">{winner?.name} wins!</h1>
        <p className="opacity-60 mt-1">
          {roundsPlayed} round{roundsPlayed === 1 ? '' : 's'} played
        </p>
      </div>

      <div className="w-full rounded-2xl bg-card shadow p-4 animate-pop-in">
        <p className="font-bold mb-3 text-sm uppercase tracking-wide opacity-50">Final Leaderboard</p>
        <div className="flex flex-col gap-2">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className={`flex justify-between items-center rounded-xl px-3 py-2.5 font-bold ${
                i === 0 ? 'bg-sun/20' : ''
              }`}
            >
              <span>
                {i === 0 ? '👑' : `${i + 1}.`} {p.name}
              </span>
              <span>{p.totalScore}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onPlayAgain}
        className="mt-auto w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
      >
        Play Again
      </button>
    </div>
  );
}
