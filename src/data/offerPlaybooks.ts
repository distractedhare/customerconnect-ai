/**
 * Offer playbooks — one per workflow.
 *
 * Each playbook defines:
 * - Which catalog categories/roles to prioritize (slots)
 * - The headline and framing for that workflow
 * - Which pivot reasons are relevant per slot
 *
 * The offer engine uses these as a ranked slot template, then fills each slot
 * with the highest-scoring matching item from the catalog (signal-boosted).
 */

import { OfferWorkflow, PivotReason, CatalogItem } from '../types';

export interface PlaybookSlot {
  id: string;
  headline: string;
  description: string;
  /** Primary category to fill — engine matches by category first */
  category?: CatalogItem['category'];
  /** Fallback role to match if category doesn't produce a result */
  role?: CatalogItem['role'];
  /** Specific item IDs to prefer (ordered) — engine falls back to category/role scoring if empty */
  preferredIds?: string[];
  quickPivots: PivotReason[];
  /** If true, only include this slot when the customer is not on a support intent */
  salesOnly?: boolean;
  /** If true, skip this slot when P360 was already rejected */
  skipIfP360Rejected?: boolean;
}

export interface OfferPlaybook {
  workflow: OfferWorkflow;
  headline: string;
  subhead: string;
  /** Max number of cards to show at once */
  maxCards: number;
  slots: PlaybookSlot[];
}

export const OFFER_PLAYBOOKS: Record<OfferWorkflow, OfferPlaybook> = {

  // ── UPGRADE — most important lane, attach-first ──
  upgrade: {
    workflow: 'upgrade',
    headline: 'Protect the upgrade',
    subhead: 'Lock in protection first, then day-one essentials.',
    maxCards: 4,
    slots: [
      {
        id: 'p360-anchor',
        headline: 'Protect the upgrade',
        description: 'Lead with P360 — it\'s part of the upgrade, not an add-on.',
        category: 'p360',
        preferredIds: ['p360'],
        quickPivots: ['too_expensive', 'already_has_one', 'show_secondary'],
      },
      {
        id: 'case-protection',
        headline: 'Day-one essentials',
        description: 'Case + screen protector — the two things they\'ll wish they had on day one.',
        category: 'case',
        quickPivots: ['too_expensive', 'different_style', 'already_has_one', 'keep_it_simple'],
      },
      {
        id: 'screen-protection',
        headline: 'Complete the setup',
        description: 'Screen protection rounds out the protect + power setup.',
        category: 'screen',
        quickPivots: ['too_expensive', 'already_has_one', 'keep_it_simple', 'keep_setup_intact'],
      },
      {
        id: 'power',
        headline: 'Power it up',
        description: 'New phones don\'t include a charger — easy add at the end.',
        category: 'charger',
        quickPivots: ['too_expensive', 'already_has_one', 'show_secondary'],
      },
    ],
  },

  // ── READY TO BUY — complete-the-setup, qualifying-set focused ──
  ready: {
    workflow: 'ready',
    headline: 'Complete the setup',
    subhead: 'They\'re buying — lock in protection and power from the start.',
    maxCards: 4,
    slots: [
      {
        id: 'p360-anchor',
        headline: 'Protect the purchase',
        description: 'P360 is the logical next step when they\'re buying a new device.',
        category: 'p360',
        preferredIds: ['p360'],
        quickPivots: ['too_expensive', 'already_has_one', 'show_secondary'],
      },
      {
        id: 'case-protection',
        headline: 'Day-one essentials',
        description: 'Case + screen protector — protect before they leave the store.',
        category: 'case',
        quickPivots: ['too_expensive', 'different_style', 'already_has_one', 'keep_it_simple'],
      },
      {
        id: 'screen-protection',
        headline: 'Works well together',
        description: 'Screen protector rounds out the protection setup.',
        category: 'screen',
        quickPivots: ['too_expensive', 'already_has_one', 'keep_it_simple', 'keep_setup_intact'],
      },
      {
        id: 'power',
        headline: 'Easy add-ons',
        description: 'Charger or wireless pad — they\'ll need it anyway.',
        category: 'charger',
        quickPivots: ['too_expensive', 'already_has_one', 'show_secondary'],
      },
    ],
  },

  // ── EXPLORE — lighter entry, lower pressure ──
  explore: {
    workflow: 'explore',
    headline: 'Good together',
    subhead: 'A couple of essentials to think about.',
    maxCards: 2,
    slots: [
      {
        id: 'protection-intro',
        headline: 'Good together',
        description: 'Protection is the easy starting point before they commit.',
        category: 'p360',
        preferredIds: ['p360'],
        quickPivots: ['too_expensive', 'keep_it_simple', 'show_secondary'],
      },
      {
        id: 'essentials-intro',
        headline: 'Easy add-ons',
        description: 'Case and charger are the two things most people wish they\'d grabbed.',
        category: 'case',
        quickPivots: ['too_expensive', 'different_style', 'keep_it_simple'],
      },
    ],
  },

  // ── ORDER SUPPORT — fix-first, then a relevant pivot if context warrants ──
  'order-support': {
    workflow: 'order-support',
    headline: 'Fix it first',
    subhead: 'Resolve the order. One relevant follow-up if the setup makes sense.',
    maxCards: 1,
    slots: [
      {
        id: 'prevention-follow',
        headline: 'One thing to think about',
        description: 'While the order is resolving — one relevant easy add if the context fits.',
        category: 'p360',
        preferredIds: ['p360', 'syncup-tracker'],
        quickPivots: ['too_expensive', 'already_has_one', 'keep_it_simple'],
      },
    ],
  },

  // ── TECH SUPPORT — fix first, then one prevention/convenience move ──
  'tech-support': {
    workflow: 'tech-support',
    headline: 'After we fix it',
    subhead: 'One relevant prevention or convenience move after the issue is resolved.',
    maxCards: 2,
    slots: [
      {
        id: 'prevention',
        headline: 'After we fix it',
        description: 'Now that it\'s resolved — P360 covers future issues automatically.',
        category: 'p360',
        preferredIds: ['p360'],
        quickPivots: ['too_expensive', 'already_has_one', 'keep_it_simple'],
      },
      {
        id: 'convenience-follow',
        headline: 'One relevant add',
        description: 'One item based on what brought them in.',
        category: 'charger',
        quickPivots: ['too_expensive', 'already_has_one', 'keep_it_simple'],
      },
    ],
  },

  // ── ACCOUNT SUPPORT — not accessory-first; prefer plan/service nudges ──
  'account-support': {
    workflow: 'account-support',
    headline: 'While we\'re here',
    subhead: 'One service or device add worth mentioning after sorting the account.',
    maxCards: 1,
    slots: [
      {
        id: 'service-nudge',
        headline: 'One more thing',
        description: 'Account calls are a great moment for a watch, tracker, or service nudge.',
        category: 'tracker',
        preferredIds: ['syncup-kids-watch', 'apple-watch-se', 'syncup-tracker'],
        quickPivots: ['too_expensive', 'already_has_one', 'keep_it_simple', 'show_secondary'],
      },
    ],
  },
};

