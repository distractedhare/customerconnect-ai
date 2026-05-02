import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { BatteryCharging, BookOpen, ChevronRight, HardHat, Loader2, Play, RefreshCw, Route, Satellite, TriangleAlert, X, Zap } from 'lucide-react';
import ErrorBoundary from '../../ErrorBoundary';
import { createRunnerHostBridge } from './hostBridge';
import MagentaRunner from '../MagentaRunner';
import { useStore as useRunnerStore } from './store';
import { GameStatus, type CharacterId } from './types';
import { PLAYABLE_RUNNERS, RUNNER_BOSSES } from './content';
import { KIP_ASSETS } from '../../kip/kipAssets';
import { RunnerPicture } from './components/UI/RunnerPicture';
import GameTransitionOverlay from './components/UI/GameTransitionOverlay';
import CollectionMenu from './components/UI/CollectionMenu';
import { audio } from './components/System/Audio';

/**
 * Bell Sovereign propaganda strip — surfaces the lore-only HiddenArchitect
 * boss while the rep waits for the runner to load. Pure ornament: no
 * gameplay, no progression, no clickable affordance. Just enough to plant
 * the idea that something larger is watching the grid.
 */
function BellPropagandaStrip() {
  const bell = RUNNER_BOSSES.find((b) => b.id === 'bell_sovereign');
  if (!bell || !bell.assets?.banner) return null;
  return (
    <div
      className="mt-6 grid items-stretch gap-4 overflow-hidden rounded-[1.4rem] border bg-[linear-gradient(135deg,rgba(8,4,0,0.85),rgba(0,0,0,0.92))] p-3 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-5 sm:p-4"
      style={{ borderColor: `${bell.accent}33` }}
      aria-label="Bell Sovereign — lore preview"
    >
      <div
        className="relative overflow-hidden rounded-[1.05rem] border bg-black"
        style={{ borderColor: `${bell.accent}55` }}
      >
        <RunnerPicture
          src={bell.assets.banner}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-full w-full object-cover object-top"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)',
          }}
        />
      </div>
      <div className="min-w-0 text-left">
        <p
          className="text-[9px] font-black uppercase tracking-[0.32em]"
          style={{ color: bell.accent }}
        >
          {bell.faction}
        </p>
        <h4 className="mt-1 text-base font-black uppercase leading-snug text-white sm:text-lg">
          {bell.name}
        </h4>
        <p className="mt-1 text-[11px] font-medium leading-relaxed text-white/65 sm:text-xs">
          {bell.fantasy}
        </p>
        <p
          className="mt-2 text-[9px] font-black uppercase tracking-[0.28em]"
          style={{ color: bell.accent }}
        >
          Always on. Always sovereign.
        </p>
      </div>
    </div>
  );
}

const RunnerApp = lazy(() => import('./App'));

const ACTIVE_RUN_STATUSES = new Set<GameStatus>([
  GameStatus.PLAYING,
  GameStatus.PAUSED,
  GameStatus.TRIVIA,
  GameStatus.SHOP,
]);

interface RunnerTabProps {
  immersive?: boolean;
  launched?: boolean;
  onLaunchedChange?: (launched: boolean) => void;
  onStartLiveCall?: () => void;
}

type RunnerPhase = 'landing' | 'collection' | 'deploying' | 'game';

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

const FALLBACK_GUIDE_STEPS = [
  {
    title: 'Select, then launch',
    copy: 'Pick a runner first. The roster should not throw anyone into a giant card preview anymore.',
  },
  {
    title: 'Learn before the sprint',
    copy: 'Use the tutorial option when the arcade opens if someone is new or wants the clean version of the controls.',
  },
  {
    title: 'Use Lite Mode when needed',
    copy: 'If the 3D build struggles on a browser or device, the lighter fallback keeps the training flow usable.',
  },
];

