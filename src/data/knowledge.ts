import {
  TMOBILE_KNOWLEDGE_CORE_INDEX,
  TMOBILE_KNOWLEDGE_CORE_RECORDS,
  TMOBILE_KNOWLEDGE_MATCH_OVERRIDES,
  TMOBILE_KNOWLEDGE_PROMOS,
} from './generated/tmobileKnowledgeCore.generated'
import { TMOBILE_KNOWLEDGE_META } from './generated/tmobileKnowledgeMeta.generated'
import type {
  KnowledgeCoreRecord,
  KnowledgeDetailLevel,
  KnowledgeLinkedFields,
  KnowledgeMatchOverrides,
  KnowledgePromo,
  KnowledgeRawRecord,
  KnowledgeRecordType,
  KnowledgeSearchFilters,
  KnowledgeSourcePageType,
} from '../types/knowledge'
import {
  classifyKnowledgeRecord,
  deriveSourcePageType,
  getKnowledgeDetailLevel,
  normalizeKnowledgeKey,
  normalizeKnowledgePath,
} from './knowledgeSync'

type MergeableTarget = KnowledgeLinkedFields & {
  name: string
  sourceUrl?: string
  heroImageUrl?: string
}

type MergeableDeviceTarget = MergeableTarget & {
  category?: string
  imageUrl?: string
}

type MergeableAccessoryTarget = MergeableTarget & {
  id?: string
  category?: string
  ecosystem?: string
}

type MergeablePlanTarget = MergeableTarget & {
  tier?: string
  brand?: string
}

let rawKnowledgeCache: KnowledgeRawRecord[] | null = null
let rawKnowledgePromise: Promise<KnowledgeRawRecord[]> | null = null
const QUOTE_SAFE_PROMO_REVIEW_STATUSES = new Set(['approved', 'seeded-lock'])

function normalizeTokens(value: string): string[] {
  return normalizeKnowledgeKey(value)
    .split('-')
    .filter(Boolean)
}

function scoreOverlap(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 120
  if (a.includes(b) || b.includes(a)) return 80

  const aTokens = new Set(normalizeTokens(a))
  const bTokens = normalizeTokens(b)
  let score = 0

  for (const token of bTokens) {
    if (aTokens.has(token)) score += 12
  }

  return score
}

function getPrimaryPathSegment(pathname: string): string {
  const match = pathname.match(/^\/([^/]+)/)
  return match?.[1] ?? ''
}

function getHeroImageUrl(record?: KnowledgeCoreRecord | KnowledgeRawRecord) {
  if (!record) return undefined
  if (record.heroImageUrl) return record.heroImageUrl
  return record.images.find((image) => image.sourceUrl)?.sourceUrl || undefined
}

function getKnowledgeFields(record?: KnowledgeCoreRecord | KnowledgeRawRecord): KnowledgeLinkedFields {
  if (!record) return {}

  return {
    knowledgeId: record.itemId,
    sourceUrl: record.sourceUrl || undefined,
    sourcePageType: record.sourcePageType || undefined,
    heroImageUrl: getHeroImageUrl(record),
    knowledgeFeatures: record.features.length > 0 ? record.features : undefined,
    knowledgeSpecs: record.specs.length > 0 ? record.specs : undefined,
    knowledgeBenefits: record.benefits.length > 0 ? record.benefits : undefined,
    knowledgeCompatibility: record.compatibility.length > 0 ? record.compatibility : undefined,
    knowledgeConfidence: record.confidence || undefined,
  }
}

function matchesFilters(
  record: Pick<KnowledgeCoreRecord, 'recordType' | 'detailLevel' | 'sourcePageType' | 'category' | 'brand'>,
  filters: KnowledgeSearchFilters = {}
) {
  if (filters.recordTypes?.length && !filters.recordTypes.includes(record.recordType)) return false
  if (filters.detailLevels?.length && !filters.detailLevels.includes(record.detailLevel)) return false
  if (filters.sourcePageTypes?.length && !filters.sourcePageTypes.includes(record.sourcePageType)) return false

  if (filters.categories?.length) {
    const normalizedCategory = normalizeKnowledgeKey(record.category)
    const matchesCategory = filters.categories.some(
      (category) => normalizeKnowledgeKey(category) === normalizedCategory
    )
    if (!matchesCategory) return false
  }

  if (filters.brands?.length) {
    const normalizedBrand = normalizeKnowledgeKey(record.brand)
    const matchesBrand = filters.brands.some((brand) => normalizeKnowledgeKey(brand) === normalizedBrand)
    if (!matchesBrand) return false
  }

  return true
}

