import { AccessoryPitch } from '../data/accessoryPitches';
import { PROTECTION_360_COVERAGE, buildAccessoryRecommendations } from '../data/accessories';
import { BigAddItem, EssentialItem } from '../data/essentialAccessories';
import { CONNECTED_DEVICE_INFO, Device, ECOSYSTEM_HOOKS } from '../data/devices';
import { SalesContext } from '../types';
import { DemographicKey, EcosystemMatrix } from '../types/ecosystem';
import { WeeklyUpdate } from './weeklyUpdateSchema';

export type AppealType =
  | 'practical'
  | 'value'
  | 'convenience'
  | 'family'
  | 'productivity'
  | 'safety'
  | 'status'
  | 'cool-factor';

export type FitDriver =
  | 'budget'
  | 'simplicity'
  | 'safety'
  | 'convenience'
  | 'productivity'
  | 'entertainment'
  | 'identity'
  | 'social-status'
  | 'family-coordination'
  | 'travel-mobility'
  | 'heavy-usage';

export interface DemoCoachingAngle {
  demographic: DemographicKey;
  label: string;
  whyThisDemoResponds: string;
  trustLanguage: string[];
  avoidLanguage: string[];
}

export interface FeatureTranslation {
  feature: string;
  benefit: string;
}

export interface CoachingAngle {
  title: string;
  script: string;
  why: string;
  proof: string;
}

export interface PositioningSummary {
  sayThis: string;
  shortHook: string;
  whyItLands: string;
  bestFit: string[];
  appealType: AppealType;
  proofPoints: string[];
  featureTranslations: FeatureTranslation[];
  listenFor: string[];
  trustLanguage: string[];
  avoidLanguage: string[];
  demoAngles: DemoCoachingAngle[];
  primaryAngle: CoachingAngle;
  backupAngle?: CoachingAngle;
  callerMindset: string;
  leadWith: string;
  avoidIf: string;
}

interface AccessoryEvidence {
  whyTexts: string[];
  demoAngles: DemoCoachingAngle[];
}

interface DriverProfile {
  title: string;
  appealType: AppealType;
  mindset: string;
  leadWith: string;
  avoidIf: string;
  fitHints: string[];
  cues: string[];
}

const DEMOGRAPHIC_KEYS: DemographicKey[] = ['18-24', '25-34', '35-54', '55+'];
type DeviceDemoCategory = 'smartphones' | 'tablets' | 'wearables' | 'iotProducts';

const APPEAL_LABELS: Record<AppealType, string> = {
  practical: 'Practical',
  value: 'Value',
  convenience: 'Convenience',
  family: 'Family',
  productivity: 'Productivity',
  safety: 'Safety',
  status: 'Status',
  'cool-factor': 'Cool Factor',
};

const DRIVER_KEYWORDS: Record<FitDriver, RegExp[]> = {
  budget: [
    /\bbudget\b/i,
    /\bvalue\b/i,
    /\baffordable\b/i,
    /\baccessible\b/i,
    /\bdeal\b/i,
    /\bfree\b/i,
    /\bwithout the pro price\b/i,
    /\bwithout paying\b/i,
    /\bentry[- ]level\b/i,
  ],
  simplicity: [
    /\bsimple\b/i,
    /\beasy\b/i,
    /\bjust set\b/i,
    /\bjust works?\b/i,
    /\bseamless\b/i,
    /\bno fuss\b/i,
    /\bone[- ]hand\b/i,
    /\bno screen\b/i,
  ],
  safety: [
    /\bprotection\b/i,
    /\bprivacy\b/i,
    /\btheft\b/i,
    /\bloss\b/i,
    /\bfall detection\b/i,
    /\bcrash detection\b/i,
    /\bpeace of mind\b/i,
    /\bsecure\b/i,
    /\bgeofence\b/i,
    /\btracking\b/i,
  ],
  convenience: [
    /\bwireless\b/i,
    /\bmagsafe\b/i,
    /\bqi2\b/i,
    /\bauto[- ]switch\b/i,
    /\bhands[- ]free\b/i,
    /\bnightstand\b/i,
    /\bdesk\b/i,
    /\bcar\b/i,
    /\bone cable\b/i,
    /\bset the phone down\b/i,
  ],
  productivity: [
    /\bwork\b/i,
    /\bremote\b/i,
    /\bproductivity\b/i,
    /\bkeyboard\b/i,
    /\bnotes?\b/i,
    /\bmarkup\b/i,
    /\bs pen\b/i,
    /\bdex\b/i,
    /\blaptop replacement\b/i,
    /\bcalendar\b/i,
    /\bsign\b/i,
  ],
  entertainment: [
    /\bgaming\b/i,
    /\bstreaming\b/i,
    /\bmusic\b/i,
    /\bvideo\b/i,
    /\bcontent\b/i,
    /\bcamera\b/i,
    /\bspatial audio\b/i,
    /\bnoise cancel/i,
  ],
  identity: [
    /\bconversation starter\b/i,
    /\bdifferent\b/i,
    /\bretro\b/i,
    /\bshow off\b/i,
    /\bpersonality\b/i,
    /\bfashion\b/i,
    /\bfun\b/i,
    /\btech-forward\b/i,
  ],
  'social-status': [
    /\bpremium\b/i,
    /\bflagship\b/i,
    /\bluxury\b/i,
    /\bpro\b/i,
    /\bultra\b/i,
    /\bshow off the phone color\b/i,
    /\bbest\b/i,
  ],
  'family-coordination': [
    /\bparent\b/i,
    /\bparents\b/i,
    /\bfamily\b/i,
    /\bkids?\b/i,
    /\bteen\b/i,
    /\bshared car\b/i,
    /\bpartner\b/i,
    /\bfamily memories\b/i,
  ],
  'travel-mobility': [
    /\btravel\b/i,
    /\btraveler\b/i,
    /\bcommut/i,
    /\broad trip\b/i,
    /\bluggage\b/i,
    /\bflight\b/i,
    /\btransit\b/i,
    /\bon the go\b/i,
    /\bportable\b/i,
  ],
  'heavy-usage': [
    /\bbattery\b/i,
    /\b39hr\b/i,
    /\b36hr\b/i,
    /\b30\+ hr\b/i,
    /\b5200mah\b/i,
    /\b5000mah\b/i,
    /\b2tb\b/i,
    /\b1tb\b/i,
    /\b256gb\b/i,
    /\b512gb\b/i,
    /\bheavy\b/i,
    /\bpower user\b/i,
  ],
};

