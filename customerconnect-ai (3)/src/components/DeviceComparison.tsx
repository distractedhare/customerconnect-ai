import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Star, CheckCircle2, Lightbulb, MessageSquareQuote } from 'lucide-react';
import { motion } from 'motion/react';
import { Device } from '../data/devices';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { EcosystemMatrix } from '../types/ecosystem';
import { getDevicePositioningSummary } from '../services/positioningService';
import { ALL_DEVICES, DeviceDetail, DeviceImageSlot, findPromoForDevice } from './DeviceLookup';

function ScoutPanel({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'magenta' | 'neutral' | 'warning' | 'success';
}) {
  const toneClass = {
    magenta: 'border-t-magenta/20 bg-white/75 text-t-dark-gray',
    neutral: 'border-t-light-gray bg-white/70 text-t-dark-gray',
    warning: 'border-warning-border bg-warning-surface text-warning-foreground',
    success: 'border-success-border bg-success-surface text-success-foreground',
  }[tone];

  const icon = {
    magenta: <Star className="h-3 w-3" />,
    neutral: <CheckCircle2 className="h-3 w-3" />,
    warning: <Lightbulb className="h-3 w-3" />,
    success: <MessageSquareQuote className="h-3 w-3" />,
  }[tone];

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <p className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-[11px] font-medium leading-relaxed">{value}</p>
    </div>
  );
}

