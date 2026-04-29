/**
 * Promo Engine — deterministic qualification logic.
 *
 * Replaces the scattered `bundleEligible: boolean` approach.
 * Uses qualifyingSetIds on each CatalogItem against PROMO_RULES.
 *
 * The old `bundleEligible` field on AccessoryRecommendation is kept for
 * backward compatibility in legacy mode but is no longer the primary primitive.
 */

import { CatalogItem } from '../types';
import { PROMO_RULES } from '../data/promoRules';

export interface PromoStatus {
  activeRuleId?: string;
  qualifiesNow: boolean;
  discountPct: number;
  /** Rep-safe subtle label (never shouts percentages) */
  subtleLabel: string;
  /** Explicit discount label — used only when rep explicitly needs it */
  hardLabel?: string;
  /** How many more qualifying items are needed for the next tier */
  itemsNeeded: number;
  /** IDs of catalog items that would help qualify (for "add one more" nudge) */
  nextBestIds?: string[];
}

/**
 * Evaluate which promo (if any) applies to the current selected items,
 * and what's needed to reach the next tier.
 */
export function evaluatePromoStatus(
  selectedItems: CatalogItem[],
  allCatalogItems: CatalogItem[],
): PromoStatus {
  // Count qualifying items per set
  const setQtys = new Map<string, number>();
  for (const item of selectedItems) {
    for (const setId of item.qualifyingSetIds) {
      setQtys.set(setId, (setQtys.get(setId) ?? 0) + 1);
    }
  }

  // Find the best currently-active rule (highest discount wins)
  const activeRules = PROMO_RULES.filter(rule => {
    const qty = setQtys.get(rule.qualifyingSetId) ?? 0;
    return qty >= rule.requiredQty;
  }).sort((a, b) => b.discountPct - a.discountPct);

  if (activeRules.length > 0) {
    const best = activeRules[0];
    return {
      activeRuleId: best.id,
      qualifiesNow: true,
      discountPct: best.discountPct,
      subtleLabel: best.subtleLabel,
      hardLabel: best.hardPromoLabel,
      itemsNeeded: 0,
    };
  }

  // Not qualifying yet — find the nearest threshold and suggest next items
  // Sort rules ascending by required qty to find the closest tier
  const sortedRules = [...PROMO_RULES].sort((a, b) => a.requiredQty - b.requiredQty);
  const nearestRule = sortedRules[0];
  if (!nearestRule) {
    return { qualifiesNow: false, discountPct: 0, subtleLabel: '', itemsNeeded: 0 };
  }

  const currentQty = setQtys.get(nearestRule.qualifyingSetId) ?? 0;
  const needed = Math.max(0, nearestRule.requiredQty - currentQty);

  // Find the best unselected items that would help qualify
  const selectedIds = new Set(selectedItems.map(i => i.id));
  const candidates = allCatalogItems
    .filter(i =>
      !selectedIds.has(i.id) &&
      i.qualifyingSetIds.includes(nearestRule.qualifyingSetId),
    )
    .slice(0, 3)
    .map(i => i.id);

  // Decide the subtle label based on how close they are
  let subtleLabel = '';
  if (currentQty === 0) {
    subtleLabel = 'Day-one essentials — save more with 3+';
  } else if (currentQty === 1) {
    subtleLabel = 'Add one more qualifying item';
  } else if (currentQty === 2) {
    subtleLabel = 'Add one more — keeps the setup intact';
  }

  return {
    qualifiesNow: false,
    discountPct: currentQty >= 2 ? 15 : 0,
    subtleLabel,
    itemsNeeded: needed,
    nextBestIds: candidates,
  };
}

/**
 * Quick helper: count how many selected items qualify for the essential deal.
 * Used for the subtle chip display in the UI.
 */
export function countQualifyingItems(selectedItems: CatalogItem[]): number {
  return selectedItems.filter(i => i.qualifyingSetIds.includes('essential')).length;
}
