export type KnowledgeRecordType =
  | 'device-detail'
  | 'accessory-detail'
  | 'plan-detail'
  | 'offer-detail'
  | 'collection-page'
  | 'home-internet-detail'
  | 'other'

export type KnowledgeDetailLevel = 'detail' | 'collection' | 'other'

export type KnowledgeSourcePageType = 'detail' | 'overview' | 'collection' | 'missing'

export interface KnowledgeFeature {
  itemId: string
  featureName: string
  featureValue: string
  featureCategory: string
  customerBenefit: string
  salesUseCase: string
  listenForTags: string[]
  demographicTags: string[]
  compatibilityTags: string[]
  proofText: string
  sourceUrl: string
  confidence: string
}

export interface KnowledgeSpec {
  itemId: string
  specName: string
  specValue: string
  specCategory: string
  sourceUrl: string
  confidence: string
}

export interface KnowledgeBenefit {
  itemId: string
  benefit: string
  customerType: string[]
  salesUseCase: string
  sourceUrl: string
  confidence: string
}

export interface KnowledgeCompatibility {
  itemId: string
  worksWith: string
  compatibilityTags: string[]
  sourceUrl: string
  confidence: string
}

export interface KnowledgeImage {
  itemId: string
  imageSlug: string
  relativePath: string
  sourceUrl: string
  status: string
  needsReview: boolean
  sourceKind?: 'official' | 'official-enhanced' | 'generated-fallback' | 'brand-placeholder'
  reviewStatus?: string
  confidence?: string
}

export interface KnowledgePromo {
  promoId: string
  name: string
  promoSetId: string
  details: string
  requiredQty: number | null
  discountPct: number | null
  finePrint: string
  sourceUrl: string
  confidence: string
  source: string
}

export interface KnowledgePromoEligibility {
  itemId: string
  promoSetId: string
  eligible: boolean
  exclusionReason: string
  reviewStatus: string
}

export interface KnowledgePhonePlan {
  itemId: string
  planName: string
  planSection: string
  tier: string
  status: string
  sourceKind: string
  startingPrice: string
  priceSummary: string
  headlineFeatures: string
  eligibility: string
  limitations: string
  notes: string
  sourceUrl: string
  confidence: string
}

export interface KnowledgePlanBreakdown {
  itemId: string
  planName: string
  planType: string
  tier: string
  status: string
  lineCount: number | string
  monthlyTotal: string
  perLine: string
  insiderMonthlyTotal: string
  insiderPerLine: string
  promoNote: string
  autoPayNote: string
  taxesFeesNote: string
  premiumData: string
  hotspot: string
  videoStreaming: string
  streamingPerks: string
  mexicoCanada: string
  international: string
  satellite: string
  upgradePolicy: string
  priceGuarantee: string
  scamShield: string
  connectedDevicePricing: string
  eligibility: string
  limitations: string
  notes: string
  sourceUrl: string
  confidence: string
}

export interface KnowledgePromoAccuracy {
  itemId: string
  itemName: string
  itemType: string
  category: string
  promoSetId: string
  canonicalPromoSetId: string
  appPromoAlias: string
  appCatalogQualifyingSetIds: string[]
  appCatalogEligible: boolean
  firecrawlPromoMention: boolean
  expectedEligible: boolean
  actualEligible: boolean
  exclusionReason: string
  sourceEvidence: string
  checkerVerdict: string
  reviewStatus: string
  sourceUrl: string
  lastCheckedAt: string
}

export interface KnowledgeAccuracyCheck {
  checkId: string
  severity: string
  itemId: string
  itemName: string
  promoSetId: string
  expectedValue: string
  actualValue: string
  evidence: string
  sourceUrl: string
  recommendedAction: string
  status: string
}

export interface KnowledgeSalesTag {
  itemId: string
  tag: string
  tagType: string
  source: string
  confidence: string
}

export interface KnowledgeReviewItem {
  itemId: string
  issue: string
  field: string
  currentValue: string
  sourceUrl: string
  priority: string
}

export interface KnowledgeLinkedFields {
  knowledgeId?: string
  sourceUrl?: string
  sourcePageType?: KnowledgeSourcePageType
  heroImageUrl?: string
  knowledgeFeatures?: KnowledgeFeature[]
  knowledgeSpecs?: KnowledgeSpec[]
  knowledgeBenefits?: KnowledgeBenefit[]
  knowledgeCompatibility?: KnowledgeCompatibility[]
  knowledgeConfidence?: string
}

interface KnowledgeRecordBase {
  itemId: string
  name: string
  brand: string
  itemType: string
  category: string
  regularPrice: number | string | null
  salePrice: number | string | null
  priceLabel: string
  sourceUrl: string
  confidence: string
  source: string
  recordType: KnowledgeRecordType
  detailLevel: KnowledgeDetailLevel
  sourcePageType: KnowledgeSourcePageType
  normalizedName: string
  normalizedSourcePath: string
  heroImageUrl: string
  localImagePath?: string
  features: KnowledgeFeature[]
  specs: KnowledgeSpec[]
  benefits: KnowledgeBenefit[]
  compatibility: KnowledgeCompatibility[]
  phonePlans: KnowledgePhonePlan[]
  planBreakdown: KnowledgePlanBreakdown[]
  promoEligibility: KnowledgePromoEligibility[]
  promoAccuracy: KnowledgePromoAccuracy[]
  accuracyChecks: KnowledgeAccuracyCheck[]
  salesTags: KnowledgeSalesTag[]
  images: KnowledgeImage[]
  reviewQueue: KnowledgeReviewItem[]
}

export interface KnowledgeCoreRecord extends KnowledgeRecordBase {}

export interface KnowledgeRawRecord extends KnowledgeRecordBase {
  searchText: string
}

export interface KnowledgeUnresolvedReport {
  devices: string[]
  plans: string[]
  accessories: string[]
}

export interface KnowledgeMeta {
  generatedAt: string
  sourcePath: string
  imageManifestPath: string
  rawRecordCount: number
  coreRecordCount: number
  featureCount: number
  specCount: number
  benefitCount: number
  compatibilityCount: number
  phonePlanCount: number
  planBreakdownCount: number
  promoCount: number
  promoEligibilityCount: number
  promoAccuracyCount: number
  accuracyCheckCount: number
  salesTagCount: number
  imageCount: number
  reviewQueueCount: number
  unresolved: KnowledgeUnresolvedReport
}

export interface KnowledgeSearchFilters {
  recordTypes?: KnowledgeRecordType[]
  detailLevels?: KnowledgeDetailLevel[]
  sourcePageTypes?: KnowledgeSourcePageType[]
  categories?: string[]
  brands?: string[]
}

export interface KnowledgeMatchOverrides {
  deviceByName: Record<string, string>
  accessoryById: Record<string, string>
  planByName: Record<string, string>
}
