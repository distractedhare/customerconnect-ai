import { describe, expect, it } from 'vitest';
import { decodeRepToken, encodeRepToken, REP_TOKEN_PREFIX, type RepTokenSnapshot } from '../repToken';

const SAMPLE: RepTokenSnapshot = {
  profile: {
    handle: 'bsharp',
    tabCode: 'MERIDIAN',
    teamId: 'meridian-2',
    accessLevel: 'rep',
    mascotId: 'rocket',
    initials: 'BJS',
  },
  bingoProgress: { completedCellIds: ['free-space', 'cell-1'] },
  bingoStreak: { count: 5, best: 7, lastDate: '2026-04-30' },
  prize: null,
  runner: null,
  leaderboard: [],
  exportedAt: '2026-05-01T12:34:56.000Z',
};

describe('repToken codec', () => {
  it('round-trips a snapshot', () => {
    const token = encodeRepToken(SAMPLE);
    expect(token.startsWith(REP_TOKEN_PREFIX)).toBe(true);
    const decoded = decodeRepToken(token);
    expect(decoded.ok).toBe(true);
    if (!decoded.ok) return;
    expect(decoded.snapshot.profile.handle).toBe('bsharp');
    expect(decoded.snapshot.bingoProgress).toEqual(SAMPLE.bingoProgress);
    expect(decoded.snapshot.exportedAt).toBe(SAMPLE.exportedAt);
  });

  it('rejects junk input as format error', () => {
    expect(decodeRepToken('').ok).toBe(false);
    expect(decodeRepToken('   ').ok).toBe(false);
    const result = decodeRepToken('REP1-not-base64-!');
    expect(result.ok).toBe(false);
  });

  it('rejects a payload with a future schema version', () => {
    const future = { v: 99, p: SAMPLE.profile, t: SAMPLE.exportedAt };
    const utf8 = unescape(encodeURIComponent(JSON.stringify(future)));
    const b64 = btoa(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const result = decodeRepToken(`REP1-${b64}`);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('version');
    }
  });

  it('accepts tokens passed without the REP1- prefix', () => {
    const token = encodeRepToken(SAMPLE).slice(REP_TOKEN_PREFIX.length);
    const decoded = decodeRepToken(token);
    expect(decoded.ok).toBe(true);
  });
});
