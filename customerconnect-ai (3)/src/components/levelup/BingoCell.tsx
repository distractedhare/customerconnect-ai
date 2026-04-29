import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Check, X } from 'lucide-react';
import { BingoCell as BingoCellType } from '../../constants/bingoBoard';
import { lightTap } from '../../utils/haptics';

interface BingoCellProps {
  cell: BingoCellType;
  completed: boolean;
  isWinning: boolean;
  onToggle: (reflection?: string) => void;
}

const CATEGORY_STYLES = {
  sales: {
    bg: 'var(--cat-sales-bg)',
    border: 'var(--cat-sales-border)',
    accent: 'var(--cat-sales-accent)',
    dotColor: 'var(--cat-sales-accent)',
    label: 'Sales',
  },
  skill: {
    bg: 'var(--cat-skill-bg)',
    border: 'var(--cat-skill-border)',
    accent: 'var(--cat-skill-accent)',
    dotColor: 'var(--cat-skill-accent)',
    label: 'Skill',
  },
  vibe: {
    bg: 'var(--cat-vibe-bg)',
    border: 'var(--cat-vibe-border)',
    accent: 'var(--cat-vibe-accent)',
    dotColor: 'var(--cat-vibe-accent)',
    label: 'Vibe',
  },
} as const;

const CATEGORY_HEX: Record<string, string[]> = {
  sales: ['#E20074', '#FF4AA0', '#FFFFFF'],
  skill: ['#861B54', '#C74B8A', '#FFFFFF'],
  vibe: ['#D4A017', '#F5D04E', '#FFFFFF'],
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function burstFromElement(element: HTMLElement | null, colors: string[]): void {
  if (!element || prefersReducedMotion()) return;
  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;
  void confetti({
    particleCount: 18,
    spread: 70,
    startVelocity: 22,
    scalar: 0.75,
    ticks: 90,
    gravity: 0.9,
    colors,
    origin: { x, y },
    disableForReducedMotion: true,
  });
}

const QUICK_REFLECTIONS: Record<string, { text: string; marks: boolean }[]> = {
  sales: [
    { text: 'Pitched it & Closed it 💰', marks: true },
    { text: 'Shot my shot (They said no) 🤷‍♂️', marks: true },
    { text: 'Missed the opportunity 🤦‍♂️', marks: false },
  ],
  skill: [
    { text: 'Nailed it 🎯', marks: true },
    { text: 'Forgot to do it 😬', marks: false },
  ],
  vibe: [
    { text: 'Brought the energy 🔥', marks: true },
    { text: 'Tried, but felt clunky 😅', marks: true },
    { text: 'Totally blanked on it 👻', marks: false },
  ],
};

export default function BingoCell({ cell, completed, isWinning, onToggle }: BingoCellProps) {
  const isFree = cell.id === 'free-space';
  const style = CATEGORY_STYLES[cell.category];
  const [showReflection, setShowReflection] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleTap = () => {
    if (isFree) return;

    lightTap();

    // If unchecking, just toggle
    if (completed) {
      onToggle();
      return;
    }

    setShowReflection(true);
  };

  const handleQuickReflection = (option: { text: string; marks: boolean }) => {
    lightTap();
    setShowReflection(false);
    if (option.marks) {
      burstFromElement(buttonRef.current, CATEGORY_HEX[cell.category] ?? CATEGORY_HEX.sales);
      onToggle(option.text);
    }
  };

  const handleCancel = () => {
    setShowReflection(false);
  };

  return (
    <>
      <motion.button
        ref={buttonRef}
        type="button"
        onClick={handleTap}
        aria-pressed={completed}
        aria-label={`${cell.label}: ${cell.description}`}
        whileTap={isFree ? undefined : { scale: 0.93 }}
        className={`focus-ring glass-cell relative aspect-square min-h-[48px] overflow-hidden rounded-2xl p-0.5 sm:p-1 text-center ${
          isFree ? 'cursor-default' : 'cursor-pointer'
        }`}
        style={{
          background: completed
            ? `linear-gradient(135deg, ${style.dotColor}, ${style.dotColor}dd)`
            : style.bg,
          borderColor: completed
            ? style.dotColor
            : isWinning
            ? style.accent
            : undefined,
          boxShadow: completed
            ? `0 6px 18px ${style.dotColor}30, inset 0 1px 0 rgba(255,255,255,0.18)`
            : isWinning
            ? `0 0 0 2px ${style.accent}20, 0 4px 12px rgba(0,0,0,0.06)`
            : undefined,
        }}
      >
        {/* Completed shine overlay */}
        {completed && (
          <motion.span
            className="pointer-events-none absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.08) 100%)',
            }}
          />
        )}

        {/* Winning-line shimmer sweep — animates a diagonal band across cells in a completed line */}
        {completed && isWinning && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              background:
                'linear-gradient(110deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 70%)',
              backgroundSize: '300% 100%',
              animation: 'shimmer-sweep 2.2s ease-in-out infinite',
              mixBlendMode: 'screen',
            }}
          />
        )}

        {/* Category indicator dot */}
        {!completed && !isFree && (
          <span
            className="absolute left-1.5 top-1.5 z-[1] h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: style.accent, opacity: 0.7 }}
            aria-hidden="true"
          />
        )}

        {/* Winning indicator */}
        {isWinning && !completed && (
          <span
            className="absolute right-1 top-1 z-[1] rounded-md px-1 py-0.5 text-[6px] font-black uppercase tracking-widest"
            style={{ color: style.accent, backgroundColor: `${style.accent}15` }}
          >
            Row
          </span>
        )}

        <div className="relative z-[2] flex h-full flex-col items-center justify-center gap-0.5 px-0.5">
          {(completed || isFree) && (
            <motion.span
              initial={completed ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white/25 shrink-0"
            >
              <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" strokeWidth={3} />
            </motion.span>
          )}

          <span
            className={`block text-[10px] sm:text-[12px] font-black uppercase tracking-[0.01em] leading-[1.15] break-words hyphens-auto w-full text-center ${
              completed ? 'text-white' : 'text-foreground'
            }`}
          >
            {cell.label}
          </span>
        </div>
      </motion.button>

      {/* Micro-reflection overlay */}
      <AnimatePresence>
        {showReflection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            onClick={handleCancel}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative z-[1] w-full max-w-xs overflow-hidden rounded-2xl border border-white/15 bg-surface-elevated p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleCancel}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-t-muted hover:text-t-magenta"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: style.accent }}>
                    {cell.label}
                  </p>
                  <p className="mt-1 pr-10 text-sm font-semibold leading-relaxed text-foreground">
                    {cell.countsWhen}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {QUICK_REFLECTIONS[cell.category].map((option) => (
                    <button
                      key={option.text}
                      type="button"
                      onClick={() => handleQuickReflection(option)}
                      className="focus-ring min-h-[46px] rounded-xl border px-3 py-2.5 text-[12px] font-black transition-all"
                      style={{
                        borderColor: option.marks ? style.border : 'var(--border-surface)',
                        backgroundColor: option.marks ? style.bg : 'var(--bg-surface-primary)',
                        color: option.marks ? style.accent : 'var(--text-secondary)',
                      }}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
