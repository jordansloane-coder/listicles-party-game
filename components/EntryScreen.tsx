'use client';

import { useEffect, useRef, useState } from 'react';
import type { Player } from '@/lib/types';

interface Props {
  player: Player;
  playerIndex: number;
  totalPlayers: number;
  category: string;
  bonusLetter: string;
  onSubmit: (items: string[]) => void;
}

const ITEM_COUNT = 7;

export default function EntryScreen({ player, playerIndex, totalPlayers, category, bonusLetter, onSubmit }: Props) {
  const [items, setItems] = useState<string[]>(() => Array(ITEM_COUNT).fill(''));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setItems(Array(ITEM_COUNT).fill(''));
    inputRefs.current[0]?.focus();
  }, [player.id]);

  function updateItem(index: number, value: string) {
    setItems((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handlePaste(index: number, e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData('text');
    if (!text.includes('\n')) return; // let normal single-line paste happen
    e.preventDefault();
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    setItems((prev) => {
      const next = [...prev];
      for (let i = 0; i < lines.length && index + i < ITEM_COUNT; i++) {
        next[index + i] = lines[i];
      }
      return next;
    });
    const lastFilled = Math.min(index + lines.length, ITEM_COUNT) - 1;
    requestAnimationFrame(() => inputRefs.current[lastFilled]?.focus());
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (index < ITEM_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    } else {
      handleSubmit();
    }
  }

  function handleSubmit() {
    onSubmit(items);
  }

  return (
    <div className="flex-1 flex flex-col px-5 py-8 gap-4 max-w-md mx-auto w-full">
      <p className="text-center text-sm font-bold uppercase tracking-wide opacity-50">
        Player {playerIndex + 1} of {totalPlayers}
      </p>
      <div className="text-center animate-pop-in">
        <h2 className="text-2xl font-extrabold">Pass the phone to</h2>
        <p className="text-3xl font-extrabold text-hot">{player.name}</p>
        <p className="mt-2 text-sm opacity-60">
          {category} · Bonus letter: <span className="font-bold">{bonusLetter}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {items.map((value, i) => (
          <label key={i} className="flex items-center gap-3">
            <span className="w-8 text-right text-sm font-bold opacity-40">{i + 1}.</span>
            <input
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              value={value}
              onChange={(e) => updateItem(i, e.target.value)}
              onPaste={(e) => handlePaste(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              placeholder={`Item ${i + 1}`}
              className="flex-1 rounded-xl bg-card px-3 py-3 text-base shadow-inner outline-none ring-2 ring-transparent focus:ring-electric"
            />
          </label>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-auto w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
      >
        Submit {player.name}&apos;s List
      </button>
    </div>
  );
}
