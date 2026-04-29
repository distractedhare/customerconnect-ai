import { BingoCell, FREE_SPACE, getBoardLayout, getFeaturedBoardId } from '../constants/bingoBoard';

const BINGO_PROGRESS_KEY = 'bingo-progress-v2';
const BINGO_STREAK_KEY = 'bingo-streak-v2';

export interface BingoBoardProgress {
  completedCellIds: string[];
  completedAtByCell: Record<string, number>;
  reflectionsByCell: Record<string, string>;
  celebratedRowKeys: string[];
  startedAt: number | null;
  completedAt: number | null;
  lastUpdated: number | null;
}

export interface BingoStreakData {
  count: number;
  best: number;
  lastDate: string;
}

export interface BingoStats {
  completedCount: number;
  weeklyCompletedCount: number;
  rowCount: number;
  streak: number;
  bestStreak: number;
  progressPct: number;
}

export interface BingoToggleResult {
  progress: BingoBoardProgress;
  stats: BingoStats;
  newRowKeys: string[];
  boardCompletedNow: boolean;
}

const WINNING_LINES: number[][] = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24],
  [0, 5, 10, 15, 20],
  [1, 6, 11, 16, 21],
  [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23],
  [4, 9, 14, 19, 24],
  [0, 6, 12, 18, 24],
  [4, 8, 12, 16, 20],
];

function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function yesterdayKey(date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return todayKey(yesterday);
}

function getWeekStart(date = new Date()): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? 6 : day - 1;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diff);
  return start;
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so the board still works in-memory.
  }
}

function defaultProgress(): BingoBoardProgress {
  return {
    completedCellIds: [FREE_SPACE.id],
    completedAtByCell: {},
    reflectionsByCell: {},
    celebratedRowKeys: [],
    startedAt: null,
    completedAt: null,
    lastUpdated: null,
  };
}

function normalizeProgress(raw: Partial<BingoBoardProgress> | null | undefined): BingoBoardProgress {
  const completedCellIds = Array.isArray(raw?.completedCellIds) ? raw.completedCellIds.filter(Boolean) : [];
  const uniqueCompleted = new Set<string>([FREE_SPACE.id, ...completedCellIds]);

  return {
    completedCellIds: [...uniqueCompleted],
    completedAtByCell: raw?.completedAtByCell && typeof raw.completedAtByCell === 'object'
      ? Object.fromEntries(
          Object.entries(raw.completedAtByCell)
            .filter(([, value]) => typeof value === 'number' && Number.isFinite(value))
        )
      : {},
    reflectionsByCell: raw?.reflectionsByCell && typeof raw.reflectionsByCell === 'object'
      ? Object.fromEntries(
          Object.entries(raw.reflectionsByCell)
            .filter(([, value]) => typeof value === 'string')
        )
      : {},
    celebratedRowKeys: Array.isArray(raw?.celebratedRowKeys) ? raw.celebratedRowKeys.filter(Boolean) : [],
    startedAt: typeof raw?.startedAt === 'number' ? raw.startedAt : null,
    completedAt: typeof raw?.completedAt === 'number' ? raw.completedAt : null,
    lastUpdated: typeof raw?.lastUpdated === 'number' ? raw.lastUpdated : null,
  };
}

function getAllProgress(): Record<string, BingoBoardProgress> {
  const raw = readStorage<Record<string, Partial<BingoBoardProgress>>>(BINGO_PROGRESS_KEY, {});
  return Object.fromEntries(
    Object.entries(raw).map(([boardId, progress]) => [boardId, normalizeProgress(progress)])
  );
}

function saveBoardProgress(boardId: string, progress: BingoBoardProgress): void {
  const store = getAllProgress();
  store[boardId] = normalizeProgress(progress);
  writeStorage(BINGO_PROGRESS_KEY, store);
}

export function getBoardProgress(boardId: string): BingoBoardProgress {
  return normalizeProgress(getAllProgress()[boardId]);
}

export function getFeaturedBoardProgress(): BingoBoardProgress {
  return getBoardProgress(getFeaturedBoardId());
}

export function getWinningLines(completedIds: Set<string>, board: BingoCell[]): { winningLines: number[][]; winningRowKeys: string[] } {
  const winningLines = WINNING_LINES.filter((line) => line.every((index) => completedIds.has(board[index].id)));
  return {
    winningLines,
    winningRowKeys: winningLines.map((line) => line.join('-')),
  };
}

