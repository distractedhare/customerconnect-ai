import { ObjectionAnalysis, SalesContext, SalesScript } from '../types';
import { buildAccessoryRecommendations } from '../data/accessories';
import { canKipQuoteAccessoryBundleEligibility } from '../data/knowledge';
import { applyLiveGateToRecommendations, buildLiveRecommendationGate } from './liveRecommendationGate';
import { isAbortError, withTimeoutSignal } from './networkUtils';
import { WeeklyUpdate } from './weeklyUpdateSchema';

export type GemmaLoadingState = 'idle' | 'loading' | 'ready' | 'error' | 'unsupported';

type StatusListener = () => void;
type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

const listeners = new Set<StatusListener>();

let loadingState: GemmaLoadingState = 'idle';
let loadError: string | null = null;
let lastHealthCheckAt = 0;
let cooldownUntil = 0;
const HEALTH_CHECK_INTERVAL_MS = 60_000;
const AUTH_COOLDOWN_MS = 5 * 60 * 1000;
const TRANSIENT_COOLDOWN_MS = 30_000;
const HEALTH_CHECK_TIMEOUT_MS = 8_000;
const REQUEST_TIMEOUT_MS = 20_000;

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore listener errors
    }
  });
}

function setState(state: GemmaLoadingState, error: string | null = null) {
  loadingState = state;
  loadError = error;
  notifyListeners();
}

function isCoolingDown(): boolean {
  return cooldownUntil > Date.now();
}

function startCooldown(ms: number): void {
  cooldownUntil = Date.now() + ms;
}

function setUnavailable(status?: number): void {
  if (status === 401 || status === 403) {
    startCooldown(AUTH_COOLDOWN_MS);
  } else if (status) {
    startCooldown(TRANSIENT_COOLDOWN_MS);
  }

  setState('idle');
}