function getRecordTypesForKind(kind: 'device' | 'accessory' | 'plan') {
  if (kind === 'device') return ['device-detail'] as KnowledgeRecordType[]
  if (kind === 'accessory') return ['accessory-detail'] as KnowledgeRecordType[]
  return ['plan-detail'] as KnowledgeRecordType[]
}

function findOverrideRecord(
  kind: 'device' | 'accessory' | 'plan',
  overrides: KnowledgeMatchOverrides,
  values: {
    id?: string
    name?: string
  }
) {
  if (kind === 'device') {
    const overrideId = overrides.deviceByName[normalizeKnowledgeKey(values.name)]
    return overrideId ? TMOBILE_KNOWLEDGE_CORE_INDEX[overrideId] : undefined
  }

  if (kind === 'accessory') {
    const overrideId = overrides.accessoryById[normalizeKnowledgeKey(values.id)]
      || overrides.accessoryById[normalizeKnowledgeKey(values.name)]
    return overrideId ? TMOBILE_KNOWLEDGE_CORE_INDEX[overrideId] : undefined
  }

  const overrideId = overrides.planByName[normalizeKnowledgeKey(values.name)]
  return overrideId ? TMOBILE_KNOWLEDGE_CORE_INDEX[overrideId] : undefined
}

function findBySourcePath(
  candidates: KnowledgeCoreRecord[],
  sourceUrl: string | undefined
) {
  const normalizedTarget = normalizeKnowledgePath(sourceUrl)
  if (!normalizedTarget) return undefined
  return candidates.find((record) => record.normalizedSourcePath === normalizedTarget)
}

function findByExactName(candidates: KnowledgeCoreRecord[], name: string | undefined) {
  const normalizedName = normalizeKnowledgeKey(name)
  if (!normalizedName) return undefined
  return candidates.find((record) => record.normalizedName === normalizedName)
}

