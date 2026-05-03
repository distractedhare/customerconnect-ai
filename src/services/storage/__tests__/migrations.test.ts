import { describe, expect, it } from 'vitest';
import { runMigrations } from '../migrations';

describe('migrations', () => {
  it('stamps schemaVersion: 1 onto legacy payloads that lack it', () => {
    const memory = new Map<string, { v: unknown; updatedAt: number }>();
    memory.set('bingo-progress-v2', {
      v: { completedCellIds: ['free-space'] },
      updatedAt: 100,
    });
    runMigrations(memory);
    const after = memory.get('bingo-progress-v2')!.v as { schemaVersion: number };
    expect(after.schemaVersion).toBe(1);
  });

  it('preserves existing fields untouched', () => {
    const memory = new Map<string, { v: unknown; updatedAt: number }>();
    memory.set('prize-tracker-v1', {
      v: {
        daily: { date: '2026-04-30', cellsCompleted: 3 },
        weekly: { weekStart: '2026-04-27', totalRows: 0 },
        monthly: { month: '2026-04', longestStreak: 4 },
        history: [{ date: '2026-04-30', tier: 'daily', label: 'Momentum' }],
      },
      updatedAt: 100,
    });
    runMigrations(memory);
    const after = memory.get('prize-tracker-v1')!.v as {
      daily: { cellsCompleted: number };
      monthly: { longestStreak: number };
      history: unknown[];
    };
    expect(after.daily.cellsCompleted).toBe(3);
    expect(after.monthly.longestStreak).toBe(4);
    expect(after.history).toHaveLength(1);
  });

  it('leaves an already-current payload untouched', () => {
    const memory = new Map<string, { v: unknown; updatedAt: number }>();
    memory.set('cc-profile-v1', {
      v: { schemaVersion: 1, handle: 'bsharp' },
      updatedAt: 100,
    });
    const before = memory.get('cc-profile-v1');
    runMigrations(memory);
    const after = memory.get('cc-profile-v1');
    expect(after).toBe(before);
  });

  it('ignores keys that have no registered migration', () => {
    const memory = new Map<string, { v: unknown; updatedAt: number }>();
    memory.set('totally-unrelated', { v: { x: 1 }, updatedAt: 100 });
    runMigrations(memory);
    expect(memory.get('totally-unrelated')!.v).toEqual({ x: 1 });
  });

  it('returns the list of keys that were actually mutated', () => {
    const memory = new Map<string, { v: unknown; updatedAt: number }>();
    memory.set('bingo-progress-v2', { v: { completedCellIds: [] }, updatedAt: 100 });
    memory.set('cc-profile-v1', { v: { schemaVersion: 1, handle: 'bsharp' }, updatedAt: 100 });
    memory.set('totally-unrelated', { v: { x: 1 }, updatedAt: 100 });
    const mutated = runMigrations(memory);
    expect(mutated).toEqual(['bingo-progress-v2']);
  });

  it('returns an empty list when nothing needed migrating', () => {
    const memory = new Map<string, { v: unknown; updatedAt: number }>();
    memory.set('cc-profile-v1', { v: { schemaVersion: 1, handle: 'bsharp' }, updatedAt: 100 });
    expect(runMigrations(memory)).toEqual([]);
  });
});
