import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { __resetForTests, get, hydrate } from '../../storage/kvStore';
import {
  PROFILE_KEY,
  getProfile,
  hasProfile,
  signIn,
  signOut,
  signUp,
  updateProfile,
} from '../profileService';

beforeEach(async () => {
  __resetForTests();
  localStorage.clear();
  await hydrate();
});

afterEach(() => {
  __resetForTests();
  localStorage.clear();
});

describe('profileService', () => {
  it('starts with no profile', () => {
    expect(getProfile()).toBeNull();
    expect(hasProfile()).toBe(false);
  });

  it('signUp accepts a valid handle + 6-digit PIN and persists', async () => {
    const result = await signUp({
      handle: 'BSharp',
      pin: '123456',
      tabCode: 'MERIDIAN',
      teamId: 'meridian-1',
      mascotId: 'rocket',
      initials: 'BJS',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.profile.handle).toBe('bsharp');
    expect(result.profile.accessLevel).toBe('rep');
    expect(hasProfile()).toBe(true);

    const stored = get<{ pinHash: string; pinSalt: string }>(PROFILE_KEY);
    expect(stored?.pinHash).toBeTruthy();
    expect(stored?.pinSalt).toBeTruthy();
  });

  it.each([
    'ab',                          // too short
    'has space',                   // disallowed character
    'a'.repeat(25),                // too long
    'with-hyphen',                 // disallowed character
  ])('rejects invalid handle %s', async (handle) => {
    const result = await signUp({
      handle,
      pin: '123456',
      tabCode: 'MERIDIAN',
      teamId: 'meridian-1',
      mascotId: 'rocket',
      initials: 'BJS',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('handle');
  });

  it('rejects a non-6-digit PIN', async () => {
    const result = await signUp({
      handle: 'bsharp',
      pin: '12345',
      tabCode: 'MERIDIAN',
      teamId: 'meridian-1',
      mascotId: 'rocket',
      initials: 'BJS',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('pin');
  });

  it('signIn validates PIN and lifts lastSeenAt', async () => {
    await signUp({
      handle: 'bsharp',
      pin: '654321',
      tabCode: 'MERIDIAN',
      teamId: 'meridian-1',
      mascotId: 'rocket',
      initials: 'BJS',
    });

    const wrong = await signIn('bsharp', '000000');
    expect(wrong.ok).toBe(false);
    if (!wrong.ok) {
      expect(wrong.error).toBe('pin');
    }

    const right = await signIn('bsharp', '654321');
    expect(right.ok).toBe(true);
  });

  it('signIn fails cleanly when no profile exists', async () => {
    const result = await signIn('nobody', '000000');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('no-profile');
    }
  });

  it('updateProfile changes mascot and team', async () => {
    await signUp({
      handle: 'bsharp',
      pin: '111111',
      tabCode: 'MERIDIAN',
      teamId: 'meridian-1',
      mascotId: 'rocket',
      initials: 'BJS',
    });
    const next = updateProfile({ mascotId: 'lion', teamId: 'meridian-2' });
    expect(next?.mascotId).toBe('lion');
    expect(next?.teamId).toBe('meridian-2');
  });

  it('signOut without erasure leaves rep state intact', async () => {
    await signUp({
      handle: 'bsharp',
      pin: '111111',
      tabCode: 'MERIDIAN',
      teamId: 'meridian-1',
      mascotId: 'rocket',
      initials: 'BJS',
    });
    signOut(false);
    expect(getProfile()).toBeNull();
  });
});
