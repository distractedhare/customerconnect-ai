import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Wifi, Satellite, ShieldCheck, Globe, Tv, Plane, Gift } from 'lucide-react';
import { DIFFERENTIATORS } from '../../data/differentiators';
import LearnSectionHeader from './LearnSectionHeader';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Network: <Wifi className="w-4 h-4" />,
  'T-Satellite': <Satellite className="w-4 h-4" />,
  'Price Guarantee': <ShieldCheck className="w-4 h-4" />,
  International: <Globe className="w-4 h-4" />,
  Streaming: <Tv className="w-4 h-4" />,
  'In-Flight Wi-Fi': <Plane className="w-4 h-4" />,
  Perks: <Gift className="w-4 h-4" />,
};

export default function EdgeSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <LearnSectionHeader
        eyebrow="Your Edge"
        title="The T-Mobile Edge"
        description="Lead with one clean T-Mobile advantage, use one proof line if they ask why it matters, and only open competitor comparison when the customer wants the side-by-side."
        icon={<ShieldCheck className="h-4 w-4" />}
        chips={['Story first', 'Proof second', 'Compare last']}
        variant="compact"
      />

      <div className="grid gap-3 md:grid-cols-3">
        {DIFFERENTIATORS.slice(0, 3).map((diff) => (
          <div key={diff.category} className="rounded-[1.45rem] glass-reading-strong p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl glass-control text-t-magenta">
                {CATEGORY_ICONS[diff.category] || <ShieldCheck className="w-4 h-4" />}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{diff.category}</p>
            </div>
            <p className="mt-3 text-[12px] font-semibold leading-relaxed text-foreground">{diff.headline}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {DIFFERENTIATORS.map((diff) => (
          <div key={diff.category} className="rounded-2xl overflow-hidden glass-stage-quiet">
            <button
              type="button"
              onClick={() => setExpanded((prev) => prev === diff.category ? null : diff.category)}
              aria-expanded={expanded === diff.category}
              className="focus-ring w-full flex items-center gap-3 p-4 text-left group"
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                expanded === diff.category ? 'bg-t-magenta text-white' : 'bg-t-magenta/10 text-t-magenta group-hover:bg-t-magenta/20'
              }`}>
                {CATEGORY_ICONS[diff.category] || <ShieldCheck className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black uppercase tracking-tight">{diff.category}</p>
                <p className="line-clamp-2 text-[11px] font-medium text-t-dark-gray">{diff.headline}</p>
              </div>
              {expanded === diff.category ? (
                <ChevronUp className="w-4 h-4 text-t-muted shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-t-muted shrink-0" />
              )}
            </button>

            <AnimatePresence>
              {expanded === diff.category && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    <ul className="space-y-1.5">
                      {diff.details.map((detail, i) => (
                        <li key={i} className="text-xs text-t-dark-gray font-medium flex gap-2">
                          <span className="text-t-magenta/50 shrink-0">&bull;</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {diff.competitorComparison && (
                      <div className="p-3 rounded-xl bg-t-berry/10 border border-t-berry/20">
                        <p className="mb-1 text-[10px] font-black uppercase tracking-wider text-t-berry">vs. The competition</p>
                        <p className="text-[11px] text-t-dark-gray font-medium">{diff.competitorComparison}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
