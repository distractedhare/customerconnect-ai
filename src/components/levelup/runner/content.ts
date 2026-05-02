/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getExternalRunnerContent } from './bridge';
import type { BossDefinition, CharacterDefinition, CharacterId } from './types';

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4;
  category: 'network' | 'plans' | 'objection' | 'discovery' | 'devices' | 'bundles' | 'service' | 'sales';
  healthReward?: number;
  scoreReward?: number;
}

export const T_LIFE_WORD = ['T', '-', 'L', 'I', 'F', 'E'];
export const T_MOBILE_MAGENTA = '#E20074';
export const T_MOBILE_DARK = '#000000';
export const T_MOBILE_WHITE = '#FFFFFF';
export const T_MOBILE_SILVER = '#F1F1F1';
export const T_MOBILE_GREY = '#6A6A6A';

export const T_MOBILE_PALETTE = [
  T_MOBILE_MAGENTA,
  T_MOBILE_WHITE,
  T_MOBILE_SILVER,
  T_MOBILE_GREY,
  '#A10052',
  '#FF5CAD',
  '#6E34FF',
  '#00D9FF',
];

export const LEVEL_PALETTES: Record<number, string[]> = {
  1: [T_MOBILE_MAGENTA, T_MOBILE_WHITE],
  2: [T_MOBILE_MAGENTA, T_MOBILE_SILVER, T_MOBILE_GREY],
  3: [T_MOBILE_MAGENTA, '#A10052', '#FF5CAD'],
  4: [T_MOBILE_MAGENTA, '#6E34FF', '#00D9FF', T_MOBILE_WHITE],
  5: [T_MOBILE_MAGENTA, '#FF5CAD', '#A10052', '#6E34FF', '#00D9FF', T_MOBILE_WHITE],
};

export interface CharacterAbility {
  slot: number;
  label: string;
  description: string;
  path: string;
}

export interface RunnerCharacter {
  id: string;
  name: string;
  role: string;
  trait: string;
  color: string;
  assets: {
    cutout: string;
    hud: string;
    avatar: string;
  };
  fullCard?: string;
  stats: { power: number; speed: number; defense: number; utility: number; };
  abilities: CharacterAbility[];
}

