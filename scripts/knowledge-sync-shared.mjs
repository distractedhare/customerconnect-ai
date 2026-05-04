const IMAGE_EXTENSION_RE = /\.(png|jpe?g|webp|gif|svg)(?:$|[?#])/i;
const TMOBILE_SCENE7_RE = /\/is\/image\//i;
const PAGE_URL_RE = /^https?:\/\/(?:www\.)?t-mobile\.com\/(?!content\/dam\/)/i;
const ACCESSORY_IMAGE_PATH_RE = /\/accessor(?:y|ies)\//i;
const GENERIC_DEVICE_IMAGE_RE = /apple_intelligence_mark/i;

const CORE_RECORD_TYPES = new Set([
  'device-detail',
  'accessory-detail',
  'plan-detail',
  'home-internet-detail',
]);

const SOURCE_PAGE_TYPES = new Set(['detail', 'overview', 'collection', 'missing']);

const CURATED_SOURCE_PATTERNS = {
  device: 'customerconnect-ai/src/data/devices.ts',
  accessory: 'customerconnect-ai/src/data/accessoryCatalog.ts',
  plan: 'customerconnect-ai/src/data/plans.ts',
};

function asString(value) {
  if (value == null) return '';
  return typeof value === 'string' ? value : String(value);
}

function normalizeWhitespace(value) {
  return asString(value).replace(/\s+/g, ' ').trim();
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .flatMap((entry) => toStringArray(entry))
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  if (value == null) return [];

  const raw = normalizeWhitespace(value);
  if (!raw) return [];
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((entry) => normalizeWhitespace(entry))
      .filter(Boolean);
  }

  return [raw];
}

function maybeNumber(value) {
  if (typeof value === 'number') return value;
  if (value == null || value === '') return null;
  return asString(value);
}

function serializeStable(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => serializeStable(entry)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${serializeStable(value[key])}`).join(',')}}`;
  }

  return JSON.stringify(value);
}

export function normalizeKnowledgeKey(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeKnowledgePath(value) {
  const raw = normalizeWhitespace(value);
  if (!raw) return '';

  try {
    return new URL(raw).pathname.toLowerCase().replace(/\/+$/, '') || '/';
  } catch {
    return raw.toLowerCase().replace(/\/+$/, '');
  }
}

function normalizePageUrl(value) {
  const raw = normalizeWhitespace(value);
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return raw.replace(/\/+$/, '');
  }
}

function normalizeImageUrl(value) {
  const raw = normalizeWhitespace(value);
  if (!raw) return '';

  if (raw.includes(',')) return '';
  if (/\s/.test(raw)) return '';
  if (PAGE_URL_RE.test(raw) && !IMAGE_EXTENSION_RE.test(raw) && !TMOBILE_SCENE7_RE.test(raw)) return '';
  if (!IMAGE_EXTENSION_RE.test(raw) && !TMOBILE_SCENE7_RE.test(raw)) return '';

  return raw;
}

export function isValidImageUrl(value) {
  return Boolean(normalizeImageUrl(value));
}

function flattenImageCandidates(...values) {
  return values.flatMap((value) => {
    if (Array.isArray(value)) return flattenImageCandidates(...value);
    if (value == null) return [];
    return toStringArray(value);
  });
}

function rankImageCandidate(url) {
  const lower = url.toLowerCase();
  let score = 0;

  if (lower.includes('thumbnail')) score += 40;
  if (lower.includes('hero')) score += 36;
  if (lower.includes('front')) score += 24;
  if (lower.includes('main')) score += 18;
  if (lower.includes('scene7') || lower.includes('/is/image/')) score += 20;
  if (lower.includes('content/dam')) score += 12;
  if (lower.includes('swatch')) score -= 18;
  if (lower.includes('logo') || lower.includes('badge') || lower.includes('icon')) score -= 40;

  return score;
}

export function pickHeroImageUrl(...values) {
  const candidates = [...new Set(flattenImageCandidates(...values).map(normalizeImageUrl).filter(Boolean))];
  if (candidates.length === 0) return '';

  return candidates
    .map((url) => ({ url, score: rankImageCandidate(url) }))
    .sort((left, right) => right.score - left.score || left.url.localeCompare(right.url))[0]?.url || '';
}

function isUnsafeDeviceImageUrl(value) {
  const url = normalizeImageUrl(value);
  if (!url) return false;
  return ACCESSORY_IMAGE_PATH_RE.test(url) || GENERIC_DEVICE_IMAGE_RE.test(url);
}

function getRecordImageKind(recordType) {
  if (recordType === 'device-detail') return 'device';
  if (recordType === 'accessory-detail') return 'accessory';
  return 'other';
}

