import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Trophy, Clock, Target, Lightbulb } from 'lucide-react';
import { BingoCell as BingoCellType, getBoardLayout, getBoardById, getFeaturedBoardId } from '../../constants/bingoBoard';
import { formatBingoDuration, getBingoStats, getBoardProgress, getWinningLines, toggleBingoCell } from '../../services/bingoService';
import { recordBingoCellCompleted, recordBingoRows, recordStreak } from '../../services/prizeService';
import { heavyCrash, successBuzz } from '../../utils/haptics';
import BingoCell from './BingoCell';
import BingoCelebration from './BingoCelebration';
import { pickKipLine } from '../../services/kip/kipVoice';

const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function celebrateRow(): void {
  if (prefersReducedMotion()) return;
  void confetti({
    particleCount: 90,
    spread: 68,
    startVelocity: 28,
    scalar: 0.9,
    colors: ['#E20074', '#FFFFFF', '#861B54'],
    origin: { y: 0.72 },
  });
}

function celebrateBoard(): void {
  if (prefersReducedMotion()) return;
  void confetti({
    particleCount: 160,
    spread: 82,
    startVelocity: 34,
    scalar: 1,
    colors: ['#E20074', '#FFFFFF', '#861B54'],
    origin: { y: 0.62 },
  });

  window.setTimeout(() => {
    void confetti({
      particleCount: 120,
      spread: 120,
      startVelocity: 26,
      scalar: 0.95,
      colors: ['#E20074', '#FFFFFF', '#861B54'],
      origin: { x: 0.22, y: 0.66 },
    });
    void confetti({
      particleCount: 120,
      spread: 120,
      startVelocity: 26,
      scalar: 0.95,
      colors: ['#E20074', '#FFFFFF', '#861B54'],
      origin: { x: 0.78, y: 0.66 },
    });
  }, 160);
}

const LINE_META = [
  { label: 'Top Row', indexes: [0, 1, 2, 3, 4] },
  { label: 'Middle Row', indexes: [10, 11, 12, 13, 14] },
  { label: 'Bottom Row', indexes: [20, 21, 22, 23, 24] },
  { label: 'Diagonal', indexes: [0, 6, 12, 18, 24] },
];

