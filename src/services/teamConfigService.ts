/**
 * Team Configuration Service
 *
 * Teams customize name, mascot, weekly focus, and goal text.
 * Stored in localStorage; shared between devices via "Arcade Token"
 * (copy-pasteable Base64 string — zero filesystem friction on mobile).
 */

const TEAM_CONFIG_KEY = 'team-config-v1';
export const TEAM_TOKEN_PREFIX = 'ARC1-';
const TOKEN_SCHEMA_VERSION = 1;
const MAX_TEAM_NAME_LENGTH = 40;

export const MASCOT_OPTIONS = [
  { id: 'rocket', emoji: '\u{1F680}', label: 'Rocket' },
  { id: 'fire', emoji: '\u{1F525}', label: 'Fire' },
  { id: 'lightning', emoji: '\u{26A1}', label: 'Lightning' },
  { id: 'trophy', emoji: '\u{1F3C6}', label: 'Trophy' },
  { id: 'crown', emoji: '\u{1F451}', label: 'Crown' },
  { id: 'star', emoji: '\u{2B50}', label: 'Star' },
  { id: 'diamond', emoji: '\u{1F48E}', label: 'Diamond' },
  { id: 'shield', emoji: '\u{1F6E1}\u{FE0F}', label: 'Shield' },
  { id: 'target', emoji: '\u{1F3AF}', label: 'Target' },
  { id: 'muscle', emoji: '\u{1F4AA}', label: 'Muscle' },
  { id: 'eagle', emoji: '\u{1F985}', label: 'Eagle' },
  { id: 'wolf', emoji: '\u{1F43A}', label: 'Wolf' },
  { id: 'lion', emoji: '\u{1F981}', label: 'Lion' },
  { id: 'dragon', emoji: '\u{1F409}', label: 'Dragon' },
  { id: 'phoenix', emoji: '\u{1F426}\u{200D}\u{1F525}', label: 'Phoenix' },
  { id: 'bear', emoji: '\u{1F43B}', label: 'Bear' },
  { id: 'shark', emoji: '\u{1F988}', label: 'Shark' },
  { id: 'octopus', emoji: '\u{1F419}', label: 'Octopus' },
  { id: 'bee', emoji: '\u{1F41D}', label: 'Bee' },
  { id: 'unicorn', emoji: '\u{1F984}', label: 'Unicorn' },
] as const;

export type MascotId = (typeof MASCOT_OPTIONS)[number]['id'];

export interface TeamConfig {
  teamName: string;
  mascotId: MascotId;
  customLogoUrl: string | null; // optional image URL
  weeklyFocus: string;
  goalText: string;
  managerName: string;
  updatedAt: string; // ISO date
}

export function defaultTeamConfig(): TeamConfig {
  return {
    teamName: '',
    mascotId: 'rocket',
    customLogoUrl: null,
    weeklyFocus: 'Sales Fundamentals',
    goalText: '',
    managerName: '',
    updatedAt: new Date().toISOString(),
  };
}

export function getTeamConfig(): TeamConfig {
  try {
    const raw = localStorage.getItem(TEAM_CONFIG_KEY);
    if (!raw) return defaultTeamConfig();
    const parsed = JSON.parse(raw) as Partial<TeamConfig>;
    return {
      ...defaultTeamConfig(),
      ...parsed,
    };
  } catch {
    return defaultTeamConfig();
  }
}

type TeamConfigListener = (config: TeamConfig) => void;
const listeners = new Set<TeamConfigListener>();

function notifyListeners(config: TeamConfig): void {
  listeners.forEach((fn) => {
    try {
      fn(config);
    } catch {
      // Listeners should not break the save flow.
    }
  });
}

export function saveTeamConfig(config: TeamConfig): void {
  try {
    config.updatedAt = new Date().toISOString();
    localStorage.setItem(TEAM_CONFIG_KEY, JSON.stringify(config));
    notifyListeners(config);
  } catch {
    // Silently fail
  }
}

