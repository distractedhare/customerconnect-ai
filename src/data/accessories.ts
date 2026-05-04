export interface ProtectionTier {
  tier: number;
  devices: string;
  monthlyCost: string;
}

export const PROTECTION_360_TIERS: ProtectionTier[] = [
  { tier: 1, devices: 'Budget phones', monthlyCost: '~$7' },
  { tier: 2, devices: 'Mid-range smartphones', monthlyCost: '~$9' },
  { tier: 3, devices: 'Upper mid-range', monthlyCost: '~$11' },
  { tier: 4, devices: 'Flagships', monthlyCost: '~$13-15' },
  { tier: 5, devices: 'Premium flagships (Pro Max, Ultra, foldables, BYOD)', monthlyCost: '~$18-26' },
];

export const PROTECTION_360_COVERAGE = [
  'Unlimited accidental damage claims (drops, cracks, spills)',
  '$0 front screen repair',
  '$29 back glass repair',
  'Up to 5 loss/theft replacements per 12 months',
  'Unlimited mechanical/electrical failure claims (even after manufacturer warranty)',
  'AppleCare Services for iPhones (first 24 months)',
  'JUMP! upgrades (after 50% device paid)',
  'McAfee Security with ID theft protection',
  'Unlimited screen protector replacements in-store',
  'Next-day replacement delivery',
  'Tech PHD support by Assurant',
  'Deductibles range from $10 to $249 by tier and claim type',
];

export const P360_VS_APPLECARE = 'AppleCare+ costs ~$9.99/month — covers accidental damage (2 incidents/year, $29 screen/$99 other) but does NOT cover loss or theft unless upgraded to AppleCare+ with Theft & Loss ($13.49/month). P360 includes AppleCare Services for 24 months PLUS loss/theft coverage, McAfee security, JUMP! upgrades, and unlimited screen protector replacements — all in one plan. Sales pitch: "P360 gives you everything AppleCare offers plus loss and theft protection, identity protection, and free screen protector replacements."';

export const BASIC_DEVICE_PROTECTION = '$1/month less per tier, but limited to 2 claims per 12 months with higher deductibles and no AppleCare, JUMP!, or McAfee.';

export const MAGSAFE_INFO = {
  compatibility: 'Compatible with iPhone 12 and all newer models (12 through 17 series including iPhone Air). Qi2 is the open standard equivalent — iPhone 15+ supports MagSafe/Qi2 at 15W+. Google Pixel 10 supports Qi2. Samsung Galaxy S26 does NOT support Qi2/MagSafe.',
  categories: 'Apple MagSafe chargers, Belkin and mophie wireless chargers, MagSafe cases, wallets, car mounts (iOttie), PopGrips for MagSafe, battery packs.',
};

export const USB_C_NOTE = 'All iPhones since iPhone 15 (2023) and all current Android flagships use USB-C. The accessory inventory has fully transitioned to USB-C cables and chargers.';

export const KEY_ACCESSORY_BRANDS = {
  premium: ['Apple', 'Samsung', 'Google', 'Beats', 'Belkin', 'Bose', 'JBL', 'mophie', 'OtterBox', 'Sony'],
  protection: ['Case-Mate', 'kate spade', 'Pelican', 'PureGear', 'Tech21', 'UAG', 'ZAGG'],
  charging: ['Belkin', 'iOttie', 'mophie', 'SCOSCHE', 'Nimble'],
  misc: ['Backbone (gaming)', 'Chipolo (trackers)', 'PopSockets'],
  tmobile: ['GoTo (T-Mobile brand)', 'Pivet'],
};

export const ESSENTIAL_BUNDLE_DEAL = {
  headline: 'Save 25% on 3+ Accessories',
  detail: 'Anything in the Essential Accessories collection qualifies — cases, screen protectors, chargers, cables, mounts, grips, and more. Mix and match any 3+.',
  pitch: 'If they\'re grabbing even one accessory, ask what else they need. Most customers don\'t realize how much they save by adding a second or third item.',
};

