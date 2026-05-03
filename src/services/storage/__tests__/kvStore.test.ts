import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { __resetForTests, get, hydrate, isHydrated, remove, set, snapshot } from '../kvStore';

describe('kvStore', () => {
  beforeEach(() => {
    __resetForTests();
    localStorage.clear();
  });

  afterEach(() => {
    __resetForTests();
    localStorage.clear();
  });

  it('synchronous read after write returns the same value', async () => {
    await hydrate();
    set('test:key', { hello: 'world' });
    expect(get<{ hello: string }>('test:key')).toEqual({ hello: 'world' });
  });

  it('writes a localStorage write-ahead log synchronously', async () => {
    await hydrate();
    set('test:wal', { count: 7 });
    const raw = localStorage.getItem('test:wal');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.v).toEqual({ count: 7 });
    expect(typeof parsed.updatedAt).toBe('number');
  });

  it('lazy reads from localStorage before hydrate completes', () => {
    localStorage.setItem(
      'test:legacy',
      JSON.stringify({ v: { score: 42 }, updatedAt: Date.now() }),
    );
    expect(isHydrated()).toBe(false);
    expect(get<{ score: number }>('test:legacy')).toEqual({ score: 42 });
  });

  it('treats unwrapped legacy localStorage payloads as oldest data', () => {
    localStorage.setItem('test:legacy-raw', JSON.stringify({ initials: 'BJS' }));
    expect(get<{ initials: string }>('test:legacy-raw')).toEqual({ initials: 'BJS' });
  });

  it('remove clears every layer', async () => {
    await hydrate();
    set('test:nuke', { yes: true });
    remove('test:nuke');
    expect(get('test:nuke')).toBeUndefined();
    expect(localStorage.getItem('test:nuke')).toBeNull();
  });

  it('snapshot exposes every memory key', async () => {
    await hydrate();
    set('a', 1);
    set('b', 2);
    const snap = snapshot();
    expect(snap.a).toBe(1);
    expect(snap.b).toBe(2);
  });

  it('hydration is idempotent', async () => {
    await hydrate();
    expect(isHydrated()).toBe(true);
    await hydrate();
    expect(isHydrated()).toBe(true);
  });

  it('persists migrated state to localStorage during hydrate', async () => {
    // Seed a legacy (unstamped) bingo payload — migrator should stamp
    // schemaVersion: 1 and write it back so the migration doesn't
    // re-run on every boot.
    const legacy = { v: { completedCellIds: ['free-space'] }, updatedAt: 50 };
    localStorage.setItem('bingo-progress-v2', JSON.stringify(legacy));

    __resetForTests();
    await hydrate();

    const raw = localStorage.getItem('bingo-progress-v2');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.v.schemaVersion).toBe(1);
  });

  it('rejects malformed envelopes (non-numeric updatedAt) by treating them as raw legacy values', () => {
    localStorage.setItem(
      'test:malformed',
      JSON.stringify({ v: { hello: 'world' }, updatedAt: 'not-a-number' }),
    );
    // The whole object becomes the legacy payload — no crash, value
    // wraps with updatedAt: 0 (oldest), so any well-formed envelope
    // will outrank it.
    const value = get<{ v: unknown; updatedAt: string }>('test:malformed');
    expect(value).toEqual({ v: { hello: 'world' }, updatedAt: 'not-a-number' });
  });
});
