import { buildPromptContext } from '../data';
import { getCached, incrementCallCount, isOverBudget, setCache } from './cache';
import { WeeklyUpdate } from './weeklyUpdateSchema';
import { ObjectionAnalysis, SalesContext, SalesScript } from '../types';
import { RequestSignalOptions, isAbortError, withTimeoutSignal } from './networkUtils';

type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

type ScriptEnhancement = Pick<SalesScript, 'welcomeMessages' | 'smallTalk' | 'valuePropositions' | 'purchaseSteps' | 'coachsCorner'>;
type ObjectionEnhancement = Pick<ObjectionAnalysis, 'talkingPoints' | 'counterArguments' | 'carrierSpecificArguments' | 'coachsCorner'>;

interface ProviderPayload {
  messages: ChatMessage[];
  temperature?: number;
}

interface ProviderResponse {
  content: string;
}

interface ModelRequestOptions extends RequestSignalOptions {}

const PROXY_ENDPOINT = '/api/ai';
const AUTH_COOLDOWN_MS = 5 * 60 * 1000;
const PROXY_HEALTH_TTL_MS = 60 * 1000;

let authCooldownUntil = 0;
let proxyAvailable: boolean | null = null;
let lastProxyHealthCheckAt = 0;

function isAuthCoolingDown(): boolean {
  return authCooldownUntil > Date.now();
}

function startAuthCooldown(): void {
  authCooldownUntil = Date.now() + AUTH_COOLDOWN_MS;
}

function readTextContent(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;

  if (Array.isArray(value)) {
    const joined = value
      .map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object') {
          if (typeof (entry as { text?: unknown }).text === 'string') return (entry as { text: string }).text;
          if (typeof (entry as { content?: unknown }).content === 'string') return (entry as { content: string }).content;
        }
        return '';
      })
      .join('\n')
      .trim();

    return joined || null;
  }

  return null;
}

async function ensureProxyAvailable(force = false, options: RequestSignalOptions = {}): Promise<boolean> {
  if (isAuthCoolingDown()) return false;

  const now = Date.now();
  if (!force && proxyAvailable !== null && now - lastProxyHealthCheckAt < PROXY_HEALTH_TTL_MS) {
    return proxyAvailable;
  }

  lastProxyHealthCheckAt = now;

  const { signal, cleanup } = withTimeoutSignal({ ...options, timeoutMs: options.timeoutMs ?? 2500 });

  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'GET',
      cache: 'no-store',
      signal,
    });

    const payload = await response.json().catch(() => ({}));

    if (response.ok && payload?.ok === true) {
      proxyAvailable = true;
      return true;
    }

    if ([401, 403].includes(response.status)) {
      startAuthCooldown();
    }

    proxyAvailable = false;
    return false;
  } catch (error) {
    if (isAbortError(error)) throw error;
    proxyAvailable = false;
    return false;
  } finally {
    cleanup();
  }
}

function getDirectConfig() {
  const completionsUrl = import.meta.env.VITE_AI_COMPLETIONS_URL;
  const model = import.meta.env.VITE_AI_MODEL;
  const apiKey = import.meta.env.VITE_AI_API_KEY;

  if (!completionsUrl || !model) return null;

  return {
    completionsUrl,
    model,
    apiKey,
  };
}

function shouldAttemptDirectFallback(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_AI_ALLOW_BROWSER_FALLBACK === 'true';
}

function buildWeeklyContext(weeklyData?: WeeklyUpdate | null): string {
  if (!weeklyData) return 'No weekly update loaded. Lean on the verified baseline data only.';

  const promos = weeklyData.currentPromos
    .slice(0, 4)
    .map((promo) => `- ${promo.name}: ${promo.details}`)
    .join('\n');

  const intel = weeklyData.competitiveIntel
    .slice(0, 4)
    .map((item) => `- ${item.carrier}: ${item.talkingPoint}`)
    .join('\n');

  const issues = weeklyData.knownIssues
    .slice(0, 3)
    .map((item) => `- ${item.issue}: ${item.workaround}`)
    .join('\n');

  return [
    `Weekly update version: ${weeklyData.metadata.version}`,
    `Updated: ${weeklyData.metadata.updatedDate}`,
    promos ? `Current promos:\n${promos}` : '',
    intel ? `Competitive intel:\n${intel}` : '',
    issues ? `Known issues:\n${issues}` : '',
  ].filter(Boolean).join('\n\n');
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Model response did not contain valid JSON.');
  }

  return trimmed.slice(firstBrace, lastBrace + 1);
}

