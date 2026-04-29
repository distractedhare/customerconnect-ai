import { OrderSupportType } from './components/OrderSupportSelector';

export type SupportFocus =
  | 'tech_device_issue'
  | 'tech_signal_issue'
  | 'tech_internet_issue'
  | 'tech_frustrated_urgent'
  | 'account_billing'
  | 'account_plan_question'
  | 'account_login_access'
  | 'account_line_change'
  | 'order_tracking'
  | 'order_activation_issue'
  | 'order_delayed_shipment'
  | 'order_missing_item';

export interface SalesContext {
  age: '18-24' | '25-34' | '35-54' | '55+' | 'Not Specified';
  region: 'New England' | 'Mid-Atlantic' | 'South Atlantic' | 'Southeast' | 'Deep South' | 'Mid-South' | 'Great Lakes' | 'Upper Midwest' | 'Great Plains' | 'Texas & Oklahoma' | 'Desert Southwest' | 'Rocky Mountains' | 'Pacific Northwest' | 'California' | 'Alaska' | 'Hawaii' | 'Not Specified';
  state?: string;
  zipCode?: string;
  product: ('Phone' | 'Home Internet' | 'BTS' | 'IOT' | 'No Specific Product')[];
  purchaseIntent: 'exploring' | 'ready to buy' | 'upgrade / add a line' | 'order support' | 'tech support' | 'account support';
  orderSupportType?: OrderSupportType;
  supportFocus?: SupportFocus;
  plan?: string;
  currentCarrier?: 'AT&T' | 'Verizon' | 'Spectrum' | 'Xfinity' | 'US Cellular' | 'Prepaid (Mint, Boost, etc.)' | 'Other' | 'Not Specified';
  totalLines?: number;
  familyCount?: number;
  currentPlatform?: 'iOS' | 'Android' | 'Other' | 'Not Specified';
  currentDeviceBrand?: string;
  desiredPlatform?: 'iOS' | 'Android' | 'Other' | 'Not Specified';
  hintAvailable?: boolean;
  hintQualified?: 'Yes' | 'No' | 'Wait';
}

export interface StoreInfo {
  name: string;
  address: string;
  distance?: string;
  phone?: string;
  rating?: number;
  mapsUrl?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AccessoryRecommendation {
  name: string;
  why: string;
  priceRange: string;
  /** Specific verified prices from t-mobile.com for key items */
  verifiedPrices?: { item: string; fullPrice: string; salePrice?: string }[];
  brands: string[];
  /** Whether this item qualifies for the 25% off 3+ Essential Accessories bundle */
  bundleEligible: boolean;
}

export interface SalesScript {
  welcomeMessages: string[];
  smallTalk: {
    category: string;
    text: string;
  }[];
  discoveryQuestions: string[];
  valuePropositions: string[];
  objectionHandling: {
    concern: string;
    reassurance: string;
  }[];
  accessoryRecommendations: AccessoryRecommendation[];
  purchaseSteps: string[];
  oneLiners: string[];
  coachsCorner: string;
  nearbyStores?: StoreInfo[];
  groundingSources?: GroundingSource[];
}

export interface ObjectionAnalysis {
  talkingPoints: string[];
  counterArguments: string[];
  pivotPlays?: {
    strategy: string;
    script: string;
  }[];
  carrierSpecificArguments?: string[];
  coachsCorner: string;
  complianceNotes: string;
  groundingSources?: GroundingSource[];
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFER ENGINE TYPES — context-aware, workflow-driven offer system
// ─────────────────────────────────────────────────────────────────────────────

export type OfferWorkflow =
  | 'explore'
  | 'ready'
  | 'upgrade'
  | 'order-support'
  | 'tech-support'
  | 'account-support';

export type PivotReason =
  | 'too_expensive'
  | 'already_has_one'
  | 'different_style'
  | 'keep_it_simple'
  | 'keep_setup_intact'
  | 'show_secondary';

export type OfferItemKind = 'accessory' | 'protection' | 'wearable' | 'tracker' | 'service';

export type CustomerSignalTag =
  | 'storm-ready'
  | 'commuter'
  | 'outdoorsy'
  | 'gym'
  | 'parent'
  | 'kids-safe'
  | 'older-adult'
  | 'privacy-minded'
  | 'travel'
  | 'battery-anxiety'
  | 'simplicity-first'
  | 'budget-sensitive'
  | 'premium-leaning'
  | 'family-coordination';

export interface CustomerSignal {
  tag: CustomerSignalTag;
  strength: number; // 0–1
  source: string;
}

export interface CatalogItem {
  id: string;
  sku?: string;
  name: string;
  kind: OfferItemKind;
  category: 'p360' | 'case' | 'screen' | 'charger' | 'battery' | 'mount' | 'audio' | 'watch' | 'kids-watch' | 'tracker' | 'plan' | 'other';
  role: 'protection' | 'power' | 'privacy' | 'convenience' | 'fitness' | 'family-safety' | 'secondary' | 'service';
  ecosystem: 'apple' | 'samsung' | 'pixel' | 'android' | 'all';
  compatibleDevices?: string[];
  compatibleBrands?: string[];
  /** IDs of qualifying promo sets this item counts toward */
  qualifyingSetIds: string[];
  /** Items in the same group are swappable pivots */
  replacementGroup: string;
  price?: number;
  priceLabel?: string;
  salePriceLabel?: string;
  imageKey?: string;
  styleTags: string[];
  lifestyleTags: string[];
  signalTags: string[];
  workflowWeights: Partial<Record<OfferWorkflow, number>>;
  backupIds?: string[];
  cheaperAltIds?: string[];
  premiumAltIds?: string[];
  pitch: string;
  why: string;
}

export interface PromoRule {
  id: string;
  label: string;
  channel: 'vr' | 'store' | 'web';
  qualifyingSetId: string;
  requiredQty: number;
  discountPct: number;
  subtleLabel: string;
  hardPromoLabel?: string;
  combinable?: boolean;
}

export interface OfferSlot {
  id: string;
  role: 'anchor' | 'essential-a' | 'essential-b' | 'secondary';
  item: CatalogItem | null;
  backups: Partial<Record<PivotReason, CatalogItem[]>>;
}

export interface OfferSet {
  id: string;
  workflow: OfferWorkflow;
  headline: string;
  subhead: string;
  contextTags: string[];
  slots: OfferSlot[];
  serviceNudges?: Array<{
    id: string;
    title: string;
    why: string;
    talkTrack: string;
  }>;
  qualifyingStatus: {
    activeRuleId?: string;
    qualifiesNow: boolean;
    subtleLabel: string;
    nextBestItemIds?: string[];
  };
}

export interface OfferCardModel {
  id: string;
  headline: string;
  frontTitle: string;
  frontItems: CatalogItem[];
  frontPitch: string;
  backTitle: string;
  backItems: CatalogItem[];
  backPitch: string;
  contextTags: string[];
  quickPivots: PivotReason[];
  qualifiesLabel?: string;
}

export interface OfferSessionState {
  rejectedItemIds: string[];
  rejectedGroups: string[];
  acceptedItemIds: string[];
  pivotHistory: Array<{ cardId: string; reason: PivotReason }>;
}

export interface ServiceNudge {
  id: string;
  title: string;
  why: string;
  talkTrack: string;
  signalTags: string[];
}
