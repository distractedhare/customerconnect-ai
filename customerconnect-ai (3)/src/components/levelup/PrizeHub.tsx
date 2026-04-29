import { useEffect, useState } from 'react';
import { Award, Calendar, Gift, Star, Ticket, Trophy } from 'lucide-react';
import { getPrizeData, PRIZE_TIERS } from '../../services/prizeService';

export default function PrizeHub() {
  const [prizeData, setPrizeData] = useState(() => getPrizeData());
  const dailyProgress = Math.min((prizeData.daily.cellsCompleted / 8) * 100, 100);
  const weeklyProgress = Math.min((prizeData.weekly.totalRows / 3) * 100, 100);
  const monthlyProgress = Math.min((prizeData.monthly.longestStreak / 15) * 100, 100);
  const ticketsEarned = prizeData.history.length;
  const dailyStillWithinReach = Math.max(8 - prizeData.daily.cellsCompleted, 0);

  useEffect(() => {
    const refresh = () => setPrizeData(getPrizeData());
    refresh();
    const intervalId = window.setInterval(refresh, 4000);
    window.addEventListener('focus', refresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-[1.9rem] bg-gradient-to-br from-t-magenta to-t-berry p-6 text-white shadow-lg shadow-t-magenta/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/90">
              <Award className="h-3.5 w-3.5" />
              Prize Hub
            </div>
            <h3 className="mt-3 text-3xl font-black uppercase tracking-tight">Make the fun feel earned</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium text-white/85">
              Lead with current progress first so reps know what is still realistically within reach today, this week, and this month.
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/75">Tickets earned</p>
            <p className="mt-1 text-3xl font-black">{ticketsEarned}</p>
            <p className="mt-1 text-[10px] font-medium text-white/75">Daily, weekly, and monthly wins logged locally.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <HeroStat label="Today" value={prizeData.daily.momentumEarned ? 'Momentum Locked' : `${dailyStillWithinReach} cells left`} />
          <HeroStat label="This Week" value={prizeData.weekly.raffleEntered ? 'Lunch Entry Ready' : `${Math.max(3 - prizeData.weekly.totalRows, 0)} rows to go`} />
          <HeroStat label="This Month" value={prizeData.monthly.raffleEntered ? 'Grand Draw Ready' : `${Math.max(15 - prizeData.monthly.longestStreak, 0)} days left`} />
          <HeroStat label="Runner Trivia" value={prizeData.daily.quizCompleted ? `${prizeData.daily.quizScore ?? 0}%` : 'No score yet'} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
        <div className="space-y-4">
          <ProgressCard
            icon={<Star className="h-4 w-4 text-t-magenta" />}
            badge="Daily Target"
            title={PRIZE_TIERS.daily.label}
            subtitle={PRIZE_TIERS.daily.reward}
            progress={dailyProgress}
            progressLabel={`${prizeData.daily.cellsCompleted}/8 cells`}
            helper={
              prizeData.daily.momentumEarned
                ? 'The daily badge is already secured. Anything else today is extra momentum.'
                : 'Clear 8 cells on the single Bingo board. Runner trivia can still train knowledge, but Bingo owns the badge.'
            }
          />

          <ProgressCard
            icon={<Calendar className="h-4 w-4 text-t-dark-gray" />}
            badge="Weekly Push"
            title={PRIZE_TIERS.weekly.label}
            subtitle={PRIZE_TIERS.weekly.reward}
            progress={weeklyProgress}
            progressLabel={`${prizeData.weekly.totalRows}/3 rows`}
            helper={
              prizeData.weekly.raffleEntered
                ? 'Weekly raffle entry is already earned. Keep stacking rows to build the story for managers and VPs.'
                : 'Bingo rows are the cleanest weekly meter. Use the near-complete row callouts to finish what is already close.'
            }
          />

          <ProgressCard
            icon={<Trophy className="h-4 w-4 text-warning-accent" />}
            badge="Monthly Draw"
            title={PRIZE_TIERS.monthly.label}
            subtitle={PRIZE_TIERS.monthly.reward}
            progress={monthlyProgress}
            progressLabel={`${prizeData.monthly.longestStreak}/15 days`}
            helper={
              prizeData.monthly.raffleEntered
                ? 'Monthly draw entry is already banked. Keep the streak alive so the momentum still feels real.'
                : 'This is the VP view: sustained rep behavior over time, not just one hot day.'
            }
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-t-light-gray bg-surface p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">Momentum loop</p>
            <div className="mt-3 space-y-2">
              <LoopRow label="Rep view" value={prizeData.daily.momentumEarned ? 'Today is already a win.' : 'What can I still earn today?'} />
              <LoopRow label="Manager view" value={prizeData.weekly.raffleEntered ? 'Weekly target is on track.' : 'Which behaviors are one row away?'} />
              <LoopRow label="VP view" value={prizeData.monthly.longestStreak >= 10 ? 'Sustained behavior is visible.' : 'Momentum needs a longer runway.'} />
            </div>
          </div>

          <div className="rounded-2xl border border-t-light-gray bg-surface p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">Monthly draw</p>
            <div className="mt-3 grid gap-2">
              {['WFH Week', '$25 Amazon', '$25 DoorDash', '$25 Lotto'].map((title) => (
                <div key={title} className="flex items-center gap-2 rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-3">
                  <Gift className="h-4 w-4 text-t-magenta" />
                  <span className="text-[11px] font-bold text-foreground">{title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-info-border bg-info-surface p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-info-foreground">Why this matters</p>
            <p className="mt-2 text-[11px] font-medium leading-relaxed text-info-foreground">
              Prizes work best when the dashboard feels live and specific. Reps should see the next reachable win, not just a poster of incentives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/70">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function ProgressCard({
  icon,
  badge,
  title,
  subtitle,
  progress,
  progressLabel,
  helper,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  progress: number;
  progressLabel: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-t-light-gray bg-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">{badge}</p>
          <h4 className="mt-1 text-lg font-black tracking-tight text-foreground">{title}</h4>
          <p className="mt-1 text-[11px] font-medium text-t-dark-gray">{subtitle}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-t-magenta/8">
          {icon}
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-t-light-gray/50">
        <div className="h-full rounded-full bg-t-magenta transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-muted">{progressLabel}</p>
        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-t-magenta">
          <Ticket className="h-3 w-3" />
          Progress
        </div>
      </div>

      <p className="mt-3 text-[11px] font-medium leading-relaxed text-t-dark-gray">{helper}</p>
    </div>
  );
}

function LoopRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-t-light-gray bg-surface-elevated px-3 py-3">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-muted">{label}</p>
      <p className="mt-1 text-[11px] font-medium leading-relaxed text-foreground">{value}</p>
    </div>
  );
}
