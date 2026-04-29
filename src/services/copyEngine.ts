/**
 * Copy Engine — rep-safe talk tracks and UI labels.
 *
 * Rules:
 * - Never use "bundle", "cross-sell", "upsell", "qualifying set"
 * - Lead with day-one value, not discount math
 * - Discount/qualification status is subtle support text, not the headline
 */

import { PivotReason, OfferWorkflow, CustomerSignal } from '../types';
import { CatalogItem } from '../types';

/** Labels shown on quick-pivot chips */
export const PIVOT_CHIP_LABELS: Record<PivotReason, string> = {
  too_expensive:     'Too pricey',
  already_has_one:   'Already has one',
  different_style:   'Different style',
  keep_it_simple:    'Keep it simple',
  keep_setup_intact: 'Keep setup intact',
  show_secondary:    'Show something else',
};

/** Rep talk track for transitioning after a pivot */
export function getPivotTalkTrack(
  reason: PivotReason,
  fromItem: CatalogItem,
  toItem?: CatalogItem,
): string {
  switch (reason) {
    case 'too_expensive':
      return toItem
        ? `"No problem — ${toItem.name} covers the same need at a better price point."`
        : `"No worries — let's keep the setup simple and add just the essentials."`;
    case 'already_has_one':
      return toItem
        ? `"Got it — since you're covered there, how about ${toItem.name}? Different category, still a good daily fit."`
        : `"Totally fine — let's move on to something you don't have yet."`;
    case 'different_style':
      return toItem
        ? `"Sure — ${toItem.name} has a different look. Same protection, different feel."`
        : `"Makes sense — let me show you another option that might fit better."`;
    case 'keep_it_simple':
      return toItem
        ? `"Easy — let's go with ${toItem.name} and keep it clean."`
        : `"Sounds good — we'll keep the setup minimal today."`;
    case 'keep_setup_intact':
      return toItem
        ? `"${toItem.name} still works well with the rest of the setup — keeps everything together."`
        : `"Let me find an option that still fits the setup."`;
    case 'show_secondary':
      return toItem
        ? `"Different direction — ${toItem.name} is worth a quick look if you're open to it."`
        : `"Let me show you something completely different."`;
  }
}

/** Headline for the offer engine intro, tuned by workflow + signals */
export function getWorkflowIntro(
  workflow: OfferWorkflow,
  signals: CustomerSignal[],
): { headline: string; subhead: string } {
  const topTag = signals[0]?.tag;

  // Signal-boosted copy for specific contexts
  if (topTag === 'storm-ready') {
    return {
      headline: 'Protect + stay ready',
      subhead: 'Good coverage and a solid setup for whatever comes.',
    };
  }
  if (topTag === 'parent' || topTag === 'family-coordination') {
    return {
      headline: 'Good for the whole setup',
      subhead: 'Protection, power, and one family-friendly add.',
    };
  }
  if (topTag === 'outdoorsy') {
    return {
      headline: 'Built for the outdoors',
      subhead: 'Protection first, then a daily convenience.',
    };
  }

  // Workflow defaults
  switch (workflow) {
    case 'upgrade':
      return {
        headline: 'Protect the upgrade',
        subhead: 'Lock in protection and one daily essential.',
      };
    case 'ready':
      return {
        headline: 'Complete the setup',
        subhead: 'Day-one essentials before you head out.',
      };
    case 'explore':
      return {
        headline: 'Easy add-ons',
        subhead: 'A few things worth thinking about.',
      };
    case 'tech-support':
      return {
        headline: 'After we fix it',
        subhead: 'One thing to prevent this from happening again.',
      };
    case 'order-support':
      return {
        headline: 'One thing while we wait',
        subhead: 'Quick follow-up while we track down your order.',
      };
    case 'account-support':
      return {
        headline: 'While we have the account open',
        subhead: 'One add worth knowing about.',
      };
  }
}

/** Subtle qualifying status label — never shouts percentages as the headline */
export function getQualifyingLabel(qualifyingCount: number): string {
  if (qualifyingCount >= 3) return 'Works well together';
  if (qualifyingCount === 2) return 'Add one more qualifying item';
  if (qualifyingCount === 1) return 'Day-one essentials';
  return '';
}