export const PLAYABLE_RUNNERS: RunnerCharacter[] = [
  // ── Nokia Relay: intro / tutorial runner ──────────────────────────────────
  {
    id: 'nokia_relay' as CharacterId,
    name: 'Nokia Relay',
    role: 'Intro Runner',
    trait: 'Built to Last & Signal Strong',
    color: '#00BFFF',
    assets: {
      cutout: '/levelup/runner/heroes/nokia_relay_hero.png',
      hud: '/levelup/runner/portraits/nokia_relay_portrait.png',
      avatar: '/levelup/runner/avatars/nokia_relay_avatar.png',
    },
    fullCard: '/levelup/runner/cards/nokia_relay_card.png',
    stats: { power: 6, speed: 7, defense: 9, utility: 8 },
    abilities: [
      { slot: 1, label: 'Signal Burst', description: 'Clears the lane ahead.', path: '/levelup/runner/abilities/nokia-blast.png' },
      { slot: 2, label: 'Relay Smash', description: 'Durable impact strike.', path: '/levelup/runner/abilities/nokia-smash.png' },
      { slot: 3, label: 'Core Sync', description: 'Steady battery regen.', path: '/levelup/runner/abilities/nokia-core.png' },
    ],
  },
  // ── Kip: AI Operator / Sidekick ───────────────────────────────────────────
  {
    id: 'kip' as CharacterId,
    name: 'Kip',
    role: 'AI Operator',
    trait: 'Always On — Knowledge Strengthens the Signal',
    color: '#E20074',
    assets: {
      cutout: '/kip/hero.png',
      hud: '/kip/portrait.png',
      avatar: '/kip/orb.png',
    },
    fullCard: '/levelup/runner/cards/tmobile_sidekick_core_command_card_v2.png',
    stats: { power: 5, speed: 7, defense: 6, utility: 10 },
    abilities: [
      { slot: 1, label: 'Signal Check', description: 'Reveals safe lane paths.', path: '/levelup/runner/abilities/kip-smash.png' },
      { slot: 2, label: 'Bonus Round', description: 'Activates a score burst.', path: '/levelup/runner/abilities/kip-blast.png' },
      { slot: 3, label: 'KIP Challenge', description: 'Risk/reward trivia play.', path: '/levelup/runner/abilities/kip-core.png' },
    ],
  },
  // ── Device faction runners ────────────────────────────────────────────────
  {
    id: 'tcl',
    name: 'TCL NXTVISION',
    role: 'Brawler',
    trait: 'Wide Obstacle Clears & Extra Battery',
    color: '#FF4639',
    assets: {
      cutout: '/assets/factions/tcl/cutout_transparent.png',
      hud: '/assets/factions/tcl/hud_portrait.png',
      avatar: '/assets/factions/tcl/avatar_small.png',
    },
    fullCard: '/levelup/runner/cards/tcl_display_brawler_card.png',
    stats: { power: 8, speed: 6, defense: 8, utility: 7 },
    abilities: [
      { slot: 1, label: 'Equalizer Blast', description: 'Wide area shockwave.', path: '/assets/factions/tcl/abilities/blast.svg' },
      { slot: 2, label: 'Power Smash', description: 'Heavy strike.', path: '/assets/factions/tcl/abilities/smash.svg' },
      { slot: 3, label: 'NXTV Core', description: 'Instant 20% battery.', path: '/assets/factions/tcl/abilities/core.svg' },
    ],
  },
  {
    id: 'pixel',
    name: 'Pixel Sentinel',
    role: 'Digital Tactician',
    trait: 'Predicts, Adapts, Dominates',
    color: '#9AE94A',
    assets: {
      cutout: '/assets/factions/pixel/cutout_transparent.png',
      hud: '/assets/factions/pixel/hud_portrait.png',
      avatar: '/assets/factions/pixel/avatar_small.png',
    },
    fullCard: '/levelup/runner/cards/pixel_scout_card.png',
    stats: { power: 6, speed: 9, defense: 5, utility: 10 },
    abilities: [
      { slot: 1, label: 'Data Swarm', description: 'Hacks nearby obstacles.', path: '/assets/factions/pixel/abilities/swarm.svg' },
      { slot: 2, label: 'Pixel Laser', description: 'Precision piercing beam.', path: '/assets/factions/pixel/abilities/laser.svg' },
      { slot: 3, label: 'Adaptive Protocol', description: 'Invulnerability for 3s.', path: '/assets/factions/pixel/abilities/protocol.svg' },
    ],
  },
  {
    id: 'apple',
    name: 'Apple Duelist',
    role: 'Precision Striker',
    trait: 'Perfect Timing & Clean Lane Control',
    color: '#9DD9FF',
    assets: {
      cutout: '/assets/factions/apple/cutout_transparent.png',
      hud: '/assets/factions/apple/hud_portrait.png',
      avatar: '/assets/factions/apple/avatar_small.png',
    },
    fullCard: '/levelup/runner/cards/apple_titanium_duelist_card.png',
    stats: { power: 7, speed: 9, defense: 8, utility: 10 },
    abilities: [
      { slot: 1, label: 'MagSafe Core', description: 'Pulls nearby rewards.', path: '/assets/factions/apple/abilities/blast.svg' },
      { slot: 2, label: 'Titanium Smash', description: 'Precision lane strike.', path: '/assets/factions/apple/abilities/smash.svg' },
      { slot: 3, label: 'Core Overdrive', description: 'Short speed burst.', path: '/assets/factions/apple/abilities/core.svg' },
    ],
  },
  {
    id: 'samsung',
    name: 'Samsung Warrior',
    role: 'Versatile Controller',
    trait: 'Adaptive Defense & Multi-Lens Reads',
    color: '#9B5CFF',
    assets: {
      cutout: '/assets/factions/samsung/cutout_transparent.png',
      hud: '/assets/factions/samsung/hud_portrait.png',
      avatar: '/assets/factions/samsung/avatar_small.png',
    },
    fullCard: '/levelup/runner/cards/samsung_foldwing_warrior_card.png',
    stats: { power: 10, speed: 8, defense: 8, utility: 10 },
    abilities: [
      { slot: 1, label: 'Lens Burst', description: 'Wide lens pulse.', path: '/assets/factions/samsung/abilities/blast.svg' },
      { slot: 2, label: 'Precision Spear', description: 'Pierces the safest route.', path: '/assets/factions/samsung/abilities/smash.svg' },
      { slot: 3, label: 'Multi-Lens Mode', description: 'Scans danger ahead.', path: '/assets/factions/samsung/abilities/core.svg' },
    ],
  },
  {
    id: 'motorola',
    name: 'Motorola Striker',
    role: 'Speed Runner',
    trait: 'Momentum Dashes & Fast Recovery',
    color: '#FF7A18',
    assets: {
      cutout: '/assets/factions/motorola/cutout_transparent.png',
      hud: '/assets/factions/motorola/hud_portrait.png',
      avatar: '/assets/factions/motorola/avatar_small.png',
    },
    fullCard: '/levelup/runner/cards/motorola_flip_rider_card.png',
    stats: { power: 7, speed: 10, defense: 6, utility: 8 },
    abilities: [
      { slot: 1, label: 'Speed Dash', description: 'Bursts through trouble.', path: '/assets/factions/motorola/abilities/blast.svg' },
      { slot: 2, label: 'Vortex Slash', description: 'Fast cutting strike.', path: '/assets/factions/motorola/abilities/smash.svg' },
      { slot: 3, label: 'Adrenaline Boost', description: 'Refills momentum.', path: '/assets/factions/motorola/abilities/core.svg' },
    ],
  },
];

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'apple',
    brand: 'Apple',
    series: 'iPhone Pro Series',
    name: 'Titanium Duelist',
    title: 'Precision engineered for the perfect run.',
    role: 'Precision / Speed',
    traitDescription: 'Clean timing, quick recovery, and precise lane clears reward reps who move with intent.',
    rarity: 'Legendary',
    tagline: 'Precision engineered for the perfect run.',
    lore: 'A surgical striker built from premium device DNA. Fast, exact, and clean under pressure.',
    accent: '#9DD9FF',
    secondary: '#EAF7FF',
    armor: '#B8C4D5',
    icon: '◌',
    cardImage: '/levelup/runner/cards/apple_titanium_duelist_card.png',
    heroImage: '/levelup/runner/heroes/apple_titanium_duelist_hero.png',
    portraitImage: '/levelup/runner/portraits/apple_titanium_duelist_portrait.png',
    assets: {
      cutout: '/levelup/runner/heroes/apple_titanium_duelist_hero.png',
      hudPortrait: '/levelup/runner/portraits/apple_titanium_duelist_portrait.png',
      avatar: '/levelup/runner/avatars/apple_titanium_duelist_avatar.png',
      abilityIcons: [
        {
          slot: 'smash',
          label: 'Titanium Smash',
          path: '/levelup/runner/abilities/apple-smash.png',
          description: 'Cuts through a tight hazard cluster and rewards clean timing.',
        },
        {
          slot: 'blast',
          label: 'MagSafe Core',
          path: '/levelup/runner/abilities/apple-blast.png',
          description: 'Pulls nearby rewards toward the runner during pressure moments.',
        },
        {
          slot: 'core',
          label: 'Core Overdrive',
          path: '/levelup/runner/abilities/apple-core.png',
          description: 'Turns precision movement into a short burst of route control.',
        },
      ],
    },
    signature: 'Titanium armor, camera-cluster shoulder, MagSafe core, sleek black visor.',
    passiveName: 'Perfect Parry',
    passiveDescription: 'Reflects obstacles, sharpens lane recovery, and rewards clean timing windows.',
    abilityName: 'MagSafe Core',
    abilityDescription: 'Magnetically pulls nearby power-ups and boosts speed.',
    ultimateName: 'Core Overdrive',
    ultimateDescription: 'Unleashes a burst of speed and perfect route control.',
    abilities: [
      {
        id: 'perfect_parry',
        name: 'Perfect Parry',
        type: 'passive',
        description: 'Reflects obstacles and stuns enemies.',
        gameplayEffect: 'Clean-hit reflection window with bonus score on near-miss timing.',
      },
      {
        id: 'magsafe_overcharge',
        name: 'MagSafe Core',
        type: 'active',
        description: 'Pulls nearby power-ups while boosting movement speed.',
        gameplayEffect: 'Temporary magnet plus speed buff.',
      },
      {
        id: 'precision_slash',
        name: 'Titanium Smash',
        type: 'ultimate',
        description: 'Cuts a clean lane through dense hazard clusters.',
        gameplayEffect: 'Clears a forward path and scores bonus combo.',
      },
      {
        id: 'a17_protocol',
        name: 'Core Overdrive',
        type: 'ultimate',
        description: 'Burst-speed field with perfect coin magnet.',
        gameplayEffect: 'Extended route control and pickup dominance during pressure spikes.',
      },
    ],
    flavor: 'Every move lands like a keynote reveal.',
    stats: { speed: 9, agility: 10, power: 7, durability: 8, tech: 10 },
    nativeStats: { power: 7, speed: 9, defense: 8, utility: 10, max: 10 },
    gameplay: {
      baseSpeedMultiplier: 1.07,
      dashRecharge: 0.22,
      dashBurstMultiplier: 1.18,
      scoreMultiplier: 1.12,
      abilityCooldown: 12,
      maxBatteryBonus: 0,
      triviaBonus: 0.05,
      sidekickCoreAffinity: 1.0,
    },
  },
  {
    id: 'samsung',
    brand: 'Samsung',
    series: 'Galaxy S Series',
    name: 'Foldwing Warrior',
    title: 'Unfold the power within.',
    role: 'Versatility / Control',
    traitDescription: 'A flexible control kit built for scanning lanes, stabilizing pressure, and adapting fast.',
    rarity: 'Legendary',
    tagline: 'Unfold the power within.',
    lore: 'A feature-heavy battle mech that turns raw capability into pressure and control.',
    accent: '#9B5CFF',
    secondary: '#D7C2FF',
    armor: '#473C66',
    icon: '◭',
    cardImage: '/levelup/runner/cards/samsung_foldwing_warrior_card.png',
    heroImage: '/levelup/runner/heroes/samsung_foldwing_warrior_hero.png',
    portraitImage: '/levelup/runner/portraits/samsung_foldwing_warrior_portrait.png',
    assets: {
      cutout: '/levelup/runner/heroes/samsung_foldwing_warrior_hero.png',
      hudPortrait: '/levelup/runner/portraits/samsung_foldwing_warrior_portrait.png',
      avatar: '/levelup/runner/avatars/samsung_foldwing_warrior_avatar.png',
      abilityIcons: [
        {
          slot: 'smash',
          label: 'Lens Burst',
          path: '/levelup/runner/abilities/samsung-smash.png',
          description: 'Fires a wide lens pulse that gives crowded lanes breathing room.',
        },
        {
          slot: 'blast',
          label: 'Precision Spear',
          path: '/levelup/runner/abilities/samsung-blast.png',
          description: 'Targets the cleanest opening for a high-precision route break.',
        },
        {
          slot: 'core',
          label: 'Multi-Lens Mode',
          path: '/levelup/runner/abilities/samsung-core.png',
          description: 'Scans ahead and boosts defensive control for the next hazard wave.',
        },
      ],
    },
    signature: 'Purple-black armor, fold-out wing panels, camera spine, stylus spear.',
    passiveName: 'Triple Lens System',
    passiveDescription: 'Three advanced lenses provide unmatched versatility on any battlefield.',
    abilityName: 'Lens Burst',
    abilityDescription: 'Fires an energy blast that damages enemies in a wide area.',
    ultimateName: 'Multi-Lens Mode',
    ultimateDescription: 'Activates all lenses to scan, predict, and create a protective field.',
    abilities: [
      {
        id: 'armor_unfold',
        name: 'Lens Burst',
        type: 'active',
        description: 'Fires an energy blast from all three lenses.',
        gameplayEffect: 'Short glide window and temporary barrier.',
      },
      {
        id: 's_pen_spear',
        name: 'Precision Spear',
        type: 'active',
        description: 'Zooms in and fires a high-precision shot.',
        gameplayEffect: 'Precise strike with bonus damage to boss weak points.',
      },
      {
        id: 'amoled_burst',
        name: 'Triple Lens System',
        type: 'passive',
        description: 'Reads lanes through three advanced lenses.',
        gameplayEffect: 'Visual clarity boost during dense hazard clusters.',
      },
      {
        id: 'infinity_display',
        name: 'Multi-Lens Mode',
        type: 'ultimate',
        description: 'Scans, predicts, and creates a protective energy field.',
        gameplayEffect: 'Burst scoring and wider control windows.',
      },
    ],
    flavor: 'A feature-packed thunderstorm with hinges.',
    stats: { speed: 8, agility: 9, power: 10, durability: 8, tech: 10 },
    nativeStats: { power: 10, speed: 8, defense: 8, utility: 10, max: 10 },
    gameplay: {
      baseSpeedMultiplier: 1.0,
      dashRecharge: 0.18,
      dashBurstMultiplier: 1.12,
      scoreMultiplier: 1.08,
      abilityCooldown: 13,
      maxBatteryBonus: 15,
      triviaBonus: 0.02,
      sidekickCoreAffinity: 1.05,
    },
  },
  {
    id: 'tcl',
    brand: 'TCL',
    series: 'NXTVISION Series',
    name: 'NXTVISION Brawler',
    title: 'The heaviest, safest-feeling build for space-clearing power.',
    role: 'Area Clear / Value Power',
    traitDescription: 'A heavy value brawler that clears space, banks score, and stays steady through impact.',
    rarity: 'Epic',
    tagline: 'The heaviest, safest-feeling build for space-clearing power.',
    lore: 'A durable display brawler that turns big screen energy into wide obstacle clears and value-heavy scoring.',
    accent: '#FF4639',
    secondary: '#FFB0A7',
    armor: '#2E1A1A',
    icon: '▣',
    cardImage: '/levelup/runner/cards/tcl_display_brawler_card.png',
    heroImage: '/levelup/runner/heroes/tcl_display_brawler_hero.png',
    portraitImage: '/levelup/runner/portraits/tcl_display_brawler_portrait.png',
    assets: {
      cutout: '/levelup/runner/heroes/tcl_display_brawler_hero.png',
      hudPortrait: '/levelup/runner/portraits/tcl_display_brawler_portrait.png',
      avatar: '/levelup/runner/avatars/tcl_display_brawler_avatar.png',
      abilityIcons: [
        {
          slot: 'smash',
          label: 'Power Smash',
          path: '/levelup/runner/abilities/tcl-smash.png',
          description: 'Punches through obstacles and opens safer room for slower decisions.',
        },
        {
          slot: 'blast',
          label: 'Equalizer Blast',
          path: '/levelup/runner/abilities/tcl-blast.png',
          description: 'Clears a wide hazard band and turns the opening into score pressure.',
        },
        {
          slot: 'core',
          label: 'NXTV Core',
          path: '/levelup/runner/abilities/tcl-core.png',
          description: 'Overloads the display core for a short heavy-scoring surge.',
        },
      ],
    },
    signature: 'Blocky display chest, speaker-grille limbs, red equalizer core, heavy frame.',
    passiveName: 'Bass Boost',
    passiveDescription: 'Temporarily enlarges the coin magnet radius and turns heavy clears into bigger reward windows.',
    abilityName: 'Equalizer Blast',
    abilityDescription: 'Fires a wide pulse that clears obstacles and pulls nearby coins.',
    ultimateName: 'NXTV Core',
    ultimateDescription: 'Overloads power systems for a massive boost.',
    abilities: [
      {
        id: 'equalizer_blast',
        name: 'Equalizer Blast',
        type: 'active',
        description: 'Fires a wide pulse that clears obstacles and pulls nearby coins.',
        gameplayEffect: 'Area clear plus short magnet effect.',
      },
      {
        id: 'sound_pulse',
        name: 'Power Smash',
        type: 'active',
        description: 'Heavy punch that destroys obstacles.',
        gameplayEffect: 'Barrier crack plus crowd-control window.',
      },
      {
        id: 'bass_boost',
        name: 'Bass Boost',
        type: 'passive',
        description: 'Temporarily enlarges coin magnet radius.',
        gameplayEffect: 'Larger pickup pull during heavy engagement.',
      },
      {
        id: 'cinemax_mode',
        name: 'NXTV Core',
        type: 'ultimate',
        description: 'Overloads power systems for a massive boost.',
        gameplayEffect: 'Big conversion moment for value-heavy runs.',
      },
    ],
    flavor: 'The aisle-end display that learned how to punch back.',
    stats: { speed: 6, agility: 5, power: 10, durability: 9, tech: 7 },
    nativeStats: { power: 10, speed: 6, defense: 9, utility: 7, max: 10 },
    gameplay: {
      baseSpeedMultiplier: 0.97,
      dashRecharge: 0.16,
      dashBurstMultiplier: 1.1,
      scoreMultiplier: 1.15,
      abilityCooldown: 14,
      maxBatteryBonus: 20,
      triviaBonus: 0.0,
      sidekickCoreAffinity: 1.0,
    },
  },
  {
    id: 'motorola',
    brand: 'Motorola',
    series: 'Moto Series',
    name: 'Turbo Striker',
    title: 'Built for speed. Strikes fast.',
    role: 'Speed / Momentum',
    traitDescription: 'Momentum rewards quick hands, fast lane changes, and aggressive recovery windows.',
    rarity: 'Epic',
    tagline: 'Built for speed. Strikes fast.',
    lore: 'A clean, aggressive speedliner with razr hinge wings and a momentum-first flow.',
    accent: '#FF7A18',
    secondary: '#36D9FF',
    armor: '#22363B',
    icon: '⌁',
    cardImage: '/levelup/runner/cards/motorola_flip_rider_card.png',
    heroImage: '/levelup/runner/heroes/motorola_flip_rider_hero.png',
    portraitImage: '/levelup/runner/portraits/motorola_flip_rider_portrait.png',
    assets: {
      cutout: '/levelup/runner/heroes/motorola_flip_rider_hero.png',
      hudPortrait: '/levelup/runner/portraits/motorola_flip_rider_portrait.png',
      avatar: '/levelup/runner/avatars/motorola_flip_rider_avatar.png',
      abilityIcons: [
        {
          slot: 'smash',
          label: 'Vortex Slash',
          path: '/levelup/runner/abilities/motorola-smash.png',
          description: 'Slices through a fast lane while keeping the runner in motion.',
        },
        {
          slot: 'blast',
          label: 'Speed Dash',
          path: '/levelup/runner/abilities/motorola-blast.png',
          description: 'Bursts forward to break spacing and recover from bad timing.',
        },
        {
          slot: 'core',
          label: 'Adrenaline Boost',
          path: '/levelup/runner/abilities/motorola-core.png',
          description: 'Charges mobility so repeated dashes feel sharper and faster.',
        },
      ],
    },
    signature: 'Electric orange speed lines, razr hinge wings, clean aggressive racer silhouette.',
    passiveName: 'Turbo Engine',
    passiveDescription: 'Builds momentum over time. The faster you go, the stronger you become.',
    abilityName: 'Speed Dash',
    abilityDescription: 'Dash forward at blinding speed and break through obstacles.',
    ultimateName: 'Adrenaline Boost',
    ultimateDescription: 'Overclock mobility, increase movement speed, and reduce cooldowns.',
    abilities: [
      {
        id: 'flip_boost',
        name: 'Speed Dash',
        type: 'active',
        description: 'Dash forward at blinding speed.',
        gameplayEffect: 'Burst speed opener.',
      },
      {
        id: 'hinge_dash',
        name: 'Vortex Slash',
        type: 'active',
        description: 'Spin and slash in a high-speed vortex.',
        gameplayEffect: 'Short mobility spike with invulnerability frames.',
      },
      {
        id: 'batwing_shield',
        name: 'Momentum Shift',
        type: 'defensive',
        description: 'Chain dashes and attacks to maintain flow.',
        gameplayEffect: 'One-hit protection during committed runs.',
      },
      {
        id: 'razr_rush',
        name: 'Adrenaline Boost',
        type: 'ultimate',
        description: 'Overclock movement speed and reduce ability cooldowns.',
        gameplayEffect: 'Multi-dash finisher with amplified combo flow.',
      },
    ],
    flavor: 'Pure arcade velocity in foldable form.',
    stats: { speed: 10, agility: 10, power: 7, durability: 7, tech: 8 },
    nativeStats: { power: 7, speed: 10, defense: 6, utility: 8, max: 10 },
    gameplay: {
      baseSpeedMultiplier: 1.08,
      dashRecharge: 0.3,
      dashBurstMultiplier: 1.28,
      scoreMultiplier: 1.05,
      abilityCooldown: 11,
      maxBatteryBonus: 0,
      triviaBonus: 0.0,
      sidekickCoreAffinity: 1.0,
    },
  },
  {
    id: 'pixel',
    brand: 'Pixel',
    series: 'Google Pixel Series',
    name: 'Neural Sentinel',
    title: 'Predict, adapt, and dominate.',
    role: 'Intelligence / Adapt',
    traitDescription: 'An AI-forward runner that reads the field early and turns route clarity into advantage.',
    rarity: 'Epic',
    tagline: 'Predict, adapt, and dominate.',
    lore: 'An advanced AI sentinel that reads enemy movements and adapts in real time.',
    accent: '#9AE94A',
    secondary: '#34D399',
    armor: '#E8EDF6',
    icon: '◎',
    cardImage: '/levelup/runner/cards/pixel_scout_card.png',
    heroImage: '/levelup/runner/heroes/pixel_scout_hero.png',
    portraitImage: '/levelup/runner/portraits/pixel_scout_portrait.png',
    assets: {
      cutout: '/levelup/runner/heroes/pixel_scout_hero.png',
      hudPortrait: '/levelup/runner/portraits/pixel_scout_portrait.png',
      avatar: '/levelup/runner/avatars/pixel_scout_avatar.png',
      abilityIcons: [
        {
          slot: 'smash',
          label: 'Data Swarm',
          path: '/levelup/runner/abilities/pixel-smash.png',
          description: 'Deploys helper data drones to track pickups and soften pressure.',
        },
        {
          slot: 'blast',
          label: 'Pixel Laser',
          path: '/levelup/runner/abilities/pixel-blast.png',
          description: 'Locks onto the safest opening and clears a precise forward line.',
        },
        {
          slot: 'core',
          label: 'Adaptive Protocol',
          path: '/levelup/runner/abilities/pixel-core.png',
          description: 'Analyzes the next pattern and boosts defensive routing for a beat.',
        },
      ],
    },
    signature: 'Clean white armor, green data visor, floating helper drones, AI-readout identity.',
    passiveName: 'Neural Overclock',
    passiveDescription: 'Enhances processing power to predict, adapt, and dominate.',
    abilityName: 'Data Swarm',
    abilityDescription: 'Deploys micro-drones that attack multiple enemies.',
    ultimateName: 'Adaptive Protocol',
    ultimateDescription: 'Analyzes the battlefield and boosts defenses.',
    abilities: [
      {
        id: 'ai_pathfind',
        name: 'Neural Overclock',
        type: 'passive',
        description: 'Predicts movement and adapts routes in real time.',
        gameplayEffect: 'Pathfinding lift with stronger trivia routing.',
      },
      {
        id: 'drone_swarm',
        name: 'Data Swarm',
        type: 'active',
        description: 'Deploys micro-drones that attack multiple enemies.',
        gameplayEffect: 'Track reveal plus remote collection.',
      },
      {
        id: 'photon_dash',
        name: 'Pixel Laser',
        type: 'defensive',
        description: 'Locks on and fires a precision beam.',
        gameplayEffect: 'Safe repositioning through pressure lanes.',
      },
      {
        id: 'google_lens',
        name: 'Adaptive Protocol',
        type: 'ultimate',
        description: 'Analyzes the battlefield and boosts defenses.',
        gameplayEffect: 'Enhanced pathfinding and crit bonus.',
      },
    ],
    flavor: 'Feels like the lane itself whispered the answer first.',
    stats: { speed: 8, agility: 9, power: 7, durability: 7, tech: 10 },
    nativeStats: { power: 7, speed: 8, defense: 7, utility: 10, max: 10 },
    gameplay: {
      baseSpeedMultiplier: 1.02,
      dashRecharge: 0.2,
      dashBurstMultiplier: 1.15,
      scoreMultiplier: 1.1,
      abilityCooldown: 10,
      maxBatteryBonus: 5,
      triviaBonus: 0.18,
      sidekickCoreAffinity: 1.1,
    },
  },
  {
    id: 'sidekick_core',
    brand: 'Kip',
    series: 'Sidekick Core',
    name: 'Kip',
    title: 'Operator. Guide. Ally.',
    role: 'AI Operator / Guide',
    traitDescription: 'A lightweight support operator that keeps routes readable and reinforces the active runner.',
    rarity: 'Legendary',
    tagline: 'Knowledge strengthens the signal.',
    lore: 'Kip is your AI operator and trusted ally. They activate Sidekick Core to unlock knowledge, solutions, and real-time guidance so you can focus on what matters.',
    accent: '#E20074',
    secondary: '#FF8CC6',
    armor: '#290019',
    icon: '✦',
    cardImage: '/levelup/runner/cards/tmobile_sidekick_core_command_card_v2.png',
    assets: {
      cutout: '/kip/hero.png',
      hudPortrait: '/kip/portrait.png',
      avatar: '/kip/orb.png',
      abilityIcons: [
        {
          slot: 'smash',
          label: 'Signal Save',
          path: '/assets/kip/kip_32_alert.svg',
          description: 'Warns the runner before a dangerous route collapses.',
        },
        {
          slot: 'blast',
          label: 'Sidekick Sync',
          path: '/assets/kip/kip_32_listening.svg',
          description: 'Highlights the safest lane and pulls useful rewards closer.',
        },
        {
          slot: 'core',
          label: 'Knowledge Signal',
          path: '/assets/kip/kip_32_success.svg',
          description: 'Amplifies the active runner with a short knowledge boost.',
        },
      ],
    },
    signature: 'A pocket-sized Sidekick Core assistant with an expressive magenta operator presence.',
    supportOnly: true,
    passiveName: 'Always On',
    passiveDescription: 'Kip keeps guidance available, lightweight, and ready when the run gets busy.',
    abilityName: 'Sidekick Sync',
    abilityDescription: 'Pulls in nearby rewards, reveals the safest lane, and adds a brief score multiplier.',
    ultimateName: 'Knowledge Signal',
    ultimateDescription: 'Projects a command grid over the whole track, slowing time and amplifying the active runner.',
    abilities: [
      {
        id: 'uncarrier_link',
        name: 'Always On',
        type: 'passive',
        description: 'Keeps guidance ready without blocking the run.',
        gameplayEffect: 'Global support aura.',
      },
      {
        id: 'sidekick_sync',
        name: 'Sidekick Sync',
        type: 'active',
        description: 'Pulls in nearby rewards, reveals the safest lane, and adds a brief score multiplier.',
        gameplayEffect: 'Magnet plus path reveal plus scoring buff.',
      },
      {
        id: 'signal_save',
        name: 'Signal Save',
        type: 'defensive',
        description: 'Prevents one lethal crash when fully charged.',
        gameplayEffect: 'One emergency save per charged run.',
      },
      {
        id: 'magenta_overdrive',
        name: 'Knowledge Signal',
        type: 'ultimate',
        description: 'Projects a command grid over the whole track, slowing time slightly and amplifying the current run.',
        gameplayEffect: 'Time slow, wide magnet, hazard highlight, and boosted current character identity.',
      },
    ],
    flavor: 'Stay connected. Stay in control. I have got you.',
    stats: { speed: 8, agility: 9, power: 6, durability: 9, tech: 10 },
    nativeStats: { power: 6, speed: 8, defense: 9, utility: 10, max: 10 },
    gameplay: {
      baseSpeedMultiplier: 1.03,
      dashRecharge: 0.24,
      dashBurstMultiplier: 1.18,
      scoreMultiplier: 1.14,
      abilityCooldown: 12,
      maxBatteryBonus: 10,
      triviaBonus: 0.12,
      sidekickCoreAffinity: 1.4,
    },
  },
];

