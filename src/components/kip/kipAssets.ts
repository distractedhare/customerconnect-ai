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
    png: '/kip/portrait.png',
    alt: 'Kip',
    minSize: 64,
    usage: 'Coach cards, Live guidance, Learn notes, and medium helper panels.',
  },
  avatar: {
    png: '/kip/orb.png',
    alt: 'Kip',
    minSize: 32,
    usage: 'Compact assistant badge and runner Sidekick Core identity.',
  },
  orb: {
    png: '/kip/orb.png',
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
      svg: '/assets/kip/kip_32_idle.svg',
      alt: 'Kip idle',
      minSize: 32,
      usage: 'Default Kip state.',
    },
    listening: {
      svg: '/assets/kip/kip_32_listening.svg',
      alt: 'Kip listening',
      minSize: 32,
      usage: 'Listening or live-readiness state.',
    },
    tip: {
      svg: '/assets/kip/kip_32_tip.svg',
      alt: 'Kip tip',
      minSize: 32,
      usage: 'Suggestion, coaching, or next-best-action state.',
    },
    alert: {
      svg: '/assets/kip/kip_32_alert.svg',
      alt: 'Kip alert',
      minSize: 32,
      usage: 'Warning, blocked flow, or attention-needed state.',
    },
    success: {
      svg: '/assets/kip/kip_32_success.svg',
      alt: 'Kip success',
      minSize: 32,
      usage: 'Completed, saved, or celebratory state.',
    },
    loading: {
      svg: '/assets/kip/kip_32_loading.svg',
      alt: 'Kip loading',
      minSize: 32,
      usage: 'Loading, thinking, or work-in-progress state.',
    },
    speaking: {
      svg: '/assets/kip/kip_32_speaking.svg',
      alt: 'Kip speaking',
      minSize: 32,
      usage: 'Kip guidance or spoken-coach state.',
    },
    notification: {
      svg: '/assets/kip/kip_32_alert.svg', // Fallback to alert for notification if specific one missing
      alt: 'Kip notification',
      minSize: 32,
      usage: 'Notification badge or small count moment.',
    },
  },
} as const satisfies Record<string, KipAssetEntry | Record<string, KipAssetEntry>>;

export function getKipBadgeAsset(
  _size: number,
  state: KipAssetState = "idle"
) {
  // Restore the 3D head for the idle state as requested.
  // The vector SVGs are great for states, but the 3D orb is the premium face of the app.
  if (state === "idle") {
    return KIP_ASSETS.avatar as KipAssetEntry;
  }

  // Use the state-specific SVG if it exists in the KIP_ASSETS.states object
  const stateAsset = KIP_ASSETS.states[state as keyof typeof KIP_ASSETS.states];
  if (stateAsset) return stateAsset as KipAssetEntry;
  
  // Fallback to 3D avatar
  return KIP_ASSETS.avatar as KipAssetEntry;
}

export function getKipStateAsset(state: string) {
  const stateAsset = KIP_ASSETS.states[state as keyof typeof KIP_ASSETS.states];
  if (stateAsset) return stateAsset as KipAssetEntry;
  return KIP_ASSETS.avatar as KipAssetEntry;
}
