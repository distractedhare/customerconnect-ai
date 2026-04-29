import { useState, useMemo, useDeferredValue, useEffect, type ReactNode } from 'react';
import { Search, Tag, Crown, X, Wrench, Zap, Layers, Ear, MessageSquareQuote, Sparkles, Users, ChevronDown, ArrowRightLeft, Lightbulb, PanelTopOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, Device, CONNECTED_DEVICE_INFO } from '../data/devices';
import { Promo, WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { EcosystemMatrix } from '../types/ecosystem';
import { getAppealTypeLabel, getDevicePositioningSummary } from '../services/positioningService';
import DeviceImage from './DeviceImage';

export interface DevicePreset {
  label: string;
  deviceNames: string[];
  subtitle: string;
  useWhen: string;
  heroNote?: string;
  icon?: ReactNode;
  primary?: boolean;
}

interface DeviceLookupProps {
  selectedDevices: Device[];
  onToggleDevice: (device: Device) => void;
  onClearDevices: () => void;
  onOpenCompare?: () => void;
  compareOpen?: boolean;
  /** Optional custom device pool — defaults to ALL_DEVICES */
  devicePool?: Device[];
  /** Optional custom filters */
  filters?: { id: string; label: string }[];
  /** Optional custom sort mode */
  defaultSort?: DeviceLookupSort;
  /** Optional category-specific filter resolver */
  filterBy?: (device: Device, filter: string) => boolean;
  /** Optional mobile browse state */
  browseExpanded?: boolean;
  onBrowseExpandedChange?: (expanded: boolean) => void;
  /** Optional quick brief trigger for a selected device */
  onInspectDevice?: (device: Device) => void;
  /** Whether browse should read as a primary or secondary surface */
  layoutEmphasis?: 'primary' | 'secondary';
}

type DeviceLookupSort = 'name' | 'price' | 'newest';

export const ALL_DEVICES: Device[] = [...PHONES, ...TABLETS, ...WATCHES, ...HOTSPOTS];

function normalizePromoText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function containsWholeAlias(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  return ` ${haystack} `.includes(` ${needle} `);
}

function getPromoAliases(device: Device): string[] {
  const normalizedName = normalizePromoText(device.name);
  const aliases = new Set<string>([normalizedName]);

  if (normalizedName.startsWith('samsung galaxy ')) {
    aliases.add(normalizedName.slice('samsung galaxy '.length));
  } else if (normalizedName.startsWith('galaxy ')) {
    aliases.add(normalizedName.slice('galaxy '.length));
  }

  return [...aliases].filter((alias) => alias.length > 0);
}

function getPromoMatchScore(searchText: string, device: Device): number {
  const normalizedText = normalizePromoText(searchText);
  let bestScore = 0;

  getPromoAliases(device).forEach((alias) => {
    if (!containsWholeAlias(normalizedText, alias)) return;
    bestScore = Math.max(bestScore, alias.split(' ').length);
  });

  return bestScore;
}

function getPromoBestMatches(promo: Promo, devicePool: Device[]): Device[] {
  const searchCandidates = [promo.name, `${promo.name} ${promo.details}`];
  let bestScore = 0;
  let bestMatches: Device[] = [];

  searchCandidates.forEach((searchText, index) => {
    if (bestScore > 0 && index > 0) return;

    const scoredMatches = devicePool
      .map((device) => ({ device, score: getPromoMatchScore(searchText, device) }))
      .filter((match) => match.score > 0);

    if (scoredMatches.length === 0) return;

    const maxScore = Math.max(...scoredMatches.map((match) => match.score));
    bestScore = maxScore;
    bestMatches = scoredMatches
      .filter((match) => match.score === maxScore)
      .map((match) => match.device);
  });

  return bestMatches;
}

export function findPromoForDevice(promos: Promo[], device: Device, devicePool: Device[]): Promo | null {
  for (const promo of promos) {
    const matchedDevices = getPromoBestMatches(promo, devicePool);
    if (matchedDevices.some((matchedDevice) => matchedDevice.name === device.name)) {
      return promo;
    }
  }

  return null;
}

// --- Phone presets ---
export const FLAGSHIP_PHONES: string[] = ['iPhone 17 Pro Max', 'Galaxy S26 Ultra', 'Pixel 10 Pro XL'];
export const BUDGET_PHONES: string[] = ['iPhone 17e', 'Galaxy A17 5G', 'Pixel 10a'];
export const QUIRKY_COUSINS: string[] = ['Samsung Galaxy XCover7 Pro', 'T-Mobile REVVL 8 Pro', 'Motorola moto g 2026'];

// --- Tablet presets ---
export const FLAGSHIP_TABLETS: string[] = ['iPad Pro 11" (M5)', 'Samsung Galaxy Tab S10+ 5G'];
export const BUDGET_TABLETS: string[] = ['iPad (A16)', 'Samsung Galaxy Tab A11+ 5G'];
export const IPAD_LINEUP: string[] = ['iPad (A16)', 'iPad mini (A17 Pro)', 'iPad Air 11" (M4)', 'iPad Pro 11" (M5)'];
export const GALAXY_TABS: string[] = ['Samsung Galaxy Tab S10+ 5G', 'Samsung Galaxy Tab S10 FE 5G', 'Samsung Galaxy Tab A11+ 5G'];

// --- Watch presets ---
export const FLAGSHIP_WATCHES: string[] = ['Apple Watch Series 11', 'Samsung Galaxy Watch8 Ultra', 'Pixel Watch 4'];
export const BUDGET_WATCHES: string[] = ['Apple Watch SE 3', 'Samsung Galaxy Watch8', 'T-Mobile SyncUP KIDS Watch 2'];
export const ADVENTURE_READY: string[] = ['Apple Watch Ultra 3', 'Samsung Galaxy Watch8 Ultra', 'Samsung Galaxy Ring'];

// Default phone presets
export const PHONE_PRESETS: DevicePreset[] = [
  {
    label: 'Flagship Showdown',
    deviceNames: FLAGSHIP_PHONES,
    subtitle: 'Prestige picks with camera flex, AI halo, and top-shelf battery stories.',
    useWhen: 'Use this when the caller wants the latest thing, the best camera, or the premium status-device story.',
    heroNote: 'Premium want, balanced challenger, and a budget-safe pivot all in one scan.',
    icon: <Crown className="w-2.5 h-2.5 text-warning-accent" />,
    primary: true,
  },
  {
    label: 'Budget Conscious',
    deviceNames: BUDGET_PHONES,
    subtitle: 'Current-feeling phones that protect the payment and still sound like a smart upgrade.',
    useWhen: 'Use this when qualification is tight but the customer still wants something fresh, fast, and easy to defend.',
    heroNote: 'Best for payment-sensitive calls where you still need the phone to feel like a win.',
    icon: <Zap className="w-2.5 h-2.5" />,
  },
  {
    label: 'Quirky Cousins',
    deviceNames: QUIRKY_COUSINS,
    subtitle: 'Utility-first devices for rugged jobs, backup lines, and off-script use cases.',
    useWhen: 'Use this when the normal flagship story misses the real job-to-be-done and the customer needs something more specific.',
    heroNote: 'Great for third-line saves, backup-phone conversations, and practical niche fits.',
    icon: <Sparkles className="w-2.5 h-2.5" />,
  },
];

export const TABLET_PRESETS: DevicePreset[] = [
  {
    label: 'Flagship Showdown',
    deviceNames: FLAGSHIP_TABLETS,
    subtitle: 'Top-tier screens and productivity power for customers who want tablet-first performance.',
    useWhen: 'Use this when the tablet is replacing a laptop, creative device, or serious work screen.',
    heroNote: 'Best when the customer cares more about capability than lowest monthly cost.',
    icon: <Crown className="w-2.5 h-2.5 text-warning-accent" />,
    primary: true,
  },
  {
    label: 'Budget Battle',
    deviceNames: BUDGET_TABLETS,
    subtitle: 'Practical family tablets that keep the price story clean and easy.',
    useWhen: 'Use this when the customer needs a shared household screen, school device, or light entertainment tablet.',
    heroNote: 'Lower cost without losing the obvious everyday use case.',
    icon: <Zap className="w-2.5 h-2.5" />,
  },
  {
    label: 'iPad Lineup',
    deviceNames: IPAD_LINEUP,
    subtitle: 'A simple Apple-only ladder from casual use up through pro work.',
    useWhen: 'Use this when the customer already leans Apple and just needs the right rung of the iPad ladder.',
    heroNote: 'Great for sizing the customer up from casual use to serious productivity.',
    icon: <Layers className="w-2.5 h-2.5" />,
  },
  {
    label: 'Galaxy Tabs',
    deviceNames: GALAXY_TABS,
    subtitle: 'Samsung tablet options with DeX, ecosystem hooks, and family-friendly picks.',
    useWhen: 'Use this when the customer already prefers Galaxy or wants keyboard-ready multitasking.',
    heroNote: 'Use this to keep the Samsung story inside one clear compare lane.',
    icon: <Layers className="w-2.5 h-2.5" />,
  },
];

export const WATCH_PRESETS: DevicePreset[] = [
  {
    label: 'Flagship Showdown',
    deviceNames: FLAGSHIP_WATCHES,
    subtitle: 'The biggest watch stories for health, battery, and ecosystem pull.',
    useWhen: 'Use this when the customer wants the best watch experience and needs help choosing the right premium lane.',
    heroNote: 'Fastest way to compare the halo watches without opening the whole catalog.',
    icon: <Crown className="w-2.5 h-2.5 text-warning-accent" />,
    primary: true,
  },
  {
    label: 'Budget Battle',
    deviceNames: BUDGET_WATCHES,
    subtitle: 'Entry-friendly wearables that still cover the key everyday stories.',
    useWhen: 'Use this when the customer wants a first smartwatch, family wearable, or lower-cost add-on.',
    heroNote: 'Keeps the entry story confident instead of sounding like a step down.',
    icon: <Zap className="w-2.5 h-2.5" />,
  },
  {
    label: 'Adventure Ready',
    deviceNames: ADVENTURE_READY,
    subtitle: 'Durability-forward wearables for active customers and off-the-grid stories.',
    useWhen: 'Use this when the customer cares more about endurance, ruggedness, or specialty utility than pure style.',
    heroNote: 'Great for adventure and fitness calls that need more than standard smartwatch language.',
    icon: <Wrench className="w-2.5 h-2.5" />,
  },
];

export function getDevicesByNames(names: string[]): Device[] {
  return names.map(name => ALL_DEVICES.find(d => d.name === name)).filter(Boolean) as Device[];
}

const DEFAULT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'iphone', label: 'iPhone' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'pixel', label: 'Pixel' },
  { id: 'other', label: 'Other' },
];

