import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Zap, RefreshCw } from 'lucide-react';
import { getTopScores, LeaderboardEntry } from '../../services/leaderboardService';

interface LeaderboardViewProps {
  onExit: () => void;
}

const maskToken = (token: string) => {
  const trimmed = token.trim();
  if (trimmed.length <= 3) return `${trimmed}***`;
  return `${trimmed.slice(0, 3).toUpperCase()}***`;
};

const formatTs = (ts: number) => {
  try {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
};

export default function LeaderboardView({ onExit }: LeaderboardViewProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getTopScores(10).then((scores) => {
      setEntries(scores);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="glass-stage glass-specular relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] p-6 sm:p-10">
      <div className="relative z-10 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            className="focus-ring glass-control inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-t-dark-gray transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Exit
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            aria-label="Refresh leaderboard"
            className="focus-ring glass-control inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-t-dark-gray transition-colors hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="text-center">
          <p className="type-kicker text-t-magenta">Manager Dashboard</p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-[0.15em] text-foreground sm:text-5xl">
            High Scores
          </h1>
          <div className="glass-utility mx-auto mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1">
            <Trophy className="h-3 w-3 text-t-magenta" />
            <span className="text-[10px] font-black uppercase tracking-widest text-t-dark-gray">
              Anonymous · No PII
            </span>
          </div>
        </div>

        <div className="glass-reading rounded-2xl p-2 sm:p-4">
          <div className="grid grid-cols-[2rem_1fr_2fr_1fr_4.5rem] items-center gap-2 px-3 pb-2 text-[9px] font-black uppercase tracking-widest text-t-muted sm:gap-4">
            <span>#</span>
            <span>Initials</span>
            <span>Team</span>
            <span className="text-right">Score</span>
            <span className="text-right">Date</span>
          </div>

          {loading && !entries && (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="glass-control h-10 animate-pulse rounded-xl"
                />
              ))}
            </div>
          )}

          {!loading && entries && entries.length === 0 && (
            <div className="py-12 text-center">
              <Zap className="mx-auto mb-3 h-8 w-8 text-t-magenta/70" />
              <p className="text-sm font-black uppercase tracking-widest text-foreground">
                Insert coin
              </p>
              <p className="mt-1 text-[11px] font-medium text-t-dark-gray">
                No scores yet. Play a round of T-LIFE Runner to lock your spot.
              </p>
            </div>
          )}

          {entries && entries.length > 0 && (
            <ol className="space-y-1.5">
              {entries.map((entry, idx) => {
                const rank = idx + 1;
                const isTop = rank <= 3;
                const rankColor =
                  rank === 1
                    ? 'text-warning-accent'
                    : rank === 2
                      ? 'text-info-accent'
                    : rank === 3
                      ? 'text-t-magenta'
                      : 'text-t-dark-gray';
                return (
                  <motion.li
                    key={`${entry.ts}-${entry.initials}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className={`grid grid-cols-[2rem_1fr_2fr_1fr_4.5rem] items-center gap-2 rounded-xl px-3 py-2.5 sm:gap-4 ${
                      isTop ? 'glass-feature' : 'glass-reading'
                    }`}
                  >
                    <span className={`font-mono text-sm font-black ${rankColor}`}>
                      {String(rank).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-lg font-black tracking-[0.2em] text-foreground">
                      {entry.initials}
                    </span>
                    <span className="truncate font-mono text-[11px] font-bold uppercase text-t-dark-gray">
                      {maskToken(entry.teamToken)}
                    </span>
                    <span className="text-right font-mono text-base font-black tabular-nums text-t-magenta">
                      {entry.score.toLocaleString()}
                    </span>
                    <span className="text-right font-mono text-[10px] font-bold text-t-muted">
                      {formatTs(entry.ts)}
                    </span>
                  </motion.li>
                );
              })}
            </ol>
          )}
        </div>

        <p className="text-center text-[10px] font-medium uppercase tracking-widest text-t-muted">
          Scores persist locally · Mock KV store
        </p>
      </div>
    </div>
  );
}
