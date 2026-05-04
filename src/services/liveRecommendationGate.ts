import type { AccessoryRecommendation, CatalogItem, SalesContext } from '../types';

type Category = CatalogItem['category'];

const PHONE_ALLOWED: Category[] = ['p360', 'case', 'screen', 'charger', 'battery', 'mount'];
const LINE_CHANGE_ALLOWED: Category[] = ['watch', 'kids-watch', 'tracker'];
const EMPTY: Category[] = [];

export interface LiveRecommendationGateResult {
  allowedCategories: Category[];
  suppressedCategories: Category[];
  emptyReason?: string;
  canMentionAppleCare: boolean;
  platform: 'apple' | 'android' | 'unknown';
  proofText: string;
}

function hasProduct(context: SalesContext, product: SalesContext['product'][number]): boolean {
  return context.product.includes(product);
}

function isSupportIntent(context: SalesContext): boolean {
  return ['order support', 'tech support', 'account support'].includes(context.purchaseIntent);
}

function hasExplicitLineSignal(context: SalesContext): boolean {
  return (
    hasProduct(context, 'BTS')
    || hasProduct(context, 'IOT')
    || context.supportFocus === 'account_line_change'
    || context.profilePreset === 'family-household'
    || (context.householdTags ?? []).some((tag) => ['kids', 'family-household', 'caregiver', 'traveler'].includes(tag))
  );
}

export function getCustomerPlatform(context: SalesContext): LiveRecommendationGateResult['platform'] {
  const platform = context.desiredPlatform && context.desiredPlatform !== 'Not Specified'
    ? context.desiredPlatform
    : context.currentPlatform;
  const brand = context.currentDeviceBrand?.toLowerCase() ?? '';

  if (platform === 'iOS' || brand.includes('iphone') || brand.includes('apple')) return 'apple';
  if (platform === 'Android' || brand.includes('samsung') || brand.includes('pixel') || brand.includes('motorola')) return 'android';
  return 'unknown';
}

export function buildLiveRecommendationGate(context: SalesContext): LiveRecommendationGateResult {
  const platform = getCustomerPlatform(context);
  const products = context.product.length > 0 ? context.product : ['No Specific Product'];
  const isHomeInternetOnly = products.includes('Home Internet') && products.every((product) => product === 'Home Internet');

  if (products.includes('No Specific Product')) {
    return {
      allowedCategories: EMPTY,
      suppressedCategories: ['p360', 'case', 'screen', 'charger', 'battery', 'mount', 'audio', 'watch', 'kids-watch', 'tracker'],
      emptyReason: 'No strong add-on fit yet. Ask what product they are solving for first.',
      canMentionAppleCare: platform === 'apple',
      platform,
      proofText: 'No specific product selected.',
    };
  }

  if (context.purchaseIntent === 'order support') {
    return {
      allowedCategories: EMPTY,
      suppressedCategories: ['p360', 'case', 'screen', 'charger', 'battery', 'mount', 'watch', 'kids-watch', 'tracker'],
      emptyReason: 'Fix the order first. Earn any product pivot after the issue is stable.',
      canMentionAppleCare: platform === 'apple',
      platform,
      proofText: 'Order support lane suppresses add-ons by default.',
    };
  }

  if (context.purchaseIntent === 'account support' && context.supportFocus !== 'account_line_change') {
    return {
      allowedCategories: EMPTY,
      suppressedCategories: ['p360', 'case', 'screen', 'charger', 'battery', 'mount', 'watch', 'kids-watch', 'tracker'],
      emptyReason: 'Account and billing calls should start with the account answer, not an add-on.',
      canMentionAppleCare: platform === 'apple',
      platform,
      proofText: 'Account support lane suppresses add-ons unless the caller is changing lines.',
    };
  }

  if (isHomeInternetOnly) {
    return {
      allowedCategories: EMPTY,
      suppressedCategories: ['p360', 'case', 'screen', 'charger', 'battery', 'mount', 'watch', 'kids-watch', 'tracker'],
      emptyReason: 'Home Internet-only calls should stay on address, setup, and plan fit unless another product comes up.',
      canMentionAppleCare: platform === 'apple',
      platform,
      proofText: 'Home Internet-only lane suppresses device accessories.',
    };
  }

  if (context.purchaseIntent === 'account support' && context.supportFocus === 'account_line_change') {
    return {
      allowedCategories: hasExplicitLineSignal(context) ? LINE_CHANGE_ALLOWED : EMPTY,
      suppressedCategories: PHONE_ALLOWED,
      emptyReason: hasExplicitLineSignal(context) ? undefined : 'Ask who the new line is for before recommending a watch, tracker, or tablet.',
      canMentionAppleCare: platform === 'apple',
      platform,
      proofText: 'Line-change lane allows connected devices only when the caller gives a line or household signal.',
    };
  }

  if (isSupportIntent(context) && !hasProduct(context, 'Phone') && !hasProduct(context, 'BTS') && !hasProduct(context, 'IOT')) {
    return {
      allowedCategories: EMPTY,
      suppressedCategories: ['p360', 'case', 'screen', 'charger', 'battery', 'mount', 'watch', 'kids-watch', 'tracker'],
      emptyReason: 'Support call has no product signal yet. Resolve first, then ask one qualifying question.',
      canMentionAppleCare: platform === 'apple',
      platform,
      proofText: 'Support lane has no product signal.',
    };
  }

  const allowed = new Set<Category>();
  if (hasProduct(context, 'Phone')) PHONE_ALLOWED.forEach((category) => allowed.add(category));
  if ((hasProduct(context, 'BTS') || hasProduct(context, 'IOT')) && hasExplicitLineSignal(context)) {
    LINE_CHANGE_ALLOWED.forEach((category) => allowed.add(category));
  }

  return {
    allowedCategories: [...allowed],
    suppressedCategories: ['audio', 'plan', 'other'],
    emptyReason: allowed.size === 0 ? 'No strong add-on fit right now. Keep the relationship clean.' : undefined,
    canMentionAppleCare: platform === 'apple',
    platform,
    proofText: 'Allowed categories are derived from live lane, product focus, platform, and support focus.',
  };
}

