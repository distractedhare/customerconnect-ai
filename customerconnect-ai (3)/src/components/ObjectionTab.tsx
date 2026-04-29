import React, { useState } from 'react';
import {
  AlertCircle, CheckCircle2, Sparkles, Zap, Loader2,
  MessageSquare, Target, Briefcase, Lightbulb, ShieldCheck, RefreshCw,
  ChevronDown, ChevronRight, KeyRound, Smartphone, ArrowRightLeft,
  Wifi, CircleDollarSign, Wrench, MessageSquareWarning, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SalesContext, SalesScript, ObjectionAnalysis } from '../types';
import {
  OBJECTION_PLAYBOOK,
  ObjectionCategory,
  ObjectionScenario,
  ObjectionStep,
  getSuggestedCategories,
} from '../data/objectionPlaybook';
import GroundingSources from './GroundingSources';

// ---------------------------------------------------------------------------
// Icon map — maps string icon names from playbook to lucide components
// ---------------------------------------------------------------------------
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  KeyRound,
  Smartphone,
  ArrowRightLeft,
  Wifi,
  CircleDollarSign,
  Wrench,
  MessageSquareWarning,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface ObjectionTabProps {
  context: SalesContext;
  script: SalesScript | null;
  selectedObjections: string[];
  setSelectedObjections: React.Dispatch<React.SetStateAction<string[]>>;
  selectedGamePlanItems: string[];
  objectionResult: ObjectionAnalysis | null;
  analyzing: boolean;
  onAnalyze: () => void;
  onClearResult: () => void;
}