export const CHARACTER_MAP: Record<CharacterId, CharacterDefinition> = CHARACTERS.reduce((acc, character) => {
  acc[character.id] = character;
  return acc;
}, {} as Record<CharacterId, CharacterDefinition>);

export const PLAYABLE_CHARACTERS = CHARACTERS.filter((character) => !character.supportOnly);
export const SIDEKICK_CORE = CHARACTER_MAP.sidekick_core;

export const RUNNER_BOSSES: BossDefinition[] = [
  {
    id: 'atlas_backbone',
    name: 'Atlas Backbone',
    title: 'The Iron Grid',
    threatLevel: 'MiniBoss',
    faction: 'Legacy Network Faction',
    fantasy: 'A legacy infrastructure brute that deploys heavy barriers and slows the pace of the grid.',
    visualTheme: 'Deep blue steel, white armor, glowing core energy, towers, and satellite motifs.',
    accent: '#2D9CFF',
    secondary: '#B7DCFF',
    emblem: '◍',
    assets: {
      banner: '/levelup/runner/bosses/atlas-backbone-banner.png',
      hudPortrait: '/levelup/runner/bosses/atlas-backbone-portrait.png',
      avatarSmall: '/levelup/runner/bosses/atlas-backbone-avatar.png',
    },
    mechanics: [
      'Drops tower walls into wide lanes',
      'Forces narrow routing windows',
      'Builds stacked barrier corridors',
    ],
    counterplay: [
      'Use burst mobility to break the tower rhythm',
      'Take the narrow lane early instead of drifting late',
      'Lean on Sidekick route reads when the track compresses',
    ],
    milestoneLevel: 1,
  },
  {
    id: 'redline_commander',
    name: 'Redline Commander',
    title: 'Crimson Dominion',
    threatLevel: 'MiniBoss',
    faction: 'Network Dominance Faction',
    fantasy: 'A command unit that locks lanes, raises tower shields, and punishes any deviation from order.',
    visualTheme: 'Deep red, black gunmetal, targeting motifs, tower shields, and military-grade armor.',
    accent: '#FF3030',
    secondary: '#FF8A8A',
    emblem: '✓',
    assets: {
      banner: '/levelup/runner/bosses/redline-commander-banner.png',
      hudPortrait: '/levelup/runner/bosses/redline-commander-portrait.png',
      avatarSmall: '/levelup/runner/bosses/redline-commander-avatar.png',
    },
    mechanics: ['Launches missile waves', 'Punishes center-lane camping', 'Creates heat-check dash windows'],
    counterplay: ['Save dash for missile breaks', 'Use scanner or support hints to pre-read fire lines', 'Punish volleys with precision abilities'],
    milestoneLevel: 2,
  },
  {
    id: 'patchwork_hydra',
    name: 'Patchwork Hydra',
    title: 'Fragment Syndicate',
    threatLevel: 'MiniBoss',
    faction: 'Fragmented Infrastructure',
    fantasy: 'A chaotic multi-head threat that splits paths, disrupts signals, and creates shifting unpredictable patterns.',
    visualTheme: 'Neon yellow, glitching patchwork armor, blue/orange/green heads, and exposed cables.',
    accent: '#FFC400',
    secondary: '#FF7A18',
    emblem: 'Ψ',
    assets: {
      banner: '/levelup/runner/bosses/patchwork-hydra-banner.png',
      hudPortrait: '/levelup/runner/bosses/patchwork-hydra-portrait.png',
      avatarSmall: '/levelup/runner/bosses/patchwork-hydra-avatar.png',
    },
    mechanics: ['Creates fake safe paths', 'Floods lanes with mixed hazard clusters', 'Baits pickups near danger'],
    counterplay: ['Trust the cleanest lane, not the loudest one', 'Use Sidekick intel to confirm the real opening', 'Clear heads with wide attacks before committing'],
    milestoneLevel: 3,
  },
  {
    id: 'throttle_maw',
    name: 'Throttle Maw',
    title: 'Congestion Collective',
    threatLevel: 'Boss',
    faction: 'Bandwidth Congestion',
    fantasy: 'A bloated traffic core that floods the grid with packets, drones, and slowdowns.',
    visualTheme: 'Neon purple, overloaded circuitry, cables everywhere, swarm drones, and a glowing maw.',
    accent: '#C653FF',
    secondary: '#FF5CFF',
    emblem: '◉',
    assets: {
      banner: '/levelup/runner/bosses/throttle-maw-banner.png',
      hudPortrait: '/levelup/runner/bosses/throttle-maw-portrait.png',
      avatarSmall: '/levelup/runner/bosses/throttle-maw-avatar.png',
    },
    mechanics: ['Speeds up hazard cadence', 'Chains stagger traps', 'Punishes delayed lane swaps'],
    counterplay: ['Keep momentum high', 'Use overclock and dash intentionally', 'Avoid panic cuts once the cadence snaps faster'],
    milestoneLevel: 4,
  },
  {
    id: 'dead_zone_titan',
    name: 'Dead Zone Titan',
    title: 'Total Blackout',
    threatLevel: 'FinalBoss',
    faction: 'Signal Annihilation',
    fantasy: 'A walking catastrophe that erases signal, corrupts the grid, and turns connection into nothing.',
    visualTheme: 'Toxic green, black armor, magenta void core, apocalyptic glitches, and fractured signal marks.',
    accent: '#8CE34A',
    secondary: '#FF3FB7',
    emblem: '∅',
    assets: {
      banner: '/levelup/runner/bosses/dead-zone-titan-banner.png',
      hudPortrait: '/levelup/runner/bosses/dead-zone-titan-portrait.png',
      avatarSmall: '/levelup/runner/bosses/dead-zone-titan-avatar.png',
    },
    mechanics: [
      'Blocks lanes with static walls',
      'Sends out jamming pulses',
      'Creates fake safe paths',
      'Suppresses coin magnet radius',
      'Summons glitch drones',
    ],
    counterplay: [
      'Use scan and reveal skills to expose the real lane',
      'Time dash or shield through pulse windows',
      'Answer boss trivia correctly for bonus damage or protection',
      'Use Sidekick Core ultimate to break the jam phase',
    ],
    milestoneLevel: 5,
  },
  {
    // Lore-only stub. Bell Sovereign is the monopoly machine at the center of
    // the grid — visible in skylines, billboard fragments, loading-screen
    // propaganda. Not yet a fightable boss. progressionEligible:false keeps it
    // out of getBossForLevel/getBossForProgress until that encounter is real.
    id: 'bell_sovereign',
    name: 'Bell Sovereign',
    title: 'The Monopoly Machine',
    threatLevel: 'HiddenArchitect',
    progressionEligible: false,
    faction: 'The Old Network Order',
    fantasy:
      'The unseen architect at the center of the grid — a legacy monopoly that bought the wires, the towers, and the rules, and turned connection into rent. Watching from billboards and skylines. Not fightable. Yet.',
    visualTheme:
      'Brass cathedral with bell-shaped lower body, ornate copper-and-rust mechanical detail, glowing magenta core eyes at the top, illuminated bell-mark sigil at the chest. Reads like a religious icon to the old monopoly.',
    // Wired to the cropped glory render from Bell Character 1 master sheet.
    // Used by the loading-screen propaganda card. WebP-first via <picture>.
    assets: {
      banner: '/levelup/runner/bosses/bell-banner.png',
      hudPortrait: '/levelup/runner/bosses/bell-portrait.png',
      avatarSmall: '/levelup/runner/bosses/bell-avatar.png',
    },
    accent: '#C9A24A',
    secondary: '#E8C547',
    emblem: '⚜',
    mechanics: [
      'Appears as background lore — billboards, skylines, loading-screen text',
      'Suppresses the grid silently; never engages a runner directly',
      'Reserved for future arc structure (Bell finale)',
    ],
    counterplay: [
      'Not yet engageable; lore-only presence',
      'Future: gauntlet structure with boss-specific suppression and crescendo',
    ],
    milestoneLevel: 6,
  },
];

