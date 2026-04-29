import DeviceImage from '../DeviceImage';

export type HeroEcosystem = 'apple' | 'samsung' | 'google';

interface ProductHeroCardProps {
  productName: string;
  imageUrl: string;
  ecosystem: HeroEcosystem;
  onClick?: () => void;
  subtitle?: string;
}

const ECOSYSTEM_LABEL: Record<HeroEcosystem, string> = {
  apple: 'Apple',
  samsung: 'Samsung',
  google: 'Google',
};

export default function ProductHeroCard({
  productName,
  imageUrl,
  ecosystem,
  onClick,
  subtitle,
}: ProductHeroCardProps) {
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`group relative block w-full overflow-hidden rounded-3xl glass-card aspect-[4/5] text-left focus-ring ${
        onClick ? 'cursor-pointer' : ''
      }`}
      aria-label={`${productName} — ${ECOSYSTEM_LABEL[ecosystem]} ecosystem`}
    >
      <DeviceImage
        device={{ name: productName, imageUrl }}
        className="absolute inset-0 h-full w-full bg-transparent"
        imageClassName="absolute inset-0 h-full w-full object-contain px-5 pt-5 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        badgeSize="lg"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent px-4 pb-4 pt-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/70">
          {ECOSYSTEM_LABEL[ecosystem]}
        </p>
        <h3 className="text-base font-extrabold leading-tight text-white">
          {productName}
        </h3>
        {subtitle && (
          <p className="mt-1 text-[11px] font-medium text-white/80">{subtitle}</p>
        )}
      </div>
    </Wrapper>
  );
}
