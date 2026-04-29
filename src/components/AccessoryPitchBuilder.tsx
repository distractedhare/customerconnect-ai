import { useMemo, useState, type ReactNode } from 'react';
import { ShoppingBag, MessageSquare, DollarSign, Ear, Users, AlertTriangle, ChevronDown, ArrowRightLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Device } from '../data/devices';
import { getAccessoriesForDevice, sortByPitchPriority, AccessoryPitch } from '../data/accessoryPitches';
import { EcosystemMatrix } from '../types/ecosystem';
import AccessoryImageSlot from './AccessoryImageSlot';
import {
  getAccessoryOutcomeLabel,
  getAccessoryPitchPositioningSummary,
  getAppealTypeLabel,
  PositioningSummary,
} from '../services/positioningService';

interface AccessoryPitchBuilderProps {
  device: Device | null;
  ecosystemMatrix?: EcosystemMatrix | null;
}

const MARGIN_COLORS = {
  high: { bg: 'bg-success-surface', text: 'text-success-foreground', label: '$$$ Earner' },
  medium: { bg: 'bg-warning-surface', text: 'text-warning-foreground', label: '$$ Solid' },
  low: { bg: 'bg-t-light-gray/50', text: 'text-t-dark-gray', label: '$ Low' },
};

const CATEGORY_LABELS: Record<string, string> = {
  protection: 'Protection',
  audio: 'Audio',
  charging: 'Charging',
  case: 'Cases',
  tracker: 'Trackers',
  other: 'Accessories',
};

export default function AccessoryPitchBuilder({ device, ecosystemMatrix }: AccessoryPitchBuilderProps) {
  type GroupedAccessorySummaries = Record<string, Array<{ accessory: AccessoryPitch; summary: PositioningSummary; outcomeLabel: string }>>;

  const accessories = useMemo(
    () => (device ? sortByPitchPriority(getAccessoriesForDevice(device.name)) : []),
    [device]
  );

  const grouped = useMemo<GroupedAccessorySummaries>(() => {
    if (!device) return {};

    return accessories.reduce<GroupedAccessorySummaries>((acc, item) => {
      const category = item.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        accessory: item,
        summary: getAccessoryPitchPositioningSummary(item, device, ecosystemMatrix),
        outcomeLabel: getAccessoryOutcomeLabel(item.name, item.category),
      });
      return acc;
    }, {});
  }, [accessories, device, ecosystemMatrix]);

  if (!device) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-t-light-gray bg-t-light-gray/20 p-8 text-center">
        <ShoppingBag className="mb-3 h-8 w-8 text-t-dark-gray/30" />
        <p className="text-xs font-bold uppercase tracking-widest text-t-muted">
          Pick a device to unlock accessory plays
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-2xl bg-t-dark-gray p-4 text-white">
        <p className="mb-1 text-[9px] font-black uppercase tracking-widest text-t-magenta">Accessory Pitch Builder</p>
        <p className="text-sm font-black">{device.name}</p>
        <p className="mt-1 text-[10px] font-medium text-white/60">
          {accessories.length} add-ons • Top earners first • Start with the problem it solves, not the price.
        </p>
      </div>

      <div className="rounded-2xl border border-t-light-gray/60 bg-surface-elevated p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Pitch order</p>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <div className="rounded-2xl border border-t-light-gray bg-surface px-3 py-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-t-muted">Best For</p>
            <p className="mt-1 text-[10px] font-medium text-t-dark-gray">Match the accessory to the caller first so it never feels random.</p>
          </div>
          <div className="rounded-2xl border border-t-light-gray bg-surface px-3 py-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-t-muted">Use When</p>
            <p className="mt-1 text-[10px] font-medium text-t-dark-gray">Grab one or two cues from the call before you mention the item.</p>
          </div>
          <div className="rounded-2xl border border-t-light-gray bg-surface px-3 py-2">
            <p className="text-[8px] font-black uppercase tracking-widest text-t-muted">Proof</p>
            <p className="mt-1 text-[10px] font-medium text-t-dark-gray">Close with the proof line, then move into price only if they lean in.</p>
          </div>
        </div>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-2">
          <h4 className="px-1 text-[9px] font-black uppercase tracking-widest text-t-muted">
            {CATEGORY_LABELS[category] || category}
          </h4>
          {items.map(({ accessory, summary, outcomeLabel }) => (
            <AccessoryCard key={accessory.name} accessory={accessory} summary={summary} outcomeLabel={outcomeLabel} />
          ))}
        </div>
      ))}

      <div className="rounded-2xl border border-t-magenta/20 bg-t-magenta/5 p-4">
        <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-t-magenta">Phone Flow</p>
        <ol className="space-y-1.5">
          <li className="flex items-start gap-2 text-[11px] font-medium text-t-dark-gray">
            <span className="font-black text-t-magenta">1.</span> Protect the purchase first if they just bought a new device.
          </li>
          <li className="flex items-start gap-2 text-[11px] font-medium text-t-dark-gray">
            <span className="font-black text-t-magenta">2.</span> Add one convenience piece that removes friction every day.
          </li>
          <li className="flex items-start gap-2 text-[11px] font-medium text-t-dark-gray">
            <span className="font-black text-t-magenta">3.</span> Save the fun or premium add-on for callers who want the upgrade to feel exciting.
          </li>
        </ol>
      </div>
    </motion.div>
  );
}

