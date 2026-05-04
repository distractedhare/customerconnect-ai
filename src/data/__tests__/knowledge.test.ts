import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, afterEach, expect, it, vi } from 'vitest'
import { buildPromptContext } from '..'
import { CATALOG } from '../accessoryCatalog'
import { PHONES } from '../devices'
import {
  CORE_KNOWLEDGE_RECORDS,
  KNOWLEDGE_META,
  __resetRawKnowledgeCacheForTests,
  canKipQuoteAccessoryBundleEligibility,
  getAccessoryBundleAccuracy,
  getKnowledgeRecordForAccessory,
  getKnowledgeRecordForDevice,
  getKnowledgeRecordForPlan,
  getRelatedCollectionRecords,
  loadRawKnowledgeIndex,
  searchKnowledgeRecords,
} from '../knowledge'
import { POSTPAID_PLANS } from '../plans'

const RAW_KNOWLEDGE_FIXTURE = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'public/knowledge/tmobile-knowledge-raw.json'),
    'utf8'
  )
)

function mockRawKnowledgeFetch() {
  return vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(
      new Response(JSON.stringify(RAW_KNOWLEDGE_FIXTURE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )
}

afterEach(() => {
  __resetRawKnowledgeCacheForTests()
  vi.restoreAllMocks()
})

describe('knowledge snapshot', () => {
  it('imports the eager core snapshot and preserves unresolved coverage reporting', () => {
    expect(CORE_KNOWLEDGE_RECORDS.length).toBe(KNOWLEDGE_META.coreRecordCount)
    expect(KNOWLEDGE_META.unresolved.devices.length).toBeGreaterThan(0)
    expect(KNOWLEDGE_META.unresolved.plans).toEqual([])
  })

  it('maps known detail records onto curated devices, plans, and accessories', () => {
    const deviceRecord = getKnowledgeRecordForDevice('iPhone 17')
    const accessoryRecord = getKnowledgeRecordForAccessory('p360')
    const planRecord = getKnowledgeRecordForPlan('Experience Beyond')

    expect(deviceRecord?.recordType).toBe('device-detail')
    expect(accessoryRecord?.recordType).toBe('accessory-detail')
    expect(planRecord?.recordType).toBe('plan-detail')
    expect(planRecord?.sourcePageType).toBe('overview')
  })

  it('carries accessory bundle accuracy verdicts into the app snapshot', () => {
    expect(KNOWLEDGE_META.promoAccuracyCount).toBeGreaterThan(0)
    expect(KNOWLEDGE_META.accuracyCheckCount).toBeGreaterThan(0)

    const chargerAccuracy = getAccessoryBundleAccuracy('apple-magsafe-charger')
    expect(chargerAccuracy?.canonicalPromoSetId).toBe('essential-accessories')
    expect(chargerAccuracy?.expectedEligible).toBe(true)
    expect(chargerAccuracy?.actualEligible).toBe(true)

    const airpodsAccuracy = getAccessoryBundleAccuracy('airpods-4')
    expect(airpodsAccuracy?.expectedEligible).toBe(false)
    expect(airpodsAccuracy?.actualEligible).toBe(false)
    expect(canKipQuoteAccessoryBundleEligibility('airpods-4')).toBe(false)

    const p360Accuracy = getAccessoryBundleAccuracy('p360')
    expect(p360Accuracy?.expectedEligible).toBe(false)
    expect(p360Accuracy?.actualEligible).toBe(false)
    expect(canKipQuoteAccessoryBundleEligibility('p360')).toBe(false)
  })

  it('carries phone plan summaries and line-count breakdowns into the app snapshot', () => {
    expect(KNOWLEDGE_META.phonePlanCount).toBeGreaterThan(0)
    expect(KNOWLEDGE_META.planBreakdownCount).toBeGreaterThan(0)

    const planRecord = getKnowledgeRecordForPlan('Experience Beyond')
    expect(planRecord?.phonePlans.some((row) => row.planSection === 'Current Postpaid')).toBe(true)
    expect(planRecord?.planBreakdown.some((row) => row.lineCount === 1 && row.monthlyTotal === '100')).toBe(true)
    expect(planRecord?.planBreakdown.some((row) => row.lineCount === 3 && row.monthlyTotal === '170')).toBe(true)
    expect(planRecord?.planBreakdown[0]?.sourceUrl).toContain('t-mobile.com/cell-phone-plans')
  })
})

describe('lazy raw knowledge loader', () => {
  it('loads the raw index once and caches it in memory', async () => {
    const fetchMock = mockRawKnowledgeFetch()

    const first = await loadRawKnowledgeIndex()
    const second = await loadRawKnowledgeIndex()

    expect(first.length).toBe(KNOWLEDGE_META.rawRecordCount)
    expect(second.length).toBe(first.length)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps collection pages searchable through the lazy raw index', async () => {
    mockRawKnowledgeFetch()
    const collectionRecord = RAW_KNOWLEDGE_FIXTURE.find((record: { sourcePageType: string }) => record.sourcePageType === 'collection')
    expect(collectionRecord).toBeTruthy()

    const matches = await searchKnowledgeRecords(collectionRecord.name, { detailLevels: ['collection'] })
    expect(matches.some((record) => record.itemId === collectionRecord.itemId)).toBe(true)
  })

  it('returns only collection records for related-page lookups', async () => {
    mockRawKnowledgeFetch()
    const related = await getRelatedCollectionRecords('iPhone 17', 3)

    expect(related.length).toBeGreaterThan(0)
    expect(related.every((record) => record.sourcePageType === 'collection')).toBe(true)
  })
})

describe('knowledge merge behavior', () => {
  it('enriches curated devices without blanking curated values', () => {
    const device = PHONES.find((entry) => entry.name === 'iPhone 17')
    expect(device).toBeTruthy()
    expect(device?.startingPrice).toBe(799)
    expect(device?.sourceUrl).toContain('t-mobile.com/cell-phone/apple-iphone-17')
    expect(device?.knowledgeBenefits?.length).toBeGreaterThan(0)
    expect(device?.imageUrl).toBeTruthy()
  })

  it('enriches curated plans while preserving the pricing matrix', () => {
    const plan = POSTPAID_PLANS.find((entry) => entry.name === 'Experience Beyond')
    expect(plan).toBeTruthy()
    expect(plan?.pricing.length).toBeGreaterThan(5)
    expect(plan?.features[0]).toContain('Unlimited premium/priority data')
    expect(plan?.knowledgeBenefits?.length).toBeGreaterThan(0)
    expect(plan?.sourceUrl).toContain('t-mobile.com/cell-phone-plans')
    expect(plan?.sourcePageType).toBe('overview')
  })

  it('enriches curated accessories while preserving sales and promo fields', () => {
    const item = CATALOG.find((entry) => entry.id === 'p360')
    expect(item).toBeTruthy()
    expect(item?.qualifyingSetIds).toEqual([])
    expect(item?.pitch).toContain('P360')
    expect(item?.knowledgeBenefits?.length).toBeGreaterThan(0)
    expect(item?.sourceUrl).toBeFalsy()
  })
})

describe('prompt context knowledge grounding', () => {
  it('includes knowledge-pack source links and factual benefit text for phone flows', () => {
    const context = buildPromptContext({
      age: '25-34',
      region: 'Pacific Northwest',
      product: ['Phone'],
      purchaseIntent: 'exploring',
      plan: 'Experience Beyond',
    })

    expect(context).toContain('https://www.t-mobile.com/cell-phone/apple-iphone-17')
    expect(context).toContain('256GB base is a big deal')
    expect(context).toContain('SELECTED PLAN REFERENCE')
    expect(context).toContain('https://www.t-mobile.com/cell-phone-plans')
  })
})
