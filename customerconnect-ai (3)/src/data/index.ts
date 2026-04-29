import { SalesContext, SalesScript } from '../types';
import { POSTPAID_PLANS, SPECIALIZED_PLANS } from './plans';
import { PHONES, TABLETS, WATCHES, HOTSPOTS, CONNECTED_DEVICE_INFO } from './devices';
import { HOME_INTERNET_PLANS, HOME_INTERNET_BUNDLE_DISCOUNT, OTHER_HOME_PRODUCTS } from './homeInternet';
import { COMPETITORS } from './competitors';
import { DIFFERENTIATORS } from './differentiators';
import { PROTECTION_360_TIERS, P360_VS_APPLECARE, buildAccessoryRecommendations } from './accessories';
import {
  WELCOME_MESSAGES,
  DISCOVERY_QUESTIONS,
  RAPPORT_BY_AGE,
  OBJECTION_TEMPLATES,
  PURCHASE_STEPS,
  CLOSING_TECHNIQUES,
  CPNI_REMINDERS,
  SERVICE_TO_SALES,
  BTS_IOT_VALUE_PROPS,
  ONE_LINERS,
} from './salesMethodology';
import { getVocabulary } from '../services/vocabularyService';
import { getSupportFocusOption } from '../constants/supportFocus';

// Re-export everything for convenience
export * from './plans';
export * from './devices';
export * from './homeInternet';
export * from './competitors';
export * from './differentiators';
export * from './accessories';
export * from './salesMethodology';
export * from './objectionPlaybook';
export * from './recommendationRules';

/**
 * Assemble a complete script instantly from templates — no API call needed.
 * This is the "instant" part of the hybrid flow.
 */
export function getTemplateScript(context: SalesContext): Partial<SalesScript> {
  const isSupport = ['order support', 'tech support', 'account support'].includes(context.purchaseIntent);
  const welcomeMessages = getVocabulary('welcome', context.purchaseIntent)
    || WELCOME_MESSAGES[context.purchaseIntent]
    || WELCOME_MESSAGES['exploring'];

  // Collect discovery questions for all selected products
  const discoveryQuestions: string[] = [];

  // For support calls, ALSO inject BTS/IOT discovery questions — those are the pivots
  if (isSupport) {
    const btsQs = getVocabulary('discovery', 'BTS') || DISCOVERY_QUESTIONS['BTS'];
    const iotQs = getVocabulary('discovery', 'IOT') || DISCOVERY_QUESTIONS['IOT'];
    if (btsQs) discoveryQuestions.push(...btsQs.slice(0, 3));
    if (iotQs) discoveryQuestions.push(...iotQs.slice(0, 2));
  }

  for (const product of context.product) {
    const qs = getVocabulary('discovery', product) || DISCOVERY_QUESTIONS[product];
    if (qs) discoveryQuestions.push(...qs);
  }
  const uniqueDiscovery = [...new Set(discoveryQuestions)].slice(0, 8);

  // Value propositions — support calls get BTS/IOT-heavy props
  const valuePropositions = buildValueProps(context);

  // Objection handling from templates
  const objectionHandling = buildObjectionHandling();

  // Purchase steps for the primary product
  const primaryProduct = context.product[0] || 'No Specific Product';
  const purchaseSteps = PURCHASE_STEPS[primaryProduct] || PURCHASE_STEPS['No Specific Product'];

  // One-liners
  const oneLiners = getVocabulary('oneLiners', context.purchaseIntent)
    || ONE_LINERS[context.purchaseIntent]
    || ONE_LINERS['exploring'];

  // Coach's corner — support calls get service-to-sales tips
  const rapportTips = RAPPORT_BY_AGE[context.age] || RAPPORT_BY_AGE['Not Specified'];
  let coachsCorner = `Tone: ${rapportTips.tone} Good topics: ${rapportTips.topics.slice(0, 3).join(', ')}. Avoid: ${rapportTips.avoid[0]}.`;

  if (isSupport) {
    const pivot = SERVICE_TO_SALES[context.purchaseIntent];
    if (pivot) {
      coachsCorner = `SERVICE-TO-SALES: ${pivot.timing} ${BTS_IOT_VALUE_PROPS.commissionTip}`;
    }
  }

  return {
    welcomeMessages,
    discoveryQuestions: uniqueDiscovery,
    valuePropositions,
    objectionHandling,
    accessoryRecommendations: buildAccessoryRecommendations(context),
    purchaseSteps,
    oneLiners,
    coachsCorner,
    smallTalk: [], // AI will fill this
    nearbyStores: [], // AI will fill this
    groundingSources: [],
  };
}

