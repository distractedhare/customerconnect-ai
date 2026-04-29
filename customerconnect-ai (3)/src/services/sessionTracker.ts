export interface SessionStats {
  plansGenerated: number;
  objectionsAnalyzed: number;
  intentsUsed: Record<string, number>;
  objectionTypesUsed: Record<string, number>;
}

const SESSION_STATS_KEY = 'cc-session-stats';

const DEFAULT_STATS: SessionStats = {
  plansGenerated: 0,
  objectionsAnalyzed: 0,
  intentsUsed: {},
  objectionTypesUsed: {},
};

function canUseSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

function readStats(): SessionStats {
  if (!canUseSessionStorage()) return DEFAULT_STATS;

  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(SESSION_STATS_KEY);
  } catch {
    return DEFAULT_STATS;
  }

  if (!raw) return DEFAULT_STATS;

  try {
    const parsed = JSON.parse(raw) as Partial<SessionStats>;
    return {
      plansGenerated: parsed.plansGenerated ?? 0,
      objectionsAnalyzed: parsed.objectionsAnalyzed ?? 0,
      intentsUsed: parsed.intentsUsed ?? {},
      objectionTypesUsed: parsed.objectionTypesUsed ?? {},
    };
  } catch {
    return DEFAULT_STATS;
  }
}

function writeStats(stats: SessionStats): void {
  if (!canUseSessionStorage()) return;
  try {
    sessionStorage.setItem(SESSION_STATS_KEY, JSON.stringify(stats));
  } catch {
    // Session tracking should never block the selling flow.
  }
}

function incrementFrequencyMap(map: Record<string, number>, key: string): Record<string, number> {
  return {
    ...map,
    [key]: (map[key] ?? 0) + 1,
  };
}

export function trackPlanGenerated(): SessionStats {
  const stats = readStats();
  const next = {
    ...stats,
    plansGenerated: stats.plansGenerated + 1,
  };
  writeStats(next);
  return next;
}

export function trackObjectionAnalyzed(objections: string[]): SessionStats {
  const stats = readStats();
  let objectionTypesUsed = stats.objectionTypesUsed;

  for (const objection of objections) {
    objectionTypesUsed = incrementFrequencyMap(objectionTypesUsed, objection);
  }

  const next = {
    ...stats,
    objectionsAnalyzed: stats.objectionsAnalyzed + 1,
    objectionTypesUsed,
  };
  writeStats(next);
  return next;
}

export function trackIntentUsed(intent: string): SessionStats {
  const stats = readStats();
  const next = {
    ...stats,
    intentsUsed: incrementFrequencyMap(stats.intentsUsed, intent),
  };
  writeStats(next);
  return next;
}

export function getSessionStats(): SessionStats {
  return readStats();
}
