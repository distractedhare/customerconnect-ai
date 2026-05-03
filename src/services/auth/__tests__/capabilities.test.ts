import { describe, expect, it } from 'vitest';
import {
  ACCESS_LEVELS,
  canRep,
  type AccessLevel,
  type Capability,
} from '../capabilities';

const EXPECTED: Record<AccessLevel, Capability[]> = {
  rep: ['submitForm'],
  rep_assistant: ['submitForm', 'postPushes'],
  manager: ['submitForm', 'editTeamConfig', 'postPushes'],
  manager_assistant: [
    'submitForm',
    'editTeamConfig',
    'postPushes',
    'promoteWithinTeam',
  ],
  site_director: [
    'submitForm',
    'editTeamConfig',
    'postPushes',
    'promoteWithinTeam',
    'promoteAcrossTab',
  ],
};

const ALL_CAPS: Capability[] = [
  'submitForm',
  'editTeamConfig',
  'postPushes',
  'promoteWithinTeam',
  'promoteAcrossTab',
];

describe('canRep capability matrix', () => {
  it('anonymous (null) gets nothing', () => {
    for (const cap of ALL_CAPS) {
      expect(canRep(null, cap)).toBe(false);
      expect(canRep(undefined, cap)).toBe(false);
    }
  });

  for (const level of ACCESS_LEVELS) {
    it(`${level} matches the expected matrix`, () => {
      const granted = new Set(EXPECTED[level]);
      for (const cap of ALL_CAPS) {
        expect(canRep(level, cap)).toBe(granted.has(cap));
      }
    });
  }

  it('site_director can promote across TAB', () => {
    expect(canRep('site_director', 'promoteAcrossTab')).toBe(true);
    expect(canRep('manager_assistant', 'promoteAcrossTab')).toBe(false);
  });
});
