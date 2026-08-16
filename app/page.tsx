'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { createInitialState, gameReducer } from '@/lib/gameReducer';
import { clearGameState, loadGameState, saveGameState } from '@/lib/storage';
import { playScoreReveal, playTimerEnd, unlockSound } from '@/lib/sound';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '@/lib/settings';
import { appendToHistory, clearHistory, loadHistory, type BankedGame } from '@/lib/history';
import type { Player } from '@/lib/types';
import Header from '@/components/Header';
import WelcomeScreen from '@/components/WelcomeScreen';
import WritingScreen from '@/components/WritingScreen';
import EntryScreen from '@/components/EntryScreen';
import ManualScoreScreen from '@/components/ManualScoreScreen';
import ScoringScreen from '@/components/ScoringScreen';
import DiceScreen from '@/components/DiceScreen';
import RoundEndScreen from '@/components/RoundEndScreen';
import FinalScreen from '@/components/FinalScreen';
import SettingsPanel from '@/components/SettingsPanel';
import HistoryPanel from '@/components/HistoryPanel';
import RulesPanel from '@/components/RulesPanel';
import PrintScorecardPanel from '@/components/PrintScorecardPanel';

function rankPlayers(players: Player[]): BankedGame['results'] {
  const sorted = [...players].sort((a, b) => b.totalScore - a.totalScore);
  return sorted.map((p) => ({
    name: p.name,
    score: p.totalScore,
    rank: 1 + sorted.filter((o) => o.totalScore > p.totalScore).length,
  }));
}

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);
  const hydrated = useRef(false);

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<BankedGame[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  useEffect(() => {
    const saved = loadGameState();
    if (saved) dispatch({ type: 'LOAD_STATE', state: saved });
    setSettings(loadSettings());
    setHistory(loadHistory());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
        navigator.serviceWorker.register(`${basePath}/sw.js`, { scope: `${basePath}/` }).catch(() => {});
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

  function updateSettings(next: Settings) {
    setSettings(next);
    saveSettings(next);
  }

  function resetGame() {
    if (!confirm('Clear the current game and start over?')) return;
    clearGameState();
    dispatch({ type: 'PLAY_AGAIN' });
  }

  function handleShowWinner() {
    const categories = Array.from(new Set(state.history.map((r) => r.category)));
    appendToHistory({
      roundsPlayed: state.roundNumber,
      categories,
      results: rankPlayers(state.players),
    });
    setHistory(loadHistory());
    dispatch({ type: 'END_GAME' });
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header
        soundEnabled={state.soundEnabled}
        onToggleSound={() => dispatch({ type: 'TOGGLE_SOUND' })}
        onOpenSettings={() => setShowSettings(true)}
        onReset={state.phase !== 'setup' ? resetGame : undefined}
      />

      {state.phase === 'setup' && (
        <WelcomeScreen
          players={state.players}
          onAddPlayer={(name) => dispatch({ type: 'ADD_PLAYER', name })}
          onRemovePlayer={(id) => dispatch({ type: 'REMOVE_PLAYER', id })}
          onReorderPlayers={(orderedIds) => dispatch({ type: 'REORDER_PLAYERS', orderedIds })}
          onStart={() => dispatch({ type: 'START_GAME', raunchy: settings.raunchyMode })}
          onClear={() => {
            clearGameState();
            dispatch({ type: 'PLAY_AGAIN' });
          }}
        />
      )}

      {state.phase === 'writing' && state.currentCategory && state.currentBonusLetter && (
        <WritingScreen
          key={state.currentCategory}
          category={state.currentCategory}
          bonusLetter={state.currentBonusLetter}
          roundNumber={state.roundNumber}
          roundsPerGame={settings.roundsPerGame}
          roundSeconds={settings.roundSeconds}
          itemsPerRound={settings.itemsPerRound}
          manualScoringDefault={settings.manualScoringDefault}
          isRaunchyCategory={state.currentCategoryIsRaunchy}
          raunchySettingOn={settings.raunchyMode}
          hasPreviousCategory={state.categoryHistory.length > 0}
          onExpire={(mode) => {
            playTimerEnd(state.soundEnabled);
            dispatch({ type: 'END_WRITING', mode });
          }}
          onSkip={(mode) => dispatch({ type: 'END_WRITING', mode })}
          onPass={() => dispatch({ type: 'PASS_CATEGORY', raunchy: settings.raunchyMode })}
          onGetRaunchyOne={() => dispatch({ type: 'PASS_CATEGORY', raunchy: true })}
          onGoBack={() => dispatch({ type: 'GO_BACK_CATEGORY' })}
          onRerollLetter={() => dispatch({ type: 'REROLL_LETTER' })}
        />
      )}

      {state.phase === 'entry' && state.currentCategory && state.currentBonusLetter && (
        <EntryScreen
          player={state.players[state.entryPlayerIndex]}
          playerIndex={state.entryPlayerIndex}
          totalPlayers={state.players.length}
          category={state.currentCategory}
          bonusLetter={state.currentBonusLetter}
          itemsPerRound={settings.itemsPerRound}
          onSubmit={(items) =>
            dispatch({ type: 'SUBMIT_ENTRY', playerId: state.players[state.entryPlayerIndex].id, items })
          }
        />
      )}

      {state.phase === 'manualScore' && state.currentCategory && (
        <ManualScoreScreen
          players={state.players}
          category={state.currentCategory}
          existingResults={state.currentRoundResults}
          justinPissedCount={state.justinPissedCount}
          onJustinPissed={() => dispatch({ type: 'JUSTIN_GOT_PISSED' })}
          onSubmit={(scores) => dispatch({ type: 'SUBMIT_MANUAL_SCORES', scores })}
        />
      )}

      {state.phase === 'scoring' && state.currentRoundResults && state.currentCategory && state.currentBonusLetter && (
        <ScoringScreen
          players={state.players}
          results={state.currentRoundResults}
          category={state.currentCategory}
          bonusLetter={state.currentBonusLetter}
          justinPissedCount={state.justinPissedCount}
          onJustinPissed={() => dispatch({ type: 'JUSTIN_GOT_PISSED' })}
          onContinue={() => dispatch({ type: 'GO_TO_DICE' })}
          onSkipBonus={() => dispatch({ type: 'SKIP_DICE_BONUS' })}
        />
      )}

      {state.phase === 'dice' && (
        <DiceScreen
          players={state.players}
          category={state.currentCategory ?? ''}
          diceFace={state.diceFace}
          soundEnabled={state.soundEnabled}
          currentRoundResults={state.currentRoundResults}
          canEditScores={state.lastRoundWasManual}
          onRoll={(face) => {
            unlockSound();
            dispatch({ type: 'ROLL_DICE', face });
          }}
          onConfirmWinners={(playerIds, nominations) =>
            dispatch({ type: 'CONFIRM_DICE_WINNERS', playerIds, nominations })
          }
          onSkip={() => dispatch({ type: 'SKIP_DICE_BONUS' })}
          onEditScores={() => dispatch({ type: 'EDIT_MANUAL_SCORES' })}
        />
      )}

      {state.phase === 'roundEnd' && (
        <RoundEndScreen
          players={state.players}
          roundNumber={state.roundNumber}
          roundsPerGame={settings.roundsPerGame}
          onNextRound={() => dispatch({ type: 'NEXT_ROUND', raunchy: settings.raunchyMode })}
          onShowWinner={handleShowWinner}
        />
      )}

      {state.phase === 'final' && (
        <FinalScreen
          players={state.players}
          roundsPlayed={state.roundNumber}
          justinPissedCount={state.justinPissedCount}
          onPlayAnotherGame={() => dispatch({ type: 'PLAY_ANOTHER_GAME', raunchy: settings.raunchyMode })}
          onNewPlayers={() => {
            clearGameState();
            dispatch({ type: 'PLAY_AGAIN' });
          }}
        />
      )}

      {showSettings && (
        <SettingsPanel
          settings={settings}
          onChange={updateSettings}
          onClose={() => setShowSettings(false)}
          onOpenRules={() => {
            setShowSettings(false);
            setShowRules(true);
          }}
          onOpenHistory={() => {
            setShowSettings(false);
            setShowHistory(true);
          }}
          onOpenPrint={() => {
            setShowSettings(false);
            setShowPrint(true);
          }}
        />
      )}

      {showHistory && (
        <HistoryPanel
          games={history}
          onClear={() => {
            clearHistory();
            setHistory([]);
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showRules && <RulesPanel onClose={() => setShowRules(false)} />}

      {showPrint && (
        <PrintScorecardPanel defaultItems={settings.itemsPerRound} onClose={() => setShowPrint(false)} />
      )}
    </div>
  );
}
