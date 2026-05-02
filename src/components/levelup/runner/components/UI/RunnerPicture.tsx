import type { ImgHTMLAttributes } from 'react';

const rasterPattern = /\.(png|jpe?g)$/i;
const runnerArtRoots = ['/levelup/runner/'];
const runnerArtVersion = '20260430c';

function getVersionedAssetSrc(src?: string | null) {
  if (!src) return undefined;
  if (!runnerArtRoots.some((root) => src.startsWith(root))) return src;
  return `${src}${src.includes('?') ? '&' : '?'}v=${runnerArtVersion}`;
}

export function getWebpVariant(src?: string | null) {
  if (!src || !rasterPattern.test(src)) return null;
  return src.replace(rasterPattern, '.webp');
}

interface RunnerPictureProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  mobileSrc?: string;
  pictureClassName?: string;
}

export function RunnerPicture({
  src,
  mobileSrc,
  pictureClassName = 'block h-full w-full',
  alt,
  ...imgProps
}: RunnerPictureProps) {
  const imgSrc = getVersionedAssetSrc(src);
  const mobileImgSrc = getVersionedAssetSrc(mobileSrc);
  const webpSrc = getVersionedAssetSrc(getWebpVariant(src));
  const mobileWebpSrc = getVersionedAssetSrc(getWebpVariant(mobileSrc));

  return (
    <picture className={pictureClassName}>
      {mobileSrc && mobileWebpSrc ? <source media="(max-width: 520px)" srcSet={mobileWebpSrc} type="image/webp" /> : null}
      {mobileImgSrc ? <source media="(max-width: 520px)" srcSet={mobileImgSrc} /> : null}
      {webpSrc ? <source srcSet={webpSrc} type="image/webp" /> : null}
      <img src={imgSrc} alt={alt} {...imgProps} />
    </picture>
  );
}
