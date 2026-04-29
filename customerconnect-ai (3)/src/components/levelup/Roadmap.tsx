import { Rocket, Code2, Calendar, Lightbulb, MessageSquare } from 'lucide-react';

type RoadmapStatus = 'IN DEVELOPMENT' | 'PLANNED' | 'UNDER CONSIDERATION';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    id: 'ios-app',
    title: 'Native iOS App',
    description: 'Full offline support, home screen install, push notifications for promo updates.',
    status: 'IN DEVELOPMENT',
  },
  {
    id: 'android-app',
    title: 'Native Android App',
    description: 'Same features as iOS. Designed for T-Mobile-issued Android devices.',
    status: 'IN DEVELOPMENT',
  },
  {
    id: 'live-promo-sync',
    title: 'Live Promo Sync',
    description: 'Direct connection to T-Mobile promo data — no more manual monthly updates.',
    status: 'PLANNED',
  },
  {
    id: 'team-leaderboard',
    title: 'Team Leaderboard',
    description: 'Optional shared bingo board — see how your squad is performing this week.',
    status: 'PLANNED',
  },
  {
    id: 'social-stories',
    title: 'Social Media Stories',
    description: 'Auto-generate shareable story cards with your wins, streaks, and promo highlights — ready to post on Instagram, TikTok, or the team chat.',
    status: 'PLANNED',
  },
  {
    id: 'promo-countdown',
    title: 'Promo Countdown Timers',
    description: 'Visual countdowns showing days left on active promos — create urgency and never miss an expiring deal.',
    status: 'PLANNED',
  },
  {
    id: 'shift-recap',
    title: 'Shift Recap',
    description: 'End-of-shift summary of plays used, objections handled, and skills practiced — no customer data, just your growth.',
    status: 'UNDER CONSIDERATION',
  },
  {
    id: 'peer-tips',
    title: 'Rep Tips Feed',
    description: 'Anonymous crowd-sourced tips from other reps — "this line crushed it on switchers this week."',
    status: 'UNDER CONSIDERATION',
  },
  {
    id: 'quick-compare',
    title: 'Quick Compare Cards',
    description: 'Tap two plans or devices, get a clean side-by-side to reference mid-call.',
    status: 'UNDER CONSIDERATION',
  },
  {
    id: 'win-tracker',
    title: 'Win Tracker',
    description: 'Log your closes by category — new line, switcher, accessory, HINT. Just counts, no customer info.',
    status: 'UNDER CONSIDERATION',
  },
];

const STATUS_CONFIG: Record<RoadmapStatus, { className: string; dotClass: string; textClass: string; icon: typeof Code2 }> = {
  'IN DEVELOPMENT': {
    className: 'border-t-magenta/20 bg-t-magenta/5',
    dotClass: 'bg-t-magenta/10',
    textClass: 'text-t-magenta',
    icon: Code2,
  },
  'PLANNED': {
    className: 'border-t-berry/20 bg-t-berry/5',
    dotClass: 'bg-t-berry/10',
    textClass: 'text-t-berry',
    icon: Calendar,
  },
  'UNDER CONSIDERATION': {
    className: 'border-t-light-gray bg-t-light-gray/30',
    dotClass: 'bg-t-light-gray',
    textClass: 'text-t-dark-gray',
    icon: Lightbulb,
  },
};

interface RoadmapProps {
  onSwitchToFeedback: () => void;
}

export default function Roadmap({ onSwitchToFeedback }: RoadmapProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-t-berry bg-t-berry/10 px-3 py-1.5 rounded-full mb-3">
          <Rocket className="w-3 h-3" />
          Roadmap
        </div>
        <h3 className="text-xl font-black uppercase tracking-tight">
          What's <span className="text-t-berry">Next</span>
        </h3>
        <p className="text-xs text-t-dark-gray font-medium mt-1 max-w-sm mx-auto">
          Built for virtual retail reps. Growing with your feedback.
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {ROADMAP_ITEMS.map((item) => {
          const config = STATUS_CONFIG[item.status];
          const StatusIcon = config.icon;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-4 shadow-sm transition-all ${config.className}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${config.dotClass}`}
                >
                  <StatusIcon className={`w-3 h-3 ${config.textClass}`} />
                </div>
                <span
                  className={`text-[8px] font-black uppercase tracking-widest ${config.textClass}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="text-sm font-black uppercase tracking-tight">{item.title}</p>
              <p className="text-[11px] text-t-dark-gray font-medium leading-relaxed mt-0.5">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onSwitchToFeedback}
          className="focus-ring inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-t-berry hover:text-t-magenta transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Have an idea? Drop it in the Feedback tab
        </button>
      </div>
    </div>
  );
}
