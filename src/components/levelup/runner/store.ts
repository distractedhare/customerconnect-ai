/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import { clearRunnerProgress, emitRunnerEvent, loadRunnerProgress, saveRunnerProgress, type RunnerSavePayload } from './bridge';
import {
  GameStatus,
  RUN_SPEED_BASE,
  type CharacterId,
  type PowerUpType,
} from './types';
import {
  T_LIFE_WORD,
  T_MOBILE_TRIVIA,
  type TriviaQuestion,
  getBossForLevel,
  getBossForProgress,
  getCharacterDefinition,
  getFactDeck,
  getTriviaDeck,
} from './content';

const MAX_LEVEL = 5;
const BASE_BATTERY = 100;
const SAVE_STATUS_RESET_MS = 2200;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const ALL_CHARACTER_IDS: CharacterId[] = ['apple', 'samsung', 'tcl', 'motorola', 'pixel', 'sidekick_core', 'nokia_relay'];
const DEFAULT_MASTERY: Record<CharacterId, number> = {
  apple: 0,
  samsung: 0,
  tcl: 0,
  motorola: 0,
  pixel: 0,
  sidekick_core: 0,
  nokia_relay: 0,
};

const getDifficultyMultiplier = (difficulty: number) => {
  if (difficulty === 1) return 0.85;
  if (difficulty === 3) return 1.15;
  return 1;
};

const getRunBaseSpeed = (difficulty: number, characterId: CharacterId, level: number) => {
  const character = getCharacterDefinition(characterId);
  const levelScale = 1 + Math.max(0, level - 1) * 0.08;
  return RUN_SPEED_BASE * getDifficultyMultiplier(difficulty) * character.gameplay.baseSpeedMultiplier * levelScale;
};

const getRunBattery = (characterId: CharacterId) => {
  const character = getCharacterDefinition(characterId);
  return BASE_BATTERY + character.gameplay.maxBatteryBonus;
};

const makeFreshRunState = (selectedCharacterId: CharacterId, difficulty: number) => {
  const baseBattery = getRunBattery(selectedCharacterId);
  return {
    score: 0,
    battery: baseBattery,
    maxBattery: baseBattery,
    baseSpeed: getRunBaseSpeed(difficulty, selectedCharacterId, 1),
    speed: getRunBaseSpeed(difficulty, selectedCharacterId, 1),
    scoreMultiplier: getCharacterDefinition(selectedCharacterId).gameplay.scoreMultiplier,
    combo: 0,
    bestCombo: 0,
    comboTimer: 0,
    collectedLetters: [] as number[],
    level: 1,
    laneCount: 3,
    currentBossId: getBossForProgress(1)?.id ?? null,
    gemsCollected: 0,
    distance: 0,
    currentTriviaQuestion: null as TriviaQuestion | null,
    triviaFeedback: null as { correct: boolean; msg: string; explanation?: string } | null,
    currentFact: null as string | null,
    usedTriviaIds: [] as string[],
    recentTriviaCategories: [] as string[],
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false,
    immortalityTimer: 0,
    isMagnetActive: false,
    magnetTimer: 0,
    isDashing: false,
    dashTimer: 0,
    dashEnergy: 1,
    isIFraming: false,
    iframeTimer: 0,
    isOverclockActive: false,
    overclockTimer: 0,
    isScannerActive: false,
    scannerTimer: 0,
    isMultiplierActive: false,
    multiplierTimer: 0,
    isCharacterAbilityActive: false,
    characterAbilityTimer: 0,
    abilityEnergy: 1,
    sidekickCoreCharge: 0,
    isSidekickCoreActive: false,
    sidekickCoreTimer: 0,
    safeguardCharges: 0,
    shakeIntensity: 0,
  };
};

interface TriviaFeedback {
  correct: boolean;
  msg: string;
  explanation?: string;
}

interface ResumeSnapshot {
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
}

interface GameState {
  status: GameStatus;
  settingsReturnStatus: GameStatus;
  score: number;
  highScore: number;
  lifetimeScore: number;
  battery: number;
  maxBattery: number;
  baseSpeed: number;
  speed: number;
  scoreMultiplier: number;
  combo: number;
  bestCombo: number;
  comboTimer: number;
  collectedLetters: number[];
  level: number;
  laneCount: number;
  currentBossId: string | null;
  gemsCollected: number;
  distance: number;

  selectedCharacterId: CharacterId;
  selectedRunnerId: CharacterId | null;
  mastery: Record<CharacterId, number>;

  currentTriviaQuestion: TriviaQuestion | null;
  triviaFeedback: TriviaFeedback | null;
  currentFact: string | null;
  usedTriviaIds: string[];
  recentTriviaCategories: string[];

  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;
  immortalityTimer: number;
  isMagnetActive: boolean;
  magnetTimer: number;
  isDashing: boolean;
  dashTimer: number;
  dashEnergy: number;
  isIFraming: boolean;
  iframeTimer: number;
  isOverclockActive: boolean;
  overclockTimer: number;
  isScannerActive: boolean;
  scannerTimer: number;
  isMultiplierActive: boolean;
  multiplierTimer: number;
  isCharacterAbilityActive: boolean;
  characterAbilityTimer: number;
  abilityEnergy: number;
  sidekickCoreCharge: number;
  isSidekickCoreActive: boolean;
  sidekickCoreTimer: number;
  safeguardCharges: number;
  shakeIntensity: number;