function AccessoryCard({
  accessory,
  summary,
  outcomeLabel,
}: {
  accessory: AccessoryPitch;
  summary: PositioningSummary;
  outcomeLabel: string;
}) {
  const [showMore, setShowMore] = useState(false);
  const margin = MARGIN_COLORS[accessory.margin];
  const topDemo = summary.demoAngles[0];

  return (
    <div className="rounded-xl glass-card p-4 transition-all hover:border-t-magenta/30">
      <div className="mb-2 flex items-start gap-3">
        <AccessoryImageSlot
          name={accessory.name}
          imageUrl={accessory.imageUrl}
          className="h-14 w-14 shrink-0 rounded-xl border border-t-light-gray/50 bg-t-light-gray/20 p-2"
          imageClassName="h-full w-full object-contain"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-black text-t-dark-gray">{accessory.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black text-t-magenta">{accessory.price}</span>
            <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase ${margin.bg} ${margin.text}`}>
              {margin.label}
            </span>
            <span className="rounded-full bg-t-magenta/10 px-1.5 py-0.5 text-[8px] font-black uppercase text-t-magenta">
              {getAppealTypeLabel(summary.appealType)}
            </span>
            <span className="rounded-full bg-t-light-gray/30 px-1.5 py-0.5 text-[8px] font-black uppercase text-t-dark-gray">
              {outcomeLabel}
            </span>
          </div>
        </div>
        <DollarSign
          className={`mt-1 h-4 w-4 shrink-0 ${
            accessory.margin === 'high'
              ? 'text-success-accent'
              : accessory.margin === 'medium'
              ? 'text-warning-accent'
              : 'text-t-dark-gray/30'
          }`}
        />
      </div>

      <div className="mt-2 rounded-lg bg-t-light-gray/20 p-3">
        <div className="flex items-start gap-2">
          <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 text-t-magenta" />
          <p className="text-[11px] font-bold leading-relaxed text-t-dark-gray">
            {summary.sayThis}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <MiniPanel title="Why This Lands" icon={<MessageSquare className="h-3 w-3" />} tone="info">
          <p className="text-[10px] font-medium leading-snug text-info-foreground">{summary.whyItLands}</p>
          <p className="mt-2 text-[9px] font-bold text-info-foreground">
            Proof: <span className="font-medium">{summary.primaryAngle.proof}</span>
          </p>
        </MiniPanel>

        <MiniPanel title="Use It When" icon={<Ear className="h-3 w-3" />} tone="neutral">
          <div className="flex flex-wrap gap-1.5">
            {summary.listenFor.slice(0, 3).map(cue => (
              <span
                key={cue}
                className="rounded-lg border border-t-light-gray bg-surface-elevated px-2 py-1 text-[9px] font-bold text-t-dark-gray"
              >
                {cue}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {summary.bestFit.slice(0, 3).map(fit => (
              <span
                key={fit}
                className="rounded-full bg-t-magenta/8 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-magenta"
              >
                {fit}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[10px] font-medium leading-relaxed text-t-dark-gray">{summary.leadWith}</p>
        </MiniPanel>
      </div>

      <button
        type="button"
        onClick={() => setShowMore(prev => !prev)}
        aria-expanded={showMore}
        className="focus-ring mt-3 flex w-full items-center justify-between rounded-xl border border-t-light-gray bg-surface px-3 py-2 text-left transition-colors hover:border-t-magenta/40"
      >
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-t-magenta">
            {showMore ? 'Keep It Tight' : 'Need Another Angle?'}
          </p>
          <p className="mt-1 text-[10px] font-medium text-t-dark-gray">
            {showMore
              ? 'Hide the extra coaching and stay on the fast version.'
              : 'Open the backup angle, tone guidance, and call guardrail only if you need them.'}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 text-t-muted transition-transform ${showMore ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {showMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 pt-3 md:grid-cols-2">
              {summary.backupAngle && (
                <MiniPanel title="Backup Angle" icon={<ArrowRightLeft className="h-3 w-3" />} tone="warning">
                  <p className="text-[10px] font-black text-warning-foreground">{summary.backupAngle.title}</p>
                  <p className="mt-2 text-[10px] font-medium leading-relaxed text-warning-foreground">
                    {summary.backupAngle.script}
                  </p>
                </MiniPanel>
              )}

              <MiniPanel title="Guardrail" icon={<AlertTriangle className="h-3 w-3" />} tone="neutral">
                <p className="text-[10px] font-medium leading-relaxed text-t-dark-gray">{summary.avoidIf}</p>
              </MiniPanel>

              {(topDemo || summary.trustLanguage.length > 0 || summary.avoidLanguage.length > 0) && (
                <MiniPanel title="Tone Match" icon={<Users className="h-3 w-3" />} tone="success">
                  {topDemo && (
                    <p className="text-[10px] font-medium leading-snug text-success-foreground">
                      {topDemo.label} callers usually respond because {topDemo.whyThisDemoResponds}
                    </p>
                  )}
                  {summary.trustLanguage.length > 0 && (
                    <p className="mt-2 text-[9px] font-bold text-success-foreground">
                      Lead with: <span className="font-medium">{summary.trustLanguage.join(' • ')}</span>
                    </p>
                  )}
                  {summary.avoidLanguage.length > 0 && (
                    <p className="mt-1 text-[9px] font-bold text-success-foreground">
                      Avoid: <span className="font-medium">{summary.avoidLanguage.join(' • ')}</span>
                    </p>
                  )}
                </MiniPanel>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniPanel({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: ReactNode;
  tone: 'info' | 'warning' | 'success' | 'neutral';
  children: ReactNode;
}) {
  const styles = {
    info: 'border-t-light-gray bg-info-surface text-info-foreground',
    warning: 'border-warning-border bg-warning-surface text-warning-foreground',
    success: 'border-success-border bg-success-surface text-success-foreground',
    neutral: 'border-t-light-gray bg-surface text-t-dark-gray',
  }[tone];

  return (
    <div className={`rounded-xl border p-3 ${styles}`}>
      <p className="mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}