const SORT_OPTIONS: { id: DeviceLookupSort; label: string }[] = [
  { id: 'name', label: 'Name' },
  { id: 'price', label: 'Price' },
  { id: 'newest', label: 'Newest' },
];

type DeviceLookupMode = 'phones' | 'tablets' | 'wearables';

const LOOKUP_COPY: Record<DeviceLookupMode, { resultCap: number; searchPlaceholder: string; emptyState: string; helper: string }> = {
  phones: {
    resultCap: 12,
    searchPlaceholder: 'Search phones, features, or brands…',
    emptyState: 'Try a different phone search or filter.',
    helper: 'Compare two or three strong fits, not the whole wall.',
  },
  tablets: {
    resultCap: 10,
    searchPlaceholder: 'Search tablets, chips, or use cases…',
    emptyState: 'Try a different tablet search or filter.',
    helper: 'Lead with screen size, battery life, and how it fits the customer\'s day.',
  },
  wearables: {
    resultCap: 10,
    searchPlaceholder: 'Search watches, trackers, or connected devices…',
    emptyState: 'Try a different wearable or connected-device search.',
    helper: 'Use this lane for watches, rings, hotspots, trackers, and kids\' wearables.',
  },
};

function toSafeNumber(rawPrice: string | number): number {
  if (typeof rawPrice === 'number') return rawPrice;
  const parsed = Number.parseFloat(rawPrice.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : Number.POSITIVE_INFINITY;
}

function releaseSortKey(value: string): number {
  const clean = value.trim().toLowerCase();
  const monthNames: Record<string, number> = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11,
  };

  const yearMatch = clean.match(/(19|20)\d{2}/);
  const year = yearMatch ? Number.parseInt(yearMatch[0], 10) : 0;
  const monthMatch = clean.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i);
  const month = monthMatch ? monthNames[monthMatch[1].toLowerCase()] : 0;

  if (year === 0) return 0;
  return year * 100 + month;
}

