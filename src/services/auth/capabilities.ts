// Capability matrix for the access-level hierarchy.
//
// TRUST BOUNDARY: client-only. Anyone with devtools can self-promote.
// Acceptable for v1 — the only "asset" gated here is editing team config
// + posting team focus pushes. Tightening requires a backend, which we
// have explicitly chosen not to build.

export type AccessLevel =
  | 'rep'
  | 'rep_assistant'
  | 'manager'
  | 'manager_assistant'
  | 'site_director';

export const ACCESS_LEVELS: AccessLevel[] = [
  'rep',
  'rep_assistant',
  'manager',
  'manager_assistant',
  'site_director',
];

export const ACCESS_LEVEL_LABEL: Record<AccessLevel, string> = {
  rep: 'Rep',
  rep_assistant: 'Rep Assistant',
  manager: 'Manager',
  manager_assistant: 'Manager Assistant',
  site_director: 'Site Director',
};

export type Capability =
  | 'submitForm'        // submit Manager / Feedback form (any logged-in level)
  | 'editTeamConfig'    // edit team name, mascot, focus, goal
  | 'postPushes'        // post a focus update to the team feed
  | 'promoteWithinTeam' // change another rep's accessLevel within the team
  | 'promoteAcrossTab'; // promote across teams in the TAB

const TABLE: Record<AccessLevel, Set<Capability>> = {
  rep: new Set(['submitForm']),
  rep_assistant: new Set(['submitForm', 'postPushes']),
  manager: new Set(['submitForm', 'editTeamConfig', 'postPushes']),
  manager_assistant: new Set([
    'submitForm',
    'editTeamConfig',
    'postPushes',
    'promoteWithinTeam',
  ]),
  site_director: new Set([
    'submitForm',
    'editTeamConfig',
    'postPushes',
    'promoteWithinTeam',
    'promoteAcrossTab',
  ]),
};

export function canRep(
  level: AccessLevel | null | undefined,
  capability: Capability,
): boolean {
  if (!level) return false;
  return TABLE[level]?.has(capability) ?? false;
}
