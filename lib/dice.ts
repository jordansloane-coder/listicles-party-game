import type { DieFace } from './types';

export const DIE_FACES: DieFace[] = ['Trashy', 'WTF', 'Ew', 'Hot', 'Basic', 'OMG'];

export const DIE_FACE_EMOJI: Record<DieFace, string> = {
  Trashy: '🗑️',
  WTF: '😳',
  Ew: '🤢',
  Hot: '🔥',
  Basic: '🙄',
  OMG: '😱',
};

export function rollDie(): DieFace {
  return DIE_FACES[Math.floor(Math.random() * DIE_FACES.length)];
}
