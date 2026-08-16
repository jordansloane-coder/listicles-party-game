'use client';

import type { OnlineRoom } from '@/lib/onlineTypes';
import { playAnotherGame } from '@/lib/onlineRoom';

interface Props {
  room: OnlineRoom;
  isHost: boolean;
  onLeave: () => void;
}

export default function OnlineFinalScreen({ room, isHost, onLeave }: Props) {
  const sorted = Object.values(room.players).sort((a, b) => b.totalScore - a.totalScore);
  const winner = sorted[0];

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <p className="text-6xl mb-2">🏆</p>
        <h1 className="text-3xl font-extrabold">{winner?.name} wins!</h1>
        <p className="opacity-60 mt-1">{room.roundNumber} round{room.roundNumber === 1 ? '' : 's'} played</p>
      </div>

      <div className="w-full rounded-2xl bg-card shadow p-4 animate-pop-in">
        <p className="font-bold mb-3 text-sm uppercase tracking-wide opacity-50">Final Leaderboard</p>
        <div className="flex flex-col gap-2">
          {sorted.map((p, i) => (
            <div
              key={p.name}
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

      {room.justinPissedCount > 0 && (
        <p className="text-center font-bold text-sm opacity-60 animate-pop-in">
          🎉 Justin got pissed {room.justinPissedCount} time{room.justinPissedCount === 1 ? '' : 's'} this game
        </p>
      )}

      <div className="mt-auto w-full flex flex-col gap-3">
        {isHost && (
          <button
            onClick={() => void playAnotherGame(room.code, room)}
            className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
          >
            Play Another Game
          </button>
        )}
        <button
          onClick={onLeave}
          className="w-full rounded-2xl bg-card font-bold text-lg py-4 shadow active:scale-95 transition-transform"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
}
