/**
 * Vocabulary Service — Runtime loader and server
 *
 * Loads the build-time vocabulary bundle (public/vocabulary-bundle.json),
 * caches it in localStorage, and serves refreshed phrases with variant rotation.
 *
 * Fallback chain:
 *   1. Cached vocabulary (localStorage) — fast, offline
 *   2. Bundled vocabulary-bundle.json (fetched, then cached)
 *   3. Hardcoded defaults from vocabularyConfig.ts
 */

import {
  VOCABULARY_CATEGORIES,
  VOCABULARY_VERSION,
  type VocabularyBundle,
} from './vocabularyConfig';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CACHE_KEY = 'vocabulary-cache';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let cachedBundle: VocabularyBundle | null = null;
let variantIndex: number = Math.floor(Math.random() * 3);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Load vocabulary bundle. Call once at app startup.
 * Tries localStorage first, then fetches the bundled JSON file.
 * Non-blocking — returns defaults if everything fails.
 */
export async function loadVocabulary(): Promise<void> {
  // Try localStorage cache first
  if (readCachedBundle()) return;

  // Fetch the bundled file
  try {
    const response = await fetch('/vocabulary-bundle.json');
    if (!response.ok) return;
    const data = await response.json();
    if (isValidBundle(data)) {
      cachedBundle = data;
      writeCacheToStorage(data);
    }
  } catch {
    // Offline or file not yet generated — defaults will be used
  }
}

/**
 * Get vocabulary for a given category and sub-key.
 * Returns refreshed phrases with variant rotation, or hardcoded defaults.
 */
export function getVocabulary(categoryKey: string, subKey: string): string[] | null {
  // Try cached bundle first
  if (cachedBundle?.categories[categoryKey]?.[subKey]) {
    const phrases = cachedBundle.categories[categoryKey][subKey];
    return selectVariants(phrases);
  }

  // Fall back to hardcoded defaults
  const category = VOCABULARY_CATEGORIES.find(c => c.key === categoryKey);
  if (category?.defaults[subKey]) {
    return category.defaults[subKey];
  }

  return null;
}

/**
 * Check if a vocabulary bundle is loaded (either cached or fetched).
 */
export function isVocabularyLoaded(): boolean {
  return cachedBundle !== null;
}

/**
 * Get the current variant index for this session.
 */
export function getVariantIndex(): number {
  return variantIndex;
}

/**
 * Get vocabulary bundle metadata for debugging/admin views.
 */
export function getVocabularyStatus(): { loaded: boolean; generatedAt: string | null; version: string | null } {
  return {
    loaded: cachedBundle !== null,
    generatedAt: cachedBundle?.generatedAt ?? null,
    version: cachedBundle?.version ?? null,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Select a single variant from each phrase's variants array using the session index.
 */
function selectVariants(phrases: string[][]): string[] {
  return phrases.map(variants => {
    if (!Array.isArray(variants) || variants.length === 0) return '';
    return variants[variantIndex % variants.length] || variants[0];
  }).filter(Boolean);
}

function isValidBundle(data: unknown): data is VocabularyBundle {
  if (!data || typeof data !== 'object') return false;
  const bundle = data as Record<string, unknown>;
  return (
    typeof bundle.generatedAt === 'string' &&
    typeof bundle.version === 'string' &&
    typeof bundle.categories === 'object' &&
    bundle.categories !== null
  );
}

function readCachedBundle(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    if (isValidBundle(parsed) && parsed.version === VOCABULARY_VERSION) {
      cachedBundle = parsed;
      return true;
    }
  } catch {
    // Corrupted cache — will re-fetch
  }
  return false;
}

function writeCacheToStorage(bundle: VocabularyBundle): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(bundle));
  } catch {
    // Storage full — non-critical
  }
}
