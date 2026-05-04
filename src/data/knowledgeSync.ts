import * as shared from '../../scripts/knowledge-sync-shared.mjs'
import type {
  KnowledgeCoreRecord,
  KnowledgeMatchOverrides,
  KnowledgeMeta,
  KnowledgePromo,
  KnowledgeRawRecord,
  KnowledgeRecordType,
  KnowledgeSourcePageType,
} from '../types/knowledge'

type KnowledgeSyncInputs = {
  knowledgePack: {
    items: unknown[]
    features?: unknown[]
    specs?: unknown[]
    benefits?: unknown[]
    compatibility?: unknown[]
    phonePlans?: unknown[]
    planBreakdown?: unknown[]
    promos?: unknown[]
    promoEligibility?: unknown[]
    promoAccuracy?: unknown[]
    accuracyChecks?: unknown[]
    salesTags?: unknown[]
    images?: unknown[]
    reviewQueue?: unknown[]
  }
  imageManifest: {
    images?: unknown[]
  }
  overrides: KnowledgeMatchOverrides
  sourcePath: string
  imageManifestPath: string
}

type KnowledgeArtifacts = {
  meta: KnowledgeMeta
  coreRecords: KnowledgeCoreRecord[]
  rawRecords: KnowledgeRawRecord[]
  promos: KnowledgePromo[]
  overrides: KnowledgeMatchOverrides
}

export const normalizeKnowledgeKey = shared.normalizeKnowledgeKey as (value?: string) => string
export const normalizeKnowledgePath = shared.normalizeKnowledgePath as (value?: string) => string
export const isValidImageUrl = shared.isValidImageUrl as (value?: string) => boolean
export const pickHeroImageUrl = shared.pickHeroImageUrl as (...values: unknown[]) => string
export const classifyKnowledgeRecord = shared.classifyKnowledgeRecord as (record: {
  itemType?: string
  category?: string
  sourceUrl?: string
}) => KnowledgeRecordType
export const getKnowledgeDetailLevel = shared.getKnowledgeDetailLevel as (recordType: KnowledgeRecordType) => 'detail' | 'collection' | 'other'
export const deriveSourcePageType = shared.deriveSourcePageType as (record: {
  itemType?: string
  sourceUrl?: string
  recordType?: KnowledgeRecordType
}) => KnowledgeSourcePageType
export const buildKnowledgeArtifacts = shared.buildKnowledgeArtifacts as (input: KnowledgeSyncInputs) => KnowledgeArtifacts
export const validateArtifacts = shared.validateArtifacts as (artifacts: KnowledgeArtifacts) => void

export type { KnowledgeArtifacts, KnowledgeSyncInputs }