export const PRIMARY_BOSS = RUNNER_BOSSES.find((boss) => boss.id === 'dead_zone_titan') ?? RUNNER_BOSSES[0];
export const getBossDefinition = (bossId: string | null | undefined) => RUNNER_BOSSES.find((boss) => boss.id === bossId) ?? null;
const isProgressionBoss = (boss: BossDefinition) => boss.progressionEligible !== false && boss.threatLevel !== 'HiddenArchitect';
export const getBossForLevel = (level: number) => RUNNER_BOSSES.find((boss) => isProgressionBoss(boss) && boss.milestoneLevel === level) ?? null;
export const getBossForProgress = (level: number) =>
  RUNNER_BOSSES
    .filter((boss) => isProgressionBoss(boss) && boss.milestoneLevel <= level)
    .sort((left, right) => right.milestoneLevel - left.milestoneLevel)[0] ?? null;

const LEGACY_TRIVIA: Array<Pick<TriviaQuestion, 'question' | 'options' | 'correctIndex' | 'explanation'>> = [
  {
    question: "Which premium plan offers a 'Yearly Upgrade' benefit and satellite-based service?",
    options: ['Experience Beyond', 'Experience More', 'Essentials Saver', 'Essentials Choice'],
    correctIndex: 0,
    explanation: "Experience Beyond is T-Mobile's top-tier plan featuring yearly upgrades and satellite service integration.",
  },
  {
    question: "What does the T-Mobile '5-Year Price Guarantee' promise to new and existing customers?",
    options: ['Free phones for 5 years', 'No plan price increases for 5 years', '50% off all lines', 'Free Netflix for 5 years'],
    correctIndex: 1,
    explanation: "The 5-Year Price Guarantee ensures that the price of your talk, text, and data won't change for 5 years.",
  },
  {
    question: 'Which of these streaming services can be included with qualifying T-Mobile plans?',
    options: ['Netflix, Hulu, and Apple TV+', 'Only Netflix', 'Disney+ and Max', 'Paramount+ only'],
    correctIndex: 0,
    explanation: 'Many T-Mobile premium plans include Netflix on Us, Hulu on Us, and Apple TV+ for a low monthly cost or even free.',
  },
  {
    question: "What is the benefit of '3rd Line Free' promotions on T-Mobile family plans?",
    options: ['The 3rd line pays double', 'The 3rd line is free via monthly bill credits', 'Only the 3rd line gets 5G', 'A free tablet with the 3rd line'],
    correctIndex: 1,
    explanation: 'T-Mobile frequently offers a 3rd line for free when you switch or add lines, creating massive family value.',
  },
  {
    question: "What does '5G UC' stand for on the T-Mobile network?",
    options: ['5G Ultra Capacity', '5G Universal Coverage', '5G Unlimited Connection', '5G Under Core'],
    correctIndex: 0,
    explanation: '5G UC (Ultra Capacity) provides significantly faster speeds and better performance in densely populated areas.',
  },
  {
    question: "What is the primary benefit of 'Experience More' compared to Essentials plans?",
    options: ['No streaming perks', 'Unlimited Premium Data and higher hotspot limits', 'Only for 55+ customers', 'Requires a 2-year contract'],
    correctIndex: 1,
    explanation: "Experience More provides Unlimited Premium Data that won't slow down based on how much you use, plus more hotspot data.",
  },
  {
    question: "What is the 'Un-carrier' approach to customer pain points?",
    options: ['Charging more for speed', 'Fixing industry issues like contracts and hidden fees', 'Requiring paper billing', 'Only selling one brand of phone'],
    correctIndex: 1,
    explanation: "T-Mobile's Un-carrier identity is built on eliminating traditional wireless industry frustrations.",
  },
  {
    question: 'How can a T-Mobile Sales Advocate best ease friction for a stressed customer?',
    options: ['By talking faster', 'By simplifying plan choices and highlighting total value', 'By ignoring their questions', 'By reading the fine print only'],
    correctIndex: 1,
    explanation: 'Empathy and simplification are key to the T-Mobile experience, ensuring customers feel confident in their choice.',
  },
  {
    question: "Which T-Mobile app provides customers with free weekly 'Thank You' gifts and deals?",
    options: ['T-Life (T-Mobile Tuesdays)', 'T-Mobile Billing', 'Network Test', 'Device Repair'],
    correctIndex: 0,
    explanation: 'T-Life (formerly T-Mobile Tuesdays) is where customers get exclusive deals and free items every week.',
  },
  {
    question: "What is 'Simplified Value' in the context of T-Mobile Essentials plans?",
    options: ['Paying for every individual megabyte', 'A no-frills plan focused on basic unlimited needs', 'A plan with no data included', 'A plan that only works at night'],
    correctIndex: 1,
    explanation: 'Essentials plans focus on providing the core Un-carrier benefits and unlimited talk, text, and data at the lowest price.',
  },
  {
    question: "What is the T-Mobile 'Keep & Switch' program designed to do?",
    options: ['Force you to keep your old carrier', 'Pay off your eligible device up to $800 to help you switch', 'Make you sign a new contract', 'Keep your data speed throttled'],
    correctIndex: 1,
    explanation: "Keep & Switch helps customers escape the trap of phone financing with other carriers by paying off their eligible device up to $800.",
  },
  {
    question: "What feature does T-Mobile's 'Scam Shield' offer?",
    options: ['Sends scam texts to friends', 'Automatically blocks likely scam callers at the network level', 'Charges a fee for blocking calls', 'Blocks all unknown numbers entirely'],
    correctIndex: 1,
    explanation: 'Scam Shield is a suite of tools offered for free to customers to identify and block annoying and dangerous scam calls.',
  },
  {
    question: 'Which team handles elite, hyper-localized customer service at T-Mobile?',
    options: ['The Team of Experts (TEX)', 'The Call Center Central', 'The Support Bot', 'The Network Team'],
    correctIndex: 0,
    explanation: 'T-Mobile pioneered the Team of Experts model, giving customers a dedicated, localized team rather than an automated phone maze.',
  },
  {
    question: "What was T-Mobile's famous 'Binge On' move (which led to today's streaming freedom)?",
    options: ['Charging for video streaming', 'Allowing customers to stream video without using their high-speed data', 'Banning video streaming', 'Throttling all video to 144p'],
    correctIndex: 1,
    explanation: 'Binge On was a massive Un-carrier move that freed customers from worrying about hitting data caps while watching video.',
  },
  {
    question: "How long does the Experience Beyond 'Yearly Upgrade' status require you to wait before upgrading?",
    options: ['2 Years', '1 Year (as long as the phone is half paid off)', '3 Years', '6 Months'],
    correctIndex: 1,
    explanation: 'With the Yearly Upgrade benefit on premium plans, customers can get the same phone deals as new customers every year.',
  },
  {
    question: "What is 'T-Mobile Home Internet' primarily powered by?",
    options: ['Fiber optic cables to the home', 'Dial-up', 'The T-Mobile 5G Network', 'Satellite dishes'],
    correctIndex: 2,
    explanation: 'T-Mobile 5G Home Internet leverages the massive capacity of the 5G network to deliver broadband speeds via a simple gateway.',
  },
  {
    question: "Which of these is considered an 'Un-carrier' principle?",
    options: ['Hidden limits', 'Customer first, always', 'Rigorous contracts', 'Data throttling for all'],
    correctIndex: 1,
    explanation: 'The core of the Un-carrier philosophy is challenging industry norms to put the customer first, treating them right.',
  },
  {
    question: "What happens to the price of a customer's plan when they look at their bill on a premium 'Taxes & Fees Included' plan?",
    options: ['It fluctuates every month', 'It increases due to local taxes', 'What you see is what you pay', 'It includes hidden surcharges'],
    correctIndex: 2,
    explanation: 'For plans like Experience More, T-Mobile covers the taxes and fees, so your bill is exactly the plan price.',
  },
  {
    question: 'Which coverage benefit is often included for T-Mobile customers traveling internationally?',
    options: ['No service abroad', 'Free unlimited 2G data and texting in 215+ countries', 'An instant $100 roaming charge', 'Data is charged by the megabyte'],
    correctIndex: 1,
    explanation: 'T-Mobile fundamentally changed international travel by offering free texting and basic data abroad on qualifying plans.',
  },
  {
    question: 'When a customer brings their own device (BYOD) to T-Mobile, what is their biggest advantage?',
    options: ['They lose their phone number', 'No activation fees on the web and cheaper monthly plan options', 'They must buy a new charger', 'They get worse network priority'],
    correctIndex: 1,
    explanation: 'BYOD makes it incredibly easy and frictionless for a customer to switch without the financial burden of financing a new device.',
  },
  {
    question: 'What makes T-Mobile 5G unique compared to solely relying on mmWave technology?',
    options: ['It only works outdoors', 'It relies entirely on satellites', "It uses a dedicated 'Layer Cake' approach combining low, mid, and high bands", 'It is slower than 4G LTE'],
    correctIndex: 2,
    explanation: "T-Mobile uses a 'layer cake' strategy: Low-band for broad coverage, Mid-band (Ultra Capacity) for speed, and High-band (mmWave) for density.",
  },
  {
    question: 'Why should an employee recommend T-Mobile Tuesdays (T-Life)?',
    options: ['It costs extra each month', 'It forces customers to buy more data', 'It builds brand loyalty by showing appreciation with real perks and freebies', 'It only works for new customers'],
    correctIndex: 2,
    explanation: 'T-Life rewards customers simply for being with T-Mobile, increasing retention and overall satisfaction.',
  },
  {
    question: "What defines the 'Carrier' mentality that T-Mobile opposes?",
    options: ['Treating the customer fairly', 'Locking customers in with complex rules, exploding bills, and poor service', 'Lowering prices over time', 'Offering free device upgrades'],
    correctIndex: 1,
    explanation: 'The traditional carrier model relies on making it difficult for customers to leave and difficult to understand their bills.',
  },
  {
    question: "How does T-Mobile treat 'Simple Global' data roaming on its premium plans?",
    options: ['It slows down to dial-up speeds everywhere', 'You get a bucket of high-speed data (like 5GB) in 215+ countries, then basic speeds', "It doesn't work in Europe", 'It requires a physical SIM swap'],
    correctIndex: 1,
    explanation: 'Premium plans like Experience Beyond include high-speed data buckets abroad, eliminating the anxiety of international roaming.',
  },
  {
    question: "What is 'JUMP! On Demand'?",
    options: ['A trampoline park discount', 'An older program that allows customers to upgrade their leased device rapidly', 'A new 5G speed tier', 'A premium streaming service'],
    correctIndex: 1,
    explanation: 'JUMP! On Demand was one of the first programs to let customers constantly have the latest smartphone via a lease agreement.',
  },
  {
    question: "HESITATION: 'I like my current carrier, I don't see why I should go through the hassle of switching.'",
    options: ['Tell them they are wrong', 'Offer an incredible phone deal, lower monthly costs, and VIP perks like Netflix on Us to show total value', 'Focus only on network speed', 'Tell them switching takes weeks'],
    correctIndex: 1,
    explanation: "Overcome complacency by uncovering pain points they've accepted as 'normal' and highlighting immediate, tangible value.",
  },
  {
    question: "HESITATION: 'I am worried about coverage outside the city.'",
    options: ["Assure them it's fine, even if you don't know", 'Say we only cover cities', 'Explain our 5G layer-cake strategy and offer a 3-month free Network Pass to test it themselves', 'Blame the terrain'],
    correctIndex: 2,
    explanation: 'Network Pass is the ultimate trump card for coverage objections. It lets them see the network power for free with zero risk.',
  },
  {
    question: "HESITATION: 'I owe $600 on my phone with Verizon right now.'",
    options: ['Tell them to wait a year', 'Show them how Keep & Switch will pay off up to $800 of their eligible device to escape the trap', 'Ask them to take out a loan', 'Tell them to sell their phone online'],
    correctIndex: 1,
    explanation: "Keep & Switch completely removes the friction of being financially locked into another carrier's device.",
  },
  {
    question: "HESITATION: 'T-Mobile's premium plan is slightly more expensive per line than my prepaid setup.'",
    options: ['Give up on the sale', 'Tell them prepaid is garbage', 'Calculate total value, including included taxes and fees, Netflix, Apple TV+, and AAA, showing them they save money overall', 'Offer an unauthorized discount'],
    correctIndex: 2,
    explanation: "Prepaid looks cheap until you calculate the missing perks and add taxes. Uncover the 'Total Cost of Ownership'.",
  },
  {
    question: "HESITATION: 'I travel to Europe a lot, and data roaming is too expensive.'",
    options: ['Tell them to buy a new phone over there', 'Explain that Simple Global includes free texting and data in 215+ countries without needing a new SIM', 'Say they should use hotel Wi-Fi only', 'Offer them an expensive daily pass'],
    correctIndex: 1,
    explanation: 'Simple Global obliterates roaming hesitation by giving peace of mind immediately when touching down internationally.',
  },
  {
    question: "HESITATION: 'I do not want to buy a new phone, I like the one I have.'",
    options: ['Refuse to activate service', 'Tell them their phone is obsolete', 'Welcome them with Bring Your Own Device (BYOD) and check if they qualify for a Keep & Switch rebate', 'Force them into a lease'],
    correctIndex: 2,
    explanation: 'BYOD is the lowest-friction way to acquire a customer. Always embrace a customer who loves their current device.',
  },
  {
    question: "HESITATION: 'Is T-Mobile Home Internet really fast enough for gaming and streaming?'",
    options: ["Say it's better than fiber", 'Ignore the question', 'Explain it is powered by 5G and offer the 15-day Test Drive so they can prove it in their own home risk-free', 'Tell them to keep their cable'],
    correctIndex: 2,
    explanation: 'The 15-Day Test Drive overcomes all Home Internet performance hesitations by letting the customer be the judge.',
  },
  {
    question: "HESITATION: 'I hate dealing with complicated bills that change every month.'",
    options: ['Tell them to set up autopay and look away', 'Agree that billing is confusing', 'Highlight that on our premium plans, taxes and fees are already included, so the price they see is the exact price they pay', 'Say the government changes the taxes'],
    correctIndex: 2,
    explanation: "Taxes and fees included is a massive differentiator that directly addresses the pain point of 'bill shock'.",
  },
  {
    question: "HESITATION: 'I am afraid I'll hate the service after I switch.'",
    options: ['Make them sign a 2-year contract just in case', "Say 'too bad'", "Remind them T-Mobile has zero annual service contracts and they aren't locked in", 'Offer a refund on the spot'],
    correctIndex: 2,
    explanation: "Reminding a customer that they aren't trapped by a contract relieves massive anxiety at the point of sale.",
  },
  {
    question: "HESITATION: 'I don't know how to set up my new phone or move my photos.'",
    options: ['Hand them the box and say good luck', 'Tell them to go to the Apple or Samsung store', 'Assure them you will provide full VIP onboarding and handle the data transfer before they even leave the store', 'Tell them their kids can do it'],
    correctIndex: 2,
    explanation: 'Offering full onboarding eliminates the technical friction and fear of losing precious memories during an upgrade.',
  },
  {
    question: "HESITATION: 'The trade-in deals always seem like a scam where I get nothing.'",
    options: ['Agree with them', 'Walk them through the easy trade-in process, showing exactly what their device is worth today and explaining the promotional bill credits clearly', 'Tell them to sell it on Craigslist instead', 'Deflect to another topic'],
    correctIndex: 1,
    explanation: 'Transparency is key. Breaking down exactly how the promotional credits work builds trust right when they expect a trick.',
  },
  {
    question: "HESITATION: 'There's a lot of fine print, right?'",
    options: ['Tell them not to read it', 'Hand them a magnifying glass', 'Emphasize our Un-carrier philosophy: no hidden fees, no annual service contracts, and what you see is what you pay', 'Offer to skip the paperwork'],
    correctIndex: 2,
    explanation: 'Leaning on the Un-carrier identity reassures them that T-Mobile structurally operates differently than the competitors.',
  },
  {
    question: "HESITATION: 'I need to talk to my spouse before I commit.'",
    options: ["Tell them their spouse will be fine with it", 'Let them leave without any materials', 'Text them a personalized quote link with all the savings clearly mapped out, so they can easily review it together at home', 'Pressure them to sign immediately'],
    correctIndex: 2,
    explanation: 'Providing a clear, persistent quote empowers them to champion the deal at home without feeling high-pressure sales tactics.',
  },
  {
    question: "HESITATION: 'I get lots of scam calls, how does T-Mobile help?'",
    options: ['Tell them to stop answering the phone', "Say it's a global issue nobody can fix", 'Show them the free Scam Shield app that blocks millions of scam calls at the network level', 'Offer them a paid third-party app'],
    correctIndex: 2,
    explanation: 'Scam Shield is an incredible free tool that directly targets a massive consumer frustration.',
  },
  {
    question: "HESITATION: 'I am worried about losing my number if I switch.'",
    options: ['Tell them a new number is a fresh start', 'Say the system sometimes loses numbers', 'Explain the smooth porting process that safely brings their number over, often within minutes', 'Refuse to port their number'],
    correctIndex: 2,
    explanation: 'Porting fear is common. Reassuring the customer of the speed and safety of the system closes the door on this hesitation.',
  },
] as const;