function RunnerFallback({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[72vh] items-center justify-center overflow-hidden rounded-[1.85rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.18),transparent_45%),linear-gradient(180deg,rgba(8,0,16,0.96),rgba(0,0,0,0.98))] px-4 py-10 text-center text-white">
      <div className="max-w-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#E20074]/40 bg-[#E20074]/12 text-[#ff8cc6]">
          <HardHat className="h-8 w-8" />
        </div>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8cc6]">T-LIFE Runner</p>
        <h3 className="mt-2 text-3xl font-black tracking-tight">{title}</h3>
        <p className="mt-3 text-sm font-medium leading-relaxed text-white/75">{copy}</p>
        {children}
      </div>
    </div>
  );
}

const HOW_TO_PLAY = [
  { title: 'Swipe lanes', copy: 'Guide Kip through the Signal Grid.', icon: Route },
  { title: 'Collect T-LIFE', copy: 'Grab letters, charge Battery, and unlock boosts.', icon: BatteryCharging },
  { title: 'Crash → challenge', copy: 'Answer fast to shield up and keep running.', icon: Satellite },
];

interface RunnerLandingProps {
  onLaunch: () => void;
  onStartLiveCall?: () => void;
}

function RunnerLanding({ onLaunch, onStartLiveCall }: RunnerLandingProps) {
  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_18%_18%,rgba(226,0,116,0.34),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(255,77,180,0.18),transparent_30%),linear-gradient(180deg,#080010,#000)] p-5 text-white sm:p-7"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(226,0,116,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(226,0,116,0.07)_1px,transparent_1px)] bg-[size:34px_34px] opacity-40" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)] lg:items-center">
        <div className="min-w-0 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E20074]/35 bg-[#E20074]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#ff8cc6]">
            <Satellite className="h-3.5 w-3.5" />
            Signal Grid online
          </div>
          <h2 className="mt-4 text-4xl font-black uppercase leading-[0.92] tracking-tight font-cyber italic sm:text-5xl lg:text-6xl">
            Kip&apos;s
            <span className="block text-[#E20074]">Signal Run</span>
          </h2>

          <div className="mt-5 space-y-3 text-sm font-semibold leading-relaxed text-white/76 sm:text-base">
            <p>
              The Signal Grid pulses beneath every call, message, stream, and sale. Rival networks have corrupted the lanes with dead zones, delays, locks, and broken connections.
            </p>
            <p>Kip has found another way through.</p>
            <p className="font-black text-white">Collect T-LIFE. Keep your Battery alive. Break through the old grid.</p>
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-[#E20074]/30 bg-black/35 px-4 py-3 text-left shadow-[0_22px_44px_-28px_rgba(226,0,116,0.95)]">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff8cc6]">Kip</p>
            <p className="mt-1 text-base font-black leading-snug text-white">
              &ldquo;Ready up. I&rsquo;ll watch the route — you keep moving.&rdquo;
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onLaunch}
              className="focus-ring inline-flex min-h-[56px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[#E20074] px-6 py-3 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_22px_44px_-22px_rgba(226,0,116,0.9)] transition-transform hover:scale-[1.02] active:scale-95 sm:flex-none sm:text-base"
            >
              <Play className="h-4 w-4 fill-current" />
              Launch run
              <ChevronRight className="h-4 w-4" />
            </button>
            {onStartLiveCall ? (
              <button
                type="button"
                onClick={onStartLiveCall}
                className="focus-ring inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-white/12"
              >
                Back to live call
              </button>
            ) : null}
          </div>
          <p className="mt-3 text-center text-[11px] font-black uppercase tracking-[0.24em] text-white/52 lg:text-left">
            Stay Un-Carrier. Never stop moving.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {HOW_TO_PLAY.map((step) => (
              <div key={step.title} className="rounded-[1.1rem] border border-white/10 bg-black/35 p-3">
                <step.icon className="mb-2 h-4 w-4 text-[#ff8cc6]" />
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#ff8cc6]">{step.title}</p>
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-white/72">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <div className="relative mx-auto max-w-[23rem] overflow-hidden rounded-[1.7rem] border border-[#E20074]/35 bg-black shadow-[0_30px_80px_rgba(226,0,116,0.22)]">
            <img
              src={KIP_ASSETS.hero.png}
              alt="Kip"
              className="aspect-[4/5] h-full w-full object-cover object-top"
              loading="eager"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_48%,rgba(0,0,0,0.82)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#ff8cc6]">AI operator online</p>
              <p className="mt-1 text-2xl font-black uppercase leading-none text-white font-cyber italic">Kip</p>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-[#E20074]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RunnerTab({ immersive = false, launched = false, onLaunchedChange, onStartLiveCall }: RunnerTabProps) {
  const runnerWrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [showLiteMode, setShowLiteMode] = useState(false);
  const [isEnteringGame, setIsEnteringGame] = useState(false);
  const [runnerPhase, setRunnerPhase] = useState<RunnerPhase>('landing');
  const selectedRunnerId = useRunnerStore((state) => state.selectedRunnerId ?? state.selectedCharacterId);
  const setRunner = useRunnerStore((state) => state.setRunner);
  const startGame = useRunnerStore((state) => state.startGame);

  const shouldBootRunner = launched && !showLiteMode && (runnerPhase === 'deploying' || runnerPhase === 'game');

  const requestRunnerFullscreen = useCallback(() => {
    const element = runnerWrapperRef.current;
    if (!element?.requestFullscreen || document.fullscreenElement === element) return;
    void element.requestFullscreen().catch(() => {
      // Fullscreen is a progressive enhancement. Some browsers deny it.
    });
  }, []);

  const launchRunner = () => {
    setRunnerPhase('collection');
    setReady(false);
    setUnsupported(false);
    setLoadError(null);
    onLaunchedChange?.(true);
  };

  const completeGameTransition = useCallback(() => {
    setIsEnteringGame(false);
    setRunnerPhase((phase) => (phase === 'deploying' ? 'game' : phase));
  }, []);

  const deployRunner = useCallback((id: CharacterId) => {
    setRunner(id);
    try {
      audio.init();
    } catch (error) {
      console.warn('Runner audio could not initialize during deploy', error);
    }
    startGame();
    requestRunnerFullscreen();
    setRunnerPhase('deploying');
    setIsEnteringGame(true);
    onLaunchedChange?.(true);
  }, [onLaunchedChange, requestRunnerFullscreen, setRunner, startGame]);

  const renderRunnerShell = (content: ReactNode) => (
    <div ref={runnerWrapperRef} className="relative bg-[#0F0F14]" style={{ touchAction: 'none' }}>
      {content}
      <GameTransitionOverlay isEnteringGame={isEnteringGame} onComplete={completeGameTransition} />
    </div>
  );

  useEffect(() => {
    if (!launched) {
      setRunnerPhase('landing');
      setIsEnteringGame(false);
    } else if (runnerPhase === 'landing') {
      setRunnerPhase('collection');
    }
  }, [launched, runnerPhase]);

  useEffect(() => {
    return () => {
      const state = useRunnerStore.getState();
      if (ACTIVE_RUN_STATUSES.has(state.status)) {
        state.saveProgress(true);
        state.setStatus(GameStatus.MENU);
        return;
      }

      if (state.status === GameStatus.SETTINGS && state.settingsReturnStatus !== GameStatus.MENU) {
        state.setStatus(GameStatus.MENU);
      }
    };
  }, []);

  const retryRunner = () => {
    setShowGuide(false);
    setShowLiteMode(false);
    setReady(false);
    setUnsupported(false);
    setLoadError(null);
    setRetryCount((count) => count + 1);
  };

  const closeToLanding = () => {
    const state = useRunnerStore.getState();
    if (ACTIVE_RUN_STATUSES.has(state.status)) {
      state.saveProgress(true);
    }
    state.setStatus(GameStatus.MENU);
    setRunnerPhase('landing');
    setIsEnteringGame(false);
    onLaunchedChange?.(false);
  };

  // The heavy host-bridge load only fires once the rep actually launches.
  // No reason to spin up Three.js + audio while they're reading instructions.
  useEffect(() => {
    if (!shouldBootRunner) return;

    setReady(false);
    setUnsupported(false);
    setLoadError(null);

    if (!supportsWebGL()) {
      setUnsupported(true);
      return;
    }

    let active = true;
    const previousBridge = window.TLifeRunnerHost;
    const previousContent = window.__TLIFE_RUNNER_CONTENT__;

    void createRunnerHostBridge()
      .then(({ bridge }) => {
        if (!active) return;
        window.TLifeRunnerHost = bridge;
        setReady(true);
      })
      .catch((error) => {
        console.error('Unable to initialize T-LIFE Runner host bridge', error);
        if (!active) return;
        setLoadError('The runner systems could not finish loading.');
      });

    return () => {
      active = false;
      window.TLifeRunnerHost = previousBridge;
      window.__TLIFE_RUNNER_CONTENT__ = previousContent;
    };
  }, [retryCount, shouldBootRunner]);

  // Default surface: Kip-hosted landing page. No 3D, no Three.js cost.
  if (!launched) {
    return renderRunnerShell(<RunnerLanding onLaunch={launchRunner} onStartLiveCall={onStartLiveCall} />);
  }

  if (runnerPhase === 'collection') {
    return renderRunnerShell(
      <CollectionMenu
        characters={PLAYABLE_RUNNERS}
        selectedRunnerId={selectedRunnerId}
        onDeploy={deployRunner}
        onBack={closeToLanding}
      />,
    );
  }

  // Once launched, render either the lite arcade or the full 3D runner.
  // A Close button is overlaid so the rep can always bail back to the
  // landing page without losing their selected character or progress.
  const closeChrome = (
    <button
      type="button"
      onClick={closeToLanding}
      aria-label="Close runner — back to landing"
      className="focus-ring pointer-events-auto absolute left-3 top-3 z-[140] inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[0_14px_36px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:bg-black/80 sm:left-4 sm:top-4 sm:px-4 sm:text-[11px]"
    >
      <X className="h-3.5 w-3.5 shrink-0 text-[#ff8cc6]" />
      <span>Close</span>
    </button>
  );

  if (showLiteMode) {
    return renderRunnerShell(
      <div className="relative space-y-4">
        {closeChrome}
        <div className="rounded-[1.7rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(226,0,116,0.16),transparent_52%),linear-gradient(180deg,rgba(8,0,16,0.96),rgba(0,0,0,0.98))] p-5 text-white">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E20074]/25 bg-[#E20074]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#ff8cc6]">
                <TriangleAlert className="h-3.5 w-3.5" />
                Lite mode active
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-tight">Fallback arcade build is live</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/72">
                This lighter mode is here for browsers or devices that struggle with the full 3D runner. The rep still gets a playable training loop instead of a dead end.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowGuide((current) => !current)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/12"
              >
                <BookOpen className="h-4 w-4" />
                {showGuide ? 'Hide guide' : 'How it works'}
              </button>
              <button
                type="button"
                onClick={retryRunner}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#E20074] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.01]"
              >
                <RefreshCw className="h-4 w-4" />
                Retry 3D runner
              </button>
            </div>
          </div>

          {showGuide ? (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {FALLBACK_GUIDE_STEPS.map((step) => (
                <div key={step.title} className="rounded-[1.3rem] border border-white/10 bg-black/28 p-4">
                  <div className="text-[10px] uppercase tracking-[0.26em] text-[#E20074]">{step.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{step.copy}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex justify-center">
          <MagentaRunner />
        </div>
      </div>,
    );
  }

  if (unsupported) {
    return renderRunnerShell(
      <div className="relative">
        {closeChrome}
        <RunnerFallback
          title="This browser cannot run the arcade build"
          copy="The T-LIFE Runner needs WebGL support for the 3D scene. Open it on a more capable browser or device and the rest of Level Up will still work normally."
        >
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowLiteMode(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#E20074] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.01]"
            >
              <Zap className="h-4 w-4" />
              Launch lite mode
            </button>
            <button
              type="button"
              onClick={() => setShowGuide((current) => !current)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/12"
            >
              <BookOpen className="h-4 w-4" />
              {showGuide ? 'Hide guide' : 'How it works'}
            </button>
          </div>

          {showGuide ? (
            <div className="mt-5 grid gap-3 text-left md:grid-cols-3">
              {FALLBACK_GUIDE_STEPS.map((step) => (
                <div key={step.title} className="rounded-[1.3rem] border border-white/10 bg-black/28 p-4">
                  <div className="text-[10px] uppercase tracking-[0.26em] text-[#E20074]">{step.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{step.copy}</p>
                </div>
              ))}
            </div>
          ) : null}
        </RunnerFallback>
      </div>,
    );
  }

  if (loadError) {
    return renderRunnerShell(
      <div className="relative">
        {closeChrome}
        <RunnerFallback
          title="The arcade systems hit a loading snag"
          copy={`${loadError} Refresh the page or reopen the tab and the rest of Level Up will still be available while we retry the game surface.`}
        >
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={retryRunner}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#E20074] px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.01]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry runner
            </button>
            <button
              type="button"
              onClick={() => setShowLiteMode(true)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/12"
            >
              <Zap className="h-4 w-4" />
              Open lite mode
            </button>
            <button
              type="button"
              onClick={() => setShowGuide((current) => !current)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:bg-white/12"
            >
              <BookOpen className="h-4 w-4" />
              {showGuide ? 'Hide guide' : 'How it works'}
            </button>
          </div>

          {showGuide ? (
            <div className="mt-5 grid gap-3 text-left md:grid-cols-3">
              {FALLBACK_GUIDE_STEPS.map((step) => (
                <div key={step.title} className="rounded-[1.3rem] border border-white/10 bg-black/28 p-4">
                  <div className="text-[10px] uppercase tracking-[0.26em] text-[#E20074]">{step.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">{step.copy}</p>
                </div>
              ))}
            </div>
          ) : null}
        </RunnerFallback>
      </div>,
    );
  }

  if (runnerPhase === 'deploying') {
    return renderRunnerShell(
      <div className="relative">
        {closeChrome}
        <div className="flex min-h-[72vh] items-center justify-center rounded-[1.85rem] border border-white/10 bg-[#050011] px-4 py-10 text-white">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#E20074]/40 bg-[#E20074]/12 text-[#ff8cc6]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8cc6]">Deploying runner</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Connecting to the Signal Grid</h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-white/75">
              Locking the selected runner, warming the bridge, and letting the transition hide the heavy WebGL work.
            </p>
          </div>
        </div>
      </div>,
    );
  }

  if (!ready) {
    return renderRunnerShell(
      <div className="relative">
        {closeChrome}
        <div className="flex min-h-[72vh] items-center justify-center rounded-[1.85rem] border border-white/10 bg-[#050011] px-4 py-10 text-white">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-[#E20074]/40 bg-[#E20074]/12 text-[#ff8cc6]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.25em] text-[#ff8cc6]">Preparing arcade systems</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight">Loading T-LIFE Runner</h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-white/75">
              Pulling in live quiz content, weekly facts, and your saved runner progress before the track opens.
            </p>
            <BellPropagandaStrip />
          </div>
        </div>
      </div>,
    );
  }

  return renderRunnerShell(
    <ErrorBoundary
      compact
      resetKey={`runner-${retryCount}-${ready ? 'ready' : 'loading'}`}
      title="The runner scene hit a loading snag"
      message="This arcade panel threw an error while mounting. Reloading the section usually gets the game back on track."
      actionLabel="Reload Runner"
      onRetry={retryRunner}
    >
      <Suspense
        fallback={
          <div className="relative">
            {closeChrome}
            <div className="flex min-h-[72vh] items-center justify-center rounded-[1.85rem] border border-white/10 bg-[#050011] px-4 py-10 text-white">
              <div className="flex items-center gap-3 text-sm font-semibold">
                <Loader2 className="h-5 w-5 animate-spin text-[#ff8cc6]" />
                Mounting runner scene
              </div>
            </div>
          </div>
        }
      >
        <div className="relative">
          {closeChrome}
          <RunnerApp immersive={immersive} onStartLiveCall={onStartLiveCall} />
        </div>
      </Suspense>
    </ErrorBoundary>,
  );
}
