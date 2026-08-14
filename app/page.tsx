'use client';

import { useEffect, useReducer, useRef } from 'react';
import { createInitialState, gameReducer } from '@/lib/gameReducer';
import { clearGameState, loadGameState, saveGameState } from '@/lib/storage';
import { playScoreReveal, playTimerEnd, unlockSound } from '@/lib/sound';
import Header from '@/components/Header';
import WelcomeScreen from '@/components/WelcomeScreen';
import WritingScreen from '@/components/WritingScreen';
import EntryScreen from '@/components/EntryScreen';
import ScoringScreen from '@/components/ScoringScreen';
import DiceScreen from '@/components/DiceScreen';
import RoundEndScreen from '@/components/RoundEndScreen';
import FinalScreen from '@/components/FinalScreen';

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const hydrated = useRef(false);

  useEffect(() => {
    const saved = loadGameState();
    if (saved) dispatch({ type: 'LOAD_STATE', state: saved });
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  useEffect(() => {
    // iOS only lets an AudioContext produce sound if it's resumed inside a
    // user gesture. Unlocking on the very first tap anywhere means it's
    // already running by the time the round timer auto-expires later with
    // no gesture at all.
    function unlock() {
      unlockSound();
      document.removeEventListener('pointerdown', unlock);
    }
    document.addEventListener('pointerdown', unlock);
    return () => document.removeEventListener('pointerdown', unlock);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveGameState(state);
  }, [state]);

  useEffect(() => {
    if (state.phase === 'scoring') playScoreReveal(state.soundEnabled);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  function resetGame() {
    if (!confirm('Clear the current game and start over?')) return;
    clearGameState();
    dispatch({ type: 'PLAY_AGAIN' });
  }

  const showHeader = state.phase !== 'entry'; // keep entry screen distraction-free while a player is typing

  return (
    <div className="flex-1 flex flex-col">
      {showHeader && (
        <Header
          soundEnabled={state.soundEnabled}
          onToggleSound={() => dispatch({ type: 'TOGGLE_SOUND' })}
          onReset={state.phase !== 'setup' ? resetGame : undefined}
        />
      )}

      {state.phase === 'setup' && (
        <WelcomeScreen
          players={state.players}
          onAddPlayer={(name) => dispatch({ type: 'ADD_PLAYER', name })}
          onRemovePlayer={(id) => dispatch({ type: 'REMOVE_PLAYER', id })}
          onStart={() => dispatch({ type: 'START_GAME' })}
          onClear={() => {
            clearGameState();
            dispatch({ type: 'PLAY_AGAIN' });
          }}
        />
      )}

      {state.phase === 'writing' && state.currentCategory && state.currentBonusLetter && (
        <WritingScreen
          category={state.currentCategory}
          bonusLetter={state.currentBonusLetter}
          roundNumber={state.roundNumber}
          onExpire={() => {
            playTimerEnd(state.soundEnabled);
            dispatch({ type: 'END_WRITING' });
          }}
          onSkip={() => dispatch({ type: 'END_WRITING' })}
        />
      )}

      {state.phase === 'entry' && state.currentCategory && state.currentBonusLetter && (
        <EntryScreen
          player={state.players[state.entryPlayerIndex]}
          playerIndex={state.entryPlayerIndex}
          totalPlayers={state.players.length}
          category={state.currentCategory}
          bonusLetter={state.currentBonusLetter}
          onSubmit={(items) =>
            dispatch({ type: 'SUBMIT_ENTRY', playerId: state.players[state.entryPlayerIndex].id, items })
          }
        />
      )}

      {state.phase === 'scoring' && state.currentRoundResults && state.currentCategory && state.currentBonusLetter && (
        <ScoringScreen
          players={state.players}
          results={state.currentRoundResults}
          category={state.currentCategory}
          bonusLetter={state.currentBonusLetter}
          onContinue={() => dispatch({ type: 'GO_TO_DICE' })}
          onSkipBonus={() => dispatch({ type: 'SKIP_DICE_BONUS' })}
        />
      )}

      {state.phase === 'dice' && (
        <DiceScreen
          players={state.players}
          diceFace={state.diceFace}
          soundEnabled={state.soundEnabled}
          onRoll={(face) => {
            unlockSound();
            dispatch({ type: 'ROLL_DICE', face });
          }}
          onPickWinner={(playerId) => dispatch({ type: 'PICK_DICE_WINNER', playerId })}
          onSkip={() => dispatch({ type: 'SKIP_DICE_BONUS' })}
        />
      )}

      {state.phase === 'roundEnd' && (
        <RoundEndScreen
          players={state.players}
          roundNumber={state.roundNumber}
          onNextRound={() => dispatch({ type: 'NEXT_ROUND' })}
          onEndGame={() => dispatch({ type: 'END_GAME' })}
        />
      )}

      {state.phase === 'final' && (
        <FinalScreen
          players={state.players}
          roundsPlayed={state.roundNumber}
          onPlayAgain={() => {
            clearGameState();
            dispatch({ type: 'PLAY_AGAIN' });
          }}
        />
      )}
    </div>
  );
}
