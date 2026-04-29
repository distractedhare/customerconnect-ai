/**
 * recommendationRules.ts
 *
 * Offline IFTTT-style recommendation engine ported from the Gemini knowledge base.
 * Evaluates customer context (profile, needs, intent) and returns matched
 * recommendations for devices, plans, accessories, cross-sells, and objection scripts.
 *
 * This is the TypeScript equivalent of app_logic.py — runs entirely client-side,
 * no API calls needed.
 */

import { SalesContext } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecommendationRule {
  id: string;
  /** Human-readable description of when this rule fires */
  description: string;
  /** Conditions that must be met */
  if: {
    customerProfile?: string[];
    needs?: string[];
    context?: string[];
    intent?: string[];
    carrier?: string[];
    product?: string[];
    /** Age bracket from customer context */
    age?: string[];
  };
  /** What to recommend when conditions match */
  then: {
    recommendedDevices?: string[];
    recommendedPlans?: string[];
    recommendedAccessories?: string[];
    recommendedServices?: string[];
    talkingPoints: string[];
    managerCoaching?: string;
    why?: string;
  };
}

export interface CrossSellRule {
  id: string;
  description: string;
  if: {
    context: string[];
  };
  then: {
    recommendedCrossSell: string[];
    managerCoaching: string;
  };
}

export interface ObjectionScript {
  id: string;
  objection: string;
  likelyUnderlyingConcern: string;
  managerCoaching: string;
  bestFitResponses: string[];
}

export interface ConversationTalkingPoint {
  type: 'discovery_question' | 'technical_support_pivot' | 'closing_question';
  audience: string;
  script: string;
}

export interface EligibilityRule {
  rule: string;
  managerCoaching: string;
}

export interface ComparisonRule {
  comparison: string;
  managerCoaching: string;
  whenProductAIsBetter: string;
  whenProductBIsBetter: string;
}

// ---------------------------------------------------------------------------
// Recommendation Rules (from Gemini IFTTT doc)
// ---------------------------------------------------------------------------

export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: 'REC_MOBILE_FIRST_001',
    description: 'Mobile-first user looking for a new phone with low upfront friction',
    if: {
      needs: ['Latest hardware', 'Low upfront friction'],
      context: ['Looking for a new phone'],
    },
    then: {
      recommendedDevices: ['iPhone 17e', 'iPhone 17 Pro'],
      recommendedAccessories: ['AirPods', 'Nimble CHAMP battery pack'],
      recommendedPlans: ['Experience Beyond'],
      talkingPoints: [
        "Experience Beyond lets you upgrade every year after 6 months — you're never stuck with an old phone.",
        "Grab the Nimble CHAMP battery pack so you never die on the go.",
      ],
      why: 'Mobile-first users value annual upgrades and ecosystem accessories. Experience Beyond fits this perfectly.',
    },
  },
  {
    id: 'REC_FAMILY_SWITCHER_002',
    description: 'Multi-line family looking for lower bill and kid-friendly options',
    if: {
      customerProfile: ['Multi-line Family'],
      needs: ['Lower bill', 'Hotspot for kids'],
    },
    then: {
      recommendedDevices: ['Keep existing phones (Family Freedom buyout)', 'Heavily subsidized standard models'],
      recommendedPlans: [],
      talkingPoints: [
        'Keep your current phones and save on the switch — Family Freedom helps cover what you owe.',
        'Kids can use hotspot instead of a separate internet plan.',
      ],
      why: 'Families switching prioritize cost savings. Keeping devices reduces friction.',
    },
  },
  {
    id: 'REC_BOOMER_003',
    description: 'Older customer upgrading or asking account questions',
    if: {
      age: ['55+'],
      context: ['Upgrading an old phone or asking account questions'],
    },
    then: {
      recommendedDevices: ['Mid-range or standard flagship with large screen'],
      recommendedPlans: ['Essentials Choice 55', 'All-In Plan'],
      talkingPoints: [
        'Prioritizes human support and removes the fear of rate hikes or AI-driven customer service mazes.',
        'Large screen makes everything easier to see and use.',
      ],
      why: 'Older customers value simplicity, human support, and price transparency.',
    },
  },
  {
    id: 'REC_PARENT_KIDS_004',
    description: 'Parent concerned about child safety and cost control',
    if: {
      customerProfile: ['Gen X (35-54)', 'Parent'],
      needs: ['Child safety', 'Cost control'],
      context: ['Adding a line or upgrading their own phone'],
    },
    then: {
      recommendedDevices: ['SyncUP KIDS Watch 2'],
      recommendedServices: ['SyncUP KIDS Watch service'],
      talkingPoints: [
        'Provides peace of mind for parents without giving a young child unrestricted internet access.',
        'GPS tracking, safe zones, and pre-approved contacts only.',
      ],
      why: 'Parents want to stay connected to kids without the risks of a full smartphone.',
    },
  },
  {
    id: 'REC_COMPETITOR_EMERGENCY_005',
    description: 'Customer asking about off-grid coverage for emergencies',
    if: {
      needs: ['Emergency connectivity', 'Off-grid coverage'],
      context: ['Inquiring about coverage in dead zones or hiking trips'],
    },
    then: {
      recommendedServices: ['T-Satellite Standalone Add-on'],
      talkingPoints: [
        'T-Satellite with Starlink gives you texting, location sharing, and 911 access even with zero cell signal.',
        'Included free on Experience Beyond, or $10/mo add-on for other plans.',
      ],
      why: 'Off-grid coverage is a growing differentiator. Satellite fills the gap.',
    },
  },
];

