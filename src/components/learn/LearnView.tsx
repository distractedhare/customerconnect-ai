import { useState, useCallback, useEffect, useRef, lazy, Suspense, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Newspaper, Smartphone, BookOpen, Shield, Watch, Tablet, Headphones, Wifi, Crown, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { WeeklyUpdate } from '../../services/weeklyUpdateSchema';
import { WeeklyUpdateSource } from '../../services/localGenerationService';
import { getAppealTypeLabel, getDevicePositioningSummary } from '../../services/positioningService';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, Device } from '../../data/devices';
import { EcosystemMatrix } from '../../types/ecosystem';
import DailyBriefing from '../DailyBriefing';
import DeviceLookup, {
  type DevicePreset,
  DeviceLineupHero,
  DeviceQuickBriefSheet,
  buildLineupNarrative,
  buildLineupRoles,
  getDevicesByNames,
  PHONE_PRESETS,
  TABLET_PRESETS,
  WATCH_PRESETS,
  normalizeCompareSet,
} from '../DeviceLookup';
import { DeviceComparison } from '../DeviceComparison';
import AccessoryPitchBuilder from '../AccessoryPitchBuilder';
import AccessoriesReference from '../AccessoriesReference';
import DeviceImage from '../DeviceImage';
const PlaybookSection = lazy(() => import('./PlaybookSection'));
const EdgeSection = lazy(() => import('./EdgeSection'));
const HomeInternetSection = lazy(() => import('./HomeInternetSection'));
const PlansSection = lazy(() => import('./PlansSection'));
import { learnCopy } from './learnCopy';
import LearnSectionHeader from './LearnSectionHeader';
import { KipCoachNote } from '../kip';
import { buildLearnKipNote } from '../../services/kip/kipRules';

type LearnTab = 'briefing' | 'devices' | 'plans' | 'homeinternet' | 'playbook' | 'edge';
type DeviceCategory = 'phones' | 'tablets' | 'wearables' | 'accessories';

interface LearnViewProps {
  weeklyData: WeeklyUpdate | null;
  weeklySource: WeeklyUpdateSource;
  ecosystemMatrix?: EcosystemMatrix | null;
  onDataUpdate: () => void;
}

const TABS: { id: LearnTab; icon: typeof Newspaper; label: string }[] = [
  { id: 'briefing', icon: Newspaper, label: 'Briefing' },
  { id: 'devices', icon: Smartphone, label: 'Devices' },
  { id: 'plans', icon: Crown, label: 'Plans' },
  { id: 'homeinternet', icon: Wifi, label: 'HINT' },
  { id: 'playbook', icon: BookOpen, label: 'Playbook' },
  { id: 'edge', icon: Shield, label: 'Edge' },
];

const LEARN_PHONE_POOL = PHONES;

const DEVICE_CATEGORIES: { id: DeviceCategory; icon: typeof Smartphone; label: string; helper: string; shellTitle: string; shellDescription: string }[] = [
  {
    id: 'phones',
    icon: Smartphone,
    label: 'Phones',
    helper: 'Flagships, value picks, and switcher-ready phones.',
    shellTitle: 'Phone Selector',
    shellDescription: 'Keep the shortlist tight, compare the strongest fits, and move into the story fast.',
  },
  {
    id: 'tablets',
    icon: Tablet,
    label: 'Tablets',
    helper: 'Screen size, battery life, and family-fit tablets.',
    shellTitle: 'Tablet Selector',
    shellDescription: 'Use this lane for iPad and Galaxy Tab conversations without burying the customer in specs.',
  },
  {
    id: 'wearables',
    icon: Watch,
    label: 'Watches + IoT',
    helper: 'Watches, rings, hotspots, trackers, and kids\' wearables.',
    shellTitle: 'Wearables + Connected Selector',
    shellDescription: 'This view covers watches and connected add-ons, including trackers, hotspots, and kids\' devices.',
  },
  {
    id: 'accessories',
    icon: Headphones,
    label: 'Accessories',
    helper: 'Fast attach-ready add-ons by outcome or name.',
    shellTitle: 'Accessory Reference',
    shellDescription: 'Search by accessory name or outcome, then grab one clean bundle story instead of listing options.',
  },
];

const PHONE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'iphone', label: 'iPhone' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'pixel', label: 'Pixel' },
  { id: 'other', label: 'Other' },
];

const TABLET_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'apple', label: 'Apple' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'other', label: 'Other' },
];

const WEARABLE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'apple', label: 'Apple' },
  { id: 'samsung', label: 'Samsung' },
  { id: 'google', label: 'Google' },
  { id: 'connected', label: 'Connected' },
  { id: 'other', label: 'Other' },
];

const INITIAL_COMPARE_INDEX_BY_CATEGORY: Record<DeviceCategory, number> = {
  phones: 0,
  tablets: 0,
  wearables: 0,
  accessories: 0,
};

const INITIAL_PRESET_BY_CATEGORY: Record<DeviceCategory, DevicePreset | null> = {
  phones: null,
  tablets: null,
  wearables: null,
  accessories: null,
};

const INITIAL_COMPARE_SET_BY_CATEGORY: Record<DeviceCategory, string[]> = {
  phones: [],
  tablets: [],
  wearables: [],
  accessories: [],
};

const INITIAL_BROWSE_OPEN_BY_CATEGORY: Record<DeviceCategory, boolean> = {
  phones: true,
  tablets: true,
  wearables: true,
  accessories: true,
};

const INITIAL_LAUNCHPAD_HELP_BY_CATEGORY: Record<DeviceCategory, boolean> = {
  phones: false,
  tablets: false,
  wearables: false,
  accessories: false,
};

const clampCompareIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  return Math.min(index, length - 1);
};

const orderedNamesMatch = (left: string[], right: string[]) =>
  left.length === right.length && left.every((name, index) => name === right[index]);

