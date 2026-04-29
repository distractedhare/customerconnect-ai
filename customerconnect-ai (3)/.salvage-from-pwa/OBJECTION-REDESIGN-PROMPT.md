# Objection Tab Redesign — Implementation Prompt for Claude Code

Copy everything below the line into Claude Code.

---

## Context

Three new files have been added to this project that redesign the Objection/Flip the Script feature. Your job is to integrate them into the existing app so they compile, render, and function correctly.

## New Files (already written — do NOT rewrite them)

1. **`src/data/objectionPlaybook.ts`** — Pre-baked objection handling playbook with 7 categories and 30 scenarios. Each scenario has an instant `quickResponse` (no API call), a `tip` for coaching, optional `steps` for multi-gate flows (like PIN reset), and `deepDiveKeys` for linking to the AI deep dive. Exports: `OBJECTION_PLAYBOOK`, `ObjectionCategory`, `ObjectionScenario`, `ObjectionStep`, `getAllScenarios`, `findScenario`, `getSuggestedCategories`.

2. **`src/data/recommendationRules.ts`** — Offline IFTTT-style recommendation engine. Contains recommendation rules, cross-sell rules, objection scripts with manager coaching, conversation talking points by age group, eligibility constraints, and comparison rules. Exports: `RECOMMENDATION_RULES`, `CROSS_SELL_RULES`, `OBJECTION_SCRIPTS`, `CONVERSATION_TALKING_POINTS`, `ELIGIBILITY_RULES`, `COMPARISON_RULES`, `evaluateRules`, `getDeepDiveScripts`, `getTalkingPointsForAge`, `getRelevantCrossSells`, and all their TypeScript interfaces.

3. **`src/components/ObjectionTab.tsx`** — Complete UI rewrite of the objection tab. Uses a progressive depth model: category accordions → tap a scenario to expand and instantly see the pre-baked quick response + coaching tip → select scenarios for deep dive → sticky "Flip the Script" button fires full analysis. Exports the same named exports as before: `default` (ObjectionTab) and `ObjectionResults`.

## What Needs To Happen

### 1. Fix the `analyzeObjectionLocal` function in `src/services/localGenerationService.ts`

The old ObjectionTab sent human-readable strings like `"Price is too high"` as objection keys. The new ObjectionTab sends scenario IDs like `"price-too-high"`, `"no-passcode"`, `"hint-mailer-disappointment"`, etc.

The `analyzeObjectionLocal` function (around line 217) does `objection.split(', ')` and then looks up each key in `OBJECTION_TEMPLATES`. These old keys won't match the new scenario IDs.

**Fix:** Add a mapping layer at the top of `analyzeObjectionLocal` that:
- Imports `findScenario` from `'../data/objectionPlaybook'`
- Imports `getDeepDiveScripts`, `OBJECTION_SCRIPTS` from `'../data/recommendationRules'`
- For each scenario ID in the split objection string, calls `findScenario(id)` to get the scenario data
- Uses the scenario's `quickResponse` as a talking point and the scenario's `tip` as part of coach's corner
- If the scenario has `deepDiveKeys`, calls `getDeepDiveScripts(deepDiveKeys)` to pull in the richer objection scripts from the recommendation rules
- Falls back to the existing `OBJECTION_TEMPLATES[key]` lookup if the scenario ID isn't found (backwards compatibility)

The function should still return the same `ObjectionAnalysis` shape — just populated from the new data sources.

### 2. Export new data modules from `src/data/index.ts`

Add these re-exports to `src/data/index.ts`:

```typescript
export * from './objectionPlaybook';
export * from './recommendationRules';
```

### 3. Verify the ObjectionTab props still match App.tsx

The `ObjectionTabProps` interface in the new `ObjectionTab.tsx` is identical to the old one:
- `context: SalesContext`
- `script: SalesScript | null`
- `selectedObjections: string[]`
- `setSelectedObjections: React.Dispatch<React.SetStateAction<string[]>>`
- `selectedGamePlanItems: string[]`
- `objectionResult: ObjectionAnalysis | null`
- `analyzing: boolean`
- `onAnalyze: () => void`
- `onClearResult: () => void`

The parent `App.tsx` should not need changes. Verify this is the case. If there are TypeScript errors from `App.tsx`, fix them.

### 4. Handle the `selectedObjections` state format change

In `App.tsx`, `selectedObjections` is a `string[]`. Previously it contained human-readable strings like `"Price is too high"`. Now it will contain scenario IDs like `"price-too-high"`.

Check everywhere `selectedObjections` is used in `App.tsx` and `localGenerationService.ts`:
- The `handleAnalyzeObjection` function passes `selectedObjections.join(', ')` to `analyzeObjectionLocal` — this is fine, the fix in step 1 handles it
- The `generateObjectionEnhancement` in `aiEnhancementService.ts` also receives `selectedObjections.join(', ')` — check if this needs updating (it sends to an AI model, so the IDs should still work as context)
- `trackObjectionAnalyzed(selectedObjections)` in `sessionTracker.ts` — this is just analytics, IDs are fine

### 5. Build and fix any TypeScript errors

Run `npm run build` (or `npx vite build`). Fix any TypeScript compilation errors. Common issues to watch for:
- Missing imports
- Type mismatches
- Unused imports from the old ObjectionTab that are still referenced elsewhere

### 6. Verify the `ICON_MAP` renders correctly

The new `ObjectionTab.tsx` has an `ICON_MAP` that maps string icon names to lucide-react components. The playbook categories use these icon strings: `KeyRound`, `Smartphone`, `ArrowRightLeft`, `WifiOff`, `CircleDollarSign`, `Wrench`, `MessageSquareWarning`. All are imported. If any icon fails to render, check the lucide-react version in `package.json` — these icons require lucide-react 0.300+.

## Architecture Notes

- **Everything is offline-first.** No API calls for quick responses. The pre-baked data in `objectionPlaybook.ts` is the primary value.
- **The AI deep dive (Flip the Script button)** still calls the existing `analyzeObjectionLocal` → optional `generateObjectionEnhancement` flow. It just needs to understand the new scenario IDs.
- **`recommendationRules.ts` is not yet wired into the Game Plan tab.** That's a future task. For now it's used by `getDeepDiveScripts` for the objection deep dive.
- **Gemma integration** is planned but not implemented. The `script` prop is passed to ObjectionTab for future use when Gemma can rephrase `quickResponse` text. For now `void script` suppresses the unused warning.
- **The `ObjectionResults` component** (the results display after analysis) is preserved from the original with no changes. It renders the same `ObjectionAnalysis` type.

## Do NOT

- Do not rewrite `objectionPlaybook.ts`, `recommendationRules.ts`, or `ObjectionTab.tsx` — they are done
- Do not change the data content (quick responses, tips, scenarios) — that's been reviewed and approved
- Do not remove the old `OBJECTION_TEMPLATES` from wherever they're defined — keep for backwards compatibility
- Do not add any API calls — this must work 100% offline
