// Append-only schema-migration registry.
//
// Every storable shape declares a current schema version. When we hydrate
// at boot, we walk each known key, read its `schemaVersion`, and lift the
// shape forward through registered migrators until it matches `current`.
//
// Hard rules (enforced by lint script + code review):
//  - Migrators are append-only. Field removal requires a 2-release
//    `@deprecated` cycle.
//  - Every migrator gets a captured-fixture regression test before merge.
//  - A migrator must not throw — on bad input, return the input unchanged.

interface MigrationEntry {
  key: string;
  current: number;
  // Map from `from` version to a function that returns the `from + 1` shape.
  steps: Record<number, (input: any) => any>;
}

const REGISTRY: MigrationEntry[] = [];

export function registerMigration(entry: MigrationEntry): void {
  REGISTRY.push(entry);
}

interface Envelope<T> {
  v: T;
  updatedAt: number;
}

export function runMigrations(memory: Map<string, Envelope<unknown>>): string[] {
  const migratedKeys: string[] = [];
  for (const entry of REGISTRY) {
    const env = memory.get(entry.key);
    if (!env) continue;
    const migrated = liftShape(env.v, entry);
    if (migrated !== env.v) {
      memory.set(entry.key, { v: migrated, updatedAt: Date.now() });
      migratedKeys.push(entry.key);
    }
  }
  return migratedKeys;
}

function liftShape(value: unknown, entry: MigrationEntry): unknown {
  if (!value || typeof value !== 'object') return value;

  let current = value as { schemaVersion?: number };
  let safety = 16;

  // Legacy payloads predate schemaVersion. Treat undefined as v0 so the
  // first registered step (steps[0]) can stamp them up to v1.
  while ((current.schemaVersion ?? 0) < entry.current && safety-- > 0) {
    const from = current.schemaVersion ?? 0;
    const step = entry.steps[from];
    if (!step) break;
    try {
      const next = step(current) as { schemaVersion?: number };
      // Each step MUST advance the version. If a buggy migrator returns
      // something at-or-before `from`, stop walking instead of looping
      // until `safety` runs out — fail fast preserves the rep's data.
      if (!next || typeof next !== 'object' || (next.schemaVersion ?? 0) <= from) {
        break;
      }
      current = next;
    } catch {
      // Migrator threw — stop walking and return what we have so the rep
      // doesn't lose data over a code bug.
      break;
    }
  }
  return current;
}

// ─────────────────────────────────────────────────────────────────────────────
// Initial registrations.
//
// Every migrated key starts at v1 with the shape we ship today. The first
// migrator is a no-op that just stamps `schemaVersion: 1` onto legacy
// payloads that don't have it, so future bumps have a stable starting point.
// ─────────────────────────────────────────────────────────────────────────────

function stampV1(value: any): any {
  if (!value || typeof value !== 'object') return value;
  if (value.schemaVersion !== undefined) return value;
  return { ...value, schemaVersion: 1 };
}

registerMigration({
  key: 'bingo-progress-v2',
  current: 1,
  steps: { 0: stampV1 },
});

registerMigration({
  key: 'bingo-streak-v2',
  current: 1,
  steps: { 0: stampV1 },
});

registerMigration({
  key: 'prize-tracker-v1',
  current: 1,
  steps: { 0: stampV1 },
});

registerMigration({
  key: 'cc-leaderboard-v1',
  current: 1,
  steps: { 0: stampV1 },
});

registerMigration({
  key: 'team-config-v1',
  current: 1,
  steps: { 0: stampV1 },
});

registerMigration({
  key: 'tlife_runner_save_v3',
  current: 1,
  steps: { 0: stampV1 },
});

registerMigration({
  key: 'cc-profile-v1',
  current: 1,
  steps: { 0: stampV1 },
});
