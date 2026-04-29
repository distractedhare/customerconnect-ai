/**
 * Prize / Reward tracking system.
 *
 * Tiers:
 *  - Daily:   Complete 8+ bingo cells → "Momentum" badge → 15-min break next working day
 *  - Weekly:  3+ bingo rows on the single board → entered in free lunch raffle
 *  - Monthly: 15+ day streak → entered in grand prize raffle
 *
 * All tracking is localStorage — no server needed for the pilot.
 */

const PRIZE_KEY = 'prize-tracker-v1';

export type PrizeTier = 'daily' | 'weekly' | 'monthly';

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  cellsCompleted: number;
  quizScore: number | null; // percentage
  quizCompleted: boolean;
  momentumEarned: boolean;
}

export interface WeeklyProgress {
  weekStart: string; // YYYY-MM-DD (Monday)
  totalRows: number;
  raffleEntered: boolean;
}

export interface MonthlyProgress {
  month: string; // YYYY-MM
  longestStreak: number;
  raffleEntered: boolean;
}

export interface PrizeData {
  daily: DailyProgress;
  weekly: WeeklyProgress;
  monthly: MonthlyProgress;
  history: PrizeHistoryEntry[];
}

export interface PrizeHistoryEntry {
  date: string;
  tier: PrizeTier;
  label: string;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function weekStartKey(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function monthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function defaultPrizeData(): PrizeData {
  return {
    daily: { date: todayKey(), cellsCompleted: 0, quizScore: null, quizCompleted: false, momentumEarned: false },
    weekly: { weekStart: weekStartKey(), totalRows: 0, raffleEntered: false },
    monthly: { month: monthKey(), longestStreak: 0, raffleEntered: false },
    history: [],
  };
}

function readPrizeData(): PrizeData {
  try {
    const raw = localStorage.getItem(PRIZE_KEY);
    if (!raw) return defaultPrizeData();
    const parsed = JSON.parse(raw) as PrizeData;

    // Reset stale periods
    const today = todayKey();
    const week = weekStartKey();
    const month = monthKey();

    if (parsed.daily.date !== today) {
      parsed.daily = { date: today, cellsCompleted: 0, quizScore: null, quizCompleted: false, momentumEarned: false };
    }
    if (parsed.weekly.weekStart !== week) {
      parsed.weekly = { weekStart: week, totalRows: 0, raffleEntered: false };
    }
    if (parsed.monthly.month !== month) {
      parsed.monthly = { month: month, longestStreak: 0, raffleEntered: false };
    }

    return parsed;
  } catch {
    return defaultPrizeData();
  }
}

function savePrizeData(data: PrizeData): void {
  try {
    localStorage.setItem(PRIZE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail
  }
}

export function getPrizeData(): PrizeData {
  return readPrizeData();
}

export function recordBingoCellCompleted(): PrizeData {
  const data = readPrizeData();
  data.daily.cellsCompleted += 1;
  checkDailyPrize(data);
  savePrizeData(data);
  return data;
}

export function recordBingoRows(totalRows: number): PrizeData {
  const data = readPrizeData();
  data.weekly.totalRows = Math.max(data.weekly.totalRows, totalRows);
  checkWeeklyPrize(data);
  savePrizeData(data);
  return data;
}

export function recordQuizScore(score: number): PrizeData {
  const data = readPrizeData();
  data.daily.quizScore = score;
  data.daily.quizCompleted = true;
  checkDailyPrize(data);
  savePrizeData(data);
  return data;
}

export function recordStreak(streak: number): PrizeData {
  const data = readPrizeData();
  data.monthly.longestStreak = Math.max(data.monthly.longestStreak, streak);
  checkMonthlyPrize(data);
  savePrizeData(data);
  return data;
}

function checkDailyPrize(data: PrizeData): void {
  if (data.daily.momentumEarned) return;

  const cellsOk = data.daily.cellsCompleted >= 8;

  if (cellsOk) {
    data.daily.momentumEarned = true;
    data.history.push({
      date: todayKey(),
      tier: 'daily',
      label: 'Momentum Badge — extra 15-min break earned',
    });
  }
}

function checkWeeklyPrize(data: PrizeData): void {
  if (data.weekly.raffleEntered) return;

  if (data.weekly.totalRows >= 3) {
    data.weekly.raffleEntered = true;
    data.history.push({
      date: todayKey(),
      tier: 'weekly',
      label: 'Free Lunch Raffle entry earned',
    });
  }
}

function checkMonthlyPrize(data: PrizeData): void {
  if (data.monthly.raffleEntered) return;

  if (data.monthly.longestStreak >= 15) {
    data.monthly.raffleEntered = true;
    data.history.push({
      date: todayKey(),
      tier: 'monthly',
      label: 'Grand Prize Raffle entry earned',
    });
  }
}

export const PRIZE_TIERS = {
  daily: {
    label: 'Momentum Badge',
    reward: 'Extra 15-min break (next working day)',
    requirement: '8 bingo cells on the single board',
    color: 'var(--prize-daily)',
  },
  weekly: {
    label: 'Lunch Raffle',
    reward: 'Free lunch raffle entry',
    requirement: '3+ bingo rows on the single board',
    color: 'var(--prize-weekly)',
  },
  monthly: {
    label: 'Grand Prize',
    reward: 'Premium raffle — top performer recognition',
    requirement: '15+ day streak this month',
    color: 'var(--prize-monthly)',
  },
} as const;
