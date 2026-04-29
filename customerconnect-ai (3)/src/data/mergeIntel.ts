import { COMPETITORS, type Competitor } from './competitors';
import type { IntelUpdate, CarrierKey, RegionKey, CarrierUpdate } from './competitiveIntel.types';

/**
 * Carrier key mapping: SalesContext.currentCarrier → individual CarrierKeys
 * Handles the "Prepaid (Mint, Boost, etc.)" bucket in the UI
 */
const PREPAID_CARRIERS: CarrierKey[] = ['Mint', 'Boost', 'Metro', 'Cricket', 'Visible', 'US Mobile', 'Consumer Cellular', 'Straight Talk', 'Google Fi'];

export function resolveCarrierKeys(currentCarrier: string): CarrierKey[] {
  if (currentCarrier === 'Prepaid (Mint, Boost, etc.)') return PREPAID_CARRIERS;
  if (currentCarrier === 'Other' || currentCarrier === 'Not Specified') return [];
  return [currentCarrier as CarrierKey];
}

/**
 * Merges intel updates into baseline competitor data.
 * Returns a NEW object — never mutates the baseline.
 */
export function mergeCompetitorWithIntel(
  baseline: Competitor,
  update: CarrierUpdate
): Competitor & { recentChanges: CarrierUpdate['changes']; freshPromos: CarrierUpdate['activePromos'] } {
  // Start with a deep copy of baseline
  const merged = JSON.parse(JSON.stringify(baseline)) as Competitor;

  // Apply vulnerability diffs
  if (update.vulnerabilityUpdates) {
    const vu = update.vulnerabilityUpdates;

    // Remove vulnerabilities that are no longer valid
    if (vu.remove?.length) {
      merged.vulnerabilities = merged.vulnerabilities.filter(
        v => !vu.remove!.some(r => v.toLowerCase().includes(r.toLowerCase()))
      );
    }

    // Update existing vulnerabilities
    if (vu.update?.length) {
      for (const u of vu.update) {
        const idx = merged.vulnerabilities.findIndex(
          v => v.toLowerCase().includes(u.original.toLowerCase())
        );
        if (idx !== -1) {
          merged.vulnerabilities[idx] = u.replacement;
        } else {
          // If we can't find the original, add the replacement as new
          merged.vulnerabilities.push(u.replacement);
        }
      }
    }

    // Add new vulnerabilities
    if (vu.add?.length) {
      merged.vulnerabilities.push(...vu.add);
    }
  }

  // Apply strength diffs (counterPoints in the Competitor interface)
  if (update.strengthUpdates) {
    const su = update.strengthUpdates;
    if (su.remove?.length) {
      merged.counterPoints = merged.counterPoints.filter(
        c => !su.remove!.some(r => c.toLowerCase().includes(r.toLowerCase()))
      );
    }
    if (su.add?.length) {
      merged.counterPoints.push(...su.add);
    }
  }

  // Apply plan updates
  if (update.planUpdates?.length) {
    for (const pu of update.planUpdates) {
      if (pu.action === 'removed') {
        merged.plans = merged.plans.filter(
          p => p.name.toLowerCase() !== pu.planName.toLowerCase()
        );
      } else if (pu.action === 'added') {
        // Only add if not already present (dedup by name)
        if (!merged.plans.some(p => p.name.toLowerCase() === pu.planName.toLowerCase())) {
          merged.plans.push({
            name: pu.planName,
            singleLine: pu.newValue ?? 'See details',
            priorityData: '',
            hotspot: '',
            streamingPerks: '',
            notes: pu.details,
          });
        }
      } else if (pu.action === 'changed') {
        const existing = merged.plans.find(
          p => p.name.toLowerCase() === pu.planName.toLowerCase()
        );
        if (existing) {
          // Update the singleLine price if a new value is provided
          if (pu.newValue) {
            existing.singleLine = pu.newValue;
          }
          existing.notes = `${pu.details} (updated from ${pu.source})`;
        }
      }
    }
  }

  // Attach fresh data (don't merge into baseline structure — keep separate)
  return {
    ...merged,
    recentChanges: update.changes ?? [],
    freshPromos: update.activePromos?.filter(p => p.status !== 'ended') ?? [],
  };
}

/**
 * Loads multiple update files and deduplicates by ID.
 * Later files win (newest update takes priority).
 */