export function onGemmaStatusChange(fn: StatusListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getGemmaLoadingState(): { state: GemmaLoadingState; error: string | null } {
  return { state: loadingState, error: loadError };
}

export function isGemmaAvailable(): boolean {
  return loadingState === 'ready';
}

export function isWebGPUSupported(): boolean {
  return true;
}

export function getGemmaStatusLabel(): string {
  return loadingState === 'ready' ? 'Gemma' : 'AI Ready';
}

export async function initializeGemma(force = false): Promise<void> {
  const now = Date.now();
  if (!force && isCoolingDown()) return;
  if (!force && now - lastHealthCheckAt < HEALTH_CHECK_INTERVAL_MS && loadingState !== 'idle') return;

  lastHealthCheckAt = now;
  setState('loading');

  const { signal, cleanup } = withTimeoutSignal({ timeoutMs: HEALTH_CHECK_TIMEOUT_MS });

  try {
    const response = await fetch('/api/ai', {
      method: 'GET',
      cache: 'no-store',
      signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (response.ok && payload?.ok === true) {
      setState('ready');
      return;
    }

    // Keep this quiet for reps. The app can still run on local intelligence.
    setUnavailable(response.status);
  } catch {
    setUnavailable();
  } finally {
    cleanup();
  }
}

function buildWeeklySummary(weeklyData: WeeklyUpdate | null): string {
  if (!weeklyData) return 'No weekly update loaded.';

  const promos = weeklyData.currentPromos.slice(0, 4).map((promo) => `- ${promo.name}: ${promo.details}`).join('\n');
  const intel = weeklyData.competitiveIntel.slice(0, 4).map((item) => `- ${item.carrier}: ${item.talkingPoint}`).join('\n');

  return [
    `Weekly focus: ${weeklyData.weeklyFocus.headline}`,
    weeklyData.weeklyFocus.context,
    promos ? `Promos:\n${promos}` : '',
    intel ? `Intel:\n${intel}` : '',
  ].filter(Boolean).join('\n\n');
}

function buildScriptMessages(context: SalesContext, weeklyData: WeeklyUpdate | null): ChatMessage[] {
  const products = context.product.join(', ');
  const carrier = context.currentCarrier || 'Unknown';
  const lockedAccessories = buildAccessoryRecommendations(context).slice(0, 6);
  const accessoryContext = lockedAccessories
    .map((item) => [
      `- ${item.itemId || item.name}: ${item.name}`,
      `price=${item.priceRange || 'verify'}`,
      `eligibilityStatus=${item.eligibilityStatus || 'not-applicable'}`,
      `bundleEligible=${item.bundleEligible ? 'true' : 'false'}`,
      item.sourceUrl ? `source=${item.sourceUrl}` : 'source=local-catalog',
      item.proofText ? `proof=${item.proofText}` : '',
    ].filter(Boolean).join(' | '))
    .join('\n');

  return [
    {
      role: 'system',
      content: 'You are a T-Mobile virtual retail sales coach. Return valid JSON only with no markdown or extra narration.',
    },
    {
      role: 'user',
      content: `Generate a personalized sales game plan.

Customer context:
- Age group: ${context.age}
- Region: ${context.region}${context.state ? ` (${context.state})` : ''}
- Products: ${products}
- Purchase intent: ${context.purchaseIntent}
- Current carrier: ${carrier}
- Total lines: ${context.totalLines || 'Unknown'}
- Family count: ${context.familyCount || 'Unknown'}
- Current platform: ${context.currentPlatform || 'Unknown'}
- Desired platform: ${context.desiredPlatform || 'Unknown'}
- HINT Availability: ${context.hintAvailable === false ? 'UNAVAILABLE (Spots full)' : context.hintAvailable === true ? 'Available' : 'Not checked yet'}

Weekly context:
${buildWeeklySummary(weeklyData)}

Locked local accessory recommendations:
${accessoryContext || '- No local accessory recommendations for this context.'}

Accessory accuracy rules:
- Prefer the locked local accessory recommendations above.
- Only set bundleEligible true when eligibilityStatus is quote-safe.
- If eligibilityStatus is review-required, the item can be recommended but the rep must verify bundle eligibility before quoting it.
- Never count audio, Protection 360, watches/devices, trackers, or service plans toward the accessory bundle.

Return JSON matching exactly:
{
  "welcomeMessages": ["string"],
  "smallTalk": [{"category": "string", "text": "string"}],
  "discoveryQuestions": ["string"],
  "oneLiners": ["string"],
  "valuePropositions": ["string"],
  "objectionHandling": [{"concern": "string", "reassurance": "string"}],
  "accessoryRecommendations": [{"itemId": "string", "name": "string", "why": "string", "priceRange": "string", "brands": ["string"], "bundleEligible": false, "eligibilityStatus": "review-required", "sourceUrl": "string", "proofText": "string"}],
  "purchaseSteps": ["string"],
  "coachsCorner": "string"
}`,
    },
  ];
}

function buildObjectionMessages(
  objection: string,
  context: SalesContext,
  selectedItems: string[],
  weeklyData: WeeklyUpdate | null,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: 'You are a T-Mobile virtual retail sales coach. Return valid JSON only with no markdown or extra narration.',
    },
    {
      role: 'user',
      content: `Help a rep respond to this objection.

Customer context:
- Age group: ${context.age}
- Region: ${context.region}
- Products: ${context.product.join(', ')}
- Purchase intent: ${context.purchaseIntent}
- Current carrier: ${context.currentCarrier || 'Unknown'}
- Total lines: ${context.totalLines || 'Unknown'}
- Family count: ${context.familyCount || 'Unknown'}
- Current platform: ${context.currentPlatform || 'Unknown'}
- Desired platform: ${context.desiredPlatform || 'Unknown'}
- HINT Availability: ${context.hintAvailable === false ? 'UNAVAILABLE (Spots full)' : context.hintAvailable === true ? 'Available' : 'Not checked yet'}

Objection: ${objection}
Already used: ${selectedItems.length > 0 ? selectedItems.join(' | ') : 'none'}

Weekly context:
${buildWeeklySummary(weeklyData)}

Return JSON matching exactly:
{
  "talkingPoints": ["string"],
  "counterArguments": ["string"],
  "pivotPlays": [{"strategy": "string", "script": "string"}],
  "carrierSpecificArguments": ["string"],
  "coachsCorner": "string",
  "complianceNotes": "string"
}`,
    },
  ];
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlock?.[1]) return codeBlock[1].trim();

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error('Could not extract JSON from Gemma response.');
}

