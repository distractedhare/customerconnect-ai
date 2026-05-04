import { useEffect, useMemo, useState } from 'react';
import {
  COMPANY_LOGO_FALLBACK,
  getManufacturerBadge,
  manufacturerBadgeClass,
} from '../utils/manufacturerBadges';

interface AccessoryImageSlotProps {
  name: string;
  imageUrl?: string;
  heroImageUrl?: string;
  fallbackSources?: string[];
  className: string;
  imageClassName: string;
  placeholderLabel?: string;
  showManufacturerBadge?: boolean;
}

export default function AccessoryImageSlot({
  name,
  imageUrl,
  heroImageUrl,
  fallbackSources,
  className,
  imageClassName,
  placeholderLabel = 'Accessory',
  showManufacturerBadge = true,
}: AccessoryImageSlotProps) {
  const badge = getManufacturerBadge(name);
  const resolvedSources = useMemo(
    () =>
      (fallbackSources && fallbackSources.length > 0
        ? fallbackSources
        : [imageUrl, heroImageUrl, badge.fallbackAssetPath, COMPANY_LOGO_FALLBACK]
      ).filter(Boolean) as string[],
    [badge.fallbackAssetPath, fallbackSources, heroImageUrl, imageUrl]
  );
  const [fallbackIndex, setFallbackIndex] = useState(0);

  useEffect(() => {
    setFallbackIndex(0);
  }, [badge.fallbackAssetPath, fallbackSources, heroImageUrl, imageUrl]);

  const currentSource = resolvedSources[fallbackIndex];
  const shouldShowImage = Boolean(currentSource);
  const isPrimaryImage = Boolean(imageUrl) && fallbackIndex === 0;
  const isKnowledgeHero = Boolean(heroImageUrl) && currentSource === heroImageUrl;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      {shouldShowImage ? (
        <img
          src={currentSource}
          alt={isPrimaryImage || isKnowledgeHero ? name : `${badge.label} placeholder for ${name}`}
          className={`${imageClassName} ${isPrimaryImage ? '' : 'opacity-80 saturate-75'}`}
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
      {showManufacturerBadge && (
        <span
          className={`pointer-events-none absolute -bottom-1 right-1 inline-flex h-5 w-5 items-center justify-center rounded-full border p-1 ${manufacturerBadgeClass(
            badge.kind
          )}`}
          title={badge.label}
        >
          <img
            src={badge.assetPath}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-contain"
            width={20}
            height={20}
          />
        </span>
      )}
    </div>
  );
}
