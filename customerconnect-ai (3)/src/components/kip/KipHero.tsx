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

import { Flame, Radio } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { KipTone } from '../../types/kip';
import { KIP_ASSETS } from './kipAssets';

interface KipHeroProps {
  greeting: string;
  tagline?: string;
  tone?: KipTone;
  /** Override the tone label shown in the kicker (e.g. "Game on" vs "Hype"). */
  toneLabel?: string;
}

// Kip's canonical hero assets. WebP loads first for runtime weight, PNG stays
// as the compatibility fallback, and Lucide Flame is the last resort.
// The portrait should be the helmeted-operator Kip from the character sheet
// (magenta visor, T-Mobile jacket, robotic chrome hands). Do NOT reuse any
// `/levelup/runner/portraits/*` file — those are unrelated runner-game characters.
const HERO_WEBP = KIP_ASSETS.hero.webp;
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

// Subtle outer-glow color per tone. The hero card already lives inside a
// magenta-tinted gradient, so these are deliberately low-saturation —
// Kip should not out-compete the action cards below him.
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

type Source = 'webp' | 'png' | 'fallback';

export default function KipHero({ greeting, tagline, tone = 'hype', toneLabel }: KipHeroProps) {
  // Default to the Lucide fallback so we never paint a broken image. Probe
  // the WebP and PNG in priority order; switch to whichever loads. If neither
  // exists yet (Kip art not dropped in /kip/), the Flame fallback stays.
  const [source, setSource] = useState<Source>('fallback');

  useEffect(() => {
    let cancelled = false;
    const tryLoad = (src: string) => new Promise<boolean>((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
    (async () => {
      if (await tryLoad(HERO_WEBP)) {
        if (!cancelled) setSource('webp');
        return;
      }
      if (await tryLoad(HERO_PNG)) {
        if (!cancelled) setSource('png');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-[1.85rem] p-5 sm:p-6"
      style={{
        background:
          'radial-gradient(ellipse at top left, rgba(226,0,116,0.18), transparent 55%), linear-gradient(180deg, rgba(226,0,116,0.08), rgba(0,0,0,0.04))',
        border: '1px solid rgba(226,0,116,0.22)',
      }}
    >
      <div className="flex items-start gap-4 sm:gap-5">
        <KipPortrait source={source} tone={tone} />
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
  source: Source;
  tone: KipTone;
}

function KipPortrait({ source, tone }: KipPortraitProps) {
  const glow = TONE_GLOW[tone];
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[1.4rem] bg-t-magenta sm:rounded-[1.6rem]"
      style={{
        // Mobile: 96px. sm+: 128px. The size is anchored by the parent flex
        // and by aspect-square so the portrait stays a clean circle/square.
        width: 'clamp(96px, 22vw, 144px)',
        height: 'clamp(96px, 22vw, 144px)',
        boxShadow: `0 22px 44px -22px ${glow}, 0 0 0 1px rgba(226,0,116,0.22)`,
      }}
      aria-hidden="true"
    >
      {/* Hand-light glow pulse: a soft radial under the portrait that
          modulates opacity to fake the wrist-gauntlet shimmer in the art. */}
      <div
        className="kip-glow-pulse pointer-events-none absolute inset-0"
        style={{
          background:
            `radial-gradient(circle at 50% 78%, ${glow}, transparent 58%)`,
        }}
      />

      {/* The breathing animation lives on a wrapper so its transform: scale()
          keyframes don't clobber the crop transform on the inner <img>. */}
      <div className="kip-breathe relative h-full w-full">
        {source === 'webp' && (
          <img
            src={HERO_WEBP}
            alt="Kip"
            className="relative h-full w-full object-cover object-top"
          />
        )}
        {source === 'png' && (
          <img
            src={HERO_PNG}
            alt="Kip"
            className="relative h-full w-full object-cover object-top"
            loading="lazy"
          />
        )}
        {source === 'fallback' && (
          <div className="relative flex h-full w-full items-center justify-center text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_42%)]" />
            <Flame className="relative h-12 w-12" />
          </div>
        )}
      </div>

      {/* Soft top-left specular shine kept consistent with KipBadge. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.32),transparent_44%)]" />
    </div>
  );
}
