// Schema for weekly-update.json — authored in Cowork, consumed here.
// DO NOT edit the weekly-update.json file from code. Flag issues to the user.

export interface WeeklyUpdateMetadata {
  updatedDate: string;   // ISO date: "2026-03-26"
  validUntil: string;    // ISO date: "2026-04-02"
  version: string;       // Semver: "1.0.0"
}

export interface PromoObjection {
  objection: string;
  response: string;
}

export interface Promo {
  name: string;
  details: string;
  appliesToIntents: string[];   // e.g. ["browsing", "ready to buy", "upgrade / add a line"]
  commonObjections: PromoObjection[];
}

export interface PlanUpdate {
  planName: string;
  change: string;
  effectiveDate: string;
  talkingPoint: string;
}

export interface CompetitiveIntel {
  carrier: string;
  intel: string;
  talkingPoint: string;
  appliesToIntents?: string[];
}

export interface KnownIssue {
  issue: string;
  workaround: string;
  appliesToIntents: string[];
}

export interface IntentPlaybook {
  openers: string[];
  discovery: string[];
  keyMoves: string[];
  closingTips: string[];
  avoidMoves: string[];
  oneLiners?: string[];
}

export interface TrendingItem {
  buzz: string;        // e.g. "Galaxy S26 Ultra free on Experience Beyond"
  source: string;      // e.g. "TikTok / Instagram" or "TV ads" or "walk-ins asking"
  repTip: string;      // one-line tip for the rep: "Confirm they're on Beyond or upgrading to it"
}

export interface FeatureWhyItMatters {
  feature: string;
  whyItMatters: Record<string, string>;  // keyed by demographic: "young-adult", "family", "senior", "business", "budget", "switcher"
}

export interface PlanSellingGuide {
  planName: string;
  positioning: string;         // one-line: what is this plan's identity?
  idealCustomer: string;       // who should be on this plan?
  whyNotCheaper: string;       // rebuttal: "why not just get the cheaper plan?"
  whyNotPricier: string;       // rebuttal: "should I get the more expensive one?"
  features: FeatureWhyItMatters[];
  demographicPitch: Record<string, string>;  // keyed by demographic: full pitch paragraph
  upgradeFrom: string;         // what to say to upgrade someone FROM a lower plan TO this one
  anchorPrice: string;         // how to frame the price (e.g. "Less than $2/day per line")
}