  difficulty: number;
  isMusicEnabled: boolean;
  musicVolume: number;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: number | null;
  saveToken: string | null;
  hasResumeSave: boolean;
  resumeSnapshot: ResumeSnapshot | null;
  hostKnowledgeCount: number;

  isTutorialEnabled: boolean;
  seenTutorials: string[];

  startGame: () => void;
  continueSavedRun: () => void;
  restartGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  togglePause: () => void;
  setStatus: (status: GameStatus) => void;
  openSettings: (returnStatus?: GameStatus) => void;
  closeSettings: () => void;
  setDistance: (dist: number) => void;

  takeDamage: (amount: number) => void;
  healBattery: (amount: number) => void;
  addScore: (amount: number) => void;
  bumpCombo: (amount?: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  collectPowerUp: (type: PowerUpType) => void;
  recordHazardDestroyed: (value?: number) => void;

  triggerTrivia: () => void;
  answerTrivia: (index: number) => void;
  closeTrivia: () => void;
  showFact: (fact: string) => void;
  hideFact: () => void;

  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL' | 'SCANNER' | 'MULTIPLIER' | 'OVERCLOCK', cost: number) => boolean;
  advanceLevel: () => void;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;
  triggerDash: () => void;
  startDash: () => void;
  stopDash: () => void;
  setDashEnergy: (energy: number) => void;
  setIFraming: (active: boolean, duration?: number) => void;
  triggerShake: (intensity?: number) => void;
  tickGameplay: (delta: number) => void;
  activateCharacterAbility: () => boolean;
  activateSidekickCore: () => boolean;
  chargeSidekickCore: (amount: number) => void;
  setRunner: (id: CharacterId) => void;
  setSelectedCharacter: (id: CharacterId) => void;

  setDifficulty: (val: number) => void;
  setMusicEnabled: (val: boolean) => void;
  setMusicVolume: (val: number) => void;
  saveProgress: (includeResume?: boolean) => boolean;
  hydrateProgress: () => void;
  clearSavedProgress: () => void;
  generateToken: () => void;
  loadFromToken: (token: string) => boolean;

  setTutorialEnabled: (val: boolean) => void;
  markTutorialSeen: (id: string) => void;
  resetTutorials: () => void;
}

const normalizeSelectedCharacter = (characterId?: CharacterId | null): CharacterId =>
  characterId && characterId !== 'sidekick_core' ? characterId : 'apple';

const getActiveRunnerId = (state: Pick<GameState, 'selectedRunnerId' | 'selectedCharacterId'>): CharacterId =>
  normalizeSelectedCharacter(state.selectedRunnerId ?? state.selectedCharacterId);

const getScoreDelta = (state: Pick<GameState, 'combo' | 'scoreMultiplier' | 'selectedRunnerId' | 'selectedCharacterId' | 'isSidekickCoreActive'>, amount: number) => {
  const comboScalar = 1 + Math.min(0.8, Math.floor(state.combo / 5) * 0.08);
  const sidekickCoreScalar = state.isSidekickCoreActive ? 1.2 : 1;
  const characterScalar = getCharacterDefinition(getActiveRunnerId(state)).gameplay.scoreMultiplier;
  return Math.round(amount * comboScalar * sidekickCoreScalar * state.scoreMultiplier * characterScalar);
};

const getResumeSnapshot = (state: GameState): ResumeSnapshot | null => {
  if (![GameStatus.PLAYING, GameStatus.PAUSED, GameStatus.SHOP, GameStatus.TRIVIA].includes(state.status)) return null;
  return {
    score: state.score,
    battery: state.battery,
    maxBattery: state.maxBattery,
    level: state.level,
    laneCount: state.laneCount,
    collectedLetters: [...state.collectedLetters],
    distance: state.distance,
    gemsCollected: state.gemsCollected,
    selectedCharacterId: state.selectedCharacterId,
    selectedRunnerId: getActiveRunnerId(state),
    hasDoubleJump: state.hasDoubleJump,
    hasImmortality: state.hasImmortality,
    dashEnergy: state.dashEnergy,
    abilityEnergy: state.abilityEnergy,
    sidekickCoreCharge: state.sidekickCoreCharge,
  };
};

const buildSavePayload = (state: GameState, includeResume = true): RunnerSavePayload => ({
  version: 2,
  selectedCharacterId: state.selectedCharacterId,
  selectedRunnerId: getActiveRunnerId(state),
  highScore: state.highScore,
  lifetimeScore: state.lifetimeScore,
  mastery: state.mastery,
  settings: {
    difficulty: state.difficulty,
    isMusicEnabled: state.isMusicEnabled,
    musicVolume: state.musicVolume,
    isTutorialEnabled: state.isTutorialEnabled,
  },
  resumeSnapshot: includeResume ? getResumeSnapshot(state) : null,
  updatedAt: Date.now(),
});

let factTimer: number | null = null;
let saveStatusTimer: number | null = null;

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  settingsReturnStatus: GameStatus.MENU,
  score: 0,
  highScore: 0,
  lifetimeScore: 0,
  battery: getRunBattery('apple'),
  maxBattery: getRunBattery('apple'),
  baseSpeed: getRunBaseSpeed(2, 'apple', 1),
  speed: 0,
  scoreMultiplier: getCharacterDefinition('apple').gameplay.scoreMultiplier,
  combo: 0,
  bestCombo: 0,
  comboTimer: 0,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  currentBossId: null,
  gemsCollected: 0,
  distance: 0,