function ensureStringArray(value: unknown, fallback: string[] = []): string[] {
  if (!Array.isArray(value)) return fallback;
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function normalizeAccessoryEligibilityStatus(
  value: unknown,
  quoteSafe: boolean
): SalesScript['accessoryRecommendations'][number]['eligibilityStatus'] {
  if (quoteSafe) return 'quote-safe';
  if (value === 'not-eligible' || value === 'not-applicable' || value === 'review-required') return value;
  return 'review-required';
}

async function requestGemma(messages: ChatMessage[]): Promise<string> {
  if (loadingState !== 'ready') {
    await initializeGemma();
  }

  if (loadingState !== 'ready') {
    throw new Error('AI is not ready.');
  }

  const { signal, cleanup } = withTimeoutSignal({ timeoutMs: REQUEST_TIMEOUT_MS });

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal,
      body: JSON.stringify({
        messages,
        temperature: 0.35,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setUnavailable(response.status);
      throw new Error(typeof payload?.error === 'string' ? payload.error : `Gemma request failed with ${response.status}`);
    }

    const payload = await response.json();
    if (typeof payload?.content !== 'string' || !payload.content.trim()) {
      setUnavailable();
      throw new Error('Gemma response was empty.');
    }

    cooldownUntil = 0;
    setState('ready');
    return payload.content;
  } catch (error) {
    if (isAbortError(error)) {
      setUnavailable();
      throw new Error('Gemma request timed out.');
    }

    throw error;
  } finally {
    cleanup();
  }
}

function parseModelJson(raw: string, fallbackLabel: string): Record<string, unknown> {
  try {
    return JSON.parse(extractJsonObject(raw)) as Record<string, unknown>;
  } catch {
    throw new Error(`${fallbackLabel} response could not be read.`);
  }
}

function parseScriptResponse(raw: string, context: SalesContext): SalesScript {
  const data = parseModelJson(raw, 'Gemma game plan');
  const parsedAccessories = Array.isArray(data.accessoryRecommendations)
    ? data.accessoryRecommendations
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item) => {
          const itemId = typeof item.itemId === 'string' ? item.itemId : undefined;
          const name = typeof item.name === 'string' ? item.name : 'Accessory';
          const quoteSafe = canKipQuoteAccessoryBundleEligibility(itemId || name);

          return {
            itemId,
            name,
            why: typeof item.why === 'string' ? item.why : '',
            priceRange: typeof item.priceRange === 'string' ? item.priceRange : '',
            brands: ensureStringArray(item.brands),
            bundleEligible: quoteSafe,
            eligibilityStatus: normalizeAccessoryEligibilityStatus(item.eligibilityStatus, quoteSafe),
            sourceUrl: typeof item.sourceUrl === 'string' ? item.sourceUrl : undefined,
            proofText: typeof item.proofText === 'string' ? item.proofText : undefined,
            reasonTags: ensureStringArray(item.reasonTags),
            confidence: typeof item.confidence === 'string' ? item.confidence : undefined,
            reviewStatus: typeof item.reviewStatus === 'string' ? item.reviewStatus : undefined,
          };
        })
    : [];

  return {
    welcomeMessages: ensureStringArray(data.welcomeMessages, ['Welcome to T-Mobile! How can I help you today?']),
    smallTalk: Array.isArray(data.smallTalk)
      ? data.smallTalk
          .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
          .map((item) => ({
            category: typeof item.category === 'string' ? item.category : 'General',
            text: typeof item.text === 'string' ? item.text : '',
          }))
          .filter((item) => item.text)
      : [],
    oneLiners: ensureStringArray(data.oneLiners, ['How can I make your T-Mobile experience better today?']),
    discoveryQuestions: ensureStringArray(data.discoveryQuestions, ['What brings you to T-Mobile today?']),
    valuePropositions: ensureStringArray(data.valuePropositions, ['T-Mobile offers strong value and support.']),
    objectionHandling: Array.isArray(data.objectionHandling)
      ? data.objectionHandling
          .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
          .map((item) => ({
            concern: typeof item.concern === 'string' ? item.concern : '',
            reassurance: typeof item.reassurance === 'string' ? item.reassurance : '',
          }))
          .filter((item) => item.concern && item.reassurance)
      : [],
    accessoryRecommendations: applyLiveGateToRecommendations(parsedAccessories, context),
    purchaseSteps: ensureStringArray(data.purchaseSteps, ['Review needs', 'Present the best option', 'Close confidently']),
    coachsCorner: typeof data.coachsCorner === 'string' ? data.coachsCorner : 'Stay calm, ask one more good question, and keep it simple.',
    nearbyStores: [],
    groundingSources: [],
  };
}

