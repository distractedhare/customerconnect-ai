/**
 * Role configuration system.
 *
 * For the first 90 days this app is sales-only. But the architecture
 * supports adding departments (tech support, account care, messaging,
 * loyalty) by simply adding a RoleConfig object here. The HomeScreen,
 * data layer, and routing all key off the active role.
 */

export interface RoleConfig {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;          // emoji — keeps it simple, no extra icon deps
  color: string;         // tailwind-compatible accent
  greeting: string;      // home screen welcome line
  actionCards: {
    primary: { label: string; subtitle: string; mode: string };
    secondary: { label: string; subtitle: string; mode: string };
    tertiary: { label: string; subtitle: string; mode: string };
  };
  /** Future: per-role data overrides, feature flags, etc. */
  features?: string[];
  enabled: boolean;
}

export const ROLES: RoleConfig[] = [
  {
    id: 'sales',
    label: 'Sales',
    shortLabel: 'Sales',
    description: 'Retail & telesales reps',
    icon: '🔥',
    color: '#E20074',
    greeting: 'Let\'s close some deals today.',
    actionCards: {
      primary:   { label: 'Start a Call',       subtitle: 'Live plays, openers & game plans', mode: 'live' },
      secondary: { label: 'Look It Up',         subtitle: 'Plans, devices, promos & intel',   mode: 'learn' },
      tertiary:  { label: 'Sharpen Your Game',  subtitle: 'Drills, scenarios & coaching',     mode: 'level-up' },
    },
    features: ['instant-plays', 'objection-handler', 'game-plan', 'ecosystem-matrix'],
    enabled: true,
  },
  // ── Future departments ──────────────────────────────────────
  // Uncomment and customize when ready to roll out.
  //
  // {
  //   id: 'tech-support',
  //   label: 'Tech Support',
  //   shortLabel: 'Tech',
  //   description: 'Device & network troubleshooting',
  //   icon: '🔧',
  //   color: '#00A6ED',
  //   greeting: 'Ready to fix things.',
  //   actionCards: {
  //     primary:   { label: 'Start a Ticket',     subtitle: 'Guided troubleshooting flows',     mode: 'live' },
  //     secondary: { label: 'Knowledge Base',      subtitle: 'Device guides & known issues',     mode: 'learn' },
  //     tertiary:  { label: 'Level Up',            subtitle: 'Training scenarios & quizzes',     mode: 'level-up' },
  //   },
  //   features: ['troubleshooting', 'device-guides'],
  //   enabled: false,
  // },
  // {
  //   id: 'account-care',
  //   label: 'Account Care',
  //   shortLabel: 'Care',
  //   description: 'Billing, account changes & retention',
  //   icon: '💜',
  //   color: '#9B59B6',
  //   greeting: 'Taking care of customers, one call at a time.',
  //   actionCards: {
  //     primary:   { label: 'Start a Call',        subtitle: 'Account flows & save offers',      mode: 'live' },
  //     secondary: { label: 'Policy Lookup',       subtitle: 'Billing rules & procedures',       mode: 'learn' },
  //     tertiary:  { label: 'Skill Builder',       subtitle: 'De-escalation & retention drills', mode: 'level-up' },
  //   },
  //   features: ['retention', 'billing-flows'],
  //   enabled: false,
  // },
];

/** Get the active role. Falls back to sales if stored role not found. */
export function getActiveRole(): RoleConfig {
  let storedId = 'sales';
  try {
    storedId = localStorage.getItem('cc-role') || 'sales';
  } catch {
    // localStorage unavailable — default to sales
  }
  return ROLES.find(r => r.id === storedId && r.enabled) || ROLES[0];
}

/** Save the active role. */
export function setActiveRole(roleId: string): void {
  try {
    localStorage.setItem('cc-role', roleId);
  } catch {
    // localStorage unavailable — role will reset next session
  }
}

/** Get all enabled roles (for role selector when multiple are live). */
export function getEnabledRoles(): RoleConfig[] {
  return ROLES.filter(r => r.enabled);
}