/** Service nudges keyed by CustomerSignalTag — surfaced when signals are strong enough */
export const SERVICE_NUDGES_BY_SIGNAL: Record<string, {
  id: string;
  title: string;
  why: string;
  talkTrack: string;
}[]> = {
  'storm-ready': [
    {
      id: 'tsatellite-storm',
      title: 'T-Satellite with Starlink',
      why: 'Stays connected when cell towers go down — included FREE on Experience Beyond.',
      talkTrack: '"One thing worth knowing — on Experience Beyond, T-Satellite with Starlink is included free. That\'s coverage even when towers are down from a storm."',
    },
  ],
  'outdoorsy': [
    {
      id: 'tsatellite-outdoor',
      title: 'T-Satellite with Starlink',
      why: '500,000+ sq miles of satellite coverage for areas with no cell towers.',
      talkTrack: '"If they go off-grid — T-Satellite covers areas with zero cell towers. Free on Experience Beyond."',
    },
  ],
  'travel': [
    {
      id: 'tsatellite-travel',
      title: 'T-Satellite + International Coverage',
      why: 'Satellite backup plus free roaming in 215+ countries on Experience Beyond.',
      talkTrack: '"T-Mobile has Starlink satellite backup now, and free roaming in 215 countries on Experience Beyond. For travelers, that\'s a real differentiator."',
    },
  ],
  'parent': [
    {
      id: 'kids-watch-parent',
      title: 'SyncUP KIDS Watch 2',
      why: 'Kids can call/text, parents see where they are — no phone required.',
      talkTrack: '"For the kids — this watch lets them call and text, and you can see where they are, but there\'s no browser or social media. $5/mo for the line."',
    },
  ],
  'family-coordination': [
    {
      id: 'family-tracker',
      title: 'SyncUP Tracker',
      why: 'Real GPS on T-Mobile\'s network — not Bluetooth like AirTag.',
      talkTrack: '"SyncUP Tracker uses our cellular network, so it works everywhere AirTag doesn\'t. Great for kids\' backpacks, pets, or luggage."',
    },
  ],
};
