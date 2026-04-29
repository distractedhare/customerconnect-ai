/**
 * Promo rules — single source of truth for qualifying set logic.
 *
 * qualifyingSetId must match the qualifyingSetIds values used in accessoryCatalog.ts.
 *
 * TODO: Confirm exact eligibility items and dates with current T-Mobile promo documentation.
 * This implements the current two-tier structure:
 *   - 'essential' set: 2 items = 15% off, 3+ items = 25% off
 */

import { PromoRule } from '../types';

export const PROMO_RULES: PromoRule[] = [
  {
    id: 'essential-25pct',
    label: 'Save 25% — 3+ Essential Accessories',
    channel: 'store',
    qualifyingSetId: 'essential',
    requiredQty: 3,
    discountPct: 25,
    subtleLabel: 'Works well together',
    hardPromoLabel: '25% off all 3',
    combinable: false,
  },
  {
    id: 'essential-15pct',
    label: 'Save 15% — 2 Essential Accessories',
    channel: 'store',
    qualifyingSetId: 'essential',
    requiredQty: 2,
    discountPct: 15,
    subtleLabel: 'Add one more qualifying item',
    hardPromoLabel: '15% off both',
    combinable: false,
  },
];

/** Items that qualify for the essential accessory deal (for reference / education).
 *  Canonical eligibility lives on each CatalogItem via qualifyingSetIds: ['essential'].
 *  This list is for display/training purposes only.
 */
export const ESSENTIAL_QUALIFYING_CATEGORIES = [
  'Cases',
  'Screen Protectors',
  'Chargers + Cables',
  'Wireless Chargers',
  'Camera Protectors',
  'Car Mounts',
  'Battery Packs',
  'Phone Grips',
  'Watch Screen Protectors',
];

/** Items that do NOT qualify for the essential accessory deal */
export const NON_QUALIFYING_NOTE =
  'Audio (AirPods, Galaxy Buds, Beats, Sony, Bose) and Protection 360 do not count toward the essential accessory deal. Pitch them separately.';