function buildValueProps(context: SalesContext): string[] {
  const props: string[] = [];
  const carrier = context.currentCarrier;
  const isSupport = ['order support', 'tech support', 'account support'].includes(context.purchaseIntent);

  // For SUPPORT calls: lead with BTS/IOT add-on opportunities — that's the commission play
  if (isSupport) {
    props.push(`🎯 WATCH DEAL: Galaxy Watch8 is FREE with new wearable line ($5/mo on Experience Beyond/Better Value; $10–$15/mo on other plans). Leave your phone behind and still get calls, texts, payments.`);
    props.push(`🎯 TABLET DEAL: iPad up to $400 off with new tablet line ($5/mo on Experience Beyond/Better Value; $20/mo on other plans). Galaxy Tab A11+ FREE with S26 purchase.`);
    props.push(`🎯 TRACKER: SyncUP Tracker — real GPS on T-Mobile's network, not Bluetooth like AirTag. Great for kids, pets, cars, luggage.`);
    props.push(`🎯 PROTECTION: P360 covers drops, theft, screen at $0 — includes AppleCare Services + JUMP! upgrades. Better than AppleCare+ alone.`);
    props.push(`🎯 HOME INTERNET: Check availability first, then verify current bundle pricing, no annual contract, and any Month On Us or rebate eligibility.`);
    // Also add any product-specific props below
  }

  // Plan-specific value props
  if (context.product.includes('Phone') || context.product.includes('No Specific Product')) {
    const beyond = POSTPAID_PLANS.find(p => p.name === 'Experience Beyond');
    if (beyond) {
      props.push(`Experience Beyond: Premium data, hotspot, yearly upgrade eligibility, T-Satellite, and premium entertainment value. Verify current entertainment terms before quoting.`);
      props.push(`5-Year Price Guarantee — lead with predictable monthly cost, then compare the customer's real bill instead of guessing competitor changes.`);
    }

    // Carrier-specific props
    if (carrier && carrier !== 'Not Specified' && carrier !== 'Other') {
      const comp = COMPETITORS[carrier];
      if (comp && comp.vulnerabilities.length > 0) {
        props.push(comp.vulnerabilities[0]);
        if (comp.vulnerabilities.length > 1) {
          props.push(comp.vulnerabilities[1]);
        }
      }
    }

    // International roaming
    props.push('International roaming in 215+ countries is a strong travel hook. Verify destination, plan, and usage needs before quoting savings.');

    // Streaming
    props.push('Entertainment perks can change the monthly math. Verify the exact Netflix, Hulu, and Apple TV terms for the selected plan before using them as savings.');
  }

  if (context.product.includes('Home Internet')) {
    props.push(`T-Mobile Home Internet: verify address, plan tier, current bundle price, no annual contract, and 5-Year Price Guarantee eligibility.`);
    props.push(`All-In tier: position it as the premium setup path, then verify current included equipment, entertainment, and rebate terms before quoting value.`);
    props.push('15-day test drive — full refund if not satisfied. Risk-free trial.');
  }

  if (context.product.includes('BTS')) {
    props.push(`Connected device lines: just $5/mo on Experience Beyond or Better Value for tablets, watches, laptops ($10–$20/mo on other plans).`);
    props.push(`Galaxy Watch8: FREE via 36 monthly bill credits with new wearable line. Apple Watch SE 3: $200 off with new line.`);
    props.push(`iPad (A16): up to $400 off with new tablet line. Galaxy Tab A11+: FREE with S26 purchase + tablet line.`);
    props.push(`Kids safety: Galaxy Watch for Kids or Apple Watch SE — they can call/text without needing a phone.`);
  }

  if (context.product.includes('IOT')) {
    props.push('SyncUP Tracker: real-time GPS on T-Mobile network — works EVERYWHERE, not just near other phones like AirTag/Tile.');
    props.push('SyncUP DRIVE: plugs into car OBD port — GPS tracking, trip history, vehicle health, speed alerts for teen drivers.');
    props.push('TCL LINKPORT: 5G USB-C hotspot under $50, $5/mo data plan. Perfect for remote workers and students.');
    props.push('T-Satellite with Starlink: coverage in areas with zero cell towers — 500,000+ sq miles of coverage.');
  }

  return isSupport ? props.slice(0, 8) : props.slice(0, 6); // Support calls get more options
}

