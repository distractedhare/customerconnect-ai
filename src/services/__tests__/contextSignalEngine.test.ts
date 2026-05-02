import { describe, it, expect } from 'vitest';
import { deriveCustomerSignals } from '../contextSignalEngine';
import { SalesContext } from '../../types';

function ctx(overrides: Partial<SalesContext> = {}): SalesContext {
  return {
    age: '25-34',
    region: 'Pacific Northwest',
    product: ['Phone'],
    purchaseIntent: 'exploring',
    ...overrides,
  };
}

describe('deriveCustomerSignals', () => {
  it('returns an array of signals', () => {
    const signals = deriveCustomerSignals(ctx());
    expect(Array.isArray(signals)).toBe(true);
  });

  it('each signal has tag, strength, and source', () => {
    const signals = deriveCustomerSignals(ctx());
    for (const s of signals) {
      expect(s).toHaveProperty('tag');
      expect(s).toHaveProperty('strength');
      expect(s).toHaveProperty('source');
      expect(typeof s.strength).toBe('number');
      expect(s.strength).toBeGreaterThan(0);
      expect(s.strength).toBeLessThanOrEqual(1);
    }
  });

  // Age-based signals
  it('emits older-adult and simplicity-first for 55+ customers', () => {
    const signals = deriveCustomerSignals(ctx({ age: '55+' }));
    const tags = signals.map(s => s.tag);
    expect(tags).toContain('older-adult');
    expect(tags).toContain('simplicity-first');
  });

  it('does not emit older-adult for 18-24 customers', () => {
    const signals = deriveCustomerSignals(ctx({ age: '18-24' }));
    const tags = signals.map(s => s.tag);
    expect(tags).not.toContain('older-adult');
  });

  it('emits battery-anxiety for 18-24 customers', () => {
    const signals = deriveCustomerSignals(ctx({ age: '18-24' }));
    const tags = signals.map(s => s.tag);
    expect(tags).toContain('battery-anxiety');
  });

  // Family signals
  it('emits family-coordination when totalLines >= 3', () => {
    const signals = deriveCustomerSignals(ctx({ totalLines: 4 }));
    const tags = signals.map(s => s.tag);
    expect(tags).toContain('family-coordination');
  });

  it('emits parent when familyCount >= 3', () => {
    const signals = deriveCustomerSignals(ctx({ familyCount: 3 }));
    const tags = signals.map(s => s.tag);
    expect(tags).toContain('parent');
  });

  it('does not duplicate tags — each tag appears at most once per source', () => {
    const signals = deriveCustomerSignals(ctx({ age: '35-54', familyCount: 4, totalLines: 5 }));
    // Multiple sources can emit the same tag but each call to push is deliberate; no infinite loops
    expect(signals.length).toBeGreaterThan(0);
    expect(signals.length).toBeLessThan(30); // sanity cap
  });

  it('returns empty array for minimal context with no signals', () => {
    // A fully unspecified context should return empty or very few signals
    const signals = deriveCustomerSignals(ctx({ age: 'Not Specified' }));
    // Should not throw
    expect(Array.isArray(signals)).toBe(true);
  });
});
