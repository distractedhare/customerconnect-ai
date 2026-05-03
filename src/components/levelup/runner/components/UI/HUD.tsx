/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  BatteryCharging,
  ChevronRight,
  Crown,
  Play,
  Pause,
  Rocket,
  ScanSearch,
  Settings,
  Shield,
  Sparkles,
  Triangle,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useStore } from '../../store';
import { KipAvatar } from '../../../../kip';
import { GameStatus, TLIFE_COLORS, type CharacterDefinition, type CharacterId, type RunnerAbilitySlot, type ShopItem } from '../../types';
import {
  PLAYABLE_CHARACTERS,
  PRIMARY_BOSS,
  RUNNER_BOSSES,
  SIDEKICK_CORE,
  T_LIFE_WORD,
  getBossDefinition,
  getCharacterDefinition,
} from '../../content';
import { TriviaModal } from './TriviaModal';
import { TUTORIAL_DATA, TutorialOverlay } from './TutorialOverlay';
import { audio } from '../System/Audio';
import { pickKipLine } from '../../../../../services/kip/kipVoice';
import type { KipMood } from '../../../../../types/kip';
import { RunnerPicture } from './RunnerPicture';

// Battery state vocabulary. Research lock: four named states mapped from
// the raw battery/maxBattery ratio. The ratio can exceed 100 if the player
// has battery upgrades; that's "overcharged".
type BatteryState = 'overcharged' | 'stable' | 'redline' | 'critical';

const BATTERY_STATE_LABEL: Record<BatteryState, string> = {
  overcharged: 'Overcharged',
  stable: 'Stable',
  redline: 'Redline',
  critical: 'Critical',
};

const BATTERY_STATE_COLOR: Record<BatteryState, string> = {
  overcharged: '#FF4DFF',
  stable: 'rgba(255,255,255,0.62)',
  redline: '#FFB23E',
  critical: '#FF3060',
};

const BATTERY_STATE_TO_MOOD: Record<BatteryState, KipMood> = {
  overcharged: 'runnerBatteryOvercharged',
  stable: 'runnerBatteryStable',
  redline: 'runnerBatteryRedline',
  critical: 'runnerBatteryCritical',
};

// Rank lets us detect downward transitions without writing a 4×4 case table.
const BATTERY_STATE_RANK: Record<BatteryState, number> = {
  critical: 0,
  redline: 1,
  stable: 2,
  overcharged: 3,
};

function getBatteryState(rawPercent: number): BatteryState {
  if (rawPercent > 100) return 'overcharged';
  if (rawPercent > 40) return 'stable';
  if (rawPercent > 15) return 'redline';
  return 'critical';
}

// Loss-screen subtitle bank — research-blessed framings (battery drain /
// signal collapse / power loss). Picked deterministically per run so it
// varies without feeling random.
const RUN_END_LOSS_SUBTITLES: readonly string[] = [
  'Battery drained. Save the run state, swap tactics, and run it back.',
  'Signal collapsed. Save the run, switch hands, go again.',
  'Power loss. Bank the read, swap loadouts, run it back.',
] as const;

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'DOUBLE_JUMP',
    name: 'UC Double Jump',
    description: 'Adds a second jump for brutal lane stacks.',
    cost: 1200,
    icon: Rocket,
    oneTime: true,
  },
  {
    id: 'MAX_LIFE',
    name: 'Beyond Battery',
    description: 'Adds more max battery for longer elite runs.',
    cost: 1500,
    icon: BatteryCharging,
  },
  {
    id: 'HEAL',
    name: 'Quick Repair',
    description: 'Restore battery right now and keep the streak alive.',
    cost: 900,
    icon: Activity,
  },
  {
    id: 'IMMORTAL',
    name: 'Price Lock Shield',
    description: 'Unlock manual invulnerability on demand.',
    cost: 2800,
    icon: Shield,
    oneTime: true,
  },
  {
    id: 'SCANNER',
    name: 'AI Scanner',
    description: 'Reveal routes, pickups, and easier reads for a while.',
    cost: 1400,
    icon: ScanSearch,
  },
  {
    id: 'MULTIPLIER',
    name: 'Sales Multiplier',
    description: 'Turn this stretch into a score avalanche.',
    cost: 1600,
    icon: Sparkles,
  },
  {
    id: 'OVERCLOCK',
    name: 'Overclock Shot',
    description: 'Raw speed, hotter runs, louder outcomes.',
    cost: 1500,
    icon: Zap,
  },
];

const controlDispatch = (eventName: string) => window.dispatchEvent(new Event(eventName));

const CHARACTER_ABILITY_SHORT: Record<CharacterId, string> = {
  apple: 'MagSafe',
  samsung: 'Unfold',
  tcl: 'Blast',
  motorola: 'Boost',
  pixel: 'Drone',
  sidekick_core: 'Core Sync',
  nokia_relay: 'Signal',
};

const CHARACTER_SMASH_SHORT: Record<CharacterId, string> = {
  apple: 'Slash',
  samsung: 'Guard',
  tcl: 'Smash',
  motorola: 'Burst',
  pixel: 'Scan',
  sidekick_core: 'Smash',
  nokia_relay: 'Relay',
};

type CharacterStatKey = keyof CharacterDefinition['stats'];

const CHARACTER_STAT_ROWS: Array<{ key: CharacterStatKey; label: string }> = [
  { key: 'speed', label: 'Speed' },
  { key: 'agility', label: 'Agility' },
  { key: 'power', label: 'Power' },
  { key: 'durability', label: 'Durability' },
  { key: 'tech', label: 'Tech' },
];

const getAbilityIconMap = (character: CharacterDefinition): Partial<Record<RunnerAbilitySlot, string>> =>
  character.assets?.abilityIcons.reduce<Partial<Record<RunnerAbilitySlot, string>>>((icons, ability) => {
    icons[ability.slot] = ability.path;
    return icons;
  }, {}) ?? {};

const CHARACTER_ART_SLUGS: Partial<Record<CharacterId, string>> = {
  apple: 'apple_titanium_duelist',
  samsung: 'samsung_foldwing_warrior',
  tcl: 'tcl_display_brawler',
  motorola: 'motorola_flip_rider',
  pixel: 'pixel_scout',
};

const getRunnerAsset = (folder: string, slug: string | undefined, suffix: string) =>
  slug ? `/levelup/runner/${folder}/${slug}_${suffix}.png` : undefined;

const getCharacterAssets = (character: CharacterDefinition) => ({
  fullCard: character.assets?.fullCard ?? getRunnerAsset('cards', CHARACTER_ART_SLUGS[character.id], 'card') ?? character.cardImage,
  heroBanner:
    character.assets?.heroBanner
    ?? getRunnerAsset('banners', CHARACTER_ART_SLUGS[character.id], 'banner')
    ?? character.heroImage
    ?? character.assets?.cutout
    ?? character.cardImage,
  hudPortrait:
    character.assets?.hudPortrait
    ?? getRunnerAsset('portraits', CHARACTER_ART_SLUGS[character.id], 'portrait')
    ?? character.portraitImage
    ?? character.cardImage,
  avatarSmall:
    character.assets?.avatarSmall
    ?? getRunnerAsset('avatars', CHARACTER_ART_SLUGS[character.id], 'avatar')
    ?? character.assets?.avatar
    ?? character.portraitImage
    ?? character.cardImage,
  mobileFallback:
    character.assets?.mobileFallback
    ?? getRunnerAsset('mobile', CHARACTER_ART_SLUGS[character.id], 'mobile')
    ?? character.assets?.heroBanner
    ?? character.heroImage
    ?? character.assets?.cutout
    ?? character.cardImage,
  abilityIcons: getAbilityIconMap(character),
});

const getCharacterFullCard = (character: CharacterDefinition) => getCharacterAssets(character).fullCard;
const getCharacterHeroArt = (character: CharacterDefinition) => getCharacterAssets(character).heroBanner;
const getCharacterMobileFallback = (character: CharacterDefinition) => getCharacterAssets(character).mobileFallback;
const getCharacterHudPortrait = (character: CharacterDefinition) => getCharacterAssets(character).hudPortrait;
const getCharacterAvatarSmall = (character: CharacterDefinition) => getCharacterAssets(character).avatarSmall;

