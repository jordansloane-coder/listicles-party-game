'use client';

import { useState } from 'react';
import type { Player } from '@/lib/types';

interface Props {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onStart: () => void;
  onClear: () => void;
}

export default function WelcomeScreen({ players, onAddPlayer, onRemovePlayer, onStart, onClear }: Props) {
  const [name, setName] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || players.length >= 8) return;
    onAddPlayer(name);
    setName('');
  }

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <h1 className="text-5xl font-extrabold text-hot drop-shadow-sm">Listicles</h1>
        <p className="mt-2 text-lg opacity-70">Ridiculous lists. Real bragging rights.</p>
      </div>

      <form onSubmit={submit} className="w-full flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Player name"
          className="flex-1 rounded-2xl bg-card px-4 py-4 text-lg shadow-inner outline-none ring-2 ring-transparent focus:ring-electric"
          maxLength={20}
        />
        <button
          type="submit"
          disabled={!name.trim() || players.length >= 8}
          className="rounded-2xl bg-electric text-white font-bold px-6 py-4 text-lg shadow disabled:opacity-40"
        >
          Add
        </button>
      </form>

      <ul className="w-full flex flex-col gap-2">
        {players.map((p, i) => (
          <li
            key={p.id}
            className="animate-pop-in flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow"
          >
            <span className="font-semibold text-lg">
              {i + 1}. {p.name}
            </span>
            <button
              onClick={() => onRemovePlayer(p.id)}
              aria-label={`Remove ${p.name}`}
              className="w-9 h-9 rounded-full bg-hot/10 text-hot font-bold text-lg"
            >
              ×
            </button>
          </li>
        ))}
        {players.length === 0 && (
          <p className="text-center opacity-50 py-4">Add at least 1 player to start.</p>
        )}
      </ul>

      <div className="mt-auto w-full flex flex-col gap-3">
        <button
          onClick={onStart}
          disabled={players.length < 1}
          className="w-full rounded-2xl bg-hot text-white font-extrabold text-2xl py-5 shadow-lg disabled:opacity-40 active:scale-95 transition-transform"
        >
          Start Game
        </button>
        {players.length > 0 && (
          <button onClick={onClear} className="text-sm opacity-50 underline py-2">
            Clear all players
          </button>
        )}
      </div>
    </div>
  );
}
