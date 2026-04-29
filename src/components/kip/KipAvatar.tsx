import { useMemo, useState } from 'react';
import { KIP_COLORS, KIP_SIZE_PX, type KipAvatarSize, type KipAvatarState } from './kip-types';

interface KipAvatarProps {
  size: KipAvatarSize;
  state: KipAvatarState;
  showGlow: boolean;
  showOnlineStatus: boolean;
  className?: string;
  alt?: string;
}

const SIZE_RADIUS: Record<KipAvatarSize, string> = {
  tiny: '4px',
  small: '8px',
  medium: '16px',
  large: '24px',
};

const FALLBACK_DOT_SIZE: Record<KipAvatarSize, string> = {
  tiny: '4px',
  small: '8px',
  medium: '16px',
  large: '32px',
};

function getKipAssetPath(pixelSize: number, state: KipAvatarState) {
  return `/assets/kip/kip_${pixelSize}_${state}.svg`;
}

export default function KipAvatar({
  size,
  state,
  showGlow,
  showOnlineStatus,
  className = '',
  alt = 'Kip',
}: KipAvatarProps) {
  const pixelSize = KIP_SIZE_PX[size];
  const [failedState, setFailedState] = useState<KipAvatarState | 'fallback' | null>(null);

  const resolvedState = failedState === null ? state : failedState === 'fallback' ? null : failedState;
  const src = useMemo(
    () => (resolvedState ? getKipAssetPath(pixelSize, resolvedState) : null),
    [pixelSize, resolvedState],
  );
  const isSmall = size === 'tiny' || size === 'small';
  const strokeWidth = isSmall ? 1.5 : 2;
  const strokeColor = state === 'alert' ? 'red' : KIP_COLORS.magenta;
  const shouldGlow = showGlow && !isSmall;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-visible ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        boxSizing: 'border-box',
        borderRadius: SIZE_RADIUS[size],
        border: `${strokeWidth}px solid ${strokeColor}`,
        backgroundColor: KIP_COLORS.darkGrey,
        boxShadow: shouldGlow ? '0 0 16px rgba(255, 0, 102, 0.2)' : 'none',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          draggable={false}
          onError={() => {
            setFailedState((current) => {
              if (current === 'idle' || (current === null && state === 'idle')) return 'fallback';
              return 'idle';
            });
          }}
          className="h-full w-full select-none object-contain"
        />
      ) : (
        <span
          aria-label={alt}
          role="img"
          className="block rounded-full"
          style={{
            width: FALLBACK_DOT_SIZE[size],
            height: FALLBACK_DOT_SIZE[size],
            backgroundColor: strokeColor,
          }}
        />
      )}
      {showOnlineStatus ? (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-[#0F0F14]" />
      ) : null}
    </span>
  );
}