const ArtworkFrame = ({
  src,
  alt,
  accent,
  wide = false,
  className = '',
  mediaClassName = '',
  mobileSrc,
}: {
  src: string;
  alt: string;
  accent: string;
  wide?: boolean;
  className?: string;
  mediaClassName?: string;
  mobileSrc?: string;
}) => (
  <div
    className={`overflow-hidden rounded-[1.55rem] border bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(255,255,255,0.02)_58%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.22))] ${className}`}
    style={{ borderColor: `${accent}55` }}
  >
    <div
      className={
        wide
          ? `aspect-[16/9] md:aspect-[21/9] ${mediaClassName}`
          : `flex items-start justify-center bg-[#050011] ${mediaClassName || 'h-[18rem] sm:h-[20rem]'}`
      }
    >
      <RunnerPicture
        src={src}
        mobileSrc={mobileSrc}
        alt={alt}
        pictureClassName="block h-full w-full"
        className={wide ? 'h-full w-full object-cover object-center' : 'h-full w-full object-contain object-top p-2'}
        loading="lazy"
      />
    </div>
  </div>
);

const AbilityPill = ({
  label,
  copy,
  accent,
}: {
  label: string;
  copy: string;
  accent: string;
}) => (
  <div className="rounded-[1.1rem] border border-white/10 bg-black/28 p-3">
    <div className="text-[10px] uppercase tracking-[0.26em]" style={{ color: accent }}>
      {label}
    </div>
    <div className="mt-1 text-sm font-bold text-white">{copy}</div>
  </div>
);

