// ─── Metadata ───
export interface IntelMetadata {
  generatedDate: string;
  coversFrom: string;
  coversTo: string;
  sourcesSearched: string[];
  confidence: 'high' | 'medium' | 'low';
  previousUpdateDate: string;
}

// ─── T-Mobile Campaigns ───
export interface NewCampaign {
  id: string;
  name: string;
  type: 'plan_promo' | 'device_promo' | 'switcher_offer' | 'brand_campaign' | 'product_launch';
  description: string;
  startDate: string | null;
  endDate: string | null;
  eligibility: string;
  salesTalkingPoint: string;
  affectsRegions: string[];
  source: string;
}

export interface EndedCampaign {
  name: string;
  endedDate: string;
  replacement: string | null;
  source: string;
}

export interface ChangedCampaign {
  name: string;
  whatChanged: string;
  previousTerms: string;
  newTerms: string;
  source: string;
}

// ─── Competitor Updates ───
export interface CompetitorChange {
  id: string;
  date: string;
  type:
    | 'price_change' | 'plan_change' | 'new_promo' | 'ended_promo'
    | 'controversy' | 'outage' | 'leadership' | 'earnings'
    | 'policy_change' | 'network_change';
  headline: string;
  details: string;
  salesImpact: string;
  suggestedTalkingPoint: string;
  source: string;
  unverified: boolean;
}

export interface PlanUpdate {
  action: 'added' | 'removed' | 'changed';
  planName: string;
  previousValue: string | null;
  newValue: string | null;
  details: string;
  source: string;
}

export interface VulnerabilityUpdate {
  original: string;
  replacement: string;
}

export interface PromoUpdate {
  id: string;
  status: 'new' | 'ended' | 'changed';
  name: string;
  details?: string;
  finePrint?: string;
  tmobileCounter?: string;
  endedDate?: string;
}

export interface CarrierUpdate {
  changes: CompetitorChange[];
  planUpdates?: PlanUpdate[];
  vulnerabilityUpdates?: {
    add?: string[];
    remove?: string[];
    update?: VulnerabilityUpdate[];
  };
  strengthUpdates?: {
    add?: string[];
    remove?: string[];
  };
  activePromos?: PromoUpdate[];
}

// ─── Regional Intel ───
export interface RegionalAlert {
  id: string;
  type: 'promo' | 'outage' | 'regulatory' | 'market_shift' | 'store_change';
  competitor: string;
  headline: string;
  details: string;
  affectedStates: string[];
  salesImplication: string;
  source: string;
}

export type CableMvnoStatus = 'expanded' | 'contracted' | 'launched' | 'unchanged';

export interface RegionUpdate {
  alerts: RegionalAlert[];
  cableMvnoChanges?: Partial<Record<string, CableMvnoStatus>>;
}

// ─── Weekly Highlights ───
export interface KeyStat {
  stat: string;
  context: string;
  source: string;
}

export interface WeeklyHighlights {
  biggestThreat: {
    competitor: string;
    why: string;
    counterStrategy: string;
  };
  biggestOpportunity: {
    description: string;
    targetCustomer: string;
    pitch: string;
  };
  trendingTopics: {
    topic: string;
    context: string;
    repGuidance: string;
  }[];
  keyNumbersThisPeriod: KeyStat[];
}

// ─── Canonical Keys ───
export type CarrierKey =
  | 'AT&T' | 'Verizon' | 'Xfinity' | 'Spectrum' | 'Cox' | 'Optimum'
  | 'Cricket' | 'Metro' | 'Visible' | 'Boost' | 'Mint'
  | 'US Mobile' | 'Consumer Cellular' | 'Straight Talk' | 'Google Fi';

export type RegionKey =
  | 'New England' | 'Mid-Atlantic' | 'South Atlantic' | 'Southeast'
  | 'Deep South' | 'Mid-South' | 'Great Lakes' | 'Upper Midwest'
  | 'Great Plains' | 'Texas & Oklahoma' | 'Desert Southwest'
  | 'Rocky Mountains' | 'Pacific Northwest' | 'California'
  | 'Alaska' | 'Hawaii';

// ─── The Full Update File ───
export interface IntelUpdate {
  metadata: IntelMetadata;
  tmobileCampaigns?: {
    new?: NewCampaign[];
    ended?: EndedCampaign[];
    changed?: ChangedCampaign[];
  };
  competitorUpdates?: Partial<Record<CarrierKey, CarrierUpdate>>;
  regionalIntel?: Partial<Record<RegionKey, RegionUpdate>>;
  weeklyHighlights?: WeeklyHighlights;
}
