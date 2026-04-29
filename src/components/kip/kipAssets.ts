export type KipAssetSize = 16 | 24 | 32 | 64 | 128;
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
    webp: '/kip/hero.webp',
    alt: 'Kip',
    minSize: 128,
    usage: 'Large mascot moments: Home, onboarding, major recovery or celebration states.',
  },
  portrait: {
    png: '/kip/portrait.png',
    webp: '/kip/portrait.webp',
    alt: 'Kip',
    minSize: 64,
    usage: 'Coach cards, Live guidance, Learn notes, and medium helper panels.',
  },
  orb: {
    png: '/kip/orb.png',
    webp: '/kip/orb.webp',
    alt: 'Kip',
    minSize: 32,
    usage: 'Compact assistant badge and runner Sidekick Core identity.',
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

export function getKipBadgeAsset(size: KipAssetSize, state: KipAssetState = 'idle'): KipAssetEntry {
  if (size <= 32) return KIP_ASSETS.states[state] ?? KIP_ASSETS.visor;
  if (size <= 64) return state === 'idle' ? KIP_ASSETS.orb : KIP_ASSETS.states[state];
  return KIP_ASSETS.portrait;
}

export function getKipStateAsset(state: KipAssetState): KipAssetEntry {
  return KIP_ASSETS.states[state];
}
