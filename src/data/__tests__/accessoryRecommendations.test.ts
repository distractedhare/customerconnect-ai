import { describe, expect, it } from 'vitest';
import { buildAccessoryRecommendations } from '../accessories';
import { canKipQuoteAccessoryBundleEligibility } from '../knowledge';
import type { SalesContext } from '../../types';

const BASE_CONTEXT: SalesContext = {
  age: '25-34',
  region: 'Pacific Northwest',
  product: ['Phone'],
  purchaseIntent: 'exploring',
};

describe('database-backed accessory recommendations', () => {
  it('emits explainable app-safe recommendation rows from the local knowledge bundle', () => {
    const recommendations = buildAccessoryRecommendations(BASE_CONTEXT);
    const sourceBacked = recommendations.find((item) => item.sourceUrl);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(sourceBacked?.itemId).toBeTruthy();
    expect(sourceBacked?.proofText).toBeTruthy();
    expect(sourceBacked?.reasonTags?.length).toBeGreaterThan(0);
  });

  it('changes recommendation signals for young adult versus 55-plus contexts', () => {
    const youngAdult = buildAccessoryRecommendations({
      ...BASE_CONTEXT,
      age: '18-24',
    });
    const olderAdult = buildAccessoryRecommendations({
      ...BASE_CONTEXT,
      age: '55+',
    });

    expect(youngAdult[0]?.itemId).not.toBe(olderAdult[0]?.itemId);
    expect(youngAdult.some((item) => item.reasonTags?.some((tag) => ['gym', 'privacy-minded', 'battery-anxiety'].includes(tag)))).toBe(true);
    expect(olderAdult.some((item) => item.reasonTags?.includes('older-adult') || item.reasonTags?.includes('55-plus'))).toBe(true);
  });

  it('keeps review-required accessory candidates recommendable but not quote-safe', () => {
    const recommendations = buildAccessoryRecommendations(BASE_CONTEXT);
    const reviewRequired = recommendations.find((item) => item.eligibilityStatus === 'review-required');

    expect(reviewRequired).toBeTruthy();
    expect(reviewRequired?.bundleEligible).toBe(false);
  });

  it('only marks bundleEligible when the accuracy checker lets KIP quote it', () => {
    const recommendations = buildAccessoryRecommendations({
      ...BASE_CONTEXT,
      age: '35-54',
      totalLines: 4,
      familyCount: 4,
    });

    for (const recommendation of recommendations) {
      if (!recommendation.bundleEligible) continue;
      expect(recommendation.eligibilityStatus).toBe('quote-safe');
      expect(canKipQuoteAccessoryBundleEligibility(recommendation.itemId || recommendation.name)).toBe(true);
    }
  });

  it('preserves explicit non-eligible guards for Protection 360', () => {
    const recommendations = buildAccessoryRecommendations(BASE_CONTEXT);
    const p360 = recommendations.find((item) => item.itemId === 'p360');

    expect(p360?.eligibilityStatus).toBe('not-eligible');
    expect(p360?.bundleEligible).toBe(false);
  });
});
