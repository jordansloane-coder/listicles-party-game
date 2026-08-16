'use client';

import { useState } from 'react';
import { DIE_FACE_EMOJI, DIE_FACES, rollDie } from '@/lib/dice';
import type { DieFace } from '@/lib/types';
import type { OnlineRoom } from '@/lib/onlineTypes';
import { confirmDiceWinners, rollDice, skipDiceBonus } from '@/lib/onlineRoom';
import { playDiceRoll } from '@/lib/sound';

interface Props {
  room: OnlineRoom;
  isHost: boolean;
  soundEnabled: boolean;
}

export default function OnlineDiceScreen({ room, isHost, soundEnabled }: Props) {
  const [rolling, setRolling] = useState(false);
  const [displayFace, setDisplayFace] = useState<DieFace>(room.diceFace ?? 'Hot');
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
        void rollDice(room.code, result);
      }
    }, 80);
  }

  function uniqueAnswersFor(playerId: string): string[] {
    const result = room.currentRoundResults?.[playerId];
    return result?.items.filter((i) => i.status === 'unique' && i.text.trim()).map((i) => i.text) ?? [];
  }

  function toggleWinner(playerId: string) {
    setSelectedWinners((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  }

  const diceFace = room.diceFace;

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <h2 className="text-2xl font-extrabold text-center">Bonus Die</h2>
      <p className="text-center text-sm opacity-50 -mt-4">{room.currentCategory}</p>
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
        <span className="text-6xl">{DIE_FACE_EMOJI[diceFace ?? displayFace]}</span>
        <span className="font-extrabold text-xl">{diceFace ?? displayFace}</span>
      </div>

      {!isHost && (
        <p className="text-center opacity-50 text-sm">
          {diceFace ? "The host is collecting everyone's answers…" : 'Waiting for the host to roll…'}
        </p>
      )}

      {isHost && !diceFace && (
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={handleRoll}
            disabled={rolling}
            className="w-full rounded-2xl bg-electric text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform disabled:opacity-60"
          >
            {rolling ? 'Rolling…' : 'Roll the Bonus Die 🎲'}
          </button>
          {!rolling && (
            <button onClick={() => void skipDiceBonus(room.code)} className="text-sm opacity-50 underline py-2">
              Skip bonus round
            </button>
          )}
        </div>
      )}

      {isHost && diceFace && (
        <div className="w-full flex flex-col gap-4 animate-pop-in">
          <p className="text-center font-bold">
            Each player: pick your best &quot;{diceFace}&quot; answer, then check who wins
          </p>

          {Object.entries(room.players).map(([id, player]) => {
            const options = uniqueAnswersFor(id);
            const isWinner = selectedWinners.has(id);
            return (
              <div key={id} className={`rounded-2xl shadow p-3 flex flex-col gap-2 ${isWinner ? 'bg-sun/30' : 'bg-card'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">{player.name}</span>
                  <label className="flex items-center gap-1.5 text-sm font-bold shrink-0">
                    <input
                      type="checkbox"
                      checked={isWinner}
                      onChange={() => toggleWinner(id)}
                      className="w-5 h-5 accent-hot"
                    />
                    Winner
                  </label>
                </div>
                {options.length > 0 ? (
                  <select
                    value={nominations[id] ?? ''}
                    onChange={(e) => setNominations((prev) => ({ ...prev, [id]: e.target.value }))}
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
                    value={nominations[id] ?? ''}
                    onChange={(e) => setNominations((prev) => ({ ...prev, [id]: e.target.value }))}
                    placeholder="Which answer are they nominating?"
                    className="w-full rounded-xl bg-background px-3 py-2 text-sm shadow-inner outline-none"
                  />
                )}
              </div>
            );
          })}

          <button
            onClick={() => void confirmDiceWinners(room.code, room, Array.from(selectedWinners), nominations)}
            disabled={selectedWinners.size === 0}
            className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform disabled:opacity-40"
          >
            Confirm Winner{selectedWinners.size > 1 ? 's' : ''} (+3 each)
          </button>
          <button onClick={() => void skipDiceBonus(room.code)} className="text-sm opacity-50 underline py-2 self-center">
            No bonus this round
          </button>
        </div>
      )}
    </div>
  );
}