function parseObjectionResponse(raw: string): ObjectionAnalysis {
  const data = parseModelJson(raw, 'Gemma objection');

  return {
    talkingPoints: ensureStringArray(data.talkingPoints, ['Start by acknowledging the concern clearly.']),
    counterArguments: ensureStringArray(data.counterArguments, ['Focus on the strongest value point for this caller.']),
    pivotPlays: Array.isArray(data.pivotPlays)
      ? data.pivotPlays
          .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
          .map((item) => ({
            strategy: typeof item.strategy === 'string' ? item.strategy : '',
            script: typeof item.script === 'string' ? item.script : '',
          }))
          .filter((item) => item.strategy && item.script)
      : undefined,
    carrierSpecificArguments: ensureStringArray(data.carrierSpecificArguments),
    coachsCorner: typeof data.coachsCorner === 'string' ? data.coachsCorner : 'Lead with empathy, then pivot to one strong reason to stay in the conversation.',
    complianceNotes: typeof data.complianceNotes === 'string' ? data.complianceNotes : 'Follow CPNI rules and keep the conversation generic.',
    groundingSources: [],
  };
}

export async function gemmaGenerateScript(
  context: SalesContext,
  weeklyData: WeeklyUpdate | null,
): Promise<SalesScript> {
  const response = await requestGemma(buildScriptMessages(context, weeklyData));
  return parseScriptResponse(response, context);
}

function cleanFreshTake(raw: string): string {
  const parsed = raw.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, ' ');
  const words = parsed.split(' ').filter(Boolean);
  return words.length > 18 ? `${words.slice(0, 18).join(' ')}...` : parsed;
}

export async function gemmaFreshTake(input: {
  text: string;
  context: SalesContext;
  lastKipRecommendation?: string;
}): Promise<string> {
  const gate = buildLiveRecommendationGate(input.context);
  const response = await requestGemma([
    {
      role: 'system',
      content: "You are Gemma, the rep's creative co-pilot. Return one short line only. No markdown. No quotes.",
    },
    {
      role: 'user',
      content: `Context: ${input.context.purchaseIntent} + ${input.context.product.join(', ')} + profile=${input.context.profilePreset ?? input.context.age} + ${input.lastKipRecommendation ?? 'no KIP line yet'}.
Allowed add-on categories, if any: ${gate.allowedCategories.join(', ') || 'none'}.
Task: Rewrite the following in a fresher, more natural, slightly more confident tone while staying 100% ethical and on-script.
Keep it under 18 words if possible.
Do not add a new promo, product category, discount, eligibility claim, or accessory.
Original: "${input.text}"`,
    },
  ]);

  return cleanFreshTake(response);
}

export async function gemmaAnalyzeObjection(
  objection: string,
  context: SalesContext,
  _script: SalesScript | null,
  selectedItems: string[],
  weeklyData: WeeklyUpdate | null,
): Promise<ObjectionAnalysis> {
  const response = await requestGemma(buildObjectionMessages(objection, context, selectedItems, weeklyData));
  return parseObjectionResponse(response);
}
