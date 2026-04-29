/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, startTransition, useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, ShieldCheck, Sparkles, AlertCircle, XCircle, Calendar, ArrowUp, CheckCircle2, Package, Wrench, UserCircle, RefreshCw, Wifi, WifiOff, SlidersHorizontal, Play } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SalesContext, SalesScript, ObjectionAnalysis } from './types';
import { loadWeeklyUpdate, generateScript, analyzeObjectionLocal, WeeklyUpdateSource } from './services/localGenerationService';
import {
  generateObjectionEnhancement,
  generateScriptEnhancement,
  mergeObjectionEnhancement,
  mergeScriptEnhancement,
  warmAIEnhancement,
} from './services/aiEnhancementService';
import { WeeklyUpdate } from './services/weeklyUpdateSchema';
import { EcosystemMatrix } from './types/ecosystem';
import { loadEcosystemMatrix } from './services/ecosystemService';
import { resetRotation } from './services/rotationService';
import { getSessionStats, trackIntentUsed, trackObjectionAnalyzed, trackPlanGenerated } from './services/sessionTracker';
import { DEMO_SCENARIOS, DemoScenario } from './constants/demoScenarios';
import { isAbortError } from './services/networkUtils';
import { AppMode } from './components/Header';
import { useSalesStore } from './store/useSalesStore';

import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import HomeScreen from './components/HomeScreen';
const GuidedContextFlow = lazy(() => import('./components/GuidedContextFlow'));
import type { GuidedFlowStep } from './components/GuidedContextFlow';
const LiveRefinePanel = lazy(() => import('./components/LiveRefinePanel'));
const LivePlanResults = lazy(() => import('./components/LivePlanResults'));
const ObjectionTab = lazy(() => import('./components/ObjectionTab'));
const ObjectionResults = lazy(() => import('./components/ObjectionTab').then(m => ({ default: m.ObjectionResults })));
import PwaUpdater from './components/PwaUpdater';
import { refreshPwaApp } from './services/pwaRefreshService';
import { getSupportFocusLabel } from './constants/supportFocus';

const loadOfflineCoach = () => import('./components/OfflineCoach');
const loadSettingsView = () => import('./components/SettingsView');

const LearnView = lazy(() => import('./components/learn/LearnView'));
const LevelUpView = lazy(() => import('./components/levelup/LevelUpView'));
const OfflineCoach = lazy(loadOfflineCoach);
const SettingsView = lazy(loadSettingsView);
import type { SettingsTab } from './components/SettingsView';
import TroubleshootingPivot from './components/TroubleshootingPivot';
import OrderSupportPanel from './components/OrderSupportPanel';
import AccountSupportPanel from './components/AccountSupportPanel';

function LazySectionFallback({ label }: { label: string }) {
  return (
    <div className="glass-stage-quiet rounded-xl p-5 shadow-md">
      <div className="animate-pulse space-y-3">
        <div className="h-3 w-28 rounded-full bg-t-light-gray" />
        <div className="h-8 w-48 rounded-lg bg-t-light-gray/80" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-28 rounded-xl bg-t-light-gray/70" />
          <div className="h-28 rounded-xl bg-t-light-gray/70" />
        </div>
      </div>
      <p className="type-kicker mt-4 text-t-dark-gray">
        Loading {label}
      </p>
    </div>
  );
}

