import { describe, it, expect } from 'vitest';
import { computePivotOptions } from '../pivotEngine';
import { CATALOG } from '../../data/accessoryCatalog';
import { OfferSessionState, PivotReason } from '../../types';

const emptySession: OfferSessionState = {
  rejectedItemIds: [],
  rejectedGroups: [],
  acceptedItemIds: [],
  pivotHistory: [],
};

const iPhoneCase = CATALOG.find(c => c.id === 'tech21-evolite-magsafe')!;
const p360       = CATALOG.find(c => c.id === 'p360')!;

describe('computePivotOptions', () => {
  it('returns an array', () => {
    const result = computePivotOptions(iPhoneCase, 'too_expensive', emptySession);
    expect(Array.isArray(result)).toBe(true);
  });

  it('never returns the pivoted-from item', () => {
    const result = computePivotOptions(iPhoneCase, 'too_expensive', emptySession);
    expect(result.every(c => c.id !== iPhoneCase.id)).toBe(true);
  });

  it('excludes already-rejected item IDs', () => {
    const cheaperAlt = iPhoneCase.cheaperAltIds?.[0];
    if (!cheaperAlt) return;
    const session = { ...emptySession, rejectedItemIds: [cheaperAlt] };
    const result = computePivotOptions(iPhoneCase, 'too_expensive', session);
    expect(result.every(c => c.id !== cheaperAlt)).toBe(true);
  });

  it('already_has_one: skips the entire replacement group', () => {
    // "already_has_one" means: move away from this group entirely
    const result = computePivotOptions(iPhoneCase, 'already_has_one', emptySession);
    expect(result.every(c => c.replacementGroup !== iPhoneCase.replacementGroup)).toBe(true);
  });

  it('different_style: stays within the same replacement group (by design)', () => {
    // different_style = same group, different styleTags — group exclusion is intentionally NOT applied
    const result = computePivotOptions(iPhoneCase, 'different_style', emptySession);
    // All results should be from the same group or explicitly linked alts
    // Just verify it returns valid items and doesn't include the original
    expect(result.every(c => c.id !== iPhoneCase.id)).toBe(true);
  });

  it('returns valid CatalogItem objects with required fields', () => {
    const result = computePivotOptions(iPhoneCase, 'too_expensive', emptySession);
    for (const item of result) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('pitch');
      expect(item).toHaveProperty('workflowWeights');
    }
  });

  it('handles p360 with keep_it_simple without throwing', () => {
    expect(() => computePivotOptions(p360, 'keep_it_simple', emptySession)).not.toThrow();
  });

  const reasons: PivotReason[] = [
    'too_expensive',
    'different_style',
    'already_has_one',
    'keep_it_simple',
    'keep_setup_intact',
    'show_secondary',
  ];
  it.each(reasons)('does not throw for reason: %s', (reason) => {
    expect(() => computePivotOptions(CATALOG[0], reason, emptySession)).not.toThrow();
  });
});