  selectedCharacterId: 'apple',
  selectedRunnerId: null,
  mastery: { ...DEFAULT_MASTERY },

  currentTriviaQuestion: null,
  triviaFeedback: null,
  currentFact: null,
  usedTriviaIds: [],
  recentTriviaCategories: [],

  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,
  immortalityTimer: 0,
  isMagnetActive: false,
  magnetTimer: 0,
  isDashing: false,
  dashTimer: 0,
  dashEnergy: 1,
  isIFraming: false,
  iframeTimer: 0,
  isOverclockActive: false,
  overclockTimer: 0,
  isScannerActive: false,
  scannerTimer: 0,
  isMultiplierActive: false,
  multiplierTimer: 0,
  isCharacterAbilityActive: false,
  characterAbilityTimer: 0,
  abilityEnergy: 1,
  sidekickCoreCharge: 0,
  isSidekickCoreActive: false,
  sidekickCoreTimer: 0,
  safeguardCharges: 0,
  shakeIntensity: 0,

  difficulty: 2,
  isMusicEnabled: true,
  musicVolume: 0.5,
  saveStatus: 'idle',
  lastSavedAt: null,
  saveToken: null,
  hasResumeSave: false,
  resumeSnapshot: null,
  hostKnowledgeCount: Math.max(0, getTriviaDeck().length - T_MOBILE_TRIVIA.length),

  isTutorialEnabled: true,
  seenTutorials: [],

  startGame: () => {
    const state = get();
    const selectedRunnerId = getActiveRunnerId(state);
    const fresh = makeFreshRunState(selectedRunnerId, state.difficulty);
    set({
      status: GameStatus.PLAYING,
      selectedCharacterId: selectedRunnerId,
      selectedRunnerId,
      ...fresh,
      hasResumeSave: false,
      resumeSnapshot: null,
      saveToken: null,
    });
    emitRunnerEvent('tlife-runner-start', { characterId: selectedRunnerId });
  },

  continueSavedRun: () => {
    const { resumeSnapshot, difficulty } = get();
    if (!resumeSnapshot) return;
    const selectedRunnerId = normalizeSelectedCharacter(resumeSnapshot.selectedRunnerId ?? resumeSnapshot.selectedCharacterId);

    set({
      status: GameStatus.PLAYING,
      selectedCharacterId: selectedRunnerId,
      selectedRunnerId,
      score: resumeSnapshot.score,
      battery: resumeSnapshot.battery,
      maxBattery: resumeSnapshot.maxBattery,
      level: resumeSnapshot.level,
      laneCount: resumeSnapshot.laneCount,
      currentBossId: getBossForProgress(resumeSnapshot.level)?.id ?? null,
      collectedLetters: [...resumeSnapshot.collectedLetters],
      distance: resumeSnapshot.distance,
      gemsCollected: resumeSnapshot.gemsCollected,
      baseSpeed: getRunBaseSpeed(difficulty, selectedRunnerId, resumeSnapshot.level),
      speed: getRunBaseSpeed(difficulty, selectedRunnerId, resumeSnapshot.level),
      hasDoubleJump: resumeSnapshot.hasDoubleJump,
      hasImmortality: resumeSnapshot.hasImmortality,
      dashEnergy: resumeSnapshot.dashEnergy,
      abilityEnergy: resumeSnapshot.abilityEnergy,
      sidekickCoreCharge: resumeSnapshot.sidekickCoreCharge,
      hasResumeSave: false,
      resumeSnapshot: null,
      currentTriviaQuestion: null,
      triviaFeedback: null,
    });
    emitRunnerEvent('tlife-runner-continue', { characterId: selectedRunnerId });
  },

  restartGame: () => {
    get().startGame();
  },

  pauseGame: () => {
    if (get().status === GameStatus.PLAYING) {
      set({ status: GameStatus.PAUSED });
      get().saveProgress(true);
    }
  },

  resumeGame: () => {
    if (get().status === GameStatus.PAUSED) set({ status: GameStatus.PLAYING });
  },

  togglePause: () => {
    const { status } = get();
    if (status === GameStatus.PLAYING) get().pauseGame();
    else if (status === GameStatus.PAUSED) get().resumeGame();
  },

  setStatus: (status) => set({ status }),
  openSettings: (returnStatus) => {
    const currentState = get();
    const nextReturnStatus =
      returnStatus ??
      (currentState.status === GameStatus.SETTINGS ? currentState.settingsReturnStatus : currentState.status);
    set({ status: GameStatus.SETTINGS, settingsReturnStatus: nextReturnStatus });
  },
  closeSettings: () => {
    const { settingsReturnStatus } = get();
    set({ status: settingsReturnStatus });
  },
  setDistance: (dist) => set({ distance: dist }),