export function subscribeTeamConfig(fn: TeamConfigListener): () => void {
  listeners.add(fn);
  const onStorage = (event: StorageEvent) => {
    if (event.key === TEAM_CONFIG_KEY) {
      try {
        fn(getTeamConfig());
      } catch {
        // Ignore
      }
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(fn);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

export function getMascotEmoji(mascotId: MascotId): string {
  return MASCOT_OPTIONS.find((m) => m.id === mascotId)?.emoji ?? '\u{1F680}';
}

// ─────────────────────────────────────────────────────────────────────────────
// Arcade Token — copy-pasteable team sync
// ─────────────────────────────────────────────────────────────────────────────

interface TokenPayload {
  v: number;
  n: string;   // teamName
  m: string;   // mascotId
  l: string | null; // customLogoUrl
  f: string;   // weeklyFocus
  g: string;   // goalText
  mg: string;  // managerName
}

function toBase64Url(input: string): string {
  // UTF-8 safe: encodeURIComponent → unescape → btoa
  const utf8 = unescape(encodeURIComponent(input));
  const b64 = btoa(utf8);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): string {
  const padded = input
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(padLen);
  const binary = atob(b64);
  return decodeURIComponent(escape(binary));
}

export function encodeArcadeToken(config: TeamConfig): string {
  const trimmedName = config.teamName.trim();
  if (!trimmedName) {
    throw new Error('Team name is required to generate an Arcade Token.');
  }
  if (trimmedName.length > MAX_TEAM_NAME_LENGTH) {
    throw new Error(`Team name must be ${MAX_TEAM_NAME_LENGTH} characters or fewer.`);
  }
  const payload: TokenPayload = {
    v: TOKEN_SCHEMA_VERSION,
    n: trimmedName,
    m: config.mascotId,
    l: config.customLogoUrl,
    f: config.weeklyFocus,
    g: config.goalText,
    mg: config.managerName,
  };
  return `${TEAM_TOKEN_PREFIX}${toBase64Url(JSON.stringify(payload))}`;
}

export type DecodeArcadeTokenResult =
  | { ok: true; config: TeamConfig }
  | { ok: false; error: 'format' | 'version' | 'payload' | 'name' };

export function decodeArcadeToken(token: string): DecodeArcadeTokenResult {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: 'format' };

  const body = trimmed.startsWith(TEAM_TOKEN_PREFIX)
    ? trimmed.slice(TEAM_TOKEN_PREFIX.length)
    : trimmed;

  let decoded: string;
  try {
    decoded = fromBase64Url(body);
  } catch {
    return { ok: false, error: 'format' };
  }

  let parsed: Partial<TokenPayload>;
  try {
    parsed = JSON.parse(decoded) as Partial<TokenPayload>;
  } catch {
    return { ok: false, error: 'payload' };
  }

  if (typeof parsed.v !== 'number' || parsed.v !== TOKEN_SCHEMA_VERSION) {
    return { ok: false, error: 'version' };
  }
  if (!parsed.n || typeof parsed.n !== 'string' || !parsed.n.trim()) {
    return { ok: false, error: 'name' };
  }

  const base = defaultTeamConfig();
  const mascotId = MASCOT_OPTIONS.find((m) => m.id === parsed.m)?.id ?? base.mascotId;

  const config: TeamConfig = {
    ...base,
    teamName: parsed.n.trim(),
    mascotId,
    customLogoUrl: typeof parsed.l === 'string' ? parsed.l : null,
    weeklyFocus: typeof parsed.f === 'string' ? parsed.f : base.weeklyFocus,
    goalText: typeof parsed.g === 'string' ? parsed.g : base.goalText,
    managerName: typeof parsed.mg === 'string' ? parsed.mg : base.managerName,
    updatedAt: new Date().toISOString(),
  };

  return { ok: true, config };
}
