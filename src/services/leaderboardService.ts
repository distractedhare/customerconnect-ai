export interface LeaderboardEntry {
  initials: string;
  teamToken: string;
  score: number;
  ts: number;
}

const STORE_KEY = 'cc-leaderboard-v1';
const FAIL_RATE = 0.05;
const MAX_ENTRIES = 100;

const normalizeInitials = (raw: string) =>
  raw.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3);

function readStore(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(entries: LeaderboardEntry[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(entries));
  } catch {
    /* quota / disabled storage — silent */
  }
}

async function mockNetwork(): Promise<void> {
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 200));
  if (Math.random() < FAIL_RATE) throw new Error('mock-kv-unreachable');
}

export async function submitScore(
  initials: string,
  teamToken: string,
  score: number,
): Promise<boolean> {
  try {
    await mockNetwork();
    const cleanInitials = normalizeInitials(initials);
    const cleanToken = (teamToken ?? '').trim();
    const cleanScore = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    if (cleanInitials.length !== 3 || !cleanToken) return false;

    const entries = readStore();
    entries.push({
      initials: cleanInitials,
      teamToken: cleanToken,
      score: cleanScore,
      ts: Date.now(),
    });
    entries.sort((a, b) => b.score - a.score || a.ts - b.ts);
    writeStore(entries.slice(0, MAX_ENTRIES));
    return true;
  } catch {
    return false;
  }
}

export async function getTopScores(limit = 20): Promise<LeaderboardEntry[]> {
  try {
    await mockNetwork();
    return readStore().slice(0, limit);
  } catch {
    return [];
  }
}