const LIFE_CONTEXT_RULES: Array<{ label: string; test: RegExp[] }> = [
  { label: 'traveler', test: [/\btravel\b/i, /\bflight\b/i, /\bluggage\b/i, /\bairport\b/i, /\broad trip\b/i] },
  { label: 'commuter', test: [/\bcommut/i, /\btransit\b/i, /\btrain\b/i, /\bmaps\b/i, /\bcar\b/i] },
  { label: 'remote worker', test: [/\bremote work\b/i, /\bwork from home\b/i, /\bwork calls?\b/i, /\bcoffee shop\b/i, /\bvpn\b/i] },
  { label: 'parent', test: [/\bparent\b/i, /\bkids?\b/i, /\bfamily\b/i, /\bteen drivers?\b/i] },
  { label: 'gamer', test: [/\bgaming\b/i, /\bgame pass\b/i, /\bplaystation\b/i, /\bxbox\b/i] },
  { label: 'creator', test: [/\bcontent\b/i, /\bcreator\b/i, /\bvideo editing\b/i, /\binstagram\b/i, /\btiktok\b/i, /\bcamera\b/i] },
  { label: 'student', test: [/\bschool\b/i, /\bclass\b/i, /\bstudy\b/i, /\bnotes?\b/i, /\bbag\b/i] },
  { label: 'heavy user', test: [/\bbattery\b/i, /\bpower user\b/i, /\ball-day\b/i] },
  { label: 'budget-focused', test: [/\bbudget\b/i, /\bvalue\b/i, /\bprice\b/i, /\baffordable\b/i, /\bfree\b/i] },
  { label: 'simplicity-first', test: [/\bsimple\b/i, /\beasy\b/i, /\bjust set\b/i, /\bno fuss\b/i, /\bwithout a phone\b/i] },
  { label: 'privacy-minded', test: [/\bprivacy\b/i, /\bsensitive info\b/i, /\bscreen looks black\b/i] },
  { label: 'health-focused', test: [/\bhealth\b/i, /\bsleep\b/i, /\bhearing\b/i, /\bheart\b/i, /\bfitbit\b/i] },
  { label: 'active lifestyle', test: [/\boutdoor\b/i, /\bworkout\b/i, /\bsports\b/i, /\bhiking\b/i, /\badventure\b/i] },
];

