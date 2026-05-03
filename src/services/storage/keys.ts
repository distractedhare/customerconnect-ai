// Centralized registry of every key we persist.
//
// `REP_GAMEPLAY_KEYS` is the source of truth for "wipe on sign-out
// with erase-data". New rep-state keys MUST register here or they will
// leak across sign-outs. CI lint can grep for `kvSet('` outside of
// this list to enforce.
//
// `PROFILE_KEY` is intentionally separate so signOut can clear the
// identity layer independent of gameplay state.

export const PROFILE_KEY = 'cc-profile-v1';

export const REP_GAMEPLAY_KEYS = [
  'bingo-progress-v2',
  'bingo-streak-v2',
  'prize-tracker-v1',
  'cc-leaderboard-v1',
  'team-config-v1',
  'tlife_runner_save_v3',
] as const;

export type RepGameplayKey = (typeof REP_GAMEPLAY_KEYS)[number];

// All keys we know about, used by migrations + future tooling.
export const ALL_KNOWN_KEYS = [...REP_GAMEPLAY_KEYS, PROFILE_KEY] as const;
