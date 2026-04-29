/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  SHOP = 'SHOP',
  TRIVIA = 'TRIVIA',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  SETTINGS = 'SETTINGS'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',
  BARRIER = 'BARRIER',
  TOWER = 'TOWER',
  GEM = 'GEM',
  LETTER = 'LETTER',
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE',
  TRIVIA = 'TRIVIA',
  POWERUP_MAGNET = 'POWERUP_MAGNET',
  POWERUP_SHIELD = 'POWERUP_SHIELD',
  POWERUP_BATTERY = 'POWERUP_BATTERY',
  POWERUP_OVERCLOCK = 'POWERUP_OVERCLOCK',
  POWERUP_MULTIPLIER = 'POWERUP_MULTIPLIER',
  POWERUP_SCANNER = 'POWERUP_SCANNER'
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number];
  active: boolean;
  value?: string;
  color?: string;
  targetIndex?: number;
  points?: number;
  hasFired?: boolean;
  label?: string;
  meta?: Record<string, any>;
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6;
export const RUN_SPEED_BASE = 16.0;
export const SPAWN_DISTANCE = 120;
export const REMOVE_DISTANCE = 20;

export const TLIFE_COLORS = [
  '#E20074',
  '#FFFFFF',
  '#E20074',
  '#FFFFFF',
  '#E20074',
  '#FFFFFF',
];

export type CharacterId = 'apple' | 'samsung' | 'tcl' | 'motorola' | 'pixel' | 'sidekick_core';
export type AbilityType = 'passive' | 'active' | 'ultimate' | 'defensive';
export type RunnerAbilitySlot = 'smash' | 'blast' | 'core';

export interface CharacterAbilityIcon {
  slot: RunnerAbilitySlot;
  label: string;
  path: string;
  description: string;
}

export interface CharacterAssetSet {
  cutout: string;
  hudPortrait: string;
  avatar: string;
  abilityIcons: CharacterAbilityIcon[];
  fullCard?: string;
  heroBanner?: string;
  avatarSmall?: string;
  mobileFallback?: string;
}

export interface BossAssetSet {
  banner: string;
  hudPortrait: string;
  avatarSmall: string;
  fullCard?: string;
  abilityIcons?: Partial<Record<RunnerAbilitySlot, string>>;
}

export interface CharacterStats {
  speed: number;
  agility: number;
  power: number;
  durability: number;
  tech: number;
}

export interface NativeCharacterStats {
  power: number;
  speed: number;
  defense: number;
  utility: number;
  max: 10;
}

export interface CharacterAbility {
  id: string;
  name: string;
  type: AbilityType;
  description: string;
  gameplayEffect: string;
}

export interface CharacterGameplay {
  baseSpeedMultiplier: number;
  dashRecharge: number;
  dashBurstMultiplier: number;
  scoreMultiplier: number;
  abilityCooldown: number;
  maxBatteryBonus: number;
  triviaBonus: number;
  sidekickCoreAffinity: number;
}

export interface CharacterDefinition {
  id: CharacterId;
  brand: string;
  name: string;
  series: string;
  title: string;
  role: string;
  traitDescription: string;
  rarity: 'Epic' | 'Legendary' | 'Mythic';
  tagline: string;
  lore: string;
  accent: string;
  secondary: string;
  armor: string;
  icon: string;
  cardImage: string;
  heroImage?: string;
  portraitImage?: string;
  assets?: CharacterAssetSet;
  signature: string;
  supportOnly?: boolean;
  passiveName: string;
  passiveDescription: string;
  abilityName: string;
  abilityDescription: string;
  ultimateName: string;
  ultimateDescription: string;
  abilities: CharacterAbility[];
  flavor: string;
  stats: CharacterStats;
  nativeStats: NativeCharacterStats;
  gameplay: CharacterGameplay;
}

export interface BossDefinition {
  id: string;
  name: string;
  title: string;
  // 'HiddenArchitect' is reserved for lore-only entities (e.g. Bell Sovereign)
  // that exist as content stubs but are not wired into the level progression.
  threatLevel: 'MiniBoss' | 'Boss' | 'FinalBoss' | 'HiddenArchitect';
  progressionEligible?: boolean;
  faction: string;
  fantasy: string;
  visualTheme: string;
  accent: string;
  secondary: string;
  emblem: string;
  assets?: BossAssetSet;
  mechanics: string[];
  counterplay: string[];
  milestoneLevel: number;
}

export type PowerUpType = 'MAGNET' | 'SHIELD' | 'BATTERY' | 'OVERCLOCK' | 'MULTIPLIER' | 'SCANNER';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: any;
  oneTime?: boolean;
}

export interface RuntimePowerUpState {
  magnet: number;
  shield: number;
  overclock: number;
  multiplier: number;
  scanner: number;
}
