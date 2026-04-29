import { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Sparkles, Trophy, X } from 'lucide-react';
import { pickKipLine } from '../../services/kip/kipVoice';

interface BingoCelebrationProps {
  visible: boolean;
  boardName: string;
  durationLabel: string;
  rowCount: number;
  streakCount: number;
  onClose: () => void;
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotate: number;
}

const PARTICLE_COLORS = ['#E20074', '#861B54', '#FFFFFF'];

function makeParticles(): Particle[] {
  return Array.from({ length: 28 }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.8 + Math.random() * 1.6,
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
    rotate: Math.random() * 180,
  }));
}

export default function BingoCelebration({
  visible,
  boardName,
  durationLabel,
  rowCount,
  streakCount,
  onClose,
}: BingoCelebrationProps) {
  const particles = useMemo(() => makeParticles(), [visible]);
  const kipLine = useMemo(() => pickKipLine('celebrateBingoBoard', boardName), [boardName]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <motion.span
                key={particle.id}
                className="absolute top-0 h-3 w-2 rounded-sm"
                initial={{ opacity: 0, y: -24, x: `${particle.left}vw`, rotate: particle.rotate }}
                animate={{ opacity: [0, 1, 1, 0], y: '110vh', rotate: particle.rotate + 180 }}
                transition={{ duration: particle.duration, delay: particle.delay, ease: 'easeOut' }}
                style={{ backgroundColor: particle.color }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="relative z-[1] w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[1.75rem] glass-modal p-6"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close bingo celebration"
              className="focus-ring absolute right-4 top-4 rounded-full p-1 text-t-muted transition-colors hover:text-t-magenta"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-t-magenta text-white shadow-[0_18px_36px_rgba(226,0,116,0.24)]">
                <Trophy className="h-10 w-10" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-t-magenta">Kip · Full board</p>
                <h3 className="mt-2 text-4xl font-black uppercase tracking-tight text-t-magenta">
                  BINGO!
                </h3>
                <p className="mt-3 text-base font-bold leading-snug text-foreground">{kipLine}</p>
                <p className="mt-1 text-xs font-medium text-t-dark-gray">{boardName} closed out.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-left">
                <div className="glass-stat rounded-xl p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Time</p>
                  <p className="mt-1 text-sm font-black text-foreground">{durationLabel}</p>
                </div>
                <div className="glass-stat rounded-xl p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Rows</p>
                  <p className="mt-1 text-sm font-black text-foreground">{rowCount}</p>
                </div>
                <div className="glass-stat rounded-xl p-3">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Streak</p>
                  <p className="mt-1 text-sm font-black text-foreground">{streakCount} day{streakCount === 1 ? '' : 's'}</p>
                </div>
              </div>

              <div className="rounded-xl border border-t-magenta/15 bg-t-magenta/5 p-4">
                <p className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">
                  <Sparkles className="h-3.5 w-3.5" />
                  Level Up win locked in
                </p>
                <p className="mt-2 text-sm font-medium text-t-dark-gray">
                  Screenshot the board to track your wins and keep the streak alive.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-t-magenta px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-md transition-transform hover:scale-[1.01] active:scale-95"
              >
                <Check className="h-4 w-4" />
                Back to board
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
