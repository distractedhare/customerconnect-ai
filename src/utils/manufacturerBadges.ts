export type ManufacturerKind = 'apple' | 'google' | 'samsung' | 'motorola' | 'tmobile' | 'third-party';

export interface ManufacturerBadge {
  kind: ManufacturerKind;
  label: string;
  assetPath: string;
  fallbackAssetPath: string;
  badgeClassName: string;
  assetClassName?: string;
}

export const PRODUCT_IMAGE_FALLBACK = '/images/ui/product-fallback.png';
export const COMPANY_LOGO_FALLBACK = '/images/ui/product-card-fallback.svg';

const MANUFACTURER_BADGES: Record<ManufacturerKind, ManufacturerBadge> = {
  apple: {
    kind: 'apple',
    label: 'Apple',
    assetPath: '/images/brands/apple.svg',
    fallbackAssetPath: '/images/brands/apple.svg',
    badgeClassName: 'ring-1 ring-black/5',
    assetClassName: 'h-[68%] w-[68%]',
  },
  google: {
    kind: 'google',
    label: 'Google',
    assetPath: '/images/brands/google.svg',
    fallbackAssetPath: '/images/brands/google.svg',
    badgeClassName: 'ring-1 ring-sky-200/55',
    assetClassName: 'h-[68%] w-[68%]',
  },
  samsung: {
    kind: 'samsung',
    label: 'Samsung',
    assetPath: '/images/brands/samsung.svg',
    fallbackAssetPath: '/images/brands/samsung.svg',
    badgeClassName: 'ring-1 ring-sky-200/60',
    assetClassName: 'h-[42%] w-[82%]',
  },
  motorola: {
    kind: 'motorola',
    label: 'Motorola',
    assetPath: '/images/brands/motorola.svg',
    fallbackAssetPath: '/images/brands/motorola.svg',
    badgeClassName: 'ring-1 ring-rose-200/60',
    assetClassName: 'h-[68%] w-[68%]',
  },
  tmobile: {
    kind: 'tmobile',
    label: 'T-Mobile',
    assetPath: '/images/brands/tmobile.svg',
    fallbackAssetPath: '/images/brands/tmobile.svg',
    badgeClassName: 'ring-1 ring-t-magenta/20',
    assetClassName: 'h-[62%] w-[62%]',
  },
  'third-party': {
    kind: 'third-party',
    label: 'Third-party',
    assetPath: '/images/brands/third-party.svg',
    fallbackAssetPath: '/images/brands/third-party.svg',
    badgeClassName: 'ring-1 ring-slate-200/80',
    assetClassName: 'h-[64%] w-[64%]',
  },
};

function includesAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}

export function getManufacturerBadge(rawName: string): ManufacturerBadge {
  const name = rawName.toLowerCase();

  if (includesAny(name, ['t-mobile', 'tmobile', 'revvl', 'syncup', 'linkport', 'franklin', 'protection 360', 'p360', 'tcl'])) {
    return MANUFACTURER_BADGES.tmobile;
  }

  if (includesAny(name, ['apple', 'iphone', 'ipad', 'airpods', 'apple watch', 'apple pencil', 'beats'])) {
    return MANUFACTURER_BADGES.apple;
  }

  if (includesAny(name, ['pixel', 'google', 'fitbit'])) {
    return MANUFACTURER_BADGES.google;
  }

  if (includesAny(name, ['samsung', 'galaxy'])) {
    return MANUFACTURER_BADGES.samsung;
  }

  if (includesAny(name, ['motorola', 'moto'])) {
    return MANUFACTURER_BADGES.motorola;
  }

  return MANUFACTURER_BADGES['third-party'];
}

export function manufacturerBadgeClass(kind: ManufacturerKind): string {
  return MANUFACTURER_BADGES[kind].badgeClassName;
}