function imageMatchesRecordKind(image, recordType) {
  const relativePath = normalizeWhitespace(image.relativePath).toLowerCase();
  const imageKind = getRecordImageKind(recordType);

  if (imageKind === 'device' && relativePath && !relativePath.startsWith('images/devices/')) return false;
  if (imageKind === 'accessory' && relativePath && !relativePath.startsWith('images/accessories/')) return false;
  if (imageKind === 'device' && isUnsafeDeviceImageUrl(image.sourceUrl)) return false;

  return true;
}

function filterImagesForRecord(recordType, images) {
  return images.filter((image) => imageMatchesRecordKind(image, recordType));
}

function sourceKindForImage(entry, sourceUrl) {
  const explicit = normalizeWhitespace(entry.sourceKind);
  if (['official', 'official-enhanced', 'generated-fallback', 'brand-placeholder'].includes(explicit)) {
    return explicit;
  }

  const status = normalizeWhitespace(entry.status).toLowerCase();
  if (status.includes('generated')) return 'generated-fallback';
  if (status.includes('enhanced')) return 'official-enhanced';
  if (sourceUrl) return 'official';
  return 'brand-placeholder';
}

export function classifyKnowledgeRecord({ itemType, category, sourceUrl }) {
  const type = normalizeWhitespace(itemType).toLowerCase();
  const categoryKey = normalizeKnowledgeKey(category);
  const sourcePath = normalizeKnowledgePath(sourceUrl);

  if (
    type.includes('collection')
    || sourcePath === '/cell-phones'
    || sourcePath.startsWith('/accessories/compatible-with/')
    || sourcePath === '/accessories'
    || sourcePath.startsWith('/tablets')
    || sourcePath.startsWith('/smart-watches')
    || sourcePath.startsWith('/hotspots-iot-connected-devices')
  ) {
    return 'collection-page';
  }

  if (type === 'home-internet' || sourcePath.startsWith('/home-internet')) return 'home-internet-detail';
  if (type === 'plan' || sourcePath.startsWith('/cell-phone-plans')) return 'plan-detail';

  if (
    type === 'offer'
    || type === 'promo'
    || sourcePath.startsWith('/offers')
    || sourcePath.includes('/deals')
  ) {
    return 'offer-detail';
  }

  if (
    type === 'device'
    || sourcePath.startsWith('/cell-phone/')
    || sourcePath.startsWith('/tablet/')
    || sourcePath.startsWith('/smart-watch/')
    || sourcePath.startsWith('/hotspot')
  ) {
    return 'device-detail';
  }

  if (
    type === 'accessory'
    || type === 'protection'
    || type === 'wearable'
    || type === 'tracker'
    || type === 'service'
    || ['p360', 'case', 'screen', 'charger', 'battery', 'mount', 'audio', 'watch', 'kids-watch', 'tracker', 'plan'].includes(categoryKey)
    || sourcePath.startsWith('/accessory/')
  ) {
    return 'accessory-detail';
  }

  if (
    ['iphone', 'samsung', 'pixel', 'other', 'tablet', 'watch', 'hotspot'].includes(categoryKey)
  ) {
    return 'device-detail';
  }

  return 'other';
}

export function getKnowledgeDetailLevel(recordType) {
  if (recordType === 'collection-page') return 'collection';
  if (recordType === 'other') return 'other';
  return 'detail';
}

export function deriveSourcePageType({ itemType, sourceUrl, recordType }) {
  const sourcePath = normalizeKnowledgePath(sourceUrl);
  if (!sourcePath) return 'missing';

  const type = normalizeWhitespace(itemType).toLowerCase();
  const record = recordType || classifyKnowledgeRecord({ itemType, category: '', sourceUrl });

  if (record === 'collection-page' || type.includes('collection')) return 'collection';
  if (record === 'plan-detail' || record === 'home-internet-detail') return 'overview';
  if (record === 'offer-detail' && sourcePath.startsWith('/offers')) return 'overview';
  return 'detail';
}

function normalizeFeature(feature) {
  return {
    itemId: asString(feature.itemId),
    featureName: normalizeWhitespace(feature.featureName),
    featureValue: normalizeWhitespace(feature.featureValue),
    featureCategory: normalizeWhitespace(feature.featureCategory),
    customerBenefit: normalizeWhitespace(feature.customerBenefit),
    salesUseCase: normalizeWhitespace(feature.salesUseCase),
    listenForTags: toStringArray(feature.listenForTags),
    demographicTags: toStringArray(feature.demographicTags),
    compatibilityTags: toStringArray(feature.compatibilityTags),
    proofText: normalizeWhitespace(feature.proofText),
    sourceUrl: normalizePageUrl(feature.sourceUrl),
    confidence: normalizeWhitespace(feature.confidence),
  };
}

function normalizeSpec(spec) {
  return {
    itemId: asString(spec.itemId),
    specName: normalizeWhitespace(spec.specName),
    specValue: normalizeWhitespace(spec.specValue),
    specCategory: normalizeWhitespace(spec.specCategory),
    sourceUrl: normalizePageUrl(spec.sourceUrl),
    confidence: normalizeWhitespace(spec.confidence),
  };
}