const ADVANCED_TRIVIA: TriviaQuestion[] = [
  {
    id: 'advanced-discovery-1',
    question: 'A customer says “I just want the cheapest option.” What is the strongest next move?',
    options: [
      'Immediately quote the lowest plan and stop there',
      'Ask one discovery question about usage so value does not get mismatched to need',
      'Push the most expensive plan to anchor them high',
      'Switch the conversation to accessories',
    ],
    correctIndex: 1,
    explanation: '“Cheapest” often means “lowest risk.” A single discovery question prevents under-selling or putting the customer in the wrong plan.',
    difficulty: 2,
    category: 'discovery',
  },
  {
    id: 'advanced-discovery-2',
    question: 'Which discovery question best opens the door to a stronger bundle conversation?',
    options: [
      'What color phone do you want?',
      'How many lines, devices, or internet needs are in your household today?',
      'Do you prefer paper or email receipts?',
      'Would you like a case with that?',
    ],
    correctIndex: 1,
    explanation: 'Household scope is the hinge that opens lines, internet, wearable, and entertainment value all at once.',
    difficulty: 2,
    category: 'bundles',
  },
  {
    id: 'advanced-sales-1',
    question: 'When a customer becomes overwhelmed by too many options, what usually closes the sale faster?',
    options: [
      'Adding even more options to prove flexibility',
      'Narrowing to a confident top-two recommendation with a clear “why”',
      'Reading every available promotion out loud',
      'Letting them browse silently without guidance',
    ],
    correctIndex: 1,
    explanation: 'Confident curation lowers friction. Great reps reduce complexity instead of decorating it.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-sales-2',
    question: 'A shopper cares most about photos, intelligent tools, and a “smart” experience. Which device direction best fits that language?',
    options: ['Pixel-style recommendation', 'A random entry device', 'Only a hotspot line', 'A tablet bundle first'],
    correctIndex: 0,
    explanation: 'Match the device story to the customer story. When AI, camera, and “smart help” language shows up, Pixel framing fits naturally.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-sales-3',
    question: 'A customer wants premium build quality and a polished ecosystem feeling. Which archetype should rise first?',
    options: ['TCL-style value pick', 'Apple-style recommendation', 'Only prepaid', 'Home Internet before phones'],
    correctIndex: 1,
    explanation: 'Premium feel, polish, and ecosystem language are usually strong signals for an Apple-led recommendation.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-sales-4',
    question: 'A customer says they multitask, take notes constantly, and want a “do-everything” phone. Which direction is strongest?',
    options: ['Samsung-style flagship recommendation', 'Flip immediately to accessories only', 'A single-line watch plan', 'Avoid recommending a device at all'],
    correctIndex: 0,
    explanation: 'When the customer describes productivity, power, and feature depth, a Samsung flagship story usually lands well.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-sales-5',
    question: 'A customer wants the “best value” with a large screen and less payment stress. Which framing is strongest?',
    options: ['Lead with a TCL-style value story', 'Lead with the priciest model possible', 'Avoid talking about budget', 'Say every phone is basically the same'],
    correctIndex: 0,
    explanation: 'Value-plus-display language is a natural opening for TCL-style positioning.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-sales-6',
    question: 'A customer wants something sleek, fast, and a little different. Which archetype matches best?',
    options: ['Motorola / foldable speed story', 'Only home internet', 'A fixed wireless gateway first', 'No device recommendation'],
    correctIndex: 0,
    explanation: 'Reps win when they match vibe as well as specs. Distinctive, fast, and stylish cues fit Motorola’s lane well.',
    difficulty: 2,
    category: 'devices',
  },
  {
    id: 'advanced-objection-1',
    question: 'A customer says, “I need time to think.” What keeps the sale alive without feeling pushy?',
    options: [
      'Tell them the deal expires in ten minutes no matter what',
      'Send a simple recap with savings, trade details, and next-step clarity',
      'Call them repeatedly until they answer',
      'End the conversation with no follow-up option',
    ],
    correctIndex: 1,
    explanation: 'Good follow-up lowers mental load. A clean recap keeps momentum without pressure.',
    difficulty: 2,
    category: 'objection',
  },
  {
    id: 'advanced-objection-2',
    question: 'A customer focuses only on monthly cost. What do top reps do next?',
    options: [
      'Ignore value and talk only about color options',
      'Translate perks, taxes, switching help, and device costs into total monthly reality',
      'Refuse to discuss budget',
      'Promise a rate you cannot verify',
    ],
    correctIndex: 1,
    explanation: 'Monthly sticker price without context hides the real story. Total value selling closes the gap.',
    difficulty: 3,
    category: 'sales',
  },
  {
    id: 'advanced-objection-3',
    question: 'A shopper is loyal to another carrier but seems curious. What is the strongest low-friction move?',
    options: [
      'Attack the other carrier personally',
      'Invite them into a risk-reduced test or switching path with simple proof points',
      'Tell them to come back next year',
      'Skip discovery and just print a receipt',
    ],
    correctIndex: 1,
    explanation: 'Curious customers rarely need pressure. They need proof, simplicity, and a low-friction next step.',
    difficulty: 3,
    category: 'objection',
  },
  {
    id: 'advanced-bundle-1',
    question: 'A family asks about phones for three lines, streaming value, and internet at home. What sales posture usually wins?',
    options: [
      'Quote each item separately with no story',
      'Build one connected household solution and show the stacked value clearly',
      'Only discuss one phone and ignore the rest',
      'Recommend they split services across multiple carriers',
    ],
    correctIndex: 1,
    explanation: 'Household selling is orchestration. The more clearly the bundle story hangs together, the easier the yes becomes.',
    difficulty: 3,
    category: 'bundles',
  },
  {
    id: 'advanced-bundle-2',
    question: 'What is the biggest mistake when bundling several services in one conversation?',
    options: [
      'Connecting the recommendation back to their goals',
      'Piling on items without a clear reason for each one',
      'Summarizing savings cleanly',
      'Checking whether every item solves a real need',
    ],
    correctIndex: 1,
    explanation: 'Bundles should feel elegant, not stuffed. Every line item needs a purpose the customer can repeat later.',
    difficulty: 3,
    category: 'bundles',
  },
  {
    id: 'advanced-service-1',
    question: 'When helping someone port their number, what feeling are you trying to create most of all?',
    options: ['Urgency without explanation', 'Confidence that the process is safe and guided', 'Confusion so they stop asking', 'Dependence on guesswork'],
    correctIndex: 1,
    explanation: 'Port anxiety is emotional before it is technical. Guided confidence keeps the sale steady.',
    difficulty: 2,
    category: 'service',
  },
  {
    id: 'advanced-service-2',
    question: 'Which onboarding promise creates the most trust after a device upgrade?',
    options: ['We will get you out fast, even if setup is incomplete', 'We will help you leave with your essentials transferred and confidence to use the phone', 'There is no support after purchase', 'You should read forums later'],
    correctIndex: 1,
    explanation: 'People do not buy only the phone. They buy the confidence that life will work on the new phone right away.',
    difficulty: 2,
    category: 'service',
  },
  {
    id: 'advanced-sales-7',
    question: 'A rep has explained features for five straight minutes and the customer looks glazed over. What is the best rescue?',
    options: ['Double the pace and add more detail', 'Pause and ask which one or two outcomes matter most to them', 'Switch to reading legal disclaimers', 'Start over from the beginning'],
    correctIndex: 1,
    explanation: 'When attention drops, return to outcomes. Customers buy answers to priorities, not feature avalanches.',
    difficulty: 3,
    category: 'discovery',
  },
  {
    id: 'advanced-sales-8',
    question: 'Which closing question is strongest after a customer has clearly reacted well to the recommendation?',
    options: ['Do you maybe sorta want this one?', 'Would you like me to set this up with your number and trade-in now?', 'Should I list every other option again?', 'Want to decide later with no next step?'],
    correctIndex: 1,
    explanation: 'Great closes feel natural, confident, and operational. They move the customer into the next easy action.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-sales-9',
    question: 'A customer says, “That perk is nice, but I do not use it.” What is the right move?',
    options: ['Keep repeating the same perk louder', 'Shift the value story to benefits they actually care about', 'Drop the sale completely', 'Argue that they are wrong about themselves'],
    correctIndex: 1,
    explanation: 'Relevant value converts. Irrelevant value is wallpaper.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-objection-4',
    question: 'A customer worries that switching sounds like a hassle because their family is busy. What response is strongest?',
    options: ['Tell them busy people should not switch', 'Position the process as guided, supported, and designed to remove busywork from them', 'Ask them to do everything at home alone', 'Say hassle is normal in wireless'],
    correctIndex: 1,
    explanation: 'When the real objection is time and energy, the answer is friction removal.',
    difficulty: 3,
    category: 'objection',
  },
  {
    id: 'advanced-sales-10',
    question: 'Which habit most often separates a good sales conversation from a great one?',
    options: ['Feature dumping', 'Linking every recommendation back to a customer-stated need', 'Talking over objections', 'Skipping recap'],
    correctIndex: 1,
    explanation: 'The strongest sales conversations feel customized because they literally are.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-bundles-3',
    question: 'A customer is interested in Home Internet but is still unsure. What pushes confidence without pressure?',
    options: ['Telling them every home is exactly the same', 'Offering a proof-oriented trial or test-drive mindset', 'Avoiding performance discussion entirely', 'Guaranteeing impossible speed numbers'],
    correctIndex: 1,
    explanation: 'When performance anxiety is the barrier, proof beats persuasion.',
    difficulty: 3,
    category: 'bundles',
  },
  {
    id: 'advanced-discovery-3',
    question: 'A customer asks, “Which phone should I get?” What is the strongest first answer?',
    options: ['The most expensive one, obviously', 'Tell me what matters most: camera, battery, ecosystem, value, or something else', 'Any phone is fine', 'Read five random spec sheets'],
    correctIndex: 1,
    explanation: 'The right recommendation starts with a filter, not a guess.',
    difficulty: 1,
    category: 'discovery',
  },
  {
    id: 'advanced-sales-11',
    question: 'When should a rep introduce accessories or add-ons most effectively?',
    options: ['Before needs are clear', 'After the core solution is trusted and the add-on clearly protects or improves that choice', 'Before greeting the customer', 'Only after the customer leaves'],
    correctIndex: 1,
    explanation: 'Add-ons land best when they feel like protection or enhancement, not detours.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-sales-12',
    question: 'Which statement best describes a high-trust quote recap?',
    options: ['Dense, fast, and hard to repeat later', 'Clear on monthly reality, trade terms, perks, and what happens next', 'Only focused on the flashiest promotion', 'Vague on purpose'],
    correctIndex: 1,
    explanation: 'If the customer cannot repeat your offer simply, the close is still fragile.',
    difficulty: 3,
    category: 'sales',
  },
  {
    id: 'advanced-objection-5',
    question: 'A customer keeps circling back to price even after value was shown. What might be the hidden issue?',
    options: ['They hate all wireless stores', 'They may still feel uncertain, rushed, or unconvinced on fit', 'They probably did not hear anything you said', 'There is no issue at all'],
    correctIndex: 1,
    explanation: 'Price is often the surface objection sitting on top of confidence, fit, or timing.',
    difficulty: 4,
    category: 'objection',
  },
  {
    id: 'advanced-sales-13',
    question: 'In a strong recommendation, what should come right after “Here is what I’d do if I were in your shoes”?',
    options: ['A concrete why tied to their needs', 'A random joke', 'An unrelated accessory pitch', 'Nothing at all'],
    correctIndex: 0,
    explanation: 'Authority without reasoning feels pushy. Authority with relevant reasoning feels helpful.',
    difficulty: 2,
    category: 'sales',
  },
  {
    id: 'advanced-service-3',
    question: 'What keeps a customer from feeling buyer’s remorse right after they say yes?',
    options: ['Silence', 'A calm confirmation of what they chose, why it fits, and what happens next', 'A brand-new upsell immediately', 'A technical lecture'],
    correctIndex: 1,
    explanation: 'The moment right after yes is when confidence either settles in or leaks out.',
    difficulty: 3,
    category: 'service',
  },
  {
    id: 'advanced-bundle-4',
    question: 'What is the smartest way to use a family decision-maker who needs to sell the idea at home?',
    options: ['Push them to decide before they leave', 'Equip them with a crisp summary they can champion later', 'Tell them not to mention cost', 'Give them only verbal details'],
    correctIndex: 1,
    explanation: 'Great reps create internal advocates, not just momentary agreement.',
    difficulty: 3,
    category: 'bundles',
  },
  {
    id: 'advanced-service-4',
    question: 'A customer is anxious about learning a new phone. Which reply lowers friction the fastest?',
    options: ['You will figure it out eventually', 'We will get you started, transfer what matters, and show you the essentials before you go', 'Maybe ask someone younger later', 'Just watch videos online'],
    correctIndex: 1,
    explanation: 'Confidence grows when support is concrete, immediate, and human.',
    difficulty: 2,
    category: 'service',
  },
];

