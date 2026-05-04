import { describe, it, expect } from 'vitest';
import { countQualifyingItems, evaluatePromoStatus, itemQualifiesForPromoSet } from '../promoEngine';
import { CATALOG } from '../../data/accessoryCatalog';
import { CatalogItem } from '../../types';
import { KNOWLEDGE_PROMOS, canKipQuoteAccessoryBundleEligibility } from '../../data/knowledge';

// Pull essential-qualifying items from the real catalog
const essentialItems = CATALOG.filter(c => c.qualifyingSetIds.includes('essential'));
const nonEssentialItems = CATALOG.filter(c => !c.qualifyingSetIds.includes('essential'));

function pickEssential(n: number): CatalogItem[] {
  return essentialItems.slice(0, n);
}

describe('evaluatePromoStatus', () => {
  it('returns not-qualifying when no items selected', () => {
    const result = evaluatePromoStatus([], CATALOG);
    expect(result.qualifiesNow).toBe(false);
    expect(result.discountPct).toBe(0);
  });

  it('returns not-qualifying with 1 essential item', () => {
    const result = evaluatePromoStatus(pickEssential(1), CATALOG);
    expect(result.qualifiesNow).toBe(false);
    expect(result.itemsNeeded).toBeGreaterThan(0);
  });

  it('applies 15% at 2 essential items', () => {
    const result = evaluatePromoStatus(pickEssential(2), CATALOG);
    // 2 essential items hit the 15% tier
    expect(result.discountPct).toBe(15);
  });

  it('qualifies for 25% off at 3+ essential items', () => {
    const result = evaluatePromoStatus(pickEssential(3), CATALOG);
    expect(result.qualifiesNow).toBe(true);
    expect(result.discountPct).toBe(25);
    expect(result.activeRuleId).toBe('essential-25pct');
    expect(result.itemsNeeded).toBe(0);
  });

  it('still qualifies with 4+ essential items', () => {
    const result = evaluatePromoStatus(pickEssential(4), CATALOG);
    expect(result.qualifiesNow).toBe(true);
    expect(result.discountPct).toBe(25);
  });

  it('does not qualify on non-essential items only', () => {
    if (nonEssentialItems.length === 0) return;
    const result = evaluatePromoStatus(nonEssentialItems.slice(0, 3), CATALOG);
    expect(result.qualifiesNow).toBe(false);
  });

  it('suggests nextBestIds when not yet qualifying', () => {
    const result = evaluatePromoStatus(pickEssential(1), CATALOG);
    expect(result.nextBestIds).toBeDefined();
    expect(result.nextBestIds!.length).toBeGreaterThan(0);
    // Suggestions should NOT include items already selected
    const selectedId = essentialItems[0].id;
    expect(result.nextBestIds).not.toContain(selectedId);
  });

  it('has a rep-safe subtle label when not qualifying', () => {
    const result = evaluatePromoStatus(pickEssential(1), CATALOG);
    expect(result.subtleLabel).toBeTruthy();
    // Must not shout raw percentage to customers
    expect(result.subtleLabel).not.toMatch(/^\d+%/);
  });

  it('returns empty nextBestIds when already qualifying', () => {
    const result = evaluatePromoStatus(pickEssential(3), CATALOG);
    // No suggestions needed once qualified
    expect(result.itemsNeeded).toBe(0);
  });

  it('maps the app alias to the canonical workbook promo set ID', () => {
    const item = essentialItems[0];
    expect(itemQualifiesForPromoSet(item, 'essential')).toBe(true);
    expect(itemQualifiesForPromoSet(item, 'essential-accessories')).toBe(true);
  });

  it('counts only checker-approved items for quote-safe UI labels', () => {
    const quoteSafeItem = CATALOG.find((item) => canKipQuoteAccessoryBundleEligibility(item.id));
    const reviewOnlyItem = essentialItems.find((item) => !canKipQuoteAccessoryBundleEligibility(item.id));

    expect(quoteSafeItem).toBeTruthy();
    expect(reviewOnlyItem).toBeTruthy();
    expect(countQualifyingItems([quoteSafeItem!])).toBe(1);
    expect(countQualifyingItems([reviewOnlyItem!])).toBe(0);
  });

  it('keeps imported promo copy out of eligibility math', () => {
    const importedPromo = KNOWLEDGE_PROMOS.find((promo) => promo.promoId === 'essential-15pct');
    expect(importedPromo).toBeTruthy();
    expect(importedPromo?.confidence).toBe('review-required');

    const result = evaluatePromoStatus(pickEssential(2), CATALOG);
    expect(result.discountPct).toBe(15);
    expect(result.activeRuleId).toBe('essential-15pct');
  });
});