// ---------------------------------------------------------------------------
// Cross-Sell / Upsell Rules
// ---------------------------------------------------------------------------

export const CROSS_SELL_RULES: CrossSellRule[] = [
  {
    id: 'CROSS_SELL_HINT_001',
    description: 'Home Internet Pivot — ask every customer about their Wi-Fi',
    if: { context: ['Any customer interaction'] },
    then: {
      recommendedCrossSell: ['5G Home Internet'],
      managerCoaching: "Team, this is the 'Home Internet Pivot'. Ask every customer: 'How is your home Wi-Fi holding up?' If they complain, offer the $35/mo apartment deal or the $20 bundle credit. If they have a large house, add a mesh extender. Remind them we will pay up to $500 to break their current ISP contract!",
    },
  },
  {
    id: 'CROSS_SELL_INTERNET_BACKUP_002',
    description: 'Customer declines HINT because they have Fiber',
    if: { context: ['Customer declines 5G Home Internet because they already have reliable Fiber'] },
    then: {
      recommendedCrossSell: ['Home Internet Backup'],
      managerCoaching: "If they say 'I have Fiber, I don't need this', pivot to Backup plan! Tell them: 'Fiber is great, but when a storm knocks out the line, your smart home dies. For just $10/mo with your voice line, our Home Internet Backup automatically kicks in with 100 hours of uncapped data to keep you online.'",
    },
  },
  {
    id: 'CROSS_SELL_ACCESSORY_ECOSYSTEM_003',
    description: 'Customer buying flagship phone — counter Amazon accessory objection',
    if: { context: ['Customer is buying a new flagship phone', 'Customer pushes back on accessory pricing vs Amazon'] },
    then: {
      recommendedCrossSell: ['Certified accessories', '3-Item Bundle'],
      managerCoaching: "Use the 'Investment Protection' rule. Cheap Amazon cables destroy battery health due to inconsistent wattage. Remind them that our Apple MFi chargers and Samsung 25W adapters are certified safe for their $1,000 investment. Also, tell them cheap screen protectors block the ultrasonic fingerprint sensors on the Galaxy S26 and Pixel 10 — our ZAGG graphene protectors don't! Close them with the 3-Item Bundle for 25% off.",
    },
  },
  {
    id: 'CROSS_SELL_PROTECTION_004',
    description: 'Any hardware transaction — pitch Protection 360',
    if: { context: ['Any hardware transaction'] },
    then: {
      recommendedCrossSell: ['Protection 360 (P360)'],
      managerCoaching: "Hit them with the new 2026 benefits: P360 now offers $0 front screen repairs and unlimited free screen protector replacements in-store. It's the only way they can get JUMP! upgrades at the 50% payoff mark. Don't forget the AutoPay discount — that instantly saves you $5 to $10 on every single line.",
    },
  },
];

// ---------------------------------------------------------------------------
// Objection Scripts (from Gemini doc — complements the playbook)
// ---------------------------------------------------------------------------