const DRIVER_PROFILES: Record<FitDriver, DriverProfile> = {
  budget: {
    title: 'Value that still feels current',
    appealType: 'value',
    mindset: 'This lands with callers who want to feel smart with their money, not cheap.',
    leadWith: 'Lead with what they still get for the money before you mention what they are skipping.',
    avoidIf: 'Do not start here if they already told you they want the absolute best camera, biggest screen, or premium finish.',
    fitHints: ['budget-focused', 'value shoppers'],
    cues: ['best value', 'monthly cost', 'do not need the most expensive'],
  },
  simplicity: {
    title: 'Easy right out of the box',
    appealType: 'convenience',
    mindset: 'This works best when the caller wants less friction, not more features to learn.',
    leadWith: 'Lead with how easy it feels on day one, then use one concrete example.',
    avoidIf: 'Do not over-explain the tech. Simplicity buyers tune out when the pitch gets too technical.',
    fitHints: ['simplicity-first', 'first-time upgraders'],
    cues: ['just want it to work', 'not techy', 'do not want extra setup'],
  },
  safety: {
    title: 'Peace of mind before regret',
    appealType: 'safety',
    mindset: 'This is for callers who worry more about loss, damage, privacy, or family safety than raw specs.',
    leadWith: 'Start with the risk they already know is real, then show how this removes it.',
    avoidIf: 'Do not lead here until you connect it to a real risk or pain point they recognize.',
    fitHints: ['peace-of-mind buyers', 'protective planners'],
    cues: ['break phones', 'worry about theft', 'need to keep track of someone or something'],
  },
  convenience: {
    title: 'Removes daily friction',
    appealType: 'convenience',
    mindset: 'This lands when the caller values smoother daily use more than a longer spec comparison.',
    leadWith: 'Tie it to one annoying everyday friction point, then show how this removes it.',
    avoidIf: 'Do not bury the convenience angle under a spec list.',
    fitHints: ['routine-driven buyers', 'commuters'],
    cues: ['hate cables', 'use it in the car', 'want it to fit the routine'],
  },
  productivity: {
    title: 'Real work gets easier',
    appealType: 'productivity',
    mindset: 'This fits callers who actually expect the device to help them work, organize, or multitask.',
    leadWith: 'Lead with what it helps them get done, not the chip or hardware language.',
    avoidIf: 'Do not start here if they are clearly shopping for the simplest low-cost option and never work from the device.',
    fitHints: ['remote worker', 'multitaskers'],
    cues: ['work off my phone', 'take notes', 'need to sign or mark things up'],
  },
  entertainment: {
    title: 'Fun feels better immediately',
    appealType: 'cool-factor',
    mindset: 'This works when the caller cares about music, gaming, streaming, or making the upgrade feel more fun.',
    leadWith: 'Lead with the fun outcome first, then back it up with one feature.',
    avoidIf: 'Do not lead here if the entire call is about cost control, billing, or protection only.',
    fitHints: ['gamer', 'creator'],
    cues: ['stream a lot', 'game on the phone', 'always listening to music'],
  },
  identity: {
    title: 'Feels different enough to be exciting',
    appealType: 'cool-factor',
    mindset: 'This lands with callers who want personality, novelty, or something that does not look like every other device.',
    leadWith: 'Lead with why it feels different or more personal, then prove it is still practical.',
    avoidIf: 'Do not lead here when the caller only wants the most practical answer.',
    fitHints: ['style-first', 'trend-aware'],
    cues: ['want something different', 'want it to look cool', 'every phone feels the same'],
  },
  'social-status': {
    title: 'Premium enough to feel the upgrade',
    appealType: 'status',
    mindset: 'This lands when the buyer wants the upgrade to feel premium every single day.',
    leadWith: 'Lead with the premium experience they will notice, not with price.',
    avoidIf: 'Do not lead here if they are clearly value-first or resistant to premium upsells.',
    fitHints: ['premium shoppers', 'upgrade seekers'],
    cues: ['want the best one', 'want the premium model', 'want to feel the upgrade'],
  },
  'family-coordination': {
    title: 'Makes family life easier to manage',
    appealType: 'family',
    mindset: 'This fits callers trying to keep family logistics, safety, or shared routines under control.',
    leadWith: 'Anchor it to the family problem it solves first, then give one proof point.',
    avoidIf: 'Do not lead here unless there is a family, kid, partner, or shared-life use case in the call.',
    fitHints: ['parent', 'family-focused'],
    cues: ['for my kid', 'shared car or device', 'need to keep up with family'],
  },
  'travel-mobility': {
    title: 'Better on the move',
    appealType: 'convenience',
    mindset: 'This works for callers who live in the car, commute, or need the device to hold up away from home.',
    leadWith: 'Connect it to travel, commuting, or being away from a charger before you mention the feature.',
    avoidIf: 'Do not start here if they mostly use the device in one place and never mention being on the go.',
    fitHints: ['traveler', 'commuter'],
    cues: ['travel for work', 'live in the car', 'need it on the go'],
  },
  'heavy-usage': {
    title: 'Built for people who lean on it hard',
    appealType: 'practical',
    mindset: 'This fits heavy users who notice battery, storage, and durability problems faster than anyone else.',
    leadWith: 'Lead with the pain they already feel today, then show why this holds up better.',
    avoidIf: 'Do not lead here if they barely use the device and will not value the extra headroom.',
    fitHints: ['heavy user', 'all-day users'],
    cues: ['battery dies early', 'run out of storage', 'use the phone all day'],
  },
};