import {
  AccessoryBundleEligibilityStatus,
  AccessoryRecommendation,
  CatalogItem,
  CustomerSignal,
  OfferWorkflow,
  SalesContext,
} from '../types';
import { deriveCustomerSignals, getDisplayChips } from '../services/contextSignalEngine';
import { itemQualifiesForPromoSet } from '../services/promoEngine';
import { buildLiveRecommendationGate, isCatalogItemAllowedByLiveGate, sanitizeP360CopyForContext } from '../services/liveRecommendationGate';
import { CATALOG } from './accessoryCatalog';
import { canKipQuoteAccessoryBundleEligibility, getAccessoryBundleAccuracy } from './knowledge';
import { ESSENTIAL_ACCESSORIES_PROMO_SET_ID } from './promoRules';

/** Build personalized accessory recommendations based on customer context */
export function buildAccessoryRecommendations(context: SalesContext): AccessoryRecommendation[] {
  const signals = deriveCustomerSignals(context);
  const workflow = contextToAccessoryWorkflow(context);
  const displayChips = getDisplayChips(signals);
  const liveGate = buildLiveRecommendationGate(context);

  if (liveGate.allowedCategories.length === 0) return [];

  const scored = CATALOG
    .filter((item) => itemFitsSelectedProducts(item, context))
    .filter((item) => ecosystemAllowed(item, context))
    .filter((item) => isCatalogItemAllowedByLiveGate(item, liveGate))
    .map((item) => ({
      item,
      score: scoreCatalogItem(item, context, workflow, signals),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) =>
      right.score - left.score
      || left.item.category.localeCompare(right.item.category)
      || left.item.name.localeCompare(right.item.name)
    );

  return selectDiverseItems(scored, 8)
    .map(({ item }) => buildRecommendation(item, context, signals, displayChips));
}

const PHONE_CATEGORIES = new Set<CatalogItem['category']>([
  'p360',
  'case',
  'screen',
  'charger',
  'battery',
  'mount',
]);

const BTS_CATEGORIES = new Set<CatalogItem['category']>([
  'watch',
  'kids-watch',
  'tracker',
  'screen',
  'charger',
  'audio',
]);

const IOT_CATEGORIES = new Set<CatalogItem['category']>([
  'tracker',
  'kids-watch',
]);

const NON_BUNDLE_CATEGORIES = new Set<CatalogItem['category']>([
  'audio',
  'p360',
  'watch',
  'kids-watch',
  'tracker',
  'plan',
]);

const BRAND_HINTS = [
  'Apple',
  'Samsung',
  'Google',
  'ZAGG',
  'Tech21',
  'mophie',
  'Belkin',
  'GoTo',
  'PopSockets',
  'iOttie',
  'Backbone',
  'Ray-Ban',
  'Meta',
  'T-Mobile',
  'SyncUP',
];

function contextToAccessoryWorkflow(context: SalesContext): OfferWorkflow {
  switch (context.purchaseIntent) {
    case 'upgrade / add a line':
      return 'upgrade';
    case 'ready to buy':
      return 'ready';
    case 'order support':
      return 'order-support';
    case 'tech support':
      return 'tech-support';
    case 'account support':
      return 'account-support';
    case 'exploring':
    default:
      return 'explore';
  }
}

function itemFitsSelectedProducts(item: CatalogItem, context: SalesContext): boolean {
  const products = context.product.length > 0 ? context.product : ['No Specific Product'];
  if (products.includes('No Specific Product')) return false;
  if (products.includes('Phone') && PHONE_CATEGORIES.has(item.category)) return true;
  if (products.includes('BTS') && BTS_CATEGORIES.has(item.category)) return true;
  if (products.includes('IOT') && IOT_CATEGORIES.has(item.category)) return true;

  if (products.includes('Home Internet')) {
    return false;
  }

  return false;
}

function ecosystemAllowed(item: CatalogItem, context: SalesContext): boolean {
  if (item.ecosystem === 'all') return true;

  const platform = context.desiredPlatform ?? context.currentPlatform;
  const brand = context.currentDeviceBrand?.toLowerCase() ?? '';

  if (platform === 'iOS') return item.ecosystem === 'apple';
  if (platform === 'Android') {
    if (brand.includes('samsung')) return item.ecosystem === 'samsung' || item.ecosystem === 'android';
    if (brand.includes('pixel')) return item.ecosystem === 'pixel' || item.ecosystem === 'android';
    return item.ecosystem === 'android' || item.ecosystem === 'samsung' || item.ecosystem === 'pixel';
  }

  return true;
}

function scoreCatalogItem(
  item: CatalogItem,
  context: SalesContext,
  workflow: OfferWorkflow,
  signals: CustomerSignal[]
): number {
  let score = item.workflowWeights[workflow] ?? 0.2;

  for (const signal of signals) {
    if (item.signalTags.includes(signal.tag)) score += signal.strength * 0.55;
  }

  if (context.product.includes('Phone')) {
    if (item.category === 'p360') score += 0.35;
    if (item.category === 'case' || item.category === 'screen' || item.category === 'charger') score += 0.3;
  }

  if (context.product.includes('BTS')) {
    if (item.category === 'watch' || item.category === 'kids-watch' || item.category === 'tracker') score += 0.5;
  }

  if (context.product.includes('IOT') && item.category === 'tracker') score += 0.75;
  if (context.hintAvailable === false && item.category === 'tracker') score += 0.25;
  if (context.familyCount != null && context.familyCount >= 3 && ['tracker', 'kids-watch', 'screen'].includes(item.category)) score += 0.35;
  if (context.totalLines != null && context.totalLines >= 3 && ['screen', 'charger', 'tracker'].includes(item.category)) score += 0.25;

  if (context.age === '55+' && ['p360', 'screen', 'charger'].includes(item.category)) score += 0.35;
  if (context.age === '18-24' && ['audio', 'battery', 'other'].includes(item.category)) score += 0.25;
  if (context.age === '35-54' && ['p360', 'tracker', 'mount'].includes(item.category)) score += 0.25;

  if (item.sourceUrl) score += 0.08;
  if ((item.knowledgeFeatures?.length ?? 0) > 0) score += 0.08;
  if ((item.knowledgeBenefits?.length ?? 0) > 0) score += 0.08;

  return score;
}

function selectDiverseItems(
  scored: Array<{ item: CatalogItem; score: number }>,
  limit: number
): Array<{ item: CatalogItem; score: number }> {
  const selected: Array<{ item: CatalogItem; score: number }> = [];
  const selectedIds = new Set<string>();
  const selectedGroups = new Set<string>();
  const categoryCounts = new Map<CatalogItem['category'], number>();

  for (const entry of scored) {
    if (selected.length >= limit) break;

    const categoryCount = categoryCounts.get(entry.item.category) ?? 0;
    if (selectedGroups.has(entry.item.replacementGroup) && selected.length < 4) continue;
    if (categoryCount >= 2) continue;

    selected.push(entry);
    selectedIds.add(entry.item.id);
    selectedGroups.add(entry.item.replacementGroup);
    categoryCounts.set(entry.item.category, categoryCount + 1);
  }

  if (selected.length >= limit) return selected;

  for (const entry of scored) {
    if (selected.length >= limit) break;
    if (selectedIds.has(entry.item.id)) continue;
    selected.push(entry);
    selectedIds.add(entry.item.id);
  }

  return selected;
}

function buildRecommendation(
  item: CatalogItem,
  context: SalesContext,
  signals: CustomerSignal[],
  displayChips: string[]
): AccessoryRecommendation {
  const accuracy = getAccessoryBundleAccuracy(item.id) ?? getAccessoryBundleAccuracy(item.name);
  const quoteSafe = canKipQuoteAccessoryBundleEligibility(item.id) || canKipQuoteAccessoryBundleEligibility(item.name);
  const eligibilityStatus = getEligibilityStatus(item, quoteSafe);
  const proofText = item.category === 'p360'
    ? sanitizeP360CopyForContext(getProofText(item), context)
    : getProofText(item);
  const matchedTags = getMatchedReasonTags(item, context, signals);

  return {
    itemId: item.id,
    name: item.name,
    why: item.category === 'p360'
      ? sanitizeP360CopyForContext(buildWhyText(item, proofText, displayChips), context)
      : buildWhyText(item, proofText, displayChips),
    priceRange: getPriceLabel(item),
    verifiedPrices: buildVerifiedPrices(item),
    brands: inferBrands(item),
    bundleEligible: quoteSafe,
    sourceUrl: item.sourceUrl,
    confidence: item.knowledgeConfidence,
    proofText,
    reasonTags: matchedTags,
    eligibilityStatus,
    reviewStatus: accuracy?.reviewStatus,
  };
}

function getEligibilityStatus(
  item: CatalogItem,
  quoteSafe: boolean
): AccessoryBundleEligibilityStatus {
  if (quoteSafe) return 'quote-safe';

  const accuracy = getAccessoryBundleAccuracy(item.id) ?? getAccessoryBundleAccuracy(item.name);
  if (accuracy?.actualEligible === true || itemQualifiesForPromoSet(item, ESSENTIAL_ACCESSORIES_PROMO_SET_ID)) {
    return 'review-required';
  }

  if (
    accuracy?.actualEligible === false
    || NON_BUNDLE_CATEGORIES.has(item.category)
    || item.qualifyingSetIds.length === 0
  ) {
    return 'not-eligible';
  }

  return 'not-applicable';
}

function buildWhyText(item: CatalogItem, proofText: string, displayChips: string[]): string {
  const contextReason = displayChips.length
    ? `Fit signal: ${displayChips.slice(0, 2).join(', ')}.`
    : '';

  const sourceLine = firstUsefulLine(
    item.knowledgeBenefits?.map((benefit) => benefit.benefit),
    item.knowledgeFeatures?.map((feature) => feature.customerBenefit || feature.featureValue || feature.proofText),
    [item.why, proofText]
  );

  return conciseText([sourceLine, contextReason].filter(Boolean).join(' '), 280);
}

function getProofText(item: CatalogItem): string {
  return conciseText(
    firstUsefulLine(
      item.knowledgeFeatures?.map((feature) => feature.proofText || feature.featureValue),
      item.knowledgeSpecs?.map((spec) => `${spec.specName}: ${spec.specValue}`),
      item.knowledgeBenefits?.map((benefit) => benefit.benefit),
      [item.why]
    ),
    240
  );
}

function firstUsefulLine(...groups: Array<Array<string | undefined> | undefined>): string {
  for (const group of groups) {
    const found = group?.find((value) => cleanText(value).length > 0);
    if (found) return cleanText(found);
  }
  return '';
}

function getPriceLabel(item: CatalogItem): string {
  return item.salePriceLabel || item.priceLabel || (typeof item.price === 'number' ? formatPrice(item.price) : 'Verify current price');
}

function buildVerifiedPrices(item: CatalogItem): AccessoryRecommendation['verifiedPrices'] {
  if (!item.priceLabel && typeof item.price !== 'number') return undefined;
  return [{
    item: item.name,
    fullPrice: item.priceLabel || formatPrice(item.price ?? 0),
    salePrice: item.salePriceLabel,
  }];
}

function inferBrands(item: CatalogItem): string[] {
  const haystack = `${item.name} ${item.pitch} ${item.why}`.toLowerCase();
  const matched = BRAND_HINTS.filter((brand) => haystack.includes(brand.toLowerCase()));
  if (matched.length > 0) return [...new Set(matched)].slice(0, 3);
  if (item.ecosystem === 'apple') return ['Apple'];
  if (item.ecosystem === 'samsung') return ['Samsung'];
  if (item.ecosystem === 'pixel') return ['Google'];
  return ['T-Mobile'];
}

function getMatchedReasonTags(
  item: CatalogItem,
  context: SalesContext,
  signals: CustomerSignal[]
): string[] {
  const itemTagSet = new Set([
    ...item.signalTags,
    ...item.styleTags,
    ...item.lifestyleTags,
    ...(item.knowledgeFeatures?.flatMap((feature) => [
      ...feature.listenForTags,
      ...feature.demographicTags,
      ...feature.compatibilityTags,
    ]) ?? []),
    ...(item.knowledgeBenefits?.flatMap((benefit) => benefit.customerType) ?? []),
    ...(item.knowledgeCompatibility?.flatMap((entry) => entry.compatibilityTags) ?? []),
  ]);

  const matchedSignals = signals
    .filter((signal) => itemTagSet.has(signal.tag))
    .map((signal) => signal.tag);

  return [
    ...matchedSignals,
    context.age !== 'Not Specified' ? context.age.toLowerCase().replace('+', '-plus') : '',
    context.region !== 'Not Specified' ? context.region.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '',
    context.state ? context.state.toLowerCase() : '',
    ...item.signalTags,
  ].filter(Boolean).filter((tag, index, tags) => tags.indexOf(tag) === index).slice(0, 10);
}

function cleanText(value?: string): string {
  return (value ?? '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*_`~]/g, '')
    .replace(/^"+|"+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function conciseText(value: string, maxLength: number): string {
  const cleaned = cleanText(value);
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 3).trimEnd()}...`;
}

function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}
