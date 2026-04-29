import { useState } from 'react';
import { 
  Smartphone, Watch, Wifi, Zap, 
  CheckCircle2, ArrowRightLeft, Lightbulb, Info,
  RefreshCw, ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { TROUBLESHOOTING_DATA, TroubleshootingCategory } from '../data/troubleshootingData';

const ICON_MAP: Record<string, any> = {
  Smartphone,
  Watch,
  Wifi,
  Zap
};

interface TroubleshootingPivotProps {
  initialCategory?: string;
}

export default function TroubleshootingPivot({ initialCategory }: TroubleshootingPivotProps) {
  const [selectedCategory, setSelectedCategory] = useState<TroubleshootingCategory>(() => {
    if (initialCategory) {
      const found = TROUBLESHOOTING_DATA.find(c => c.id === initialCategory.toLowerCase() || c.name.toLowerCase().includes(initialCategory.toLowerCase()));
      if (found) return found;
    }
    return TROUBLESHOOTING_DATA[0];
  });
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const toggleStep = (id: string) => {
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const Icon = ICON_MAP[selectedCategory.icon] || Info;

  return (
    <div className="space-y-4">
      <div className="glass-stage rounded-3xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-t-magenta/10">
            <RefreshCw className="h-5 w-5 text-t-magenta" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-foreground">Fix Toolkit</h2>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-t-dark-gray">
              Triage the issue first, work the cleanest self-serve steps, then use the handoff card only if the caller truly needs another lane.
            </p>
          </div>
        </div>
      </div>

      {/* Category Selection - Compact Scrollable on Mobile */}
      <div className="glass-capsule flex gap-2 overflow-x-auto rounded-[1.75rem] p-2 no-scrollbar sm:grid sm:grid-cols-4 sm:overflow-visible">
        {TROUBLESHOOTING_DATA.map((cat) => {
          const CatIcon = ICON_MAP[cat.icon] || Info;
          const isActive = selectedCategory.id === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat);
                setCompletedSteps([]);
              }}
              className={`focus-ring flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 transition-all sm:flex-col sm:px-2 sm:py-3 ${
                isActive 
                  ? 'glass-control-active text-white'
                  : 'glass-control text-t-dark-gray hover:text-foreground'
              }`}
            >
              <CatIcon className={`h-4 w-4 ${isActive ? 'text-t-magenta' : 'text-t-dark-gray'}`} />
              <span className="text-xs font-black tracking-tight">{cat.name}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        <section className="glass-feature rounded-2xl p-4">
          <p className="type-kicker text-info-foreground">Best next move</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <QuickStep label="1. Confirm the issue" copy={`Make sure the caller is really in the ${selectedCategory.name.toLowerCase()} lane before you start solving.`} />
            <QuickStep label="2. Work the repair path" copy="Use the steps below in order so the rep sounds structured and calm." />
            <QuickStep label="3. Escalate cleanly" copy="Only transfer once you can explain what was tried and what the next team owns." />
          </div>
        </section>

        {/* Troubleshooting Steps */}
        <section className="glass-stage-quiet rounded-2xl p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-t-magenta/10">
                <Icon className="h-4 w-4 text-t-magenta" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold tracking-tight">{selectedCategory.name} Repair Path</h2>
                <p className="mt-1 text-xs font-medium text-t-dark-gray">Keep the rep focused on the next useful action, not the whole script at once.</p>
              </div>
            </div>
            <span className="type-kicker text-t-magenta">
              {completedSteps.length}/{selectedCategory.steps.length}
            </span>
          </div>

          <div className="space-y-2">
            {selectedCategory.steps.map((step) => (
              <button
                key={step.id}
                onClick={() => toggleStep(step.id)}
                className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all ${
                  completedSteps.includes(step.id)
                    ? 'glass-feature'
                    : 'glass-reading'
                }`}
              >
                <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  completedSteps.includes(step.id)
                    ? 'border-transparent bg-t-magenta text-white'
                    : 'border-t-dark-gray/25 bg-white/70 dark:bg-white/8'
                }`}>
                  {completedSteps.includes(step.id) && <CheckCircle2 className="h-2.5 w-2.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${completedSteps.includes(step.id) ? 'text-t-magenta line-through opacity-70' : 'text-foreground'}`}>
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-t-dark-gray leading-relaxed">
                    {step.action}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="glass-feature mt-4 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-t-magenta" />
              <div>
                <p className="type-kicker text-t-magenta">Escalate only if needed</p>
                <p className="mt-1 text-xs font-medium text-foreground leading-relaxed">
                  {selectedCategory.transferCriteria}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sales Pivots */}
        <section className="glass-stage-quiet relative overflow-hidden rounded-2xl p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-t-magenta text-white">
              <Lightbulb className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-extrabold tracking-tight">Sales Pivots</h2>
          </div>

          <div className="space-y-3">
            {selectedCategory.pivots.map((pivot, i) => (
              <div key={i} className="glass-reading rounded-xl p-3">
                <div className="mb-1 flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-t-magenta" />
                  <span className="type-kicker text-t-dark-gray">{pivot.condition}</span>
                </div>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  "{pivot.pitch}"
                </p>
                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-white/50 p-1.5 dark:bg-black/20">
                  <Zap className="h-2.5 w-2.5 text-t-magenta" />
                  <span className="text-xs font-semibold text-t-magenta">Benefit: {pivot.benefit}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Department Quick Links */}
        <section className="glass-stage-quiet rounded-2xl p-4 shadow-sm">
          <h3 className="type-kicker mb-3 text-t-dark-gray">Escalation Cards</h3>
          <div className="grid gap-2 md:grid-cols-3">
            {[
              {
                name: 'Tech Support',
                when: 'Device/network troubleshooting needs a specialist',
                handoff: 'Warm-transfer with the issue, steps already tried, and what changed.',
              },
              {
                name: 'Account Care',
                when: 'Billing, access, or account ownership blocks the fix',
                handoff: 'Summarize the account blocker so the caller does not repeat the story.',
              },
              {
                name: 'Home Internet Team',
                when: 'Address eligibility, install, or gateway setup needs HINT ownership',
                handoff: 'Share availability status plus any setup steps already completed.',
              },
            ].map((dept) => (
              <div key={dept.name} className="glass-reading rounded-2xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-black tracking-tight text-foreground">{dept.name}</p>
                  <ArrowUpRight className="h-3.5 w-3.5 text-t-magenta" />
                </div>
                <p className="mt-2 text-xs font-medium leading-relaxed text-t-dark-gray">{dept.when}</p>
                <div className="mt-3 rounded-xl bg-t-light-gray/25 p-2">
                  <p className="type-micro text-t-magenta">Say this in the handoff</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-t-dark-gray">{dept.handoff}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function QuickStep({ label, copy }: { label: string; copy: string }) {
  return (
    <div className="glass-reading rounded-2xl px-3 py-3">
      <p className="type-micro text-info-foreground">{label}</p>
      <p className="mt-1 text-xs font-medium leading-relaxed text-info-foreground">{copy}</p>
    </div>
  );
}
