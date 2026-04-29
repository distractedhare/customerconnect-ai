/**
 * Pivot Engine — instant recovery logic.
 *
 * Given a card item + a tap reason, returns the best replacement CatalogItem[].
 * Backups are sourced from the item's catalog relationships (cheaperAltIds,
 * backupIds, replacementGroup peers) so there's no lag on tap.
 *
 * Pivot reason semantics:
 *   soft no (same need, different version):
 *     too_expensive     — cheaper item in same category/group
 *     different_style   — same group, different styleTags
 *
 *   hard no (change category or stop this lane):
 *     already_has_one   — move to adjacent role, skip this replacement group
 *     keep_it_simple    — simplest/cheapest item, trim setup
 *     keep_setup_intact — preserve qualifying set, find a compatible swap
 *     show_secondary    — entirely different role/kind
 */

import { CatalogItem, PivotReason, OfferSessionState } from '../types';
import { CATALOG } from '../data/accessoryCatalog';

/** Return the best pivot candidates for a given reason + item */
export function computePivotOptions(
  item: CatalogItem,
  reason: PivotReason,
  session: OfferSessionState,
): CatalogItem[] {
  const excluded = new Set([...session.rejectedItemIds, item.id]);

  const available = (ids: string[]) =>
    ids
      .map(id => CATALOG.find(c => c.id === id))
      .filter((c): c is CatalogItem => c !== undefined && !excluded.has(c.id));

  switch (reason) {
    case 'too_expensive': {
      // 1. Use explicit cheaperAltIds
      const explicit = available(item.cheaperAltIds ?? []);
      if (explicit.length > 0) return explicit;
      // 2. Fallback: same replacement group, lower price
      return CATALOG
        .filter(c =>
          c.replacementGroup === item.replacementGroup &&
          !excluded.has(c.id) &&
          (c.price ?? Infinity) < (item.price ?? Infinity),
        )
        .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        .slice(0, 2);
    }

    case 'different_style': {
      // Same replacement group, different style tags
      const styleDiff = CATALOG.filter(c =>
        c.replacementGroup === item.replacementGroup &&
        !excluded.has(c.id) &&
        c.styleTags.some(t => !item.styleTags.includes(t)),
      );
      if (styleDiff.length > 0) return styleDiff.slice(0, 2);
      // Fallback: any peer in same group
      return CATALOG
        .filter(c => c.replacementGroup === item.replacementGroup && !excluded.has(c.id))
        .slice(0, 2);
    }

    case 'already_has_one': {
      // Hard no on this replacement group — find items in adjacent role
      const rejectedGroups = new Set([...session.rejectedGroups, item.replacementGroup]);
      return CATALOG
        .filter(c =>
          !excluded.has(c.id) &&
          !rejectedGroups.has(c.replacementGroup) &&
          c.role === item.role &&
          c.category !== item.category,
        )
        .slice(0, 2);
    }

    case 'keep_it_simple': {
      // Find the simplest/cheapest item with 'simplicity-first' signal tag
      const simple = CATALOG.filter(c =>
        !excluded.has(c.id) &&
        c.signalTags.includes('simplicity-first') &&
        c.category !== 'p360',
      ).sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      return simple.slice(0, 1);
    }

    case 'keep_setup_intact': {
      // 1. Use explicit backupIds (same role, preserves qualifying count)
      const explicit = available(item.backupIds ?? []);
      if (explicit.length > 0) return explicit;
      // 2. Find cheapest item in same category that still qualifies for essential set
      return CATALOG
        .filter(c =>
          !excluded.has(c.id) &&
          c.category === item.category &&
          c.qualifyingSetIds.includes('essential'),
        )
        .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
        .slice(0, 1);
    }

    case 'show_secondary': {
      // Entirely different role and kind
      return CATALOG
        .filter(c =>
          !excluded.has(c.id) &&
          !session.rejectedGroups.includes(c.replacementGroup) &&
          c.kind !== item.kind &&
          c.role !== item.role,
        )
        .slice(0, 2);
    }

    default:
      return [];
  }
}

/**
 * Apply a pivot to session state.
 * Hard-no reasons (already_has_one, keep_it_simple, show_secondary) also
 * mark the replacement group so the engine skips it in future cards.
 */
export function applyPivot(
  session: OfferSessionState,
  cardId: string,
  itemId: string,
  reason: PivotReason,
  replacementGroup: string,
): OfferSessionState {
  const HARD_NO: PivotReason[] = ['already_has_one', 'keep_it_simple', 'show_secondary'];
  const isHardNo = HARD_NO.includes(reason);

  return {
    ...session,
    rejectedItemIds: [...session.rejectedItemIds, itemId],
    rejectedGroups: isHardNo
      ? [...session.rejectedGroups, replacementGroup]
      : session.rejectedGroups,
    pivotHistory: [...session.pivotHistory, { cardId, reason }],
  };
}

/** Precompute the back-of-card backup items for a primary item */
export function computeCardBackups(
  primaryItem: CatalogItem,
  session: OfferSessionState,
): CatalogItem[] {
  const excluded = new Set(session.rejectedItemIds);

  // 1. Use explicit cheaperAltIds for the back of the card
  const cheaper = (primaryItem.cheaperAltIds ?? [])
    .map(id => CATALOG.find(c => c.id === id))
    .filter((c): c is CatalogItem => c !== undefined && !excluded.has(c.id));
  if (cheaper.length > 0) return cheaper.slice(0, 2);

  // 2. Use explicit backupIds
  const backups = (primaryItem.backupIds ?? [])
    .map(id => CATALOG.find(c => c.id === id))
    .filter((c): c is CatalogItem => c !== undefined && !excluded.has(c.id));
  if (backups.length > 0) return backups.slice(0, 2);

  // 3. Same replacement group, lower price
  const groupPeers = CATALOG.filter(c =>
    c.replacementGroup === primaryItem.replacementGroup &&
    c.id !== primaryItem.id &&
    !excluded.has(c.id),
  ).sort((a, b) => (a.price ?? 0) - (b.price ?? 0));

  return groupPeers.slice(0, 2);
}