function normalizeStringList(values: unknown, maxItems: number): string[] | undefined {
  if (!Array.isArray(values)) return undefined;

  const normalized = values
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter(Boolean);

  if (normalized.length === 0) return undefined;

  return [...new Set(normalized)].slice(0, maxItems);
}

function normalizeSmallTalk(values: unknown): SalesScript['smallTalk'] | undefined {
  if (!Array.isArray(values)) return undefined;

  const normalized = values
    .filter((value): value is Record<string, unknown> => typeof value === 'object' && value !== null)
    .map((value) => ({
      category: typeof value.category === 'string' ? value.category.trim() : '',
      text: typeof value.text === 'string' ? value.text.trim() : '',
    }))
    .filter((value) => value.category && value.text);

  if (normalized.length === 0) return undefined;

  return normalized.slice(0, 4);
}

function parseScriptEnhancement(raw: string): ScriptEnhancement {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extractJsonObject(raw)) as Record<string, unknown>;
  } catch {
    throw new Error('AI plan enhancement returned unreadable JSON.');
  }

  return {
    welcomeMessages: normalizeStringList(parsed.welcomeMessages, 4) ?? [],
    smallTalk: normalizeSmallTalk(parsed.smallTalk) ?? [],
    valuePropositions: normalizeStringList(parsed.valuePropositions, 6) ?? [],
    purchaseSteps: normalizeStringList(parsed.purchaseSteps, 6) ?? [],
    coachsCorner: typeof parsed.coachsCorner === 'string' ? parsed.coachsCorner.trim() : '',
  };
}

function parseObjectionEnhancement(raw: string): ObjectionEnhancement {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(extractJsonObject(raw)) as Record<string, unknown>;
  } catch {
    throw new Error('AI objection enhancement returned unreadable JSON.');
  }

  return {
    talkingPoints: normalizeStringList(parsed.talkingPoints, 6) ?? [],
    counterArguments: normalizeStringList(parsed.counterArguments, 4) ?? [],
    carrierSpecificArguments: normalizeStringList(parsed.carrierSpecificArguments, 4) ?? [],
    coachsCorner: typeof parsed.coachsCorner === 'string' ? parsed.coachsCorner.trim() : '',
  };
}

function mergeUniqueStrings(primary: string[] = [], fallback: string[] = [], maxItems = 6): string[] {
  const merged = [...primary, ...fallback]
    .map((item) => item.trim())
    .filter(Boolean);

  return [...new Set(merged)].slice(0, maxItems);
}

