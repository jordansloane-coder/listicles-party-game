'use client';

import type { OnlineRoom } from '@/lib/onlineTypes';
import { goToDice, justinGotPissed, skipDiceBonus, toggleItemStatus } from '@/lib/onlineRoom';
import JustinPissedButton from '../JustinPissedButton';

interface Props {
  room: OnlineRoom;
  isHost: boolean;
}

export default function OnlineScoringScreen({ room, isHost }: Props) {
  const results = room.currentRoundResults ?? {};

  return (
    <div className="flex-1 flex flex-col px-5 py-8 gap-5 max-w-3xl mx-auto w-full">
      <div className="text-center animate-pop-in">
        <h2 className="text-2xl font-extrabold">{room.currentCategory}</h2>
        <p className="text-sm opacity-60">
          Bonus letter: {room.currentBonusLetter} · green = counts, red = doesn&apos;t
          {isHost ? ' · tap an answer to change it' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(room.players).map(([id, player]) => {
          const result = results[id];
          if (!result) return null;
          return (
            <div key={id} className="animate-pop-in rounded-2xl bg-card shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-extrabold text-lg">{player.name}</span>
                <span className="rounded-full bg-electric/10 text-electric font-bold px-3 py-1 text-sm">
                  +{result.subtotal} this round
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {result.items.map((item, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      disabled={!isHost || item.status === 'blank'}
                      onClick={() => void toggleItemStatus(room.code, room, id, i)}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-left transition-transform active:scale-95 ${
                        item.status === 'unique'
                          ? 'bg-mint/15'
                          : item.status === 'duplicate'
                            ? 'bg-hot/10 text-hot'
                            : 'opacity-40'
                      } ${isHost && item.status !== 'blank' ? 'cursor-pointer' : ''}`}
                    >
                      <span className="truncate">{item.text || <em>blank</em>}</span>
                      <span className="font-bold shrink-0 ml-2">
                        {item.status === 'blank' ? '—' : `+${item.points}`}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-card shadow p-4 animate-pop-in">
        <p className="font-bold mb-2 text-sm uppercase tracking-wide opacity-50">Running totals</p>
        <div className="flex flex-col gap-1">
          {Object.values(room.players)
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((p) => (
              <div key={p.name} className="flex justify-between font-semibold">
                <span>{p.name}</span>
                <span>{p.totalScore}</span>
              </div>
            ))}
        </div>
      </div>

      <JustinPissedButton count={room.justinPissedCount} onTap={() => void justinGotPissed(room.code)} />

      {isHost ? (
        <div className="mt-auto w-full flex flex-col gap-2">
          <button
            onClick={() => void goToDice(room.code)}
            className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
          >
            Roll the Bonus Die →
          </button>
          <button onClick={() => void skipDiceBonus(room.code)} className="text-sm opacity-50 underline py-2">
            Skip bonus round
          </button>
        </div>
      ) : (
        <p className="mt-auto text-center opacity-50 text-sm py-4">Waiting on the host…</p>
      )}
    </div>
  );
}
