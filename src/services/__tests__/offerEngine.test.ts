import { describe, it, expect } from 'vitest';
import { contextToWorkflow, buildOfferCards } from '../offerEngine';
import { SalesContext, OfferSessionState } from '../../types';

const emptySession: OfferSessionState = {
  rejectedItemIds: [],
  rejectedGroups: [],
  acceptedItemIds: [],
  pivotHistory: [],
};

function ctx(overrides: Partial<SalesContext> = {}): SalesContext {
  return {
    age: '25-34',
    region: 'Pacific Northwest',
    product: ['Phone'],
    purchaseIntent: 'exploring',
    ...overrides,
  };
}

// ── contextToWorkflow ─────────────────────────────────────────────────────

describe('contextToWorkflow', () => {
  it('maps "ready to buy" → "ready"', () => {
    expect(contextToWorkflow(ctx({ purchaseIntent: 'ready to buy' }))).toBe('ready');
  });
  it('maps "upgrade / add a line" → "upgrade"', () => {
    expect(contextToWorkflow(ctx({ purchaseIntent: 'upgrade / add a line' }))).toBe('upgrade');
  });
  it('maps "exploring" → "explore"', () => {
    expect(contextToWorkflow(ctx({ purchaseIntent: 'exploring' }))).toBe('explore');
  });
  it('maps "order support" → "order-support"', () => {
    expect(contextToWorkflow(ctx({ purchaseIntent: 'order support' }))).toBe('order-support');
  });
  it('maps "tech support" → "tech-support"', () => {
    expect(contextToWorkflow(ctx({ purchaseIntent: 'tech support' }))).toBe('tech-support');
  });
  it('maps "account support" → "account-support"', () => {
    expect(contextToWorkflow(ctx({ purchaseIntent: 'account support' }))).toBe('account-support');
  });
});

// ── buildOfferCards ───────────────────────────────────────────────────────

describe('buildOfferCards', () => {
  it('returns an array', () => {
    const cards = buildOfferCards(ctx({ purchaseIntent: 'upgrade / add a line' }), emptySession);
    expect(Array.isArray(cards)).toBe(true);
  });

  it('returns cards for an iOS customer', () => {
    const cards = buildOfferCards(
      ctx({ purchaseIntent: 'ready to buy', currentPlatform: 'iOS' }),
      emptySession,
    );
    expect(cards.length).toBeGreaterThan(0);
  });

  it('returns cards for an Android/Samsung customer', () => {
    const cards = buildOfferCards(
      ctx({ purchaseIntent: 'ready to buy', currentPlatform: 'Android', currentDeviceBrand: 'Samsung' }),
      emptySession,
    );
    expect(cards.length).toBeGreaterThan(0);
  });

  it('each card has the OfferCardModel shape', () => {
    const cards = buildOfferCards(ctx({ purchaseIntent: 'ready to buy', currentPlatform: 'iOS' }), emptySession);
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('headline');
      expect(card).toHaveProperty('frontItems');
      expect(card).toHaveProperty('backItems');
      expect(card).toHaveProperty('quickPivots');
      expect(Array.isArray(card.frontItems)).toBe(true);
    }
  });

  it('frontItems are not empty on each card', () => {
    const cards = buildOfferCards(ctx({ purchaseIntent: 'ready to buy', currentPlatform: 'iOS' }), emptySession);
    for (const card of cards) {
      expect(card.frontItems.length).toBeGreaterThan(0);
    }
  });

  it('filters out rejected item IDs from frontItems', () => {
    const base = buildOfferCards(
      ctx({ purchaseIntent: 'ready to buy', currentPlatform: 'iOS' }),
      emptySession,
    );
    if (base.length === 0 || base[0].frontItems.length === 0) return;

    const rejectedId = base[0].frontItems[0].id;
    const filtered = buildOfferCards(
      ctx({ purchaseIntent: 'ready to buy', currentPlatform: 'iOS' }),
      { ...emptySession, rejectedItemIds: [rejectedId] },
    );
    const allFrontIds = filtered.flatMap(c => c.frontItems.map(i => i.id));
    expect(allFrontIds).not.toContain(rejectedId);
  });

  it('returns an array (not throws) for an unknown intent', () => {
    // @ts-expect-error intentionally invalid
    const cards = buildOfferCards(ctx({ purchaseIntent: 'not-real' }), emptySession);
    expect(Array.isArray(cards)).toBe(true);
  });
});