// ---------------------------------------------------------------------------
// Step-by-step guide component (for flows like pin reset)
// ---------------------------------------------------------------------------
function StepGuide({ steps }: { steps: ObjectionStep[] }) {
  const [currentStep, setCurrentStep] = useState(0);
  return (
    <div className="mt-3 space-y-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-2">
        Step-by-Step Guide
      </p>
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentStep(i)}
            className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
              isActive
                ? 'border-t-magenta bg-t-magenta/5'
                : isDone
                  ? 'border-success-border bg-success-surface'
                  : 'border-t-light-gray bg-surface opacity-60'
            }`}
          >
            <div className="flex items-start gap-2">
              <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                isActive ? 'bg-t-magenta text-white' : isDone ? 'bg-success-accent text-white' : 'bg-t-light-gray text-t-muted'
              }`}>
                {isDone ? '✓' : i + 1}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider ${
                  isActive ? 'text-t-magenta' : isDone ? 'text-success-foreground' : 'text-t-muted'
                }`}>
                  {step.gate}
                </p>
                {isActive && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-1.5 text-xs font-bold text-t-dark-gray"
                  >
                    {step.script}
                  </motion.p>
                )}
              </div>
            </div>
          </button>
        );
      })}
      {currentStep < steps.length - 1 && (
        <button
          type="button"
          onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
          className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-t-magenta flex items-center justify-center gap-1 hover:text-t-magenta/70 transition-colors"
        >
          Next Step <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scenario card — expands on tap to show quick response
// ---------------------------------------------------------------------------
function ScenarioCard({ scenario, isExpanded, onToggle, isSelected, onSelect }: {
  scenario: ObjectionScenario;
  isExpanded: boolean;
  onToggle: () => void;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div className={`rounded-2xl border-2 transition-all ${
      isSelected
        ? 'border-t-magenta shadow-md shadow-t-magenta/10'
        : 'border-t-light-gray'
    }`}>
      {/* Header — tap to expand */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={`${scenario.label} — tap to ${isExpanded ? 'collapse' : 'expand'}`}
        className="focus-ring w-full p-3.5 text-left flex items-start gap-3 rounded-2xl"
      >
        <ChevronRight className={`w-4 h-4 mt-0.5 shrink-0 text-t-muted transition-transform ${
          isExpanded ? 'rotate-90' : ''
        }`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-t-dark-gray">{scenario.label}</p>
          <p className="text-[11px] text-t-muted font-medium mt-0.5">{scenario.description}</p>
        </div>
        {isSelected && (
          <CheckCircle2 className="w-4 h-4 text-t-magenta shrink-0 mt-0.5" />
        )}
      </button>

      {/* Expanded: quick response + tip + steps */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3.5 pb-3.5 space-y-3">
              {/* Quick Response */}
	              <div className="p-3 rounded-xl bg-t-magenta/5 border border-t-magenta/15">
	                <p className="text-[9px] font-black uppercase tracking-widest text-t-magenta mb-1.5 flex items-center gap-1">
	                  <MessageSquare className="w-2.5 h-2.5" /> Say This
	                </p>
	                <p className="text-xs font-bold leading-relaxed text-t-dark-gray">
	                  {scenario.quickResponse}
	                </p>
	              </div>

	              {/* Coaching Tip */}
	              <div className="rounded-xl border border-t-light-gray bg-t-light-gray/25 p-3">
	                <p className="mb-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-t-berry">
	                  <Lightbulb className="w-2.5 h-2.5" /> Coach's Tip
	                </p>
	                <p className="text-xs text-t-dark-gray font-medium leading-relaxed">
	                  {scenario.tip}
                </p>
              </div>

              {/* Step-by-step guide if present */}
              {scenario.steps && scenario.steps.length > 0 && (
                <StepGuide steps={scenario.steps} />
              )}

              {/* Select for deep dive button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-t-magenta text-white'
                    : 'bg-t-light-gray/30 text-t-dark-gray hover:bg-t-magenta/10 hover:text-t-magenta'
                }`}
              >
                {isSelected ? (
                  <><CheckCircle2 className="w-3 h-3" /> Selected for Deep Dive</>
                ) : (
                  <><Zap className="w-3 h-3" /> Queue Deep Strategy</>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category accordion
// ---------------------------------------------------------------------------
function CategorySection({ category, expandedScenario, setExpandedScenario, selectedObjections, toggleObjection, isSuggested }: {
  category: ObjectionCategory;
  expandedScenario: string | null;
  setExpandedScenario: (id: string | null) => void;
  selectedObjections: string[];
  toggleObjection: (id: string) => void;
  isSuggested: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = ICON_MAP[category.icon] || AlertCircle;
  const selectedCount = category.scenarios.filter(s => selectedObjections.includes(s.id)).length;

  return (
    <div className={`rounded-2xl border-2 transition-all ${
      isOpen ? 'border-t-magenta/30 shadow-sm' : isSuggested ? 'border-t-magenta/20' : 'border-t-light-gray'
    }`}>
      {/* Category header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={`${category.label} — ${category.scenarios.length} scenarios`}
        className="focus-ring w-full p-4 text-left flex items-center gap-3 rounded-2xl"
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isOpen ? 'bg-t-magenta text-white' : isSuggested ? 'bg-t-magenta/10 text-t-magenta' : 'bg-t-light-gray/30 text-t-muted'
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-t-dark-gray">{category.label}</p>
            {selectedCount > 0 && (
              <span className="bg-t-magenta text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {selectedCount}
              </span>
            )}
            {isSuggested && !isOpen && selectedCount === 0 && (
              <span className="text-[8px] font-black uppercase tracking-widest text-t-magenta bg-t-magenta/10 px-1.5 py-0.5 rounded-full">
                Suggested
              </span>
            )}
          </div>
          <p className="text-[11px] text-t-muted font-medium mt-0.5">{category.description}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-t-dark-gray/30 transition-transform shrink-0 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {/* Scenarios */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {category.scenarios.map(scenario => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isExpanded={expandedScenario === scenario.id}
                  onToggle={() => setExpandedScenario(
                    expandedScenario === scenario.id ? null : scenario.id
                  )}
                  isSelected={selectedObjections.includes(scenario.id)}
                  onSelect={() => toggleObjection(scenario.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ObjectionTab component
// ---------------------------------------------------------------------------
export default function ObjectionTab({
  context, script,
  selectedObjections, setSelectedObjections, selectedGamePlanItems,
  objectionResult, analyzing, onAnalyze, onClearResult,
}: ObjectionTabProps) {
  // script is available for future use when Gemma integration adjusts responses
  void script;
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const suggestedCategories = getSuggestedCategories(context.purchaseIntent);

  const toggleObjection = (id: string) => {
    setSelectedObjections(prev =>
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  return (
    <motion.section
      key="objections"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="rounded-3xl glass-card p-5 shadow-sm">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-2">
          <AlertCircle className="w-5 h-5 text-t-magenta" /> Objection Coach
        </h2>
        <p className="text-xs text-t-dark-gray font-medium">
          Start with the fastest likely category, grab one <strong className="text-t-magenta">quick comeback</strong>, then queue only the blockers that need a deeper strategy.
        </p>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <TriageCard
          title="1. Triage"
          body="Open the most likely category first so the rep gets to a usable response in one tap."
        />
        <TriageCard
          title="2. Quick Comeback"
          body="Use the short response and coach note before you open the longer strategic lane."
        />
        <TriageCard
          title="3. Deep Strategy"
          body="Queue only the tricky scenarios you want the longer analysis to blend together."
        />
      </div>

      {/* Context badge */}
      {selectedGamePlanItems.length > 0 && (
        <div className="bg-t-magenta/5 border border-t-magenta/20 rounded-xl p-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-t-magenta shrink-0" />
          <p className="text-xs text-t-dark-gray font-medium">
            <span className="font-bold text-t-magenta">{selectedGamePlanItems.length}</span> game plan move{selectedGamePlanItems.length === 1 ? '' : 's'} marked — deep dive will account for these.
          </p>
        </div>
      )}

      {/* Category accordions */}
      <div className="space-y-2">
        {OBJECTION_PLAYBOOK.map(category => (
          <CategorySection
            key={category.id}
            category={category}
            expandedScenario={expandedScenario}
            setExpandedScenario={setExpandedScenario}
            selectedObjections={selectedObjections}
            toggleObjection={toggleObjection}
            isSuggested={suggestedCategories.includes(category.id)}
          />
        ))}
      </div>

      {/* Sticky Flip the Script button */}
      {selectedObjections.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 z-10"
        >
	          <button
	            type="button"
	            onClick={onAnalyze}
	            disabled={analyzing}
	            aria-busy={analyzing}
	            aria-label={`Build deep response for ${selectedObjections.length} selected scenarios`}
	            className="focus-ring w-full rounded-2xl bg-t-magenta py-4 font-black uppercase tracking-widest text-white shadow-[0_14px_28px_rgba(226,0,116,0.22)] transition-all hover:bg-t-berry disabled:cursor-not-allowed disabled:opacity-50"
	          >
            {analyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 text-t-magenta" />
                Build Deep Response — {selectedObjections.length} Selected
              </>
            )}
          </button>
        </motion.div>
      )}
    </motion.section>
  );
}

function TriageCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-t-light-gray bg-surface-elevated px-3 py-3">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-t-magenta">{title}</p>
      <p className="mt-1 text-[11px] font-medium leading-relaxed text-t-dark-gray">{body}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results display (preserved from original with minor cleanup)
// ---------------------------------------------------------------------------
export function ObjectionResults({ result, onClear }: { result: ObjectionAnalysis; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
          <Zap className="w-6 h-6 text-t-magenta" /> Objection Strategy
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="focus-ring text-xs font-black text-t-dark-gray hover:text-t-magenta flex items-center gap-1.5 transition-colors uppercase tracking-widest rounded"
        >
          <RefreshCw className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="rounded-3xl glass-card p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <MessageSquare className="w-3 h-3 text-t-magenta" /> Key Talking Points
        </h3>
        <div className="space-y-3">
          {result.talkingPoints.map((point, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-t-light-gray/20 border border-t-light-gray">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-t-magenta shrink-0" />
              <p className="text-sm text-t-dark-gray font-medium break-words">{point}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl glass-card p-6 shadow-sm">
        <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Target className="w-3 h-3 text-t-magenta" /> How to Respond
        </h3>
        <div className="space-y-3">
	          {result.counterArguments.map((arg, i) => (
	            <div key={i} className="rounded-2xl border border-t-magenta/10 bg-t-magenta/5 p-4 text-sm font-bold break-words text-t-magenta">
	              {arg}
	            </div>
	          ))}
        </div>
      </div>

      {result.pivotPlays && result.pivotPlays.length > 0 && (
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-t-magenta" /> Pivot Plays
          </h3>
          <div className="space-y-3">
	            {result.pivotPlays.map((pivot, i) => (
	              <div
	                key={`${pivot.strategy}-${i}`}
	                className="rounded-2xl border border-white/10 bg-gradient-to-r from-pivot-start to-pivot-end p-4 text-white shadow-lg shadow-black/10"
	              >
	                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-2">{pivot.strategy}</p>
	                <p className="text-sm font-bold break-words">{pivot.script}</p>
	              </div>
	            ))}
          </div>
        </div>
      )}

      {result.carrierSpecificArguments && result.carrierSpecificArguments.length > 0 && (
        <div className="rounded-3xl glass-card p-6 shadow-sm">
          <h3 className="text-[10px] font-black text-t-dark-gray uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Briefcase className="w-3 h-3 text-t-magenta" /> Carrier Weak Spots
          </h3>
          <div className="space-y-3">
	            {result.carrierSpecificArguments.map((arg, i) => (
	              <div key={i} className="rounded-2xl border border-t-magenta/10 bg-t-magenta/5 p-4 text-sm font-bold break-words text-t-magenta">
	                {arg}
	              </div>
	            ))}
          </div>
        </div>
      )}

      {result.coachsCorner && (
        <div className="bg-t-magenta/10 rounded-3xl border-2 border-t-magenta/20 p-6 shadow-sm">
	          <h3 className="text-[10px] font-black text-t-magenta uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
	            <Lightbulb className="w-3 h-3 text-t-magenta" /> Coach's Corner
	          </h3>
	          <p className="text-sm font-bold text-t-dark-gray">
	            {result.coachsCorner}
	          </p>
	        </div>
      )}

      <GroundingSources sources={result.groundingSources} />

      <div className="bg-t-magenta rounded-3xl p-6 text-white shadow-lg shadow-t-magenta/20">
        <h3 className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" /> Stay Compliant
        </h3>
        <p className="text-xs leading-relaxed font-bold">
          {result.complianceNotes}
        </p>
      </div>
    </motion.div>
  );
}