export function isCatalogItemAllowedByLiveGate(
  item: Pick<CatalogItem, 'category'>,
  gate: LiveRecommendationGateResult
): boolean {
  return gate.allowedCategories.includes(item.category);
}

export function sanitizeP360CopyForContext(value: string, context: SalesContext): string {
  if (buildLiveRecommendationGate(context).canMentionAppleCare) return value;

  const cleaned = value
    .replace(/AppleCare\+[^.]*\.\s*/gi, '')
    .replace(/AppleCare[^.]*\.\s*/gi, '')
    .replace(/Includes AppleCare Services for iPhones \(first 24 months\),?\s*/gi, '')
    .replace(/AppleCare Services for iPhones \(first 24 months\),?\s*/gi, '')
    .replace(/AppleCare Services included for iPhones\.?\s*/gi, '')
    .replace(/\s*Better than AppleCare\+ alone\.?/gi, '')
    .replace(/\s*PLUS loss\/theft coverage/gi, ' plus loss/theft coverage')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return 'Universal Protection 360 benefits apply. Confirm device tier before quoting monthly cost.';
  if (/confirm device tier/i.test(cleaned)) return cleaned;
  return `${cleaned} Confirm device tier before quoting monthly cost.`;
}

export function applyLiveGateToRecommendations(
  recommendations: AccessoryRecommendation[],
  context: SalesContext
): AccessoryRecommendation[] {
  const gate = buildLiveRecommendationGate(context);
  if (gate.allowedCategories.length === 0) return [];

  return recommendations
    .filter((item) => {
      const category = getRecommendationCategory(item);
      return category ? gate.allowedCategories.includes(category) : true;
    })
    .map((item) => ({
      ...item,
      why: item.itemId === 'p360' || /protection 360|p360/i.test(item.name)
        ? sanitizeP360CopyForContext(item.why, context)
        : item.why,
      proofText: item.proofText && (/protection 360|p360/i.test(item.name) || item.itemId === 'p360')
        ? sanitizeP360CopyForContext(item.proofText, context)
        : item.proofText,
    }));
}

export function getPrimaryLiveAttach(
  recommendations: AccessoryRecommendation[],
  context: SalesContext
): AccessoryRecommendation | null {
  return applyLiveGateToRecommendations(recommendations, context)[0] ?? null;
}

function getRecommendationCategory(item: AccessoryRecommendation): Category | null {
  const haystack = `${item.itemId ?? ''} ${item.name}`.toLowerCase();
  if (/p360|protection 360/.test(haystack)) return 'p360';
  if (/case/.test(haystack)) return 'case';
  if (/screen|glass|protector/.test(haystack)) return 'screen';
  if (/charger|cable|usb|magsafe|qi2|wireless/.test(haystack)) return 'charger';
  if (/battery|power bank|mophie/.test(haystack)) return 'battery';
  if (/mount|car/.test(haystack)) return 'mount';
  if (/watch/.test(haystack)) return 'watch';
  if (/tracker|syncup/.test(haystack)) return 'tracker';
  if (/airpod|buds|beats|headphone|earbud|audio/.test(haystack)) return 'audio';
  return null;
}
