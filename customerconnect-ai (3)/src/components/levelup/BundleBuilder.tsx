import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react';
import { CATALOG } from '../../data/accessoryCatalog';
import { CatalogItem } from '../../types';
import { recordQuizScore } from '../../services/prizeService';
import { celebrate } from './celebrate';

// ─────────────────────────────────────────────────────────────────────────────
// Personas
// ─────────────────────────────────────────────────────────────────────────────

interface BundlePersona {
  id: string;
  name: string;
  emoji: string;
  avatarBg: string;
  blurb: string;
  targetTags: string[];
}

const PERSONAS: BundlePersona[] = [
  {
    id: 'clumsy-construction-worker',
    name: 'Clumsy Construction Worker',
    emoji: '🔨',
    avatarBg: 'rgba(212,160,23,0.14)',
    blurb: 'Drops his phone daily on a job site. Needs rugged protection and all-day power.',
    targetTags: ['outdoorsy', 'outdoors', 'active', 'storm-ready'],
  },
  {
    id: 'gym-rat-gabe',
    name: 'Gym-Rat Gabe',
    emoji: '🏋️',
    avatarBg: 'rgba(226,0,116,0.12)',
    blurb: 'Trains 2x a day. Needs sweat-proof audio and a case that survives drops on the rack.',
    targetTags: ['gym', 'active'],
  },
  {
    id: 'commuter-casey',
    name: 'Commuter Casey',
    emoji: '🚇',
    avatarBg: 'rgba(0,100,200,0.10)',
    blurb: 'Two-hour subway commute. Wants quiet audio, fast top-ups, and privacy from nosy seatmates.',
    targetTags: ['commuter', 'commute', 'privacy-minded', 'battery-anxiety'],
  },
  {
    id: 'road-trip-rita',
    name: 'Road-Trip Rita',
    emoji: '🚗',
    avatarBg: 'rgba(134,27,84,0.12)',
    blurb: 'Lives out of the car on weekends. Needs charging, mounts, and nav that never dies.',
    targetTags: ['travel', 'commute', 'battery-anxiety'],
  },
  {
    id: 'storm-chaser-sam',
    name: 'Stormy Storm-Chaser Sam',
    emoji: '⛈️',
    avatarBg: 'rgba(50,80,120,0.15)',
    blurb: 'Chases tornadoes for fun. Needs rugged gear, backup power, and nothing that quits in the rain.',
    targetTags: ['storm-ready', 'outdoorsy', 'outdoors', 'battery-anxiety'],
  },
  {
    id: 'privacy-first-priya',
    name: 'Privacy-First Priya',
    emoji: '🕶️',
    avatarBg: 'rgba(40,40,50,0.18)',
    blurb: 'Works from cafés. Wants screen privacy, premium audio, and zero over-the-shoulder snooping.',
    targetTags: ['privacy-minded', 'premium-leaning', 'public'],
  },
];

const ROUND_COUNT = 4;
const ROUND_SECONDS = 14;
const MAX_PICKS = 3;
const REVEAL_MS = 1800;
const TAP_DEBOUNCE_MS = 120;

type GameState = 'start' | 'playing' | 'reveal' | 'end';

interface Tile {
  id: string;
  item: CatalogItem;
  strength: 2 | 1 | 0; // 2 = strong match, 1 = partial, 0 = red herring
}

