'use client';

import type { OnlineRoom } from '@/lib/onlineTypes';
import { nextRound, showWinner } from '@/lib/onlineRoom';

interface Props {
  room: OnlineRoom;
  isHost: boolean;
}

export default function OnlineRoundEndScreen({ room, isHost }: Props) {
  const sorted = Object.values(room.players).sort((a, b) => b.totalScore - a.totalScore);
  const reachedTarget = room.roundNumber >= room.settings.roundsPerGame;

  const primaryClass =
    'w-full rounded-2xl text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform bg-hot';
  const secondaryClass =
    'w-full rounded-2xl font-bold text-lg py-4 shadow active:scale-95 transition-transform bg-card';

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <h2 className="text-2xl font-extrabold text-center animate-pop-in">
        Round {room.roundNumber} of {room.settings.roundsPerGame} complete!
      </h2>

      <div className="w-full rounded-2xl bg-card shadow p-4 animate-pop-in">
        <p className="font-bold mb-2 text-sm uppercase tracking-wide opacity-50">Standings</p>
        <div className="flex flex-col gap-1.5">
          {sorted.map((p, i) => (
            <div key={p.name} className="flex justify-between items-center font-semibold">
              <span>
                {i === 0 ? '👑 ' : `${i + 1}. `}
                {p.name}
              </span>
              <span>{p.totalScore}</span>
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <div className="mt-auto w-full flex flex-col gap-3">
          {reachedTarget ? (
            <>
              <button onClick={() => void showWinner(room.code)} className={primaryClass}>
                🏆 Show Me The Winner
              </button>
              <button onClick={() => void nextRound(room.code, room)} className={secondaryClass}>
                Play Another Round
              </button>
            </>
          ) : (
            <>
              <button onClick={() => void nextRound(room.code, room)} className={primaryClass}>
                Play Another Round →
              </button>
              <button onClick={() => void showWinner(room.code)} className={secondaryClass}>
                🏆 Show Me The Winner
              </button>
            </>
          )}
        </div>
      ) : (
        <p className="mt-auto text-center opacity-50 text-sm py-4">Waiting on the host…</p>
      )}
    </div>
  );
}
