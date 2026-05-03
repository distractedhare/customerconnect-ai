// Rep Token — copy-pasteable cross-device transfer.
//
// Mirrors the existing `ARC1-` Arcade Token codec. Bundles the public
// profile (no PIN hash, no salt) plus the rep's saved state across
// every gameplay surface. `exportedAt` lets the import side warn when
// local state is newer than the token.

import { fromBase64Url, toBase64Url } from '../storage/tokenCodec';
import type { PublicProfile } from './profileService';

export const REP_TOKEN_PREFIX = 'REP1-';
const REP_TOKEN_SCHEMA_VERSION = 1;

export interface RepTokenSnapshot {
  profile: PublicProfile;
  bingoProgress?: unknown;
  bingoStreak?: unknown;
  prize?: unknown;
  runner?: unknown;
  leaderboard?: unknown;
  exportedAt: string;
}

interface TokenPayload {
  v: number;
  p: PublicProfile;
  bp?: unknown;
  bs?: unknown;
  pr?: unknown;
  rn?: unknown;
  lb?: unknown;
  t: string;
}

export function encodeRepToken(snapshot: RepTokenSnapshot): string {
  const payload: TokenPayload = {
    v: REP_TOKEN_SCHEMA_VERSION,
    p: snapshot.profile,
    bp: snapshot.bingoProgress,
    bs: snapshot.bingoStreak,
    pr: snapshot.prize,
    rn: snapshot.runner,
    lb: snapshot.leaderboard,
    t: snapshot.exportedAt,
  };
  return `${REP_TOKEN_PREFIX}${toBase64Url(JSON.stringify(payload))}`;
}

export interface DecodeRepTokenResult {
  ok: boolean;
  snapshot?: RepTokenSnapshot;
  error?: 'format' | 'version' | 'payload' | 'profile';
}

export function decodeRepToken(token: string): DecodeRepTokenResult {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: 'format' };

  const body = trimmed.startsWith(REP_TOKEN_PREFIX)
    ? trimmed.slice(REP_TOKEN_PREFIX.length)
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

  if (typeof parsed.v !== 'number' || parsed.v !== REP_TOKEN_SCHEMA_VERSION) {
    return { ok: false, error: 'version' };
  }
  if (!parsed.p || typeof parsed.p !== 'object' || typeof parsed.p.handle !== 'string') {
    return { ok: false, error: 'profile' };
  }

  const snapshot: RepTokenSnapshot = {
    profile: parsed.p as PublicProfile,
    bingoProgress: parsed.bp,
    bingoStreak: parsed.bs,
    prize: parsed.pr,
    runner: parsed.rn,
    leaderboard: parsed.lb,
    exportedAt: typeof parsed.t === 'string' ? parsed.t : new Date(0).toISOString(),
  };

  return { ok: true, snapshot };
}
