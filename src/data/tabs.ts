// Static TAB + team registry. TAB = "team in a box" (T-Mobile site grouping).
// v1 ships with Meridian + 3 placeholder teams; managers rename via
// TeamConfig once Phase 3 ships. Adding a new TAB or team is a code change.

import type { MascotId } from '../services/teamConfigService';

export interface TeamSpec {
  id: string;
  defaultName: string;
  defaultMascotId: MascotId;
}

export interface TabSpec {
  code: string;
  displayName: string;
  teams: TeamSpec[];
}

export const TABS: TabSpec[] = [
  {
    code: 'MERIDIAN',
    displayName: 'Meridian',
    teams: [
      { id: 'meridian-1', defaultName: 'Team 1', defaultMascotId: 'rocket' },
      { id: 'meridian-2', defaultName: 'Team 2', defaultMascotId: 'fire' },
      { id: 'meridian-3', defaultName: 'Team 3', defaultMascotId: 'lion' },
    ],
  },
];

export function findTab(code: string): TabSpec | undefined {
  return TABS.find((t) => t.code === code);
}

export function findTeam(tabCode: string, teamId: string): TeamSpec | undefined {
  return findTab(tabCode)?.teams.find((t) => t.id === teamId);
}

export function defaultTabCode(): string {
  return TABS[0].code;
}

export function defaultTeamId(tabCode: string): string {
  return findTab(tabCode)?.teams[0].id ?? 'meridian-1';
}
