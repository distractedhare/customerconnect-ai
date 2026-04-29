export type KipAvatarSize = 'tiny' | 'small' | 'medium' | 'large';

export type KipAvatarState =
  | 'idle'
  | 'listening'
  | 'tip'
  | 'alert'
  | 'success'
  | 'loading'
  | 'speaking';

export const KIP_SIZE_PX: Record<KipAvatarSize, 16 | 32 | 64 | 128> = {
  tiny: 16,
  small: 32,
  medium: 64,
  large: 128,
};

export const KIP_COLORS = {
  magenta: '#FF0066',
  darkGrey: '#0F0F14',
  steelGrey: '#2A2E36',
} as const;

export const KIP_AVATAR_STATES: readonly KipAvatarState[] = [
  'idle',
  'listening',
  'tip',
  'alert',
  'success',
  'loading',
  'speaking',
];

export const KIP_AVATAR_PIXEL_SIZES = [16, 32, 64, 128] as const;