function normalizeBenefit(benefit) {
  return {
    itemId: asString(benefit.itemId),
    benefit: normalizeWhitespace(benefit.benefit),
    customerType: toStringArray(benefit.customerType),
    salesUseCase: normalizeWhitespace(benefit.salesUseCase),
    sourceUrl: normalizePageUrl(benefit.sourceUrl),
    confidence: normalizeWhitespace(benefit.confidence),
  };
}

function normalizeCompatibility(entry) {
  return {
    itemId: asString(entry.itemId),
    worksWith: normalizeWhitespace(entry.worksWith),
    compatibilityTags: toStringArray(entry.compatibilityTags),
    sourceUrl: normalizePageUrl(entry.sourceUrl),
    confidence: normalizeWhitespace(entry.confidence),
  };
}

function normalizePhonePlan(entry) {
  return {
    itemId: asString(entry.itemId),
    planName: normalizeWhitespace(entry.planName),
    planSection: normalizeWhitespace(entry.planSection),
    tier: normalizeWhitespace(entry.tier),
    status: normalizeWhitespace(entry.status),
    sourceKind: normalizeWhitespace(entry.sourceKind),
    startingPrice: normalizeWhitespace(entry.startingPrice),
    priceSummary: normalizeWhitespace(entry.priceSummary),
    headlineFeatures: normalizeWhitespace(entry.headlineFeatures),
    eligibility: normalizeWhitespace(entry.eligibility),
    limitations: normalizeWhitespace(entry.limitations),
    notes: normalizeWhitespace(entry.notes),
    sourceUrl: normalizePageUrl(entry.sourceUrl),
    confidence: normalizeWhitespace(entry.confidence),
  };
}

function normalizePlanBreakdown(entry) {
  return {
    itemId: asString(entry.itemId),
    planName: normalizeWhitespace(entry.planName),
    planType: normalizeWhitespace(entry.planType),
    tier: normalizeWhitespace(entry.tier),
    status: normalizeWhitespace(entry.status),
    lineCount: typeof entry.lineCount === 'number' ? entry.lineCount : normalizeWhitespace(entry.lineCount),
    monthlyTotal: normalizeWhitespace(entry.monthlyTotal),
    perLine: normalizeWhitespace(entry.perLine),
    insiderMonthlyTotal: normalizeWhitespace(entry.insiderMonthlyTotal),
    insiderPerLine: normalizeWhitespace(entry.insiderPerLine),
    promoNote: normalizeWhitespace(entry.promoNote),
    autoPayNote: normalizeWhitespace(entry.autoPayNote),
    taxesFeesNote: normalizeWhitespace(entry.taxesFeesNote),
    premiumData: normalizeWhitespace(entry.premiumData),
    hotspot: normalizeWhitespace(entry.hotspot),
    videoStreaming: normalizeWhitespace(entry.videoStreaming),
    streamingPerks: normalizeWhitespace(entry.streamingPerks),
    mexicoCanada: normalizeWhitespace(entry.mexicoCanada),
    international: normalizeWhitespace(entry.international),
    satellite: normalizeWhitespace(entry.satellite),
    upgradePolicy: normalizeWhitespace(entry.upgradePolicy),
    priceGuarantee: normalizeWhitespace(entry.priceGuarantee),
    scamShield: normalizeWhitespace(entry.scamShield),
    connectedDevicePricing: normalizeWhitespace(entry.connectedDevicePricing),
    eligibility: normalizeWhitespace(entry.eligibility),
    limitations: normalizeWhitespace(entry.limitations),
    notes: normalizeWhitespace(entry.notes),
    sourceUrl: normalizePageUrl(entry.sourceUrl),
    confidence: normalizeWhitespace(entry.confidence),
  };
}

function normalizePromo(entry) {
  return {
    promoId: asString(entry.promoId),
    name: normalizeWhitespace(entry.name),
    promoSetId: asString(entry.promoSetId),
    details: normalizeWhitespace(entry.details),
    requiredQty: typeof entry.requiredQty === 'number' ? entry.requiredQty : null,
    discountPct: typeof entry.discountPct === 'number' ? entry.discountPct : null,
    finePrint: normalizeWhitespace(entry.finePrint),
    sourceUrl: normalizePageUrl(entry.sourceUrl),
    confidence: normalizeWhitespace(entry.confidence),
    source: normalizeWhitespace(entry.source),
  };
}

function normalizePromoEligibility(entry) {
  return {
    itemId: asString(entry.itemId),
    promoSetId: asString(entry.promoSetId),
    eligible: Boolean(entry.eligible),
    exclusionReason: normalizeWhitespace(entry.exclusionReason),
    reviewStatus: normalizeWhitespace(entry.reviewStatus),
  };
}