const BossIntelCard = ({
  compact = false,
  bossId,
}: {
  compact?: boolean;
  bossId?: string | null;
}) => {
  const boss = getBossDefinition(bossId) ?? PRIMARY_BOSS;

  return (
    <div className={`rounded-[1.7rem] border border-white/10 bg-black/28 ${compact ? 'p-4' : 'p-5'} text-white`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074]">
            {compact ? 'Threat online' : 'Boss ladder'}
          </div>
          <div className="mt-1 text-xl font-black">{boss.name}</div>
          <div className="text-sm uppercase tracking-[0.2em] text-white/45">{boss.title}</div>
        </div>
        <div className="rounded-full border border-[#E20074]/35 bg-[#E20074]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8cc6]">
          {boss.threatLevel}
        </div>
      </div>

      <p className={`mt-3 text-white/70 ${compact ? 'text-xs leading-relaxed' : 'text-sm leading-relaxed'}`}>
        {compact ? boss.counterplay[0] : boss.fantasy}
      </p>

      {!compact && (
        <>
          <div className="mt-4 grid gap-2">
            {boss.counterplay.slice(0, 2).map((tip) => (
              <div key={tip} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">
                {tip}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {RUNNER_BOSSES.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${
                  entry.id === boss.id ? 'border-[#E20074]/45 bg-[#E20074]/15 text-white' : 'border-white/10 bg-white/5 text-white/50'
                }`}
              >
                {entry.name}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const CharacterCard = ({
  character,
  selected,
  onSelect,
}: {
  character: CharacterDefinition;
  selected: boolean;
  onSelect: () => void;
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-w-[132px] max-w-[146px] snap-center rounded-[1.15rem] border p-2.5 text-left transition-all pointer-events-auto ${
        selected
          ? 'bg-white/12 border-white/40 shadow-[0_16px_45px_rgba(0,0,0,0.32)] scale-[1.01]'
          : 'bg-white/6 border-white/10 hover:bg-white/10'
      }`}
      style={{ boxShadow: selected ? `0 0 0 1px ${character.accent}, 0 14px 42px rgba(0,0,0,0.35)` : undefined }}
    >
      <div
        className="relative h-32 overflow-hidden rounded-[1rem] border bg-black"
        style={{ borderColor: `${character.accent}66`, boxShadow: selected ? `0 0 22px ${character.accent}28` : undefined }}
      >
        <RunnerPicture
          src={getCharacterAvatarSmall(character)}
          alt=""
          className="h-full w-full object-cover object-center"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/90 to-transparent" />
        <div
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-xl border text-sm font-black"
          style={{ borderColor: character.accent, color: character.accent, background: `${character.accent}18` }}
        >
          {character.icon}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: character.accent }} />
      </div>
      <div className="mt-3 min-w-0">
        <div className="text-[9px] uppercase tracking-[0.24em] text-white/45">{character.brand}</div>
        <div className="mt-1 truncate text-sm font-black text-white font-cyber leading-none">{character.name}</div>
      </div>
      <div className="mt-3 border-t border-white/10 pt-2.5">
        <div className={`text-[10px] font-black uppercase tracking-[0.28em] ${selected ? 'text-white' : 'text-white/45'}`}>
          {selected ? 'Selected' : 'Tap to pick'}
        </div>
      </div>
    </button>
  );
};

const CharacterStatPanel = ({ character }: { character: CharacterDefinition }) => (
  <div className="rounded-[1.4rem] border border-white/10 bg-black/30 p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Runner stats</div>
        <div className="mt-1 text-lg font-black text-white">Card attributes</div>
      </div>
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-lg font-black"
        style={{ borderColor: character.accent, color: character.accent, background: `${character.accent}18` }}
      >
        {character.icon}
      </div>
    </div>
    <div className="mt-4 grid gap-3">
      {CHARACTER_STAT_ROWS.map((stat) => {
        const value = character.stats[stat.key];
        return (
          <div key={stat.key} className="grid grid-cols-[5.7rem_minmax(0,1fr)_2rem] items-center gap-3">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/58">{stat.label}</div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, value * 10)}%`, background: `linear-gradient(90deg, ${character.accent}, ${character.secondary})` }}
              />
            </div>
            <div className="text-right text-xs font-black text-white">{value}</div>
          </div>
        );
      })}
    </div>
  </div>
);

const CharacterPreviewOverlay = ({
  character,
  selected,
  onClose,
}: {
  character: CharacterDefinition;
  selected: boolean;
  onClose: () => void;
}) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[140] bg-[rgba(2,0,8,0.9)] backdrop-blur-xl p-4 md:p-6"
    >
      <div className="mx-auto flex min-h-full w-full max-w-6xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          onClick={(event) => event.stopPropagation()}
          className="max-h-[88svh] w-full overflow-y-auto rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.16),transparent_40%),linear-gradient(180deg,rgba(11,4,21,0.96),rgba(0,0,0,0.95))] p-4 text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:p-6"
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.32em]" style={{ color: character.accent }}>
                Full card preview
              </div>
              <div className="mt-2 text-3xl font-black font-cyber italic md:text-5xl">{character.name}</div>
              <div className="mt-2 text-sm uppercase tracking-[0.24em] text-white/50">
                {character.brand} • {character.series}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/70 transition-colors hover:bg-white/12 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mb-5 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-3 text-sm text-white/72">
            Tap outside the card, press <span className="font-black text-white">Esc</span>, or use the button below to head back to the roster.
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[0.56fr_0.44fr]">
            <ArtworkFrame
              src={getCharacterFullCard(character)}
              alt={character.name}
              accent={character.accent}
              className="mx-auto w-full max-w-[30rem]"
              mediaClassName="h-[38vh] sm:h-[58vh] md:h-[68vh]"
            />

            <div className="flex min-w-0 flex-col gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/28 p-4">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Role</div>
                <div className="mt-2 text-xl font-black">{character.role}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{character.tagline}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/28 p-4">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Lore</div>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{character.lore}</p>
              </div>

              <div className="grid gap-2">
                {character.abilities.slice(0, 3).map((ability) => (
                  <AbilityPill
                    key={ability.id}
                    label={ability.type}
                    copy={`${ability.name} · ${ability.description}`}
                    accent={character.accent}
                  />
                ))}
              </div>

              <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                <div
                  className="inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.22em]"
                  style={{
                    borderColor: selected ? `${character.accent}` : 'rgba(255,255,255,0.12)',
                    background: selected ? `${character.accent}22` : 'rgba(255,255,255,0.04)',
                    color: selected ? '#FFFFFF' : 'rgba(255,255,255,0.72)',
                  }}
                >
                  {selected ? 'Current runner' : 'Previewing'}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E20074] px-5 py-3 text-sm font-black uppercase tracking-[0.22em] text-white transition-transform hover:scale-[1.01]"
                >
                  Back to roster
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const QUICK_START_STEPS = [
  {
    title: 'Choose a runner',
    copy: 'Tap a character card to select it. The roster now stays in place until you intentionally open a preview.',
  },
  {
    title: 'Stay in your lane',
    copy: 'Move with arrows, WASD, swipe, or the mobile buttons. Jump up. Smash down.',
  },
  {
    title: 'Play the loop',
    copy: 'Collect letters and power-ups, answer trivia cleanly, and save the run any time you need to pause.',
  },
];

const FIRST_RUN_RECOMMENDATION_ID: CharacterId = 'pixel';

const CHARACTER_PICK_GUIDE: Partial<Record<CharacterId, {
  pickLabel: string;
  reason: string;
  highlights: string[];
}>> = {
  apple: {
    pickLabel: 'Best for clean timing',
    reason: 'Fast and precise when the player wants a premium-feeling run with strong control.',
    highlights: ['Fast lane recovery', 'Strong coin magnet', 'Clean-hit focus'],
  },
  samsung: {
    pickLabel: 'Best for power control',
    reason: 'Good for players who want more protection and broader clears instead of pure speed.',
    highlights: ['Glide plus shield', 'Big scoring bursts', 'Durable feel'],
  },
  tcl: {
    pickLabel: 'Best for survivability',
    reason: 'The heaviest, safest-feeling build for players who want space-clearing power.',
    highlights: ['Wide obstacle clears', 'Extra battery', 'Value-heavy scoring'],
  },
  motorola: {
    pickLabel: 'Best for speed',
    reason: 'The sharpest burst-speed pick for players who already like quick movement and risk.',
    highlights: ['Highest speed', 'Fast dash loop', 'Aggressive combo flow'],
  },
  pixel: {
    pickLabel: 'Recommended for first run',
    reason: 'The easiest starter because it reveals paths, helps with routing, and smooths out pressure moments.',
    highlights: ['Path reveal', 'Safe repositioning', 'Strong trivia assist'],
  },
};

const TutorialGuideOverlay = ({
  selectedCharacter,
  onClose,
  onStart,
}: {
  selectedCharacter: CharacterDefinition;
  onClose: () => void;
  onStart: () => void;
}) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[140] bg-[rgba(2,0,8,0.92)] backdrop-blur-xl p-4 md:p-6"
    >
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          onClick={(event) => event.stopPropagation()}
          className="max-h-[88svh] w-full overflow-y-auto rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.22),transparent_38%),linear-gradient(180deg,rgba(11,4,21,0.98),rgba(0,0,0,0.97))] p-5 text-white shadow-[0_30px_90px_rgba(0,0,0,0.45)] md:p-6"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.32em] text-[#E20074]">How to play</div>
              <div className="mt-2 text-3xl font-black font-cyber italic md:text-5xl">Shift briefing</div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/72 md:text-base">
                Give new players the fast read first: pick a runner, stay mobile, and treat trivia plus pickups like
                part of the same scoring loop.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/70 transition-colors hover:bg-white/12 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Quick start</div>
                <div className="mt-4 grid gap-3">
                  {QUICK_START_STEPS.map((step, index) => (
                    <div key={step.title} className="rounded-[1.3rem] border border-white/10 bg-black/28 p-4">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-[#E20074]">Step {index + 1}</div>
                      <div className="mt-2 text-lg font-black">{step.title}</div>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{step.copy}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.6rem] border border-white/10 bg-black/28 p-5">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Desktop controls</div>
                  <div className="mt-3 text-sm leading-relaxed text-white/72">
                    Arrows or WASD move. Up jumps. Down smashes. <span className="font-black text-white">E</span> or
                    <span className="font-black text-white"> F</span> fires the signature skill when the meter is full.
                  </div>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-black/28 p-5">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Phone controls</div>
                  <div className="mt-3 text-sm leading-relaxed text-white/72">
                    Swipe lanes or use the HUD buttons. The mobile control cluster stays visible once the run starts, so
                    nobody has to guess.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5">
                <div className="text-[10px] uppercase tracking-[0.28em] text-[#E20074]">Current starter</div>
                <div className="mt-2 text-2xl font-black">{selectedCharacter.name}</div>
                <div className="mt-1 text-sm uppercase tracking-[0.22em] text-white/50">{selectedCharacter.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  You can switch runners any time before launch. The preview is optional now, so selection stays clean.
                </p>
              </div>

              <div className="space-y-3 rounded-[1.7rem] border border-white/10 bg-black/28 p-5">
                <div className="text-[10px] uppercase tracking-[0.28em] text-white/45">Training tips you will see in-run</div>
                {TUTORIAL_DATA.slice(0, 4).map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <div key={tip.id} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E20074]/35 bg-[#E20074]/14 text-[#ff8cc6]">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.28em] text-[#E20074]">{tip.title}</div>
                          <p className="mt-2 text-sm leading-relaxed text-white/70">{tip.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E20074] px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition-transform hover:scale-[1.01]"
            >
              Start with {selectedCharacter.name}
              <Play size={16} fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white/80 transition-colors hover:bg-white/12 hover:text-white"
            >
              Back to roster
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatusChip = ({ label, active, accent }: { label: string; active: boolean; accent: string }) => (
  <div
    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border transition-all ${
      active ? 'text-white' : 'text-white/35 border-white/10 bg-black/20'
    }`}
    style={active ? { borderColor: accent, background: `${accent}30`, boxShadow: `0 0 12px ${accent}55` } : undefined}
  >
    {label}
  </div>
);

const SaveBanner = () => {
  const saveStatus = useStore((state) => state.saveStatus);
  const lastSavedAt = useStore((state) => state.lastSavedAt);

  if (saveStatus === 'idle' && !lastSavedAt) return null;

  const message =
    saveStatus === 'saving'
      ? 'Saving progress...'
      : saveStatus === 'saved'
        ? 'Progress saved'
        : saveStatus === 'error'
          ? 'Save failed'
          : lastSavedAt
            ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
            : null;

  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-3 left-1/2 z-[120] -translate-x-1/2 rounded-full border border-[#E20074]/45 bg-black/72 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white pointer-events-none sm:bottom-5 sm:px-4 sm:py-2 sm:text-xs"
    >
      {message}
    </motion.div>
  );
};

const ShopScreen: React.FC = () => {
  const score = useStore((state) => state.score);
  const buyItem = useStore((state) => state.buyItem);
  const closeShop = useStore((state) => state.closeShop);
  const hasDoubleJump = useStore((state) => state.hasDoubleJump);
  const hasImmortality = useStore((state) => state.hasImmortality);

  const availableItems = React.useMemo(() => {
    return SHOP_ITEMS.filter((item) => {
      if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
      if (item.id === 'IMMORTAL' && hasImmortality) return false;
      return true;
    }).sort(() => 0.5 - Math.random()).slice(0, 4);
  }, [hasDoubleJump, hasImmortality]);

  return (
    <div className="absolute inset-0 z-[110] bg-black/90 backdrop-blur-xl p-6 overflow-y-auto pointer-events-auto">
      <div className="max-w-5xl mx-auto py-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-[#E20074]">T-Mobile Hub</div>
            <h2 className="text-4xl md:text-5xl text-white font-black font-cyber italic">Mid-Run Upgrade Bay</h2>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Sales Credits</div>
            <div className="text-2xl font-black">{score.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {availableItems.map((item) => {
            const Icon = item.icon;
            const affordable = score >= item.cost;
            return (
              <div key={item.id} className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 flex flex-col">
                <div className="w-14 h-14 rounded-2xl bg-[#E20074]/20 border border-[#E20074]/40 text-[#E20074] flex items-center justify-center mb-4">
                  <Icon size={24} />
                </div>
                <div className="text-white font-black text-xl mb-2">{item.name}</div>
                <p className="text-sm text-white/60 leading-relaxed mb-6 flex-1">{item.description}</p>
                <button
                  onClick={() => buyItem(item.id as any, item.cost)}
                  disabled={!affordable}
                  className={`rounded-2xl py-3 font-black uppercase tracking-[0.2em] transition-all ${
                    affordable ? 'bg-[#E20074] text-white hover:scale-[1.02]' : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {item.cost} credits
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={closeShop}
          className="px-8 py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.25em] hover:scale-[1.02] transition-all"
        >
          Resume run
        </button>
      </div>
    </div>
  );
};

const PauseScreen: React.FC = () => {
  const resumeGame = useStore((state) => state.resumeGame);
  const restartGame = useStore((state) => state.restartGame);
  const setStatus = useStore((state) => state.setStatus);
  const openSettings = useStore((state) => state.openSettings);
  const saveProgress = useStore((state) => state.saveProgress);

  return (
    <div className="absolute inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto">
      <div className="w-full max-w-md rounded-[2rem] bg-[#111] border border-[#E20074]/40 p-8 text-white shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="text-[11px] uppercase tracking-[0.4em] text-[#E20074] mb-3">Run paused</div>
        <div className="text-4xl font-black font-cyber italic mb-8">Take a breath. Then punch back.</div>
        <div className="grid gap-3">
          <button onClick={resumeGame} className="w-full py-4 rounded-2xl bg-[#E20074] font-black uppercase tracking-[0.25em] hover:scale-[1.02] transition-all">Resume</button>
          <button onClick={() => saveProgress(true)} className="w-full py-4 rounded-2xl bg-white/10 border border-white/15 font-black uppercase tracking-[0.25em] hover:bg-white/15 transition-all">Save progress</button>
          <button onClick={() => openSettings(GameStatus.PAUSED)} className="w-full py-4 rounded-2xl bg-white/10 border border-white/15 font-black uppercase tracking-[0.25em] hover:bg-white/15 transition-all">Settings + tutorial</button>
          <button onClick={restartGame} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-[0.25em] hover:bg-white/10 transition-all">Restart shift</button>
          <button onClick={() => setStatus(GameStatus.MENU)} className="w-full py-4 rounded-2xl bg-transparent border border-white/10 text-white/70 font-black uppercase tracking-[0.25em] hover:text-white transition-all">Home</button>
        </div>
      </div>
    </div>
  );
};

const SettingsScreen: React.FC = () => {
  const [showTutorialGuide, setShowTutorialGuide] = React.useState(false);
  const difficulty = useStore((state) => state.difficulty);
  const isMusicEnabled = useStore((state) => state.isMusicEnabled);
  const musicVolume = useStore((state) => state.musicVolume);
  const setDifficulty = useStore((state) => state.setDifficulty);
  const setMusicEnabled = useStore((state) => state.setMusicEnabled);
  const setMusicVolume = useStore((state) => state.setMusicVolume);
  const isTutorialEnabled = useStore((state) => state.isTutorialEnabled);
  const setTutorialEnabled = useStore((state) => state.setTutorialEnabled);
  const resetTutorials = useStore((state) => state.resetTutorials);
  const saveProgress = useStore((state) => state.saveProgress);
  const clearSavedProgress = useStore((state) => state.clearSavedProgress);
  const generateToken = useStore((state) => state.generateToken);
  const saveToken = useStore((state) => state.saveToken);
  const closeSettings = useStore((state) => state.closeSettings);
  const settingsReturnStatus = useStore((state) => state.settingsReturnStatus);

  const backLabel = settingsReturnStatus === GameStatus.PAUSED ? 'Back to pause' : 'Back';

  return (
    <div className="absolute inset-0 z-[110] bg-black/95 backdrop-blur-xl p-6 overflow-y-auto pointer-events-auto text-white">
      <div className="max-w-3xl mx-auto py-6">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-[11px] uppercase tracking-[0.4em] text-[#E20074]">Operations</div>
            <div className="text-4xl md:text-5xl font-black font-cyber italic">Tune the arcade machine</div>
          </div>
          <button onClick={closeSettings} className="px-5 py-3 rounded-2xl bg-white text-black font-black uppercase tracking-[0.25em]">{backLabel}</button>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.8rem] bg-white/5 border border-white/10 p-6">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45 mb-4">Traffic conditions</div>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((value) => (
                <button
                  key={value}
                  onClick={() => setDifficulty(value)}
                  className={`py-4 rounded-2xl font-black uppercase tracking-[0.25em] transition-all ${
                    difficulty === value ? 'bg-[#E20074] text-white' : 'bg-black/50 text-white/60 border border-white/10'
                  }`}
                >
                  {value === 1 ? 'Lite' : value === 2 ? 'Core' : 'Ultra'}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] bg-white/5 border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Audio</div>
                <div className="text-xl font-black mt-1">Cyber soundtrack</div>
              </div>
              <button
                onClick={() => {
                  audio.init();
                  setMusicEnabled(!isMusicEnabled);
                }}
                className={`px-4 py-2 rounded-full font-black uppercase tracking-[0.25em] text-xs ${isMusicEnabled ? 'bg-[#E20074]' : 'bg-white/10 text-white/60'}`}
              >
                {isMusicEnabled ? 'On' : 'Off'}
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(event) => {
                audio.init();
                setMusicVolume(parseFloat(event.target.value));
              }}
              className="w-full accent-[#E20074]"
            />
          </div>

          <div className="rounded-[1.8rem] bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Tutorial overlays</div>
                <div className="text-xl font-black mt-1">Show contextual training tips</div>
              </div>
              <button
                onClick={() => setTutorialEnabled(!isTutorialEnabled)}
                className={`w-16 h-9 rounded-full p-1 transition-all ${isTutorialEnabled ? 'bg-[#E20074]' : 'bg-white/10'}`}
              >
                <motion.div animate={{ x: isTutorialEnabled ? 28 : 0 }} className="w-7 h-7 rounded-full bg-white" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowTutorialGuide((current) => !current)}
                className="rounded-2xl bg-[#E20074] px-4 py-3 font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.01]"
              >
                {showTutorialGuide ? 'Hide guide' : 'Open guide'}
              </button>
              <button
                type="button"
                onClick={resetTutorials}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-black uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                Replay tips
              </button>
            </div>

            {showTutorialGuide && (
              <div className="space-y-3 rounded-[1.4rem] border border-white/10 bg-black/30 p-4">
                {TUTORIAL_DATA.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <div key={tip.id} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#E20074]/35 bg-[#E20074]/14 text-[#ff8cc6]">
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-[0.28em] text-[#E20074]">Training tip</div>
                          <div className="mt-1 text-base font-black text-white">{tip.title}</div>
                          <p className="mt-2 text-sm leading-relaxed text-white/70">{tip.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[1.8rem] bg-white/5 border border-white/10 p-6 space-y-4">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Persistence bridge</div>
            <div className="grid sm:grid-cols-3 gap-3">
              <button onClick={() => saveProgress(true)} className="py-4 rounded-2xl bg-[#E20074] font-black uppercase tracking-[0.2em]">Save now</button>
              <button onClick={generateToken} className="py-4 rounded-2xl bg-white/10 border border-white/10 font-black uppercase tracking-[0.2em]">Export token</button>
              <button onClick={clearSavedProgress} className="py-4 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-[0.2em] text-white/70">Clear save</button>
            </div>
            {saveToken && (
              <div className="rounded-2xl bg-black/60 border border-[#E20074]/20 p-4 text-xs font-mono break-all text-cyan-300">
                {saveToken}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuScreen: React.FC = () => {
  const startGame = useStore((state) => state.startGame);
  const continueSavedRun = useStore((state) => state.continueSavedRun);
  const openSettings = useStore((state) => state.openSettings);
  const selectedCharacterId = useStore((state) => state.selectedRunnerId ?? state.selectedCharacterId);
  const setSelectedCharacter = useStore((state) => state.setSelectedCharacter);
  const highScore = useStore((state) => state.highScore);
  const lifetimeScore = useStore((state) => state.lifetimeScore);
  const mastery = useStore((state) => state.mastery);
  const hasResumeSave = useStore((state) => state.hasResumeSave);
  const hostKnowledgeCount = useStore((state) => state.hostKnowledgeCount);

  React.useEffect(() => {
    if (selectedCharacterId === 'sidekick_core') {
      setSelectedCharacter('apple');
    }
  }, [selectedCharacterId, setSelectedCharacter]);

  const [previewCharacterId, setPreviewCharacterId] = React.useState<CharacterId | null>(null);
  const [showTutorialGuide, setShowTutorialGuide] = React.useState(false);
  const selectedCharacter = getCharacterDefinition(selectedCharacterId);
  const previewCharacter = previewCharacterId ? getCharacterDefinition(previewCharacterId) : null;
  const selectedGuide = CHARACTER_PICK_GUIDE[selectedCharacter.id];
  const isRecommendedStarter = selectedCharacter.id === FIRST_RUN_RECOMMENDATION_ID;

  const handleCardSelect = React.useCallback((characterId: CharacterId) => {
    setSelectedCharacter(characterId);
  }, [setSelectedCharacter]);

  const handleStartGame = React.useCallback(() => {
    audio.init();
    startGame();
  }, [startGame]);

  return (
    <div className="absolute inset-0 z-[110] bg-[#050011] pointer-events-auto overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.25),transparent_45%),linear-gradient(180deg,#080010_0%,#050011_50%,#000000_100%)]" />
      <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(226,0,116,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(226,0,116,0.15)_1px,transparent_1px)] bg-[size:36px_36px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid gap-5 mb-6 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.32fr)] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-[0.32em] shadow-[5px_5px_0px_#E20074]">
              Optional training module
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl leading-[0.88] font-black font-cyber italic tracking-tight text-white mt-4">
              T-LIFE
              <br />
              <span className="text-[#E20074]">RUNNER</span>
            </h1>
            <p className="max-w-2xl text-white/70 text-sm md:text-base leading-relaxed mt-4">
              Pick a runner, skim the controls, and launch. The lore and mastery boards are still here, but they stay secondary so the first screen feels playable instead of overwhelming.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.35rem] bg-white/6 border border-white/10 p-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">High score</div>
              <div className="text-2xl text-white font-black mt-1">{highScore.toLocaleString()}</div>
            </div>
            <div className="rounded-[1.35rem] bg-white/6 border border-white/10 p-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Lifetime score</div>
              <div className="text-2xl text-white font-black mt-1">{lifetimeScore.toLocaleString()}</div>
            </div>
            <div className="rounded-[1.35rem] bg-white/6 border border-white/10 p-3">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Training deck</div>
              <div className="text-2xl text-white font-black mt-1">+{hostKnowledgeCount}</div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-[#E20074]">Character select</div>
            <div className="text-2xl text-white font-black mt-1">Choose your runner in one clean pass</div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60">
              The selected runner stays pinned up top now, so people can scan the roster fast, see why a build fits them, and launch without guessing.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-white/40 text-xs uppercase tracking-[0.25em]">
            <Triangle size={14} /> select + launch
          </div>
        </div>

        <div className="min-w-0 rounded-[2rem] border border-white/10 bg-white/6 p-3 md:p-5">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] xl:items-start">
            <div className="min-w-0 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.25))] p-4 md:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
                  Selected runner
                </div>
                {selectedGuide ? (
                  <div
                    className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white"
                    style={{ borderColor: `${selectedCharacter.accent}88`, background: `${selectedCharacter.accent}26` }}
                  >
                    {selectedGuide.pickLabel}
                  </div>
                ) : null}
                {isRecommendedStarter ? (
                  <div className="rounded-full border border-[#E20074]/45 bg-[#E20074]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#ff8cc6]">
                    First run favorite
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid min-w-0 gap-4">
                <div
                  className="relative isolate min-h-[13.5rem] overflow-hidden rounded-[1.6rem] border bg-[#050011] sm:min-h-[14.5rem] lg:min-h-[15rem]"
                  style={{ borderColor: `${selectedCharacter.accent}66`, boxShadow: `0 24px 80px ${selectedCharacter.accent}18` }}
                >
                  <RunnerPicture
                    src={getCharacterHeroArt(selectedCharacter)}
                    mobileSrc={getCharacterMobileFallback(selectedCharacter)}
                    alt={selectedCharacter.name}
                    pictureClassName="absolute inset-0 block h-full w-full"
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/52 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/78 to-transparent" />
                  <div className="relative z-10 flex min-h-[13.5rem] flex-col justify-end p-4 sm:min-h-[14.5rem] md:p-5 lg:min-h-[15rem]">
                    <div className="max-w-[34rem]">
                      <div className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: selectedCharacter.accent }}>
                        {selectedCharacter.series}
                      </div>
                      <div className="mt-2 text-3xl font-black leading-none text-white font-cyber italic md:text-5xl">
                        {selectedCharacter.name}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <div className="rounded-full border border-white/12 bg-black/42 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/78">
                          {selectedCharacter.role}
                        </div>
                        <div
                          className="rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white"
                          style={{ borderColor: `${selectedCharacter.accent}80`, background: `${selectedCharacter.accent}22` }}
                        >
                          {selectedCharacter.brand}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start">
                  <div className="min-w-0 rounded-[1.4rem] border border-white/10 bg-black/24 p-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.26em]" style={{ color: selectedCharacter.accent }}>
                      Why this runner
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/72">
                      {selectedGuide?.reason ?? selectedCharacter.lore}
                    </p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                      {(selectedGuide?.highlights ?? []).map((highlight) => (
                        <div key={highlight} className="rounded-[1rem] border border-white/10 bg-white/6 px-3 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-white/82">
                          {highlight}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-2">
                      {selectedCharacter.abilities.slice(0, 2).map((ability) => (
                        <AbilityPill
                          key={ability.id}
                          label={ability.type}
                          copy={`${ability.name} · ${ability.description}`}
                          accent={selectedCharacter.accent}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <CharacterStatPanel character={selectedCharacter} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 gap-4">
              <div className="rounded-[1.8rem] border border-white/10 bg-black/30 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074]">Launch deck</div>
                    <div className="mt-2 text-2xl font-black text-white">Start Run</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/68">
                      Your runner stays locked here while you browse, so the final choice is always visible before launch.
                    </p>
                  </div>
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl font-black"
                    style={{ borderColor: selectedCharacter.accent, color: selectedCharacter.accent, background: `${selectedCharacter.accent}20` }}
                  >
                    {selectedCharacter.icon}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/72">
                    {selectedCharacter.brand}
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/72">
                    {selectedCharacter.role}
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <button
                    onClick={handleStartGame}
                    className="w-full rounded-2xl bg-[#E20074] px-5 py-4 text-base font-black uppercase tracking-[0.22em] text-white transition-all hover:scale-[1.02] md:text-lg flex items-center justify-center gap-3"
                  >
                    Start Run <Play size={20} fill="currentColor" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTutorialGuide(true)}
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-white/15 flex items-center justify-center gap-3"
                  >
                    How to play <ChevronRight size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewCharacterId(selectedCharacter.id)}
                    className="w-full rounded-2xl border border-white/12 bg-transparent px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white/78 transition-colors hover:bg-white/8 hover:text-white flex items-center justify-center gap-2"
                  >
                    Preview full card <Triangle size={12} className="rotate-90" />
                  </button>
                  {hasResumeSave && (
                    <button
                      onClick={() => {
                        audio.init();
                        continueSavedRun();
                      }}
                      className="w-full rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white transition-all hover:bg-white/15 flex items-center justify-center gap-3"
                    >
                      Continue run <ChevronRight size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => openSettings(GameStatus.MENU)}
                    className="w-full rounded-2xl border border-white/10 bg-transparent px-5 py-3 text-sm font-black uppercase tracking-[0.2em] text-white/70 transition-all hover:border-white/20 hover:text-white flex items-center justify-center gap-3"
                  >
                    Settings + saves <Settings size={18} />
                  </button>
                </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074]">Switch runner fast</div>
                <div className="mt-2 text-xl font-black text-white">Pick a character portrait</div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  Tap once to update the selected bay. Stats and abilities stay up top so the roster can stay quick.
                </p>
                <div className="-mx-1 mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory px-1 pb-2">
                  {PLAYABLE_CHARACTERS.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      selected={character.id === selectedCharacterId}
                      onSelect={() => handleCardSelect(character.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          <details className="group rounded-[1.55rem] border border-white/10 bg-black/24 p-4 text-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.26em] text-[#ff8cc6] [&::-webkit-details-marker]:hidden">
              First run guide
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="mt-4 grid gap-3">
              {QUICK_START_STEPS.map((step, index) => (
                <div key={step.title} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-3">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Step {index + 1}</div>
                  <div className="mt-1 text-sm font-black text-white">{step.title}</div>
                  <p className="mt-1 text-xs leading-relaxed text-white/68">{step.copy}</p>
                </div>
              ))}
            </div>
          </details>

          <details className="group rounded-[1.55rem] border border-white/10 bg-black/24 p-4 text-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.26em] text-[#ff8cc6] [&::-webkit-details-marker]:hidden">
              Mastery
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="mt-4 space-y-3">
              {PLAYABLE_CHARACTERS.map((character) => (
                <div key={character.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-black" style={{ borderColor: character.accent, color: character.accent }}>
                    {character.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3 text-xs text-white/75">
                      <span>{character.brand}</span>
                      <span>{(mastery[character.id] || 0).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (mastery[character.id] || 0) / 250)}%`, background: character.accent }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </details>

          <details className="group rounded-[1.55rem] border border-white/10 bg-black/24 p-4 text-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[10px] font-black uppercase tracking-[0.26em] text-[#ff8cc6] [&::-webkit-details-marker]:hidden">
              Support + boss
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <div className="mt-4 space-y-3">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-3">
                <div className="flex items-center gap-3">
                  <KipAvatar size="medium" state="listening" />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/45">Support intelligence</div>
                    <div className="mt-1 text-base font-black text-white">{SIDEKICK_CORE.name}</div>
                    <div className="mt-0.5 text-xs uppercase tracking-[0.18em] text-white/45">{SIDEKICK_CORE.title}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2">
                  {SIDEKICK_CORE.abilities.slice(0, 2).map((ability) => (
                    <AbilityPill key={ability.id} label={ability.type} copy={ability.name} accent={SIDEKICK_CORE.accent} />
                  ))}
                </div>
              </div>
              <BossIntelCard compact />
            </div>
          </details>
        </div>

        <AnimatePresence>
          {previewCharacter ? (
            <CharacterPreviewOverlay
              character={previewCharacter}
              selected={previewCharacter.id === selectedCharacterId}
              onClose={() => setPreviewCharacterId(null)}
            />
          ) : null}
          {showTutorialGuide ? (
            <TutorialGuideOverlay
              selectedCharacter={selectedCharacter}
              onClose={() => setShowTutorialGuide(false)}
              onStart={() => {
                setShowTutorialGuide(false);
                handleStartGame();
              }}
            />
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

const EndScreen = ({
  victory,
}: {
  victory?: boolean;
}) => {
  const score = useStore((state) => state.score);
  const level = useStore((state) => state.level);
  const bestCombo = useStore((state) => state.bestCombo);
  const selectedCharacterId = useStore((state) => state.selectedRunnerId ?? state.selectedCharacterId);
  const restartGame = useStore((state) => state.restartGame);
  const setStatus = useStore((state) => state.setStatus);
  const saveProgress = useStore((state) => state.saveProgress);

  const character = getCharacterDefinition(selectedCharacterId);

  return (
    <div className={`absolute inset-0 z-[110] p-4 pointer-events-auto ${victory ? 'bg-[#E20074]/85' : 'bg-black/90'} backdrop-blur-sm flex items-center justify-center`}>
      <div className="w-full max-w-2xl rounded-[2rem] bg-black/40 border border-white/15 p-8 md:p-10 text-white text-center shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="flex justify-center mb-4">{victory ? <Trophy size={56} /> : <Crown size={56} />}</div>
        <div className="text-[10px] uppercase tracking-[0.35em] text-white/55">{character.brand} • {character.name}</div>
        <div className="text-5xl md:text-6xl font-black font-cyber italic mt-3">{victory ? 'Elite advocate' : 'Shift ended'}</div>
        <div className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[#ff8cc6]">Kip · {victory ? 'Hype' : 'Reset'}</div>
        <div className="text-lg text-white/85 mt-2 max-w-xl mx-auto leading-relaxed">
          {pickKipLine(victory ? 'celebrateRunnerWin' : 'celebrateRunnerLoss', `${score}:${level}`)}
        </div>
        <div className="text-sm text-white/55 mt-2 max-w-xl mx-auto leading-relaxed">
          {victory
            ? 'You cleared the arc, stacked the value story, and turned the run into a highlight reel.'
            : RUN_END_LOSS_SUBTITLES[
                Math.abs(score + level) % RUN_END_LOSS_SUBTITLES.length
              ]}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="rounded-[1.5rem] bg-white/10 border border-white/10 p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Final score</div>
            <div className="text-3xl font-black mt-2">{score.toLocaleString()}</div>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 border border-white/10 p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Level</div>
            <div className="text-3xl font-black mt-2">{level}/5</div>
          </div>
          <div className="rounded-[1.5rem] bg-white/10 border border-white/10 p-5">
            <div className="text-[10px] uppercase tracking-[0.3em] text-white/45">Best combo</div>
            <div className="text-3xl font-black mt-2">x{bestCombo}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-8">
          <button onClick={() => saveProgress(false)} className="py-4 rounded-2xl bg-white/10 border border-white/10 font-black uppercase tracking-[0.22em] hover:bg-white/15 transition-all">Save profile</button>
          <button onClick={restartGame} className="py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.22em] hover:scale-[1.02] transition-all">Run it back</button>
          <button onClick={() => setStatus(GameStatus.MENU)} className="py-4 rounded-2xl bg-black/25 border border-white/10 font-black uppercase tracking-[0.22em] text-white/75 hover:text-white transition-all">Home</button>
        </div>
      </div>
    </div>
  );
};

const Meter = ({
  label,
  value,
  max = 1,
  accent,
  icon,
}: {
  label: string;
  value: number;
  max?: number;
  accent: string;
  icon: React.ReactNode;
}) => {
  const ratio = Math.min(1, Math.max(0, value / max));
  return (
    <div className="w-full min-w-0 rounded-[1.05rem] border border-white/10 bg-black/45 p-2 backdrop-blur-md sm:min-w-[150px] sm:rounded-2xl sm:p-3">
      <div className="mb-2 flex items-center justify-between gap-1.5 text-[8px] uppercase tracking-[0.08em] text-white/50 sm:gap-3 sm:text-[10px] sm:tracking-[0.25em]">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">{icon}<span className="truncate whitespace-nowrap">{label}</span></div>
        <span>{max === 1 ? `${Math.round(ratio * 100)}%` : `${Math.round(value)}`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10 sm:h-2">
        <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, background: accent }} />
      </div>
    </div>
  );
};

const AbilityGlyph = ({ slot, className = '', src }: { slot: RunnerAbilitySlot; className?: string; src?: string }) => {
  if (src) {
    return (
      <RunnerPicture
        src={src}
        alt=""
        aria-hidden="true"
        pictureClassName={`block overflow-hidden ${className}`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  if (slot === 'blast') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
        <path d="M5 21h22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
        <path d="M8 18v-7M13 18V7M18 18v-9M23 18v-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M6 25c4-2.2 6.2-2.2 10 0s6 2.1 10 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (slot === 'core') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
        <rect x="8" y="6" width="16" height="21" rx="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M13 4h6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="m17 10-4 7h4l-2 6 5-8h-4l1-5Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <path d="M11 15v-4a2 2 0 0 1 4 0v4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M15 15v-6a2 2 0 0 1 4 0v6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M19 15v-4a2 2 0 0 1 4 0v6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 16h14a4 4 0 0 1 4 4v1a6 6 0 0 1-6 6h-7a7 7 0 0 1-7-7v-2a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M8 12 4 9M24 8l4-4M27 15l4-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
};

const AbilityIconButton = ({
  slot,
  label,
  iconSrc,
  ready = true,
  accent,
  secondary,
  onClick,
  compact = false,
}: {
  slot: RunnerAbilitySlot;
  label: string;
  iconSrc?: string;
  ready?: boolean;
  accent: string;
  secondary: string;
  onClick: () => void;
  compact?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`group relative inline-flex shrink-0 items-center justify-center overflow-hidden border font-black uppercase transition-all hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/70 ${
      compact ? 'h-12 w-12 min-h-[3rem] min-w-[3rem] rounded-xl' : 'h-14 w-14 min-h-[3rem] min-w-[3rem] rounded-2xl xl:w-auto xl:px-4'
    }`}
    style={{
      borderColor: ready ? `${accent}aa` : `${accent}42`,
      background: ready ? `linear-gradient(135deg, ${accent}, ${secondary})` : `${accent}18`,
      color: ready ? '#050011' : '#FFFFFF',
      boxShadow: ready ? `0 0 22px ${accent}40` : undefined,
    }}
  >
    <span className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at 45% 20%, ${secondary}55, transparent 58%)` }} />
    <AbilityGlyph slot={slot} src={iconSrc} className={compact ? 'relative h-5 w-5 rounded-lg' : 'relative h-6 w-6 rounded-lg'} />
    <span className={compact ? 'sr-only' : 'sr-only xl:not-sr-only xl:relative xl:ml-2 xl:text-[10px] xl:tracking-[0.2em]'}>
      {label}
    </span>
  </button>
);

const PlayingHUD = () => {
  const score = useStore((state) => state.score);
  const battery = useStore((state) => state.battery);
  const maxBattery = useStore((state) => state.maxBattery);
  const collectedLetters = useStore((state) => state.collectedLetters);
  const level = useStore((state) => state.level);
  const combo = useStore((state) => state.combo);
  const togglePause = useStore((state) => state.togglePause);
  const currentFact = useStore((state) => state.currentFact);
  const selectedCharacterId = useStore((state) => state.selectedRunnerId ?? state.selectedCharacterId);
  const isImmortalityActive = useStore((state) => state.isImmortalityActive);
  const isMagnetActive = useStore((state) => state.isMagnetActive);
  const isScannerActive = useStore((state) => state.isScannerActive);
  const isOverclockActive = useStore((state) => state.isOverclockActive);
  const isMultiplierActive = useStore((state) => state.isMultiplierActive);
  const currentBossId = useStore((state) => state.currentBossId);

  const character = getCharacterDefinition(selectedCharacterId);
  const abilityIcons = getCharacterAssets(character).abilityIcons;
  const currentBoss = getBossDefinition(currentBossId);
  const batteryRawPercent = (battery / Math.max(1, maxBattery)) * 100;
  const batteryRatio = Math.min(100, Math.max(0, batteryRawPercent));
  const batteryPercent = Math.round(batteryRatio);
  const batteryState = getBatteryState(batteryRawPercent);

  // Local Kip toast for battery state transitions. Throttled by state name —
  // one fire per downward transition, then a 4.5s timeout to clear. Doesn't
  // touch the runner store, so it can't desync with the existing currentFact
  // ticker beside it.
  const lastBatteryStateRef = useRef<BatteryState>(batteryState);
  const [kipToast, setKipToast] = useState<string | null>(null);
  const kipToastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const previous = lastBatteryStateRef.current;
    if (previous !== batteryState) {
      const wasDownward =
        BATTERY_STATE_RANK[batteryState] < BATTERY_STATE_RANK[previous];
      if (wasDownward) {
        const mood = BATTERY_STATE_TO_MOOD[batteryState];
        setKipToast(pickKipLine(mood, `${batteryState}:${level}`));
        if (kipToastTimerRef.current !== null) {
          window.clearTimeout(kipToastTimerRef.current);
        }
        kipToastTimerRef.current = window.setTimeout(() => {
          setKipToast(null);
          kipToastTimerRef.current = null;
        }, 4500);
      }
      lastBatteryStateRef.current = batteryState;
    }
  }, [batteryState, level]);

  useEffect(
    () => () => {
      if (kipToastTimerRef.current !== null) {
        window.clearTimeout(kipToastTimerRef.current);
      }
    },
    [],
  );

  const activeStatuses = [
    { label: 'Shield', active: isImmortalityActive, accent: '#ffffff' },
    { label: 'Magnet', active: isMagnetActive, accent: '#ffd74d' },
    { label: 'Scanner', active: isScannerActive, accent: '#00d9ff' },
    { label: 'Overclock', active: isOverclockActive, accent: '#2de6e6' },
    { label: 'Multiplier', active: isMultiplierActive, accent: '#ff8cc6' },
  ].filter((statusEntry) => statusEntry.active);

  return (
    <>
      <TutorialOverlay />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-50 bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.42)_55%,transparent_100%)] px-3 pt-3 pb-7 sm:px-5 sm:pt-4 sm:pb-10">
        {currentBoss ? (
          <div className="absolute left-1/2 top-3 hidden -translate-x-1/2 items-center gap-2 rounded-2xl border border-[#FF0066]/35 bg-black/62 px-3 py-2 text-center backdrop-blur-md sm:flex">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl border bg-black/60 text-sm font-black"
              style={{ borderColor: `${currentBoss.accent}80`, color: currentBoss.accent }}
              aria-hidden="true"
            >
              {currentBoss.emblem}
            </span>
            <span className="min-w-0">
              <span className="block text-[8px] font-black uppercase tracking-[0.24em] text-[#FF0066]">
                {currentBoss.threatLevel}
              </span>
              <span className="block max-w-[14rem] truncate text-xs font-black uppercase tracking-[0.16em] text-white">
                {currentBoss.name}
              </span>
            </span>
          </div>
        ) : null}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[9px] uppercase tracking-[0.28em] text-white/55 sm:text-[10px] sm:tracking-[0.32em]">Sales value</div>
            <div className="mt-0.5 text-2xl font-black italic tabular-nums text-white font-cyber sm:text-3xl md:text-4xl">{score.toLocaleString()}</div>
            {combo > 1 && (
              <div className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-t-magenta/45 bg-t-magenta/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">
                Combo x{combo}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-start gap-2">
            <div
              className="pointer-events-auto flex items-center gap-2 rounded-2xl border bg-black/55 px-2 py-1.5 backdrop-blur-md sm:gap-2.5 sm:rounded-[1.2rem] sm:px-2.5 sm:py-2"
              style={{ borderColor: `${character.accent}55` }}
            >
              <div
                className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border bg-black sm:h-11 sm:w-11"
                style={{ borderColor: `${character.accent}80` }}
              >
                <RunnerPicture
                  src={getCharacterHudPortrait(character)}
                  mobileSrc={getCharacterAvatarSmall(character)}
                  alt=""
                  pictureClassName="block h-full w-full"
                  className="h-full w-full object-cover object-center"
                  loading="eager"
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5" style={{ background: character.accent }} />
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <div className="truncate text-xs font-black text-white sm:text-sm">{character.name}</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45">L{level}</div>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10 sm:w-24">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-t-magenta),color-mix(in_srgb,var(--color-t-magenta)_58%,white))]"
                      style={{ width: `${batteryRatio}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black tabular-nums text-white/65">{batteryPercent}%</span>
                  <span
                    className={`text-[8px] font-black uppercase tracking-[0.18em] sm:text-[9px] ${
                      batteryState === 'critical' ? 'animate-pulse' : ''
                    }`}
                    style={{ color: BATTERY_STATE_COLOR[batteryState] }}
                  >
                    {BATTERY_STATE_LABEL[batteryState]}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={togglePause}
              aria-label="Pause run"
              className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/70 sm:h-11 sm:w-11"
            >
              <Pause size={16} />
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 sm:mt-3 sm:gap-2">
          {T_LIFE_WORD.map((char, idx) => {
            const active = collectedLetters.includes(idx);
            const color = TLIFE_COLORS[idx];
            return (
              <div
                key={idx}
                className="flex h-6 w-5 items-center justify-center rounded-md border font-black font-cyber text-[10px] transition-all sm:h-7 sm:w-6 sm:rounded-lg sm:text-xs"
                style={{
                  borderColor: active ? color : 'rgba(255,255,255,0.12)',
                  color: active ? (color === '#FFFFFF' ? '#000000' : '#FFFFFF') : 'rgba(255,255,255,0.28)',
                  background: active ? color : 'rgba(0,0,0,0.45)',
                  boxShadow: active ? `0 0 12px ${color}` : 'none',
                }}
              >
                {char}
              </div>
            );
          })}
        </div>

        {activeStatuses.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
            {activeStatuses.map((statusEntry) => (
              <StatusChip
                key={statusEntry.label}
                label={statusEntry.label}
                active={statusEntry.active}
                accent={statusEntry.accent}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {currentFact && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="pointer-events-none absolute bottom-3 right-3 z-50 max-w-[16rem] rounded-2xl border border-[#E20074]/35 bg-black/72 p-3 backdrop-blur-xl sm:bottom-4 sm:right-4 sm:max-w-xs sm:rounded-[1.2rem]"
          >
            <div className="text-[9px] uppercase tracking-[0.28em] text-[#E20074] mb-1">Knowledge pulse</div>
            <div className="text-xs leading-snug text-white/85">{currentFact}</div>
          </motion.div>
        )}
        {kipToast && (
          <motion.div
            key={kipToast}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="pointer-events-none absolute bottom-3 left-3 z-50 max-w-[14rem] rounded-2xl border bg-black/72 p-3 backdrop-blur-xl sm:bottom-4 sm:left-4 sm:max-w-xs sm:rounded-[1.2rem]"
            style={{ borderColor: `${BATTERY_STATE_COLOR[batteryState]}55` }}
          >
            <div
              className="text-[9px] uppercase tracking-[0.28em] mb-1"
              style={{ color: BATTERY_STATE_COLOR[batteryState] }}
            >
              Kip · {BATTERY_STATE_LABEL[batteryState]}
            </div>
            <div className="text-xs leading-snug text-white/90">{kipToast}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const HudControlPanel: React.FC = () => {
  const battery = useStore((state) => state.battery);
  const maxBattery = useStore((state) => state.maxBattery);
  const dashEnergy = useStore((state) => state.dashEnergy);
  const abilityEnergy = useStore((state) => state.abilityEnergy);
  const sidekickCoreCharge = useStore((state) => state.sidekickCoreCharge);
  const selectedCharacterId = useStore((state) => state.selectedRunnerId ?? state.selectedCharacterId);
  const character = getCharacterDefinition(selectedCharacterId);
  const abilityIcons = getCharacterAssets(character).abilityIcons;
  const abilityLabel = CHARACTER_ABILITY_SHORT[character.id];
  const smashLabel = CHARACTER_SMASH_SHORT[character.id];
  const batteryRatio = Math.min(1, Math.max(0, battery / Math.max(1, maxBattery)));

  return (
    <div
      className="relative flex w-full shrink-0 items-stretch gap-2.5 border-t border-white/10 bg-[linear-gradient(180deg,rgba(13,1,24,0.96),rgba(0,0,0,0.98))] px-3 py-3 sm:gap-4 sm:px-5 sm:py-4"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.75rem)' }}
    >
      <div
        className="relative hidden shrink-0 overflow-hidden rounded-2xl border bg-black sm:flex sm:w-[200px] md:w-[240px]"
        style={{ borderColor: `${character.accent}55`, boxShadow: `0 16px 48px ${character.accent}22` }}
      >
        <RunnerPicture
          src={getCharacterHeroArt(character)}
          mobileSrc={getCharacterMobileFallback(character)}
          alt={character.name}
          pictureClassName="absolute inset-0 block h-full w-full"
          className="h-full w-full object-cover object-center"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_45%,rgba(0,0,0,0.85)_100%)]" />
        <div className="relative mt-auto p-3">
          <div className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: character.accent }}>
            {character.brand}
          </div>
          <div className="mt-0.5 truncate text-base font-black text-white font-cyber leading-none">{character.name}</div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1" style={{ background: character.accent }} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-3">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <Meter label="Health" value={batteryRatio} accent="#FF0066" icon={<BatteryCharging className="h-3 w-3" />} />
          <Meter label="Smash" value={dashEnergy} accent={character.accent} icon={<AbilityGlyph slot="smash" src={abilityIcons.smash} className="h-3 w-3" />} />
          <Meter label="Blast" value={abilityEnergy} accent={character.secondary} icon={<AbilityGlyph slot="blast" src={abilityIcons.blast} className="h-3 w-3" />} />
          <Meter label="Core" value={sidekickCoreCharge} max={100} accent="#FFFFFF" icon={<AbilityGlyph slot="core" src={SIDEKICK_CORE.assets.abilityIcons.find(a => a.slot === 'core')?.path} className="h-4 w-4" />} />
        </div>

        <div className="grid grid-cols-[1fr_auto] items-stretch gap-2 sm:gap-3">
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl border border-white/10 bg-black/45 p-1.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => controlDispatch('hud-left')}
              aria-label="Move left"
              className="min-h-[3rem] min-w-[3rem] rounded-xl bg-white/8 text-base font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/14 active:bg-white/20"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => controlDispatch('hud-jump')}
              aria-label="Jump"
              className="min-h-[3rem] min-w-[3rem] rounded-xl bg-white/8 text-xs font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/14 active:bg-white/20"
            >
              Jump
            </button>
            <button
              type="button"
              onClick={() => controlDispatch('hud-right')}
              aria-label="Move right"
              className="min-h-[3rem] min-w-[3rem] rounded-xl bg-white/8 text-base font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-white/14 active:bg-white/20"
            >
              →
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <AbilityIconButton
              slot="smash"
              label={`Smash: ${smashLabel}`}
              iconSrc={abilityIcons.smash}
              accent={character.accent}
              secondary="#E20074"
              onClick={() => controlDispatch('hud-dash')}
              compact
            />
            <AbilityIconButton
              slot="blast"
              label={`Blast: ${abilityLabel}`}
              iconSrc={abilityIcons.blast}
              ready={abilityEnergy >= 0.99}
              accent={character.accent}
              secondary={character.secondary}
              onClick={() => controlDispatch('hud-ability')}
              compact
            />
            <AbilityIconButton
              slot="core"
              label="Core: Sidekick Core"
              iconSrc={SIDEKICK_CORE.assets.abilityIcons.find(a => a.slot === 'core')?.path}
              ready={sidekickCoreCharge >= 100}
              accent="#FFFFFF"
              secondary={character.secondary}
              onClick={() => controlDispatch('hud-sidekick-core')}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const HUD: React.FC = () => {
  const status = useStore((state) => state.status);
  const hydrateProgress = useStore((state) => state.hydrateProgress);

  React.useEffect(() => {
    if (status === GameStatus.MENU) hydrateProgress();
  }, [hydrateProgress, status]);

  if (status === GameStatus.SETTINGS) return (<><SettingsScreen /><SaveBanner /></>);
  if (status === GameStatus.SHOP) return (<><ShopScreen /><SaveBanner /></>);
  if (status === GameStatus.TRIVIA) return (<><TriviaModal /><SaveBanner /></>);
  if (status === GameStatus.PAUSED) return (<><PauseScreen /><SaveBanner /></>);
  if (status === GameStatus.MENU) return (<><MenuScreen /><SaveBanner /></>);
  if (status === GameStatus.GAME_OVER) return (<><EndScreen /><SaveBanner /></>);
  if (status === GameStatus.VICTORY) return (<><EndScreen victory /><SaveBanner /></>);

  return (
    <>
      <PlayingHUD />
    </>
  );
};