const getOrderedDevices = (selectedDevices: Device[], orderedNames: string[]) =>
  orderedNames
    .map((name) => selectedDevices.find((device) => device.name === name))
    .filter(Boolean) as Device[];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const toDevicePriceValue = (device: Device) =>
  typeof device.startingPrice === 'number' ? device.startingPrice : Number.parseFloat(String(device.startingPrice).replace(/[^0-9.]/g, ''));

const formatPresetPriceRange = (devices: Device[]) => {
  const prices = devices
    .map((device) => toDevicePriceValue(device))
    .filter((value) => Number.isFinite(value)) as number[];

  if (prices.length === 0) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  if (min === max) return currencyFormatter.format(min);
  return `${currencyFormatter.format(min)} - ${currencyFormatter.format(max)}`;
};

const formatPresetDevicePrice = (device: Device) => {
  const priceValue = toDevicePriceValue(device);
  return Number.isFinite(priceValue) ? currencyFormatter.format(priceValue) : String(device.startingPrice);
};

const getLeadSentence = (copy: string) => {
  const trimmed = copy.trim();
  if (!trimmed) return '';
  const punctuationIndex = trimmed.search(/[.!?](\s|$)/);
  if (punctuationIndex === -1) return trimmed;
  return trimmed.slice(0, punctuationIndex + 1);
};

type PresetPreview = {
  devices: Device[];
  narrative: string;
  roleByName: Map<string, { label: string; helper: string }>;
  summaryByName: Map<string, ReturnType<typeof getDevicePositioningSummary>>;
};

const buildPresetPreview = (
  preset: DevicePreset,
  pool: Device[],
  weeklyData: WeeklyUpdate | null,
  ecosystemMatrix?: EcosystemMatrix | null
): PresetPreview => {
  const allowedNames = new Set(pool.map((device) => device.name));
  const devices = getDevicesByNames(preset.deviceNames).filter((device) => allowedNames.has(device.name));
  const summaryByName = new Map(
    devices.map((device) => [device.name, getDevicePositioningSummary(device, weeklyData, ecosystemMatrix)])
  );
  const lineupRoles = buildLineupRoles(devices, summaryByName);

  return {
    devices,
    narrative: buildLineupNarrative(lineupRoles),
    roleByName: new Map(lineupRoles.map((role) => [role.name, role])),
    summaryByName,
  };
};

