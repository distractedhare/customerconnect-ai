import type { ImgHTMLAttributes } from 'react';

const rasterPattern = /\.(png|jpe?g)$/i;

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
  const webpSrc = getWebpVariant(src);
  const mobileWebpSrc = getWebpVariant(mobileSrc);

  return (
    <picture className={pictureClassName}>
      {mobileSrc && mobileWebpSrc ? <source media="(max-width: 520px)" srcSet={mobileWebpSrc} type="image/webp" /> : null}
      {mobileSrc ? <source media="(max-width: 520px)" srcSet={mobileSrc} /> : null}
      {webpSrc ? <source srcSet={webpSrc} type="image/webp" /> : null}
      <img src={src} alt={alt} {...imgProps} />
    </picture>
  );
}