function sortDevices(mode: DeviceLookupSort, devices: Device[]): Device[] {
  const sorted = [...devices];

  if (mode === 'name') {
    return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (mode === 'price') {
    return sorted.sort((a, b) => toSafeNumber(a.startingPrice) - toSafeNumber(b.startingPrice));
  }

  return sorted.sort((a, b) => {
    const byRelease = releaseSortKey(b.released) - releaseSortKey(a.released);
    if (byRelease !== 0) return byRelease;
    return a.name.localeCompare(b.name);
  });
}

function inferLookupMode(pool: Device[]): DeviceLookupMode {
  const categories = new Set(pool.map((device) => device.category));

  if (categories.size === 1 && categories.has('tablet')) {
    return 'tablets';
  }

  if (categories.has('watch') || categories.has('hotspot')) {
    return 'wearables';
  }

  return 'phones';
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDevicePrice(device: Device) {
  return typeof device.startingPrice === 'number' ? formatCurrency(device.startingPrice) : device.startingPrice;
}

export function normalizeCompareSet(deviceNames: string[], compareSet: string[]): string[] {
  const orderedNames = compareSet.filter((name) => deviceNames.includes(name));

  if (orderedNames.length >= Math.min(3, deviceNames.length)) {
    return orderedNames.slice(0, 3);
  }

  const next = [...orderedNames];
  deviceNames.forEach((name) => {
    if (!next.includes(name) && next.length < Math.min(3, deviceNames.length)) {
      next.push(name);
    }
  });

  return next;
}

function buildFeatureBriefs(device: Device, summary: ReturnType<typeof getDevicePositioningSummary>) {
  const quickUseCases = unique([...summary.listenFor, ...summary.bestFit]).filter(Boolean);
  const briefs = summary.featureTranslations.slice(0, 3).map((translation, index) => ({
    feature: translation.feature,
    benefit: translation.benefit,
    useCase: quickUseCases[index] ?? quickUseCases[0] ?? 'everyday upgrades',
  }));

  if (briefs.length < 4) {
    briefs.push({
      feature: summary.primaryAngle.title,
      benefit: summary.primaryAngle.proof,
      useCase: summary.bestFit[0] ?? quickUseCases[0] ?? 'customers who want a clear everyday upgrade',
    });
  }

  if (briefs.length < 5) {
    briefs.push({
      feature: 'Why reps lead with it',
      benefit: summary.shortHook || device.keySpecs.split(',')[0] || 'It gives the rep one strong reason to position it fast.',
      useCase: summary.listenFor[0] ?? summary.bestFit[0] ?? 'calls where the customer wants the short version',
    });
  }

  return briefs.slice(0, 5);
}

export type LineupRole = {
  name: string;
  label: string;
  helper: string;
};

export function buildLineupRoles(
  devices: Device[],
  summaries: Map<string, ReturnType<typeof getDevicePositioningSummary>>
): LineupRole[] {
  if (devices.length === 0) return [];

  const ranked = [...devices].sort((a, b) => toSafeNumber(b.startingPrice) - toSafeNumber(a.startingPrice));

  if (ranked.length === 2) {
    const cheaper = ranked[1];
    const cheaperAppeal = summaries.get(cheaper.name)?.appealType;
    const cheaperIsValue = cheaperAppeal === 'value' || cheaperAppeal === 'practical' || toSafeNumber(ranked[0].startingPrice) - toSafeNumber(cheaper.startingPrice) >= 250;

    return [
      { name: ranked[0].name, label: 'Dream pick', helper: 'premium want' },
      { name: cheaper.name, label: cheaperIsValue ? 'Value save' : 'Smarter fit', helper: cheaperIsValue ? 'safer budget option' : 'easier-to-qualify option' },
    ];
  }

  if (ranked.length >= 3) {
    return [
      { name: ranked[0].name, label: 'Dream pick', helper: 'premium want' },
      { name: ranked[1].name, label: 'Best balance', helper: 'best balance' },
      { name: ranked[ranked.length - 1].name, label: 'Value save', helper: 'safer budget option' },
    ];
  }

  return [{ name: ranked[0].name, label: 'Current focus', helper: 'quick brief' }];
}

export function buildLineupNarrative(roles: LineupRole[]) {
  if (roles.length >= 3) {
    return 'Start with the premium want, use the balance option to anchor the story, and keep the safer budget option ready if qualification gets tight.';
  }

  if (roles.length === 2) {
    return 'Use this as a fast tradeoff scan between the premium want and the smarter fit so the rep can pivot without sounding like they are downgrading the customer.';
  }

  return 'Tap into the quick brief, then pull in another device if the caller needs a real comparison.';
}

export default function DeviceLookup({
  selectedDevices,
  onToggleDevice,
  onClearDevices,
  onOpenCompare,
  compareOpen = false,
  devicePool,
  filters: customFilters,
  defaultSort = 'name',
  filterBy,
  browseExpanded,
  onBrowseExpandedChange,
  onInspectDevice,
  layoutEmphasis = 'primary',
}: DeviceLookupProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [sortMode, setSortMode] = useState<DeviceLookupSort>(defaultSort);
  const deferredSearch = useDeferredValue(search);
  const pool = devicePool || ALL_DEVICES;
  const filters = customFilters || DEFAULT_FILTERS;
  const defaultSortMode = defaultSort;
  const lookupMode = useMemo(() => inferLookupMode(pool), [pool]);
  const lookupCopy = LOOKUP_COPY[lookupMode];
  const isBrowseExpanded = browseExpanded ?? true;

  useEffect(() => {
    setSortMode(defaultSortMode);
    setFilter('all');
    setSearch('');
  }, [defaultSortMode]);

  const filteredDevices = useMemo(() => {
    let devices = pool;

    if (filter !== 'all') {
      devices = devices.filter(device => {
        if (filterBy) {
          return filterBy(device, filter);
        }

        if (filter === 'other') return device.category === 'other' || device.category === 'hotspot';
        return device.category === filter;
      });
    }

    if (deferredSearch.trim()) {
      const q = deferredSearch.toLowerCase();
      devices = devices.filter(device =>
        device.name.toLowerCase().includes(q) ||
        device.keySpecs.toLowerCase().includes(q)
      );
    }

    return sortDevices(sortMode, devices);
  }, [deferredSearch, filter, filterBy, pool, sortMode]);

  const visibleDevices = useMemo(
    () => filteredDevices.slice(0, lookupCopy.resultCap),
    [filteredDevices, lookupCopy.resultCap]
  );
  const hiddenCount = Math.max(0, filteredDevices.length - visibleDevices.length);
  const hasActiveControls = search.trim().length > 0 || filter !== 'all' || sortMode !== defaultSortMode;
  const selectionLimitReached = selectedDevices.length >= 3;
  const isSecondary = layoutEmphasis === 'secondary';
  const browseSummaries = useMemo(
    () => new Map(pool.map((device) => [device.name, getDevicePositioningSummary(device, null, null)])),
    [pool]
  );

  const isSelected = (device: Device) => selectedDevices.some(d => d.name === device.name);

  return (
    <div className="space-y-4">
      <div className={`rounded-[1.65rem] p-3 ${
        isSecondary ? 'glass-reading' : 'glass-stage-quiet'
      }`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">Active lineup</p>
            {selectedDevices.length <= 1 ? (
              <p className="mt-1 text-[11px] font-medium text-t-dark-gray">{lookupCopy.helper}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-t-light-gray bg-surface px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-t-dark-gray">
              {selectedDevices.length > 0 ? `${selectedDevices.length} selected` : 'Pick 2-3 to compare'}
            </span>
            {selectedDevices.length > 1 ? (
              <button
                type="button"
                onClick={onOpenCompare}
                className={`focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${
                  compareOpen
                    ? 'glass-control text-t-dark-gray'
                    : 'glass-control-active text-white'
                }`}
              >
                <PanelTopOpen className="h-3 w-3" />
                {compareOpen ? 'Comparing' : 'Open compare'}
              </button>
            ) : null}
            {selectedDevices.length > 0 ? (
              <button
                type="button"
                onClick={onClearDevices}
                className="focus-ring rounded-full glass-control px-3 py-1 text-[10px] font-black uppercase tracking-wider text-t-muted transition-colors hover:text-t-magenta"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>

        {selectedDevices.length > 0 ? (
          <div className="mt-3 space-y-2">
            {selectedDevices.length >= 3 ? (
              <p className="rounded-xl border border-warning-border bg-warning-surface px-3 py-2 text-[10px] font-bold leading-relaxed text-warning-foreground">
                Mobile compare works best with 2-3 devices. Remove one before adding another if you want to keep this fast mid-call.
              </p>
            ) : (
              <p className="text-[10px] font-medium text-t-muted">
                Build the shortlist first, then open compare when you have the strongest two or three fits.
              </p>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedDevices.map((device) => (
                <div
                  key={device.name}
                  className={`flex items-center rounded-2xl text-[10px] font-black ${
                    isSecondary
                      ? 'border border-t-light-gray/60 bg-surface-elevated text-t-dark-gray'
                      : 'border border-t-magenta/20 bg-t-magenta/8 text-t-magenta'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onInspectDevice?.(device)}
                    className="focus-ring flex items-center gap-2 rounded-l-2xl px-2.5 py-1.5 text-left"
                  >
                    <DeviceImageSlot
                      device={device}
                      className="h-8 w-8 shrink-0 rounded-xl border border-t-light-gray/50 bg-white/70 p-1"
                      imageClassName="h-full w-full object-contain"
                      showBadge={false}
                    />
                    <span className="max-w-[92px] truncate">{device.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleDevice(device)}
                    className="focus-ring rounded-r-2xl border-l border-t-magenta/20 px-2 py-2 text-t-magenta transition-colors hover:bg-t-magenta/10"
                    aria-label={`Remove ${device.name} from the active lineup`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
            {selectedDevices.length <= 1 && onInspectDevice ? (
              <p className="text-[10px] font-medium text-t-muted">
                Tap a selected device for a quick brief without leaving the showdown.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-[10px] font-medium text-t-muted">
            Tap individual devices to build a clean side-by-side, then open compare when you have the strongest two or three fits.
          </p>
        )}
      </div>

      <div className={`rounded-[1.45rem] p-2 lg:hidden ${isSecondary ? 'glass-reading' : 'glass-stage-quiet'}`}>
        <button
          type="button"
          onClick={() => onBrowseExpandedChange?.(!isBrowseExpanded)}
          className="focus-ring flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left"
          aria-expanded={isBrowseExpanded}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">
              {isBrowseExpanded ? 'Hide browse' : 'Browse all devices'}
            </p>
            <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
              {isBrowseExpanded
                ? 'Collapse search and filters so the lineup stays front-and-center.'
                : 'Open the full device wall when you want to swap the lineup or scout another option.'}
            </p>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-t-muted transition-transform ${isBrowseExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className={isBrowseExpanded ? 'block' : 'hidden lg:block'}>
        <div className="space-y-4">
          <div className={`sticky sticky-under-learn-tabs z-10 rounded-[1.35rem] p-2.5 backdrop-blur-sm sm:top-0 ${
            isSecondary ? 'glass-reading' : 'glass-control'
          }`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-t-muted" />
              <input
                type="text"
                aria-label="Search devices"
                name="device-search"
                placeholder={lookupCopy.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="focus-ring w-full rounded-xl border-2 border-t-light-gray bg-white py-3 pl-10 pr-4 text-[11px] font-bold text-foreground transition-all placeholder:text-t-dark-gray/30"
                autoComplete="off"
              />
            </div>

            <div className="mt-2">
              <div className="-mx-0.5 mobile-rail px-0.5 pb-1 sm:mx-0 sm:flex sm:flex-wrap sm:gap-1.5 sm:overflow-visible sm:px-0 sm:pb-0">
                {filters.length > 1 && filters.map((f) => (
                  <button
                    type="button"
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    aria-pressed={filter === f.id}
                    className={`focus-ring rail-snap-start min-h-[40px] rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                      filter === f.id
                        ? 'glass-control-active text-white'
                        : 'glass-control text-t-dark-gray hover:text-t-magenta'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <label className="shrink-0 text-[10px] font-black uppercase tracking-widest text-t-muted">Sort</label>
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as DeviceLookupSort)}
                  className="focus-ring min-w-0 rounded-full glass-control px-3 py-2 text-[10px] font-black uppercase tracking-wide text-t-dark-gray"
                >
                  {SORT_OPTIONS.map(option => (
                    <option
                      key={option.id}
                      value={option.id}
                      className="font-black uppercase"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {hasActiveControls ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setFilter('all');
                    setSortMode(defaultSortMode);
                  }}
                  className="focus-ring shrink-0 rounded-full glass-control px-3 py-2 text-[10px] font-black uppercase tracking-wide text-t-muted transition-colors hover:text-t-magenta"
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-t-muted">
              {filteredDevices.length > 0
                ? hiddenCount > 0
                  ? `Showing ${visibleDevices.length} of ${filteredDevices.length} matches`
                  : `Showing ${filteredDevices.length} matches`
                : 'No matches found'}
            </p>
            {hiddenCount > 0 ? (
              <p className="text-[10px] font-medium text-t-muted">
                Refine the search to see the remaining {hiddenCount} devices.
              </p>
            ) : null}
          </div>

          {/* Device list */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 pb-1">
            {filteredDevices.length === 0 && (
              <p className="rounded-xl border border-dashed border-t-light-gray bg-surface-elevated p-4 text-center text-[10px] font-black uppercase tracking-widest text-t-muted">
                {lookupCopy.emptyState}
              </p>
            )}

            {visibleDevices.map((device) => {
              const selected = isSelected(device);
              const priceLabel = typeof device.startingPrice === 'number'
                ? `$${device.startingPrice}`
                : device.startingPrice;
              const browseSummary = browseSummaries.get(device.name);

              return (
                <button
                  type="button"
                  key={device.name}
                  onClick={() => {
                    if (!selected && selectionLimitReached) {
                      return;
                    }
                    onToggleDevice(device);
                  }}
                  aria-pressed={selected}
                  disabled={!selected && selectionLimitReached}
                  className={`focus-ring w-full text-left p-3 rounded-2xl border transition-all ${
                    selected
                      ? 'border-t-magenta bg-t-magenta/5 shadow-md'
                      : selectionLimitReached
                        ? 'border-t-light-gray/50 bg-surface opacity-60'
                        : isSecondary
                          ? 'border-t-light-gray/70 bg-surface-elevated hover:border-t-magenta/20'
                          : 'border-t-light-gray bg-surface hover:border-t-magenta/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <DeviceImageSlot
                      device={device}
                      className="relative h-16 w-16 shrink-0 rounded-xl border border-t-light-gray/50 bg-t-light-gray/20 p-2"
                      imageClassName="h-full max-h-12 w-full object-contain"
                      badgeSize="sm"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                          selected ? 'bg-t-magenta border-t-magenta' : 'border-t-light-gray'
                        }`}>
                          {selected && <span className="text-white text-[8px] font-black">✓</span>}
                        </div>
                        <span className="truncate text-[13px] font-black leading-tight text-t-dark-gray">{device.name}</span>
                      </div>
                      <div className="ml-7 mt-2 flex flex-wrap gap-1.5">
                        {browseSummary?.bestFit.slice(0, 2).map((fit) => (
                          <span
                            key={fit}
                            className="rounded-full border border-t-magenta/20 bg-t-magenta/8 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-t-magenta"
                          >
                            {fit}
                          </span>
                        ))}
                      </div>
                      <p className="ml-7 mt-2 text-[10px] font-bold leading-snug text-t-dark-gray">
                        {browseSummary?.shortHook || 'Use one clean angle, then back it up with one proof point.'}
                      </p>
                      <div className="mt-2 ml-7 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-t-light-gray bg-surface-elevated px-2 py-1 text-[9px] font-black uppercase tracking-widest text-t-dark-gray">
                          {device.category}
                        </span>
                        <span className="rounded-full border border-t-magenta bg-t-magenta/10 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-t-magenta">
                          {priceLabel}
                        </span>
                        <span className="rounded-full border border-t-light-gray bg-t-light-gray/20 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-t-muted">
                          {device.released}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeviceLineupHeroProps {
  label: string;
  kind: 'preset' | 'custom';
  devices: Device[];
  compareDevices: Device[];
  overflowDevices: Device[];
  weeklyData: WeeklyUpdate | null;
  ecosystemMatrix?: EcosystemMatrix | null;
  compareOpen?: boolean;
  heroNote?: string;
  layoutMode?: 'showcase' | 'compact';
  onOpenCompare?: () => void;
  onReset: () => void;
  onInspectDevice?: (device: Device) => void;
  onSwapCompareDevice?: (device: Device) => void;
  onBrowseAll?: () => void;
}

export function DeviceLineupHero({
  label,
  kind,
  devices,
  compareDevices,
  overflowDevices,
  weeklyData,
  ecosystemMatrix,
  compareOpen = false,
  heroNote,
  layoutMode = 'showcase',
  onOpenCompare,
  onReset,
  onInspectDevice,
  onSwapCompareDevice,
  onBrowseAll,
}: DeviceLineupHeroProps) {
  const summaries = useMemo(
    () => new Map(devices.map((device) => [device.name, getDevicePositioningSummary(device, weeklyData, ecosystemMatrix)])),
    [devices, weeklyData, ecosystemMatrix]
  );
  const lineupRoles = useMemo(() => buildLineupRoles(devices, summaries), [devices, summaries]);
  const roleByName = useMemo(() => new Map(lineupRoles.map((role) => [role.name, role])), [lineupRoles]);
  const narrative = buildLineupNarrative(lineupRoles);
  const compareNames = new Set(compareDevices.map((device) => device.name));
  const isShowcase = layoutMode === 'showcase';

  return (
    <div className={isShowcase ? 'space-y-5' : 'space-y-4'}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full glass-control px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-t-magenta">
              {kind === 'preset' ? 'Preset lineup' : 'Custom compare'}
            </span>
            <span className="rounded-full glass-reading px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-t-dark-gray">
              {devices.length} in lineup
            </span>
            {devices.length > compareDevices.length ? (
              <span className="rounded-full glass-reading px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-t-dark-gray">
                {compareDevices.length} live in compare
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-[2rem]">
            {label}
          </h3>
          {heroNote ? (
            <p className="mt-2 max-w-3xl text-[12px] font-semibold leading-relaxed text-foreground sm:text-[13px]">
              {heroNote}
            </p>
          ) : null}
          <p className="mt-2 max-w-3xl text-[13px] font-medium leading-relaxed text-t-dark-gray sm:text-sm">
            {narrative}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {devices.length > 1 ? (
            <button
              type="button"
              onClick={onOpenCompare}
              className={`focus-ring rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider ${
                compareOpen ? 'glass-control text-t-dark-gray' : 'glass-control-active text-white'
              }`}
            >
              {compareOpen ? 'Comparing now' : 'Open compare'}
            </button>
          ) : null}
          {onBrowseAll ? (
            <button
              type="button"
              onClick={onBrowseAll}
              className="focus-ring rounded-full glass-control px-3 py-2 text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
            >
              Browse all devices
            </button>
          ) : null}
          <button
            type="button"
            onClick={onReset}
            className="focus-ring rounded-full glass-control px-3 py-2 text-[10px] font-black uppercase tracking-wider text-t-muted transition-colors hover:text-t-magenta"
          >
            Reset lineup
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {devices.map((device) => {
          const summary = summaries.get(device.name);
          const role = roleByName.get(device.name);
          const isInCompare = compareNames.has(device.name);

          return (
            <button
              key={device.name}
              type="button"
              onClick={() => onInspectDevice?.(device)}
              className={`group focus-ring min-w-[250px] flex-1 rounded-[1.9rem] p-4 text-left transition-all ${isShowcase ? 'sm:min-w-[280px]' : 'sm:min-w-[260px]'} ${
                isInCompare
                  ? 'glass-stage border-t-magenta/30 shadow-lg shadow-t-magenta/10'
                  : 'glass-control hover:-translate-y-0.5 hover:border-t-magenta/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {role ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-t-magenta px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white">
                        {role.label}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-t-muted">
                        {role.helper}
                      </span>
                    </div>
                  ) : null}
                  <h4 className="mt-3 text-base font-black leading-tight text-foreground">{device.name}</h4>
                  <p className="mt-1 text-[12px] font-bold text-t-magenta">
                    {formatDevicePrice(device)}
                  </p>
                </div>
                <DeviceImageSlot
                  device={device}
                  className="h-24 w-24 shrink-0 rounded-[1.45rem] border border-white/35 bg-white/92 p-3 shadow-sm"
                  imageClassName="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
                  showBadge={false}
                />
              </div>

              <div className="mt-4 rounded-[1.45rem] glass-reading-strong p-3.5">
                <p className="text-[11px] font-semibold leading-relaxed text-foreground">
                  {summary?.shortHook || 'Lead with one clear angle, then back it up with one everyday proof point.'}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Best for</p>
                    <p className="mt-1 text-[11px] font-bold leading-snug text-t-dark-gray">
                      {summary?.bestFit[0] || 'Everyday upgrades'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Listen for</p>
                    <p className="mt-1 text-[11px] font-bold leading-snug text-t-dark-gray">
                      {summary?.listenFor[0] || role?.helper || 'Customers who want the short version'}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] font-medium leading-relaxed text-t-dark-gray">
                  Lead with: {summary?.primaryAngle.title || 'One clear reason this device makes sense right now.'}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {summary?.bestFit.slice(1, 3).map((fit) => (
                  <span
                    key={fit}
                    className="rounded-full border border-t-magenta/20 bg-t-magenta/8 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta"
                  >
                    {fit}
                  </span>
                ))}
                <span className="rounded-full border border-t-light-gray bg-surface px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
                  {summary ? getAppealTypeLabel(summary.appealType) : 'Quick scan'}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] ${
                  isInCompare
                    ? 'border border-t-magenta/20 bg-white/75 text-t-dark-gray'
                    : 'border border-t-light-gray bg-surface text-t-muted'
                }`}>
                  {isInCompare ? 'In compare' : 'Quick brief'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {overflowDevices.length > 0 ? (
        <div className="rounded-[1.5rem] glass-reading-strong p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">More options</p>
              <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
                These lineup picks stay visible in the hero. Swap one into the active compare set when you want a different tradeoff.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {overflowDevices.map((device) => (
                <button
                  key={device.name}
                  type="button"
                  onClick={() => onSwapCompareDevice?.(device)}
                  className="focus-ring rounded-full glass-control px-3 py-2 text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:border-t-magenta/30 hover:text-t-magenta"
                >
                  Use {device.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface DeviceQuickBriefSheetProps {
  device: Device | null;
  open: boolean;
  weeklyData: WeeklyUpdate | null;
  ecosystemMatrix?: EcosystemMatrix | null;
  onClose: () => void;
}

export function DeviceQuickBriefSheet({
  device,
  open,
  weeklyData,
  ecosystemMatrix,
  onClose,
}: DeviceQuickBriefSheetProps) {
  const [showDeals, setShowDeals] = useState(false);
  const [showCoaching, setShowCoaching] = useState(false);
  const summary = useMemo(
    () => device ? getDevicePositioningSummary(device, weeklyData, ecosystemMatrix) : null,
    [device, weeklyData, ecosystemMatrix]
  );

  useEffect(() => {
    if (open) {
      setShowDeals(false);
      setShowCoaching(false);
    }
  }, [device?.name, open]);

  if (!device || !summary) return null;

  const featureBriefs = buildFeatureBriefs(device, summary).slice(0, 4);
  const weeklyPromos = weeklyData?.currentPromos.filter((promo) =>
    promo.name.toLowerCase().includes(device.name.toLowerCase().split(' ')[0]) ||
    promo.details.toLowerCase().includes(device.name.toLowerCase().split(' ')[0])
  ) ?? [];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/52 backdrop-blur-[2px] sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-t-[2rem] glass-stage sm:rounded-[2rem]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={`${device.name} quick brief`}
          >
            <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-white/35 sm:hidden" />
            <div className="flex max-h-[90vh] flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Quick brief</p>
                  <h3 className="mt-1 text-xl font-black tracking-tight text-foreground">{device.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="focus-ring rounded-full border border-t-light-gray bg-surface px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
                >
                  Close
                </button>
              </div>

              <div className="overflow-y-auto px-4 pb-5 pt-4 sm:px-6">
                <div className="rounded-[1.75rem] glass-reading-strong p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <DeviceImageSlot
                      device={device}
                      className="h-36 w-36 shrink-0 rounded-[1.75rem] border border-white/45 bg-white/96 p-4 shadow-sm sm:h-40 sm:w-40"
                      imageClassName="h-full w-full object-contain"
                      showBadge={false}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-t-magenta/20 bg-t-magenta/8 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">
                          {getAppealTypeLabel(summary.appealType)}
                        </span>
                        <span className="rounded-full border border-t-light-gray bg-surface px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
                          Released {device.released}
                        </span>
                      </div>
                      <p className="mt-3 text-lg font-black text-t-magenta">{formatDevicePrice(device)}</p>
                      <p className="mt-2 text-[13px] font-semibold leading-relaxed text-foreground">{summary.shortHook}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {summary.bestFit.slice(0, 2).map((fit) => (
                          <span
                            key={fit}
                            className="rounded-full border border-t-magenta/20 bg-t-magenta/8 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta"
                          >
                            {fit}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                        Listen for: {summary.listenFor[0] || 'customers who want the short version and a cleaner story.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {featureBriefs.map((brief) => (
                    <div key={`${device.name}-${brief.feature}`} className="rounded-[1.5rem] glass-reading-strong p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{brief.feature}</p>
                      <p className="mt-3 text-[9px] font-black uppercase tracking-[0.18em] text-t-muted">Why it matters</p>
                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{brief.benefit}</p>
                      <p className="mt-3 text-[9px] font-black uppercase tracking-[0.18em] text-t-muted">Use this for</p>
                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{brief.useCase}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-[1.5rem] glass-reading-strong p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">How to say it</p>
                  <p className="mt-2 text-[13px] font-bold leading-relaxed text-foreground">{summary.sayThis}</p>
                </div>

                <div className="mt-4 space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowDeals((current) => !current)}
                    className="focus-ring flex w-full items-center justify-between rounded-[1.5rem] glass-reading-strong px-4 py-3 text-left"
                    aria-expanded={showDeals}
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Deals this week</p>
                      <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
                        {weeklyPromos.length > 0 ? `${weeklyPromos.length} weekly promo matches for this device.` : 'No device-specific weekly deals surfaced right now.'}
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-t-muted transition-transform ${showDeals ? 'rotate-180' : ''}`} />
                  </button>

                  {showDeals && weeklyPromos.length > 0 ? (
                    <div className="space-y-2 rounded-[1.5rem] border border-success-border bg-success-surface p-4">
                      {weeklyPromos.map((promo) => (
                        <div key={promo.name} className="rounded-xl border border-success-border/60 bg-surface-elevated/80 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-success-foreground">{promo.name}</p>
                          <p className="mt-1 text-[11px] font-medium leading-relaxed text-success-foreground">{promo.details}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setShowCoaching((current) => !current)}
                    className="focus-ring flex w-full items-center justify-between rounded-[1.5rem] glass-reading-strong px-4 py-3 text-left"
                    aria-expanded={showCoaching}
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Need another angle?</p>
                      <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
                        Open the deeper coaching only if the caller wants more proof or another position.
                      </p>
                    </div>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-t-muted transition-transform ${showCoaching ? 'rotate-180' : ''}`} />
                  </button>

                  {showCoaching ? (
                    <div className="grid gap-3 pb-2 sm:grid-cols-2">
                      <div className="rounded-[1.5rem] border border-info-border bg-info-surface p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-info-foreground">Primary angle</p>
                        <p className="mt-2 text-[12px] font-bold text-info-foreground">{summary.primaryAngle.title}</p>
                        <p className="mt-2 text-[11px] font-medium leading-relaxed text-info-foreground">{summary.primaryAngle.proof}</p>
                      </div>
                      <div className="rounded-[1.5rem] border border-t-light-gray/60 bg-surface p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Listen for</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {summary.listenFor.slice(0, 4).map((cue) => (
                            <span
                              key={cue}
                              className="rounded-full border border-t-light-gray bg-surface-elevated px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray"
                            >
                              {cue}
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 text-[11px] font-medium leading-relaxed text-t-dark-gray">{summary.avoidIf}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


/** Detail panel for a single device */
export function DeviceDetail({
  device,
  weeklyData,
  ecosystemMatrix,
}: {
  device: Device;
  weeklyData: WeeklyUpdate | null;
  ecosystemMatrix?: EcosystemMatrix | null;
}) {
  const [showMore, setShowMore] = useState(false);
  const summary = useMemo(
    () => getDevicePositioningSummary(device, weeklyData, ecosystemMatrix),
    [device, weeklyData, ecosystemMatrix]
  );
  const weeklyPromos = weeklyData?.currentPromos.filter(p =>
    p.name.toLowerCase().includes(device.name.toLowerCase().split(' ')[0]) ||
    p.details.toLowerCase().includes(device.name.toLowerCase().split(' ')[0])
  ) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl glass-stage-quiet p-4 space-y-3"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1">{device.category}</p>
          <h3 className="text-sm font-black text-t-dark-gray">{device.name}</h3>
          <p className="text-[10px] text-t-dark-gray font-medium mt-0.5">{device.keySpecs}</p>
        </div>
        <div className="flex items-start gap-3 self-start sm:flex-col sm:items-end">
          <DeviceImageSlot
            device={device}
            className="h-20 w-20 rounded-2xl border border-t-light-gray/50 bg-t-light-gray/20 p-3 sm:h-24 sm:w-24"
            imageClassName="h-full max-h-16 w-full object-contain sm:max-h-20"
            badgeSize="sm"
          />
          <p className="text-lg font-black text-t-magenta">
            {typeof device.startingPrice === 'number' ? `$${device.startingPrice}` : device.startingPrice}
          </p>
        </div>
      </div>

      <div className="rounded-2xl glass-reading-strong p-4">
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-2 flex items-center gap-1.5">
          <MessageSquareQuote className="w-3 h-3" /> Say It Like This
        </p>
        <p className="text-sm font-bold leading-relaxed text-foreground">{summary.sayThis}</p>
        <p className="mt-2 text-[10px] font-medium text-t-muted">
          Open with the line, give one proof, then stop and listen.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-t-magenta/10 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-t-magenta">
          {getAppealTypeLabel(summary.appealType)}
        </span>
        {summary.bestFit.slice(0, 3).map(fit => (
          <span
            key={fit}
            className="rounded-full border border-t-light-gray bg-t-light-gray/20 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-t-dark-gray"
          >
            {fit}
          </span>
        ))}
      </div>

      {weeklyPromos.length > 0 && (
        <div className="rounded-xl border border-success-border bg-success-surface p-3 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-widest text-success-foreground flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" /> This Week's Deals ({weeklyPromos.length})
          </p>
          {weeklyPromos.map((promo, i) => (
            <div key={i} className="rounded-lg bg-surface-elevated border border-success-border/50 p-2.5 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-wide text-success-foreground">{promo.name}</p>
              <p className="text-[11px] text-success-foreground/80 font-medium leading-relaxed">{promo.details}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        <CoachPanel
          title="Primary Angle"
          icon={<Sparkles className="w-3 h-3" />}
          tone="info"
        >
          <p className="text-[11px] font-black text-info-foreground">{summary.primaryAngle.title}</p>
          <p className="mt-2 text-[11px] font-medium leading-relaxed text-info-foreground">{summary.primaryAngle.why}</p>
          <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-info-foreground">Proof</p>
          <p className="mt-1 text-[10px] font-medium leading-snug text-info-foreground">{summary.primaryAngle.proof}</p>
        </CoachPanel>

        <CoachPanel
          title="Call Fit"
          icon={<Ear className="w-3 h-3" />}
          tone="neutral"
        >
          <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-2">Listen For</p>
          <div className="flex flex-wrap gap-2">
            {summary.listenFor.map(cue => (
              <span
                key={cue}
                className="rounded-xl border border-t-light-gray bg-surface-elevated px-2 py-1 text-[10px] font-bold text-t-dark-gray"
              >
                {cue}
              </span>
            ))}
          </div>

          <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mt-4 mb-2">
            Best Fit
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.bestFit.map(fit => (
              <span
                key={fit}
                className="rounded-full bg-t-magenta/8 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-t-magenta"
              >
                {fit}
              </span>
            ))}
          </div>

          <p className="mt-4 text-[10px] font-medium leading-relaxed text-t-dark-gray">
            {summary.leadWith}
          </p>
        </CoachPanel>
      </div>

      <CoachPanel
        title="One Proof Line"
        icon={<Lightbulb className="w-3 h-3" />}
        tone="neutral"
      >
        <div className="space-y-1.5">
          <SellingPoint text={`Released ${device.released}`} />
          {summary.proofPoints.map(point => (
            <SellingPoint key={point} text={point} />
          ))}
          {(device.category === 'watch' || device.category === 'tablet') && (
            <SellingPoint text={`Connected line: $${device.category === 'watch' ? CONNECTED_DEVICE_INFO.plans.wearableLine.price : CONNECTED_DEVICE_INFO.plans.tabletLine.price}/mo`} />
          )}
          {['iphone', 'samsung', 'pixel'].includes(device.category) && (
            <SellingPoint text="Trade-in: We accept devices in any condition — up to $1,100 credit." />
          )}
        </div>
      </CoachPanel>

      <DisclosureButton expanded={showMore} onToggle={() => setShowMore(prev => !prev)} />

      <AnimatePresence initial={false}>
        {showMore && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 md:grid-cols-2 pt-1">
              {summary.backupAngle && (
                <CoachPanel
                  title="Backup Angle"
                  icon={<ArrowRightLeft className="w-3 h-3" />}
                  tone="warning"
                >
                  <p className="text-[11px] font-black text-warning-foreground">{summary.backupAngle.title}</p>
                  <p className="mt-2 text-[11px] font-medium leading-relaxed text-warning-foreground">
                    {summary.backupAngle.script}
                  </p>
                  <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-warning-foreground">Why It Still Works</p>
                  <p className="mt-1 text-[10px] font-medium leading-snug text-warning-foreground">
                    {summary.backupAngle.why}
                  </p>
                </CoachPanel>
              )}

              <CoachPanel
                title="Tone + Guardrails"
                icon={<Users className="w-3 h-3" />}
                tone="neutral"
              >
                {summary.demoAngles[0] && (
                  <div className="rounded-xl border border-t-light-gray bg-t-light-gray/10 p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">
                      Why {summary.demoAngles[0].label} callers respond
                    </p>
                    <p className="mt-2 text-[10px] font-medium leading-snug text-t-dark-gray">
                      {summary.demoAngles[0].whyThisDemoResponds}
                    </p>
                  </div>
                )}

                {summary.trustLanguage.length > 0 && (
                  <p className="mt-3 text-[9px] font-bold text-success-foreground">
                    Lead with: <span className="font-medium text-t-dark-gray">{summary.trustLanguage.join(' • ')}</span>
                  </p>
                )}
                {summary.avoidLanguage.length > 0 && (
                  <p className="mt-1 text-[9px] font-bold text-error-foreground">
                    Avoid: <span className="font-medium text-t-dark-gray">{summary.avoidLanguage.join(' • ')}</span>
                  </p>
                )}
                <p className="mt-3 text-[10px] font-medium leading-relaxed text-t-dark-gray">
                  {summary.avoidIf}
                </p>
              </CoachPanel>

              {summary.featureTranslations.length > 0 && (
                <CoachPanel
                  title="Translate The Tech"
                  icon={<Sparkles className="w-3 h-3" />}
                  tone="warning"
                >
                  <div className="space-y-2">
                    {summary.featureTranslations.map((translation) => (
                      <div key={translation.feature} className="rounded-xl border border-warning-border bg-surface-elevated p-3">
                        <p className="text-[9px] font-black uppercase tracking-wider text-warning-foreground">{translation.feature}</p>
                        <p className="mt-1 text-[10px] font-medium leading-snug text-t-dark-gray">{translation.benefit}</p>
                      </div>
                    ))}
                  </div>
                </CoachPanel>
              )}

              <CoachPanel
                title="Why It Works"
                icon={<Users className="w-3 h-3" />}
                tone="success"
              >
                <p className="text-[10px] font-medium leading-relaxed text-success-foreground">{summary.callerMindset}</p>
                <p className="mt-3 text-[10px] font-medium leading-relaxed text-success-foreground">{summary.whyItLands}</p>
              </CoachPanel>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function DeviceImageSlot({
  device,
  className,
  imageClassName,
  placeholderLabel = 'No image',
  showBadge = true,
  badgeSize = 'md',
}: {
  device: Device;
  className: string;
  imageClassName: string;
  placeholderLabel?: string;
  showBadge?: boolean;
  badgeSize?: 'sm' | 'md' | 'lg';
}) {
  return (
    <DeviceImage
      device={device}
      className={className}
      imageClassName={imageClassName}
      placeholderLabel={placeholderLabel}
      showBadge={showBadge}
      badgeSize={badgeSize}
    />
  );
}

function DisclosureButton({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="focus-ring flex w-full items-center justify-between rounded-2xl border border-t-light-gray bg-surface px-4 py-3 text-left transition-colors hover:border-t-magenta/40"
    >
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta">
          {expanded ? 'Keep It Simple' : 'Need Another Angle?'}
        </p>
        <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
          {expanded
            ? 'Collapse the extra coaching and stay on the fast version.'
            : 'Open backup language, tone guidance, and tech translation only if you need it.'}
        </p>
      </div>
      <ChevronDown className={`w-4 h-4 shrink-0 text-t-muted transition-transform ${expanded ? 'rotate-180' : ''}`} />
    </button>
  );
}

function CoachPanel({
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
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <p className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

function SellingPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-t-magenta mt-1.5 shrink-0" />
      <p className="text-[11px] text-t-dark-gray font-medium">{text}</p>
    </div>
  );
}
