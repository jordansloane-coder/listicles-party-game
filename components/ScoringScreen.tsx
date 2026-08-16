'use client';

import type { Player, PlayerRoundResult } from '@/lib/types';
import JustinPissedButton from './JustinPissedButton';

interface Props {
  players: Player[];
  results: PlayerRoundResult[];
  category: string;
  bonusLetter: string;
  justinPissedCount: number;
  onJustinPissed: () => void;
  onContinue: () => void;
  onSkipBonus: () => void;
  onToggleItem: (playerId: string, itemIndex: number) => void;
}

export default function ScoringScreen({
  players,
  results,
  category,
  bonusLetter,
  justinPissedCount,
  onJustinPissed,
  onContinue,
  onSkipBonus,
  onToggleItem,
}: Props) {
  return (
    <div className="flex-1 flex flex-col px-5 py-8 gap-5 max-w-3xl mx-auto w-full">
      <div className="text-center animate-pop-in">
        <h2 className="text-2xl font-extrabold">{category}</h2>
        <p className="text-sm opacity-60">
          Bonus letter: {bonusLetter} · green = counts, red = doesn&apos;t · tap an answer to change it
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {players.map((player) => {
          const result = results.find((r) => r.playerId === player.id);
          if (!result) return null;
          return (
            <div key={player.id} className="animate-pop-in rounded-2xl bg-card shadow p-4">
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
                      disabled={item.status === 'blank'}
                      onClick={() => onToggleItem(player.id, i)}
                      className={`w-full flex items-center justify-between rounded-lg px-3 py-1.5 text-sm text-left transition-transform active:scale-95 ${
                        item.status === 'unique'
                          ? 'bg-mint/15'
                          : item.status === 'duplicate'
                            ? 'bg-hot/10 text-hot'
                            : 'opacity-40'
                      } ${item.status === 'blank' ? '' : 'cursor-pointer'}`}
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
          {[...players]
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((p) => (
              <div key={p.id} className="flex justify-between font-semibold">
                <span>{p.name}</span>
                <span>{p.totalScore}</span>
              </div>
            ))}
        </div>
      </div>

      <JustinPissedButton count={justinPissedCount} onTap={onJustinPissed} />

      <div className="mt-auto w-full flex flex-col gap-2">
        <button
          onClick={onContinue}
          className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
        >
          Roll the Bonus Die →
        </button>
        <button onClick={onSkipBonus} className="text-sm opacity-50 underline py-2">
          Skip bonus round
        </button>
      </div>
    </div>
  );
}