function findFallbackMatch(
  candidates: KnowledgeCoreRecord[],
  options: {
    name?: string
    category?: string
    brand?: string
  }
) {
  const normalizedName = normalizeKnowledgeKey(options.name)
  const normalizedCategory = normalizeKnowledgeKey(options.category)
  const normalizedBrand = normalizeKnowledgeKey(options.brand)

  const scored = candidates
    .map((record) => {
      const sameCategory = normalizedCategory && normalizeKnowledgeKey(record.category) === normalizedCategory
      const sameBrand = normalizedBrand && normalizeKnowledgeKey(record.brand) === normalizedBrand
      const score = scoreOverlap(record.normalizedName, normalizedName)
        + (sameCategory ? 24 : 0)
        + (sameBrand ? 18 : 0)

      return { record, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)

  return scored[0]?.record
}

function resolveKnowledgeRecord(
  kind: 'device' | 'accessory' | 'plan',
  options: {
    id?: string
    name?: string
    sourceUrl?: string
    category?: string
    brand?: string
  },
  overrides: KnowledgeMatchOverrides = TMOBILE_KNOWLEDGE_MATCH_OVERRIDES
) {
  const candidates = TMOBILE_KNOWLEDGE_CORE_RECORDS.filter((record) =>
    getRecordTypesForKind(kind).includes(record.recordType)
  )

  return (
    findOverrideRecord(kind, overrides, { id: options.id, name: options.name })
    || (options.id ? TMOBILE_KNOWLEDGE_CORE_INDEX[options.id] : undefined)
    || findBySourcePath(candidates, options.sourceUrl)
    || findByExactName(candidates, options.name)
    || findFallbackMatch(candidates, options)
  )
}

function mergeKnowledgeFields<T extends MergeableTarget>(target: T, record?: KnowledgeCoreRecord): T {
  if (!record) return target

  const knowledge = getKnowledgeFields(record)

  return {
    ...target,
    knowledgeId: target.knowledgeId || knowledge.knowledgeId,
    sourceUrl: target.sourceUrl || knowledge.sourceUrl,
    sourcePageType: target.sourcePageType || knowledge.sourcePageType,
    heroImageUrl: target.heroImageUrl || knowledge.heroImageUrl,
    knowledgeFeatures: target.knowledgeFeatures || knowledge.knowledgeFeatures,
    knowledgeSpecs: target.knowledgeSpecs || knowledge.knowledgeSpecs,
    knowledgeBenefits: target.knowledgeBenefits || knowledge.knowledgeBenefits,
    knowledgeCompatibility: target.knowledgeCompatibility || knowledge.knowledgeCompatibility,
    knowledgeConfidence: target.knowledgeConfidence || knowledge.knowledgeConfidence,
  }
}

function normalizeLoadedRawRecord(record: KnowledgeRawRecord): KnowledgeRawRecord {
  const sourceUrl = normalizeKnowledgePath(record.sourceUrl) ? record.sourceUrl : ''
  const recordType = record.recordType || classifyKnowledgeRecord(record)
  const sourcePageType = record.sourcePageType || deriveSourcePageType({
    itemType: record.itemType,
    sourceUrl,
    recordType,
  })

  return {
    ...record,
    recordType,
    detailLevel: record.detailLevel || getKnowledgeDetailLevel(recordType),
    sourcePageType,
    normalizedName: record.normalizedName || normalizeKnowledgeKey(record.name),
    normalizedSourcePath: record.normalizedSourcePath || normalizeKnowledgePath(sourceUrl),
    phonePlans: record.phonePlans ?? [],
    planBreakdown: record.planBreakdown ?? [],
    promoAccuracy: record.promoAccuracy ?? [],
    accuracyChecks: record.accuracyChecks ?? [],
    searchText: record.searchText || [
      record.name,
      record.brand,
      record.category,
      record.itemType,
      record.sourceUrl,
      record.priceLabel,
    ].join(' ').toLowerCase(),
  }
}

export const KNOWLEDGE_META = TMOBILE_KNOWLEDGE_META
export const CORE_KNOWLEDGE_RECORDS = TMOBILE_KNOWLEDGE_CORE_RECORDS
export const CORE_KNOWLEDGE_INDEX = TMOBILE_KNOWLEDGE_CORE_INDEX
export const KNOWLEDGE_PROMOS: KnowledgePromo[] = TMOBILE_KNOWLEDGE_PROMOS

export function getAccessoryBundleAccuracy(itemIdOrName: string) {
  const normalized = normalizeKnowledgeKey(itemIdOrName)
  const record = TMOBILE_KNOWLEDGE_CORE_RECORDS.find((candidate) =>
    normalizeKnowledgeKey(candidate.itemId) === normalized
    || candidate.normalizedName === normalized
  )

  return record?.promoAccuracy.find((row) => row.canonicalPromoSetId === 'essential-accessories')
}

export function canKipQuoteAccessoryBundleEligibility(itemIdOrName: string): boolean {
  const accuracy = getAccessoryBundleAccuracy(itemIdOrName)
  return Boolean(
    accuracy
    && accuracy.checkerVerdict === 'pass'
    && QUOTE_SAFE_PROMO_REVIEW_STATUSES.has(accuracy.reviewStatus)
    && accuracy.actualEligible === true
  )
}

export function getCoreKnowledgeRecords(recordTypes?: KnowledgeRecordType[]) {
  return TMOBILE_KNOWLEDGE_CORE_RECORDS.filter((record) =>
    recordTypes?.length ? recordTypes.includes(record.recordType) : true
  )
}

export function getKnowledgeRecordForDevice(name: string, sourceUrl?: string) {
  return resolveKnowledgeRecord('device', { name, sourceUrl })
}

export function getKnowledgeRecordForAccessory(idOrName: string, sourceUrl?: string) {
  return resolveKnowledgeRecord('accessory', {
    id: idOrName,
    name: idOrName,
    sourceUrl,
  })
}

export function getKnowledgeRecordForPlan(name: string, sourceUrl?: string) {
  return resolveKnowledgeRecord('plan', { name, sourceUrl })
}

export function mergeDeviceKnowledge<T extends MergeableDeviceTarget>(device: T): T {
  const record = resolveKnowledgeRecord('device', {
    name: device.name,
    sourceUrl: device.sourceUrl,
    category: device.category,
  })

  const merged = mergeKnowledgeFields(device, record)
  return {
    ...merged,
    imageUrl: device.imageUrl || getHeroImageUrl(record),
  }
}

export function mergePlanKnowledge<T extends MergeablePlanTarget>(plan: T): T {
  const record = resolveKnowledgeRecord('plan', {
    name: plan.name,
    sourceUrl: plan.sourceUrl,
    category: plan.tier,
    brand: plan.brand || 'T-Mobile',
  })

  return mergeKnowledgeFields(plan, record)
}

export function mergeAccessoryKnowledge<T extends MergeableAccessoryTarget>(item: T): T {
  const record = resolveKnowledgeRecord('accessory', {
    id: item.id,
    name: item.name,
    sourceUrl: item.sourceUrl,
    category: item.category,
    brand: item.ecosystem,
  })

  return mergeKnowledgeFields(item, record)
}

export async function loadRawKnowledgeIndex(): Promise<KnowledgeRawRecord[]> {
  if (rawKnowledgeCache) return rawKnowledgeCache
  if (rawKnowledgePromise) return rawKnowledgePromise

  rawKnowledgePromise = fetch('/knowledge/tmobile-knowledge-raw.json', { cache: 'force-cache' })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Knowledge raw index request failed with ${response.status}`)
      }

      const payload = await response.json()
      if (!Array.isArray(payload)) return []
      rawKnowledgeCache = payload.map((record) => normalizeLoadedRawRecord(record as KnowledgeRawRecord))
      return rawKnowledgeCache
    })
    .catch(() => {
      rawKnowledgeCache = []
      return rawKnowledgeCache
    })

  try {
    return await rawKnowledgePromise
  } finally {
    rawKnowledgePromise = null
  }
}

export async function searchKnowledgeRecords(
  query = '',
  filters: KnowledgeSearchFilters = {}
): Promise<KnowledgeRawRecord[]> {
  const records = await loadRawKnowledgeIndex()
  const normalizedQuery = query.trim().toLowerCase()

  return records.filter((record) => {
    if (!matchesFilters(record, filters)) return false
    if (!normalizedQuery) return true
    return record.searchText.includes(normalizedQuery)
  })
}

export async function getRelatedCollectionRecords(
  recordOrName: KnowledgeCoreRecord | KnowledgeRawRecord | string,
  limit = 3
): Promise<KnowledgeRawRecord[]> {
  const resolvedRecord = typeof recordOrName === 'string'
    ? getKnowledgeRecordForDevice(recordOrName)
      || getKnowledgeRecordForAccessory(recordOrName)
      || getKnowledgeRecordForPlan(recordOrName)
      || TMOBILE_KNOWLEDGE_CORE_INDEX[recordOrName]
    : recordOrName

  if (!resolvedRecord) return []

  const records = await loadRawKnowledgeIndex()
  const recordCategory = normalizeKnowledgeKey(resolvedRecord.category)
  const recordBrand = normalizeKnowledgeKey(resolvedRecord.brand)
  const recordSection = getPrimaryPathSegment(resolvedRecord.normalizedSourcePath)

  return records
    .filter((candidate) => candidate.sourcePageType === 'collection')
    .filter((candidate) => {
      const sameCategory = recordCategory && normalizeKnowledgeKey(candidate.category) === recordCategory
      const sameBrand = recordBrand && normalizeKnowledgeKey(candidate.brand) === recordBrand
      const sameSection = recordSection && getPrimaryPathSegment(candidate.normalizedSourcePath) === recordSection
      return sameCategory || sameBrand || sameSection
    })
    .slice(0, limit)
}

export function getSourcePageTypeLabel(sourcePageType: KnowledgeSourcePageType | undefined) {
  switch (sourcePageType) {
    case 'detail':
      return 'T-Mobile Detail'
    case 'overview':
      return 'T-Mobile Overview'
    case 'collection':
      return 'Collection Reference'
    default:
      return ''
  }
}

export function __resetRawKnowledgeCacheForTests() {
  rawKnowledgeCache = null
  rawKnowledgePromise = null
}
