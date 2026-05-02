/**
 * HomeScreen — the landing page for CustomerConnect AI.
 *
 * Sales-focused for the first 90 days, but built on a role system
 * so adding tech support, account care, messaging, or loyalty later
 * is just enabling a role in config/roles.ts.
 */

import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Zap, BookOpen, Trophy, TrendingUp,
  ChevronRight, Flame, Shield, Sparkles, Wifi,
  type LucideIcon,
} from 'lucide-react';
import { getActiveRole, getEnabledRoles, setActiveRole, RoleConfig } from '../config/roles';
import { WeeklyUpdate } from '../services/weeklyUpdateSchema';
import { AppMode } from './Header';
import { pickKipGreeting } from '../services/kip/kipVoice';
import KipHero from './kip/KipHero';
import { KipAvatar } from './kip';
import { useKipStore } from '../hooks/useKipStore';

interface HomeScreenProps {
  weeklyData: WeeklyUpdate | null;
  onNavigate: (mode: AppMode) => void;
  onReset: () => void;
}

const MODE_ICONS: Partial<Record<AppMode, LucideIcon>> = {
  live: Zap,
  learn: BookOpen,
  'level-up': Trophy,
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function HomeScreen({ weeklyData, onNavigate, onReset }: HomeScreenProps) {
  const [role, setRole] = useState<RoleConfig>(getActiveRole);
  const enabledRoles = getEnabledRoles();
  const showRoleSelector = enabledRoles.length > 1;

  // Kip's daily greeting — stable for the whole shift, fresh tomorrow.
  const [kipGreeting] = useState(() => pickKipGreeting());

  const handleRoleChange = useCallback((roleId: string) => {
    const newRole = enabledRoles.find(r => r.id === roleId);
    if (newRole) {
      setActiveRole(roleId);
      setRole(newRole);
    }
  }, [enabledRoles]);

  // Today's hot — pull from weekly data
  const todaysHot = weeklyData?.weeklyFocus;
  const topTrending = weeklyData?.trending?.slice(0, 2);

  return (
    <div className="mx-auto max-w-2xl space-y-6 2xl:max-w-3xl">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="glass-stage space-y-5 rounded-[2.1rem] p-5 sm:p-6"
      >
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-between">
            <p className="type-kicker text-t-muted">
              {formatDate()}
            </p>
            <span className="type-micro glass-utility rounded-full px-3 py-1 text-t-magenta">
              Rep Home
            </span>
          </div>
          <div>
            <h1
              className="mb-1 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl"
              style={{
                background: 'linear-gradient(135deg, #E20074 0%, #861B54 50%, #E20074 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {getGreeting()} {role.icon}
            </h1>
            <p className="text-sm font-bold text-t-dark-gray sm:text-base">
              {role.greeting}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <KipAvatar size="tiny" state="idle" onClick={() => useKipStore.getState().toggleKip()} />
              <p className="text-xs font-medium text-t-dark-gray italic">
                "Ready up. Let's stack a shift."
              </p>
            </div>
          </div>
        </div>

        <KipHero
          greeting={kipGreeting}
          tagline="I’ll flag the play, hype the wins, and shrug the misses. Let’s stack a shift."
          tone="hype"
          borderless
        />

        {showRoleSelector && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="glass-capsule flex flex-wrap justify-center gap-2 rounded-full p-2 sm:justify-start"
          >
            {enabledRoles.map(r => (
              <button
                key={r.id}
                onClick={() => handleRoleChange(r.id)}
                className={`focus-ring rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all ${
                  role.id === r.id
                    ? 'glass-control-active text-white'
                    : 'glass-control text-t-dark-gray hover:text-foreground'
                }`}
              >
                {r.icon} {r.shortLabel}
              </button>
            ))}
          </motion.div>
        )}

        {todaysHot && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="glass-feature rounded-[1.75rem] p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-t-magenta" />
              <span className="type-kicker text-t-magenta">
                Today's Hot
              </span>
            </div>
            <p className="text-base font-black text-t-dark-gray leading-snug mb-1">
              {todaysHot.headline}
            </p>
            <p className="type-helper text-t-dark-gray">
              {todaysHot.context}
            </p>

            {topTrending && topTrending.length > 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {topTrending.map((item, i) => (
                  <div key={i} className="glass-reading rounded-[1.2rem] px-3 py-3">
                    <div className="flex items-start gap-2.5">
                      <TrendingUp className="w-3 h-3 text-t-magenta mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-snug text-t-dark-gray">{item.buzz}</p>
                        <p className="mt-1 text-[11px] text-t-dark-gray font-medium leading-relaxed">{item.repTip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="space-y-3"
        >
        {(['primary', 'secondary', 'tertiary'] as const).map((tier, i) => {
          const card = role.actionCards[tier];
          const Icon: LucideIcon = MODE_ICONS[card.mode as AppMode] ?? Zap;
          const isPrimary = tier === 'primary';

          return (
            <button
              key={tier}
              type="button"
              onClick={() => {
                if (card.mode === 'live') {
                  onReset();
                }
                onNavigate(card.mode as AppMode);
              }}
              className={`focus-ring w-full text-left rounded-[1.6rem] p-5 transition-all group ${
                isPrimary
                  ? 'cta-primary'
                  : 'glass-reading hover:border-t-magenta/30'
              }`}
            >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-[1rem] flex items-center justify-center shrink-0 ${
                        isPrimary
                          ? 'bg-white/20'
                          : 'glass-magenta'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isPrimary ? 'text-white' : 'text-t-magenta'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-black ${
                          isPrimary ? 'text-white' : 'text-t-dark-gray'
                        }`}
                      >
                        {card.label}
                      </p>
                      <p
                        className={`mt-1 text-sm font-medium leading-relaxed ${
                          isPrimary ? 'text-white/75' : 'text-t-dark-gray'
                        }`}
                      >
                        {card.subtitle}
                      </p>
                      <p className={`mt-1.5 text-[10px] italic font-medium ${isPrimary ? 'text-white/60' : 'text-t-magenta/60'}`}>
                        {card.mode === 'live' ? '“KIP: I’m in here too, ready to scan.”' : '“KIP: Knowledge is power. Let’s look it up.”'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 opacity-40 group-hover:opacity-100 transition-opacity">
                      <KipAvatar size="tiny" state="idle" />
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                        isPrimary ? 'text-white/60' : 'text-t-dark-gray/30'
                      }`}
                    />
                  </div>
                </div>
            </button>
          );
        })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-capsule flex flex-wrap items-center justify-center gap-3 rounded-[1.4rem] px-4 py-2.5"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-t-muted">
            <Shield className="w-3 h-3 text-t-magenta/40" />
            <span>CPNI Safe</span>
          </div>
          <div className="h-3 w-px bg-t-dark-gray/15" />
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-t-muted">
            <KipAvatar size="tiny" state="idle" className="scale-75" onClick={() => useKipStore.getState().toggleKip()} />
            <span>AI Ready</span>
          </div>
          <div className="h-3 w-px bg-t-dark-gray/15" />
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-t-muted">
            <Wifi className="w-3 h-3 text-t-magenta/40" />
            <span>Works Offline</span>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}

function MetricChip({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="glass-reading rounded-[1.2rem] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-t-magenta">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 text-lg font-black tabular-nums text-foreground sm:text-xl">{value}</div>
      <div className="mt-0.5 text-[10px] font-medium text-t-muted">{sub}</div>
    </div>
  );
}
