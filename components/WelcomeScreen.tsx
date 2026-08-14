'use client';

import { useEffect, useState } from 'react';
import type { Player } from '@/lib/types';
import { DEFAULT_FREQUENT_PLAYERS, loadFrequentPlayers, saveFrequentPlayers } from '@/lib/frequentPlayers';

interface Props {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onStart: () => void;
  onClear: () => void;
}

export default function WelcomeScreen({ players, onAddPlayer, onRemovePlayer, onStart, onClear }: Props) {
  const [name, setName] = useState('');
  const [frequentPlayers, setFrequentPlayers] = useState<string[]>(DEFAULT_FREQUENT_PLAYERS);
  const [newFrequentName, setNewFrequentName] = useState('');

  useEffect(() => {
    setFrequentPlayers(loadFrequentPlayers());
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || players.length >= 8) return;
    onAddPlayer(name);
    setName('');
  }

  function isSelected(frequentName: string): boolean {
    return players.some((p) => p.name === frequentName);
  }

  function toggleFrequent(frequentName: string) {
    const existing = players.find((p) => p.name === frequentName);
    if (existing) {
      onRemovePlayer(existing.id);
    } else {
      onAddPlayer(frequentName);
    }
  }

  function selectAll() {
    for (const frequentName of frequentPlayers) {
      if (!isSelected(frequentName)) onAddPlayer(frequentName);
    }
  }

  function addToFrequentList(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newFrequentName.trim();
    if (!trimmed || frequentPlayers.includes(trimmed)) return;
    const next = [...frequentPlayers, trimmed];
    setFrequentPlayers(next);
    saveFrequentPlayers(next);
    setNewFrequentName('');
  }

  function removeFromFrequentList(frequentName: string) {
    const next = frequentPlayers.filter((n) => n !== frequentName);
    setFrequentPlayers(next);
    saveFrequentPlayers(next);
  }

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <h1 className="text-5xl font-extrabold text-hot drop-shadow-sm">Listicles</h1>
        <p className="mt-2 text-lg opacity-70">Ridiculous lists. Real bragging rights. Justin getting pissed.</p>
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

      <details className="w-full rounded-2xl bg-card shadow overflow-hidden">
        <summary className="cursor-pointer select-none px-4 py-3 font-bold flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
          <span>👥 Frequent players</span>
          <span className="opacity-50">▾</span>
        </summary>
        <div className="px-4 pb-4 flex flex-col gap-1 border-t border-black/5">
          <button onClick={selectAll} className="self-start mt-3 mb-1 text-sm font-bold text-electric underline">
            Select all
          </button>
          {frequentPlayers.map((frequentName) => (
            <div key={frequentName} className="flex items-center justify-between gap-2 py-1.5">
              <label className="flex items-center gap-3 font-semibold flex-1">
                <input
                  type="checkbox"
                  checked={isSelected(frequentName)}
                  onChange={() => toggleFrequent(frequentName)}
                  className="w-5 h-5 accent-hot shrink-0"
                />
                {frequentName}
              </label>
              <button
                onClick={() => removeFromFrequentList(frequentName)}
                aria-label={`Remove ${frequentName} from frequent players list`}
                className="text-xs opacity-40 underline shrink-0"
              >
                remove
              </button>
            </div>
          ))}
          {frequentPlayers.length === 0 && <p className="text-sm opacity-50 py-2">No frequent players saved yet.</p>}

          <form onSubmit={addToFrequentList} className="flex gap-2 mt-3">
            <input
              value={newFrequentName}
              onChange={(e) => setNewFrequentName(e.target.value)}
              placeholder="Add a name to this list"
              className="flex-1 rounded-xl bg-background px-3 py-2 text-sm shadow-inner outline-none ring-2 ring-transparent focus:ring-electric"
              maxLength={20}
            />
            <button
              type="submit"
              disabled={!newFrequentName.trim()}
              className="rounded-xl bg-electric text-white font-bold px-3 py-2 text-sm shadow disabled:opacity-40"
            >
              + Add
            </button>
          </form>
        </div>
      </details>

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