const inferLegacyCategory = (question: string): TriviaQuestion['category'] => {
  const q = question.toLowerCase();
  if (q.startsWith('hesitation')) return 'objection';
  if (q.includes('5g') || q.includes('network') || q.includes('coverage') || q.includes('roaming')) return 'network';
  if (q.includes('plan') || q.includes('price') || q.includes('taxes') || q.includes('upgrade')) return 'plans';
  if (q.includes('home internet') || q.includes('third line') || q.includes('netflix') || q.includes('hulu') || q.includes('apple tv')) return 'bundles';
  if (q.includes('customer') || q.includes('switch') || q.includes('onboarding')) return 'sales';
  return 'service';
};

const inferLegacyDifficulty = (question: string): 1 | 2 | 3 | 4 => {
  const q = question.toLowerCase();
  if (q.startsWith('hesitation')) return 3;
  if (q.includes('layer cake') || q.includes('simple global') || q.includes('yearly upgrade')) return 2;
  return 1;
};

const sanitizeTriviaQuestion = (question: Partial<TriviaQuestion>, fallbackId: string): TriviaQuestion | null => {
  if (!question.question || !question.options || typeof question.correctIndex !== 'number' || !question.explanation) return null;
  if (!Array.isArray(question.options) || question.options.length < 2) return null;

  const difficultyRaw = question.difficulty ?? 2;
  const difficulty = ([1, 2, 3, 4].includes(difficultyRaw as number) ? difficultyRaw : 2) as 1 | 2 | 3 | 4;
  const category = (question.category || 'sales') as TriviaQuestion['category'];

  return {
    id: question.id || fallbackId,
    question: question.question,
    options: question.options,
    correctIndex: question.correctIndex,
    explanation: question.explanation,
    difficulty,
    category,
    healthReward: question.healthReward,
    scoreReward: question.scoreReward,
  };
};