interface RoundResult {
  personaId: string;
  correctPicks: number;
  strongAvailable: number;
  timeLeft: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tile selection
// ─────────────────────────────────────────────────────────────────────────────

function scoreMatch(item: CatalogItem, targetTags: string[]): number {
  const itemTags = new Set([...item.lifestyleTags, ...item.signalTags]);
  let hits = 0;
  for (const tag of targetTags) {
    if (itemTags.has(tag)) hits += 1;
  }
  return hits;
}

function buildRoundTiles(persona: BundlePersona, seed: number): Tile[] {
  const rng = mulberry32(seed);
  const scored = CATALOG.map((item) => ({ item, score: scoreMatch(item, persona.targetTags) }));
  const strong = shuffle(scored.filter((s) => s.score >= 2), rng).slice(0, 3);
  const partial = shuffle(scored.filter((s) => s.score === 1), rng).slice(0, 3);
  const herrings = shuffle(scored.filter((s) => s.score === 0), rng).slice(0, 3);

  const picks = [...strong, ...partial, ...herrings];

  // Pad with random catalog items if persona doesn't have enough distinct items.
  while (picks.length < 9) {
    const extra = shuffle(scored, rng).find((s) => !picks.some((p) => p.item.id === s.item.id));
    if (!extra) break;
    picks.push(extra);
  }

  return shuffle(picks, rng)
    .slice(0, 9)
    .map((s) => ({
      id: s.item.id,
      item: s.item,
      strength: s.score >= 2 ? 2 : s.score === 1 ? 1 : 0,
    }));
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BundleBuilder() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [roundIndex, setRoundIndex] = useState(0);
  const [persona, setPersona] = useState<BundlePersona>(PERSONAS[0]);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const lastTapAt = useRef(0);
  const timerRef = useRef<number | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);

  const personaQueue = useMemo(() => {
    // Deterministic persona rotation per session, starting at a random offset.
    const offset = Math.floor(Math.random() * PERSONAS.length);
    return Array.from({ length: ROUND_COUNT }, (_, i) => PERSONAS[(offset + i) % PERSONAS.length]);
  }, [gameState === 'start']); // rotate on each new session

  const strongAvailable = tiles.filter((t) => t.strength === 2).length;
  const correctPicks = selectedIds.filter((id) => {
    const tile = tiles.find((t) => t.id === id);
    return tile?.strength === 2;
  }).length;

  const startRound = useCallback(
    (index: number) => {
      if (index >= ROUND_COUNT) {
        setGameState('end');
        return;
      }
      const nextPersona = personaQueue[index];
      const nextTiles = buildRoundTiles(nextPersona, Date.now() + index);
      setPersona(nextPersona);
      setTiles(nextTiles);
      setSelectedIds([]);
      setTimeLeft(ROUND_SECONDS);
      setRoundIndex(index);
      setGameState('playing');
    },
    [personaQueue],
  );

