const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

/** Simple hash for cache keys */
function hashKey(parts: unknown[]): string {
  return JSON.stringify(parts);
}

/** Get a cached value if it exists and is fresh */
export function getCached<T>(keyParts: unknown[]): T | null {
  const key = hashKey(keyParts);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

/** Store a value in cache */
export function setCache(keyParts: unknown[], data: unknown): void {
  const key = hashKey(keyParts);
  cache.set(key, { data, timestamp: Date.now() });
}

/** Clear all cached data */
export function clearCache(): void {
  cache.clear();
}

// --- Session API call counter ---
let callCount = 0;
const MAX_CALLS = 50;

export function incrementCallCount(): boolean {
  callCount++;
  return callCount <= MAX_CALLS;
}

export function getCallCount(): number {
  return callCount;
}

export function getMaxCalls(): number {
  return MAX_CALLS;
}

export function resetCallCount(): void {
  callCount = 0;
}

export function isOverBudget(): boolean {
  return callCount >= MAX_CALLS;
}
