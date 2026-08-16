'use client';

import { useState } from 'react';
import { DIE_FACE_EMOJI, DIE_FACES, rollDie } from '@/lib/dice';
import type { DieFace, Player, PlayerRoundResult } from '@/lib/types';
import { playDiceRoll } from '@/lib/sound';

interface Props {
  players: Player[];
  category: string;
  diceFace: DieFace | null;
  soundEnabled: boolean;
  currentRoundResults: PlayerRoundResult[] | null;
  canEditScores: boolean;
  onRoll: (face: DieFace) => void;
  onConfirmWinners: (playerIds: string[], nominations: Record<string, string>) => void;
  onSkip: () => void;
  onEditScores: () => void;
}

export default function DiceScreen({
  players,
  category,
  diceFace,
  soundEnabled,
  currentRoundResults,
  canEditScores,
  onRoll,
  onConfirmWinners,
  onSkip,
  onEditScores,
}: Props) {
  const [rolling, setRolling] = useState(false);
  const [displayFace, setDisplayFace] = useState<DieFace>(diceFace ?? 'Hot');
  const [nominations, setNominations] = useState<Record<string, string>>({});
  const [selectedWinners, setSelectedWinners] = useState<Set<string>>(new Set());

  function handleRoll() {
    setRolling(true);
    playDiceRoll(soundEnabled);
    let ticks = 0;
    const interval = window.setInterval(() => {
      setDisplayFace(DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)]);
      ticks++;
      if (ticks > 10) {
        window.clearInterval(interval);
        const result = rollDie();
        setDisplayFace(result);
        setRolling(false);
        onRoll(result);
      }
    }, 80);
  }

  function uniqueAnswersFor(playerId: string): string[] {
    const result = currentRoundResults?.find((r) => r.playerId === playerId);
    return result?.items.filter((i) => i.status === 'unique' && i.text.trim()).map((i) => i.text) ?? [];
  }

  function setNomination(playerId: string, text: string) {
    setNominations((prev) => ({ ...prev, [playerId]: text }));
  }

  function toggleWinner(playerId: string) {
    setSelectedWinners((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <h2 className="text-2xl font-extrabold text-center">Bonus Die</h2>
      <p className="text-center text-sm opacity-50 -mt-4">{category}</p>
      {canEditScores && (
        <button onClick={onEditScores} className="text-sm font-bold text-hot underline -mt-2">
          ✎ Fix a score for this round
        </button>
      )}
      {!diceFace && (
        <p className="text-center opacity-60 text-sm">
          Roll the die, then everyone picks one of their scoring answers that best fits the result. The group votes
          on the winner for +3 bonus points.
        </p>
      )}

      <div
        className={`w-40 h-40 rounded-3xl bg-card shadow-lg flex flex-col items-center justify-center gap-2 ${
          rolling ? 'animate-dice-spin' : 'animate-pop-in'
        }`}
      >
        <span className="text-6xl">{DIE_FACE_EMOJI[displayFace]}</span>
        <span className="font-extrabold text-xl">{displayFace}</span>
      </div>

      {!diceFace && (
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="w-full rounded-2xl bg-electric text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform disabled:opacity-60"
          >
            {rolling ? 'Rolling…' : 'Roll the Bonus Die 🎲'}
          </button>
          {!rolling && (
            <button onClick={onSkip} className="text-sm opacity-50 underline py-2">
              Skip bonus round
            </button>
          )}
        </div>
      )}

      {diceFace && (
        <div className="w-full flex flex-col gap-4 animate-pop-in">
          <p className="text-center font-bold">
            Each player: pick your best &quot;{diceFace}&quot; answer, then check who wins
          </p>

          {players.map((player) => {
            const options = uniqueAnswersFor(player.id);
            const isWinner = selectedWinners.has(player.id);
            return (
              <div key={player.id} className={`rounded-2xl shadow p-3 flex flex-col gap-2 ${isWinner ? 'bg-sun/30' : 'bg-card'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{player.name}</span>
                  <label className="flex items-center gap-1.5 text-sm font-bold shrink-0">
                    <input
                      type="checkbox"
                      checked={isWinner}
                      onChange={() => toggleWinner(player.id)}
                      className="w-5 h-5 accent-hot"
                    />
                    Winner
                  </label>
                </div>
                {options.length > 0 ? (
                  <select
                    value={nominations[player.id] ?? ''}
                    onChange={(e) => setNomination(player.id, e.target.value)}
                    className="w-full rounded-xl bg-background px-3 py-2 text-sm shadow-inner outline-none"
                  >
                    <option value="">— choose an answer —</option>
                    {options.map((text) => (
                      <option key={text} value={text}>
                        {text}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={nominations[player.id] ?? ''}
                    onChange={(e) => setNomination(player.id, e.target.value)}
                    placeholder="Which answer are they nominating?"
                    className="w-full rounded-xl bg-background px-3 py-2 text-sm shadow-inner outline-none"
                  />
                )}
              </div>
            );
          })}

          <button
            onClick={() => onConfirmWinners(Array.from(selectedWinners), nominations)}
            disabled={selectedWinners.size === 0}
            className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform disabled:opacity-40"
          >
            Confirm Winner{selectedWinners.size > 1 ? 's' : ''} (+3 each)
          </button>
          <button onClick={onSkip} className="text-sm opacity-50 underline py-2 self-center">
            No bonus this round
          </button>
        </div>
      )}
    </div>
  );
}
