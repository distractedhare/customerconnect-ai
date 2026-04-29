import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, MessageSquare, ShieldAlert, Sparkles } from 'lucide-react';
import type { KipRecommendation } from '../../types/kip';
import KipBadge from './KipBadge';

interface KipPanelProps {
  recommendation: KipRecommendation;
}

export default function KipPanel({ recommendation }: KipPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const detailRows = [
    { label: 'Action', value: recommendation.action, icon: Lightbulb },
    { label: 'Ask', value: recommendation.askThis, icon: MessageSquare },
    { label: 'Watch out', value: recommendation.watchOut, icon: ShieldAlert },
    { label: 'Attach only if it fits', value: recommendation.optionalAttach, icon: Sparkles },
  ].filter((row) => row.value);

  return (
    <section className="glass-feature overflow-hidden rounded-[1.65rem] p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <KipBadge tone={recommendation.tone} size={64} />
          <div>
            <h3 className="text-lg font-black leading-tight tracking-tight text-foreground sm:text-xl">
              {recommendation.headline}
            </h3>
            {recommendation.sayThis ? (
              <div className="mt-3 rounded-2xl bg-white/74 px-4 py-3 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">Say this</p>
                <p className="mt-1 text-sm font-bold leading-relaxed text-foreground">"{recommendation.sayThis}"</p>
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="focus-ring inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-t-magenta shadow-sm transition-transform hover:scale-[1.01] active:scale-95"
          aria-expanded={expanded}
        >
          {expanded ? 'Hide Details' : 'Refine'}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {detailRows.map((row) => (
            <div key={row.label} className="glass-reading rounded-2xl px-4 py-3">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-t-magenta/10 text-t-magenta">
                  <row.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">{row.label}</p>
                  <p className="mt-1 text-[11px] font-semibold leading-relaxed text-t-dark-gray">{row.value}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl bg-t-magenta/8 px-4 py-3 md:col-span-2">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Source</p>
            <p className="mt-1 text-[10px] font-medium leading-relaxed text-t-dark-gray">{recommendation.sourceReason}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