export const OBJECTION_SCRIPTS: ObjectionScript[] = [
  {
    id: 'OBJ_5G_RELIABILITY',
    objection: 'Is the 5G connection actually reliable for my home?',
    likelyUnderlyingConcern: 'Fear of buffering during remote work.',
    managerCoaching: "Use 'Proof & Risk Reversal'. Remove the psychological barrier of switching.",
    bestFitResponses: [
      "It's powered by America's largest 5G network, and we offer a 15-day worry-free test drive so you can prove it to yourself without canceling your old provider first.",
    ],
  },
  {
    id: 'OBJ_CONTRACT_TRAP',
    objection: "I'm worried about being trapped in a long-term contract.",
    likelyUnderlyingConcern: 'Historical carrier PTSD.',
    managerCoaching: "Deploy the 'Freedom Focus' script. Emphasize no contracts, no ETFs.",
    bestFitResponses: [
      "We don't do contracts. Period. You're free to leave anytime. The device payments are separate from your service — and with the new trade-in policy, you're never upside down.",
    ],
  },
  {
    id: 'OBJ_RATE_HIKES',
    objection: "I've had bad experiences with rate hikes at my last carrier.",
    likelyUnderlyingConcern: 'Fear of bait-and-switch pricing.',
    managerCoaching: "Deploy the 'Guarantee Logic' rebuttal. 5-Year Price Guarantee is the differentiator.",
    bestFitResponses: [
      'We have a 5-Year Price Guarantee in writing. The price I quote you today for talk, text, and data is locked for five years. No surprises.',
    ],
  },
  {
    id: 'OBJ_TOO_COMPLICATED',
    objection: "I'm not tech-savvy / It's too complicated to switch.",
    likelyUnderlyingConcern: 'Anxiety about setting up new devices or internet.',
    managerCoaching: "Use the 'Simplification' rebuttal. Lean into human support.",
    bestFitResponses: [
      'With the All-In plan and P360, you get 24/7 live video assistance from our experts to walk you through anything.',
      'We handle the number transfer, the data migration — you just show up with your old phone and leave with everything working.',
    ],
  },
  {
    id: 'OBJ_PROMO_CREDITS',
    objection: 'Why do I lose my promotional credits if I pay off the phone early?',
    likelyUnderlyingConcern: 'Frustration with the new 2026 100% RDC trade-in rule.',
    managerCoaching: "Frame the 100% RDC as a billing simplification that keeps their out-of-pocket low. The credits convert on trade-in now — they don't just vanish.",
    bestFitResponses: [
      "With the 2026 trade-in policy, your remaining credits convert when you trade in — so you're not losing value, you're just moving it to your next phone.",
    ],
  },
];

// ---------------------------------------------------------------------------
// Conversation Talking Points (by audience)
// ---------------------------------------------------------------------------

export const CONVERSATION_TALKING_POINTS: ConversationTalkingPoint[] = [
  {
    type: 'discovery_question',
    audience: 'Millennials (25-34)',
    script: 'Are you working from home or mostly using your data for streaming and gaming?',
  },
  {
    type: 'discovery_question',
    audience: 'Gen X (35-54)',
    script: 'With everyone in the house online, are you finding that your current internet is slowing down when multiple people are streaming at once?',
  },
  {
    type: 'discovery_question',
    audience: 'Boomers (55+)',
    script: "Are you interested in a plan that's simple to manage and offers a consistent monthly price without any surprises?",
  },
  {
    type: 'technical_support_pivot',
    audience: 'Any customer requesting tech support',
    script: "Are you finding that you're hitting your hotspot limits? Maybe it's time for a plan with more high-speed data.",
  },
  {
    type: 'closing_question',
    audience: 'All',
    script: "Will you be taking advantage of our AutoPay discount? It's the easiest way to save $5 to $10 every single month on your bill.",
  },
];

// ---------------------------------------------------------------------------
// Eligibility Constraints
// ---------------------------------------------------------------------------

