'use client';

import { useState } from 'react';
import { DIE_FACE_EMOJI, DIE_FACES, rollDie } from '@/lib/dice';
import type { DieFace, Player } from '@/lib/types';
import { playDiceRoll } from '@/lib/sound';

interface Props {
  players: Player[];
  diceFace: DieFace | null;
  soundEnabled: boolean;
  onRoll: (face: DieFace) => void;
  onPickWinner: (playerId: string) => void;
  onSkip: () => void;
}

export default function DiceScreen({ players, diceFace, soundEnabled, onRoll, onPickWinner, onSkip }: Props) {
  const [rolling, setRolling] = useState(false);
  const [displayFace, setDisplayFace] = useState<DieFace>(diceFace ?? 'Hot');

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

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <h2 className="text-2xl font-extrabold text-center">Bonus Die</h2>
      <p className="text-center opacity-60 text-sm">
        Roll the die, then decide together whose answer best fits the result. They get +3 bonus points.
      </p>

      <div
        className={`w-40 h-40 rounded-3xl bg-card shadow-lg flex flex-col items-center justify-center gap-2 ${
          rolling ? 'animate-dice-spin' : 'animate-pop-in'
        }`}
      >
        <span className="text-6xl">{DIE_FACE_EMOJI[displayFace]}</span>
        <span className="font-extrabold text-xl">{displayFace}</span>
      </div>

      {!diceFace && (
        <button
          onClick={handleRoll}
          disabled={rolling}
          className="w-full rounded-2xl bg-electric text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform disabled:opacity-60"
        >
          {rolling ? 'Rolling…' : 'Roll the Bonus Die 🎲'}
        </button>
      )}

      {diceFace && (
        <div className="w-full flex flex-col gap-2 animate-pop-in">
          <p className="text-center font-bold">Who earns the &quot;{diceFace}&quot; bonus?</p>
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => onPickWinner(p.id)}
              className="w-full rounded-2xl bg-card shadow px-4 py-4 text-lg font-semibold text-left active:scale-95 transition-transform"
            >
              {p.name} <span className="opacity-50 text-sm">+3 pts</span>
            </button>
          ))}
          <button onClick={onSkip} className="text-sm opacity-50 underline py-2">
            No bonus this round
          </button>
        </div>
      )}
    </div>
  );
}