  takeDamage: (amount) => {
    const state = get();
    if (state.isImmortalityActive || state.isIFraming) return;

    if (state.safeguardCharges > 0) {
      set({
        safeguardCharges: state.safeguardCharges - 1,
        isIFraming: true,
        iframeTimer: 2.5,
      });
      get().triggerShake(0.5);
      get().showFact('Safeguard triggered. You stayed in the run.');
      return;
    }

    const nextBattery = Math.max(0, state.battery - amount);
    if (nextBattery <= 0) {
      const highScore = Math.max(state.highScore, state.score);
      const characterId = getActiveRunnerId(state);
      const masteryGain = { ...state.mastery, [characterId]: state.mastery[characterId] + state.score };
      set({
        battery: 0,
        status: GameStatus.GAME_OVER,
        speed: 0,
        highScore,
        mastery: masteryGain,
      });
      get().saveProgress(false);
      emitRunnerEvent('tlife-runner-game-over', { score: state.score, level: state.level, characterId });
      return;
    }

    set({
      battery: nextBattery,
      isIFraming: true,
      iframeTimer: 2,
      combo: 0,
      comboTimer: 0,
    });
  },

  healBattery: (amount) => {
    const { battery, maxBattery } = get();
    set({ battery: clamp(battery + amount, 0, maxBattery) });
  },

  addScore: (amount) => {
    set((state) => {
      const delta = getScoreDelta(state, amount);
      return {
        score: state.score + delta,
        lifetimeScore: state.lifetimeScore + delta,
        highScore: Math.max(state.highScore, state.score + delta),
      };
    });
  },

  bumpCombo: (amount = 1) => {
    set((state) => {
      const combo = state.combo + amount;
      return {
        combo,
        comboTimer: 4.5,
        bestCombo: Math.max(state.bestCombo, combo),
      };
    });
  },

  collectGem: (value) => {
    set((state) => ({ gemsCollected: state.gemsCollected + 1 }));
    get().bumpCombo(1);
    get().addScore(value);
    get().chargeSidekickCore(3);
  },

  collectLetter: (index) => {
    const state = get();
    if (state.collectedLetters.includes(index)) return;

    const newLetters = [...state.collectedLetters, index];
    set({ collectedLetters: newLetters });
    get().bumpCombo(2);
    get().addScore(250);
    get().chargeSidekickCore(12);

    const facts = getFactDeck();
    if (facts.length) {
      get().showFact(facts[Math.floor(Math.random() * facts.length)]);
    }

    if (newLetters.length === T_LIFE_WORD.length) {
      if (state.level < MAX_LEVEL) get().advanceLevel();
      else {
        const highScore = Math.max(state.highScore, state.score + 10000);
        const characterId = getActiveRunnerId(state);
        const masteryGain = { ...state.mastery, [characterId]: state.mastery[characterId] + state.score + 10000 };
        set({
          status: GameStatus.VICTORY,
          score: state.score + 10000,
          highScore,
          mastery: masteryGain,
        });
        get().saveProgress(false);
        emitRunnerEvent('tlife-runner-victory', { score: state.score + 10000, characterId });
      }
    }
  },

  collectPowerUp: (type) => {
    const facts = {
      MAGNET: 'Magnet engaged. Pull the good stuff closer.',
      SHIELD: 'Shield online. You now have a safeguard charge.',
      BATTERY: 'Battery pack secured. Breathe easier.',
      OVERCLOCK: 'Overclock hot. The track just got meaner.',
      MULTIPLIER: 'Score multiplier lit. Now is the time to push.',
      SCANNER: 'Scanner up. Routes and rewards are easier to read.',
    } as Record<PowerUpType, string>;

    switch (type) {
      case 'MAGNET':
        set((state) => ({ isMagnetActive: true, magnetTimer: Math.max(state.magnetTimer, 8) }));
        break;
      case 'SHIELD':
        set((state) => ({
          safeguardCharges: Math.min(3, state.safeguardCharges + 1),
          isImmortalityActive: true,
          immortalityTimer: Math.max(state.immortalityTimer, 2.5),
        }));
        break;
      case 'BATTERY':
        get().healBattery(20);
        break;
      case 'OVERCLOCK':
        set((state) => ({ isOverclockActive: true, overclockTimer: Math.max(state.overclockTimer, 8) }));
        break;
      case 'MULTIPLIER':
        set((state) => ({ isMultiplierActive: true, multiplierTimer: Math.max(state.multiplierTimer, 8) }));
        break;
      case 'SCANNER':
        set((state) => ({ isScannerActive: true, scannerTimer: Math.max(state.scannerTimer, 10) }));
        break;
    }

    get().bumpCombo(1);
    get().addScore(150);
    get().chargeSidekickCore(type === 'SHIELD' ? 8 : 5);
    get().showFact(facts[type]);
  },

  recordHazardDestroyed: (value = 75) => {
    get().bumpCombo(1);
    get().addScore(value);
    get().chargeSidekickCore(4);
  },

