import { useState, useEffect } from 'react';
import { BookOpen, Monitor, Moon, Settings, Sun, Trophy, UserPlus, Zap, Wifi } from 'lucide-react';
import { motion } from 'motion/react';
import { KipAvatar } from './kip';
import { useKipStore } from '../hooks/useKipStore';
import AccountPill from './auth/AccountPill';

export type AppMode = 'home' | 'live' | 'learn' | 'level-up' | 'offline-coach' | 'settings';

type ThemePref = 'light' | 'dark' | 'auto';

interface HeaderProps {
  onReset: () => void;
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onOpenAccount?: () => void;
}

const MODES = [
  { id: 'live' as const, icon: Zap, label: 'Live Call', shortLabel: 'Live' },
  { id: 'learn' as const, icon: BookOpen, label: 'Learn', shortLabel: 'Learn' },
  { id: 'level-up' as const, icon: Trophy, label: 'Level Up', shortLabel: 'Level Up' },
  { id: 'offline-coach' as const, icon: Wifi, label: 'Offline Coach', shortLabel: 'Offline' },
  { id: 'settings' as const, icon: Settings, label: 'Settings', shortLabel: 'Settings' },
] as const;

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', dark);
}

function getSystemDark() {
  return matchMedia('(prefers-color-scheme:dark)').matches;
}

export default function Header({ onReset, mode, onModeChange, onOpenAccount }: HeaderProps) {
  const [pref, setPref] = useState<ThemePref>(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  });
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (pref !== 'auto') return;
    const mq = matchMedia('(prefers-color-scheme:dark)');
    const handler = (e: MediaQueryListEvent) => {
      applyTheme(e.matches);
      setIsDark(e.matches);
    };
    // Apply system preference now
    applyTheme(mq.matches);
    setIsDark(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [pref]);

  const cycleTheme = () => {
    const order: ThemePref[] = ['dark', 'light', 'auto'];
    const next = order[(order.indexOf(pref) + 1) % 3];
    setPref(next);
    if (next === 'auto') {
      localStorage.removeItem('theme');
      const sysDark = getSystemDark();
      applyTheme(sysDark);
      setIsDark(sysDark);
    } else {
      localStorage.setItem('theme', next);
      applyTheme(next === 'dark');
      setIsDark(next === 'dark');
    }
  };

  const toggleKip = useKipStore(s => s.toggleKip);

  const handleNewCall = () => {
    onReset();
    if (mode !== 'live') onModeChange('live');
  };

  return (
    <header
      className="glass-header sticky top-0 z-20 px-3 pb-2 sm:px-4 sm:pb-4 md:px-6"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.35rem)' }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-2 2xl:max-w-6xl">
        <div className="glass-capsule flex items-center gap-2 rounded-[1.8rem] px-2.5 py-2 sm:rounded-[2rem] sm:gap-3 sm:px-4 sm:py-3">
          <motion.button
            layout
            type="button"
            onClick={() => onModeChange('home')}
            aria-label="Go to home screen"
            className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-[1.35rem] p-1 text-left transition-transform hover:scale-[1.005] active:scale-[0.995] sm:gap-3 sm:p-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] glass-control sm:h-14 sm:w-14 sm:rounded-[1.35rem]">
              <img
                src="/tmo-logo-v4.svg"
                alt="T-Mobile logo"
                className="h-6 w-6 sm:h-9 sm:w-9"
              />
            </span>

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5 md:h-10 md:w-10" onClick={(e) => { e.stopPropagation(); toggleKip(); }}>
              <KipAvatar size="small" state="idle" showOnlineStatus />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-[15px] font-extrabold tracking-tight text-foreground sm:text-xl md:text-2xl">
                  CustomerConnect AI
                </h1>
                <span className="type-micro hidden whitespace-nowrap rounded-full bg-surface-elevated/80 px-2 py-0.5 text-t-dark-gray min-[430px]:inline-flex sm:glass-control sm:px-2.5 sm:py-1 sm:text-t-magenta">
                  Demo Ready
                </span>
              </div>
              <p className="mt-1 hidden text-xs font-semibold text-t-dark-gray sm:block sm:text-sm">
                T-Mobile virtual retail call coaching
              </p>
            </div>
          </motion.button>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {onOpenAccount && <AccountPill onClick={onOpenAccount} />}
            <button
              type="button"
              onClick={cycleTheme}
              aria-label={pref === 'auto' ? 'Theme: auto (follows system)' : pref === 'dark' ? 'Theme: dark' : 'Theme: light'}
              title={pref === 'auto' ? 'Auto' : pref === 'dark' ? 'Dark' : 'Light'}
              className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full glass-control text-t-dark-gray transition-colors hover:text-t-magenta sm:h-12 sm:w-12"
            >
              {pref === 'auto' ? <Monitor className="h-4 w-4" /> : isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={handleNewCall}
              aria-label="Start a new call"
              className="focus-ring cta-primary inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.01] active:scale-95 sm:min-h-[48px] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-xs"
              style={{ touchAction: 'manipulation' }}
            >
              <UserPlus className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden min-[390px]:inline">Fresh Call</span>
              <span className="min-[390px]:hidden">Fresh</span>
            </button>
          </div>
        </div>

        {mode !== 'home' && (
          <nav
            aria-label="App mode"
            role="tablist"
            className="glass-capsule rounded-[1.45rem] p-1.5 sm:rounded-full"
          >
            <div className="-mx-1 mobile-rail px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-1.5 sm:overflow-visible sm:px-0 sm:pb-0">
              {MODES.map((item) => {
                const isActive = mode === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mode-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`mode-panel-${item.id}`}
                    onClick={() => onModeChange(item.id)}
                    className={`focus-ring rail-snap-start relative min-h-[48px] min-w-[120px] overflow-hidden rounded-full px-2.5 py-2.5 text-left transition-transform active:scale-[0.985] sm:min-h-[54px] sm:min-w-0 sm:px-3 sm:py-3 ${
                      isActive
                        ? 'glass-control-active text-white'
                        : 'glass-control text-t-dark-gray hover:text-foreground'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                    >
                    {isActive && (
                      <motion.span
                        layoutId="mode-pill"
                        className="absolute inset-0 rounded-full bg-t-magenta"
                        transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                      />
                    )}
                    <span className="relative z-[1] flex h-full items-center justify-center gap-2">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex min-w-0 flex-col items-start justify-center leading-none sm:items-center">
                        <span className="min-w-0 truncate text-[11px] font-black uppercase tracking-[0.16em] sm:hidden">
                          {item.shortLabel}
                        </span>
                        <span className="hidden min-w-0 truncate text-xs font-black uppercase tracking-[0.16em] sm:inline">
                          {item.label}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