  const startGame = useCallback(() => {
    setResults([]);
    setTotalScore(0);
    startRound(0);
  }, [startRound]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, roundIndex]);

  // Lock in results when time expires or max picks reached
  useEffect(() => {
    if (gameState !== 'playing') return;
    if (timeLeft === 0 || selectedIds.length >= MAX_PICKS) {
      finalizeRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selectedIds.length, gameState]);

  const finalizeRound = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGameState('reveal');
    const correct = selectedIds.filter((id) => {
      const t = tiles.find((tt) => tt.id === id);
      return t?.strength === 2;
    }).length;
    const roundResult: RoundResult = {
      personaId: persona.id,
      correctPicks: correct,
      strongAvailable,
      timeLeft,
    };
    const speedBonus = Math.max(0, timeLeft * 2);
    const roundScore = Math.min(100, correct * 30 + speedBonus);
    setResults((prev) => [...prev, roundResult]);
    setTotalScore((prev) => prev + roundScore);
    if (roundScore > 0) recordQuizScore(roundScore);
    if (correct === 3) celebrate({ intensity: 'heavy' });

    revealTimeoutRef.current = window.setTimeout(() => {
      startRound(roundIndex + 1);
    }, REVEAL_MS);
  }, [persona.id, roundIndex, selectedIds, startRound, strongAvailable, tiles, timeLeft]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  const handleTileTap = (tileId: string) => {
    if (gameState !== 'playing') return;
    const now = Date.now();
    if (now - lastTapAt.current < TAP_DEBOUNCE_MS) return;
    lastTapAt.current = now;

    setSelectedIds((prev) => {
      if (prev.includes(tileId)) {
        return prev.filter((id) => id !== tileId);
      }
      if (prev.length >= MAX_PICKS) return prev;
      return [...prev, tileId];
    });
  };

  // ── Start screen ────────────────────────────────────────────────────────────

  if (gameState === 'start') {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-t-magenta/10 shadow-inner">
          <ShoppingBag className="h-10 w-10 text-t-magenta" />
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Bundle Builder</h3>
          <p className="mt-2 text-sm font-medium text-t-dark-gray max-w-sm mx-auto">
            Meet the customer. Pick 3 accessories that fit their life in 14 seconds. Perfect bundles unlock confetti and keep the round moving fast.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 max-w-sm mx-auto text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-muted mb-3">How it plays</p>
          <ul className="space-y-2 text-xs font-medium text-t-dark-gray">
            <li className="flex items-center gap-2"><Target className="w-4 h-4 text-t-magenta" /> 3 strong matches hidden in the 9-tile grid</li>
            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-warning-accent" /> Enough time to read the customer, then grab the obvious wins</li>
            <li className="flex items-center gap-2"><Trophy className="w-4 h-4 text-success-accent" /> 4 rounds — top reps earn Momentum badges</li>
          </ul>
        </div>

        <button
          onClick={startGame}
          className="focus-ring w-full max-w-sm mx-auto rounded-xl bg-t-magenta py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(226,0,116,0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Round 1
        </button>
      </div>
    );
  }

  // ── End screen ──────────────────────────────────────────────────────────────

  if (gameState === 'end') {
    const perfectRounds = results.filter((r) => r.correctPicks === 3).length;
    const totalPossible = ROUND_COUNT * 3;
    const totalHits = results.reduce((sum, r) => sum + r.correctPicks, 0);
    const accuracy = Math.round((totalHits / totalPossible) * 100);
    const isWin = accuracy >= 50;

    return (
      <div className="space-y-5 py-2">
        <div className="text-center">
          <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ${isWin ? 'bg-t-magenta' : 'bg-t-dark-gray'}`}>
            {isWin ? <Trophy className="h-8 w-8" /> : <RotateCcw className="h-8 w-8" />}
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
            {isWin ? 'Bundles Closed!' : 'Keep Building'}
          </h3>
          <p className="mt-1 text-sm font-medium text-t-dark-gray">
            {totalHits} of {totalPossible} strong matches &mdash;{' '}
            <span className="font-black text-t-magenta">{accuracy}%</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="glass-stat rounded-xl p-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Points</p>
            <p className="mt-1 text-lg font-black text-foreground">{totalScore}</p>
          </div>
          <div className="glass-stat rounded-xl p-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Perfect</p>
            <p className="mt-1 text-lg font-black text-foreground">{perfectRounds}/{ROUND_COUNT}</p>
          </div>
          <div className="glass-stat rounded-xl p-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Accuracy</p>
            <p className="mt-1 text-lg font-black text-foreground">{accuracy}%</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Round Breakdown</p>
          {results.map((r, i) => {
            const p = PERSONAS.find((pp) => pp.id === r.personaId);
            const isPerfect = r.correctPicks === 3;
            return (
              <div key={i} className="glass-card flex items-center gap-3 rounded-xl px-3 py-2.5">
                <span className="text-lg shrink-0" aria-hidden="true">{p?.emoji ?? '👤'}</span>
                <p className="flex-1 text-xs font-medium text-t-dark-gray truncate">{p?.name ?? 'Round'}</p>
                <span className="text-[10px] font-black uppercase tracking-wider text-t-dark-gray">
                  {r.correctPicks}/{r.strongAvailable}
                </span>
                {isPerfect ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success-accent" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-error-accent/60" />
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={startGame}
          className="focus-ring w-full rounded-xl bg-t-magenta py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-md transition-transform hover:scale-[1.01] active:scale-[0.98]"
        >
          Play Again
        </button>
      </div>
    );
  }

  // ── Playing / Reveal ────────────────────────────────────────────────────────

  const isReveal = gameState === 'reveal';

  return (
    <div className="space-y-4">
      {/* Header: persona + round progress */}
      <div className="flex items-center justify-between glass-card px-4 py-2 rounded-xl">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-t-magenta" />
          <span className="text-sm font-black tabular-nums">{totalScore}</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-t-dark-gray">
          Round {roundIndex + 1}/{ROUND_COUNT}
        </span>
      </div>

      {/* Shrinking timer bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-t-light-gray/40">
        <motion.div
          key={`timer-${roundIndex}`}
          className="h-full rounded-full bg-t-magenta"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: isReveal ? 0 : timeLeft / ROUND_SECONDS }}
          transition={{ duration: isReveal ? 0.3 : 1, ease: 'linear' }}
          style={{ transformOrigin: 'left' }}
        />
      </div>

      {/* Persona card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`persona-${roundIndex}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          className="glass-elevated rounded-2xl p-4 border-2 border-t-magenta/20 bg-t-magenta/5"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
              style={{ background: persona.avatarBg }}
              aria-hidden="true"
            >
              {persona.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-t-muted">Customer</p>
              <p className="text-sm font-black text-foreground truncate">{persona.name}</p>
            </div>
          </div>
          <p className="mt-3 text-[12px] font-medium leading-snug text-t-dark-gray">
            {persona.blurb}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Selection hint */}
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-t-dark-gray">
        <span>Pick {MAX_PICKS} accessories</span>
        <span className="tabular-nums text-t-magenta">{selectedIds.length}/{MAX_PICKS}</span>
      </div>

      {/* 3x3 grid */}
      <div className="grid grid-cols-3 gap-2">
        {tiles.map((tile) => {
          const isSelected = selectedIds.includes(tile.id);
          const isStrong = tile.strength === 2;
          const isWrong = tile.strength === 0;

          let tileClass = 'border-t-light-gray bg-surface text-t-dark-gray';
          if (!isReveal && isSelected) {
            tileClass = 'border-t-magenta bg-t-magenta/10 text-foreground';
          }
          if (isReveal) {
            if (isStrong) {
              tileClass = 'border-success-accent bg-success-surface text-success-foreground';
            } else if (isSelected && isWrong) {
              tileClass = 'border-error-accent bg-error-surface text-error-foreground';
            } else if (isSelected) {
              tileClass = 'border-warning-accent bg-warning-surface text-warning-foreground';
            } else {
              tileClass = 'border-t-light-gray/50 bg-surface opacity-60 text-t-muted';
            }
          }

          return (
            <button
              key={tile.id}
              type="button"
              disabled={isReveal}
              onClick={() => handleTileTap(tile.id)}
              className={`focus-ring relative flex min-h-[92px] flex-col justify-between rounded-xl border-2 p-2.5 text-left transition-all active:scale-[0.97] ${tileClass}`}
              style={{ touchAction: 'manipulation' }}
            >
              {isReveal && isStrong && (
                <CheckCircle2 className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-success-accent" />
              )}
              {isReveal && isSelected && isWrong && (
                <XCircle className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-error-accent" />
              )}
              <span className="text-[10px] font-black uppercase tracking-wider text-t-muted">
                {tile.item.category}
              </span>
              <span className="text-[11px] font-bold leading-snug break-words">
                {tile.item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reveal banner */}
      <AnimatePresence>
        {isReveal && (
          <motion.div
            key="reveal-banner"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-xl border-2 p-3 text-center ${
              correctPicks === 3
                ? 'border-success-accent bg-success-surface text-success-foreground'
                : correctPicks >= 1
                ? 'border-warning-accent bg-warning-surface text-warning-foreground'
                : 'border-error-accent bg-error-surface text-error-foreground'
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest">
              {correctPicks === 3 ? 'Perfect bundle!' : `${correctPicks}/${strongAvailable} strong matches`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
