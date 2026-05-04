import { describe, expect, it } from 'vitest';
import type { AccessoryRecommendation, SalesContext } from '../../types';
import { buildAccessoryRecommendations } from '../../data/accessories';
import {
  applyLiveGateToRecommendations,
  buildLiveRecommendationGate,
  sanitizeP360CopyForContext,
} from '../liveRecommendationGate';

function context(overrides: Partial<SalesContext> = {}): SalesContext {
  return {
    age: '25-34',
    region: 'Pacific Northwest',
    product: ['Phone'],
    purchaseIntent: 'ready to buy',
    currentPlatform: 'iOS',
    ...overrides,
  };
}

const fakeRecommendations: AccessoryRecommendation[] = [
  {
    itemId: 'p360',
    name: 'Protection 360',
    why: 'Includes AppleCare Services for iPhones (first 24 months), loss/theft coverage, and screen repairs.',
    priceRange: '$7-$26/mo',
    brands: ['T-Mobile'],
    bundleEligible: false,
    proofText: 'AppleCare Services included for iPhones. Deductibles vary by tier.',
  },
  {
    itemId: 'syncup-tracker',
    name: 'SyncUP Tracker',
    why: 'Cellular GPS tracker.',
    priceRange: '$5/mo',
    brands: ['T-Mobile'],
    bundleEligible: false,
  },
  {
    itemId: 'case',
    name: 'Protective Case',
    why: 'Drop protection.',
    priceRange: '$39.99',
    brands: ['Tech21'],
    bundleEligible: true,
  },
];

describe('live recommendation gate', () => {
  it('removes AppleCare language for Android and adds a device-tier reminder', () => {
    const cleaned = sanitizeP360CopyForContext(
      'AppleCare+ costs extra. P360 includes AppleCare Services for iPhones (first 24 months), PLUS loss/theft coverage.',
      context({ currentPlatform: 'Android', currentDeviceBrand: 'Samsung' }),
    );

    expect(cleaned).not.toMatch(/applecare/i);
    expect(cleaned).toMatch(/device tier/i);
  });

  it('does not unlock random accessories when no product is selected', () => {
    const noProduct = context({ product: ['No Specific Product'] });

    expect(buildLiveRecommendationGate(noProduct).allowedCategories).toEqual([]);
    expect(buildAccessoryRecommendations(noProduct)).toEqual([]);
  });

  it('suppresses watches, trackers, and other attach items for login and billing calls', () => {
    const loginCall = context({
      purchaseIntent: 'account support',
      supportFocus: 'account_login_access',
    });

    expect(applyLiveGateToRecommendations(fakeRecommendations, loginCall)).toEqual([]);
  });

  it('suppresses P360 and connected-device pivots on Home Internet-only calls', () => {
    const hintOnly = context({
      product: ['Home Internet'],
      purchaseIntent: 'ready to buy',
      hintAvailable: true,
    });

    expect(buildLiveRecommendationGate(hintOnly).allowedCategories).toEqual([]);
    expect(applyLiveGateToRecommendations(fakeRecommendations, hintOnly)).toEqual([]);
  });

  it('filters generated recommendation output through the same gate', () => {
    const phoneCall = context({ currentPlatform: 'Android', currentDeviceBrand: 'Samsung' });
    const filtered = applyLiveGateToRecommendations(fakeRecommendations, phoneCall);

    expect(filtered.map((item) => item.name)).toEqual(['Protection 360', 'Protective Case']);
    expect(filtered[0].why).not.toMatch(/applecare/i);
    expect(filtered[0].proofText).not.toMatch(/applecare/i);
  });
});