export interface WeeklyUpdate {
  metadata: WeeklyUpdateMetadata;
  weeklyFocus: {
    headline: string;
    context: string;
  };
  trending?: TrendingItem[];  // "What's Trending" — what customers are buzzing about right now
  currentPromos: Promo[];
  planUpdates: PlanUpdate[];
  competitiveIntel: CompetitiveIntel[];
  knownIssues: KnownIssue[];
  intentPlaybooks: Record<string, IntentPlaybook>;
  planSellingGuide?: PlanSellingGuide[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/** Return a human-readable validation error, or null when valid. */
export function getWeeklyUpdateValidationError(data: unknown): string | null {
  if (!isRecord(data)) return 'Root value must be a JSON object.';

  const metadata = data.metadata;
  if (!isRecord(metadata)) return 'Missing required object: metadata.';
  if (typeof metadata.updatedDate !== 'string') return 'metadata.updatedDate must be a string.';
  if (typeof metadata.validUntil !== 'string') return 'metadata.validUntil must be a string.';
  if (typeof metadata.version !== 'string') return 'metadata.version must be a string.';

  const weeklyFocus = data.weeklyFocus;
  if (!isRecord(weeklyFocus)) return 'Missing required object: weeklyFocus.';
  if (typeof weeklyFocus.headline !== 'string') return 'weeklyFocus.headline must be a string.';
  if (typeof weeklyFocus.context !== 'string') return 'weeklyFocus.context must be a string.';

  if (!Array.isArray(data.currentPromos)) return 'currentPromos must be an array.';
  for (const [index, promo] of data.currentPromos.entries()) {
    if (!isRecord(promo)) return `currentPromos[${index}] must be an object.`;
    if (typeof promo.name !== 'string') return `currentPromos[${index}].name must be a string.`;
    if (typeof promo.details !== 'string') return `currentPromos[${index}].details must be a string.`;
    if (!isStringArray(promo.appliesToIntents)) return `currentPromos[${index}].appliesToIntents must be an array of strings.`;
    if (!Array.isArray(promo.commonObjections)) return `currentPromos[${index}].commonObjections must be an array.`;
  }

  if (!Array.isArray(data.planUpdates)) return 'planUpdates must be an array.';
  for (const [index, update] of data.planUpdates.entries()) {
    if (!isRecord(update)) return `planUpdates[${index}] must be an object.`;
    if (typeof update.planName !== 'string') return `planUpdates[${index}].planName must be a string.`;
    if (typeof update.change !== 'string') return `planUpdates[${index}].change must be a string.`;
    if (typeof update.effectiveDate !== 'string') return `planUpdates[${index}].effectiveDate must be a string.`;
    if (typeof update.talkingPoint !== 'string') return `planUpdates[${index}].talkingPoint must be a string.`;
  }

  if (!Array.isArray(data.competitiveIntel)) return 'competitiveIntel must be an array.';
  for (const [index, intel] of data.competitiveIntel.entries()) {
    if (!isRecord(intel)) return `competitiveIntel[${index}] must be an object.`;
    if (typeof intel.carrier !== 'string') return `competitiveIntel[${index}].carrier must be a string.`;
    if (typeof intel.intel !== 'string') return `competitiveIntel[${index}].intel must be a string.`;
    if (typeof intel.talkingPoint !== 'string') return `competitiveIntel[${index}].talkingPoint must be a string.`;
    if (intel.appliesToIntents !== undefined && !isStringArray(intel.appliesToIntents)) {
      return `competitiveIntel[${index}].appliesToIntents must be an array of strings when present.`;
    }
  }

  if (!Array.isArray(data.knownIssues)) return 'knownIssues must be an array.';
  for (const [index, issue] of data.knownIssues.entries()) {
    if (!isRecord(issue)) return `knownIssues[${index}] must be an object.`;
    if (typeof issue.issue !== 'string') return `knownIssues[${index}].issue must be a string.`;
    if (typeof issue.workaround !== 'string') return `knownIssues[${index}].workaround must be a string.`;
    if (!isStringArray(issue.appliesToIntents)) return `knownIssues[${index}].appliesToIntents must be an array of strings.`;
  }

  if (data.trending !== undefined) {
    if (!Array.isArray(data.trending)) return 'trending must be an array when present.';
    for (const [index, trend] of data.trending.entries()) {
      if (!isRecord(trend)) return `trending[${index}] must be an object.`;
      if (typeof trend.buzz !== 'string') return `trending[${index}].buzz must be a string.`;
      if (typeof trend.source !== 'string') return `trending[${index}].source must be a string.`;
      if (typeof trend.repTip !== 'string') return `trending[${index}].repTip must be a string.`;
    }
  }

  if (!isRecord(data.intentPlaybooks)) return 'intentPlaybooks must be an object.';
  for (const [intent, playbook] of Object.entries(data.intentPlaybooks)) {
    if (!isRecord(playbook)) return `intentPlaybooks.${intent} must be an object.`;
    if (!isStringArray(playbook.openers)) return `intentPlaybooks.${intent}.openers must be an array of strings.`;
    if (!isStringArray(playbook.discovery)) return `intentPlaybooks.${intent}.discovery must be an array of strings.`;
    if (!isStringArray(playbook.keyMoves)) return `intentPlaybooks.${intent}.keyMoves must be an array of strings.`;
    if (!isStringArray(playbook.closingTips)) return `intentPlaybooks.${intent}.closingTips must be an array of strings.`;
    if (!isStringArray(playbook.avoidMoves)) return `intentPlaybooks.${intent}.avoidMoves must be an array of strings.`;
    if (playbook.oneLiners !== undefined && !isStringArray(playbook.oneLiners)) {
      return `intentPlaybooks.${intent}.oneLiners must be an array of strings when present.`;
    }
  }

  if (data.planSellingGuide !== undefined) {
    if (!Array.isArray(data.planSellingGuide)) return 'planSellingGuide must be an array when present.';
    for (const [index, guide] of data.planSellingGuide.entries()) {
      if (!isRecord(guide)) return `planSellingGuide[${index}] must be an object.`;
      if (typeof guide.planName !== 'string') return `planSellingGuide[${index}].planName must be a string.`;
      if (typeof guide.positioning !== 'string') return `planSellingGuide[${index}].positioning must be a string.`;
      if (typeof guide.idealCustomer !== 'string') return `planSellingGuide[${index}].idealCustomer must be a string.`;
      if (!Array.isArray(guide.features)) return `planSellingGuide[${index}].features must be an array.`;
    }
  }

  return null;
}

/** Validate a parsed JSON object against the WeeklyUpdate schema. */
export function validateWeeklyUpdate(data: unknown): data is WeeklyUpdate {
  return getWeeklyUpdateValidationError(data) === null;
}
