/**
 * Offer Engine — the main card builder.
 *
 * Takes a SalesContext + OfferSessionState → returns OfferCardModel[].
 *
 * Flow:
 *   1. Map context.purchaseIntent → OfferWorkflow
 *   2. Derive CustomerSignal[] from context
 *   3. Load the playbook for that workflow
 *   4. For each PlaybookSlot, score catalog items using workflowWeights + signal boosts
 *   5. Filter out rejected items/groups and ecosystem mismatches
 *   6. Build each OfferCardModel with a precomputed back (backup move)
 */

import { SalesContext, OfferCardModel, OfferSessionState, OfferWorkflow, CatalogItem, PivotReason } from '../types';
import { CATALOG } from '../data/accessoryCatalog';
import { OFFER_PLAYBOOKS, PlaybookSlot } from '../data/offerPlaybooks';
import { deriveCustomerSignals, getDisplayChips } from './contextSignalEngine';
import { computeCardBackups } from './pivotEngine';

/** Map purchaseIntent to OfferWorkflow */
export function contextToWorkflow(context: SalesContext): OfferWorkflow {
  switch (context.purchaseIntent) {
    case 'upgrade / add a line': return 'upgrade';
    case 'ready to buy':         return 'ready';
    case 'exploring':            return 'explore';
    case 'order support':        return 'order-support';
    case 'tech support':         return 'tech-support';
    case 'account support':      return 'account-support';
    default:                     return 'explore';
  }
}

/**
 * Build a deterministic set of OfferCardModel[] for the current context + session.
 * Call this inside a useMemo — it's pure (no side effects).
 */
export function buildOfferCards(
  context: SalesContext,
  session: OfferSessionState,
): OfferCardModel[] {
  const workflow = contextToWorkflow(context);
  const signals = deriveCustomerSignals(context);
  const chips = getDisplayChips(signals);
  const playbook = OFFER_PLAYBOOKS[workflow];
  if (!playbook) return [];

  // Determine ecosystem filter based on platform/brand
  const platform = context.desiredPlatform ?? context.currentPlatform;
  const brand = context.currentDeviceBrand?.toLowerCase() ?? '';

  function ecosystemAllowed(item: CatalogItem): boolean {
    if (item.ecosystem === 'all') return true;
    if (platform === 'iOS') {
      // Only show apple and all; hide samsung-only items
      return item.ecosystem === 'apple';
    }
    if (platform === 'Android') {
      if (brand.includes('samsung')) {
        return item.ecosystem === 'samsung' || item.ecosystem === 'android';
      }
      if (brand.includes('pixel')) {
        return item.ecosystem === 'pixel' || item.ecosystem === 'android';
      }
      // Generic Android — show android items
      return item.ecosystem === 'android';
    }
    // Unknown platform — show everything
    return true;
  }

  const rejectedIds = new Set(session.rejectedItemIds);
  const rejectedGroups = new Set(session.rejectedGroups);

  /** Score a catalog item for this workflow + signals */
  function scoreItem(item: CatalogItem): number {
    let score = item.workflowWeights[workflow] ?? 0;
    for (const signal of signals) {
      if (item.signalTags.includes(signal.tag)) {
        score += signal.strength * 0.3;
      }
    }
    return score;
  }

  /** Find the best available item for a playbook slot */
  function fillSlot(slot: PlaybookSlot): CatalogItem | null {
    // Try preferred IDs first (ordered)
    if (slot.preferredIds && slot.preferredIds.length > 0) {
      for (const id of slot.preferredIds) {
        const item = CATALOG.find(c => c.id === id);
        if (
          item &&
          !rejectedIds.has(item.id) &&
          !rejectedGroups.has(item.replacementGroup) &&
          ecosystemAllowed(item)
        ) {
          return item;
        }
      }
    }

    // Score catalog by category match, then role match
    const candidates = CATALOG.filter(c => {
      if (rejectedIds.has(c.id)) return false;
      if (rejectedGroups.has(c.replacementGroup)) return false;
      if (!ecosystemAllowed(c)) return false;
      if (slot.category && c.category !== slot.category) return false;
      return true;
    });

    if (candidates.length === 0) {
      // Fallback: match by role
      const byRole = CATALOG.filter(c => {
        if (rejectedIds.has(c.id)) return false;
        if (rejectedGroups.has(c.replacementGroup)) return false;
        if (!ecosystemAllowed(c)) return false;
        return slot.role ? c.role === slot.role : true;
      });
      if (byRole.length === 0) return null;
      return byRole.sort((a, b) => scoreItem(b) - scoreItem(a))[0];
    }

    return candidates.sort((a, b) => scoreItem(b) - scoreItem(a))[0];
  }

  const cards: OfferCardModel[] = [];

  for (const slot of playbook.slots) {
    const primary = fillSlot(slot);
    if (!primary) continue;

    // Precompute back-of-card backup
    const backups = computeCardBackups(primary, session);

    // Back pitch: use backup item's pitch if available, else a context-appropriate fallback
    const backPitch = backups.length > 0
      ? backups[0].pitch
      : 'Keep the setup simple — one protection item covers the basics.';

    const card: OfferCardModel = {
      id: `${workflow}-${slot.id}`,
      headline: slot.headline,
      frontTitle: 'Best move',
      frontItems: [primary],
      frontPitch: primary.pitch,
      backTitle: backups.length > 0 ? 'Backup option' : 'Simpler option',
      backItems: backups,
      backPitch,
      contextTags: chips,
      quickPivots: slot.quickPivots as PivotReason[],
    };

    cards.push(card);

    if (cards.length >= playbook.maxCards) break;
  }

  return cards;
}

/** Empty session state — use as the initial value */
export const EMPTY_SESSION: OfferSessionState = {
  rejectedItemIds: [],
  rejectedGroups: [],
  acceptedItemIds: [],
  pivotHistory: [],
};