export const ELIGIBILITY_RULES: EligibilityRule[] = [
  {
    rule: 'Free Line Promo Exclusion',
    managerCoaching: 'As of April 2026, standard free lines are NO LONGER ELIGIBLE for high-value device promotions. You must check the account carefully. They either pay retail on that free line or add a paid line to get the subsidy.',
  },
  {
    rule: 'High-Value Promo Limits',
    managerCoaching: 'Flagship promotions (e.g., $800+ off) are strictly capped at TWO uses per account now. Do not over-promise on massive family plans!',
  },
  {
    rule: 'Tablet & Watch Financing Terms',
    managerCoaching: 'Remember that iPads and smartwatches are now mandatorily placed on 36-month EIP terms. Set that expectation up front.',
  },
];

// ---------------------------------------------------------------------------
// Comparison Rules
// ---------------------------------------------------------------------------

export const COMPARISON_RULES: ComparisonRule[] = [
  {
    comparison: 'Samsung Galaxy S26 Ultra vs iPhone 17 Pro Max',
    managerCoaching: 'Push the S26 Ultra to enterprise commuters or heavy productivity users. Demo the Privacy Display so they see how it stops shoulder-surfers, and highlight the embedded S Pen and 5x optical zoom.',
    whenProductAIsBetter: 'Enterprise, productivity, S Pen users, privacy-conscious',
    whenProductBIsBetter: 'Ecosystem loyalists, content creators, heavy video streamers',
  },
  {
    comparison: '5G Home Internet vs Fiber',
    managerCoaching: 'Fiber is faster, but we win on convenience, failover, and price.',
    whenProductAIsBetter: 'Renters, apartment dwellers, anyone sick of complex installations. Pitch the $35/mo price and plug-and-play setup.',
    whenProductBIsBetter: 'Hardcore gamers needing symmetric upload speeds. But counter by selling our 5G Home Internet BACKUP as a $10/mo failover to keep their smart home running when fiber goes down!',
  },
];

// ---------------------------------------------------------------------------
// Rule Engine — evaluates context and returns matches
// ---------------------------------------------------------------------------

export function evaluateRules(context: SalesContext): RecommendationRule[] {
  return RECOMMENDATION_RULES.filter(rule => {
    const cond = rule.if;

    // Check age match
    if (cond.age && cond.age.length > 0) {
      if (!cond.age.includes(context.age)) return false;
    }

    // Check product match
    if (cond.product && cond.product.length > 0) {
      if (!cond.product.some(p => context.product.includes(p as any))) return false;
    }

    // Check intent match
    if (cond.intent && cond.intent.length > 0) {
      if (!cond.intent.includes(context.purchaseIntent)) return false;
    }

    // Check carrier match
    if (cond.carrier && cond.carrier.length > 0) {
      if (!context.currentCarrier || !cond.carrier.includes(context.currentCarrier)) return false;
    }

    // If no specific conditions are set, rule matches broadly
    return true;
  });
}

/**
 * Get objection scripts relevant to specific deep dive keys
 * (linked from the objection playbook scenarios)
 */
export function getDeepDiveScripts(keys: string[]): ObjectionScript[] {
  // Simple keyword matching against objection IDs and content
  return OBJECTION_SCRIPTS.filter(script => {
    const searchText = `${script.id} ${script.objection} ${script.managerCoaching}`.toLowerCase();
    return keys.some(key => searchText.includes(key.toLowerCase().replace(/_/g, ' ')));
  });
}

/**
 * Get conversation talking points for a specific age group
 */
export function getTalkingPointsForAge(age: string): ConversationTalkingPoint[] {
  const ageToAudience: Record<string, string> = {
    '18-24': 'Millennials',
    '25-34': 'Millennials',
    '35-54': 'Gen X',
    '55+': 'Boomers',
  };
  const audience = ageToAudience[age] || '';
  return CONVERSATION_TALKING_POINTS.filter(
    tp => tp.audience === 'All' || tp.audience.includes(audience)
  );
}

/**
 * Get relevant cross-sell rules based on context keywords
 */
export function getRelevantCrossSells(contextKeywords: string[]): CrossSellRule[] {
  return CROSS_SELL_RULES.filter(rule => {
    return rule.if.context.some(ctx =>
      ctx.toLowerCase() === 'any customer interaction' ||
      ctx.toLowerCase() === 'any hardware transaction' ||
      contextKeywords.some(kw => ctx.toLowerCase().includes(kw.toLowerCase()))
    );
  });
}
