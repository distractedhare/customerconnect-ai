import { describe, expect, it } from 'vitest'
import {
  buildKnowledgeArtifacts,
  pickHeroImageUrl,
  validateArtifacts,
} from '../knowledgeSync'
import type { KnowledgeMatchOverrides } from '../../types/knowledge'

const EMPTY_OVERRIDES: KnowledgeMatchOverrides = {
  deviceByName: {},
  accessoryById: {},
  planByName: {},
}

describe('knowledge sync helpers', () => {
  it('drops malformed/page hero candidates and keeps the first valid image candidate', () => {
    const hero = pickHeroImageUrl(
      'https://www.t-mobile.com/cell-phone-plans/2',
      'https://cdn.example.com/a.png,https://cdn.example.com/b.png',
      'https://cdn.example.com/hero.png'
    )

    expect(hero).toBe('https://cdn.example.com/hero.png')
  })

  it('rejects emitted invalid core hero URLs during validation', () => {
    expect(() =>
      validateArtifacts({
        meta: {
          generatedAt: '',
          sourcePath: '',
          imageManifestPath: '',
          rawRecordCount: 1,
          coreRecordCount: 1,
          featureCount: 0,
          specCount: 0,
          benefitCount: 0,
          compatibilityCount: 0,
          phonePlanCount: 0,
          planBreakdownCount: 0,
          promoCount: 0,
          promoEligibilityCount: 0,
          promoAccuracyCount: 0,
          accuracyCheckCount: 0,
          salesTagCount: 0,
          imageCount: 0,
          reviewQueueCount: 0,
          unresolved: { devices: [], plans: [], accessories: [] },
        },
        coreRecords: [
          {
            itemId: 'bad-device',
            name: 'Bad Device',
            brand: 'Brand',
            itemType: 'device',
            category: 'iphone',
            regularPrice: null,
            salePrice: null,
            priceLabel: '',
            sourceUrl: '',
            confidence: 'seeded-app-data',
            source: 'test',
            recordType: 'device-detail',
            detailLevel: 'detail',
            sourcePageType: 'detail',
            normalizedName: 'bad-device',
            normalizedSourcePath: '',
            heroImageUrl: 'https://www.t-mobile.com/cell-phone-plans/2',
            features: [],
            specs: [],
            benefits: [],
            compatibility: [],
            phonePlans: [],
            planBreakdown: [],
            promoEligibility: [],
            promoAccuracy: [],
            accuracyChecks: [],
            salesTags: [],
            images: [],
            reviewQueue: [],
          },
        ],
        rawRecords: [],
        promos: [],
        overrides: EMPTY_OVERRIDES,
      })
    ).toThrow(/Invalid heroImageUrl/)
  })

  it('sorts deterministically, keeps collection pages in raw records, and excludes them from core records', () => {
    const artifacts = buildKnowledgeArtifacts({
      sourcePath: '/tmp/tmobile-knowledge.json',
      imageManifestPath: '/tmp/app-image-manifest.json',
      overrides: EMPTY_OVERRIDES,
      knowledgePack: {
        items: [
          {
            itemId: 'phones-collection',
            name: 'Phones',
            brand: 'T-Mobile',
            itemType: 'device-collection',
            category: 'device-collection',
            sourceUrl: 'https://www.t-mobile.com/cell-phones',
            confidence: 'firecrawl',
            source: 'firecrawl',
          },
          {
            itemId: 'iphone-17',
            name: 'iPhone 17',
            brand: 'Apple',
            itemType: 'device',
            category: 'iphone',
            sourceUrl: '',
            confidence: 'seeded-app-data',
            source: 'customerconnect-ai/src/data/devices.ts',
            priceLabel: '$799',
            regularPrice: 799,
            salePrice: null,
          },
          {
            itemId: 'iphone-17-source',
            name: 'iPhone 17',
            brand: 'Apple',
            itemType: 'device',
            category: 'iphone',
            sourceUrl: 'https://www.t-mobile.com/cell-phone/apple-iphone-17',
            confidence: 'firecrawl',
            source: 'firecrawl',
            priceLabel: '$799',
            regularPrice: 799,
            salePrice: '$0.00/month',
          },
        ],
        features: [
          {
            itemId: 'iphone-17-source',
            featureName: 'Storage',
            featureValue: '256GB base',
            featureCategory: 'spec',
            customerBenefit: '256GB base is a big deal',
            salesUseCase: 'Lead with the storage upgrade',
            sourceUrl: 'https://www.t-mobile.com/cell-phone/apple-iphone-17',
            confidence: 'firecrawl',
          },
        ],
        specs: [],
        benefits: [],
        compatibility: [],
        promos: [],
        promoEligibility: [],
        salesTags: [],
        reviewQueue: [],
        images: [
          {
            itemId: 'iphone-17-source',
            imageSlug: 'iphone-17',
            relativePath: 'images/devices/iphone-17.png',
            sourceUrl: 'https://cdn.example.com/iphone-17.png',
            status: 'planned',
            needsReview: false,
          },
        ],
      },
      imageManifest: { images: [] },
    })

    expect(artifacts.rawRecords.map((record) => record.itemId)).toEqual([
      'phones-collection',
      'iphone-17',
      'iphone-17-source',
    ])
    expect(artifacts.rawRecords.some((record) => record.sourcePageType === 'collection')).toBe(true)
    expect(artifacts.coreRecords.some((record) => record.itemId === 'phones-collection')).toBe(false)

    const hydratedDevice = artifacts.coreRecords.find((record) => record.itemId === 'iphone-17')
    expect(hydratedDevice?.sourceUrl).toBe('https://www.t-mobile.com/cell-phone/apple-iphone-17')
    expect(hydratedDevice?.heroImageUrl).toBe('https://cdn.example.com/iphone-17.png')
  })

  it('does not hydrate device seeds from accessory records or accessory image URLs', () => {
    const artifacts = buildKnowledgeArtifacts({
      sourcePath: '/tmp/tmobile-knowledge.json',
      imageManifestPath: '/tmp/app-image-manifest.json',
      overrides: EMPTY_OVERRIDES,
      knowledgePack: {
        items: [
          {
            itemId: 'galaxy-s26',
            name: 'Galaxy S26',
            brand: 'Samsung',
            itemType: 'device',
            category: 'samsung',
            sourceUrl: '',
            confidence: 'seeded-app-data',
            source: 'customerconnect-ai/src/data/devices.ts',
            priceLabel: '$1099',
            regularPrice: 1099,
            salePrice: null,
          },
          {
            itemId: 'case-mate-magnetic-case-for-samsung-galaxy-s26',
            name: 'Case-Mate Magnetic Case for Samsung Galaxy S26',
            brand: 'Samsung',
            itemType: 'accessory',
            category: 'case',
            sourceUrl: 'https://www.t-mobile.com/accessory/case-mate-magnetic-case-for-samsung-galaxy-s26',
            confidence: 'firecrawl',
            source: 'firecrawl',
            priceLabel: '$54.99',
            regularPrice: 54.99,
            salePrice: null,
          },
        ],
        features: [],
        specs: [],
        benefits: [],
        compatibility: [],
        promos: [],
        promoEligibility: [],
        salesTags: [],
        reviewQueue: [],
        images: [
          {
            itemId: 'galaxy-s26',
            imageSlug: 'galaxy-s26',
            relativePath: 'images/devices/galaxy-s26.png',
            sourceUrl: 'https://cdn.tmobile.com/content/dam/t-mobile/en-p/accessories/195949371196/195949371196-thumbnail.png',
            status: 'planned',
            needsReview: true,
          },
          {
            itemId: 'case-mate-magnetic-case-for-samsung-galaxy-s26',
            imageSlug: 'case-mate-magnetic-case-for-samsung-galaxy-s26',
            relativePath: 'images/accessories/case-mate-magnetic-case-for-samsung-galaxy-s26.png',
            sourceUrl: 'https://t-mobile.scene7.com/is/image/Tmusprod/840171762280-frontimage?fmt=png-alpha&qlt=85',
            status: 'planned',
            needsReview: false,
          },
        ],
      },
      imageManifest: { images: [] },
    })

    const device = artifacts.coreRecords.find((record) => record.itemId === 'galaxy-s26')
    expect(device?.sourceUrl).toBe('')
    expect(device?.heroImageUrl).toBe('')
    expect(device?.images).toHaveLength(0)

    const accessory = artifacts.coreRecords.find((record) => record.itemId === 'case-mate-magnetic-case-for-samsung-galaxy-s26')
    expect(accessory?.recordType).toBe('accessory-detail')
    expect(accessory?.heroImageUrl).toContain('840171762280-frontimage')
  })
})