  triggerTrivia: () => {
    const deck = getTriviaDeck();
    const state = get();
    const desiredDifficulty = clamp(Math.ceil(state.level / 2) + (state.difficulty - 1), 1, 4);

    let candidates = deck.filter((question) => !state.usedTriviaIds.includes(question.id) && Math.abs(question.difficulty - desiredDifficulty) <= 1);

    if (state.recentTriviaCategories.length > 0) {
      const lastCategory = state.recentTriviaCategories[state.recentTriviaCategories.length - 1];
      const withoutRecentCategory = candidates.filter((question) => question.category !== lastCategory);
      if (withoutRecentCategory.length > 0) candidates = withoutRecentCategory;
    }

    if (candidates.length === 0) {
      candidates = deck.filter((question) => Math.abs(question.difficulty - desiredDifficulty) <= 1);
      set({ usedTriviaIds: [] });
    }

    if (candidates.length === 0) return;

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const optionsWithIndices = chosen.options.map((option, idx) => ({ option, idx }));
    for (let i = optionsWithIndices.length - 1; i > 0; i -= 1) {
      const swapIndex = Math.floor(Math.random() * (i + 1));
      [optionsWithIndices[i], optionsWithIndices[swapIndex]] = [optionsWithIndices[swapIndex], optionsWithIndices[i]];
    }

    const shuffled: TriviaQuestion = {
      ...chosen,
      options: optionsWithIndices.map((item) => item.option),
      correctIndex: optionsWithIndices.findIndex((item) => item.idx === chosen.correctIndex),
    };

    set({
      status: GameStatus.TRIVIA,
      currentTriviaQuestion: shuffled,
      triviaFeedback: null,
      usedTriviaIds: [...state.usedTriviaIds, chosen.id],
      recentTriviaCategories: [...state.recentTriviaCategories.slice(-2), chosen.category],
      hostKnowledgeCount: Math.max(0, deck.length - T_MOBILE_TRIVIA.length),
    });
  },

  answerTrivia: (index) => {
    const state = get();
    const question = state.currentTriviaQuestion;
    if (!question) return;

    const isCorrect = index === question.correctIndex;

    if (isCorrect) {
      const character = getCharacterDefinition(getActiveRunnerId(state));
      const healthReward = question.healthReward ?? Math.round(12 + question.difficulty * 6 + character.gameplay.triviaBonus * 20);
      const scoreReward = question.scoreReward ?? 350 + question.difficulty * 300;
      const extraGuard = question.difficulty >= 3 ? 1 : 0;
      const nextBattery = clamp(state.battery + healthReward, 0, state.maxBattery);
      set({
        battery: nextBattery,
        safeguardCharges: Math.min(3, state.safeguardCharges + extraGuard),
        triviaFeedback: {
          correct: true,
          msg: `Correct. +${healthReward} battery, +${scoreReward} score${extraGuard ? ', +1 safeguard' : ''}`,
          explanation: question.explanation,
        },
      });
      get().addScore(scoreReward);
      get().bumpCombo(2);
      get().chargeSidekickCore(10 + question.difficulty * 6);
      if (getActiveRunnerId(state) === 'pixel') {
        set((current) => ({ isScannerActive: true, scannerTimer: Math.max(current.scannerTimer, 6) }));
      }
    } else {
      set({
        triviaFeedback: {
          correct: false,
          msg: 'Not quite. Read the explanation and keep the run alive.',
          explanation: question.explanation,
        },
        combo: 0,
        comboTimer: 0,
      });
    }
  },

  closeTrivia: () => {
    set({ status: GameStatus.PLAYING, currentTriviaQuestion: null, triviaFeedback: null, isIFraming: true, iframeTimer: 2.5 });
  },

  showFact: (fact) => {
    if (factTimer) window.clearTimeout(factTimer);
    set({ currentFact: fact });
    factTimer = window.setTimeout(() => {
      if (get().currentFact === fact) set({ currentFact: null });
    }, 4200);
  },

  hideFact: () => set({ currentFact: null }),

  buyItem: (type, cost) => {
    const state = get();
    if (state.score < cost) return false;

    set({ score: state.score - cost });
    switch (type) {
      case 'DOUBLE_JUMP':
        set({ hasDoubleJump: true });
        break;
      case 'MAX_LIFE':
        set({ maxBattery: state.maxBattery + 25, battery: state.battery + 25 });
        break;
      case 'HEAL':
        get().healBattery(35);
        break;
      case 'IMMORTAL':
        set({ hasImmortality: true });
        break;
      case 'SCANNER':
        set((current) => ({ isScannerActive: true, scannerTimer: Math.max(current.scannerTimer, 12) }));
        break;
      case 'MULTIPLIER':
        set((current) => ({ isMultiplierActive: true, multiplierTimer: Math.max(current.multiplierTimer, 12) }));
        break;
      case 'OVERCLOCK':
        set((current) => ({ isOverclockActive: true, overclockTimer: Math.max(current.overclockTimer, 12) }));
        break;
    }
    return true;
  },