export default function LearnView({ weeklyData, weeklySource, ecosystemMatrix, onDataUpdate }: LearnViewProps) {
  const [tab, setTab] = useState<LearnTab>('briefing');
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>('phones');
  const [showAccessoryPitch, setShowAccessoryPitch] = useState(false);
  const [briefingHelperOpen, setBriefingHelperOpen] = useState(false);
  const [compareOpenByCategory, setCompareOpenByCategory] = useState<Record<DeviceCategory, boolean>>({
    phones: false,
    tablets: false,
    wearables: false,
    accessories: false,
  });
  const [selectedDevicesByCategory, setSelectedDevicesByCategory] = useState<Record<DeviceCategory, Device[]>>({
    phones: [],
    tablets: [],
    wearables: [],
    accessories: [],
  });
  const [activeCompareIndexByCategory, setActiveCompareIndexByCategory] = useState<Record<DeviceCategory, number>>(INITIAL_COMPARE_INDEX_BY_CATEGORY);
  const [activePresetByCategory, setActivePresetByCategory] = useState<Record<DeviceCategory, DevicePreset | null>>(INITIAL_PRESET_BY_CATEGORY);
  const [compareSetByCategory, setCompareSetByCategory] = useState<Record<DeviceCategory, string[]>>(INITIAL_COMPARE_SET_BY_CATEGORY);
  const [browseOpenByCategory, setBrowseOpenByCategory] = useState<Record<DeviceCategory, boolean>>(INITIAL_BROWSE_OPEN_BY_CATEGORY);
  const [launchpadHelpOpenByCategory, setLaunchpadHelpOpenByCategory] = useState<Record<DeviceCategory, boolean>>(INITIAL_LAUNCHPAD_HELP_BY_CATEGORY);
  const [focusedDeviceName, setFocusedDeviceName] = useState<string | null>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<LearnTab, HTMLButtonElement | null>>({
    briefing: null,
    devices: null,
    plans: null,
    homeinternet: null,
    playbook: null,
    edge: null,
  });
  const deviceConfig = getDeviceConfig();
  const selectedDevices = selectedDevicesByCategory[deviceCategory];
  const briefingKipNote = buildLearnKipNote({ section: 'briefing' });
  const devicesKipNote = buildLearnKipNote({ section: 'devices' });
  const plansKipNote = buildLearnKipNote({ section: 'plans' });
  const homeInternetKipNote = buildLearnKipNote({ section: 'homeinternet' });
  const playbookKipNote = buildLearnKipNote({ section: 'playbook' });
  const edgeKipNote = buildLearnKipNote({ section: 'edge' });
  const compareDevices = getOrderedDevices(
    selectedDevices,
    normalizeCompareSet(selectedDevices.map((device) => device.name), compareSetByCategory[deviceCategory])
  );
  const activeCategoryMeta = DEVICE_CATEGORIES.find((category) => category.id === deviceCategory) ?? DEVICE_CATEGORIES[0];
  const compareOpen = compareOpenByCategory[deviceCategory];
  const activeCompareIndex = clampCompareIndex(activeCompareIndexByCategory[deviceCategory], compareDevices.length);
  const activeCompareDevice = compareDevices[activeCompareIndex] ?? null;
  const focusedDevice = selectedDevices.find((device) => device.name === focusedDeviceName) ?? null;
  const focusedDeviceSummary = focusedDevice
    ? getDevicePositioningSummary(focusedDevice, weeklyData, ecosystemMatrix)
    : null;
  const activePreset = activePresetByCategory[deviceCategory];
  const activeLineupLabel = (() => {
    if (selectedDevices.length < 2) return null;
    if (!activePreset) return 'Custom Shortlist';

    const allowedNames = activePreset.deviceNames.filter((name) => deviceConfig.pool.some((device) => device.name === name));
    const selectedNames = selectedDevices.map((device) => device.name);

    return orderedNamesMatch(allowedNames, selectedNames) ? activePreset.label : 'Custom Shortlist';
  })();
  const activeLineupKind = activePreset && activeLineupLabel === activePreset.label ? 'preset' : 'custom';
  const activeLineupHeroNote = activePreset && activeLineupLabel === activePreset.label ? activePreset.heroNote : undefined;
  const overflowLineupDevices = selectedDevices.filter((device) => !compareDevices.some((candidate) => candidate.name === device.name));
  const showLineupHero = selectedDevices.length >= 2;
  const panelSurfaceClassName = tab === 'devices'
    ? 'rounded-[2.25rem] p-4 sm:p-5 glass-stage glass-specular'
    : 'rounded-[2.25rem] p-4 sm:p-5 glass-stage-quiet';
  const briefingLead = getLeadSentence(learnCopy.hero.subtitle);

  useEffect(() => {
    setShowAccessoryPitch(false);
  }, [deviceCategory, compareOpen, selectedDevices.length]);

  useEffect(() => {
    if (focusedDeviceName && !selectedDevices.some((device) => device.name === focusedDeviceName)) {
      setFocusedDeviceName(null);
    }
  }, [focusedDeviceName, selectedDevices]);

  useEffect(() => {
    const selectedNames = selectedDevices.map((device) => device.name);
    setCompareSetByCategory((current) => {
      const normalized = normalizeCompareSet(selectedNames, current[deviceCategory]);
      if (orderedNamesMatch(normalized, current[deviceCategory])) {
        return current;
      }

      return {
        ...current,
        [deviceCategory]: normalized,
      };
    });
  }, [deviceCategory, selectedDevices]);

  const scrollToComparison = useCallback(() => {
    requestAnimationFrame(() => {
      comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const toggleDevice = useCallback((device: Device) => {
    const exists = selectedDevices.some((selected) => selected.name === device.name);
    const nextDevices = exists
      ? selectedDevices.filter((selected) => selected.name !== device.name)
      : selectedDevices.length >= 3
        ? selectedDevices
        : [...selectedDevices, device];
    const nextNames = nextDevices.map((selected) => selected.name);
    const nextCompareSet = normalizeCompareSet(nextNames, compareSetByCategory[deviceCategory]);

    setSelectedDevicesByCategory(prev => ({
      ...prev,
      [deviceCategory]: nextDevices,
    }));
    setCompareSetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextCompareSet,
    }));
    setActiveCompareIndexByCategory(prev => ({
      ...prev,
      [deviceCategory]: clampCompareIndex(prev[deviceCategory], nextCompareSet.length),
    }));
    setCompareOpenByCategory((current) => ({
      ...current,
      [deviceCategory]: current[deviceCategory] && nextCompareSet.length > 1,
    }));
    setBrowseOpenByCategory((current) => ({
      ...current,
      [deviceCategory]: nextDevices.length < 2,
    }));
    scrollToComparison();
  }, [compareSetByCategory, deviceCategory, scrollToComparison, selectedDevices]);

  const clearDevices = useCallback(() => {
    setSelectedDevicesByCategory(prev => ({
      ...prev,
      [deviceCategory]: [],
    }));
    setCompareSetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: [],
    }));
    setActiveCompareIndexByCategory(prev => ({
      ...prev,
      [deviceCategory]: 0,
    }));
    setCompareOpenByCategory(prev => ({
      ...prev,
      [deviceCategory]: false,
    }));
    setActivePresetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: null,
    }));
    setBrowseOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: true,
    }));
    setFocusedDeviceName(null);
  }, [deviceCategory]);

  const handlePresetSelect = useCallback((preset: DevicePreset) => {
    const allowedNames = new Set(deviceConfig.pool.map((device) => device.name));
    const nextDevices = getDevicesByNames(preset.deviceNames).filter((device) => allowedNames.has(device.name));
    const nextCompareSet = normalizeCompareSet(
      nextDevices.map((device) => device.name),
      nextDevices.slice(0, 3).map((device) => device.name)
    );

    setSelectedDevicesByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextDevices,
    }));
    setActivePresetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: preset,
    }));
    setCompareSetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextCompareSet,
    }));
    setActiveCompareIndexByCategory((prev) => ({
      ...prev,
      [deviceCategory]: 0,
    }));
    setCompareOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: false,
    }));
    setBrowseOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: false,
    }));
    setFocusedDeviceName(null);
  }, [deviceCategory, deviceConfig.pool]);

  const handleCompareSetSwap = useCallback((device: Device) => {
    const selectedNames = selectedDevices.map((selected) => selected.name);
    const currentSet = normalizeCompareSet(selectedNames, compareSetByCategory[deviceCategory]);

    if (currentSet.includes(device.name) || currentSet.length === 0) {
      return;
    }

    const activeName = compareDevices[activeCompareIndex]?.name;
    let replaceIndex = currentSet.length - 1;

    while (replaceIndex > 0 && currentSet[replaceIndex] === activeName) {
      replaceIndex -= 1;
    }

    const nextSet = [...currentSet];
    nextSet[replaceIndex] = device.name;

    setCompareSetByCategory((prev) => ({
      ...prev,
      [deviceCategory]: nextSet,
    }));
    setActiveCompareIndexByCategory((prev) => ({
      ...prev,
      [deviceCategory]: clampCompareIndex(prev[deviceCategory], nextSet.length),
    }));
  }, [activeCompareIndex, compareDevices, compareSetByCategory, deviceCategory, selectedDevices]);

  const handleBrowseExpandedChange = useCallback((expanded: boolean) => {
    setBrowseOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: expanded,
    }));
  }, [deviceCategory]);

  const handleInspectDevice = useCallback((device: Device) => {
    setFocusedDeviceName(device.name);

    const compareIndex = compareDevices.findIndex((candidate) => candidate.name === device.name);
    if (compareIndex === -1) return;

    setActiveCompareIndexByCategory((prev) => ({
      ...prev,
      [deviceCategory]: compareIndex,
    }));
  }, [compareDevices, deviceCategory]);

  // Switch device pool/presets/filters based on sub-category
  function getDeviceConfig() {
    const filterBy = (device: Device, filter: string) => {
      const name = device.name.toLowerCase();

      if (filter === 'all') {
        return true;
      }

      switch (deviceCategory) {
        case 'tablets':
          if (filter === 'apple') return name.includes('ipad') || name.includes('air') || name.includes('apple');
          if (filter === 'samsung') return name.includes('samsung');
          if (filter === 'other') return !name.includes('ipad') && !name.includes('samsung') && !name.includes('apple');
          return false;
        case 'wearables':
          if (filter === 'apple') return name.includes('apple');
          if (filter === 'samsung') return name.includes('samsung');
          if (filter === 'google') return name.includes('pixel') || name.includes('google');
          if (filter === 'connected') {
            return device.category === 'hotspot' || name.includes('syncup') || name.includes('franklin') || name.includes('tcl');
          }
          if (filter === 'other') {
            return !name.includes('apple') && !name.includes('samsung') && !name.includes('pixel') && !name.includes('google') && device.category !== 'hotspot' && !name.includes('syncup') && !name.includes('franklin') && !name.includes('tcl');
          }
          return false;
        default:
          return true;
      }
    };

    switch (deviceCategory) {
      case 'phones':
        return { pool: LEARN_PHONE_POOL, presets: PHONE_PRESETS, filters: PHONE_FILTERS };
      case 'tablets':
        return { pool: TABLETS, presets: TABLET_PRESETS, filters: TABLET_FILTERS, filterBy };
      case 'wearables':
        return { pool: [...WATCHES, ...HOTSPOTS], presets: WATCH_PRESETS, filters: WEARABLE_FILTERS, filterBy, defaultSort: 'price' as const };
      default:
        return { pool: LEARN_PHONE_POOL, presets: PHONE_PRESETS, filters: PHONE_FILTERS };
    }
  }

  const handleOpenCompare = useCallback(() => {
    setCompareOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: true,
    }));
    scrollToComparison();
  }, [deviceCategory, scrollToComparison]);

  const handleCloseCompare = useCallback(() => {
    setCompareOpenByCategory((prev) => ({
      ...prev,
      [deviceCategory]: false,
    }));
  }, [deviceCategory]);

  const handleActiveCompareIndexChange = useCallback((index: number) => {
    setActiveCompareIndexByCategory((prev) => ({
      ...prev,
      [deviceCategory]: clampCompareIndex(index, selectedDevices.length),
    }));
  }, [deviceCategory, selectedDevices.length]);

  const handleTabKeyDown = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>, currentTab: LearnTab) => {
    const currentIndex = TABS.findIndex((item) => item.id === currentTab);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = (currentIndex + 1) % TABS.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = TABS.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextTab = TABS[nextIndex].id;
    setTab(nextTab);
    requestAnimationFrame(() => {
      tabRefs.current[nextTab]?.focus();
    });
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-4 2xl:max-w-6xl">
      {tab === 'briefing' ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2rem] px-4 py-4 sm:rounded-[2.5rem] sm:px-6 sm:py-6 md:px-8 md:py-8 glass-billboard"
        >
          <div className="relative z-10 space-y-4 sm:space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass-utility px-3 py-1.5">
                <Sparkles className="h-3 w-3 text-t-magenta" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground dark:text-white">
                  {learnCopy.hero.badge}
                </p>
              </div>
              <h2 className="mt-3 max-w-3xl text-[2rem] font-black leading-none tracking-tight text-foreground dark:text-white sm:mt-4 sm:text-4xl lg:text-5xl">
                {learnCopy.hero.title}
              </h2>
              <p className="mt-2 max-w-2xl text-[12px] font-medium leading-relaxed text-t-dark-gray dark:text-white/82 sm:hidden">
                {briefingLead}
              </p>
              <p className="mt-3 hidden max-w-2xl text-sm font-medium leading-relaxed text-t-dark-gray dark:text-white/82 sm:block md:text-base">
                {learnCopy.hero.subtitle}
              </p>
              <div className="-mx-1 mt-4 mobile-rail px-1 pb-1 sm:mx-0 sm:mt-6 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
                <div className="rail-snap-start min-w-[11.25rem] rounded-2xl glass-utility px-4 py-3 sm:min-w-0">
                  <div className="flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-t-magenta" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-foreground dark:text-white">Daily Briefing</p>
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-t-dark-gray dark:text-white/72">{learnCopy.hero.cards[0].subtitle}</p>
                </div>
                <div className="rail-snap-start min-w-[11.25rem] rounded-2xl glass-utility px-4 py-3 sm:min-w-0">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-t-magenta" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-foreground dark:text-white">Device Lab</p>
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-t-dark-gray dark:text-white/72">{learnCopy.hero.cards[1].subtitle}</p>
                </div>
                <div className="rail-snap-start min-w-[11.25rem] rounded-2xl glass-utility px-4 py-3 sm:min-w-0">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-t-magenta" />
                    <p className="text-[10px] font-black uppercase tracking-wider text-foreground dark:text-white">{learnCopy.hero.cards[2].title}</p>
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-t-dark-gray dark:text-white/72">{learnCopy.hero.cards[2].subtitle}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] glass-control p-3.5 sm:p-4">
              <div className="hidden flex-col gap-3 sm:flex lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-t-magenta">
                    {learnCopy.onClockPanel.title}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold leading-relaxed text-foreground dark:text-white/92">
                    Use Learn like a live billboard, then move fast.
                  </p>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray dark:text-white/74">
                    {learnCopy.onClockPanel.description}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[40rem]">
                  {[
                    'Start with what is live right now.',
                    'Move into Devices once the call needs a winner.',
                    'Use Plans or HINT only when the customer gives you the lane.',
                  ].map((rule) => (
                    <div key={rule} className="rounded-[1.1rem] glass-reading px-3 py-2">
                      <p className="text-[10px] font-bold leading-relaxed text-foreground dark:text-white/88">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sm:hidden">
                <button
                  type="button"
                  onClick={() => setBriefingHelperOpen((current) => !current)}
                  className="focus-ring flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={briefingHelperOpen}
                >
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-t-magenta">
                      {learnCopy.onClockPanel.title}
                    </p>
                    <p className="mt-1 text-[12px] font-semibold leading-relaxed text-foreground dark:text-white/92">
                      Use Learn like a live billboard, then move fast.
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full glass-control text-t-magenta">
                    {briefingHelperOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {briefingHelperOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="mt-3 space-y-3"
                  >
                    <p className="text-[11px] font-medium leading-relaxed text-t-dark-gray dark:text-white/74">
                      {learnCopy.onClockPanel.description}
                    </p>
                    <div className="-mx-1 mobile-rail px-1 pb-1">
                      {[
                        'Start with what is live right now.',
                        'Move into Devices once the call needs a winner.',
                        'Use Plans or HINT only when the customer gives you the lane.',
                      ].map((rule) => (
                        <div key={rule} className="rail-snap-start min-w-[14rem] rounded-[1.1rem] glass-reading px-3 py-2">
                          <p className="text-[10px] font-bold leading-relaxed text-foreground dark:text-white/88">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      <div className="sticky sticky-under-header z-10 -mx-1 rounded-[1.5rem] p-1.5 glass-stage-quiet glass-specular sm:static sm:mx-0" role="tablist" aria-label="Learn sections">
        <div className="mobile-rail px-1 pb-1 sm:grid sm:grid-cols-3 sm:gap-1.5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-6">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              id={`learn-tab-${t.id}`}
              ref={(node) => {
                tabRefs.current[t.id] = node;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`learn-panel-${t.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(event) => handleTabKeyDown(event, t.id)}
              className={`focus-ring rail-snap-start flex min-h-[48px] min-w-[118px] items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all sm:min-w-0 sm:px-2 md:text-xs ${
                isActive
                  ? 'glass-control-active'
                  : 'glass-control text-t-dark-gray hover:text-t-dark-gray'
              }`}
            >
              <t.icon className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
              <span className="leading-tight">{t.label}</span>
            </button>
          );
        })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.section
          key={tab}
          id={`learn-panel-${tab}`}
          role="tabpanel"
          aria-labelledby={`learn-tab-${tab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className={`space-y-4 ${panelSurfaceClassName}`}
        >
          {tab === 'briefing' && (
            <>
              <div
                className="relative overflow-hidden rounded-[1.85rem] p-5 sm:p-6"
                style={{
                  background:
                    'radial-gradient(ellipse at top left, rgba(226,0,116,0.18), transparent 55%), linear-gradient(180deg, rgba(226,0,116,0.08), rgba(0,0,0,0.04))',
                  border: '1px solid rgba(226,0,116,0.22)',
                }}
              >
                <div className="flex items-start gap-4 sm:gap-5">
                  <div
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] bg-t-magenta text-white shadow-[0_22px_44px_-22px_rgba(226,0,116,0.95)] sm:h-16 sm:w-16 sm:rounded-[1.4rem]"
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_42%)]" />
                    <Newspaper className="relative h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-t-magenta">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-t-magenta" />
                      Kip · {briefingKipNote.headline}
                    </p>
                    <p className="mt-2 text-base font-black leading-snug text-foreground sm:text-lg">
                      The one thing this week
                    </p>
                    <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-t-dark-gray sm:text-sm">
                      {briefingKipNote.body}
                    </p>
                  </div>
                </div>
              </div>
              <DailyBriefing weeklyData={weeklyData} weeklySource={weeklySource} onDataUpdate={onDataUpdate} />
            </>
          )}

          {tab === 'devices' && (
            <div className="space-y-4">
              <div className="rounded-[1.5rem] p-3 glass-stage-quiet sm:hidden">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-2xl glass-control text-t-magenta">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-t-magenta">Device Lab</p>
                    </div>
                    <h2 className="mt-2 text-[1.35rem] font-black tracking-tight text-foreground">
                      Compare fast. Pick a winner.
                    </h2>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                      Keep the shortlist tight, then move into the attach story only after the winner feels obvious.
                    </p>
                  </div>
                  <span className="rounded-full glass-control px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
                    2-3 max
                  </span>
                </div>
              </div>

              <div className="hidden sm:block">
                <LearnSectionHeader
                  eyebrow="Device Lab"
                  title="Compare fast. Pick a winner. Pitch the right add-ons."
                  description="This is the glamorous workbench: keep the shortlist tight, move into a winner fast, and only open the attach story once the device decision feels obvious."
                  icon={<Smartphone className="h-4 w-4" />}
                  chips={['Compare & pitch', 'Winner-driven attach', '2-3 device max']}
                  variant="compact"
                />
              </div>

              <KipCoachNote note={devicesKipNote} />

              <div className="-mx-1 mobile-rail px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0 lg:pb-0">
                {DEVICE_CATEGORIES.map((category) => {
                  const isActive = deviceCategory === category.id;
                  const selectionCount = selectedDevicesByCategory[category.id].length;

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setDeviceCategory(category.id);
                      }}
                      aria-pressed={isActive}
                      className={`focus-ring rail-snap-start min-w-[132px] rounded-[1.4rem] p-3 text-left transition-all lg:min-w-0 lg:rounded-[1.55rem] ${
                        isActive
                          ? 'glass-control-active shadow-sm shadow-t-magenta/12'
                          : 'glass-control text-t-dark-gray hover:border-t-magenta/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-2xl lg:h-9 lg:w-9 ${
                            isActive ? 'bg-white/18 text-white' : 'bg-surface-elevated text-t-magenta'
                          }`}>
                            <category.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className={`truncate text-[10px] font-black uppercase tracking-wider ${
                              isActive ? 'text-white' : 'text-t-dark-gray'
                            }`}>
                              {category.label}
                            </p>
                            <p className={`mt-1 hidden text-[10px] font-medium leading-snug sm:block ${
                              isActive ? 'text-white/82' : 'text-t-muted'
                            }`}>
                              {category.helper}
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                          isActive
                            ? 'bg-white/18 text-white'
                            : selectionCount > 0
                              ? 'bg-t-magenta/10 text-t-magenta'
                              : 'bg-t-light-gray/40 text-t-muted'
                        }`}>
                          {selectionCount}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {deviceCategory !== 'accessories' ? (
                <>
                  <div className="rounded-[2rem] p-4 sm:p-5 glass-stage-quiet glass-specular">
                    {showLineupHero && activeLineupLabel ? (
                      <DeviceLineupHero
                        label={activeLineupLabel}
                        kind={activeLineupKind}
                        devices={selectedDevices}
                        compareDevices={compareDevices}
                        overflowDevices={overflowLineupDevices}
                        weeklyData={weeklyData}
                        ecosystemMatrix={ecosystemMatrix}
                        compareOpen={compareOpen}
                        heroNote={activeLineupHeroNote}
                        layoutMode="showcase"
                        onOpenCompare={handleOpenCompare}
                        onReset={clearDevices}
                        onInspectDevice={handleInspectDevice}
                        onSwapCompareDevice={handleCompareSetSwap}
                        onBrowseAll={() => handleBrowseExpandedChange(true)}
                      />
                    ) : (
                      <div className="space-y-4 sm:space-y-5">
                        <div className="hidden flex-col gap-3 sm:flex lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-3xl">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">{activeCategoryMeta.shellTitle}</p>
                            <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">Compare Launchpad</h3>
                            <p className="mt-2 max-w-3xl text-[13px] font-medium leading-relaxed text-t-dark-gray">
                              {activeCategoryMeta.shellDescription}
                            </p>
                          </div>
                          <div className="grid gap-2 rounded-[1.45rem] glass-reading p-3 sm:grid-cols-2 lg:max-w-md">
                            {learnCopy.devices.fastCallRules.slice(0, 2).map((rule, index) => (
                              <div key={rule} className="glass-reading rounded-[1.1rem] px-3 py-2">
                                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">
                                  Fast rule {index + 1}
                                </p>
                                <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{rule}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="sm:hidden">
                          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">{activeCategoryMeta.shellTitle}</p>
                          <div className="mt-2 flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="text-[1.4rem] font-black tracking-tight text-foreground">Compare Launchpad</h3>
                              <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                                Load a lineup fast, keep the photos visible, and only widen the compare when the caller needs it.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setLaunchpadHelpOpenByCategory((current) => ({
                                ...current,
                                [deviceCategory]: !current[deviceCategory],
                              }))}
                              className="focus-ring inline-flex shrink-0 items-center gap-1 rounded-full glass-control px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray"
                              aria-expanded={launchpadHelpOpenByCategory[deviceCategory]}
                            >
                              How to use this
                              {launchpadHelpOpenByCategory[deviceCategory] ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          </div>

                          {launchpadHelpOpenByCategory[deviceCategory] ? (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.18, ease: 'easeOut' }}
                              className="mt-3 rounded-[1.4rem] glass-reading p-3"
                            >
                              <p className="text-[11px] font-medium leading-relaxed text-t-dark-gray">
                                {activeCategoryMeta.shellDescription}
                              </p>
                              <div className="mt-3 space-y-2">
                                {learnCopy.devices.fastCallRules.slice(0, 2).map((rule, index) => (
                                  <div key={rule} className="rounded-[1rem] glass-reading px-3 py-2">
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">
                                      Fast rule {index + 1}
                                    </p>
                                    <p className="mt-1 text-[10px] font-medium leading-relaxed text-t-dark-gray">{rule}</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ) : null}
                        </div>

                        <div className="-mx-1 mobile-rail px-1 pb-1 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0">
                          {deviceConfig.presets.map((preset) => {
                            const presetPreview = buildPresetPreview(preset, deviceConfig.pool, weeklyData, ecosystemMatrix);
                            const { devices: presetDevices, narrative, roleByName, summaryByName } = presetPreview;
                            const isActivePreset = activePreset?.label === preset.label && activeLineupLabel === preset.label;
                            const priceRange = formatPresetPriceRange(presetDevices);

                            return (
                              <button
                                key={preset.label}
                                type="button"
                                onClick={() => handlePresetSelect(preset)}
                                className={`group focus-ring rail-snap-start min-w-[min(86vw,22rem)] overflow-hidden rounded-[1.8rem] p-4 text-left transition-all lg:min-w-0 lg:rounded-[2rem] ${
                                  isActivePreset
                                    ? 'glass-stage shadow-lg shadow-t-magenta/10'
                                    : 'glass-control hover:-translate-y-0.5'
                                }`}
                              >
                                <div className="relative">
                                  <div className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-[1.6rem] bg-[radial-gradient(circle_at_top_left,rgba(226,0,116,0.18),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(134,27,84,0.14),transparent_62%)]" />
                                  <div className="relative">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-full glass-reading px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
                                        Preset lineup
                                      </span>
                                      <span className="rounded-full glass-reading px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
                                        {presetDevices.length} in lane
                                      </span>
                                      {preset.primary ? (
                                        <span className="rounded-full bg-t-magenta px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white">
                                          Lead preset
                                        </span>
                                      ) : null}
                                      {priceRange ? (
                                        <span className="glass-magenta rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
                                          {priceRange}
                                        </span>
                                      ) : null}
                                    </div>

                                    <div className="mt-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                                          preset.primary ? 'bg-t-magenta text-white' : 'bg-t-light-gray/40 text-t-magenta'
                                        }`}>
                                          {preset.icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-black text-foreground">{preset.label}</p>
                                          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-t-dark-gray">
                                            {preset.heroNote ?? preset.subtitle}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="mt-3 flex items-center justify-between gap-2">
                                        <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${
                                          isActivePreset
                                            ? 'bg-t-magenta text-white'
                                            : 'glass-reading text-t-dark-gray'
                                        }`}>
                                          {isActivePreset ? 'Loaded now' : 'Load lineup'}
                                        </span>
                                        {priceRange ? (
                                          <span className="glass-magenta rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
                                            {priceRange}
                                          </span>
                                        ) : null}
                                      </div>
                                      <p className="mt-3 hidden max-w-2xl text-[11px] font-medium leading-relaxed text-t-dark-gray lg:block">
                                        {narrative}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-2">
                                  {presetDevices.slice(0, 3).map((device) => {
                                    const summary = summaryByName.get(device.name);
                                    const role = roleByName.get(device.name);
                                    const cue = summary?.bestFit[0] || role?.helper || 'Use one clear angle and move fast.';

                                    return (
                                      <div key={device.name} className="rounded-[1.35rem] glass-reading-strong p-2.5">
                                        <div className="flex flex-wrap items-center justify-between gap-1">
                                          {role ? (
                                            <span className="rounded-full bg-t-magenta px-2 py-1 text-[7px] font-black uppercase tracking-[0.16em] text-white">
                                              {role.label}
                                            </span>
                                          ) : (
                                            <span className="rounded-full border border-t-light-gray bg-surface px-2 py-1 text-[7px] font-black uppercase tracking-[0.16em] text-t-dark-gray">
                                              Quick scan
                                            </span>
                                          )}
                                          <span className="rounded-full border border-t-magenta/20 bg-t-magenta/8 px-2 py-1 text-[7px] font-black uppercase tracking-[0.16em] text-t-magenta">
                                            {formatPresetDevicePrice(device)}
                                          </span>
                                        </div>
                                        <DeviceImage
                                          device={device}
                                          className="mt-2 h-16 w-full rounded-[1.05rem] border border-white/35 bg-white/92 p-2 shadow-sm sm:h-20 sm:rounded-[1.2rem] sm:p-2.5"
                                          imageClassName="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.04]"
                                          badgeSize="sm"
                                        />
                                        <p className="mt-2 text-[10px] font-black leading-tight text-foreground sm:text-[11px]">
                                          {device.name}
                                        </p>
                                        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-t-magenta">
                                          {summary ? getAppealTypeLabel(summary.appealType) : role?.helper || 'Photo preview'}
                                        </p>
                                        <p className="mt-1 text-[9px] font-medium leading-relaxed text-t-dark-gray sm:text-[10px]">
                                          {cue}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>

                                <div className="mt-4 rounded-[1.45rem] glass-reading p-3">
                                  <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Use this when</p>
                                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{preset.useWhen}</p>
                                </div>

                                <div className="mt-4 hidden gap-3 sm:grid">
                                  <div className="rounded-[1.5rem] glass-reading p-3.5">
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Lineup fit</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {presetDevices.map((device) => (
                                        <span
                                          key={device.name}
                                          className="rounded-full border border-t-light-gray bg-surface px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-t-dark-gray"
                                        >
                                          {device.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="rounded-[1.5rem] glass-reading p-3.5 lg:hidden">
                                    <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Lineup angle</p>
                                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{narrative}</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}

              {deviceCategory === 'accessories' ? (
                <div className="rounded-[2rem] p-4 sm:p-5 glass-stage-quiet">
                  <AccessoriesReference ecosystemMatrix={ecosystemMatrix} />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="lg:col-span-5">
                    <div className="rounded-[1.85rem] p-4 glass-stage-quiet">
                      <DeviceLookup
                        key={deviceCategory}
                        selectedDevices={selectedDevices}
                        onToggleDevice={toggleDevice}
                        onClearDevices={clearDevices}
                        onOpenCompare={handleOpenCompare}
                        compareOpen={compareOpen}
                        devicePool={deviceConfig.pool}
                        filters={deviceConfig.filters}
                        filterBy={deviceConfig.filterBy}
                        defaultSort={deviceConfig.defaultSort}
                        browseExpanded={browseOpenByCategory[deviceCategory]}
                        layoutEmphasis={showLineupHero ? 'secondary' : 'primary'}
                        onBrowseExpandedChange={handleBrowseExpandedChange}
                        onInspectDevice={handleInspectDevice}
                      />
                    </div>
                  </div>

                  <div ref={comparisonRef} className="space-y-6 scroll-target-under-chrome lg:col-span-7">
                    {selectedDevices.length > 0 ? (
                      <>
                        {!showLineupHero && !compareOpen ? (
                          <div className="rounded-[1.5rem] p-4 glass-stage-quiet">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">Shortlist ready</p>
                                <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                                  Add one or two alternates if the caller needs a cleaner side-by-side.
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {compareDevices.length > 1 ? (
                                  <button
                                    type="button"
                                    onClick={handleOpenCompare}
                                    className="focus-ring rounded-full glass-control-active px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white"
                                  >
                                    Open compare
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : compareOpen ? (
                          <div className="hidden justify-end sm:flex">
                            <button
                              type="button"
                              onClick={handleCloseCompare}
                              className="focus-ring rounded-full glass-control px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
                            >
                              Back to shortlist
                            </button>
                          </div>
                        ) : null}

                        {!compareOpen && showLineupHero && focusedDevice && focusedDeviceSummary ? (
                          <motion.div
                            key={`${focusedDevice.name}-focused-hero`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.18, ease: 'easeOut' }}
                            className="rounded-[1.7rem] p-4 glass-stage-quiet"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">Focused device</p>
                                  <span className="rounded-full glass-control px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-t-dark-gray">
                                    {formatPresetDevicePrice(focusedDevice)}
                                  </span>
                                </div>
                                <h3 className="mt-2 text-lg font-black tracking-tight text-t-dark-gray">{focusedDevice.name}</h3>
                                <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                                  {focusedDeviceSummary.sayThis}
                                </p>
                              </div>
                              <DeviceImage
                                device={focusedDevice}
                                className="h-20 w-20 shrink-0 rounded-[1.25rem] border border-t-light-gray/60 bg-white/90 p-2.5"
                                imageClassName="h-full w-full object-contain"
                                badgeSize="sm"
                              />
                            </div>

                            <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
                              <div className="rounded-[1.3rem] glass-reading p-3">
                                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Best fit cue</p>
                                <p className="mt-1 text-[11px] font-black text-t-dark-gray">
                                  {focusedDeviceSummary.bestFit[0] || getAppealTypeLabel(focusedDeviceSummary.appealType)}
                                </p>
                                <p className="mt-1 text-[10px] font-medium leading-relaxed text-t-dark-gray">
                                  {focusedDeviceSummary.primaryAngle.title}
                                </p>
                              </div>
                              <div className="rounded-[1.3rem] glass-reading p-3">
                                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Why it lands</p>
                                <p className="mt-1 text-[10px] font-medium leading-relaxed text-t-dark-gray">
                                  {focusedDeviceSummary.primaryAngle.proof}
                                </p>
                              </div>
                            </div>

                            <div className="mt-2 rounded-[1.3rem] glass-reading p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">Core specs</p>
                                {compareDevices.some((device) => device.name === focusedDevice.name) ? (
                                  <span className="rounded-full border border-t-magenta/25 bg-t-magenta/10 px-2 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-t-magenta">
                                    Compare hero synced
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-[10px] font-medium leading-relaxed text-t-dark-gray">
                                {focusedDevice.keySpecs}
                              </p>
                            </div>
                          </motion.div>
                        ) : null}

                        {compareOpen ? (
                          <DeviceComparison
                            devices={compareDevices}
                            weeklyData={weeklyData}
                            ecosystemMatrix={ecosystemMatrix}
                            activeIndex={activeCompareIndex}
                            onActiveIndexChange={handleActiveCompareIndexChange}
                          />
                        ) : null}

                        {compareOpen ? (
                          <div className="flex justify-end sm:hidden">
                            <button
                              type="button"
                              onClick={handleCloseCompare}
                              className="focus-ring rounded-full glass-control px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-colors hover:text-t-magenta"
                            >
                              Back to shortlist
                            </button>
                          </div>
                        ) : null}

                        {activeCompareDevice && (compareOpen || selectedDevices.length === 1) ? (
                          <div className="rounded-[1.5rem] p-3 glass-stage-quiet">
                            <button
                              type="button"
                              onClick={() => setShowAccessoryPitch((current) => !current)}
                              className="focus-ring flex w-full items-center justify-between gap-3 text-left"
                              aria-expanded={showAccessoryPitch}
                            >
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-t-magenta">Attach story</p>
                                  <motion.span
                                    key={activeCompareDevice.name}
                                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.18, ease: 'easeOut' }}
                                    className="rounded-full glass-control px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-t-dark-gray"
                                  >
                                    {activeCompareDevice.name}
                                  </motion.span>
                                </div>
                                <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">
                                  {showAccessoryPitch
                                    ? 'Close this when you are done so the compare view stays focused on the device decision.'
                                    : 'Open this after the winner is clear so accessories do not bury the device choice.'}
                                </p>
                              </div>
                              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full glass-control text-t-magenta">
                                {showAccessoryPitch ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </span>
                            </button>
                            {showAccessoryPitch ? (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="mt-3"
                              >
                                <AccessoryPitchBuilder device={activeCompareDevice} ecosystemMatrix={ecosystemMatrix} />
                              </motion.div>
                            ) : null}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-[2rem] border-dashed p-6 text-center glass-stage-quiet md:p-10">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated shadow-sm">
                          {deviceCategory === 'phones' && <Smartphone className="h-8 w-8 text-t-magenta" />}
                          {deviceCategory === 'tablets' && <Tablet className="h-8 w-8 text-t-magenta" />}
                          {deviceCategory === 'wearables' && <Watch className="h-8 w-8 text-t-magenta" />}
                        </div>
                        <h3 className="mb-2 text-xl font-black uppercase tracking-tight">
                          {deviceCategory === 'phones'
                            ? learnCopy.devices.fallbackHeading.phones
                            : deviceCategory === 'tablets'
                              ? learnCopy.devices.fallbackHeading.tablets
                              : learnCopy.devices.fallbackHeading.wearables}
                        </h3>
                        <p className="mx-auto max-w-xs text-sm font-medium text-t-dark-gray">
                          {deviceCategory === 'phones'
                            ? learnCopy.devices.fallbackCopy.phones
                            : deviceCategory === 'tablets'
                              ? learnCopy.devices.fallbackCopy.tablets
                              : learnCopy.devices.fallbackCopy.wearables}
                        </p>
                        <p className="mt-3 text-[10px] font-bold text-t-magenta">
                          {deviceCategory === 'phones'
                            ? learnCopy.devices.starterPrompts.phones
                            : deviceCategory === 'tablets'
                              ? learnCopy.devices.starterPrompts.tablets
                              : learnCopy.devices.starterPrompts.wearables}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <DeviceQuickBriefSheet
                device={focusedDevice}
                open={Boolean(focusedDevice)}
                weeklyData={weeklyData}
                ecosystemMatrix={ecosystemMatrix}
                onClose={() => setFocusedDeviceName(null)}
              />
            </div>
          )}

          {(tab === 'plans' || tab === 'homeinternet' || tab === 'playbook' || tab === 'edge') && (
            <div className="space-y-4">
              {tab === 'plans' && <KipCoachNote note={plansKipNote} />}
              {tab === 'homeinternet' && <KipCoachNote note={homeInternetKipNote} />}
              {tab === 'playbook' && <KipCoachNote note={playbookKipNote} />}
              {tab === 'edge' && <KipCoachNote note={edgeKipNote} />}
              <Suspense
                fallback={
                  <div className="rounded-[1.85rem] border border-t-light-gray/40 bg-surface-elevated/40 p-8 text-center text-xs font-black uppercase tracking-[0.18em] text-t-muted">
                    Loading…
                  </div>
                }
              >
                {tab === 'plans' && <PlansSection />}
                {tab === 'homeinternet' && <HomeInternetSection />}
                {tab === 'playbook' && <PlaybookSection />}
                {tab === 'edge' && <EdgeSection />}
              </Suspense>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
