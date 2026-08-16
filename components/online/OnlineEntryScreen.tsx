'use client';

import { useState } from 'react';
import { isFirebaseConfigured } from '@/lib/firebase';
import { createRoom, joinRoom } from '@/lib/onlineRoom';
import { normalizeRoomCode } from '@/lib/roomCode';

interface Props {
  onJoined: (code: string, playerId: string) => void;
  onBack: () => void;
}

type Step = 'choose' | 'host' | 'join';

export default function OnlineEntryScreen({ onJoined, onBack }: Props) {
  const [step, setStep] = useState<Step>('choose');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isFirebaseConfigured()) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 gap-4 max-w-md mx-auto w-full text-center">
        <p className="text-4xl">🌐</p>
        <h2 className="text-xl font-extrabold">Online play isn&apos;t set up yet</h2>
        <p className="opacity-60 text-sm">
          This device hasn&apos;t been configured with a Firebase project, so there&apos;s no shared server to sync
          through yet. Ask whoever set up the app to finish that step.
        </p>
        <button onClick={onBack} className="mt-4 text-sm font-bold text-electric underline">
          ← Back
        </button>
      </div>
    );
  }

  async function handleHost() {
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const { code: newCode, playerId } = await createRoom(name.trim());
      onJoined(newCode, playerId);
    } catch (err) {
      setError((err as Error).message || 'Could not create a room — check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!name.trim() || code.trim().length < 4) return;
    setBusy(true);
    setError(null);
    try {
      const result = await joinRoom(normalizeRoomCode(code), name.trim());
      if ('error' in result) {
        setError(result.error);
      } else {
        onJoined(result.code, result.playerId);
      }
    } catch (err) {
      setError((err as Error).message || 'Could not join — check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (step === 'choose') {
    return (
      <div className="flex-1 flex flex-col items-center px-5 py-8 gap-6 max-w-md mx-auto w-full">
        <div className="text-center animate-pop-in">
          <h1 className="text-3xl font-extrabold text-hot">Play Online</h1>
          <p className="mt-2 opacity-70">Everyone joins from their own phone — no passing required.</p>
        </div>
        <div className="w-full flex flex-col gap-3 mt-4">
          <button
            onClick={() => setStep('host')}
            className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
          >
            🎉 Host a New Game
          </button>
          <button
            onClick={() => setStep('join')}
            className="w-full rounded-2xl bg-electric text-white font-extrabold text-xl py-5 shadow-lg active:scale-95 transition-transform"
          >
            🔑 Join with a Code
          </button>
        </div>
        <button onClick={onBack} className="mt-auto text-sm opacity-50 underline py-2">
          ← Back to solo mode
        </button>
      </div>
    );
  }

  const isHost = step === 'host';

  return (
    <div className="flex-1 flex flex-col items-center px-5 py-8 gap-5 max-w-md mx-auto w-full">
      <div className="text-center animate-pop-in">
        <h2 className="text-2xl font-extrabold">{isHost ? 'Host a Game' : 'Join a Game'}</h2>
        <p className="opacity-60 text-sm mt-1">
          {isHost ? "You'll get a code to share with everyone else." : 'Ask the host for their room code.'}
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {!isHost && (
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ROOM CODE"
            maxLength={4}
            className="w-full rounded-2xl bg-card px-4 py-4 text-2xl font-extrabold tracking-widest text-center uppercase shadow-inner outline-none ring-2 ring-transparent focus:ring-electric"
          />
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={20}
          className="w-full rounded-2xl bg-card px-4 py-4 text-lg shadow-inner outline-none ring-2 ring-transparent focus:ring-electric"
        />
      </div>

      {error && <p className="text-hot text-sm font-semibold text-center">{error}</p>}

      <button
        onClick={isHost ? handleHost : handleJoin}
        disabled={busy || !name.trim() || (!isHost && code.trim().length < 4)}
        className="w-full rounded-2xl bg-hot text-white font-extrabold text-xl py-5 shadow-lg disabled:opacity-40 active:scale-95 transition-transform"
      >
        {busy ? 'One sec…' : isHost ? 'Create Room →' : 'Join Room →'}
      </button>

      <button onClick={() => setStep('choose')} className="mt-auto text-sm opacity-50 underline py-2">
        ← Back
      </button>
    </div>
  );
}
