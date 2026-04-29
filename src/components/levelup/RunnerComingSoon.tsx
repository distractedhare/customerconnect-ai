import { motion } from 'motion/react';
import { HardHat, Construction, Gamepad2, Sparkles, Rocket } from 'lucide-react';

/**
 * RunnerComingSoon — construction-site placeholder for the T-LIFE Runner game.
 *
 * Lives in the Level Up tab until the 3D runner game is ready to drop in.
 * Vibe: caution stripes + hard hat + "under construction" teaser.
 */
export function RunnerComingSoon() {
  return (
    <div className="relative w-full min-h-[60vh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden">
      {/* Caution-stripe top border */}
      <div
        className="absolute top-0 left-0 right-0 h-3"
        style={{
          background:
            'repeating-linear-gradient(45deg, #111 0 14px, #FFD400 14px 28px)',
        }}
      />
      {/* Caution-stripe bottom border */}
      <div
        className="absolute bottom-0 left-0 right-0 h-3"
        style={{
          background:
            'repeating-linear-gradient(45deg, #111 0 14px, #FFD400 14px 28px)',
        }}
      />

      {/* Spinning hard hat */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 12 }}
        className="mb-6"
      >
        <motion.div
          animate={{ rotate: [-6, 6, -6] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-24 h-24 rounded-full bg-[#FFD400] border-4 border-black flex items-center justify-center shadow-[0_10px_30px_rgba(226,0,116,0.35)]"
        >
          <HardHat className="w-12 h-12 text-black" strokeWidth={2.5} />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
        className="text-center mb-3"
      >
        <div className="flex items-center gap-2 justify-center mb-2">
          <Construction className="w-5 h-5 text-[#FFD400]" />
          <span className="uppercase tracking-[0.25em] text-xs font-bold text-[#FFD400] bg-black/80 px-3 py-1 rounded-full">
            Under Construction
          </span>
          <Construction className="w-5 h-5 text-[#FFD400]" />
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#E20074] drop-shadow-sm">
          T-LIFE RUNNER
        </h2>
        <p className="mt-2 text-sm md:text-base text-neutral-600 dark:text-neutral-300 max-w-md mx-auto">
          A quirky endless runner to learn quick pivots, one-liners, and sales
          trivia — on the way.
        </p>
      </motion.div>

      {/* What's coming list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl"
      >
        <FeatureChip
          icon={<Gamepad2 className="w-5 h-5" />}
          label="3-lane runner"
          sub="Dodge, jump, dash"
        />
        <FeatureChip
          icon={<Sparkles className="w-5 h-5" />}
          label="Trivia power-ups"
          sub="Plans, perks, pivots"
        />
        <FeatureChip
          icon={<Rocket className="w-5 h-5" />}
          label="Character picker"
          sub="Apple • Samsung • Google"
        />
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 w-full max-w-md"
      >
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 mb-2">
          <span>Build progress</span>
          <span>In the workshop</span>
        </div>
        <div className="h-3 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: ['10%', '55%', '40%', '70%', '55%'] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full"
            style={{
              background:
                'linear-gradient(90deg, #E20074 0%, #FF5CAD 100%)',
            }}
          />
        </div>
        <p className="mt-3 text-center text-xs text-neutral-500 italic">
          Come back soon — game drops in once it's ready.
        </p>
      </motion.div>
    </div>
  );
}

function FeatureChip({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-sm">
      <div className="w-9 h-9 rounded-lg bg-[#E20074]/10 text-[#E20074] flex items-center justify-center">
        {icon}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-50">
          {label}
        </span>
        <span className="text-[11px] text-neutral-500">{sub}</span>
      </div>
    </div>
  );
}

export default RunnerComingSoon;
