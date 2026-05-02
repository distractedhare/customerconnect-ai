export type KipAssetSize = 16 | 24 | 32 | 64 | 128 | 256;
export type KipAssetState =
  | 'idle'
  | 'listening'
  | 'tip'
  | 'alert'
  | 'success'
  | 'loading'
  | 'speaking'
  | 'notification';

export interface KipAssetEntry {
  png?: string;
  webp?: string;
  svg?: string;
  alt: string;
  minSize: KipAssetSize;
  maxRecommendedSize?: KipAssetSize;
  ariaHidden?: boolean;
  usage: string;
}

export const KIP_SOURCE_SHEETS = {
  productionReview: '/kip/source-sheets/kip-production-review.png',
  iconSystem: '/kip/source-sheets/kip-icon-system.png',
} as const;

export const KIP_ASSETS = {
  hero: {
    png: '/kip/hero.png',
    alt: 'Kip',
    minSize: 128,
    usage: 'Large mascot moments: Home, onboarding, major recovery or celebration states.',
  },
  portrait: {
    png: '/kip/mobile.png',
    alt: 'Kip',
    minSize: 64,
    usage: 'Coach cards, Live guidance, Learn notes, and medium helper panels.',
  },
  avatar: {
    png: '/kip/avatar.png',
    alt: 'Kip',
    minSize: 32,
    usage: 'Compact assistant badge and runner Sidekick Core identity.',
  },
  orb: {
    png: '/kip/avatar.png',
    alt: 'Kip',
    minSize: 32,
    usage: 'Compact assistant badge and runner Sidekick Core identity.',
  },
  banner: {
    png: '/kip/banner.png',
    alt: 'Kip Banner',
    minSize: 256,
    usage: 'Wide hero banner panels: T-LIFE Runner intro, character select.',
  },
  visor: {
    svg: '/kip/icons/kip-visor.svg',
    alt: 'Kip',
    minSize: 16,
    maxRecommendedSize: 64,
    usage: 'Small UI placements where the helmet silhouette and visor must stay readable.',
  },
  states: {
    idle: {
      svg: '/kip/states/kip-idle.svg',
      alt: 'Kip idle',
      minSize: 16,
      maxRecommendedSize: 64,
      usage: 'Default tiny Kip state.',
    },
    listening: {
      svg: '/kip/states/kip-listening.svg',
      alt: 'Kip listening',
      minSize: 24,
      maxRecommendedSize: 64,
      usage: 'Listening or live-readiness state.',
    },
    tip: {
      svg: '/kip/states/kip-tip.svg',
      alt: 'Kip tip',
      minSize: 24,
      maxRecommendedSize: 64,
      usage: 'Suggestion, coaching, or next-best-action state.',
    },
    alert: {
      svg: '/kip/states/kip-alert.svg',
      alt: 'Kip alert',
      minSize: 24,
      maxRecommendedSize: 64,
      usage: 'Warning, blocked flow, or attention-needed state.',
    },
    success: {
      svg: '/kip/states/kip-success.svg',
      alt: 'Kip success',
      minSize: 24,
      maxRecommendedSize: 64,
      usage: 'Completed, saved, or celebratory state.',
    },
    loading: {
      svg: '/kip/states/kip-loading.svg',
      alt: 'Kip loading',
      minSize: 24,
      maxRecommendedSize: 64,
      usage: 'Loading, thinking, or work-in-progress state.',
    },
    speaking: {
      svg: '/kip/states/kip-speaking.svg',
      alt: 'Kip speaking',
      minSize: 24,
      maxRecommendedSize: 64,
      usage: 'Kip guidance or spoken-coach state.',
    },
    notification: {
      svg: '/kip/states/kip-notification.svg',
      alt: 'Kip notification',
      minSize: 24,
      maxRecommendedSize: 64,
      usage: 'Notification badge or small count moment.',
    },
  },
} as const satisfies Record<string, KipAssetEntry | Record<string, KipAssetEntry>>;

export function getKipBadgeAsset(
  _size: number,
  _state: "idle" | "listening" | "tip" | "alert" | "success" | "loading" | "speaking" | "notification" = "idle"
) {
  // State-specific SVGs reference an external `<image href>` that browsers
  // sandbox and refuse to load when the parent SVG in an <img>. Plus
  // KIP_ASSETS.orb and KIP_ASSETS.portrait don't exist on this object.
  // Return the transparent avatar PNG for every size/state. State distinction
  // is carried by the breathing/glow/pulse animation in <KipAvatar />.
  return KIP_ASSETS.avatar as KipAssetEntry;
}

export function getKipStateAsset(_state: string) {
  return KIP_ASSETS.avatar as KipAssetEntry;
}