function buildObjectionHandling(): { concern: string; reassurance: string }[] {
  // Return top 3 most common objections
  const topObjections = ['Price is too high', 'Happy with current provider', 'Worried about coverage'];
  return topObjections.map(key => {
    const template = OBJECTION_TEMPLATES[key];
    return {
      concern: key,
      reassurance: template ? template.rebuttal : '',
    };
  });
}

/**
 * Build a prompt context string with relevant product data for the AI to personalize.
 * This is the "injected context" part of the hybrid flow.
 * Only includes data relevant to the specific customer scenario.
 */
export function buildPromptContext(context: SalesContext): string {
  const sections: string[] = [];

  // Relevant plans
  sections.push('=== T-MOBILE PLANS (April 2026) ===');
  sections.push('CRITICAL: Experience plans do NOT include taxes/fees in price (changed from Magenta era). Without AutoPay, add $5/line.');
  for (const plan of POSTPAID_PLANS.slice(0, 3)) { // Top 3 plans
    const priceStr = plan.pricing.map(p => `${p.lines}L: $${p.monthlyTotal}`).join(', ');
    sections.push(`${plan.name}: ${priceStr}. Key: ${plan.features.slice(0, 3).join('; ')}`);
  }

  // Family-specific
  if (context.age === '35-54' || context.product.length > 1) {
    sections.push(`Better Value: public terms show 3 lines from $140+/mo with AutoPay; requires 3+ lines and eligible port-ins for new customers. Verify exact account eligibility before quoting.`);
  }

  // 55+ plans
  if (context.age === '55+') {
    sections.push(`55+ Plans: ${SPECIALIZED_PLANS.senior.description}`);
  }

  // Competitor intel
  if (context.currentCarrier && context.currentCarrier !== 'Not Specified' && context.currentCarrier !== 'Other') {
    const comp = COMPETITORS[context.currentCarrier];
    if (comp) {
      sections.push(`\n=== ${comp.name.toUpperCase()} INTEL ===`);
      sections.push(`Vulnerabilities: ${comp.vulnerabilities.slice(0, 3).join(' | ')}`);
      if (comp.counterPoints.length > 0) {
        sections.push(`Where they counter: ${comp.counterPoints[0]}`);
      }
    }
  }

  // Device promos
  if (context.product.includes('Phone')) {
    sections.push('\n=== DEVICE PROMOS ===');
    // Device specs only — promos come from weekly-update.json
    const topDevices = PHONES.filter(d => typeof d.startingPrice === 'number').slice(0, 4);
    for (const d of topDevices) {
      sections.push(`${d.name} ($${d.startingPrice}): ${d.keySpecs}`);
    }
  }

  // Home Internet
  if (context.product.includes('Home Internet')) {
    sections.push('\n=== HOME INTERNET ===');
    for (const plan of HOME_INTERNET_PLANS) {
      sections.push(`${plan.name}: $${plan.standalonePrice} standalone / $${plan.withVoiceLine} with voice line. ${plan.typicalDownload} down.`);
    }
    sections.push(HOME_INTERNET_BUNDLE_DISCOUNT);
    sections.push(`Test drive: ${OTHER_HOME_PRODUCTS.testDrive.description}`);
  }

  // BTS/IOT — always include for support calls (service-to-sales pivot)
  const isSupport = ['order support', 'tech support', 'account support'].includes(context.purchaseIntent);
  if (context.product.includes('BTS') || context.product.includes('IOT') || isSupport) {
    sections.push(`\n=== CONNECTED DEVICES & IOT (ADD-ON OPPORTUNITIES) ===`);
    sections.push(`Connected device lines: Wearable $${CONNECTED_DEVICE_INFO.plans.wearableLine.price}/mo, Tablet $${CONNECTED_DEVICE_INFO.plans.tabletLine.price}/mo, Tracker $${CONNECTED_DEVICE_INFO.plans.syncUpTracker.price}/mo. ${CONNECTED_DEVICE_INFO.installmentTerms}. $${CONNECTED_DEVICE_INFO.deviceConnectionCharge} connection charge.`);
    sections.push(`WATCHES: Galaxy Watch8 FREE with wearable line. Apple Watch SE 3 $200 off. Apple Watch Series 11 BOGO $300 off.`);
    sections.push(`TABLETS: iPad (A16) up to $400 off. Galaxy Tab A11+ FREE with S26 + tablet line. Galaxy Tab S10 FE $275-300 off.`);
    sections.push(`TRACKERS: SyncUP Tracker = real GPS on cellular (not Bluetooth). SyncUP DRIVE = car GPS + diagnostics + speed alerts.`);
    sections.push(`HOTSPOT: TCL LINKPORT under $50 — USB-C 5G hotspot, $5/mo data plan.`);
  }

  // Service-to-sales coaching for support intents
  if (isSupport) {
    const pivot = SERVICE_TO_SALES[context.purchaseIntent];
    if (pivot) {
      sections.push(`\n=== SERVICE-TO-SALES STRATEGY ===`);
      sections.push(`TIMING: ${pivot.timing}`);
      sections.push(`COMMISSION TIP: ${BTS_IOT_VALUE_PROPS.commissionTip}`);
      sections.push(`PIVOT SCRIPTS: ${pivot.pivots.slice(0, 2).join(' | ')}`);
    }

    const supportFocus = getSupportFocusOption(context.supportFocus);
    if (supportFocus) {
      sections.push(`\n=== SUPPORT FOCUS ===`);
      sections.push(`${supportFocus.label}: ${supportFocus.hint}`);
      sections.push(`FIRST MOVE: ${supportFocus.planCue.step}`);
      sections.push(`COACHING: ${supportFocus.planCue.coach}`);
    }
  }

  // Key differentiators
  sections.push('\n=== KEY DIFFERENTIATORS ===');
  sections.push('Network: 309 Mbps median 5G (2x AT&T), #1 JD Power in 5/6 regions, 1.9M sq miles 5G coverage');
  sections.push('T-Satellite: Starlink coverage in areas with zero cell towers. FREE on Experience Beyond');
  sections.push('5-Year Price Guarantee (AT&T: none, Verizon: 3 years)');
  sections.push('International: Free in 215+ countries. $672 savings vs AT&T/Verizon for family of 4');
  sections.push('Streaming: ~$30/mo included. AT&T: $0 perks. Verizon: $10/perk add-on');

  // Protection
  sections.push(`\n=== PROTECTION 360 === ${P360_VS_APPLECARE.slice(0, 200)}`);

  // CPNI
  sections.push('\n=== COMPLIANCE === CPNI compliant. No PII. Un-carrier voice. All prices before taxes/fees.');

  // Rapport
  const rapport = RAPPORT_BY_AGE[context.age] || RAPPORT_BY_AGE['Not Specified'];
  sections.push(`\n=== RAPPORT (${context.age}) === Tone: ${rapport.tone}. Topics: ${rapport.topics.slice(0, 3).join(', ')}.`);

  return sections.join('\n');
}
