import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Info, Shield, Sparkles, Swords, Zap, type LucideIcon } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus } from '../../types';

export interface TutorialTip {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  trigger: (state: any) => boolean;
}

export const TUTORIAL_DATA: TutorialTip[] = [
  {
    id: 'movement',
    title: 'Lane Control',
    description: 'Use arrows, WASD, swipe, or the mobile buttons to cut left and right. Up jumps. Down smashes.',
    icon: Info,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 2,
  },
  {
    id: 'signature',
    title: 'Signature Ability',
    description: 'Every character has a unique ability. Fill the skill meter, then press the Skill button or hit E/F.',
    icon: Swords,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 30,
  },
  {
    id: 'sidekick_core',
    title: 'Sidekick Meter',
    description: 'Gems, letters, smashes, and correct trivia answers fill Sidekick Core. Spend it at 100 for a full support burst.',
    icon: Sparkles,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 80,
  },
  {
    id: 'trivia',
    title: 'Harder Trivia',
    description: 'Trivia now scales by difficulty and level. Correct answers can restore battery, add score, and even grant safeguards.',
    icon: Brain,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 130,
  },
  {
    id: 'powerups',
    title: 'Power-Up Stack',
    description: 'Scanner, Overclock, Multiplier, Shield, Magnet, and Battery can stack into monstrous runs. Watch the status chips.',
    icon: Zap,
    trigger: (state) => state.status === GameStatus.PLAYING && state.distance > 170,
  },
  {
    id: 'battery',
    title: 'Safeguards',
    description: 'Some answers, characters, and pickups give safeguard charges. They can save a run even when the hit would have ended it.',
    icon: Shield,
    trigger: (state) => state.status === GameStatus.PLAYING && state.battery < state.maxBattery,
  },
];

export const TutorialOverlay: React.FC = () => {
  const status = useStore((state) => state.status);
  const distance = useStore((state) => state.distance);
  const battery = useStore((state) => state.battery);
  const maxBattery = useStore((state) => state.maxBattery);
  const isTutorialEnabled = useStore((state) => state.isTutorialEnabled);
  const seenTutorials = useStore((state) => state.seenTutorials);
  const markTutorialSeen = useStore((state) => state.markTutorialSeen);

  const [activeTip, setActiveTip] = useState<TutorialTip | null>(null);

  useEffect(() => {
    if (!isTutorialEnabled || status !== GameStatus.PLAYING) {
      setActiveTip(null);
      return;
    }

    const currentState = { status, distance, battery, maxBattery };
    const nextTip = TUTORIAL_DATA.find((tip) => !seenTutorials.includes(tip.id) && tip.trigger(currentState));

    if (!nextTip) return;

    setActiveTip(nextTip);
    const timer = window.setTimeout(() => {
      markTutorialSeen(nextTip.id);
      setActiveTip(null);
    }, 5600);

    return () => window.clearTimeout(timer);
  }, [status, distance, battery, maxBattery, isTutorialEnabled, seenTutorials, markTutorialSeen]);

  return (
    <AnimatePresence>
      {activeTip && (
        <motion.div
          initial={{ x: 280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 280, opacity: 0 }}
          className="absolute bottom-[7.25rem] left-3 right-3 z-[70] pointer-events-none md:bottom-24 md:left-auto md:right-6 md:w-[min(20rem,30vw)]"
        >
          <div className="rounded-[1.35rem] border border-white/10 bg-black/72 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:rounded-[1.7rem] md:p-4">
            <div className="mb-2.5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#E20074]/40 bg-[#E20074]/20 text-[#ff8cc6] md:h-11 md:w-11">
                <activeTip.icon size={20} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074]">Training tip</div>
                <div className="text-white font-black uppercase tracking-[0.1em]">{activeTip.title}</div>
              </div>
            </div>
            <p className="text-[12px] leading-relaxed text-white/78 md:text-[13px]">{activeTip.description}</p>
            <div className="mt-3.5 h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: 5.6, ease: 'linear' }} className="h-full bg-[#E20074]" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