function mergeSmallTalk(primary: SalesScript['smallTalk'] = [], fallback: SalesScript['smallTalk'] = []): SalesScript['smallTalk'] {
  const seen = new Set<string>();
  const merged: SalesScript['smallTalk'] = [];

  for (const item of [...primary, ...fallback]) {
    const key = `${item.category}::${item.text}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged.slice(0, 4);
}

function buildScriptMessages(
  context: SalesContext,
  script: SalesScript,
  weeklyData?: WeeklyUpdate | null,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: [
        'You are a T-Mobile retail sales coach improving an existing coaching plan.',
        'Return strict JSON only. Do not wrap it in markdown.',
        'Never invent promos, pricing, competitor claims, or policies that are not present in the verified data.',
        'Keep the tone conversational, confident, and ready for a live rep to use immediately.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        'Personalize this coaching plan for the specific caller context.',
        'Keep the best existing ideas, but make the language tighter and more situation-specific.',
        'If a field is already strong, you may keep or lightly sharpen it.',
        '',
        'Return JSON with exactly these keys:',
        '{',
        '  "welcomeMessages": string[],',
        '  "smallTalk": [{"category": string, "text": string}],',
        '  "valuePropositions": string[],',
        '  "purchaseSteps": string[],',
        '  "coachsCorner": string',
        '}',
        '',
        'Rules:',
        '- welcomeMessages: max 4',
        '- smallTalk: max 4 quick rapport or heads-up beats',
        '- valuePropositions: max 6',
        '- purchaseSteps: max 6',
        '- coachsCorner: 1 short paragraph',
        '- Use only verified facts from the data below',
        '- No markdown, no explanation, JSON only',
        '',
        `Caller context: ${JSON.stringify(context, null, 2)}`,
        '',
        `Current plan: ${JSON.stringify(script, null, 2)}`,
        '',
        `Verified baseline data:\n${buildPromptContext(context)}`,
        '',
        `Weekly update:\n${buildWeeklyContext(weeklyData)}`,
      ].join('\n'),
    },
  ];
}

function buildObjectionMessages(
  objection: string,
  context: SalesContext,
  result: ObjectionAnalysis,
  weeklyData?: WeeklyUpdate | null,
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: [
        'You are a T-Mobile retail sales coach improving an objection response.',
        'Return strict JSON only. Do not wrap it in markdown.',
        'Never invent pricing, promos, or competitor weaknesses that are not present in the verified data.',
        'Keep everything compliant, calm, and ready for a rep to say out loud.',
      ].join(' '),
    },
    {
      role: 'user',
      content: [
        'Sharpen this objection response for the caller context below.',
        '',
        'Return JSON with exactly these keys:',
        '{',
        '  "talkingPoints": string[],',
        '  "counterArguments": string[],',
        '  "carrierSpecificArguments": string[],',
        '  "coachsCorner": string',
        '}',
        '',
        'Rules:',
        '- talkingPoints: max 6',
        '- counterArguments: max 4',
        '- carrierSpecificArguments: max 4',
        '- coachsCorner: 1 short paragraph',
        '- Keep the strongest existing ideas and improve specificity',
        '- No markdown, no explanation, JSON only',
        '',
        `Objection(s): ${objection}`,
        '',
        `Caller context: ${JSON.stringify(context, null, 2)}`,
        '',
        `Current objection analysis: ${JSON.stringify(result, null, 2)}`,
        '',
        `Verified baseline data:\n${buildPromptContext(context)}`,
        '',
        `Weekly update:\n${buildWeeklyContext(weeklyData)}`,
      ].join('\n'),
    },
  ];
}

async function parseProviderResponse(response: Response): Promise<ProviderResponse> {
  const payload = await response.json().catch(() => ({}));
  const content =
    readTextContent(payload?.content)
    ?? readTextContent(payload?.choices?.[0]?.message?.content)
    ?? readTextContent(payload?.choices?.[0]?.text)
    ?? readTextContent(payload?.output_text)
    ?? readTextContent(payload?.response)
    ?? readTextContent(payload?.candidates?.[0]?.content?.parts);

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Model response did not include any content.');
  }

  return { content };
}

async function requestViaProxy(payload: ProviderPayload, options: RequestSignalOptions = {}): Promise<ProviderResponse | null> {
  if (isAuthCoolingDown()) return null;
  if (!(await ensureProxyAvailable(false, options))) return null;

  const { signal, cleanup } = withTimeoutSignal({ ...options, timeoutMs: options.timeoutMs ?? 7000 });

  try {
    const response = await fetch(PROXY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal,
    });

    if (!response.ok) {
      if ([404, 405, 501, 503].includes(response.status)) return null;
      if ([401, 403].includes(response.status)) {
        proxyAvailable = false;
        startAuthCooldown();
        return null;
      }
      proxyAvailable = false;
      return null;
    }

    proxyAvailable = true;
    return parseProviderResponse(response);
  } catch (error) {
    if (isAbortError(error)) throw error;
    proxyAvailable = false;
    return null;
  } finally {
    cleanup();
  }
}

async function requestDirect(payload: ProviderPayload, options: RequestSignalOptions = {}): Promise<ProviderResponse | null> {
  if (!shouldAttemptDirectFallback() || isAuthCoolingDown()) return null;

  const config = getDirectConfig();
  if (!config) return null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const { signal, cleanup } = withTimeoutSignal({ ...options, timeoutMs: options.timeoutMs ?? 7000 });

  try {
    const response = await fetch(config.completionsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: payload.messages,
        temperature: payload.temperature ?? 0.35,
      }),
      cache: 'no-store',
      signal,
    });

    if (!response.ok) {
      if ([401, 403].includes(response.status)) {
        startAuthCooldown();
        return null;
      }
      return null;
    }

    return parseProviderResponse(response);
  } catch (error) {
    if (isAbortError(error)) throw error;
    return null;
  } finally {
    cleanup();
  }
}

async function requestModel(payload: ProviderPayload, options: ModelRequestOptions = {}): Promise<string | null> {
  if (isOverBudget()) return null;
  incrementCallCount();

  const proxied = await requestViaProxy(payload, options);
  if (proxied?.content) return proxied.content;

  const direct = await requestDirect(payload, options);
  return direct?.content ?? null;
}

export async function warmAIEnhancement(options: RequestSignalOptions = {}): Promise<void> {
  try {
    await ensureProxyAvailable(false, options);
  } catch (error) {
    if (!isAbortError(error)) {
      throw error;
    }
  }
}

export async function generateScriptEnhancement(
  context: SalesContext,
  script: SalesScript,
  weeklyData?: WeeklyUpdate | null,
  options: ModelRequestOptions = {},
): Promise<ScriptEnhancement | null> {
  const cacheKey = ['script-enhancement', context, weeklyData?.metadata.version ?? 'none', script];
  const cached = getCached<ScriptEnhancement>(cacheKey);
  if (cached) return cached;

  const content = await requestModel({
    messages: buildScriptMessages(context, script, weeklyData),
    temperature: 0.35,
  }, options);

  if (!content) return null;

  const parsed = parseScriptEnhancement(content);
  setCache(cacheKey, parsed);
  return parsed;
}

export async function generateObjectionEnhancement(
  objection: string,
  context: SalesContext,
  result: ObjectionAnalysis,
  weeklyData?: WeeklyUpdate | null,
  options: ModelRequestOptions = {},
): Promise<ObjectionEnhancement | null> {
  const cacheKey = ['objection-enhancement', objection, context, weeklyData?.metadata.version ?? 'none', result];
  const cached = getCached<ObjectionEnhancement>(cacheKey);
  if (cached) return cached;

  const content = await requestModel({
    messages: buildObjectionMessages(objection, context, result, weeklyData),
    temperature: 0.25,
  }, options);

  if (!content) return null;

  const parsed = parseObjectionEnhancement(content);
  setCache(cacheKey, parsed);
  return parsed;
}

export function mergeScriptEnhancement(base: SalesScript, enhancement: ScriptEnhancement): SalesScript {
  return {
    ...base,
    welcomeMessages: mergeUniqueStrings(enhancement.welcomeMessages, base.welcomeMessages, 4),
    smallTalk: mergeSmallTalk(enhancement.smallTalk, base.smallTalk),
    valuePropositions: mergeUniqueStrings(enhancement.valuePropositions, base.valuePropositions, 8),
    purchaseSteps: mergeUniqueStrings(enhancement.purchaseSteps, base.purchaseSteps, 6),
    coachsCorner: enhancement.coachsCorner || base.coachsCorner,
  };
}

export interface TacticalPitchPrompt {
  system: string;
  user: string;
}

export interface TacticalPitchPayload {
  recommended_sku: string;
  conversational_pitch: string;
}

export function buildTacticalPitchPrompt(context: SalesContext): TacticalPitchPrompt {
  const callReason = context.purchaseIntent;
  const persona = context.age;
  const targetDevices = context.product.join(', ') || 'Unspecified';
  const painPoints: string[] = [];
  if (context.currentCarrier && context.currentCarrier !== 'Not Specified') {
    painPoints.push(`currently on ${context.currentCarrier}`);
  }
  if (context.totalLines) painPoints.push(`${context.totalLines} lines on account`);
  if (context.familyCount) painPoints.push(`${context.familyCount} people in household`);
  if (context.currentPlatform && context.currentPlatform !== 'Not Specified') {
    painPoints.push(`coming from ${context.currentPlatform}`);
  }
  if (context.hintQualified === 'No') painPoints.push('Home Internet unavailable at address');

  const system = [
    'You are a T-Mobile retail sales coach generating a live, tactical pitch for a rep on a call.',
    'Return STRICT JSON ONLY. No markdown. No prose outside the JSON object.',
    'The JSON must match exactly: {"recommended_sku": string, "conversational_pitch": string}.',
    'recommended_sku must be the exact device name (e.g. "iPhone 17 Pro", "Galaxy S26 Ultra", "Pixel 10 Pro").',
    'conversational_pitch must be 2-3 short sentences a rep can say out loud immediately.',
    'Never invent promos, pricing, or policies that are not already known. Do not mention monthly pricing in the pitch — pricing is rendered separately.',
  ].join(' ');

  const user = [
    'Generate a tactical pitch for this live customer call.',
    '',
    `Call Reason: ${callReason}`,
    `Persona (age bracket): ${persona}`,
    `Target Device category: ${targetDevices}`,
    `Pain Points: ${painPoints.length ? painPoints.join('; ') : 'none specified'}`,
    '',
    'Respond with ONLY this JSON shape:',
    '{"recommended_sku": "<exact device name>", "conversational_pitch": "<2-3 sentence rep script>"}',
  ].join('\n');

  return { system, user };
}

export function mergeObjectionEnhancement(base: ObjectionAnalysis, enhancement: ObjectionEnhancement): ObjectionAnalysis {
  return {
    ...base,
    talkingPoints: mergeUniqueStrings(enhancement.talkingPoints, base.talkingPoints, 6),
    counterArguments: mergeUniqueStrings(enhancement.counterArguments, base.counterArguments, 4),
    carrierSpecificArguments: mergeUniqueStrings(enhancement.carrierSpecificArguments, base.carrierSpecificArguments ?? [], 4),
    coachsCorner: enhancement.coachsCorner || base.coachsCorner,
  };
}