const ACCESSORY_RECOMMENDATION_MATCHERS: Array<{ name: string; test: RegExp }> = [
  { name: 'Protective Case', test: /\b(case|otterbox|case-mate|tech21|rainier|crystal palace|evolite|evoclear)\b/i },
  { name: 'Screen Protector', test: /\b(screen protector|glass elite|privacy 360|camera protector)\b/i },
  { name: 'Fast Charger + Cable', test: /\b(charger|cable|power adapter|car charger|charging bundle)\b/i },
  { name: 'MagSafe / Qi2 Wireless Charger', test: /\b(magsafe|wireless charger|qi2|battery pack|magnetic battery|car mount)\b/i },
  { name: 'Premium Wireless Audio', test: /\b(airpods pro|airpods max|buds4|quietcomfort|bose)\b/i },
  { name: 'Wireless Earbuds', test: /\b(airpods|buds|beats|earbuds|headphones)\b/i },
  { name: 'Backbone Gaming Controller', test: /\bbackbone\b/i },
  { name: 'Ray-Ban Meta Smart Glasses', test: /\bray-ban|meta wayfarer|smart glasses\b/i },
  { name: 'Tablet Keyboard Case', test: /\bkeyboard case|magic keyboard|book cover keyboard|pencil|s pen\b/i },
  { name: 'Tablet Screen Protector', test: /\btablet\b.*\b(screen|glass)\b/i },
  { name: 'Watch Screen Protector', test: /\bwatch\b.*\b(screen|glass)\b/i },
  { name: 'Car Mount / Car Charger', test: /\b(car mount|vent mount|iottie)\b/i },
  { name: 'PopSocket / MagSafe Grip', test: /\bpopsocket|popgrip\b/i },
  { name: 'Portable Battery Pack', test: /\b(battery pack|magnetic battery)\b/i },
  { name: 'Protection 360', test: /\bprotection 360|p360\b/i },
  { name: 'SyncUP Tracker', test: /\b(syncup tracker|tracker)\b/i },
];

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function compact<T>(values: Array<T | null | undefined | false>): T[] {
  return values.filter(Boolean) as T[];
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .filter(token => token.length > 1 && !['apple', 'samsung', 'google', 't', 'mobile', 'the'].includes(token));
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.replace(/^["']|["']$/g, '').trim())
    .filter(Boolean);
}

function toLanguageList(value: string): string[] {
  return value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function cleanSentence(sentence: string): string {
  return sentence.replace(/\s+/g, ' ').trim();
}

function trimSentence(sentence: string, maxLength = 145): string {
  const cleaned = cleanSentence(sentence);
  if (cleaned.length <= maxLength) return cleaned;

  const shortened = cleaned.slice(0, maxLength);
  const cutAt = Math.max(shortened.lastIndexOf(','), shortened.lastIndexOf(' '));
  return `${shortened.slice(0, cutAt > 70 ? cutAt : maxLength).trim()}...`;
}

export function getAppealTypeLabel(appealType: AppealType): string {
  return APPEAL_LABELS[appealType];
}

export function getAccessoryOutcomeLabel(name: string, categoryLabel: string): string {
  const normalizedName = normalizeText(name);
  const normalizedCategory = normalizeText(categoryLabel);

  if (/protection|case|glass|screen|camera/.test(normalizedName) || /case|screen|camera|protection/.test(normalizedCategory)) {
    return 'Protect it';
  }
  if (/charger|battery|magsafe|qi2|cable|mount/.test(normalizedName) || /charg|wireless/.test(normalizedCategory)) {
    return 'Power it';
  }
  if (/airpods|buds|audio|headphones/.test(normalizedName) || normalizedCategory.includes('audio')) {
    return 'Hear better';
  }
  if (/tracker|kids watch|syncup/.test(normalizedName)) {
    return 'Family safety';
  }
  if (/keyboard|pencil|s pen/.test(normalizedName)) {
    return 'Work better';
  }
  if (/backbone|gaming/.test(normalizedName)) {
    return 'Just have fun';
  }
  if (/ray ban|meta|popsocket|popgrip/.test(normalizedName)) {
    return 'Show personality';
  }
  if (/car|travel|iottie/.test(normalizedName)) {
    return 'Travel easier';
  }
  return 'Everyday add-on';
}

function stringMatchScore(target: string, candidate: string): number {
  const targetNormalized = normalizeText(target);
  const candidateNormalized = normalizeText(candidate);

  if (!targetNormalized || !candidateNormalized) return 0;
  if (targetNormalized === candidateNormalized) return 12;
  if (targetNormalized.includes(candidateNormalized) || candidateNormalized.includes(targetNormalized)) return 9;

  const targetTokens = tokenize(targetNormalized);
  const candidateTokens = tokenize(candidateNormalized);
  const overlap = targetTokens.filter(token => candidateTokens.includes(token)).length;

  if (overlap === 0) return 0;
  const sharedRatio = overlap / Math.min(targetTokens.length || 1, candidateTokens.length || 1);
  return overlap * 2 + (sharedRatio >= 0.75 ? 3 : 0);
}

function scoreDrivers(texts: string[], boosts: Partial<Record<FitDriver, number>> = {}): FitDriver[] {
  const scoreMap = new Map<FitDriver, number>();

  for (const driver of Object.keys(DRIVER_KEYWORDS) as FitDriver[]) {
    const score = texts.reduce((total, text) => {
      const matches = DRIVER_KEYWORDS[driver].reduce((count, pattern) => count + (pattern.test(text) ? 1 : 0), 0);
      return total + matches;
    }, 0) + (boosts[driver] ?? 0);

    if (score > 0) {
      scoreMap.set(driver, score);
    }
  }

  return [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([driver]) => driver)
    .slice(0, 3);
}

function deriveLifeContext(texts: string[], drivers: FitDriver[]): string[] {
  const combined = texts.join(' ');
  const contexts = LIFE_CONTEXT_RULES
    .filter(rule => rule.test.some(pattern => pattern.test(combined)))
    .map(rule => rule.label);

  if (drivers.includes('budget') && !contexts.includes('budget-focused')) contexts.push('budget-focused');
  if (drivers.includes('simplicity') && !contexts.includes('simplicity-first')) contexts.push('simplicity-first');
  if (drivers.includes('heavy-usage') && !contexts.includes('heavy user')) contexts.push('heavy user');

  return contexts.slice(0, 4);
}

function chooseAppealType(drivers: FitDriver[], fallback: AppealType = 'practical'): AppealType {
  return drivers[0] ? DRIVER_PROFILES[drivers[0]].appealType : fallback;
}

function getBrandKey(device: Device): keyof typeof ECOSYSTEM_HOOKS | null {
  if (device.category === 'iphone' || /iphone|apple watch|ipad/i.test(device.name)) return 'apple';
  if (device.category === 'samsung' || /galaxy/i.test(device.name)) return 'samsung';
  return null;
}

function getDeviceBoosts(device: Device): Partial<Record<FitDriver, number>> {
  const boosts: Partial<Record<FitDriver, number>> = {};
  const price = typeof device.startingPrice === 'number' ? device.startingPrice : null;
  const normalizedName = normalizeText(device.name);

  if (price !== null && price <= 650) boosts.budget = 3;
  if (price !== null && price >= 999) boosts['social-status'] = 2;
  if (/watch|tracker|drive/i.test(normalizedName)) boosts.safety = 1;
  if (/flip|fold|ray-ban|backbone/i.test(normalizedName)) boosts.identity = 2;
  if (/ultra|pro max|air/i.test(normalizedName)) boosts['social-status'] = (boosts['social-status'] ?? 0) + 1;
  if (/tab|ipad|s pen|dex/i.test(normalizedName)) boosts.productivity = 2;
  if (/battery|5000mah|5200mah|2tb|1tb/i.test(normalizedName)) boosts['heavy-usage'] = 1;
  return boosts;
}

function getAccessoryBoosts(name: string, category: string): Partial<Record<FitDriver, number>> {
  const boosts: Partial<Record<FitDriver, number>> = {};
  const normalizedName = normalizeText(name);

  if (/p360|protection/.test(normalizedName) || category === 'protection') boosts.safety = 3;
  if (/charger|battery|mount|magsafe|qi2|wireless/.test(normalizedName) || category === 'charging') boosts.convenience = 2;
  if (/airpods|buds|headphones|audio/.test(normalizedName) || category === 'audio') boosts.entertainment = 2;
  if (/backbone|ray ban|meta|flip|fold/.test(normalizedName)) boosts.identity = 3;
  if (/tracker|kids watch|syncup/.test(normalizedName)) boosts['family-coordination'] = 3;
  if (/case|glass|camera protector/.test(normalizedName)) boosts.safety = (boosts.safety ?? 0) + 1;
  if (/battery/.test(normalizedName)) boosts['heavy-usage'] = 2;
  return boosts;
}

function translateFeature(feature: string): string | null {
  const normalized = normalizeText(feature);
  if (!normalized) return null;

  if (/\b(256gb|512gb|1tb|2tb)\b/.test(normalized)) {
    return 'More room for photos, apps, and offline media before storage becomes a problem.';
  }
  if (/\b(39hr|36hr|30 hr|30+ hr|5200mah|5000mah|4900mah|4823|5088)\b/.test(normalized) || normalized.includes('battery')) {
    return 'Stronger battery story for heavy users, travel days, and people who hate charging mid-day.';
  }
  if (/\b(60w|45w|40w|30w|25w|15w)\b/.test(normalized) || normalized.includes('charging')) {
    return 'Turns charging speed into a real convenience story instead of a spec sheet number.';
  }
  if (normalized.includes('camera') || /\b(200mp|48mp|50mp|100x zoom|tele)\b/.test(normalized)) {
    return 'Easy proof point for family photos, travel, and anyone who wants the upgrade to feel obvious.';
  }
  if (normalized.includes('oled') || normalized.includes('amoled') || normalized.includes('120hz') || normalized.includes('qhd')) {
    return 'The screen will look brighter, sharper, and smoother every single day.';
  }
  if (normalized.includes('magsafe') || normalized.includes('qi2')) {
    return 'Magnetic alignment makes charging and car mounting easier, which is an easy over-the-phone win.';
  }
  if (normalized.includes('s pen') || normalized.includes('pencil')) {
    return 'Turns the device into something they can note-take, sign, and mark up with instead of just watch content on.';
  }
  if (normalized.includes('dex') || normalized.includes('desktop mode')) {
    return 'Gives you a clean productivity story: tablet convenience with laptop-style multitasking.';
  }
  if (normalized.includes('fitbit') || normalized.includes('bioactive') || normalized.includes('sleep') || normalized.includes('heart') || normalized.includes('hearing')) {
    return 'Health features become a daily-use reason to keep the product, not just a novelty demo.';
  }
  if (normalized.includes('gps') || normalized.includes('tracker') || normalized.includes('geofence')) {
    return 'Makes location, safety, and peace of mind easy to explain in plain English.';
  }
  if (normalized.includes('usb c')) {
    return 'Fewer charger headaches because it matches the cable standard most people already use now.';
  }
  return null;
}

function getFeatureTranslations(sourceText: string): FeatureTranslation[] {
  const candidates = sourceText.split(',').map(part => part.trim()).filter(Boolean);
  return compact(
    candidates.map(feature => {
      const benefit = translateFeature(feature);
      return benefit ? { feature, benefit: trimSentence(benefit, 120) } : null;
    })
  ).slice(0, 2);
}

function getPromoMatches(device: Device, weeklyData: WeeklyUpdate | null | undefined) {
  if (!weeklyData) return [];
  const firstToken = device.name.split(' ')[0].toLowerCase();
  return weeklyData.currentPromos.filter(promo =>
    promo.name.toLowerCase().includes(firstToken) || promo.details.toLowerCase().includes(firstToken)
  );
}

function getDeviceDemoAngles(device: Device, ecosystemMatrix: EcosystemMatrix | null | undefined): DemoCoachingAngle[] {
  if (!ecosystemMatrix) return [];

  const categoryKeys: DeviceDemoCategory[] =
    device.category === 'tablet'
      ? ['tablets']
      : device.category === 'watch'
      ? ['wearables']
      : device.category === 'hotspot'
      ? ['iotProducts']
      : ['smartphones'];

  const results: Array<DemoCoachingAngle & { score: number }> = [];

  for (const demographic of DEMOGRAPHIC_KEYS) {
    const section = ecosystemMatrix.demographics[demographic];

    for (const categoryKey of categoryKeys) {
      const entries = section[categoryKey];
      if (!Array.isArray(entries)) continue;

      for (const entry of entries) {
        const entryName = 'device' in entry ? entry.device : entry.product;
        const score = stringMatchScore(device.name, entryName);
        if (score < 5) continue;

        results.push({
          demographic,
          label: section.label,
          whyThisDemoResponds: trimSentence(entry.why, 150),
          trustLanguage: toLanguageList(section.trustLanguage),
          avoidLanguage: toLanguageList(section.avoidLanguage),
          score,
        });
      }
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ score: _score, ...angle }) => angle);
}

function getAccessoryMatrixAngles(name: string, ecosystemMatrix: EcosystemMatrix | null | undefined): DemoCoachingAngle[] {
  if (!ecosystemMatrix) return [];

  const matches: Array<DemoCoachingAngle & { score: number }> = [];

  for (const demographic of DEMOGRAPHIC_KEYS) {
    const section = ecosystemMatrix.demographics[demographic];
    for (const entry of section.accessories) {
      const itemScore = Math.max(
        ...entry.items.map(item => stringMatchScore(name, item)),
        stringMatchScore(name, entry.category)
      );
      if (itemScore < 5) continue;

      matches.push({
        demographic,
        label: section.label,
        whyThisDemoResponds: trimSentence(entry.why, 150),
        trustLanguage: toLanguageList(section.trustLanguage),
        avoidLanguage: toLanguageList(section.avoidLanguage),
        score: itemScore,
      });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(({ score: _score, ...angle }) => angle);
}

function getProtection360Angles(ecosystemMatrix: EcosystemMatrix | null | undefined): DemoCoachingAngle[] {
  if (!ecosystemMatrix) return [];

  return DEMOGRAPHIC_KEYS.map(demographic => ({
    demographic,
    label: ecosystemMatrix.demographics[demographic].label,
    whyThisDemoResponds: trimSentence(ecosystemMatrix.crossDemographicProducts.protection360.pitchByDemo[demographic], 150),
    trustLanguage: toLanguageList(ecosystemMatrix.demographics[demographic].trustLanguage),
    avoidLanguage: toLanguageList(ecosystemMatrix.demographics[demographic].avoidLanguage),
  }));
}

function getAccessoryProductBucket(name: string, category: string, device: Device | null | undefined): SalesContext['product'] {
  if (device?.category === 'tablet' || /tablet|ipad|tab|pencil|s pen/i.test(name)) return ['BTS'];
  if (device?.category === 'watch' || /watch/i.test(name)) return ['BTS'];
  if (device?.category === 'hotspot' || /syncup|tracker|drive/i.test(name)) return ['IOT'];
  if (category === 'tracker') return ['IOT'];
  return ['Phone'];
}

function getAccessoryRecommendationName(name: string): string | null {
  for (const matcher of ACCESSORY_RECOMMENDATION_MATCHERS) {
    if (matcher.test.test(name)) return matcher.name;
  }
  return null;
}

function getAccessoryRecommendationAngles(
  name: string,
  category: string,
  device: Device | null | undefined,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): DemoCoachingAngle[] {
  const recommendationName = getAccessoryRecommendationName(name);
  if (!recommendationName) return [];

  const bucket = getAccessoryProductBucket(name, category, device);

  return compact(DEMOGRAPHIC_KEYS.map(demographic => {
    const sampleContext: SalesContext = {
      age: demographic,
      region: 'Not Specified',
      zipCode: '',
      product: bucket,
      purchaseIntent: 'ready to buy',
      currentCarrier: 'Not Specified',
    };

    const match = buildAccessoryRecommendations(sampleContext).find(rec => rec.name === recommendationName);
    if (!match) return null;

    const section = ecosystemMatrix?.demographics[demographic];

    return {
      demographic,
      label: section?.label ?? demographic,
      whyThisDemoResponds: trimSentence(match.why, 150),
      trustLanguage: section ? toLanguageList(section.trustLanguage) : [],
      avoidLanguage: section ? toLanguageList(section.avoidLanguage) : [],
    };
  }));
}

function buildDeviceTexts(device: Device, ecosystemMatrix: EcosystemMatrix | null | undefined) {
  const demoAngles = getDeviceDemoAngles(device, ecosystemMatrix);
  const brandKey = getBrandKey(device);
  const ecosystemHooks = brandKey ? ECOSYSTEM_HOOKS[brandKey].slice(0, 2) : [];
  const texts = compact([
    device.keySpecs,
    device.sellingNotes,
    ...demoAngles.map(angle => angle.whyThisDemoResponds),
    ...ecosystemHooks,
    device.category === 'watch'
      ? `${CONNECTED_DEVICE_INFO.plans.wearableLine.desc}.`
      : device.category === 'tablet'
      ? `${CONNECTED_DEVICE_INFO.plans.tabletLine.desc}.`
      : null,
  ]);

  return { demoAngles, texts };
}

function buildAccessoryEvidence(
  name: string,
  category: string,
  pitchText: string | undefined,
  whyText: string | undefined,
  device: Device | null | undefined,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): AccessoryEvidence {
  const matrixAngles = /protection 360|p360/i.test(name)
    ? getProtection360Angles(ecosystemMatrix)
    : getAccessoryMatrixAngles(name, ecosystemMatrix);
  const recommendationAngles = getAccessoryRecommendationAngles(name, category, device, ecosystemMatrix);

  const demoAngles = unique(
    [...matrixAngles, ...recommendationAngles].map(angle => JSON.stringify(angle))
  ).map(serialized => JSON.parse(serialized) as DemoCoachingAngle).slice(0, 2);

  const whyTexts = compact([
    whyText,
    ...demoAngles.map(angle => angle.whyThisDemoResponds),
    /protection 360|p360/i.test(name) ? PROTECTION_360_COVERAGE.slice(0, 3).join('. ') : null,
    pitchText ? pitchText.replace(/^"+|"+$/g, '') : null,
  ]);

  return { whyTexts, demoAngles };
}

function rankSentence(sentence: string, drivers: FitDriver[]): number {
  const clean = cleanSentence(sentence);
  if (!clean) return 0;

  let score = 1;
  for (const driver of drivers) {
    score += DRIVER_KEYWORDS[driver].reduce((count, pattern) => count + (pattern.test(clean) ? 1 : 0), 0);
  }
  if (/\b(best|great|ideal|perfect|worth|huge|great for|good for|for people who)\b/i.test(clean)) score += 2;
  if (clean.length <= 150) score += 1;
  return score;
}

function buildProofPoints(texts: string[], fallbackFeatureTranslations: FeatureTranslation[], drivers: FitDriver[]): string[] {
  const sentences = unique(texts.flatMap(splitSentences).map(cleanSentence).filter(Boolean));
  const rankedSentences = sentences
    .map(sentence => ({ sentence, score: rankSentence(sentence, drivers) }))
    .sort((a, b) => b.score - a.score || a.sentence.length - b.sentence.length)
    .map(item => trimSentence(item.sentence));

  const translatedProofs = fallbackFeatureTranslations.map(item => trimSentence(`${item.feature}: ${item.benefit}`));
  return unique([...rankedSentences, ...translatedProofs]).slice(0, 3);
}

function buildBestFit(drivers: FitDriver[], lifeContext: string[], fallbackLabel: string): string[] {
  const fit = [...lifeContext];

  for (const driver of drivers.slice(0, 2)) {
    fit.push(...DRIVER_PROFILES[driver].fitHints);
  }

  if (fit.length === 0) fit.push(fallbackLabel);
  return unique(fit).slice(0, 3);
}

function buildShortHook(driver: FitDriver | undefined, proof: string | undefined): string {
  if (!driver) return proof ?? 'Strong everyday fit';
  return proof ? `${DRIVER_PROFILES[driver].title}: ${proof}` : DRIVER_PROFILES[driver].title;
}

function buildPrimaryScript(name: string, driver: FitDriver | undefined, proof: string): string {
  if (!driver) return `${name} is the clean lead when they want a straightforward upgrade. ${proof}`;

  switch (driver) {
    case 'budget':
      return `${name} is the easy lead when they want current features without paying flagship money. ${proof}`;
    case 'simplicity':
      return `If they just want something that feels easy right away, ${name} is the clean answer. ${proof}`;
    case 'safety':
      return `If peace of mind is the real need, ${name} gives you a strong protection story. ${proof}`;
    case 'convenience':
      return `${name} makes day-to-day use easier fast. ${proof}`;
    case 'productivity':
      return `If they actually work from this device, ${name} gives you a real productivity story. ${proof}`;
    case 'entertainment':
      return `If they want the upgrade to feel more fun right away, ${name} is the easiest way in. ${proof}`;
    case 'identity':
      return `If they want something that feels different instead of more of the same, ${name} is the hook. ${proof}`;
    case 'social-status':
      return `If they want the premium version they will actually feel every day, ${name} is the lead. ${proof}`;
    case 'family-coordination':
      return `If the device has to make family life easier, ${name} is the smart lead. ${proof}`;
    case 'travel-mobility':
      return `If they are always on the move, ${name} is the one to position first. ${proof}`;
    case 'heavy-usage':
      return `If they are hard on their phone or use it all day, ${name} gives you the durability-and-battery angle. ${proof}`;
    default:
      return `${name} is the clean lead when they want a straightforward upgrade. ${proof}`;
  }
}

function buildBackupScript(name: string, driver: FitDriver | undefined, proof: string): string {
  if (!driver) return `If the first angle does not land, pivot back to the everyday proof: ${proof}`;
  return `If the first angle does not land, pivot to ${DRIVER_PROFILES[driver].title.toLowerCase()}. ${name} still gives you this proof point: ${proof}`;
}

function buildAngleWhy(
  driver: FitDriver | undefined,
  detail: string | undefined,
  topDemo: DemoCoachingAngle | undefined
): string {
  const mindset = driver ? DRIVER_PROFILES[driver].mindset : 'This lands when the product clearly solves something the caller already cares about.';
  const supportingDetail = detail ? trimSentence(detail, 170) : '';

  if (!supportingDetail && topDemo) {
    return `${mindset} ${topDemo.whyThisDemoResponds}`;
  }

  return [mindset, supportingDetail].filter(Boolean).join(' ');
}

function buildListenFor(primaryDriver: FitDriver | undefined, backupDriver: FitDriver | undefined): string[] {
  return unique(compact([
    ...(primaryDriver ? DRIVER_PROFILES[primaryDriver].cues : []),
    ...(backupDriver ? DRIVER_PROFILES[backupDriver].cues : []),
  ])).slice(0, 3);
}

function buildLeadWith(driver: FitDriver | undefined): string {
  if (!driver) return 'Lead with the most obvious everyday benefit, then stop after one proof point.';
  return DRIVER_PROFILES[driver].leadWith;
}

function buildSummary(params: {
  name: string;
  drivers: FitDriver[];
  demoAngles: DemoCoachingAngle[];
  evidenceTexts: string[];
  baseScript?: string;
  featureTranslations: FeatureTranslation[];
  fallbackAppeal: AppealType;
  fallbackFit: string;
}): PositioningSummary {
  const { name, drivers, demoAngles, evidenceTexts, baseScript, featureTranslations, fallbackAppeal, fallbackFit } = params;
  const appealType = chooseAppealType(drivers, fallbackAppeal);
  const lifeContext = deriveLifeContext(evidenceTexts, drivers);
  const bestFit = buildBestFit(drivers, lifeContext, fallbackFit);
  const proofPoints = buildProofPoints(evidenceTexts, featureTranslations, drivers);
  const topProof = proofPoints[0] ?? 'It gives the rep a clean everyday reason to position it.';
  const secondaryProof = proofPoints[1] ?? proofPoints[0] ?? topProof;
  const topDemo = demoAngles[0];
  const primaryDriver = drivers[0];
  const backupDriver = drivers[1];
  const primaryWhySource = evidenceTexts[0] ?? topDemo?.whyThisDemoResponds;
  const backupWhySource = evidenceTexts[1] ?? topDemo?.whyThisDemoResponds;

  const primaryAngle: CoachingAngle = {
    title: primaryDriver ? DRIVER_PROFILES[primaryDriver].title : 'Clear everyday fit',
    script: baseScript ? trimSentence(baseScript, 170) : buildPrimaryScript(name, primaryDriver, topProof),
    why: buildAngleWhy(primaryDriver, primaryWhySource, topDemo),
    proof: topProof,
  };

  const backupAngle = backupDriver || topDemo
    ? {
        title: backupDriver
          ? DRIVER_PROFILES[backupDriver].title
          : `${topDemo?.label ?? 'Customer-fit'} language`,
        script: backupDriver
          ? buildBackupScript(name, backupDriver, secondaryProof)
          : `If they sound more like a ${topDemo?.label.toLowerCase()} caller, keep the wording around ${topDemo?.trustLanguage[0] ?? 'what feels useful right away'}.`,
        why: backupDriver
          ? buildAngleWhy(backupDriver, backupWhySource, topDemo)
          : topDemo?.whyThisDemoResponds ?? '',
        proof: backupDriver ? secondaryProof : topDemo?.whyThisDemoResponds ?? secondaryProof,
      }
    : undefined;

  return {
    sayThis: primaryAngle.script,
    shortHook: buildShortHook(primaryDriver, topProof),
    whyItLands: buildAngleWhy(primaryDriver, primaryWhySource, topDemo),
    bestFit,
    appealType,
    proofPoints,
    featureTranslations: featureTranslations.slice(0, 2),
    listenFor: buildListenFor(primaryDriver, backupDriver),
    trustLanguage: topDemo?.trustLanguage ?? [],
    avoidLanguage: topDemo?.avoidLanguage ?? [],
    demoAngles,
    primaryAngle,
    backupAngle,
    callerMindset: primaryDriver ? DRIVER_PROFILES[primaryDriver].mindset : 'Lead with the reason this makes daily life easier.',
    leadWith: buildLeadWith(primaryDriver),
    avoidIf: primaryDriver ? DRIVER_PROFILES[primaryDriver].avoidIf : `Do not overcomplicate ${name}. Keep it tied to the caller's real use case.`,
  };
}

export function getDevicePositioningSummary(
  device: Device,
  weeklyData: WeeklyUpdate | null | undefined,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): PositioningSummary {
  const { demoAngles, texts } = buildDeviceTexts(device, ecosystemMatrix);
  const promos = getPromoMatches(device, weeklyData);
  const drivers = scoreDrivers(texts, getDeviceBoosts(device));
  const featureTranslations = getFeatureTranslations(device.keySpecs);

  const evidenceTexts = compact([
    device.sellingNotes,
    ...demoAngles.map(angle => angle.whyThisDemoResponds),
    ...promos.map(promo => `${promo.name}. ${promo.details}`),
    ...texts.filter(text => text !== device.keySpecs),
    ...featureTranslations.map(item => `${item.feature}: ${item.benefit}`),
    device.category === 'watch' ? `Connected line runs ${CONNECTED_DEVICE_INFO.plans.wearableLine.desc}.` : null,
    device.category === 'tablet' ? `Tablet line runs ${CONNECTED_DEVICE_INFO.plans.tabletLine.desc}.` : null,
  ]);

  return buildSummary({
    name: device.name,
    drivers,
    demoAngles,
    evidenceTexts,
    featureTranslations,
    fallbackAppeal: device.category === 'hotspot' ? 'practical' : 'value',
    fallbackFit: device.category === 'watch' ? 'connected lifestyle shoppers' : device.category === 'tablet' ? 'second-screen shoppers' : 'everyday upgraders',
  });
}

function trimQuotes(value: string): string {
  return value.replace(/^"+|"+$/g, '').trim();
}

export function getAccessoryPitchPositioningSummary(
  accessory: AccessoryPitch,
  device: Device | null | undefined,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): PositioningSummary {
  const evidence = buildAccessoryEvidence(
    accessory.name,
    accessory.category,
    accessory.transitionScript,
    undefined,
    device,
    ecosystemMatrix
  );
  const drivers = scoreDrivers(evidence.whyTexts, getAccessoryBoosts(accessory.name, accessory.category));
  const featureTranslations = getFeatureTranslations(evidence.whyTexts.join(', '));

  return buildSummary({
    name: accessory.name,
    drivers,
    demoAngles: evidence.demoAngles,
    evidenceTexts: evidence.whyTexts,
    baseScript: trimQuotes(accessory.transitionScript),
    featureTranslations,
    fallbackAppeal: accessory.category === 'protection' ? 'safety' : 'practical',
    fallbackFit: 'everyday accessory shoppers',
  });
}

export function getReferenceAccessoryPositioningSummary(
  item: EssentialItem | BigAddItem,
  categoryLabel: string,
  ecosystemMatrix: EcosystemMatrix | null | undefined
): PositioningSummary {
  const whyText = 'why' in item ? item.why : undefined;
  const pitchText = 'pitch' in item ? item.pitch : undefined;
  const noteText = 'note' in item ? item.note : undefined;
  const evidence = buildAccessoryEvidence(item.name, categoryLabel, pitchText, whyText, null, ecosystemMatrix);
  const drivers = scoreDrivers(compact([noteText, ...evidence.whyTexts]), getAccessoryBoosts(item.name, categoryLabel));
  const featureTranslations = getFeatureTranslations(item.why);

  return buildSummary({
    name: item.name,
    drivers,
    demoAngles: evidence.demoAngles,
    evidenceTexts: compact([noteText, ...evidence.whyTexts]),
    baseScript: trimQuotes(item.pitch),
    featureTranslations,
    fallbackAppeal: categoryLabel.toLowerCase().includes('screen') ? 'safety' : 'practical',
    fallbackFit: 'everyday add-on shoppers',
  });
}
