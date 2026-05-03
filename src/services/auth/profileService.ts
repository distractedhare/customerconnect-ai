// Rep profile service.
//
// Identity is HANDLE + 6-DIGIT PIN scoped to a TAB+team. No real names,
// no email, no EID, no phone numbers. PIN is friction (PBKDF2 of a
// 6-digit secret is ~28 hours to brute-force given filesystem access).
// Documented in onboarding so reps don't expect bank-grade security.
//
// Profile field for rep-vs-manager is `accessLevel` — NOT `role` —
// because `cc-role` already stores the active department
// (sales / tech-support / etc.) at config/roles.ts.

import { defaultTabCode, defaultTeamId, findTab, findTeam } from '../../data/tabs';
import type { MascotId } from '../teamConfigService';
import { get as kvGet, remove as kvRemove, set as kvSet } from '../storage/kvStore';
import { PROFILE_KEY, REP_GAMEPLAY_KEYS } from '../storage/keys';
import type { AccessLevel } from './capabilities';

export { PROFILE_KEY };
const HANDLE_RE = /^[a-z0-9_]{3,20}$/;
const PIN_RE = /^\d{6}$/;
const PBKDF2_ITERATIONS = 100_000;

export interface RepProfile {
  schemaVersion: number;
  handle: string;
  pinHash: string;
  pinSalt: string;
  tabCode: string;
  teamId: string;
  accessLevel: AccessLevel;
  mascotId: MascotId;
  initials: string;
  createdAt: string;
  lastSeenAt: string;
}

export interface PublicProfile {
  handle: string;
  tabCode: string;
  teamId: string;
  accessLevel: AccessLevel;
  mascotId: MascotId;
  initials: string;
}

export interface SignUpInput {
  handle: string;
  pin: string;
  tabCode: string;
  teamId: string;
  mascotId: MascotId;
  initials: string;
  accessLevel?: AccessLevel;
}

export interface SignUpResult {
  ok: boolean;
  profile?: PublicProfile;
  error?: 'handle' | 'pin' | 'tab' | 'team' | 'crypto';
}

export interface SignInResult {
  ok: boolean;
  profile?: PublicProfile;
  error?: 'no-profile' | 'handle' | 'pin';
}

function toPublic(profile: RepProfile): PublicProfile {
  return {
    handle: profile.handle,
    tabCode: profile.tabCode,
    teamId: profile.teamId,
    accessLevel: profile.accessLevel,
    mascotId: profile.mascotId,
    initials: profile.initials,
  };
}

function bytesToBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveHash(pin: string, saltB64: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('crypto-unavailable');
  }
  const salt = base64ToBytes(saltB64);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    256,
  );
  return bytesToBase64(new Uint8Array(bits));
}

function newSaltB64(): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error('crypto-unavailable');
  }
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bytesToBase64(salt);
}

function readProfileRaw(): RepProfile | undefined {
  return kvGet<RepProfile>(PROFILE_KEY);
}

export function getProfile(): PublicProfile | null {
  const profile = readProfileRaw();
  return profile ? toPublic(profile) : null;
}

export function hasProfile(): boolean {
  return readProfileRaw() !== undefined;
}

type ProfileListener = (profile: PublicProfile | null) => void;
const listeners = new Set<ProfileListener>();

export function subscribeProfile(fn: ProfileListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function notify(): void {
  const next = getProfile();
  for (const fn of listeners) {
    try {
      fn(next);
    } catch {
      /* listeners can't break the flow */
    }
  }
}

function normalizeHandle(input: string): string {
  return input.trim().toLowerCase();
}

function normalizeInitials(input: string): string {
  return input
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase()
    .slice(0, 3);
}

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const handle = normalizeHandle(input.handle);
  if (!HANDLE_RE.test(handle)) return { ok: false, error: 'handle' };
  if (!PIN_RE.test(input.pin)) return { ok: false, error: 'pin' };
  if (!findTab(input.tabCode)) return { ok: false, error: 'tab' };
  if (!findTeam(input.tabCode, input.teamId)) return { ok: false, error: 'team' };

  let pinSalt: string;
  let pinHash: string;
  try {
    pinSalt = newSaltB64();
    pinHash = await deriveHash(input.pin, pinSalt);
  } catch {
    return { ok: false, error: 'crypto' };
  }

  const now = new Date().toISOString();
  const profile: RepProfile = {
    schemaVersion: 1,
    handle,
    pinHash,
    pinSalt,
    tabCode: input.tabCode,
    teamId: input.teamId,
    accessLevel: input.accessLevel ?? 'rep',
    mascotId: input.mascotId,
    initials: normalizeInitials(input.initials),
    createdAt: now,
    lastSeenAt: now,
  };

  kvSet(PROFILE_KEY, profile);
  notify();
  return { ok: true, profile: toPublic(profile) };
}

export async function signIn(handle: string, pin: string): Promise<SignInResult> {
  const profile = readProfileRaw();
  if (!profile) return { ok: false, error: 'no-profile' };
  if (normalizeHandle(handle) !== profile.handle) return { ok: false, error: 'handle' };

  let attemptedHash: string;
  try {
    attemptedHash = await deriveHash(pin, profile.pinSalt);
  } catch {
    return { ok: false, error: 'pin' };
  }
  if (attemptedHash !== profile.pinHash) return { ok: false, error: 'pin' };

  const next: RepProfile = { ...profile, lastSeenAt: new Date().toISOString() };
  kvSet(PROFILE_KEY, next);
  notify();
  return { ok: true, profile: toPublic(next) };
}

export interface ProfileUpdate {
  tabCode?: string;
  teamId?: string;
  mascotId?: MascotId;
  initials?: string;
  accessLevel?: AccessLevel;
}

export function updateProfile(update: ProfileUpdate): PublicProfile | null {
  const profile = readProfileRaw();
  if (!profile) return null;

  const tabCode = update.tabCode ?? profile.tabCode;
  const teamId = update.teamId ?? profile.teamId;
  if (!findTab(tabCode)) return toPublic(profile);
  if (!findTeam(tabCode, teamId)) return toPublic(profile);

  const next: RepProfile = {
    ...profile,
    tabCode,
    teamId,
    mascotId: update.mascotId ?? profile.mascotId,
    initials: update.initials !== undefined ? normalizeInitials(update.initials) : profile.initials,
    accessLevel: update.accessLevel ?? profile.accessLevel,
    lastSeenAt: new Date().toISOString(),
  };

  kvSet(PROFILE_KEY, next);
  notify();
  return toPublic(next);
}

export function signOut(eraseLocalData: boolean): void {
  kvRemove(PROFILE_KEY);
  if (eraseLocalData) {
    // Wipe every registered rep gameplay key. Per-device prefs (theme,
    // cc-role) are NOT in the registry and are intentionally left intact.
    // New rep-state keys are added by registering them in keys.ts —
    // without that registration they leak across sign-outs.
    for (const k of REP_GAMEPLAY_KEYS) kvRemove(k);
  }
  notify();
}

export function defaultSignUpHints(): { tabCode: string; teamId: string } {
  const tabCode = defaultTabCode();
  return { tabCode, teamId: defaultTeamId(tabCode) };
}