/** Comparison view for multiple selected devices */
export function DeviceComparison({
  devices,
  weeklyData,
  ecosystemMatrix,
  activeIndex,
  onActiveIndexChange,
}: {
  devices: Device[];
  weeklyData: WeeklyUpdate | null;
  ecosystemMatrix?: EcosystemMatrix | null;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}) {
  const [showDifferencesOnly, setShowDifferencesOnly] = useState(true);
  const [mobileChallengerIndex, setMobileChallengerIndex] = useState(1);
  const [compareView, setCompareView] = useState<'rep' | 'full'>('rep');
  const summaries = useMemo(
    () => devices.map(device => getDevicePositioningSummary(device, weeklyData, ecosystemMatrix)),
    [devices, weeklyData, ecosystemMatrix]
  );
  const clampedActiveIndex = Math.min(activeIndex, Math.max(devices.length - 1, 0));
  const activeDevice = devices[clampedActiveIndex];
  const activeSummary = summaries[Math.min(clampedActiveIndex, summaries.length - 1)];

  useEffect(() => {
    if (devices.length <= 1) {
      setMobileChallengerIndex(0);
      return;
    }

    if (mobileChallengerIndex === clampedActiveIndex || mobileChallengerIndex >= devices.length) {
      setMobileChallengerIndex(clampedActiveIndex === 0 ? 1 : 0);
    }
  }, [clampedActiveIndex, devices.length, mobileChallengerIndex]);

  if (devices.length === 0) return null;

  if (devices.length === 1) {
    return <DeviceDetail device={devices[0]} weeklyData={weeklyData} ecosystemMatrix={ecosystemMatrix} />;
  }

  const challengerIndex = mobileChallengerIndex === clampedActiveIndex || mobileChallengerIndex >= devices.length
    ? (clampedActiveIndex === 0 ? 1 : 0)
    : mobileChallengerIndex;
  const challengerDevice = devices[challengerIndex];
  const challengerSummary = summaries[challengerIndex];

  const compareRows = [
    {
      label: 'Price',
      values: devices.map(d => typeof d.startingPrice === 'number' ? `$${d.startingPrice}` : String(d.startingPrice)),
    },
    {
      label: 'Best For',
      values: summaries.map(summary => summary.bestFit.slice(0, 2).join(', ')),
    },
    {
      label: 'Lead With',
      values: summaries.map(summary => summary.primaryAngle.title),
    },
    {
      label: 'Proof Point',
      values: summaries.map(summary => summary.primaryAngle.proof),
    },
    {
      label: 'Released',
      values: devices.map(d => d.released),
    },
    {
      label: 'Core Specs',
      values: devices.map(d => d.keySpecs),
    },
  ];

  const repQuickRows = new Set(['Price', 'Best For', 'Lead With', 'Proof Point']);
  const filteredRows = compareRows.filter((row) => {
    if (compareView === 'rep' && !repQuickRows.has(row.label)) return false;
    if (!showDifferencesOnly) return true;
    return new Set(row.values).size > 1;
  });

  const mobileCompareRows = [
    {
      label: 'Price',
      activeValue: typeof activeDevice.startingPrice === 'number' ? `$${activeDevice.startingPrice}` : String(activeDevice.startingPrice),
      challengerValue: typeof challengerDevice.startingPrice === 'number' ? `$${challengerDevice.startingPrice}` : String(challengerDevice.startingPrice),
    },
    {
      label: 'Best For',
      activeValue: activeSummary.bestFit.slice(0, 2).join(', '),
      challengerValue: challengerSummary.bestFit.slice(0, 2).join(', '),
    },
    {
      label: 'Lead With',
      activeValue: activeSummary.primaryAngle.title,
      challengerValue: challengerSummary.primaryAngle.title,
    },
    {
      label: 'Proof Point',
      activeValue: activeSummary.primaryAngle.proof,
      challengerValue: challengerSummary.primaryAngle.proof,
    },
  ];
  const activePromo = weeklyData
    ? findPromoForDevice(weeklyData.currentPromos, activeDevice, ALL_DEVICES)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-[1.75rem] glass-stage-quiet p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">Compare mode</p>
            <p className="text-sm font-black text-foreground">Keep the shortlist tight, then pitch from the current best fit.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDifferencesOnly((current) => !current)}
            className={`focus-ring hidden rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors md:inline-flex ${
              showDifferencesOnly ? 'glass-control-active text-white' : 'glass-control text-t-dark-gray'
            }`}
          >
            {showDifferencesOnly ? 'Differences only' : 'Show all'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCompareView('rep')}
            className={`focus-ring rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors ${
              compareView === 'rep' ? 'glass-control-active text-white' : 'glass-control text-t-dark-gray'
            }`}
          >
            Rep quick compare
          </button>
          <button
            type="button"
            onClick={() => setCompareView('full')}
            className={`focus-ring rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors ${
              compareView === 'full' ? 'glass-control-active text-white' : 'glass-control text-t-dark-gray'
            }`}
          >
            Full detail
          </button>
          {devices.map((device, index) => (
            <button
              type="button"
              key={device.name}
              onClick={() => onActiveIndexChange(index)}
              className={`focus-ring rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors ${
                clampedActiveIndex === index ? 'glass-control-active text-white' : 'glass-control text-t-dark-gray'
              }`}
            >
              {device.name}
            </button>
          ))}
        </div>
      </div>

      <div className="sticky sticky-under-compare-tabs z-30 -mt-1 rounded-3xl border border-t-light-gray/60 bg-white/85 p-2 backdrop-blur-xl dark:bg-[#0f0f10]/90">
        <p className="hidden px-2 pb-2 text-[8px] font-black uppercase tracking-[0.16em] text-t-muted sm:block">
          Tap any chip to refresh the hero brief and keep the winner in focus.
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {devices.map((device, index) => {
            const isActive = index === clampedActiveIndex;
            return (
              <button
                key={`${device.name}-sticky-identity`}
                type="button"
                onClick={() => onActiveIndexChange(index)}
                className={`focus-ring min-w-[164px] rounded-2xl border p-2 text-left transition-colors ${
                  isActive
                    ? 'border-t-magenta/30 bg-t-magenta/10'
                    : 'border-t-light-gray/70 bg-surface-elevated/85 hover:border-t-magenta/20'
                }`}
              >
                <p className="truncate text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">{device.name}</p>
                <p className="mt-1 text-[11px] font-bold text-t-dark-gray">
                  {typeof device.startingPrice === 'number' ? `$${device.startingPrice}` : String(device.startingPrice)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={`${activeDevice.name}-hero-focus`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="rounded-3xl glass-stage-quiet p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Hero focus card</p>
            <h3 className="mt-1 text-lg font-black tracking-tight text-t-dark-gray">{activeDevice.name}</h3>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{activeSummary.sayThis}</p>
          </div>
          <DeviceImageSlot
            device={activeDevice}
            className="h-16 w-16 shrink-0 rounded-[1.15rem] border border-t-light-gray/60 bg-white/85 p-2.5"
            imageClassName="h-full w-full object-contain"
            badgeSize="sm"
          />
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="rounded-2xl glass-reading p-3">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Core specs</p>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{activeDevice.keySpecs}</p>
          </div>
          <div className="rounded-2xl glass-reading p-3">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Primary angle</p>
            <p className="mt-1 text-[11px] font-black text-t-dark-gray">{activeSummary.primaryAngle.title}</p>
            <p className="mt-1 text-[10px] font-medium leading-relaxed text-t-dark-gray">{activeSummary.primaryAngle.proof}</p>
          </div>
        </div>
        {activePromo ? (
          <div className="mt-3 rounded-2xl border border-success-border bg-success-surface p-3">
            <p className="text-[8px] font-black uppercase tracking-[0.18em] text-success-foreground">This week on this model</p>
            <p className="mt-1 text-[11px] font-black text-success-foreground">{activePromo.name}</p>
            <p className="mt-1 text-[10px] font-medium leading-relaxed text-success-foreground/80">{activePromo.details}</p>
          </div>
        ) : null}
      </motion.div>

      <div className="space-y-4 md:hidden">
        <motion.div
          key={`${activeDevice.name}-${challengerDevice.name}`}
          initial={{ opacity: 0, y: 10, scale: 0.992 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="rounded-3xl p-4 glass-stage-quiet"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Current best fit</p>
              <h3 className="mt-1 text-lg font-black tracking-tight text-t-dark-gray">{activeDevice.name}</h3>
              <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{activeSummary.shortHook}</p>
            </div>
            <DeviceImageSlot
              device={activeDevice}
              className="h-20 w-20 shrink-0 rounded-[1.25rem] border border-t-light-gray/60 bg-white/85 p-2.5"
              imageClassName="h-full w-full object-contain"
              badgeSize="sm"
            />
          </div>

          <div className="mt-4 grid gap-3">
            <ScoutPanel label="Best Customer" value={activeSummary.bestFit[0] || 'General fit'} tone="magenta" />
            <ScoutPanel label="Why It Wins" value={activeSummary.primaryAngle.proof} tone="neutral" />
            <ScoutPanel label="Quick Pitch" value={activeSummary.sayThis} tone="success" />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl glass-reading px-3 py-2">
            <button
              type="button"
              onClick={() => onActiveIndexChange(clampedActiveIndex === 0 ? devices.length - 1 : clampedActiveIndex - 1)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full glass-control px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
            >
              <ArrowLeft className="h-3 w-3" />
              Prev
            </button>
            <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">
              {clampedActiveIndex + 1} of {devices.length}
            </p>
            <button
              type="button"
              onClick={() => onActiveIndexChange((clampedActiveIndex + 1) % devices.length)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full glass-control px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
            >
              Next
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </motion.div>

        <div className="rounded-2xl glass-stage-quiet p-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Compare against</p>
          <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
            Pick the challenger you want the winner to beat, then scan the four rows below.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {devices.filter((_, index) => index !== clampedActiveIndex).map((device, index) => {
              const trueIndex = devices.findIndex((item) => item.name === device.name);
              const isSelected = trueIndex === challengerIndex;

              return (
                <button
                  key={`${device.name}-${index}`}
                  type="button"
                  onClick={() => setMobileChallengerIndex(trueIndex)}
                  className={`focus-ring rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${
                    isSelected
                      ? 'glass-control-active text-white'
                      : 'glass-control text-t-dark-gray'
                  }`}
                >
                  {device.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {mobileCompareRows.map((row) => (
            <div key={`${activeDevice.name}-${challengerDevice.name}-${row.label}`} className="rounded-2xl glass-reading-strong p-4">
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">{row.label}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-t-magenta/20 bg-t-magenta/8 p-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">{activeDevice.name}</p>
                  <p className="mt-2 text-[11px] font-bold leading-relaxed text-t-dark-gray">{row.activeValue}</p>
                </div>
                <div className="rounded-2xl border border-t-light-gray bg-surface-elevated p-3">
                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-muted">{challengerDevice.name}</p>
                  <p className="mt-2 text-[11px] font-bold leading-relaxed text-t-dark-gray">{row.challengerValue}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden gap-4 md:grid xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <motion.div
            key={activeDevice.name}
            initial={{ opacity: 0, y: 10, scale: 0.992 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="rounded-3xl p-4 glass-stage-quiet"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Current best fit</p>
                <h3 className="mt-1 text-lg font-black tracking-tight text-t-dark-gray">{activeDevice.name}</h3>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{activeSummary.shortHook}</p>
              </div>
              <DeviceImageSlot
                device={activeDevice}
                className="h-24 w-24 shrink-0 rounded-[1.25rem] border border-t-light-gray/60 bg-white/85 p-3"
                imageClassName="h-full w-full object-contain"
                badgeSize="sm"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {activeSummary.bestFit.slice(0, 3).map((fit) => (
                <span
                  key={fit}
                  className="rounded-full border border-t-magenta/20 bg-t-magenta/8 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-t-magenta"
                >
                  {fit}
                </span>
              ))}
              <span className="rounded-full border border-t-light-gray bg-white/70 px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-t-dark-gray">
                {typeof activeDevice.startingPrice === 'number' ? `$${activeDevice.startingPrice}` : activeDevice.startingPrice}
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <ScoutPanel label="Best Customer" value={activeSummary.bestFit[0] || 'General fit'} tone="magenta" />
              <ScoutPanel label="Why It Wins" value={activeSummary.primaryAngle.proof} tone="neutral" />
              <ScoutPanel label="Watch-Out" value={activeSummary.avoidIf} tone="warning" />
              <ScoutPanel label="Quick Pitch" value={activeSummary.sayThis} tone="success" />
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 rounded-2xl glass-reading px-3 py-2">
              <button
                type="button"
                onClick={() => onActiveIndexChange(clampedActiveIndex === 0 ? devices.length - 1 : clampedActiveIndex - 1)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full glass-control px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
              >
                <ArrowLeft className="h-3 w-3" />
                Prev
              </button>
              <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">
                {clampedActiveIndex + 1} of {devices.length}
              </p>
              <button
                type="button"
                onClick={() => onActiveIndexChange((clampedActiveIndex + 1) % devices.length)}
                className="focus-ring inline-flex items-center gap-1.5 rounded-full glass-control px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
              >
                Next
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </motion.div>

          <div className="rounded-2xl glass-stage-quiet overflow-hidden">
            <div className="border-b border-t-light-gray/50 px-4 py-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">Fast differences</p>
              <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
                Use this when the caller asks what actually changes between the finalists.
              </p>
            </div>
            <div className="divide-y divide-t-light-gray/50">
              {filteredRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[88px_repeat(auto-fit,minmax(0,1fr))] gap-3 px-4 py-3">
                  <p className="text-[9px] font-black uppercase tracking-widest text-t-muted">{row.label}</p>
                  {row.values.map((value, index) => (
                    <div key={`${row.label}-${devices[index].name}`} className={`rounded-xl px-3 py-2 text-[11px] font-medium leading-relaxed ${
                      index === clampedActiveIndex ? 'bg-t-magenta/8 text-t-dark-gray ring-1 ring-t-magenta/20' : 'bg-surface-elevated text-t-dark-gray'
                    }`}>
                      <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-t-magenta">{devices[index].name}</p>
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DeviceDetail device={activeDevice} weeklyData={weeklyData} ecosystemMatrix={ecosystemMatrix} />
      </div>
    </motion.div>
  );
}