function normalizePromoAccuracy(entry) {
  return {
    itemId: asString(entry.itemId),
    itemName: normalizeWhitespace(entry.itemName),
    itemType: normalizeWhitespace(entry.itemType),
    category: normalizeWhitespace(entry.category),
    promoSetId: asString(entry.promoSetId),
    canonicalPromoSetId: asString(entry.canonicalPromoSetId),
    appPromoAlias: asString(entry.appPromoAlias),
    appCatalogQualifyingSetIds: toStringArray(entry.appCatalogQualifyingSetIds),
    appCatalogEligible: Boolean(entry.appCatalogEligible),
    firecrawlPromoMention: Boolean(entry.firecrawlPromoMention),
    expectedEligible: Boolean(entry.expectedEligible),
    actualEligible: Boolean(entry.actualEligible),
    exclusionReason: normalizeWhitespace(entry.exclusionReason),
    sourceEvidence: normalizeWhitespace(entry.sourceEvidence),
    checkerVerdict: normalizeWhitespace(entry.checkerVerdict),
    reviewStatus: normalizeWhitespace(entry.reviewStatus),
    sourceUrl: normalizePageUrl(entry.sourceUrl),
    lastCheckedAt: normalizeWhitespace(entry.lastCheckedAt),
  };
}

function normalizeAccuracyCheck(entry) {
  return {
    checkId: asString(entry.checkId),
    severity: normalizeWhitespace(entry.severity),
    itemId: asString(entry.itemId),
    itemName: normalizeWhitespace(entry.itemName),
    promoSetId: asString(entry.promoSetId),
    expectedValue: normalizeWhitespace(entry.expectedValue),
    actualValue: normalizeWhitespace(entry.actualValue),
    evidence: normalizeWhitespace(entry.evidence),
    sourceUrl: normalizePageUrl(entry.sourceUrl),
    recommendedAction: normalizeWhitespace(entry.recommendedAction),
    status: normalizeWhitespace(entry.status),
  };
}

function normalizeSalesTag(entry) {
  return {
    itemId: asString(entry.itemId),
    tag: normalizeWhitespace(entry.tag),
    tagType: normalizeWhitespace(entry.tagType),
    source: normalizeWhitespace(entry.source),
    confidence: normalizeWhitespace(entry.confidence),
  };
}

function normalizeReviewItem(entry) {
  return {
    itemId: asString(entry.itemId),
    issue: normalizeWhitespace(entry.issue),
    field: normalizeWhitespace(entry.field),
    currentValue: normalizeWhitespace(entry.currentValue),
    sourceUrl: normalizePageUrl(entry.sourceUrl),
    priority: normalizeWhitespace(entry.priority),
  };
}

function normalizeImage(entry) {
  const sourceUrl = pickHeroImageUrl(entry.sourceUrl);
  const sourceKind = sourceKindForImage(entry, sourceUrl);
  const reviewStatus = normalizeWhitespace(entry.reviewStatus) || (entry.needsReview ? 'needs-review' : 'approved');

  return {
    itemId: asString(entry.itemId),
    imageSlug: normalizeKnowledgeKey(entry.imageSlug || entry.relativePath || entry.sourceUrl || entry.itemId),
    relativePath: normalizeWhitespace(entry.relativePath),
    sourceUrl,
    status: normalizeWhitespace(entry.status),
    needsReview: Boolean(entry.needsReview),
    sourceKind,
    reviewStatus,
    confidence: normalizeWhitespace(entry.confidence) || (sourceUrl ? sourceKind : 'planned-or-existing-app-path'),
  };
}

function indexByItemId(entries) {
  return entries.reduce((map, entry) => {
    const list = map.get(entry.itemId) ?? [];
    list.push(entry);
    map.set(entry.itemId, list);
    return map;
  }, new Map());
}

function mergeImages(knowledgeImages, manifestImages) {
  const merged = new Map();

  for (const image of [...knowledgeImages, ...manifestImages].map(normalizeImage)) {
    const key = `${image.itemId}::${image.relativePath || image.imageSlug || image.sourceUrl}`;
    const current = merged.get(key);

    merged.set(key, current
      ? {
          ...current,
          ...image,
          sourceUrl: current.sourceUrl || image.sourceUrl,
          relativePath: current.relativePath || image.relativePath,
          needsReview: current.needsReview && image.needsReview,
        }
      : image);
  }

  return [...merged.values()].sort((left, right) => {
    if (left.itemId === right.itemId) {
      return serializeStable(left).localeCompare(serializeStable(right));
    }
    return left.itemId.localeCompare(right.itemId);
  });
}

function dedupeEntries(entries) {
  const deduped = new Map();

  for (const entry of entries.filter(Boolean)) {
    const key = serializeStable(entry);
    if (!deduped.has(key)) deduped.set(key, entry);
  }

  return [...deduped.values()];
}

