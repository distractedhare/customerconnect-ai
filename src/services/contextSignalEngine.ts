/**
 * Context Signal Engine
 *
 * Derives ranked CustomerSignal[] from a SalesContext (and optional ecosystem matrix).
 * Signals are ranking inputs — they are NOT customer-facing labels or demographic
 * stereotypes. They influence item scoring and talk-track selection quietly.
 */

import { SalesContext, CustomerSignal, CustomerSignalTag } from '../types';

/** Derive ranked signals from a SalesContext */
export function deriveCustomerSignals(
  context: SalesContext,
  _ecosystemMatrix?: unknown // reserved for future enhancement
): CustomerSignal[] {
  const raw: CustomerSignal[] = [];

  // ── Age signals ──
  switch (context.age) {
    case '55+':
      raw.push({ tag: 'older-adult', strength: 0.9, source: 'age' });
      raw.push({ tag: 'simplicity-first', strength: 0.75, source: 'age' });
      raw.push({ tag: 'family-coordination', strength: 0.4, source: 'age' });
      break;
    case '35-54':
      raw.push({ tag: 'parent', strength: 0.6, source: 'age' });
      raw.push({ tag: 'family-coordination', strength: 0.55, source: 'age' });
      raw.push({ tag: 'commuter', strength: 0.45, source: 'age' });
      break;
    case '25-34':
      raw.push({ tag: 'commuter', strength: 0.55, source: 'age' });
      raw.push({ tag: 'premium-leaning', strength: 0.45, source: 'age' });
      raw.push({ tag: 'battery-anxiety', strength: 0.4, source: 'age' });
      break;
    case '18-24':
      raw.push({ tag: 'gym', strength: 0.5, source: 'age' });
      raw.push({ tag: 'battery-anxiety', strength: 0.45, source: 'age' });
      raw.push({ tag: 'privacy-minded', strength: 0.4, source: 'age' });
      break;
  }

  // ── Family / lines signals ──
  if (context.totalLines != null && context.totalLines >= 3) {
    raw.push({ tag: 'family-coordination', strength: 0.7, source: 'lines' });
    raw.push({ tag: 'parent', strength: 0.5, source: 'lines' });
  }
  if (context.familyCount != null && context.familyCount >= 3) {
    raw.push({ tag: 'parent', strength: 0.8, source: 'familyCount' });
    raw.push({ tag: 'family-coordination', strength: 0.7, source: 'familyCount' });
  }

  // ── Region signals ──
  const stormRegions = new Set([
    'Deep South', 'Mid-South', 'Great Plains',
    'Texas & Oklahoma', 'Southeast', 'South Atlantic',
  ]);
  const outdoorRegions = new Set(['Rocky Mountains', 'Pacific Northwest', 'Alaska']);
  const urbanRegions = new Set(['New England', 'Mid-Atlantic', 'California', 'Great Lakes']);
  const travelRegions = new Set(['Hawaii', 'Alaska']);

  if (context.region) {
    if (stormRegions.has(context.region)) {
      raw.push({ tag: 'storm-ready', strength: 0.65, source: 'region' });
    }
    if (outdoorRegions.has(context.region)) {
      raw.push({ tag: 'outdoorsy', strength: 0.6, source: 'region' });
      raw.push({ tag: 'storm-ready', strength: 0.4, source: 'region' });
    }
    if (urbanRegions.has(context.region)) {
      raw.push({ tag: 'commuter', strength: 0.55, source: 'region' });
      raw.push({ tag: 'privacy-minded', strength: 0.45, source: 'region' });
    }
    if (travelRegions.has(context.region)) {
      raw.push({ tag: 'travel', strength: 0.7, source: 'region' });
    }
  }

  // ── Carrier signals ──
  if (context.currentCarrier === 'Prepaid (Mint, Boost, etc.)') {
    raw.push({ tag: 'budget-sensitive', strength: 0.75, source: 'carrier' });
  }

  // ── Platform + product signals ──
  if (context.desiredPlatform === 'iOS' && (context.age === '25-34' || context.age === '35-54')) {
    raw.push({ tag: 'premium-leaning', strength: 0.4, source: 'platform' });
  }

  // IOT products signal family/parent context
  if (context.product.includes('IOT')) {
    raw.push({ tag: 'family-coordination', strength: 0.6, source: 'product' });
    raw.push({ tag: 'parent', strength: 0.5, source: 'product' });
  }

  // Support intents with device issues → infer battery anxiety
  if (context.purchaseIntent === 'tech support') {
    raw.push({ tag: 'battery-anxiety', strength: 0.4, source: 'intent' });
  }

  switch (context.supportFocus) {
    case 'tech_device_issue':
      raw.push({ tag: 'battery-anxiety', strength: 0.65, source: 'supportFocus' });
      raw.push({ tag: 'simplicity-first', strength: 0.5, source: 'supportFocus' });
      break;
    case 'tech_signal_issue':
    case 'tech_internet_issue':
      raw.push({ tag: 'storm-ready', strength: 0.55, source: 'supportFocus' });
      break;
    case 'account_billing':
      raw.push({ tag: 'budget-sensitive', strength: 0.7, source: 'supportFocus' });
      break;
    case 'account_line_change':
      raw.push({ tag: 'family-coordination', strength: 0.65, source: 'supportFocus' });
      break;
    case 'order_missing_item':
    case 'order_activation_issue':
      raw.push({ tag: 'simplicity-first', strength: 0.55, source: 'supportFocus' });
      break;
  }

  // ── Deduplicate: keep highest strength per tag ──
  const best = new Map<CustomerSignalTag, CustomerSignal>();
  for (const s of raw) {
    const existing = best.get(s.tag);
    if (!existing || s.strength > existing.strength) {
      best.set(s.tag, s);
    }
  }

  return Array.from(best.values()).sort((a, b) => b.strength - a.strength);
}

/** Return 1–3 glanceable chip labels for the UI (e.g. "Commuter", "Parent") */
export function getDisplayChips(signals: CustomerSignal[]): string[] {
  const chipMap: Partial<Record<CustomerSignalTag, string>> = {
    'outdoorsy': 'Outdoorsy',
    'commuter': 'Commuter',
    'parent': 'Parent',
    'privacy-minded': 'Privacy',
    'storm-ready': 'Storm-ready',
    'family-coordination': 'Family',
    'gym': 'Active',
    'travel': 'Traveler',
    'older-adult': 'Simple Setup',
    'battery-anxiety': 'Battery',
    'premium-leaning': 'Premium',
    'budget-sensitive': 'Value',
    'kids-safe': 'Kids Safety',
  };

  return signals
    .filter(s => s.strength >= 0.45 && chipMap[s.tag])
    .slice(0, 3)
    .map(s => chipMap[s.tag]!);
}