  advanceLevel: () => {
    const state = get();
    const selectedRunnerId = getActiveRunnerId(state);
    const nextLevel = Math.min(MAX_LEVEL, state.level + 1);
    set({
      level: nextLevel,
      laneCount: Math.min(state.laneCount + 2, 9),
      currentBossId: getBossForProgress(nextLevel)?.id ?? null,
      collectedLetters: [],
      currentFact: null,
      baseSpeed: getRunBaseSpeed(state.difficulty, selectedRunnerId, nextLevel),
      speed: getRunBaseSpeed(state.difficulty, selectedRunnerId, nextLevel),
    });
    get().addScore(1500);
    get().chargeSidekickCore(15);
    const boss = getBossForLevel(nextLevel);
    get().showFact(
      boss
        ? `${boss.name}: ${boss.title}. ${boss.counterplay[0]}.`
        : `Level ${nextLevel} online. More lanes, more chaos, more upside.`
    );
    emitRunnerEvent('tlife-runner-level-up', { level: nextLevel });
  },

  openShop: () => {
    if (get().status === GameStatus.PLAYING) set({ status: GameStatus.SHOP });
  },
  closeShop: () => {
    if (get().status === GameStatus.SHOP) set({ status: GameStatus.PLAYING });
  },

  activateImmortality: () => {
    const state = get();
    const selectedRunnerId = getActiveRunnerId(state);
    if (!state.hasImmortality && selectedRunnerId !== 'samsung' && selectedRunnerId !== 'sidekick_core') return;
    set({ isImmortalityActive: true, immortalityTimer: Math.max(state.immortalityTimer, 5) });
  },

  triggerDash: () => {
    const state = get();
    if (state.status !== GameStatus.PLAYING) return;
    if (state.dashEnergy < 0.28 && !state.isSidekickCoreActive) return;

    const character = getCharacterDefinition(getActiveRunnerId(state));
    const duration = 0.45 + (character.id === 'motorola' ? 0.2 : 0) + (state.isCharacterAbilityActive ? 0.1 : 0);
    set({
      isDashing: true,
      dashTimer: duration,
      dashEnergy: clamp(state.dashEnergy - 0.28, 0, 1),
    });
    emitRunnerEvent('tlife-runner-dash', { characterId: character.id, duration });
  },

  startDash: () => get().triggerDash(),
  stopDash: () => set({ isDashing: false, dashTimer: 0 }),
  setDashEnergy: (energy) => set({ dashEnergy: clamp(energy, 0, 1) }),
  setIFraming: (active, duration = 2) => set({ isIFraming: active, iframeTimer: active ? duration : 0 }),

  triggerShake: (intensity = 1) => set({ shakeIntensity: intensity }),

  tickGameplay: (delta) => {
    const state = get();
    if (state.status !== GameStatus.PLAYING) return;

    const selectedRunnerId = getActiveRunnerId(state);
    const character = getCharacterDefinition(selectedRunnerId);

    const nextDashTimer = Math.max(0, state.dashTimer - delta);
    const nextImmortalityTimer = Math.max(0, state.immortalityTimer - delta);
    const nextIFrameTimer = Math.max(0, state.iframeTimer - delta);
    const nextMagnetTimer = Math.max(0, state.magnetTimer - delta);
    const nextOverclockTimer = Math.max(0, state.overclockTimer - delta);
    const nextScannerTimer = Math.max(0, state.scannerTimer - delta);
    const nextMultiplierTimer = Math.max(0, state.multiplierTimer - delta);
    const nextAbilityTimer = Math.max(0, state.characterAbilityTimer - delta);
    const nextSidekickCoreTimer = Math.max(0, state.sidekickCoreTimer - delta);
    const nextComboTimer = Math.max(0, state.comboTimer - delta);

    const dashEnergy = clamp(state.dashEnergy + delta * character.gameplay.dashRecharge * (state.isSidekickCoreActive ? 1.15 : 1), 0, 1);
    const abilityEnergy = clamp(state.abilityEnergy + delta / character.gameplay.abilityCooldown, 0, 1);

    const isDashing = nextDashTimer > 0;
    const isImmortalityActive = nextImmortalityTimer > 0;
    const isIFraming = nextIFrameTimer > 0;
    const isMagnetActive = nextMagnetTimer > 0;
    const isOverclockActive = nextOverclockTimer > 0;
    const isScannerActive = nextScannerTimer > 0;
    const isMultiplierActive = nextMultiplierTimer > 0;
    const isCharacterAbilityActive = nextAbilityTimer > 0;
    const isSidekickCoreActive = nextSidekickCoreTimer > 0;
    const combo = nextComboTimer > 0 ? state.combo : 0;

    const baseSpeed = getRunBaseSpeed(state.difficulty, selectedRunnerId, state.level);
    const overclockBoost = isOverclockActive ? 1.18 : 1;
    const dashBoost = isDashing ? character.gameplay.dashBurstMultiplier : 1;
    const sidekickCoreBoost = isSidekickCoreActive ? 1.08 : 1;
    
    // Dynamic difficulty: speed increases naturally the further you survive in the run
    const distanceBoost = 1 + Math.min(0.25, state.distance * 0.00008);
    
    // Reward highly skilled players who maintain large combos with a slightly higher cap
    const comboBoost = 1 + Math.min(0.22, combo * 0.012);
    
    const speed = baseSpeed * overclockBoost * dashBoost * sidekickCoreBoost * comboBoost * distanceBoost;
    const scoreMultiplier = (isMultiplierActive ? 2 : 1) * (isSidekickCoreActive ? 1.18 : 1);

    set({
      baseSpeed,
      speed,
      scoreMultiplier,
      combo,
      comboTimer: nextComboTimer,
      dashTimer: nextDashTimer,
      immortalityTimer: nextImmortalityTimer,
      iframeTimer: nextIFrameTimer,
      magnetTimer: nextMagnetTimer,
      overclockTimer: nextOverclockTimer,
      scannerTimer: nextScannerTimer,
      multiplierTimer: nextMultiplierTimer,
      characterAbilityTimer: nextAbilityTimer,
      sidekickCoreTimer: nextSidekickCoreTimer,
      dashEnergy,
      abilityEnergy,
      isDashing,
      isImmortalityActive,
      isIFraming,
      isMagnetActive,
      isOverclockActive,
      isScannerActive,
      isMultiplierActive,
      isCharacterAbilityActive,
      isSidekickCoreActive,
      shakeIntensity: Math.max(0, state.shakeIntensity - delta * 2.5),
    });
  },