const BASE_TRIVIA_DECK: TriviaQuestion[] = LEGACY_TRIVIA.map((q, index) => ({
  id: `legacy-${index}`,
  question: q.question,
  options: [...q.options],
  correctIndex: q.correctIndex,
  explanation: q.explanation,
  difficulty: inferLegacyDifficulty(q.question),
  category: inferLegacyCategory(q.question),
})).concat(ADVANCED_TRIVIA);

export const T_MOBILE_TRIVIA: TriviaQuestion[] = BASE_TRIVIA_DECK;

export const T_MOBILE_FACTS: string[] = [
  "T-Mobile's 5-Year Price Guarantee ensures your core plan cost won't go up.",
  "T-Mobile's 5G Ultra Capacity covers over 300 million people.",
  'T-Life (formerly T-Mobile Tuesdays) gives you free stuff every week.',
  'Many premium plans include Apple TV+, Netflix, and Hulu on Us.',
  'T-Mobile provides free in-flight Wi-Fi on select domestic flights.',
  'T-Mobile often offers a 3rd line free when adding multiple lines.',
  'Experience Beyond plans include yearly device upgrades.',
  "T-Mobile can pay off your devices when you 'Keep & Switch'.",
  'Scam Shield protects customers by blocking millions of scam calls daily.',
  "T-Mobile is America's largest, fastest, and most awarded 5G network.",
  'No hidden taxes or fees on premium plans like Experience Más.',
  'Un-carrier moves are built to eliminate industry friction points.',
  'Discovery-first selling beats feature dumping almost every time.',
  'A clean recap is one of the highest-leverage moves in wireless sales.',
  'The best bundle stories feel simpler, not busier.',
  'Confidence grows when setup help is specific and immediate.',
  'Great reps lower friction before they try to raise excitement.',
  'When price is the objection, clarity is often the answer.',
];

export const getCharacterDefinition = (characterId: CharacterId) => CHARACTER_MAP[characterId] || CHARACTER_MAP.apple;

export const getTriviaDeck = (): TriviaQuestion[] => {
  const external = getExternalRunnerContent();
  const externalTrivia = (external.trivia || [])
    .map((question, index) => sanitizeTriviaQuestion(question, `external-${index}`))
    .filter(Boolean) as TriviaQuestion[];

  const unique = new Map<string, TriviaQuestion>();
  [...BASE_TRIVIA_DECK, ...externalTrivia].forEach((question) => {
    unique.set(question.id, question);
  });

  return Array.from(unique.values());
};

export const getFactDeck = (): string[] => {
  const external = getExternalRunnerContent();
  const facts = [...T_MOBILE_FACTS, ...(external.facts || [])].filter(Boolean);
  return Array.from(new Set(facts));
};
