'use client';

import type { Player } from '@/lib/types';

interface Props {
  players: Player[];
  roundNumber: number;
  onNextRound: () => void;
  onEndGame: () => void;
}

export default function RoundEndScreen({ players, roundNumber, onNextRound, onEndGame }: Props) {
  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <h2 className="text-2xl font-extrabold text-center animate-pop-in">Round {roundNumber} complete!</h2>

      <div className="w-full rounded-2xl bg-card shadow p-4 animate-pop-in">
        <p className="font-bold mb-2 text-sm uppercase tracking-wide opacity-50">Standings</p>
        <div className="flex flex-col gap-1.5">
          {sorted.map((p, i) => (
            <div key={p.id} className="flex justify-between items-center font-semibold">
              <span>
                {i === 0 ? '👑 ' : `${i + 1}. `}
                {p.name}
              </span>
              <span>{p.totalScore}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto w-full flex flex-col gap-3">
        <button
          onClick={onNextRound}
          className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
        >
          Next Round →
        </button>
        <button
          onClick={onEndGame}
          className="w-full rounded-2xl bg-card font-bold text-lg py-4 shadow active:scale-95 transition-transform"
        >
          End Game
        </button>
      </div>
    </div>
  );
}
