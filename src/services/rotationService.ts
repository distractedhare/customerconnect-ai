/**
 * Pitch variation rotation service.
 *
 * Implements weighted-random selection with decay so reps see fresh language
 * across calls. State is in-memory — resets on page refresh (by design).
 */

interface RotationState {
  weights: number[];
  lastIndex: number | null;
  showCount: number;
}

const store = new Map<string, RotationState>();

/**
 * Select a pitch variation using weighted-random with decay.
 *
 * @param productKey Unique key, e.g. `${demographic}-${productName}`
 * @param variations Array of 3 pitch strings
 * @returns The selected pitch string
 */
export function selectVariation(productKey: string, variations: string[]): string {
  if (variations.length === 0) return '';
  if (variations.length === 1) return variations[0];

  let state = store.get(productKey);
  if (!state) {
    state = {
      weights: variations.map(() => 1.0),
      lastIndex: null,
      showCount: 0,
    };
    store.set(productKey, state);
  }

  // Reset weights if all variations have been shown
  if (state.showCount >= variations.length) {
    state.weights = variations.map(() => 1.0);
    state.showCount = 0;
  }

  // Build candidate list — exclude last shown index (max 1 consecutive repeat)
  const candidates: number[] = [];
  let totalWeight = 0;
  for (let i = 0; i < variations.length; i++) {
    if (i === state.lastIndex && variations.length > 1) continue;
    if (state.weights[i] > 0) {
      candidates.push(i);
      totalWeight += state.weights[i];
    }
  }

  // Fallback: if all weights are 0 or no candidates, reset
  if (candidates.length === 0 || totalWeight === 0) {
    state.weights = variations.map(() => 1.0);
    state.showCount = 0;
    return selectVariation(productKey, variations);
  }

  // Weighted random selection
  let roll = Math.random() * totalWeight;
  let selectedIndex = candidates[0];
  for (const idx of candidates) {
    roll -= state.weights[idx];
    if (roll <= 0) {
      selectedIndex = idx;
      break;
    }
  }

  // Apply decay
  state.weights[selectedIndex] = Math.max(0, state.weights[selectedIndex] - 0.5);
  state.lastIndex = selectedIndex;
  state.showCount++;

  return variations[selectedIndex];
}

/**
 * Reset all rotation state. Call on "New Call" button press.
 */
export function resetRotation(): void {
  store.clear();
}