export function getStreakData(): BingoStreakData {
  const raw = readStorage<Partial<BingoStreakData>>(BINGO_STREAK_KEY, {
    count: 0,
    best: 0,
    lastDate: '',
  });

  return {
    count: typeof raw.count === 'number' ? raw.count : 0,
    best: typeof raw.best === 'number' ? raw.best : 0,
    lastDate: typeof raw.lastDate === 'string' ? raw.lastDate : '',
  };
}

function saveStreakData(data: BingoStreakData): void {
  writeStorage(BINGO_STREAK_KEY, data);
}

export function updateStreak(now = Date.now()): BingoStreakData {
  const data = getStreakData();
  const today = todayKey(new Date(now));
  const yesterday = yesterdayKey(new Date(now));

  if (data.lastDate === today) {
    return data;
  }

  const nextCount = data.lastDate === yesterday ? data.count + 1 : 1;
  const nextData = {
    count: nextCount,
    best: Math.max(data.best, nextCount),
    lastDate: today,
  };

  saveStreakData(nextData);
  return nextData;
}

export function getBingoStats(boardId: string): BingoStats {
  const board = getBoardLayout(boardId);
  const progress = getBoardProgress(boardId);
  const completedIds = new Set(progress.completedCellIds);
  const { winningLines } = getWinningLines(completedIds, board);
  const streak = getStreakData();
  const weekStart = getWeekStart().getTime();

  const weeklyCompletedCount = progress.completedCellIds.filter((cellId) => {
    if (cellId === FREE_SPACE.id) return true;
    const completedAt = progress.completedAtByCell[cellId];
    return typeof completedAt === 'number' && completedAt >= weekStart;
  }).length;

  return {
    completedCount: completedIds.size,
    weeklyCompletedCount,
    rowCount: winningLines.length,
    streak: streak.count,
    bestStreak: streak.best,
    progressPct: Math.round((completedIds.size / board.length) * 100),
  };
}

export function toggleBingoCell(boardId: string, cellId: string, reflection?: string): BingoToggleResult {
  const board = getBoardLayout(boardId);
  const progress = getBoardProgress(boardId);
  const completedIds = new Set(progress.completedCellIds);

  if (cellId === FREE_SPACE.id) {
    return {
      progress,
      stats: getBingoStats(boardId),
      newRowKeys: [],
      boardCompletedNow: false,
    };
  }

  const now = Date.now();
  const wasCompleted = completedIds.has(cellId);

  if (wasCompleted) {
    completedIds.delete(cellId);
    delete progress.completedAtByCell[cellId];
    delete progress.reflectionsByCell[cellId];
    progress.completedAt = null;
  } else {
    completedIds.add(cellId);
    progress.completedAtByCell[cellId] = now;
    if (reflection) {
      progress.reflectionsByCell[cellId] = reflection;
    }
    progress.startedAt ??= now;
    updateStreak(now);
  }

  progress.completedCellIds = [...completedIds];
  progress.lastUpdated = now;

  const { winningRowKeys } = getWinningLines(completedIds, board);
  const newRowKeys = winningRowKeys.filter((rowKey) => !progress.celebratedRowKeys.includes(rowKey));

  if (newRowKeys.length > 0) {
    progress.celebratedRowKeys = [...new Set([...progress.celebratedRowKeys, ...newRowKeys])];
  }

  const boardCompletedNow = completedIds.size === board.length && !progress.completedAt;
  if (boardCompletedNow) {
    progress.completedAt = now;
  }

  saveBoardProgress(boardId, progress);

  return {
    progress,
    stats: getBingoStats(boardId),
    newRowKeys,
    boardCompletedNow,
  };
}

export function formatBingoDuration(startedAt: number | null, endedAt: number | null): string {
  if (!startedAt) return 'Just started';

  const end = endedAt ?? Date.now();
  const diffMs = Math.max(end - startedAt, 0);
  const totalMinutes = Math.round(diffMs / 60000);

  if (totalMinutes < 60) {
    return `${Math.max(totalMinutes, 1)} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours} hr`;
  }

  return `${hours}h ${minutes}m`;
}
