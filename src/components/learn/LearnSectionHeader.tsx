import type { ReactNode } from 'react';
import { motion } from 'motion/react';

interface LearnSectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: ReactNode;
  chips?: string[];
  variant?: 'billboard' | 'feature' | 'compact';
}

export default function LearnSectionHeader({
  eyebrow,
  title,
  description,
  icon,
  chips = [],
  variant = 'compact',
}: LearnSectionHeaderProps) {
  const isBillboard = variant === 'billboard';
  const isFeature = variant === 'feature';
  const isCompact = variant === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`relative overflow-hidden ${
        isBillboard
          ? 'rounded-[2rem] p-5 sm:p-6 glass-billboard glass-specular'
          : isFeature
            ? 'rounded-[1.75rem] p-4 sm:p-5 glass-stage-quiet'
            : 'px-1 py-1 sm:px-0'
      }`}
    >
      {isBillboard || isFeature ? (
        <>
          <div className="pointer-events-none absolute -left-12 top-0 h-32 w-32 rounded-full bg-t-magenta/15 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-t-berry/14 blur-3xl" />
        </>
      ) : null}

      <div className={`relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between ${
        isCompact ? 'items-start' : ''
      }`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon ? (
              <div className={`flex items-center justify-center ${
                isCompact
                  ? 'h-8 w-8 rounded-2xl glass-control text-t-magenta'
                  : isBillboard
                    ? 'h-10 w-10 rounded-2xl glass-control text-t-magenta'
                    : 'h-9 w-9 rounded-2xl glass-control text-t-magenta'
              }`}>
                {icon}
              </div>
            ) : null}
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-t-magenta">
              {eyebrow}
            </p>
          </div>
          <h2 className={`mt-3 font-black tracking-tight text-foreground ${
            isBillboard
              ? 'text-[2rem] sm:text-[2.5rem]'
              : isFeature
                ? 'text-2xl sm:text-[2rem]'
                : 'text-[1.4rem] sm:text-[1.6rem]'
          }`}>
            {title}
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] font-medium leading-relaxed text-t-dark-gray sm:text-sm">
            {description}
          </p>
        </div>

        {chips.length > 0 ? (
          <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
            {chips.map((chip) => (
              <span
                key={chip}
                className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
                  isBillboard || isFeature
                    ? 'glass-control text-t-dark-gray'
                    : 'glass-control text-t-dark-gray'
                }`}
              >
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}