export function deduplicateUpdates(updates: IntelUpdate[]): IntelUpdate {
  if (updates.length === 0) {
    return {
      metadata: {
        generatedDate: '',
        coversFrom: '',
        coversTo: '',
        sourcesSearched: [],
        confidence: 'low',
        previousUpdateDate: 'first_run',
      },
    };
  }

  // Sort by date ascending (oldest first, newest overwrites)
  const sorted = [...updates].sort(
    (a, b) => a.metadata.generatedDate.localeCompare(b.metadata.generatedDate)
  );

  const seenIds = new Set<string>();
  const merged: IntelUpdate = {
    metadata: sorted[sorted.length - 1].metadata,
    tmobileCampaigns: { new: [], ended: [], changed: [] },
    competitorUpdates: {},
    regionalIntel: {},
    weeklyHighlights: sorted[sorted.length - 1].weeklyHighlights,
  };

  // Process newest-first so we keep the latest version of each ID
  for (const update of [...sorted].reverse()) {
    // Merge T-Mobile campaigns (dedup by id)
    for (const campaign of update.tmobileCampaigns?.new ?? []) {
      if (!seenIds.has(campaign.id)) {
        seenIds.add(campaign.id);
        merged.tmobileCampaigns!.new!.push(campaign);
      }
    }
    // ended and changed don't have IDs — dedup by name
    for (const ended of update.tmobileCampaigns?.ended ?? []) {
      const dedupKey = `ended-${ended.name.toLowerCase()}`;
      if (!seenIds.has(dedupKey)) {
        seenIds.add(dedupKey);
        merged.tmobileCampaigns!.ended!.push(ended);
      }
    }
    for (const changed of update.tmobileCampaigns?.changed ?? []) {
      const dedupKey = `changed-${changed.name.toLowerCase()}`;
      if (!seenIds.has(dedupKey)) {
        seenIds.add(dedupKey);
        merged.tmobileCampaigns!.changed!.push(changed);
      }
    }

    // Merge competitor updates (dedup changes by id, accumulate diffs)
    for (const [carrier, carrierUpdate] of Object.entries(update.competitorUpdates ?? {})) {
      const key = carrier as CarrierKey;
      if (!merged.competitorUpdates![key]) {
        merged.competitorUpdates![key] = { changes: [], planUpdates: [], activePromos: [] };
      }
      const target = merged.competitorUpdates![key]!;

      for (const change of carrierUpdate!.changes ?? []) {
        if (!seenIds.has(change.id)) {
          seenIds.add(change.id);
          target.changes.push(change);
        }
      }
      // Plan updates: dedup by planName + action
      for (const pu of carrierUpdate!.planUpdates ?? []) {
        const puKey = `${key}-plan-${pu.planName.toLowerCase()}-${pu.action}`;
        if (!seenIds.has(puKey)) {
          seenIds.add(puKey);
          if (!target.planUpdates) target.planUpdates = [];
          target.planUpdates.push(pu);
        }
      }
      // Promo updates: dedup by id
      for (const promo of carrierUpdate!.activePromos ?? []) {
        if (!seenIds.has(promo.id)) {
          seenIds.add(promo.id);
          if (!target.activePromos) target.activePromos = [];
          target.activePromos.push(promo);
        }
      }
      // Vulnerability/strength diffs: accumulate (these are already diffs)
      if (carrierUpdate!.vulnerabilityUpdates) {
        if (!target.vulnerabilityUpdates) target.vulnerabilityUpdates = {};
        const tv = target.vulnerabilityUpdates;
        const cv = carrierUpdate!.vulnerabilityUpdates;
        tv.add = [...(tv.add ?? []), ...(cv.add ?? [])];
        tv.remove = [...(tv.remove ?? []), ...(cv.remove ?? [])];
        tv.update = [...(tv.update ?? []), ...(cv.update ?? [])];
      }
      if (carrierUpdate!.strengthUpdates) {
        if (!target.strengthUpdates) target.strengthUpdates = {};
        const ts = target.strengthUpdates;
        const cs = carrierUpdate!.strengthUpdates;
        ts.add = [...(ts.add ?? []), ...(cs.add ?? [])];
        ts.remove = [...(ts.remove ?? []), ...(cs.remove ?? [])];
      }
    }

    // Merge regional intel (dedup alerts by id)
    for (const [region, regionUpdate] of Object.entries(update.regionalIntel ?? {})) {
      const key = region as RegionKey;
      if (!merged.regionalIntel![key]) {
        merged.regionalIntel![key] = { alerts: [] };
      }
      for (const alert of regionUpdate!.alerts ?? []) {
        if (!seenIds.has(alert.id)) {
          seenIds.add(alert.id);
          merged.regionalIntel![key]!.alerts.push(alert);
        }
      }
      // Merge cable MVNO changes (latest wins)
      if (regionUpdate!.cableMvnoChanges) {
        if (!merged.regionalIntel![key]!.cableMvnoChanges) {
          merged.regionalIntel![key]!.cableMvnoChanges = {};
        }
        Object.assign(merged.regionalIntel![key]!.cableMvnoChanges!, regionUpdate!.cableMvnoChanges);
      }
    }
  }

  return merged;
}
