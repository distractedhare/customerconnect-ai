/**
 * KipHero — the Rep Home "co-host" moment.
 *
 * Kip is a supporting character; this large-format treatment is reserved for
 * major brand moments. Everyday guidance should render as KipBadge.
 *
 * Defensive loading:
 *   1. WebP hero crop for the production app
 *   2. PNG hero crop as fallback
 *   3. A magenta-framed Flame fallback if both images fail
 *
 * Kip's idle motion is a slow breathing scale + a gentler glow pulse on the
 * hand-light area. Both stop on prefers-reduced-motion.
 */

import { Radio } from 'lucide-react';
import type { KipTone } from '../../types/kip';
import { KIP_ASSETS } from './kipAssets';

interface KipHeroProps {
  greeting: string;
  tagline?: string;
  tone?: KipTone;
  /** Override the tone label shown in the kicker (e.g. "Game on" vs "Hype"). */
  toneLabel?: string;
  borderless?: boolean;
}

// Kip's canonical hero assets. WebP loads first for runtime weight, PNG stays
// as the compatibility fallback, and Lucide Flame is the last resort.
// The portrait should be the helmeted-operator Kip from the character sheet
// (magenta visor, T-Mobile jacket, robotic chrome hands). Do NOT reuse any
// `/levelup/runner/portraits/*` file — those are unrelated runner-game characters.
const HERO_PNG = KIP_ASSETS.hero.png;

const TONE_KICKER: Record<KipTone, string> = {
  operator: 'Operator',
  coach: 'Coach',
  mission: 'Mission',
  tip: 'Tip',
  pivot: 'Pivot',
  celebrate: 'Hype',
  recover: 'Reset',
  hype: 'Game on',
  tease: 'Heads up',
};

// Subtle outer-glow color per tone.
const TONE_GLOW: Record<KipTone, string> = {
  operator: 'rgba(226,0,116,0.28)',
  coach:    'rgba(134,27,84,0.32)',
  mission:  'rgba(255,255,255,0.18)',
  tip:      'rgba(212,160,23,0.28)',
  pivot:    'rgba(212,130,23,0.28)',
  celebrate:'rgba(255,92,173,0.40)',
  recover:  'rgba(180,180,190,0.22)',
  hype:     'rgba(255,92,173,0.36)',
  tease:    'rgba(255,156,198,0.30)',
};

export default function KipHero({ greeting, tagline, tone = 'hype', toneLabel, borderless }: KipHeroProps) {
  return (
    <div
      className={`relative overflow-hidden p-5 sm:p-6 ${borderless ? '' : 'rounded-[1.85rem] border'}`}
      style={borderless ? {} : {
        background:
          'radial-gradient(ellipse at top left, rgba(226,0,116,0.18), transparent 55%), linear-gradient(180deg, rgba(226,0,116,0.08), rgba(0,0,0,0.04))',
        border: '1px solid rgba(226,0,116,0.22)',
      }}
    >
      <div className="flex items-start gap-4 sm:gap-5">
        <KipPortrait tone={tone} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-t-magenta">
            <Radio className="h-3 w-3" aria-hidden="true" />
            Kip · {toneLabel ?? TONE_KICKER[tone]}
          </p>
          <p className="mt-2 text-base font-black leading-snug text-foreground sm:text-lg">
            {greeting}
          </p>
          {tagline ? (
            <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-t-dark-gray sm:text-xs">
              {tagline}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface KipPortraitProps {
  tone: KipTone;
}

function KipPortrait({ tone }: KipPortraitProps) {
  const glow = TONE_GLOW[tone];
  return (
    <div
      className="relative shrink-0"
      style={{
        width: 'clamp(96px, 22vw, 144px)',
        height: 'clamp(96px, 22vw, 144px)',
      }}
      aria-hidden="true"
    >
      {/* Dynamic tone glow behind the transparent PNG */}
      <div
        className="kip-glow-pulse pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 70%, ${glow}, transparent 70%)`,
        }}
      />

      <div className="kip-breathe relative h-full w-full">
        <img
          src={KIP_ASSETS.hero.png}
          alt="Kip"
          className="h-full w-full object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
        />
      </div>
    </div>
  );
}
