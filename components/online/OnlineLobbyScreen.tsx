'use client';

import { useState } from 'react';
import type { OnlineRoom } from '@/lib/onlineTypes';
import { startGame, updateSettings } from '@/lib/onlineRoom';

interface Props {
  room: OnlineRoom;
  isHost: boolean;
}

export default function OnlineLobbyScreen({ room, isHost }: Props) {
  const [busy, setBusy] = useState(false);
  const players = Object.entries(room.players);

  async function handleStart() {
    setBusy(true);
    try {
      await startGame(room.code, room);
    } finally {
      setBusy(false);
    }
  }

  function setField<K extends keyof typeof room.settings>(key: K, value: (typeof room.settings)[K]) {
    void updateSettings(room.code, { ...room.settings, [key]: value });
  }

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-5 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <p className="text-sm font-bold uppercase tracking-wide opacity-50">Room code</p>
        <h1 className="text-5xl font-extrabold text-hot tracking-widest">{room.code}</h1>
        <p className="mt-2 opacity-60 text-sm">Share this code — everyone joins from their own phone.</p>
      </div>

      <div className="w-full rounded-2xl bg-card shadow p-4">
        <p className="font-bold mb-3 text-sm uppercase tracking-wide opacity-50">
          Players ({players.length})
        </p>
        <div className="flex flex-col gap-2">
          {players.map(([id, p]) => (
            <div key={id} className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${p.connected ? 'bg-mint' : 'bg-hot/40'}`} />
                {p.name}
                {id === room.hostId && <span className="text-xs opacity-50 font-normal">(host)</span>}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <>
          <div className="w-full rounded-2xl bg-card shadow p-4 flex flex-col gap-3">
            <p className="font-bold text-sm uppercase tracking-wide opacity-50">Settings</p>
            <label className="flex items-center justify-between gap-3">
              <span className="font-semibold">Items per round</span>
              <input
                type="number"
                min={1}
                value={room.settings.itemsPerRound}
                onChange={(e) => setField('itemsPerRound', Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 rounded-xl bg-background px-3 py-2 text-lg font-bold text-right shadow-inner outline-none"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="font-semibold">Rounds per game</span>
              <input
                type="number"
                min={1}
                value={room.settings.roundsPerGame}
                onChange={(e) => setField('roundsPerGame', Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 rounded-xl bg-background px-3 py-2 text-lg font-bold text-right shadow-inner outline-none"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="font-semibold">Timer (seconds)</span>
              <input
                type="number"
                min={10}
                value={room.settings.roundSeconds}
                onChange={(e) => setField('roundSeconds', Math.max(10, parseInt(e.target.value, 10) || 10))}
                className="w-20 rounded-xl bg-background px-3 py-2 text-lg font-bold text-right shadow-inner outline-none"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span className="font-semibold">🌶️ Raunchy Mode</span>
              <input
                type="checkbox"
                checked={room.settings.raunchyMode}
                onChange={(e) => setField('raunchyMode', e.target.checked)}
                className="w-6 h-6 accent-hot"
              />
            </label>
          </div>

          <button
            onClick={handleStart}
            disabled={busy}
            className="mt-auto w-full rounded-2xl bg-hot text-white font-extrabold text-2xl py-5 shadow-lg disabled:opacity-40 active:scale-95 transition-transform"
          >
            {busy ? 'Starting…' : 'Start Game'}
          </button>
        </>
      ) : (
        <p className="mt-auto text-center opacity-60 py-8">Waiting for the host to start the game…</p>
      )}
    </div>
  );
}
