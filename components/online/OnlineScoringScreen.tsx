'use client';

import { useState } from 'react';
import type { OnlineRoom } from '@/lib/onlineTypes';
import { goToDice, justinGotPissed, setItemCounts, skipDiceBonus, submitPlayerScore } from '@/lib/onlineRoom';
import JustinPissedButton from '../JustinPissedButton';

interface Props {
  room: OnlineRoom;
  isHost: boolean;
}

export default function OnlineScoringScreen({ room, isHost }: Props) {
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const results = room.currentRoundResults ?? {};
  const players = Object.entries(room.players);

  if (!isHost) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 gap-4 max-w-md mx-auto w-full text-center">
        <h2 className="text-2xl font-extrabold">{room.currentCategory}</h2>
        <p className="opacity-60">The host is reviewing everyone's answers…</p>
        <JustinPissedButton count={room.justinPissedCount} onTap={() => void justinGotPissed(room.code)} />
      </div>
    );
  }

  const reviewingPlayer = reviewingId ? room.players[reviewingId] : null;
  const reviewingResult = reviewingId ? results[reviewingId] : null;

  if (reviewingPlayer && reviewingResult) {
    return (
      <div className="flex-1 flex flex-col px-5 py-8 gap-5 max-w-md mx-auto w-full">
        <button onClick={() => setReviewingId(null)} className="self-start text-sm font-bold opacity-60 underline">
          ← Players
        </button>

        <div className="text-center animate-pop-in">
          <h2 className="text-2xl font-extrabold">{reviewingPlayer.name}</h2>
          <p className="text-sm opacity-60">
            {room.currentCategory} · bonus letter {room.currentBonusLetter}
          </p>
          <span className="mt-2 inline-block rounded-full bg-electric/10 text-electric font-bold px-3 py-1 text-sm">
            {reviewingResult.subtotal} pts this round
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {reviewingResult.items.map((item, i) => (
            <div key={i} className="rounded-2xl bg-card shadow p-3">
              <p className="text-base font-semibold truncate mb-2">{item.text || <em className="opacity-40">blank</em>}</p>
              {item.status === 'blank' ? (
                <p className="text-sm opacity-40 text-center py-1">— nothing to score —</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => void setItemCounts(room.code, room, reviewingId!, i, true)}
                    className={`rounded-xl py-2.5 font-bold text-sm active:scale-95 transition-transform ${
                      item.status === 'unique' ? 'bg-mint text-white shadow' : 'bg-mint/10 text-mint'
                    }`}
                  >
                    ✓ Counts {item.status === 'unique' ? `(+${item.points})` : ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => void setItemCounts(room.code, room, reviewingId!, i, false)}
                    className={`rounded-xl py-2.5 font-bold text-sm active:scale-95 transition-transform ${
                      item.status === 'duplicate' ? 'bg-hot text-white shadow' : 'bg-hot/10 text-hot'
                    }`}
                  >
                    ✗ Doesn&apos;t count
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            void submitPlayerScore(room.code, room, reviewingId!);
            setReviewingId(null);
          }}
          className="mt-auto w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
        >
          Submit {reviewingPlayer.name}&apos;s Score
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-5 py-8 gap-5 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <h2 className="text-2xl font-extrabold">{room.currentCategory}</h2>
        <p className="text-sm opacity-60">
          Bonus letter: {room.currentBonusLetter} · tap a player to review and score their answers
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {players.map(([id, player]) => {
          const result = results[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => setReviewingId(id)}
              className="animate-pop-in flex items-center justify-between rounded-2xl bg-card shadow p-4 text-left active:scale-95 transition-transform"
            >
              <span className="font-extrabold text-lg">{player.name}</span>
              {result?.submitted ? (
                <span className="rounded-full bg-mint/15 text-mint font-bold px-3 py-1 text-sm">
                  ✅ {result.appliedSubtotal} pts
                </span>
              ) : (
                <span className="rounded-full bg-foreground/10 opacity-50 font-bold px-3 py-1 text-sm">
                  Not reviewed →
                </span>
              )}
            </button>
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

      <div className="mt-auto w-full flex flex-col gap-2">
        <button
          onClick={() => {
            const unreviewed = players.filter(([id]) => !results[id]?.submitted);
            if (
              unreviewed.length > 0 &&
              !window.confirm(
                `${unreviewed.map(([, p]) => p.name).join(', ')} ${unreviewed.length === 1 ? "hasn't" : "haven't"} been reviewed yet — they'll score 0 for this round. Continue anyway?`
              )
            ) {
              return;
            }
            void goToDice(room.code);
          }}
          className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
        >
          Submit Scores →
        </button>
        <button onClick={() => void skipDiceBonus(room.code)} className="text-sm opacity-50 underline py-2">
          Skip bonus round
        </button>
      </div>
    </div>
  );
}
