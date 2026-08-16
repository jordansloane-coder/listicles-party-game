'use client';

import { useEffect, useRef, useState } from 'react';
import type { Player } from '@/lib/types';
import { DEFAULT_FREQUENT_PLAYERS, loadFrequentPlayers, saveFrequentPlayers } from '@/lib/frequentPlayers';

interface Props {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onReorderPlayers: (orderedIds: string[]) => void;
  onStart: () => void;
  onClear: () => void;
}

// How long a press must hold before it becomes a drag, so a quick tap (e.g. on
// the remove button) never gets mistaken for the start of a reorder.
const LONG_PRESS_MS = 220;
// If the finger/mouse moves more than this before the long-press timer fires,
// treat it as a scroll attempt and cancel the drag instead of starting one.
const MOVE_CANCEL_PX = 8;

interface DragState {
  id: string;
  startY: number;
  pressTimer: number | null;
  pointerId: number;
}

export default function WelcomeScreen({
  players,
  onAddPlayer,
  onRemovePlayer,
  onReorderPlayers,
  onStart,
  onClear,
}: Props) {
  const [name, setName] = useState('');
  const [frequentPlayers, setFrequentPlayers] = useState<string[]>(DEFAULT_FREQUENT_PLAYERS);
  const [newFrequentName, setNewFrequentName] = useState('');

  const [order, setOrder] = useState<string[]>(() => players.map((p) => p.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const dragState = useRef<DragState | null>(null);

  useEffect(() => {
    setFrequentPlayers(loadFrequentPlayers());
  }, []);

  // Keep local render order in sync with the players prop (adds/removes),
  // preserving whatever order is already on screen for ids that persist.
  useEffect(() => {
    setOrder((prev) => {
      const incomingIds = players.map((p) => p.id);
      const stillPresent = prev.filter((id) => incomingIds.includes(id));
      const newOnes = incomingIds.filter((id) => !stillPresent.includes(id));
      const merged = [...stillPresent, ...newOnes];
      return merged.length === incomingIds.length ? merged : incomingIds;
    });
  }, [players]);

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

  function handlePointerDown(id: string, e: React.PointerEvent<HTMLLIElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const startY = e.clientY;
    const timer = window.setTimeout(() => {
      setDraggingId(id);
      setDragOffset(0);
      try {
        rowRefs.current.get(id)?.setPointerCapture(e.pointerId);
      } catch {
        // Pointer may no longer be active (e.g. the OS already cancelled the
        // gesture) — the drag still works via document-level move tracking.
      }
    }, LONG_PRESS_MS);
    dragState.current = { id, startY, pressTimer: timer, pointerId: e.pointerId };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLLIElement>) {
    const ds = dragState.current;
    if (!ds) return;
    const deltaY = e.clientY - ds.startY;

    if (!draggingId) {
      if (Math.abs(deltaY) > MOVE_CANCEL_PX && ds.pressTimer) {
        window.clearTimeout(ds.pressTimer);
        dragState.current = null;
      }
      return;
    }

    e.preventDefault();
    setDragOffset(deltaY);

    const draggedIndex = order.indexOf(draggingId);
    const rows = order.map((id) => rowRefs.current.get(id));
    const draggedEl = rows[draggedIndex];
    if (!draggedEl) return;
    const draggedRect = draggedEl.getBoundingClientRect();
    const draggedCenter = draggedRect.top + draggedRect.height / 2 + deltaY;

    let newIndex = draggedIndex;
    rows.forEach((row, i) => {
      if (!row || i === draggedIndex) return;
      const rect = row.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      if (i < draggedIndex && draggedCenter < center) newIndex = Math.min(newIndex, i);
      if (i > draggedIndex && draggedCenter > center) newIndex = Math.max(newIndex, i);
    });

    if (newIndex !== draggedIndex) {
      setOrder((prev) => {
        const next = [...prev];
        const [moved] = next.splice(draggedIndex, 1);
        next.splice(newIndex, 0, moved);
        return next;
      });
      ds.startY = e.clientY;
      setDragOffset(0);
    }
  }

  function endDrag() {
    const ds = dragState.current;
    if (ds?.pressTimer) window.clearTimeout(ds.pressTimer);
    if (draggingId) onReorderPlayers(order);
    dragState.current = null;
    setDraggingId(null);
    setDragOffset(0);
  }

  const orderedPlayers = order.map((id) => players.find((p) => p.id === id)).filter((p): p is Player => !!p);

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

      {players.length > 0 && (
        <p className="text-xs opacity-40 -mb-3 self-start">Press and hold a player to drag them into a new order.</p>
      )}

      <ul className="w-full flex flex-col gap-2">
        {orderedPlayers.map((p, i) => {
          const isDragging = draggingId === p.id;
          return (
            <li
              key={p.id}
              ref={(el) => {
                if (el) rowRefs.current.set(p.id, el);
                else rowRefs.current.delete(p.id);
              }}
              onPointerDown={(e) => handlePointerDown(p.id, e)}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{
                touchAction: 'none',
                transform: isDragging ? `translateY(${dragOffset}px) scale(1.03)` : undefined,
                zIndex: isDragging ? 10 : undefined,
              }}
              className={`animate-pop-in flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow select-none cursor-grab active:cursor-grabbing ${
                isDragging ? 'shadow-xl relative' : ''
              }`}
            >
              <span className="flex items-center gap-2 font-semibold text-lg">
                <span className="opacity-30 text-sm">⠿</span>
                {i + 1}. {p.name}
              </span>
              <button
                onClick={() => onRemovePlayer(p.id)}
                aria-label={`Remove ${p.name}`}
                className="w-9 h-9 rounded-full bg-hot/10 text-hot font-bold text-lg shrink-0"
              >
                ×
              </button>
            </li>
          );
        })}
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