function buildSearchText(record) {
  return [
    record.name,
    record.brand,
    record.category,
    record.itemType,
    record.sourceUrl,
    record.priceLabel,
    ...record.features.flatMap((feature) => [
      feature.featureName,
      feature.featureValue,
      feature.customerBenefit,
      feature.salesUseCase,
      feature.proofText,
      ...feature.listenForTags,
      ...feature.demographicTags,
      ...feature.compatibilityTags,
    ]),
    ...record.specs.flatMap((spec) => [spec.specName, spec.specValue, spec.specCategory]),
    ...record.benefits.flatMap((benefit) => [benefit.benefit, benefit.salesUseCase, ...benefit.customerType]),
    ...record.compatibility.flatMap((entry) => [entry.worksWith, ...entry.compatibilityTags]),
    ...record.phonePlans.flatMap((entry) => [
      entry.planName,
      entry.planSection,
      entry.tier,
      entry.startingPrice,
      entry.priceSummary,
      entry.headlineFeatures,
      entry.eligibility,
      entry.limitations,
      entry.notes,
    ]),
    ...record.planBreakdown.flatMap((entry) => [
      entry.planName,
      entry.planType,
      entry.lineCount,
      entry.monthlyTotal,
      entry.perLine,
      entry.insiderMonthlyTotal,
      entry.insiderPerLine,
      entry.promoNote,
      entry.autoPayNote,
      entry.taxesFeesNote,
      entry.premiumData,
      entry.hotspot,
      entry.videoStreaming,
      entry.streamingPerks,
      entry.mexicoCanada,
      entry.international,
      entry.satellite,
      entry.upgradePolicy,
      entry.priceGuarantee,
      entry.scamShield,
      entry.connectedDevicePricing,
      entry.eligibility,
      entry.limitations,
      entry.notes,
    ]),
    ...record.promoAccuracy.flatMap((entry) => [
      entry.promoSetId,
      entry.checkerVerdict,
      entry.reviewStatus,
      entry.exclusionReason,
      entry.sourceEvidence,
    ]),
    ...record.accuracyChecks.flatMap((entry) => [
      entry.severity,
      entry.status,
      entry.expectedValue,
      entry.actualValue,
      entry.evidence,
    ]),
    ...record.salesTags.map((tag) => `${tag.tagType} ${tag.tag}`),
  ]
    .map((entry) => normalizeWhitespace(entry))
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function buildRawRecord(item, lookup) {
  const itemId = asString(item.itemId);
  const sourceUrl = normalizePageUrl(item.sourceUrl);
  const recordType = classifyKnowledgeRecord(item);
  const images = filterImagesForRecord(recordType, lookup.images.get(itemId) ?? []);
  const features = dedupeEntries((lookup.features.get(itemId) ?? []).map(normalizeFeature));
  const specs = dedupeEntries((lookup.specs.get(itemId) ?? []).map(normalizeSpec));
  const benefits = dedupeEntries((lookup.benefits.get(itemId) ?? []).map(normalizeBenefit));
  const compatibility = dedupeEntries((lookup.compatibility.get(itemId) ?? []).map(normalizeCompatibility));
  const phonePlans = dedupeEntries((lookup.phonePlans.get(itemId) ?? []).map(normalizePhonePlan));
  const planBreakdown = dedupeEntries((lookup.planBreakdown.get(itemId) ?? []).map(normalizePlanBreakdown));
  const promoEligibility = dedupeEntries((lookup.promoEligibility.get(itemId) ?? []).map(normalizePromoEligibility));
  const promoAccuracy = dedupeEntries((lookup.promoAccuracy.get(itemId) ?? []).map(normalizePromoAccuracy));
  const accuracyChecks = dedupeEntries((lookup.accuracyChecks.get(itemId) ?? []).map(normalizeAccuracyCheck));
  const salesTags = dedupeEntries((lookup.salesTags.get(itemId) ?? []).map(normalizeSalesTag));
  const reviewQueue = dedupeEntries((lookup.reviewQueue.get(itemId) ?? []).map(normalizeReviewItem));
  const sourcePageType = deriveSourcePageType({ itemType: item.itemType, sourceUrl, recordType });
  const heroImageUrl = pickHeroImageUrl(images.map((image) => image.sourceUrl));
  const localImagePath = images.find((image) => image.relativePath)?.relativePath || '';

  const record = {
    itemId,
    name: normalizeWhitespace(item.name),
    brand: normalizeWhitespace(item.brand),
    itemType: normalizeWhitespace(item.itemType),
    category: normalizeWhitespace(item.category),
    regularPrice: maybeNumber(item.regularPrice),
    salePrice: maybeNumber(item.salePrice),
    priceLabel: normalizeWhitespace(item.priceLabel),
    sourceUrl,
    confidence: normalizeWhitespace(item.confidence),
    source: normalizeWhitespace(item.source),
    recordType,
    detailLevel: getKnowledgeDetailLevel(recordType),
    sourcePageType,
    normalizedName: normalizeKnowledgeKey(item.name),
    normalizedSourcePath: normalizeKnowledgePath(sourceUrl),
    heroImageUrl,
    localImagePath: localImagePath ? `/${localImagePath.replace(/^\/+/, '')}` : '',
    features,
    specs,
    benefits,
    compatibility,
    phonePlans,
    planBreakdown,
    promoEligibility,
    promoAccuracy,
    accuracyChecks,
    salesTags,
    images,
    reviewQueue,
  };

  return {
    ...record,
    searchText: buildSearchText(record),
  };
}

function sortRecords(records) {
  return [...records].sort((left, right) => {
    return (
      left.recordType.localeCompare(right.recordType)
      || left.name.localeCompare(right.name)
      || left.itemId.localeCompare(right.itemId)
    );
  });
}

function getPrimaryPathSegment(pathname) {
  const match = pathname.match(/^\/([^/]+)/);
  return match?.[1] ?? '';
}

function scoreOverlap(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 120;
  if (a.includes(b) || b.includes(a)) return 80;

  const left = new Set(a.split('-').filter(Boolean));
  let score = 0;
  for (const token of b.split('-').filter(Boolean)) {
    if (left.has(token)) score += 12;
  }
  return score;
}

function inferCuratedKind(record) {
  const source = normalizeWhitespace(record.source);
  if (source.includes(CURATED_SOURCE_PATTERNS.device)) return 'device';
  if (source.includes(CURATED_SOURCE_PATTERNS.accessory)) return 'accessory';
  if (source.includes(CURATED_SOURCE_PATTERNS.plan)) return 'plan';
  return null;
}

function isCuratedSeed(record) {
  return Boolean(inferCuratedKind(record));
}

function getOverrideTargetId(kind, seedRecord, overrides) {
  if (kind === 'device') {
    return overrides.deviceByName?.[seedRecord.normalizedName] || '';
  }

  if (kind === 'accessory') {
    return overrides.accessoryById?.[normalizeKnowledgeKey(seedRecord.itemId)] || overrides.accessoryById?.[seedRecord.normalizedName] || '';
  }

  return overrides.planByName?.[seedRecord.normalizedName] || '';
}

function findHydrationRecord(seedRecord, candidates, overrides) {
  const kind = inferCuratedKind(seedRecord);
  if (!kind) return null;

  const kindCandidates = candidates.filter((candidate) => {
    if (kind === 'device') return candidate.recordType === 'device-detail';
    if (kind === 'accessory') return candidate.recordType === 'accessory-detail';
    if (kind === 'plan') return candidate.recordType === 'plan-detail' || candidate.recordType === 'home-internet-detail';
    return false;
  });

  const overrideTargetId = getOverrideTargetId(kind, seedRecord, overrides);
  if (overrideTargetId) {
    const overrideRecord = kindCandidates.find((candidate) => candidate.itemId === overrideTargetId);
    if (overrideRecord) return overrideRecord;
  }

  const exactSource = kindCandidates.find((candidate) =>
    candidate.itemId !== seedRecord.itemId
    && candidate.normalizedSourcePath
    && candidate.normalizedSourcePath === seedRecord.normalizedSourcePath
  );
  if (exactSource) return exactSource;

  const exactName = kindCandidates.find((candidate) =>
    candidate.itemId !== seedRecord.itemId
    && candidate.normalizedName
    && candidate.normalizedName === seedRecord.normalizedName
  );
  if (exactName) return exactName;

  const scored = kindCandidates
    .filter((candidate) => candidate.itemId !== seedRecord.itemId)
    .map((candidate) => {
      const sameCategory = normalizeKnowledgeKey(candidate.category) === normalizeKnowledgeKey(seedRecord.category);
      const sameBrand = normalizeKnowledgeKey(candidate.brand) === normalizeKnowledgeKey(seedRecord.brand);
      const sameSection = getPrimaryPathSegment(candidate.normalizedSourcePath) === getPrimaryPathSegment(seedRecord.normalizedSourcePath);
      const score = scoreOverlap(candidate.normalizedName, seedRecord.normalizedName)
        + (sameCategory ? 18 : 0)
        + (sameBrand ? 12 : 0)
        + (sameSection ? 8 : 0);
      return { candidate, score };
    })
    .filter((entry) => entry.score >= 40)
    .sort((left, right) => right.score - left.score);

  return scored[0]?.candidate || null;
}

function mergeArrayEntries(...entryGroups) {
  return dedupeEntries(entryGroups.flatMap((entries) => entries ?? []));
}

function mergeSources(...sources) {
  return [...new Set(sources.map((source) => normalizeWhitespace(source)).filter(Boolean))].join('; ');
}

function mergeCoreRecord(seedRecord, hydrationRecord) {
  if (!hydrationRecord) return seedRecord;

  const images = mergeArrayEntries(seedRecord.images, hydrationRecord.images);
  const heroImageUrl = pickHeroImageUrl(
    seedRecord.heroImageUrl,
    hydrationRecord.heroImageUrl,
    images.map((image) => image.sourceUrl)
  );
  const localImagePath = seedRecord.localImagePath || hydrationRecord.localImagePath || '';
  const sourceUrl = seedRecord.sourceUrl || hydrationRecord.sourceUrl || '';
  const sourcePageType = seedRecord.sourcePageType !== 'missing'
    ? seedRecord.sourcePageType
    : hydrationRecord.sourcePageType;

  return {
    ...seedRecord,
    brand: seedRecord.brand || hydrationRecord.brand,
    itemType: seedRecord.itemType || hydrationRecord.itemType,
    category: seedRecord.category || hydrationRecord.category,
    regularPrice: seedRecord.regularPrice ?? hydrationRecord.regularPrice,
    salePrice: seedRecord.salePrice ?? hydrationRecord.salePrice,
    priceLabel: seedRecord.priceLabel || hydrationRecord.priceLabel,
    sourceUrl,
    sourcePageType,
    confidence: hydrationRecord.confidence || seedRecord.confidence,
    source: mergeSources(seedRecord.source, hydrationRecord.source),
    normalizedSourcePath: normalizeKnowledgePath(sourceUrl),
    heroImageUrl,
    localImagePath,
    features: mergeArrayEntries(seedRecord.features, hydrationRecord.features),
    specs: mergeArrayEntries(seedRecord.specs, hydrationRecord.specs),
    benefits: mergeArrayEntries(seedRecord.benefits, hydrationRecord.benefits),
    compatibility: mergeArrayEntries(seedRecord.compatibility, hydrationRecord.compatibility),
    phonePlans: mergeArrayEntries(seedRecord.phonePlans, hydrationRecord.phonePlans),
    planBreakdown: mergeArrayEntries(seedRecord.planBreakdown, hydrationRecord.planBreakdown),
    promoEligibility: mergeArrayEntries(seedRecord.promoEligibility, hydrationRecord.promoEligibility),
    promoAccuracy: mergeArrayEntries(seedRecord.promoAccuracy, hydrationRecord.promoAccuracy),
    accuracyChecks: mergeArrayEntries(seedRecord.accuracyChecks, hydrationRecord.accuracyChecks),
    salesTags: mergeArrayEntries(seedRecord.salesTags, hydrationRecord.salesTags),
    images,
    reviewQueue: mergeArrayEntries(seedRecord.reviewQueue, hydrationRecord.reviewQueue),
  };
}

function compareCoreRecords(left, right) {
  return (
    left.recordType.localeCompare(right.recordType)
    || left.name.localeCompare(right.name)
    || left.itemId.localeCompare(right.itemId)
  );
}

function buildUnresolvedReport(seedRecords, resolvedRecords) {
  const unresolved = { devices: [], plans: [], accessories: [] };

  for (const seedRecord of seedRecords) {
    const kind = inferCuratedKind(seedRecord);
    if (!kind) continue;

    const resolved = resolvedRecords.find((record) => record.itemId === seedRecord.itemId);
    if (resolved?.sourcePageType !== 'missing') continue;

    if (kind === 'device') unresolved.devices.push(seedRecord.name);
    if (kind === 'plan') unresolved.plans.push(seedRecord.name);
    if (kind === 'accessory') unresolved.accessories.push(seedRecord.name);
  }

  unresolved.devices.sort();
  unresolved.plans.sort();
  unresolved.accessories.sort();
  return unresolved;
}

export function validateArtifacts(artifacts) {
  for (const record of artifacts.coreRecords) {
    if (!SOURCE_PAGE_TYPES.has(record.sourcePageType)) {
      throw new Error(`Invalid sourcePageType "${record.sourcePageType}" for core record ${record.itemId}`);
    }

    if (record.heroImageUrl && !isValidImageUrl(record.heroImageUrl)) {
      throw new Error(`Invalid heroImageUrl for core record ${record.itemId}: ${record.heroImageUrl}`);
    }

    if (record.recordType === 'device-detail' && record.heroImageUrl && isUnsafeDeviceImageUrl(record.heroImageUrl)) {
      throw new Error(`Unsafe device heroImageUrl for core record ${record.itemId}: ${record.heroImageUrl}`);
    }
  }

  for (const record of artifacts.rawRecords) {
    if (!SOURCE_PAGE_TYPES.has(record.sourcePageType)) {
      throw new Error(`Invalid sourcePageType "${record.sourcePageType}" for raw record ${record.itemId}`);
    }
  }
}

export function buildKnowledgeArtifacts({ knowledgePack, imageManifest, overrides, sourcePath, imageManifestPath }) {
  if (!Array.isArray(knowledgePack.items) || knowledgePack.items.length === 0) {
    throw new Error(`Knowledge pack has no items: ${sourcePath}`);
  }

  const normalizedFeatures = (knowledgePack.features ?? []).map(normalizeFeature).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedSpecs = (knowledgePack.specs ?? []).map(normalizeSpec).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedBenefits = (knowledgePack.benefits ?? []).map(normalizeBenefit).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedCompatibility = (knowledgePack.compatibility ?? []).map(normalizeCompatibility).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedPhonePlans = (knowledgePack.phonePlans ?? []).map(normalizePhonePlan).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedPlanBreakdown = (knowledgePack.planBreakdown ?? []).map(normalizePlanBreakdown).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedPromos = (knowledgePack.promos ?? []).map(normalizePromo).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedPromoEligibility = (knowledgePack.promoEligibility ?? []).map(normalizePromoEligibility).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedPromoAccuracy = (knowledgePack.promoAccuracy ?? []).map(normalizePromoAccuracy).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedAccuracyChecks = (knowledgePack.accuracyChecks ?? []).map(normalizeAccuracyCheck).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedSalesTags = (knowledgePack.salesTags ?? []).map(normalizeSalesTag).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const normalizedReviewQueue = (knowledgePack.reviewQueue ?? []).map(normalizeReviewItem).sort((left, right) => serializeStable(left).localeCompare(serializeStable(right)));
  const mergedImages = mergeImages(
    knowledgePack.images ?? [],
    imageManifest.images ?? []
  );

  const lookup = {
    features: indexByItemId(normalizedFeatures),
    specs: indexByItemId(normalizedSpecs),
    benefits: indexByItemId(normalizedBenefits),
    compatibility: indexByItemId(normalizedCompatibility),
    phonePlans: indexByItemId(normalizedPhonePlans),
    planBreakdown: indexByItemId(normalizedPlanBreakdown),
    promoEligibility: indexByItemId(normalizedPromoEligibility),
    promoAccuracy: indexByItemId(normalizedPromoAccuracy),
    accuracyChecks: indexByItemId(normalizedAccuracyChecks),
    salesTags: indexByItemId(normalizedSalesTags),
    reviewQueue: indexByItemId(normalizedReviewQueue),
    images: indexByItemId(mergedImages),
  };

  const rawRecords = sortRecords(knowledgePack.items.map((item) => buildRawRecord(item, lookup)));
  const sourceBackedCandidates = rawRecords.filter((record) =>
    CORE_RECORD_TYPES.has(record.recordType) && record.sourcePageType !== 'missing'
  );
  const curatedSeedRecords = rawRecords.filter((record) => isCuratedSeed(record) && CORE_RECORD_TYPES.has(record.recordType));

  const mergedCuratedRecords = curatedSeedRecords
    .map((seedRecord) => {
      const hydrationRecord = findHydrationRecord(seedRecord, sourceBackedCandidates, overrides);
      return mergeCoreRecord(seedRecord, hydrationRecord);
    })
    .sort(compareCoreRecords);

  const curatedIds = new Set(mergedCuratedRecords.map((record) => record.itemId));
  const additionalCoreRecords = rawRecords
    .filter((record) =>
      CORE_RECORD_TYPES.has(record.recordType)
      && record.sourcePageType !== 'collection'
      && !curatedIds.has(record.itemId)
    )
    .map((record) => ({
      ...record,
      searchText: undefined,
    }))
    .sort(compareCoreRecords);

  const coreRecords = [...mergedCuratedRecords, ...additionalCoreRecords]
    .map(({ searchText, ...record }) => record)
    .sort(compareCoreRecords);

  const unresolved = buildUnresolvedReport(curatedSeedRecords, coreRecords);

  const meta = {
    generatedAt: new Date().toISOString(),
    sourcePath: 'external/customerconnect-knowledge-pack/exports/tmobile-knowledge.json',
    imageManifestPath: 'external/customerconnect-knowledge-pack/exports/app-image-manifest.json',
    rawRecordCount: rawRecords.length,
    coreRecordCount: coreRecords.length,
    featureCount: normalizedFeatures.length,
    specCount: normalizedSpecs.length,
    benefitCount: normalizedBenefits.length,
    compatibilityCount: normalizedCompatibility.length,
    phonePlanCount: normalizedPhonePlans.length,
    planBreakdownCount: normalizedPlanBreakdown.length,
    promoCount: normalizedPromos.length,
    promoEligibilityCount: normalizedPromoEligibility.length,
    promoAccuracyCount: normalizedPromoAccuracy.length,
    accuracyCheckCount: normalizedAccuracyChecks.length,
    salesTagCount: normalizedSalesTags.length,
    imageCount: mergedImages.length,
    reviewQueueCount: normalizedReviewQueue.length,
    unresolved,
  };

  const artifacts = {
    meta,
    coreRecords,
    rawRecords,
    promos: normalizedPromos,
    overrides,
  };

  validateArtifacts(artifacts);
  return artifacts;
}
