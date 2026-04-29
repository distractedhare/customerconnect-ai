import type { CharacterId } from './types';
import type { TriviaQuestion } from './content';

export interface ExternalRunnerContent {
  trivia?: TriviaQuestion[];
  facts?: string[];
}

export interface RunnerSavePayload {
  version: number;
  selectedCharacterId: CharacterId;
  selectedRunnerId?: CharacterId | null;
  highScore: number;
  lifetimeScore: number;
  mastery: Record<CharacterId, number>;
  settings: {
    difficulty: number;
    isMusicEnabled: boolean;
    musicVolume: number;
    isTutorialEnabled: boolean;
  };
  resumeSnapshot?: {
    score: number;
    battery: number;
    maxBattery: number;
    level: number;
    laneCount: number;
    collectedLetters: number[];
    distance: number;
    gemsCollected: number;
    selectedCharacterId: CharacterId;
    selectedRunnerId?: CharacterId | null;
    hasDoubleJump: boolean;
    hasImmortality: boolean;
    dashEnergy: number;
    abilityEnergy: number;
    sidekickCoreCharge: number;
  } | null;
  updatedAt: number;
}

export interface RunnerHostBridge {
  saveRunnerState?: (payload: RunnerSavePayload) => void;
  loadRunnerState?: () => RunnerSavePayload | null | undefined;
  getRunnerContent?: () => ExternalRunnerContent | null | undefined;
  onRunnerEvent?: (type: string, payload?: any) => void;
}

declare global {
  interface Window {
    TLifeRunnerHost?: RunnerHostBridge;
    __TLIFE_RUNNER_CONTENT__?: ExternalRunnerContent;
    __TLIFE_RUNNER_SAVE__?: RunnerSavePayload;
  }
}

export const RUNNER_SAVE_KEY = 'tlife_runner_save_v3';

export const emitRunnerEvent = (type: string, payload?: any) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(type, { detail: payload }));
  try {
    window.TLifeRunnerHost?.onRunnerEvent?.(type, payload);
  } catch (error) {
    console.warn('Runner host event bridge failed', error);
  }
};

export const getExternalRunnerContent = (): ExternalRunnerContent => {
  if (typeof window === 'undefined') return {};

  let hostContent: ExternalRunnerContent = {};
  try {
    hostContent = window.TLifeRunnerHost?.getRunnerContent?.() || {};
  } catch (error) {
    console.warn('Unable to read host runner content', error);
  }

  return {
    trivia: [...(window.__TLIFE_RUNNER_CONTENT__?.trivia || []), ...(hostContent.trivia || [])],
    facts: [...(window.__TLIFE_RUNNER_CONTENT__?.facts || []), ...(hostContent.facts || [])],
  };
};

export const saveRunnerProgress = (payload: RunnerSavePayload) => {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(RUNNER_SAVE_KEY, JSON.stringify(payload));
    window.__TLIFE_RUNNER_SAVE__ = payload;
    window.TLifeRunnerHost?.saveRunnerState?.(payload);
    emitRunnerEvent('tlife-runner-save', payload);
    return true;
  } catch (error) {
    console.error('Unable to save runner progress', error);
    emitRunnerEvent('tlife-runner-save-error', { message: 'save_failed', error });
    return false;
  }
};

export const loadRunnerProgress = (): RunnerSavePayload | null => {
  if (typeof window === 'undefined') return null;

  try {
    const hostState = window.TLifeRunnerHost?.loadRunnerState?.();
    if (hostState) return hostState;
  } catch (error) {
    console.warn('Unable to load runner state from host', error);
  }

  if (window.__TLIFE_RUNNER_SAVE__) return window.__TLIFE_RUNNER_SAVE__;

  try {
    const local = localStorage.getItem(RUNNER_SAVE_KEY);
    if (!local) return null;
    return JSON.parse(local) as RunnerSavePayload;
  } catch (error) {
    console.warn('Unable to parse local runner save', error);
    return null;
  }
};

export const clearRunnerProgress = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RUNNER_SAVE_KEY);
    window.__TLIFE_RUNNER_SAVE__ = undefined;
    emitRunnerEvent('tlife-runner-save-cleared');
  } catch (error) {
    console.warn('Unable to clear runner save', error);
  }
};
