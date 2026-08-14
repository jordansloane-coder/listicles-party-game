// Tiny dependency-free sound effects via Web Audio oscillators — no audio
// files to ship, just a couple of beeps for timer-end and score-reveal.

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

// Call synchronously inside a click handler so mobile browsers allow the
// context to actually produce sound later.
export function unlockSound(): void {
  const audioCtx = getContext();
  if (audioCtx && audioCtx.state === 'suspended') void audioCtx.resume();
}

function beep(freq: number, startOffset: number, duration: number, audioCtx: AudioContext): void {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const start = audioCtx.currentTime + startOffset;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playTimerEnd(enabled: boolean): void {
  if (!enabled) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  beep(440, 0, 0.15, audioCtx);
  beep(330, 0.18, 0.25, audioCtx);
}

export function playScoreReveal(enabled: boolean): void {
  if (!enabled) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  beep(523, 0, 0.1, audioCtx);
  beep(659, 0.1, 0.1, audioCtx);
  beep(784, 0.2, 0.2, audioCtx);
}

export function playDiceRoll(enabled: boolean): void {
  if (!enabled) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  for (let i = 0; i < 6; i++) {
    beep(200 + Math.random() * 300, i * 0.08, 0.06, audioCtx);
  }
}
