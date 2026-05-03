// Three-layer KV store: memory (sync) → localStorage (write-ahead) → IndexedDB (durable).
//
// Why this shape:
//  - Existing services (bingo, prize, leaderboard, teamConfig, runner) have
//    SYNCHRONOUS read/write APIs. Switching every caller to async would
//    rewrite half the app for no user-visible benefit.
//  - We hydrate from IDB+LS at boot, then serve every read from memory.
//  - Writes go to memory + LS synchronously (write-ahead log to survive a
//    tab close mid-flush) and queue an async IDB write.
//  - On hydrate, whichever side has the newer `updatedAt` wins per key.

import { idbAllKeys, idbAvailable, idbDelete, idbGet, idbSet } from './idb';
import { runMigrations } from './migrations';

interface Envelope<T> {
  v: T;
  updatedAt: number;
}

const memory = new Map<string, Envelope<unknown>>();
const idbWriteQueue = new Map<string, number>();
let hydrated = false;
let hydrating: Promise<void> | null = null;

function lsGet(key: string): Envelope<unknown> | undefined {
  if (typeof localStorage === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    // Legacy values (pre-envelope) don't have updatedAt — wrap them so
    // services keep working while we transition. Treat them as oldest.
    if (parsed && typeof parsed === 'object' && 'v' in parsed && 'updatedAt' in parsed) {
      return parsed as Envelope<unknown>;
    }
    return { v: parsed, updatedAt: 0 };
  } catch {
    return undefined;
  }
}

function lsSet(key: string, env: Envelope<unknown>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(env));
  } catch {
    // Quota / disabled — fall through; memory still has it.
  }
}

function lsDelete(key: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

async function flushIdb(key: string, env: Envelope<unknown>): Promise<void> {
  if (!idbAvailable()) return;
  await idbSet(key, env);
  // If a newer write landed while we were flushing, the queue holds the
  // newer timestamp — leave it for the next flush.
  const queuedTs = idbWriteQueue.get(key);
  if (queuedTs !== undefined && queuedTs <= env.updatedAt) {
    idbWriteQueue.delete(key);
  }
}

function scheduleIdbWrite(key: string, env: Envelope<unknown>): void {
  idbWriteQueue.set(key, env.updatedAt);
  // Microtask flush — keeps the API sync-feeling but doesn't block render.
  Promise.resolve().then(() => {
    const queuedTs = idbWriteQueue.get(key);
    if (queuedTs !== env.updatedAt) return; // a newer write superseded us
    void flushIdb(key, env);
  });
}

export async function hydrate(): Promise<void> {
  if (hydrated) return;
  if (hydrating) return hydrating;

  hydrating = (async () => {
    const seen = new Set<string>();

    // Read every IDB key first.
    if (idbAvailable()) {
      const idbKeys = await idbAllKeys();
      for (const key of idbKeys) {
        const idbEnv = (await idbGet<Envelope<unknown>>(key)) ?? undefined;
        const lsEnv = lsGet(key);
        const winner = pickNewer(idbEnv, lsEnv);
        if (winner) {
          memory.set(key, winner);
          seen.add(key);
        }
      }
    }

    // Sweep localStorage for keys IDB didn't have (first run after migration).
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || seen.has(key)) continue;
        const env = lsGet(key);
        if (env) {
          memory.set(key, env);
          // Backfill IDB so the next boot reads from the durable side.
          if (idbAvailable()) scheduleIdbWrite(key, env);
        }
      }
    }

    // Run schema migrations across every hydrated key.
    runMigrations(memory);

    hydrated = true;
  })();

  return hydrating;
}

function pickNewer(
  a: Envelope<unknown> | undefined,
  b: Envelope<unknown> | undefined,
): Envelope<unknown> | undefined {
  if (!a) return b;
  if (!b) return a;
  return a.updatedAt >= b.updatedAt ? a : b;
}

export function get<T>(key: string): T | undefined {
  // Lazy hydration — if a service reads before main.tsx awaits hydrate(),
  // pull straight from LS so we never serve stale empty state.
  const fromMemory = memory.get(key);
  if (fromMemory) return fromMemory.v as T;
  if (!hydrated) {
    const env = lsGet(key);
    if (env) {
      memory.set(key, env);
      return env.v as T;
    }
  }
  return undefined;
}

export function set<T>(key: string, value: T): void {
  const env: Envelope<T> = { v: value, updatedAt: Date.now() };
  memory.set(key, env as Envelope<unknown>);
  lsSet(key, env as Envelope<unknown>);
  scheduleIdbWrite(key, env as Envelope<unknown>);
}

export function remove(key: string): void {
  memory.delete(key);
  lsDelete(key);
  if (idbAvailable()) {
    void idbDelete(key);
  }
  idbWriteQueue.delete(key);
}

export function snapshot(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, env] of memory) {
    out[key] = env.v;
  }
  return out;
}

export function isHydrated(): boolean {
  return hydrated;
}

// Test-only reset. Production code never calls this.
export function __resetForTests(): void {
  memory.clear();
  idbWriteQueue.clear();
  hydrated = false;
  hydrating = null;
}
