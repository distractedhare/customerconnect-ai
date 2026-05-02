import { useMemo, useState } from 'react';
import { KIP_COLORS, KIP_SIZE_PX, type KipAvatarSize, type KipAvatarState } from './kip-types';
import { getKipBadgeAsset } from './kipAssets';

interface KipAvatarProps {
  size: KipAvatarSize;
  state: KipAvatarState;
  showGlow?: boolean;
  showOnlineStatus?: boolean;
  className?: string;
  alt?: string;
  onClick?: () => void;
}

const SIZE_RADIUS: Record<KipAvatarSize, string> = {
  tiny: '4px',
  small: '8px',
  medium: '16px',
  large: '24px',
};

export default function KipAvatar({
  size,
  state,
  showGlow = false,
  showOnlineStatus = false,
  className = '',
  alt = 'Kip',
  onClick,
}: KipAvatarProps) {
  const pixelSize = KIP_SIZE_PX[size];
  const [failed, setFailed] = useState(false);

  const asset = useMemo(() => getKipBadgeAsset(pixelSize as any, state as any), [pixelSize, state]);
  const src = failed ? null : (asset.svg || asset.webp || asset.png);

  const isSmall = size === 'tiny' || size === 'small';
  const strokeColor = state === 'alert' ? '#FF3030' : KIP_COLORS.magenta;
  const shouldGlow = showGlow && !isSmall;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex shrink-0 items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        width: pixelSize,
        height: pixelSize,
        filter: shouldGlow ? `drop-shadow(0 0 8px ${strokeColor}66)` : 'none',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt || asset.alt}
          loading="lazy"
          className="h-full w-full object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <div 
          className="h-full w-full rounded-full"
          style={{ backgroundColor: strokeColor }}
          aria-label={alt}
        />
      )}
      {showOnlineStatus && (
        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-[#0F0F14] bg-green-500" />
      )}
    </div>
  );
}