  activateCharacterAbility: () => {
    const state = get();
    if (state.status !== GameStatus.PLAYING) return false;
    if (state.abilityEnergy < 0.99) return false;

    const character = getCharacterDefinition(getActiveRunnerId(state));
    const baseUpdates: Partial<GameState> = {
      abilityEnergy: 0,
      isCharacterAbilityActive: true,
      characterAbilityTimer: 4,
    };

    if (character.id === 'apple') {
      set((current) => ({
        ...baseUpdates,
        isMagnetActive: true,
        magnetTimer: Math.max(current.magnetTimer, 6),
        scoreMultiplier: current.scoreMultiplier * 1.15,
      } as Partial<GameState>));
    } else if (character.id === 'samsung') {
      set((current) => ({
        ...baseUpdates,
        isImmortalityActive: true,
        immortalityTimer: Math.max(current.immortalityTimer, 4),
        safeguardCharges: Math.min(3, current.safeguardCharges + 1),
      } as Partial<GameState>));
    } else if (character.id === 'tcl') {
      set(baseUpdates as Partial<GameState>);
    } else if (character.id === 'motorola') {
      set((current) => ({
        ...baseUpdates,
        isOverclockActive: true,
        overclockTimer: Math.max(current.overclockTimer, 6),
        dashEnergy: 1,
        isDashing: true,
        dashTimer: Math.max(current.dashTimer, 0.75),
      } as Partial<GameState>));
    } else if (character.id === 'pixel') {
      set((current) => ({
        ...baseUpdates,
        isScannerActive: true,
        scannerTimer: Math.max(current.scannerTimer, 8),
        isMagnetActive: true,
        magnetTimer: Math.max(current.magnetTimer, 4),
      } as Partial<GameState>));
    } else if (character.id === 'sidekick_core') {
      set((current) => ({
        ...baseUpdates,
        isImmortalityActive: true,
        immortalityTimer: Math.max(current.immortalityTimer, 4),
        isMagnetActive: true,
        magnetTimer: Math.max(current.magnetTimer, 6),
        isScannerActive: true,
        scannerTimer: Math.max(current.scannerTimer, 6),
        safeguardCharges: Math.min(3, current.safeguardCharges + 1),
      } as Partial<GameState>));
    }

    get().chargeSidekickCore(8 * character.gameplay.sidekickCoreAffinity);
    emitRunnerEvent('tlife-runner-character-ability-state', { characterId: character.id });
    return true;
  },

  activateSidekickCore: () => {
    const state = get();
    if (state.status !== GameStatus.PLAYING) return false;
    if (state.sidekickCoreCharge < 100) return false;

    set((current) => ({
      isSidekickCoreActive: true,
      sidekickCoreTimer: Math.max(current.sidekickCoreTimer, getActiveRunnerId(current) === 'sidekick_core' ? 10 : 8),
      sidekickCoreCharge: 0,
      isMagnetActive: true,
      magnetTimer: Math.max(current.magnetTimer, 6),
      isScannerActive: true,
      scannerTimer: Math.max(current.scannerTimer, 6),
      safeguardCharges: Math.min(3, current.safeguardCharges + 1),
    }));
    emitRunnerEvent('tlife-runner-sidekick-core-activated', { characterId: getActiveRunnerId(state) });
    return true;
  },

  chargeSidekickCore: (amount) => {
    const state = get();
    const character = getCharacterDefinition(getActiveRunnerId(state));
    const scaledAmount = amount * character.gameplay.sidekickCoreAffinity;
    set({ sidekickCoreCharge: clamp(state.sidekickCoreCharge + scaledAmount, 0, 100) });
  },

  setRunner: (id) => {
    const selectedRunnerId = normalizeSelectedCharacter(id);
    const nextBattery = getRunBattery(selectedRunnerId);
    const nextBaseSpeed = getRunBaseSpeed(get().difficulty, selectedRunnerId, get().level);
    set((state) => ({
      selectedCharacterId: selectedRunnerId,
      selectedRunnerId,
      maxBattery: state.status === GameStatus.PLAYING ? state.maxBattery : nextBattery,
      battery: state.status === GameStatus.PLAYING ? state.battery : nextBattery,
      baseSpeed: nextBaseSpeed,
      speed: state.status === GameStatus.PLAYING ? state.speed : nextBaseSpeed,
      hostKnowledgeCount: Math.max(0, getTriviaDeck().length - T_MOBILE_TRIVIA.length),
    }));
    emitRunnerEvent('tlife-runner-character-selected', { characterId: selectedRunnerId });
  },