function TabErrorFallback({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="glass-feature rounded-xl p-5 shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-t-magenta/10">
          <XCircle className="h-5 w-5 text-t-magenta" />
        </div>
        <div className="flex-1">
          <p className="type-kicker text-t-magenta">{title}</p>
          <p className="mt-1 text-sm font-medium leading-relaxed text-t-dark-gray">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="focus-ring cta-primary mt-4 inline-flex min-h-[44px] items-center rounded-xl px-4 py-2.5 text-sm font-black tracking-tight text-white transition-transform hover:scale-[1.01] active:scale-95"
            style={{ touchAction: 'manipulation' }}
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function logDevWarning(message: string, error?: unknown): void {
  if (import.meta.env.DEV) {
    console.warn(message, error);
  }
}

function isPastValidUntil(dateString?: string): boolean {
  if (!dateString) return true;

  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return true;

  const localEndOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  return localEndOfDay.getTime() < Date.now();
}

function StatusPill({
  label,
  value,
  tone,
  onClick,
  actionLabel,
  ariaLabel,
}: {
  label: string;
  value: string;
  tone: 'warning' | 'success' | 'magenta' | 'neutral';
  onClick?: () => void;
  actionLabel?: string;
  ariaLabel?: string;
}) {
  const toneClass = {
    warning: 'glass-reading text-t-dark-gray',
    success: 'glass-reading text-t-dark-gray',
    magenta: 'glass-feature text-t-magenta',
    neutral: 'glass-reading text-t-dark-gray',
  }[tone];
  const content = (
    <>
      <p className="type-micro">{label}</p>
      <p className="mt-0.5 text-xs font-semibold leading-none">{value}</p>
      {actionLabel ? (
        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
          {actionLabel}
        </p>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? `${label}: ${value}`}
        className={`focus-ring rounded-full px-3 py-2 text-left transition-transform hover:scale-[1.01] active:scale-[0.985] ${toneClass}`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`rounded-full px-3 py-2 ${toneClass}`}>
      {content}
    </div>
  );
}

const INTENT_LABELS: Record<SalesContext['purchaseIntent'], string> = {
  exploring: 'Exploring',
  'ready to buy': 'Ready to Buy',
  'upgrade / add a line': 'Upgrade',
  'order support': 'Order Support',
  'tech support': 'Tech Support',
  'account support': 'Account Support',
};

function getLocationSummary(context: SalesContext): string {
  if (context.region !== 'Not Specified') {
    return `${context.region}${context.state ? ` / ${context.state}` : ''}${context.zipCode ? ` / ${context.zipCode}` : ''}`;
  }

  return context.zipCode ? `ZIP ${context.zipCode}` : 'No location';
}

function getHintSummary(context: SalesContext): string {
  if (context.hintAvailable === true) return 'HINT available';
  if (context.hintAvailable === false) return 'HINT full';
  return 'HINT not checked';
}

function getLiveContextChips(context: SalesContext): Array<{ label: string; value: string }> {
  const supportLabel = getSupportFocusLabel(context.supportFocus);

  return [
    { label: 'Intent', value: INTENT_LABELS[context.purchaseIntent] },
    supportLabel ? { label: 'Focus', value: supportLabel } : null,
    { label: 'Product', value: context.product.join(', ') },
    { label: 'HINT', value: getHintSummary(context) },
    { label: 'Location', value: getLocationSummary(context) },
    context.age !== 'Not Specified' ? { label: 'Age', value: context.age } : null,
    context.currentCarrier && context.currentCarrier !== 'Not Specified' ? { label: 'Carrier', value: context.currentCarrier } : null,
    context.totalLines ? { label: 'Lines', value: `${context.totalLines}` } : null,
    context.desiredPlatform && context.desiredPlatform !== 'Not Specified' ? { label: 'Platform', value: context.desiredPlatform } : null,
  ].filter((chip): chip is { label: string; value: string } => Boolean(chip));
}

function getTroubleshootingCategory(context: SalesContext): SalesContext['product'][number] {
  if (context.supportFocus === 'tech_internet_issue') return 'Home Internet';
  if (context.supportFocus === 'tech_device_issue' || context.supportFocus === 'tech_signal_issue') return 'Phone';
  return context.product[0] === 'No Specific Product' ? 'Phone' : context.product[0];
}

export default function App() {
  const {
    context,
    setContext,
    script,
    loading,
    error,
    selectedObjections,
    setSelectedObjections,
    objectionResult,
    setObjectionResult,
    analyzing,
    selectedGamePlanItems,
    weeklyData,
    weeklyLoaded,
    weeklySource,
    handleGenerate,
    handleAnalyzeObjection,
    reset: storeReset,
    cancelInFlightRequests,
    refreshWeeklyData
  } = useSalesStore();

  const [activeTab, setActiveTab] = useState<'gameplan' | 'objections' | 'troubleshoot'>('gameplan');
  const [mode, setMode] = useState<AppMode>('home');
  const [settingsSection, setSettingsSection] = useState<SettingsTab>('team');
  const [refineOpen, setRefineOpen] = useState(false);
  const [guidedFlowStep, setGuidedFlowStep] = useState<GuidedFlowStep>('intent');
  const [, setSessionStats] = useState(() => getSessionStats());
  const [lastDemoScenarioName, setLastDemoScenarioName] = useState<string | null>(null);
  const [refreshingApp, setRefreshingApp] = useState(false);
  const [showHintPrompt, setShowHintPrompt] = useState(false);
  const [levelUpImmersive, setLevelUpImmersive] = useState(false);

  // Scroll-to-top visibility
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const initialScrollReset = window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 0);
    return () => window.clearTimeout(initialScrollReset);
  }, []);

  useEffect(() => {
    const preloadSettings = window.setTimeout(() => {
      void loadSettingsView();
    }, 1200);
    return () => window.clearTimeout(preloadSettings);
  }, []);

  const refreshSessionStats = useCallback(() => {
    try {
      setSessionStats(getSessionStats());
    } catch (err) {
      logDevWarning('Session stats could not be refreshed.', err);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    useSalesStore.getState().refreshWeeklyData(controller.signal).catch((error) => {
      if (!isAbortError(error)) {
        logDevWarning('Weekly update warm-up failed, falling back to local placeholder data.', error);
      }
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void warmAIEnhancement({ signal: controller.signal }).catch((error) => {
      if (!isAbortError(error)) {
        logDevWarning('AI enhancement warm-up failed, but the live experience is still available.', error);
      }
    });
    return () => controller.abort();
  }, []);

  // Ecosystem matrix state
  const [ecosystemMatrix, setEcosystemMatrix] = useState<EcosystemMatrix | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void loadEcosystemMatrix({ signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted && data) {
          setEcosystemMatrix(data);
        }
      })
      .catch((error) => {
        if (!isAbortError(error)) {
          logDevWarning('Ecosystem matrix warm-up failed, but the app will keep using embedded content.', error);
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => () => cancelInFlightRequests(), [cancelInFlightRequests]);

  const handleContextUpdate = useCallback((value: React.SetStateAction<SalesContext>) => {
    cancelInFlightRequests();
    useSalesStore.setState({
      loading: false, analyzing: false, enhancingPlan: false, enhancingObjection: false,
      script: null, objectionResult: null, selectedObjections: [], selectedGamePlanItems: [], error: null
    });
    const nextContext = typeof value === 'function' ? value(context) : value;
    setContext(nextContext);
    
    if (
      nextContext.purchaseIntent === 'tech support' ||
      nextContext.purchaseIntent === 'order support' ||
      nextContext.purchaseIntent === 'account support'
    ) {
      setActiveTab('troubleshoot');
    } else {
      setActiveTab('gameplan');
    }
  }, [cancelInFlightRequests, context, setContext]);

  const reset = useCallback(() => {
    storeReset();
    setGuidedFlowStep('intent');
  }, [storeReset]);

  const handleDemoScenario = useCallback((scenario: DemoScenario) => {
    storeReset();
    setContext(scenario.context);
    setGuidedFlowStep('intent');
    setActiveTab('gameplan');
    setMode('live');
    void handleGenerate(scenario.context);
  }, [handleGenerate, setContext, storeReset]);

  /** From Level Up practice — loads scenario AND switches to Live */
  const handlePracticeScenario = useCallback((scenario: DemoScenario) => {
    handleDemoScenario(scenario);
  }, [handleDemoScenario]);

  const handleStartLiveCallFromLevelUp = useCallback(() => {
    reset();
    setActiveTab('gameplan');
    setMode('live');
    setRefineOpen(false);
  }, [reset]);

  const handleRunDemoScenario = useCallback(() => {
    const pool = DEMO_SCENARIOS.filter((scenario) => scenario.name !== lastDemoScenarioName);
    const choices = pool.length > 0 ? pool : DEMO_SCENARIOS;
    const scenario = choices[Math.floor(Math.random() * choices.length)];
    setLastDemoScenarioName(scenario.name);
    handlePracticeScenario(scenario);
  }, [handlePracticeScenario, lastDemoScenarioName]);

  const handleRefreshApp = useCallback(async () => {
    if (refreshingApp) return;
    setRefreshingApp(true);

    await refreshPwaApp({
      onWarning: (err) => {
        logDevWarning('App refresh encountered an issue, falling back to a normal reload.', err);
      },
    });
  }, [refreshingApp]);

  const isDataExpired = weeklyLoaded
    ? weeklySource === 'placeholder' || !weeklyData || isPastValidUntil(weeklyData.metadata.validUntil)
    : false;
  const dataStatusValue = !weeklyLoaded
    ? 'Loading'
    : weeklySource === 'placeholder' || !weeklyData
      ? 'Missing'
      : isDataExpired
        ? 'Update Due'
        : 'Fresh';
  const dataStatusTone = dataStatusValue === 'Fresh' ? 'success' : 'warning';
  const livePlanStatus = script
    ? 'Plan Built'
    : loading
      ? 'Building Plan…'
      : activeTab === 'gameplan'
        ? 'Quick Play Ready'
        : activeTab === 'objections'
          ? 'Comeback Mode'
          : 'Fix Toolkit';
  const hintStatusLabel = context.hintAvailable === undefined
    ? 'HINT Not Checked'
    : context.hintAvailable
      ? 'HINT Available'
      : 'HINT Full';
  const handleModeChange = useCallback((nextMode: AppMode) => {
    if (nextMode === 'settings') {
      void loadSettingsView();
    } else if (nextMode === 'offline-coach') {
      void loadOfflineCoach();
    }

    if (nextMode !== 'live') {
      cancelInFlightRequests();
      useSalesStore.setState({ loading: false, analyzing: false, enhancingPlan: false, enhancingObjection: false });
    }

    if (nextMode === 'settings' && mode !== 'offline-coach') {
      setSettingsSection('team');
    }

    if (nextMode !== 'level-up') {
      setLevelUpImmersive(false);
    }

    setMode(nextMode);
  }, [cancelInFlightRequests, mode]);

  const handleHintStatusClick = useCallback(() => {
    setShowHintPrompt(true);
  }, []);

  const handleGuidedComplete = useCallback((finalContext?: SalesContext) => {
    const nextContext = finalContext ?? context;
    setActiveTab('gameplan');
    setRefineOpen(false);
    useSalesStore.setState({ error: null });

    try {
      trackIntentUsed(nextContext.purchaseIntent);
      refreshSessionStats();
    } catch (err) {
      logDevWarning('Intent tracking failed, but the guided live flow can continue.', err);
    }

    void handleGenerate(nextContext);
  }, [context, handleGenerate, refreshSessionStats]);

  const handleRefineApply = useCallback((nextContext: SalesContext) => {
    setRefineOpen(false);
    handleContextUpdate(nextContext);
    setActiveTab('gameplan');
    void handleGenerate(nextContext);
  }, [handleContextUpdate, handleGenerate]);

  useEffect(() => {
    if (mode !== 'level-up' && levelUpImmersive) {
      setLevelUpImmersive(false);
    }
  }, [levelUpImmersive, mode]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [mode]);

  const isLevelUpImmersive = mode === 'level-up' && levelUpImmersive;
  const liveContextChips = getLiveContextChips(context);
  const hasLiveOutput = Boolean(script || loading || analyzing || objectionResult || error);
  const supportFocusLabel = getSupportFocusLabel(context.supportFocus);

  return (
    <ErrorBoundary>
    <div className="relative min-h-screen overflow-x-hidden font-sans text-foreground selection:bg-t-magenta/20">
      <PwaUpdater />
      <Header onReset={reset} mode={mode} onModeChange={handleModeChange} />

      <main
        className={`relative z-[1] mx-auto ${
          isLevelUpImmersive
            ? 'max-w-none px-0 pt-0 pb-0 md:max-w-[min(100vw-0.75rem,118rem)] md:px-4 md:pt-1 md:pb-4 2xl:max-w-[118rem]'
            : 'max-w-5xl px-4 pt-2 pb-4 md:px-10 md:pb-6 2xl:max-w-6xl'
        }`}
      >
        {mode !== 'home' && !isLevelUpImmersive ? (
          <div className="glass-capsule mb-3 flex flex-wrap gap-2 rounded-[1.5rem] p-2.5">
            <StatusPill
              tone={dataStatusTone}
              label="Data"
              value={dataStatusValue}
            />
            {mode === 'live' ? (
              <>
                <StatusPill tone="magenta" label="Live" value={livePlanStatus} />
                <StatusPill
                  tone={context.hintAvailable === undefined ? 'neutral' : context.hintAvailable ? 'success' : 'warning'}
                  label="Home Internet"
                  value={hintStatusLabel}
                  actionLabel={context.hintAvailable === undefined ? 'Check address' : 'Update'}
                  ariaLabel="Check or update Home Internet availability"
                  onClick={handleHintStatusClick}
                />
              </>
            ) : null}
          </div>
        ) : null}
        <AnimatePresence initial={false}>
          {mode === 'home' ? (
            <motion.section
              id="mode-panel-home"
              key="mode-home"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-home"
                title="Home view needs a refresh"
                message="The dashboard tripped over something. Reload to get the demo back on track."
              >
                <HomeScreen weeklyData={weeklyData} onNavigate={handleModeChange} onReset={reset} />
              </ErrorBoundary>
            </motion.section>
          ) : mode === 'level-up' ? (
            <motion.section
              id="mode-panel-level-up"
              key="mode-level-up"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-level-up"
                title="Level Up hit a snag"
                message="The practice tab can be reloaded without affecting the rest of the app."
              >
                <Suspense fallback={<LazySectionFallback label="Level Up" />}>
                  <LevelUpView
                    onSelectScenario={handlePracticeScenario}
                    onStartLiveCall={handleStartLiveCallFromLevelUp}
                    onImmersiveChange={setLevelUpImmersive}
                  />
                </Suspense>
              </ErrorBoundary>
            </motion.section>
          ) : mode === 'learn' ? (
            <motion.section
              id="mode-panel-learn"
              key="mode-learn"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-learn"
                title="Learn tab needs a refresh"
                message="The learning library can reload without interrupting the live call flow."
              >
                <Suspense fallback={<LazySectionFallback label="Learn" />}>
                  <LearnView
                    weeklyData={weeklyData}
                    weeklySource={weeklySource}
                    ecosystemMatrix={ecosystemMatrix}
                    onDataUpdate={() => { void refreshWeeklyData(); }}
                  />
                </Suspense>
              </ErrorBoundary>
            </motion.section>
          ) : mode === 'settings' ? (
            <motion.section
              id="mode-panel-settings"
              key="mode-settings"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-settings"
                title="Settings needs a refresh"
                message="The settings panel encountered an error."
              >
                <Suspense fallback={<LazySectionFallback label="Settings" />}>
                  <SettingsView initialTab={settingsSection} />
                </Suspense>
              </ErrorBoundary>
            </motion.section>
          ) : mode === 'offline-coach' ? (
            <motion.section
              id="mode-panel-offline-coach"
              key="mode-offline-coach"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <ErrorBoundary
                compact
                resetKey="mode-offline-coach"
                title="Offline Coach needs a refresh"
                message="The local AI engine encountered an error."
              >
                <Suspense fallback={<LazySectionFallback label="Offline Coach" />}>
                  <OfflineCoach
                    onOpenOfflineAiSettings={() => {
                      setSettingsSection('offline-ai');
                      void loadSettingsView();
                      setMode('settings');
                    }}
                  />
                </Suspense>
              </ErrorBoundary>
            </motion.section>
          ) : (
            <motion.section
              id="mode-panel-live"
              key="mode-live"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
        <ErrorBoundary
          compact
          resetKey={`mode-live-${activeTab}`}
          title="Live Call needs a reset"
          message="A live-call panel ran into trouble. Reloading this tab is safer than risking a white screen in the demo."
        >
        <>
        <div className="space-y-4">
          <section className="glass-stage rounded-[2rem] p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="type-micro text-t-magenta">Live Call Flow</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground">One guided decision at a time.</h2>
                <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-t-dark-gray">
                  Use the picker first. Refine details only when they matter, then read the plan without stacked controls fighting for space.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setRefineOpen(true)}
                  className="focus-ring glass-control inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-xs font-black tracking-tight text-t-dark-gray transition-colors hover:text-foreground"
                >
                  <SlidersHorizontal className="h-4 w-4 text-t-magenta" />
                  Refine Plan
                </button>
                <button
                  type="button"
                  onClick={handleRunDemoScenario}
                  disabled={loading}
                  className="focus-ring glass-control inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-xs font-black tracking-tight text-t-dark-gray transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Play className="h-4 w-4 text-t-magenta" />
                  Test Scenario
                </button>
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setRefineOpen(false);
                  }}
                  className="focus-ring glass-control inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 text-xs font-black tracking-tight text-t-dark-gray transition-colors hover:text-foreground"
                >
                  <RefreshCw className="h-4 w-4 text-t-magenta" />
                  New Call
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {liveContextChips.map(chip => (
                <span key={`${chip.label}-${chip.value}`} className="glass-reading rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-t-dark-gray">
                  <span className="text-t-magenta">{chip.label}:</span> {chip.value}
                </span>
              ))}
            </div>
          </section>

          {!hasLiveOutput ? (
            <section className="glass-stage mx-auto max-w-2xl rounded-[2rem] p-5 md:p-6">
              <Suspense fallback={<LazySectionFallback label="Guided Flow" />}>
                <GuidedContextFlow
                  context={context}
                  setContext={handleContextUpdate}
                  onComplete={handleGuidedComplete}
                  currentStep={guidedFlowStep}
                  onStepChange={setGuidedFlowStep}
                />
              </Suspense>
            </section>
          ) : (
            <div className="space-y-3">
              <div
                role="tablist"
                aria-label="Live call tools"
                className="glass-capsule flex flex-wrap gap-1.5 rounded-full p-1.5"
              >
                {(() => {
                  const intent = context.purchaseIntent;
                  const thirdTab =
                    intent === 'order support'
                      ? { id: 'troubleshoot' as const, icon: Package, label: 'Order', helper: supportFocusLabel ?? (context.orderSupportType ? context.orderSupportType.replace(/_/g, ' ') : 'Triage the order issue') }
                      : intent === 'account support'
                        ? { id: 'troubleshoot' as const, icon: UserCircle, label: 'Account', helper: supportFocusLabel ?? 'Triage, answer, or transfer' }
                        : { id: 'troubleshoot' as const, icon: Wrench, label: 'Fix', helper: supportFocusLabel ?? (context.product.includes('Home Internet') ? 'HINT troubleshoot toolkit' : 'Troubleshoot and escalate') };

                  return [
                    { id: 'gameplan' as const, icon: Sparkles, label: 'Plan', helper: script ? 'Ready to use' : loading ? 'Building local-first plan' : 'Guided result' },
                    { id: 'objections' as const, icon: AlertCircle, label: 'Objections', helper: selectedObjections.length > 0 ? `${selectedObjections.length} queued` : script ? 'Pressure-test the plan' : 'Build plan first' },
                    thirdTab,
                  ];
                })().map(tab => (
                  <button
                    key={tab.id}
                    id={`live-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`live-panel-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`focus-ring flex-1 min-h-[52px] min-w-[88px] rounded-full px-2.5 py-3 text-center text-xs font-black tracking-tight transition-all ${activeTab === tab.id ? 'glass-control-active text-white' : 'glass-control text-t-dark-gray hover:text-foreground'}`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <span className="flex flex-col items-center gap-1 leading-none">
                      <span className="flex items-center justify-center gap-1 md:gap-2">
                        <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                      </span>
                      {activeTab === tab.id ? (
                        <span className="text-[10px] font-medium normal-case tracking-normal text-white/80 sm:text-[11px]">
                          {tab.helper}
                        </span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'objections' && (
                  <div id="live-panel-objections" role="tabpanel" aria-labelledby="live-tab-objections">
                    <Suspense fallback={<LazySectionFallback label="Objections" />}>
                      <ObjectionTab
                        context={context}
                        script={script}
                        selectedObjections={selectedObjections}
                        setSelectedObjections={setSelectedObjections}
                        selectedGamePlanItems={selectedGamePlanItems}
                        objectionResult={objectionResult}
                        analyzing={analyzing}
                        onAnalyze={handleAnalyzeObjection}
                        onClearResult={() => setObjectionResult(null)}
                      />
                    </Suspense>
                  </div>
                )}
                {activeTab === 'troubleshoot' && (
                  <div id="live-panel-troubleshoot" role="tabpanel" aria-labelledby="live-tab-troubleshoot">
                    {context.purchaseIntent === 'order support' ? (
                      <OrderSupportPanel context={context} setContext={handleContextUpdate} />
                    ) : context.purchaseIntent === 'account support' ? (
                      <AccountSupportPanel context={context} setContext={handleContextUpdate} />
                    ) : (
                      <TroubleshootingPivot initialCategory={getTroubleshootingCategory(context)} />
                    )}
                  </div>
                )}
              </AnimatePresence>

              <ErrorBoundary
                compact
                resetKey={`live-results-${activeTab}`}
                title="Results panel needs a refresh"
                message="The local coaching engine is still safe. Reset this panel and keep the conversation moving."
              >
                <div id="live-panel-gameplan" role="tabpanel" aria-labelledby="live-tab-gameplan">
                  <AnimatePresence mode="wait">
                    {((activeTab === 'gameplan' && loading) || (activeTab === 'objections' && analyzing)) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="min-h-[340px] rounded-[2rem] glass-stage p-6"
                      >
                        <div className="animate-pulse space-y-4">
                          <div className="h-3 w-32 rounded-full bg-t-magenta/15" />
                          <div className="h-12 rounded-2xl bg-t-light-gray/80" />
                          <div className="h-24 rounded-2xl bg-t-light-gray/70" />
                          <div className="h-16 rounded-2xl bg-t-light-gray/60" />
                        </div>
                        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-t-magenta/10 px-3 py-2 text-t-magenta">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span className="type-micro">{activeTab === 'gameplan' ? 'Building local plan first' : 'Working on your response'}</span>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'objections' && objectionResult && !analyzing && (
                      <ObjectionResults result={objectionResult} onClear={() => setObjectionResult(null)} />
                    )}

                    {activeTab === 'gameplan' && script && !loading && (
                      <Suspense fallback={<LazySectionFallback label="Game Plan Results" />}>
                        <LivePlanResults script={script} context={context} />
                      </Suspense>
                    )}
                  </AnimatePresence>
                </div>
              </ErrorBoundary>

              {error && !((activeTab === 'gameplan' && script) || (activeTab === 'objections' && objectionResult)) && (
                <div className="mt-4">
                  <TabErrorFallback
                    title="Working offline"
                    message={error}
                    onRetry={() => {
                      if (activeTab === 'gameplan') {
                        void handleGenerate();
                        return;
                      }

                      void handleAnalyzeObjection();
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <p className="flex items-center justify-center gap-1 px-4 text-center text-[11px] font-medium text-t-dark-gray">
            <ShieldCheck className="h-3 w-3 text-t-magenta/50" />
            <span>Shift-safe, no PII, and fully offline. Local plan renders before AI polish.</span>
          </p>
        </div>
        <Suspense fallback={null}>
          <LiveRefinePanel
            open={refineOpen}
            context={context}
            onClose={() => setRefineOpen(false)}
            onApply={handleRefineApply}
          />
        </Suspense>
        </>
	        </ErrorBoundary>
	            </motion.section>
          )}
        </AnimatePresence>
      </main>


      <footer className="relative z-[1] mx-auto mt-10 max-w-5xl space-y-3 px-6 pb-8 pt-6 text-center md:px-10 2xl:max-w-6xl" style={{ borderTop: '1px solid var(--glass-border-subtle)' }}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-semibold text-t-dark-gray">
          {weeklyLoaded && weeklyData ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-t-magenta/60" />
              <span>
                {weeklyData.metadata.updatedDate} → {weeklyData.metadata.validUntil}
              </span>
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-t-magenta/60" />
            <span>CPNI safe • no real customer info</span>
          </span>
          <button
            type="button"
            onClick={() => { void handleRefreshApp(); }}
            disabled={refreshingApp}
            className="focus-ring glass-control inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black tracking-tight text-t-dark-gray transition-colors hover:text-t-magenta disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 ${refreshingApp ? 'animate-spin text-t-magenta' : 'text-t-dark-gray/70'}`} />
            {refreshingApp ? 'Refreshing…' : 'Refresh App'}
          </button>
        </div>
        <p className="text-xs font-medium text-t-muted">
          If the app looks stale, refresh once and let the preview reload.
        </p>
        <p className="pt-2 text-[11px] font-semibold text-t-dark-gray">
          &copy; 2026 CustomerConnect AI. Built for fast, stable call support.
        </p>
      </footer>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            className="focus-ring fixed bottom-6 right-6 z-50 cta-primary rounded-full p-3.5 text-white transition-colors shadow-2xl"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* HINT Availability Prompt Modal */}
      <AnimatePresence>
        {showHintPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="glass-modal w-full max-w-sm rounded-[2rem] p-6"
          >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-t-magenta/10 flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5 text-t-magenta" />
                </div>
                <h3 className="text-lg font-black tracking-tight text-t-dark-gray">HINT Availability</h3>
              </div>
              <p className="text-sm text-t-dark-gray font-medium mb-6">
                Did you check their address? Is T-Mobile Home Internet currently available for them?
              </p>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    handleContextUpdate(prev => ({
                      ...prev,
                      hintAvailable: true,
                      product: [...prev.product.filter(p => p !== 'No Specific Product'), 'Home Internet']
                    }));
                    setShowHintPrompt(false);
                    void handleGenerate();
                  }}
                  className="w-full focus-ring cta-primary rounded-xl py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Yes, Available
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleContextUpdate(prev => ({
                      ...prev,
                      hintAvailable: false,
                      product: [...prev.product.filter(p => p !== 'No Specific Product'), 'Home Internet']
                    }));
                    setShowHintPrompt(false);
                    void handleGenerate();
                  }}
                  className="w-full focus-ring glass-control text-t-dark-gray rounded-xl py-3.5 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors hover:text-foreground"
                >
                  <WifiOff className="w-4 h-4" /> No, Spots Full
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}
