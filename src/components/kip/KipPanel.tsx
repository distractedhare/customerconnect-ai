import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Lightbulb, MessageSquare, ThumbsDown, X } from 'lucide-react';
import type { KipRecommendation } from '../../types/kip';
import { trackLiveEvent } from '../../services/sessionTracker';
import KipAvatar from './KipAvatar';
import type { KipAvatarState } from './kip-types';

interface KipPanelProps {
  recommendation: KipRecommendation;
}

function getKipState(recommendation: KipRecommendation): KipAvatarState {
  if (recommendation.tone === 'pivot' || recommendation.watchOut) return 'alert';
  if (recommendation.optionalAttach) return 'tip';
  return 'listening';
}

export default function KipPanel({ recommendation }: KipPanelProps) {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const state = getKipState(recommendation);
  const showBadge = !dismissed && !used;

  const markUsed = () => {
    setUsed(true);
    setDismissed(false);
    try {
      trackLiveEvent('kip-suggestion-used');
    } catch {
      // Local-only tracking should never interrupt the call.
    }
  };

  const markNotHelpful = () => {
    setDismissed(true);
    setOpen(false);
    try {
      trackLiveEvent('kip-not-helpful');
    } catch {
      // Local-only tracking should never interrupt the call.
    }
  };

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+5rem)] right-4 z-40 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open ? (
          <motion.section
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mb-3 w-[min(22rem,calc(100vw-2rem))] rounded-[1.5rem] border border-violet-300/20 bg-[#17131f]/95 p-4 text-white shadow-[0_22px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <KipAvatar size="small" state={used ? 'success' : state} showGlow />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-200">Kip's Tip</p>
                  <h3 className="mt-1 text-sm font-black leading-tight">{recommendation.headline}</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close KIP tip"
                className="focus-ring rounded-full p-2 text-white/70 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-violet-200">
                  <Lightbulb className="h-3 w-3" />
                  One insight
                </p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-white/88">{recommendation.action}</p>
              </div>

              {recommendation.sayThis ? (
                <div className="rounded-2xl bg-t-magenta/18 p-3">
                  <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-pink-100">
                    <MessageSquare className="h-3 w-3" />
                    Try this next
                  </p>
                  <p className="mt-1 text-sm font-black leading-relaxed text-white">"{recommendation.sayThis}"</p>
                </div>
              ) : null}

              <p className="text-[11px] font-medium leading-relaxed text-white/72">
                {recommendation.watchOut || recommendation.askThis || 'Why it works: it keeps the rep on one clean move before adding complexity.'}
              </p>

              {recommendation.optionalAttach && !used ? (
                <p className="rounded-xl border border-t-magenta/20 bg-t-magenta/10 p-2 text-[11px] font-semibold leading-relaxed text-white/80">
                  Attach only if earned: {recommendation.optionalAttach}
                </p>
              ) : null}

              {used ? (
                <div className="rounded-2xl bg-emerald-400/15 p-3 text-xs font-black text-emerald-100">
                  +25 KIP Points. Nice, clean move.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={markUsed}
                    className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-white text-[#17131f] text-xs font-black"
                  >
                    <CheckCircle2 className="h-4 w-4 text-t-magenta" />
                    Used it
                  </button>
                  <button
                    type="button"
                    onClick={markNotHelpful}
                    className="focus-ring inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-white/10 text-xs font-black text-white"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Not helpful
                  </button>
                </div>
              )}
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Close KIP tip' : 'Open KIP tip'}
        className={`focus-ring relative flex h-16 w-16 items-center justify-center rounded-full border border-t-magenta/25 bg-[#0F0F14]/95 shadow-[0_18px_44px_rgba(226,0,116,0.34)] backdrop-blur-xl transition-transform hover:scale-[1.03] active:scale-95 ${showBadge ? 'motion-safe:animate-pulse' : ''}`}
      >
        <KipAvatar size="medium" state={used ? 'success' : state} showGlow />
        {showBadge ? (
          <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-[#0F0F14] bg-t-magenta px-1 text-[10px] font-black text-white">
            1
          </span>
        ) : null}
      </button>
    </div>
  );
}
