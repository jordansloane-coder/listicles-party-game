'use client';

import { useEffect, useState } from 'react';
import { subscribeRoom, leaveRoom } from '@/lib/onlineRoom';
import type { OnlineRoom } from '@/lib/onlineTypes';
import OnlineEntryScreen from './OnlineEntryScreen';
import OnlineLobbyScreen from './OnlineLobbyScreen';
import OnlineWritingScreen from './OnlineWritingScreen';
import OnlineScoringScreen from './OnlineScoringScreen';
import OnlineDiceScreen from './OnlineDiceScreen';
import OnlineRoundEndScreen from './OnlineRoundEndScreen';
import OnlineFinalScreen from './OnlineFinalScreen';
import RoomHeader from './RoomHeader';

interface Props {
  onExit: () => void;
}

const SESSION_KEY = 'listicles-online-session';

interface Session {
  code: string;
  playerId: string;
}

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export default function OnlineGame({ onExit }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [room, setRoom] = useState<OnlineRoom | null | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(loadSession());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!session) return;
    const unsub = subscribeRoom(session.code, setRoom);
    return unsub;
  }, [session]);

  function handleJoined(code: string, playerId: string) {
    const next = { code, playerId };
    saveSession(next);
    setSession(next);
  }

  function handleLeave() {
    if (session) void leaveRoom(session.code, session.playerId);
    saveSession(null);
    setSession(null);
    setRoom(undefined);
    onExit();
  }

  if (!hydrated) return null;

  if (!session) {
    return <OnlineEntryScreen onJoined={handleJoined} onBack={onExit} />;
  }

  // Room still loading for the first time.
  if (room === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="opacity-50">Connecting…</p>
      </div>
    );
  }

  // Room vanished (host closed it, or the code was wrong somehow).
  if (room === null) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 text-center">
        <p className="text-4xl">👋</p>
        <p className="font-bold">This room isn&apos;t available anymore.</p>
        <button onClick={handleLeave} className="text-sm font-bold text-electric underline">
          Back to start
        </button>
      </div>
    );
  }

  const isHost = room.hostId === session.playerId;
  const players = Object.values(room.players);
  const connectedCount = players.filter((p) => p.connected).length;

  return (
    <div className="flex-1 flex flex-col">
      <RoomHeader code={room.code} connectedCount={connectedCount} totalCount={players.length} onLeave={handleLeave} />

      {room.phase === 'lobby' && <OnlineLobbyScreen room={room} isHost={isHost} />}
      {room.phase === 'writing' && <OnlineWritingScreen room={room} playerId={session.playerId} isHost={isHost} />}
      {room.phase === 'scoring' && <OnlineScoringScreen room={room} isHost={isHost} />}
      {room.phase === 'dice' && <OnlineDiceScreen room={room} isHost={isHost} soundEnabled />}
      {room.phase === 'roundEnd' && <OnlineRoundEndScreen room={room} isHost={isHost} />}
      {room.phase === 'final' && <OnlineFinalScreen room={room} isHost={isHost} onLeave={handleLeave} />}
    </div>
  );
}
