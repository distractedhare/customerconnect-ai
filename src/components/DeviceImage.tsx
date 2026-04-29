import { useEffect, useMemo, useState } from 'react';
import type { Device } from '../data/devices';
import {
  COMPANY_LOGO_FALLBACK,
  PRODUCT_IMAGE_FALLBACK,
  getManufacturerBadge,
  manufacturerBadgeClass,
} from '../utils/manufacturerBadges';

type DeviceImageRecord = Pick<Device, 'name' | 'imageUrl'>;
type DeviceImageBadgeSize = 'sm' | 'md' | 'lg';

interface DeviceImageProps {
  device: DeviceImageRecord;
  className?: string;
  imageClassName?: string;
  placeholderLabel?: string;
  showBadge?: boolean;
  badgeSize?: DeviceImageBadgeSize;
  badgeClassName?: string;
  fallbackSources?: string[];
}

const BADGE_SIZE_CLASSES: Record<DeviceImageBadgeSize, string> = {
  sm: '-bottom-1 right-1 h-5 w-5 p-[3px]',
  md: 'bottom-1 right-1 h-6 w-6 p-1',
  lg: 'bottom-2 right-2 h-7 w-7 p-[5px]',
};

export default function DeviceImage({
  device,
  className = '',
  imageClassName = '',
  placeholderLabel = 'No image',
  showBadge = true,
  badgeSize = 'md',
  badgeClassName = '',
  fallbackSources,
}: DeviceImageProps) {
  const badge = getManufacturerBadge(device.name);
  const sources = useMemo(
    () =>
      (fallbackSources && fallbackSources.length > 0
        ? fallbackSources
        : [device.imageUrl, PRODUCT_IMAGE_FALLBACK, badge.fallbackAssetPath, COMPANY_LOGO_FALLBACK]
      ).filter(Boolean) as string[],
    [badge.fallbackAssetPath, device.imageUrl, fallbackSources]
  );
  const [fallbackIndex, setFallbackIndex] = useState(0);

  useEffect(() => {
    setFallbackIndex(0);
  }, [badge.fallbackAssetPath, device.imageUrl, fallbackSources]);

  const currentSource = sources[fallbackIndex];
  const isPrimaryImage = Boolean(device.imageUrl) && fallbackIndex === 0;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {currentSource ? (
        <img
          src={currentSource}
          alt={isPrimaryImage ? device.name : `${badge.label} placeholder for ${device.name}`}
          className={imageClassName}
          loading="lazy"
          width={160}
          height={160}
          onError={() => setFallbackIndex((current) => current + 1)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-surface-elevated px-2 text-center text-[9px] font-black uppercase tracking-wider text-t-dark-gray/60">
          {placeholderLabel}
        </div>
      )}

      {showBadge ? (
        <span
          className={`pointer-events-none absolute inline-flex items-center justify-center rounded-full border border-white/80 bg-white/95 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.42)] backdrop-blur-md ${BADGE_SIZE_CLASSES[badgeSize]} ${manufacturerBadgeClass(
            badge.kind
          )} ${badgeClassName}`}
          title={badge.label}
        >
          <img
            src={badge.assetPath}
            alt=""
            aria-hidden="true"
            className={`object-contain ${badge.assetClassName ?? 'h-full w-full'}`}
            width={24}
            height={24}
          />
        </span>
      ) : null}
    </div>
  );
}
