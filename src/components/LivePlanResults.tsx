import { useState, type ReactNode } from 'react';
import {
  Headphones,
  Lightbulb,
  Loader2,
  MessageSquare,
  Search,
  ShoppingBag,
  Sparkles,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { AccessoryRecommendation, SalesContext, SalesScript } from '../types';
import { getSupportFocusLabel } from '../constants/supportFocus';
import { KipPanel } from './kip';
import { buildLiveKipRecommendation } from '../services/kip/kipRules';
import { gemmaFreshTake } from '../services/gemmaService';
import { buildLiveRecommendationGate, getPrimaryLiveAttach } from '../services/liveRecommendationGate';
import { trackLiveEvent } from '../services/sessionTracker';

interface LivePlanResultsProps {
  script: SalesScript;
  context: SalesContext;
}

const INTENT_LABELS: Record<SalesContext['purchaseIntent'], string> = {
  exploring: 'Exploring',
  'ready to buy': 'Ready to Buy',
  'upgrade / add a line': 'Upgrade / Add a Line',
  'order support': 'Order Support',
  'tech support': 'Tech Support',
  'account support': 'Account Support',
};

const HINT_LIVE_IMAGE = '/images/home-internet/hint-rep-recommendation.png';

function getHintStatus(context: SalesContext): { label: string; tone: string; icon: typeof Wifi } {
  if (!context.product.includes('Home Internet')) {
    return { label: 'HINT not in play', tone: 'glass-utility text-white/80', icon: Wifi };
  }

  if (context.hintAvailable === true) {
    return { label: 'HINT available', tone: 'bg-t-magenta text-white shadow-[0_18px_36px_-24px_rgba(226,0,116,0.75)]', icon: Wifi };
  }

  if (context.hintAvailable === false) {
    return { label: 'HINT unavailable', tone: 'bg-white/12 text-white/90', icon: WifiOff };
  }

  return { label: 'HINT not checked', tone: 'bg-white text-t-magenta shadow-[0_18px_36px_-24px_rgba(255,255,255,0.55)]', icon: Wifi };
}

export default function LivePlanResults({ script, context }: LivePlanResultsProps) {
  const hintStatus = getHintStatus(context);
  const HintIcon = hintStatus.icon;
  const supportFocusLabel = getSupportFocusLabel(context.supportFocus);
  const kipRecommendation = buildLiveKipRecommendation({ context, script });
  const liveGate = buildLiveRecommendationGate(context);
  const primaryAttach = getPrimaryLiveAttach(script.accessoryRecommendations, context);
  const [freshTakeCount, setFreshTakeCount] = useState(0);
  const [freshTakeCache, setFreshTakeCache] = useState<Record<string, string>>({});
  const homeInternetInPlay = context.product.includes('Home Internet');
  const locationLabel = context.region !== 'Not Specified'
    ? `${context.region}${context.state ? ` - ${context.state}` : ''}${context.zipCode ? ` - ${context.zipCode}` : ''}`
      : context.zipCode
      ? `ZIP ${context.zipCode}`
      : 'Location not set';

  const handleFreshTake = async (text: string): Promise<string | null> => {
    const cacheKey = `${context.purchaseIntent}:${context.product.join('|')}:${text}`;
    if (freshTakeCache[cacheKey]) return freshTakeCache[cacheKey];
    if (freshTakeCount >= 3) return null;

    try {
      const next = await gemmaFreshTake({
        text,
        context,
        lastKipRecommendation: kipRecommendation.sayThis || kipRecommendation.action,
      });
      setFreshTakeCache((current) => ({ ...current, [cacheKey]: next }));
      setFreshTakeCount((current) => current + 1);
      try {
        trackLiveEvent('fresh-take');
      } catch {
        // Local-only tracking should never interrupt the call.
      }
      return next;
    } catch {
      const fallback = text
        .replace(/^I can /i, "Let's ")
        .replace(/^Let me /i, "I'll ")
        .replace(/\s+/g, ' ')
        .trim();
      setFreshTakeCache((current) => ({ ...current, [cacheKey]: fallback }));
      setFreshTakeCount((current) => current + 1);
      return fallback;
    }
  };

  return (
    <div className="space-y-4">
      <KipPanel recommendation={kipRecommendation} />

      <section className="glass-billboard overflow-hidden rounded-[2rem] p-5 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/90">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              30-second plan
            </div>
            <h3 className="mt-3 text-2xl font-black uppercase tracking-tight">Say less. Land the next move.</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-relaxed text-white/80">
              One opener, one question, one proof point, one close. Add-on appears only when the call earns it.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:w-[30rem]">
            <StatusPill label="Intent" value={INTENT_LABELS[context.purchaseIntent]} />
            <StatusPill label="Products" value={context.product.join(', ')} />
            <StatusPill label={supportFocusLabel ? 'Focus' : 'Location'} value={supportFocusLabel ?? locationLabel} />
          </div>
        </div>

        {homeInternetInPlay ? (
          <div className="mt-4 overflow-hidden rounded-[1.35rem] border border-white/10 bg-black/22">
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_16rem]">
              <div className="p-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/62">HINT visual cue</p>
                <p className="mt-1 text-sm font-black text-white">Check coverage, then keep the setup story simple.</p>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-white/70">
                  Use this as the rep reminder: address first, easy setup second, attach only after the home qualifies.
                </p>
              </div>
              <img
                src={HINT_LIVE_IMAGE}
                alt="Home Internet coverage check recommendation"
                className="h-36 w-full object-cover md:h-full"
                width={768}
                height={432}
                loading="lazy"
              />
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${hintStatus.tone}`}>
            <HintIcon className="h-3.5 w-3.5" />
            {hintStatus.label}
          </div>
          {context.currentCarrier && context.currentCarrier !== 'Not Specified' ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white">
              <MessageSquare className="h-3.5 w-3.5" />
              From {context.currentCarrier}
            </div>
          ) : null}
          {supportFocusLabel && locationLabel !== 'Location not set' ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white">
              <Search className="h-3.5 w-3.5" />
              {locationLabel}
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <PlanSection
          icon={<MessageSquare className="h-4 w-4 text-t-magenta" />}
          eyebrow="Open Strong"
          title="Start Here"
          tone="magenta"
          items={script.welcomeMessages}
          supportingItems={script.oneLiners}
          supportingLabel="Quick lines"
          onFreshTake={handleFreshTake}
          freshTakeLimitReached={freshTakeCount >= 3}
        />

        <PlanSection
          icon={<Search className="h-4 w-4 text-t-magenta" />}
          eyebrow="Discovery"
          title="Questions Worth Asking"
          tone="info"
          items={script.discoveryQuestions}
          onFreshTake={handleFreshTake}
          freshTakeLimitReached={freshTakeCount >= 3}
        />

        <PlanSection
          icon={<Lightbulb className="h-4 w-4 text-t-magenta" />}
          eyebrow="Value Story"
          title="Proof Points to Use"
          tone="warning"
          items={script.valuePropositions}
          onFreshTake={handleFreshTake}
          freshTakeLimitReached={freshTakeCount >= 3}
        />

        <PlanSection
          icon={<ShoppingBag className="h-4 w-4 text-t-magenta" />}
          eyebrow="Close Cleanly"
          title="Next Moves"
          tone="success"
          items={script.purchaseSteps}
          onFreshTake={handleFreshTake}
          freshTakeLimitReached={freshTakeCount >= 3}
        />
      </div>

      {primaryAttach ? (
        <section className="glass-stage-quiet rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-t-magenta/10">
              <Headphones className="h-5 w-5 text-t-magenta" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Earned add-on</p>
              <p className="mt-1 text-sm font-black text-foreground">Only bring this up if the caller signal matches.</p>
            </div>
          </div>

          <div className="glass-reading mt-4 rounded-2xl px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-foreground">{primaryAttach.name}</p>
                <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{primaryAttach.why}</p>
                {primaryAttach.proofText ? (
                  <p className="mt-2 text-[10px] font-semibold leading-relaxed text-t-dark-gray/70">
                    Proof: {primaryAttach.proofText}
                  </p>
                ) : null}
                <p className="mt-2 text-[8px] font-black uppercase tracking-[0.16em] text-t-dark-gray/50">
                  {getAccessoryEvidenceLabel(primaryAttach)}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-t-magenta/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-t-magenta">
                {primaryAttach.priceRange}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <section className="glass-stage-quiet rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-t-magenta/10">
              <Headphones className="h-5 w-5 text-t-magenta" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">No add-on yet</p>
              <p className="mt-1 text-sm font-black text-foreground">
                {liveGate.emptyReason || 'No strong add-on fit right now. Focus on the relationship.'}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function getAccessoryEvidenceLabel(item: AccessoryRecommendation): string {
  if (item.eligibilityStatus === 'quote-safe') return 'Source-backed - eligibility locked';
  if (item.eligibilityStatus === 'review-required') return 'Source-backed - verify eligibility';
  if (item.eligibilityStatus === 'not-eligible') return 'Source-backed - not bundle eligible';
  return item.sourceUrl ? 'Source-backed' : 'Local catalog';
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-utility flex min-h-[4.5rem] flex-col justify-center rounded-2xl px-3 py-3 text-center">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/75">{label}</p>
      <p className="mt-1 line-clamp-1 text-[11px] font-bold leading-tight text-white">{value}</p>
    </div>
  );
}

function PlanSection({
  icon,
  eyebrow,
  title,
  items,
  tone,
  supportingItems,
  supportingLabel,
  onFreshTake,
  freshTakeLimitReached,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  items: string[];
  tone: 'magenta' | 'info' | 'warning' | 'success';
  supportingItems?: string[];
  supportingLabel?: string;
  onFreshTake: (text: string) => Promise<string | null>;
  freshTakeLimitReached: boolean;
}) {
  const [freshTextByItem, setFreshTextByItem] = useState<Record<string, string>>({});
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const toneClass = {
    magenta: 'glass-feature',
    info: 'glass-stage-quiet',
    warning: 'glass-stage-quiet',
    success: 'glass-stage-quiet',
  }[tone];

  return (
    <section className={`rounded-3xl p-5 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70">
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em]">{eyebrow}</p>
          <p className="mt-1 text-sm font-black text-foreground">{title}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {items.slice(0, 1).map((item) => (
          <div key={item} className="glass-reading rounded-2xl px-4 py-3">
            <p className="text-[11px] font-medium leading-relaxed text-t-dark-gray">{freshTextByItem[item] || item}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (loadingItem || freshTextByItem[item] || freshTakeLimitReached) return;
                  setLoadingItem(item);
                  const next = await onFreshTake(item);
                  if (next) {
                    setFreshTextByItem((current) => ({ ...current, [item]: next }));
                  }
                  setLoadingItem(null);
                }}
                disabled={Boolean(loadingItem) || Boolean(freshTextByItem[item]) || freshTakeLimitReached}
                className="focus-ring inline-flex min-h-[34px] items-center gap-1.5 rounded-full bg-t-magenta/10 px-3 text-[9px] font-black uppercase tracking-[0.14em] text-t-magenta transition-colors hover:bg-t-magenta/15 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {loadingItem === item ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {freshTextByItem[item] ? 'Fresh take ready' : 'Fresh take'}
              </button>
              {freshTakeLimitReached && !freshTextByItem[item] ? (
                <span className="text-[9px] font-semibold text-t-muted">3 per call</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {supportingItems && supportingItems.length > 0 ? (
        <div className="glass-reading mt-4 rounded-2xl px-4 py-3">
          <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">
            {supportingLabel || 'Extra lines'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {supportingItems.slice(0, 2).map((item) => (
              <span
                key={item}
                className="rounded-full bg-t-light-gray/40 px-2.5 py-1 text-[9px] font-bold text-t-dark-gray"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