  setSelectedCharacter: (id) => get().setRunner(id),

  setDifficulty: (val) => {
    const nextDifficulty = clamp(Math.round(val), 1, 3);
    const state = get();
    const selectedRunnerId = getActiveRunnerId(state);
    set({
      difficulty: nextDifficulty,
      baseSpeed: getRunBaseSpeed(nextDifficulty, selectedRunnerId, state.level),
      speed: state.status === GameStatus.PLAYING ? state.speed : getRunBaseSpeed(nextDifficulty, selectedRunnerId, state.level),
    });
  },
  setMusicEnabled: (val) => set({ isMusicEnabled: val }),
  setMusicVolume: (val) => set({ musicVolume: val }),

  saveProgress: (includeResume = true) => {
    const payload = buildSavePayload(get(), includeResume);
    set({ saveStatus: 'saving' });
    const success = saveRunnerProgress(payload);
    if (saveStatusTimer) window.clearTimeout(saveStatusTimer);
    set({
      saveStatus: success ? 'saved' : 'error',
      lastSavedAt: success ? Date.now() : get().lastSavedAt,
      hasResumeSave: includeResume ? !!payload.resumeSnapshot : false,
      resumeSnapshot: includeResume ? ((payload.resumeSnapshot as ResumeSnapshot | null) || null) : null,
    });
    saveStatusTimer = window.setTimeout(() => set({ saveStatus: 'idle' }), SAVE_STATUS_RESET_MS);
    return success;
  },

  hydrateProgress: () => {
    const saved = loadRunnerProgress();
    const triviaDeck = getTriviaDeck();
    if (!saved) {
      set({ hostKnowledgeCount: Math.max(0, triviaDeck.length - T_MOBILE_TRIVIA.length) });
      return;
    }

    const selectedRunnerId = normalizeSelectedCharacter(saved.selectedRunnerId ?? saved.selectedCharacterId);
    const baseBattery = getRunBattery(selectedRunnerId);
    set({
      selectedCharacterId: selectedRunnerId,
      selectedRunnerId,
      highScore: saved.highScore || 0,
      lifetimeScore: saved.lifetimeScore || 0,
      mastery: { ...DEFAULT_MASTERY, ...(saved.mastery || {}) },
      difficulty: saved.settings?.difficulty || 2,
      isMusicEnabled: saved.settings?.isMusicEnabled ?? true,
      musicVolume: saved.settings?.musicVolume ?? 0.5,
      isTutorialEnabled: saved.settings?.isTutorialEnabled ?? true,
      maxBattery: baseBattery,
      battery: baseBattery,
      baseSpeed: getRunBaseSpeed(saved.settings?.difficulty || 2, selectedRunnerId, 1),
      saveStatus: 'idle',
      lastSavedAt: saved.updatedAt,
      hasResumeSave: !!saved.resumeSnapshot,
      resumeSnapshot: (saved.resumeSnapshot as ResumeSnapshot | null) || null,
      hostKnowledgeCount: Math.max(0, triviaDeck.length - T_MOBILE_TRIVIA.length),
    });
  },

  clearSavedProgress: () => {
    clearRunnerProgress();
    set({ hasResumeSave: false, resumeSnapshot: null, saveStatus: 'idle', saveToken: null });
  },

  generateToken: () => {
    const payload = buildSavePayload(get(), true);
    const token = btoa(JSON.stringify(payload));
    set({ saveToken: token });
  },

  loadFromToken: (token) => {
    try {
      const json = atob(token);
      const data = JSON.parse(json) as RunnerSavePayload;
      if (!data || typeof data.highScore !== 'number') return false;
      const selectedRunnerId = normalizeSelectedCharacter(data.selectedRunnerId ?? data.selectedCharacterId);
      set({
        selectedCharacterId: selectedRunnerId,
        selectedRunnerId,
        highScore: data.highScore,
        lifetimeScore: data.lifetimeScore || 0,
        mastery: { ...DEFAULT_MASTERY, ...(data.mastery || {}) },
        difficulty: data.settings?.difficulty || 2,
        isMusicEnabled: data.settings?.isMusicEnabled ?? true,
        musicVolume: data.settings?.musicVolume ?? 0.5,
        isTutorialEnabled: data.settings?.isTutorialEnabled ?? true,
        hasResumeSave: !!data.resumeSnapshot,
        resumeSnapshot: (data.resumeSnapshot as ResumeSnapshot | null) || null,
      });
      return true;
    } catch (error) {
      console.error('Invalid token', error);
      return false;
    }
  },

  setTutorialEnabled: (val) => set({ isTutorialEnabled: val }),
  markTutorialSeen: (id) => set((state) => ({ seenTutorials: state.seenTutorials.includes(id) ? state.seenTutorials : [...state.seenTutorials, id] })),
  resetTutorials: () => set({ seenTutorials: [] }),
}));