export default function BingoBoard() {
  const activeBoardId = getFeaturedBoardId();
  const [progress, setProgress] = useState(() => getBoardProgress(activeBoardId));
  const [rowToast, setRowToast] = useState<{ count: number } | null>(null);
  const [rowSlam, setRowSlam] = useState<{ id: number; count: number } | null>(null);
  const [boardCelebration, setBoardCelebration] = useState(false);

  const activeBoard = useMemo(() => getBoardById(activeBoardId), [activeBoardId]);
  const board = useMemo(() => getBoardLayout(activeBoardId), [activeBoardId]);
  const stats = useMemo(() => getBingoStats(activeBoardId), [activeBoardId, progress]);

  const completedIds = useMemo(() => new Set(progress.completedCellIds), [progress.completedCellIds]);
  const { winningLines } = useMemo(() => getWinningLines(completedIds, board), [board, completedIds]);
  const winningIndices = useMemo(() => new Set(winningLines.flat()), [winningLines]);
  const durationLabel = useMemo(() => formatBingoDuration(progress.startedAt, progress.completedAt), [progress.completedAt, progress.startedAt]);
  const lineProgress = useMemo(
    () => LINE_META.map((line) => ({
      ...line,
      filled: line.indexes.filter((index) => completedIds.has(board[index].id)).length,
    })),
    [board, completedIds]
  );
  const nearCompleteLines = lineProgress.filter((line) => line.filled === 4);
  const rowToastLine = useMemo(
    () => (rowToast ? pickKipLine('celebrateBingoRow', `${rowToast.count}`) : ''),
    [rowToast]
  );

  useEffect(() => {
    if (!rowToast) return undefined;
    const timeoutId = window.setTimeout(() => setRowToast(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [rowToast]);

  useEffect(() => {
    if (!rowSlam) return undefined;
    const timeoutId = window.setTimeout(() => setRowSlam(null), 1200);
    return () => window.clearTimeout(timeoutId);
  }, [rowSlam]);

  const handleToggle = useCallback((cell: BingoCellType, reflection?: string) => {
    const wasCompleted = completedIds.has(cell.id);
    const result = toggleBingoCell(activeBoardId, cell.id, reflection);
    setProgress(result.progress);

    if (!wasCompleted) {
      navigator.vibrate?.(50);
      recordBingoCellCompleted();
      recordStreak(result.stats.streak);
    }

    if (result.newRowKeys.length > 0 && !result.boardCompletedNow) {
      celebrateRow();
      successBuzz();
      setRowToast({ count: result.newRowKeys.length });
      setRowSlam({ id: Date.now(), count: result.newRowKeys.length });
      recordBingoRows(result.stats.rowCount);
    } else if (result.newRowKeys.length > 0) {
      // Row lines also cleared on the winning move — record them but let the board celebration carry the moment
      recordBingoRows(result.stats.rowCount);
    }

    if (result.boardCompletedNow) {
      celebrateBoard();
      heavyCrash();
      setBoardCelebration(true);
    }
  }, [activeBoardId, completedIds]);

  return (
    <div className="space-y-3 sm:space-y-5">
      {/* Board header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-t-magenta">Single Bingo Game</p>
            <h3 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-foreground">{activeBoard.name}</h3>
            <p className="mt-1 text-[12px] sm:text-sm font-medium text-t-dark-gray leading-snug">{activeBoard.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass-stat rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">
              {stats.progressPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Mini Lesson Callout — collapsible on mobile to save vertical space */}
      <details className="glass-card group rounded-xl border-l-4 border-l-t-magenta p-2 sm:p-3 sm:pointer-events-none" open>
        <summary className="flex cursor-pointer select-none items-start gap-2 sm:gap-3 list-none [&::-webkit-details-marker]:hidden">
          <Lightbulb className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-t-magenta" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">GAME PLAN</p>
              <span
                aria-hidden="true"
                className="text-t-magenta transition-transform group-open:rotate-90 sm:hidden text-[11px] font-black leading-none"
              >
                ›
              </span>
            </div>
            <p className="mt-0.5 text-[11px] sm:text-xs font-medium text-t-dark-gray leading-snug line-clamp-1 group-open:line-clamp-none">
              {activeBoard.miniLesson}
            </p>
          </div>
        </summary>
      </details>

      {/* Mobile: compact "almost there" chip only (if any). Desktop: full pacing detail. */}
      {nearCompleteLines.length > 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-info-border bg-info-surface px-3 py-2 sm:hidden">
          <Flame className="h-4 w-4 shrink-0 text-t-berry" />
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-info-foreground">Almost there</p>
            <p className="truncate text-[11px] font-medium text-info-foreground">
              {nearCompleteLines.map((line) => line.label).join(' • ')} — one square away
            </p>
          </div>
        </div>
      ) : null}

      <div className="hidden sm:block rounded-2xl border border-info-border bg-info-surface p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-info-foreground">Board pacing</p>
            <p className="mt-1 text-[11px] font-medium leading-relaxed text-info-foreground">
              The center <strong>FREE</strong> square already counts. Chase the rows that are one move away instead of tapping random tiles.
            </p>
          </div>
          {nearCompleteLines.length > 0 ? (
            <div className="rounded-2xl border border-info-border/70 bg-white/60 px-3 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-info-foreground">Almost there</p>
              <p className="mt-1 text-[10px] font-medium text-info-foreground">
                {nearCompleteLines.map((line) => line.label).join(' • ')}
              </p>
            </div>
          ) : null}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {lineProgress.map((line) => (
            <div key={line.label} className="rounded-2xl border border-info-border/70 bg-white/60 px-3 py-2">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-info-foreground">{line.label}</p>
              <p className="mt-1 text-[10px] font-medium text-info-foreground">{line.filled}/5 squares cleared</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        <StatCard icon={<Target className="h-3 w-3" />} label="Progress" value={`${stats.weeklyCompletedCount}/25`} accent="var(--cat-sales-accent)" />
        <StatCard icon={<Trophy className="h-3 w-3" />} label="Rows" value={`${stats.rowCount}`} accent="var(--cat-skill-accent)" />
        <StatCard icon={<Flame className="h-3 w-3" />} label="Streak" value={`${stats.streak}d`} accent="var(--prize-weekly)" />
        <StatCard icon={<Clock className="h-3 w-3" />} label="Best" value={`${stats.bestStreak}d`} accent="var(--prize-monthly)" />
      </div>

      {/* Bingo grid */}
      <div
        id={`bingo-board-panel-${activeBoardId}`}
        role="tabpanel"
        aria-label={`${activeBoard.name} board`}
        className="glass-elevated rounded-[1.4rem] p-4"
      >
        {/* BINGO header letters */}
        <div className="mb-1.5 sm:mb-3 grid grid-cols-5 gap-1 sm:gap-1.5 text-center">
          {['B', 'I', 'N', 'G', 'O'].map((letter, i) => (
            <div
              key={letter}
              className="rounded-lg sm:rounded-xl py-1 sm:py-2 text-[11px] sm:text-sm font-black uppercase tracking-[0.18em] text-white"
              style={{
                background: `linear-gradient(135deg, #E20074 ${i * 10}%, #861B54 ${100 - i * 10}%)`,
                boxShadow: '0 4px 12px rgba(226, 0, 116, 0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-1 sm:gap-2" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {board.map((cell, index) => (
            <BingoCell
              key={`${activeBoardId}-${cell.id}`}
              cell={cell}
              completed={completedIds.has(cell.id)}
              isWinning={winningIndices.has(index)}
              onToggle={(reflection) => handleToggle(cell, reflection)}
            />
          ))}
        </div>
      </div>

      {/* Board stats footer */}
      <div className="glass-card rounded-xl p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">Board Stats</p>
            <p className="mt-1 text-xs sm:text-sm font-medium text-t-dark-gray">
              Time on this board: <span className="font-black text-foreground">{durationLabel}</span>
            </p>
          </div>
          <div className="glass-stat inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">
            <Trophy className="h-3.5 w-3.5 text-t-magenta" />
            {stats.rowCount > 0 ? `${stats.rowCount} row${stats.rowCount === 1 ? '' : 's'} complete` : 'No rows complete yet'}
          </div>
        </div>
      </div>

      <p className="hidden sm:block text-center text-[10px] font-medium text-t-muted">
        Tap a square to mark it. The FREE center square already counts. Progress saves automatically.
      </p>

      {/* BINGO! slam overlay — fires on row completion */}
      <AnimatePresence>
        {rowSlam && (
          <motion.div
            key={rowSlam.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.4, rotate: -6, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              className="relative"
            >
              <div
                className="absolute inset-0 -m-10 rounded-full blur-3xl"
                style={{ background: 'radial-gradient(closest-side, rgba(226,0,116,0.45), rgba(226,0,116,0))' }}
              />
              <div className="relative flex flex-col items-center gap-1 px-8 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                  {rowSlam.count > 1 ? `${rowSlam.count} lines` : 'Row complete'}
                </p>
                <p
                  className="text-[72px] sm:text-[96px] font-black uppercase leading-none tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E20074 55%, #861B54 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    filter: 'drop-shadow(0 8px 18px rgba(226,0,116,0.55))',
                  }}
                >
                  BINGO!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Row completion toast */}
      <AnimatePresence>
        {rowToast && (
          <motion.div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed left-1/2 z-[90] w-[min(92vw,380px)] -translate-x-1/2 glass-elevated rounded-xl p-4"
            style={{ bottom: 'max(env(safe-area-inset-bottom, 0px) + 1.5rem, 1.5rem)' }}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-t-magenta text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-magenta">
                  Kip · {rowToast.count > 1 ? `${rowToast.count} lines down` : 'Line down'}
                </p>
                <p className="mt-1 text-sm font-medium text-t-dark-gray">{rowToastLine}</p>
              </div>
              <Flame className="h-5 w-5 text-t-berry" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BingoCelebration
        visible={boardCelebration}
        boardName={activeBoard.name}
        durationLabel={durationLabel}
        rowCount={stats.rowCount}
        streakCount={stats.streak}
        onClose={() => setBoardCelebration(false)}
      />
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="glass-stat rounded-xl p-2 sm:p-3">
      <div className="flex items-center gap-1 sm:gap-1.5">
        <span style={{ color: accent }}>{icon}</span>
        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.14em] sm:tracking-[0.18em] text-t-dark-gray">{label}</p>
      </div>
      <p className="mt-1 sm:mt-1.5 text-sm sm:text-lg font-black text-foreground">{value}</p>
    </div>
  );
}
