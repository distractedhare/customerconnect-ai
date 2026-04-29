import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Zap, CheckCircle2, XCircle, Trophy, RotateCcw, Flame } from 'lucide-react';
import { recordQuizScore } from '../../services/prizeService';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import ArcTimer from './ArcTimer';

// --- Game Data ---
interface ObjectionScenario {
  id: string;
  customer: string;
  objection: string;
  options: { text: string; isCorrect: boolean; feedback: string }[];
  emoji: string;
  avatarBg: string;
}

const SCENARIOS: ObjectionScenario[] = [
  {
    id: '1',
    customer: 'Budget-Conscious Bob',
    emoji: '💸',
    avatarBg: 'rgba(226,0,116,0.12)',
    objection: "I don't need Go5G Next, Essentials is cheaper and I just need basic service.",
    options: [
      { text: "Essentials is fine, but you won't get free Netflix.", isCorrect: false, feedback: "Too weak. Focus on the long-term value and upgrade cycle." },
      { text: "With Next, you're upgrade-ready every year, plus the streaming perks usually offset the cost difference.", isCorrect: true, feedback: "Perfect! You highlighted the yearly upgrade and the hidden value of perks." },
      { text: "You have to get Next if you want a good trade-in deal today.", isCorrect: false, feedback: "A bit too aggressive. Sell the value, don't force the requirement." }
    ]
  },
  {
    id: '2',
    customer: 'Skeptical Sarah',
    emoji: '🤔',
    avatarBg: 'rgba(134,27,84,0.12)',
    objection: "I'm not switching from Verizon. Your coverage is terrible where I live.",
    options: [
      { text: "We actually have the largest 5G network now, way bigger than Verizon.", isCorrect: true, feedback: "Strong fact-based pivot. T-Mobile's 5G leadership is the best counter here." },
      { text: "Have you tried us recently? It's gotten better.", isCorrect: false, feedback: "Too passive. Be confident in the network." },
      { text: "Verizon is too expensive anyway, we can save you money.", isCorrect: false, feedback: "Don't just bash the competitor's price when the objection is about coverage." }
    ]
  },
  {
    id: '3',
    customer: 'Tech-Savvy Tom',
    emoji: '🤖',
    avatarBg: 'rgba(0,100,200,0.10)',
    objection: "I don't need a smartwatch. My phone already tells time and tracks my steps.",
    options: [
      { text: "It's only $10 a month to add it to your plan.", isCorrect: false, feedback: "Price isn't the issue, value is. Build value first." },
      { text: "They look really cool and everyone is getting one.", isCorrect: false, feedback: "Bandwagon appeal rarely works on tech-savvy customers." },
      { text: "It's about leaving the phone behind. You can go for a run, stream music, and take calls without carrying a brick in your pocket.", isCorrect: true, feedback: "Nailed it. You sold the lifestyle benefit of cellular connectivity." }
    ]
  },
  {
    id: '4',
    customer: 'Hesitant Hannah',
    emoji: '😬',
    avatarBg: 'rgba(212,160,23,0.12)',
    objection: "I'll just buy a cheap case on Amazon later.",
    options: [
      { text: "Our cases are better quality than Amazon.", isCorrect: false, feedback: "Vague claim. Be specific about the immediate benefit." },
      { text: "If you drop it walking out to your car, it's a $200 screen repair. Let's protect that $1000 investment right now.", isCorrect: true, feedback: "Great use of loss aversion and immediate protection." },
      { text: "You can finance the case on your bill today.", isCorrect: false, feedback: "Financing helps, but you still need to sell the 'why' first." }
    ]
  },
  {
    id: '5',
    customer: 'Loyal Larry',
    emoji: '📱',
    avatarBg: 'rgba(0,165,80,0.10)',
    objection: "I've had this iPhone 11 for 4 years, it works fine. Why upgrade?",
    options: [
      { text: "The battery on the new one is much better.", isCorrect: false, feedback: "True, but not compelling enough on its own." },
      { text: "Your phone is losing trade-in value every day. Right now we can give you $800 for it, next year it might be $200.", isCorrect: true, feedback: "Excellent. You created urgency using trade-in depreciation." },
      { text: "The camera on the new iPhone 15 is amazing.", isCorrect: false, feedback: "Good feature, but doesn't address the 'it works fine' objection directly." }
    ]
  }
];

type GameState = 'start' | 'playing' | 'feedback' | 'end';

export default function ObjectionSmasher() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [resultsByScenario, setResultsByScenario] = useState<boolean[]>([]);

  const timerRef = useRef<number | null>(null);
  const isVisible = usePageVisibility();

  const currentScenario = SCENARIOS[currentScenarioIndex];

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setCurrentScenarioIndex(0);
    setGameState('playing');
    setTimeLeft(15);
    setResultsByScenario([]);
  };

  // Timer logic for playing state — pauses when tab is hidden
  useEffect(() => {
    if (gameState === 'playing' && isVisible) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentScenarioIndex, isVisible]);

  const handleTimeOut = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedOptionIndex(-1); // -1 indicates timeout
    setStreak(0);
    setResultsByScenario((prev) => [...prev, false]);
    setGameState('feedback');
  };

  const handleSelectOption = (index: number) => {
    if (gameState !== 'playing') return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOptionIndex(index);
    const isCorrect = SCENARIOS[currentScenarioIndex].options[index].isCorrect;

    if (isCorrect) {
      setScore(s => s + 100 + (streak * 20)); // Bonus for streaks
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }

    setResultsByScenario((prev) => [...prev, isCorrect]);
    setGameState('feedback');
  };

  const nextScenario = () => {
    if (currentScenarioIndex + 1 >= SCENARIOS.length) {
      setGameState('end');
      // Use correct-answer count for accuracy, not bonus-inflated score
      const accuracy = Math.round((resultsByScenario.filter(Boolean).length / SCENARIOS.length) * 100);
      if (accuracy >= 60) {
        recordQuizScore(accuracy);
      }
    } else {
      setCurrentScenarioIndex(i => i + 1);
      setSelectedOptionIndex(null);
      setTimeLeft(15);
      setGameState('playing');
    }
  };

  if (gameState === 'start') {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-t-magenta/10 shadow-inner">
          <ShieldAlert className="h-10 w-10 text-t-magenta" />
        </div>
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Objection Smasher</h3>
          <p className="mt-2 text-sm font-medium text-t-dark-gray max-w-sm mx-auto">
            Customers throw curveballs. You have 15 seconds to pick the perfect pivot. Build your streak for bonus points!
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 max-w-sm mx-auto text-left">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-muted mb-3">Rules of Engagement</p>
          <ul className="space-y-2 text-xs font-medium text-t-dark-gray">
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-t-magenta" /> 15 seconds per objection</li>
            <li className="flex items-center gap-2"><Flame className="w-4 h-4 text-warning-accent" /> Build streaks for multiplier bonuses</li>
            <li className="flex items-center gap-2"><Trophy className="w-4 h-4 text-success-accent" /> Score high to earn Momentum Badges</li>
          </ul>
        </div>

        <button
          onClick={startGame}
          className="focus-ring w-full max-w-sm mx-auto rounded-xl bg-t-magenta py-4 text-sm font-black uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(226,0,116,0.25)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Smashing
        </button>
      </div>
    );
  }

  if (gameState === 'end') {
    const correctCount = resultsByScenario.filter(Boolean).length;
    const percentage = Math.round((correctCount / SCENARIOS.length) * 100);
    const isWin = percentage >= 60;

    return (
      <div className="space-y-5 py-2">
        {/* Header */}
        <div className="text-center">
          <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ${isWin ? 'bg-t-magenta' : 'bg-t-dark-gray'}`}>
            {isWin ? <Trophy className="h-8 w-8" /> : <RotateCcw className="h-8 w-8" />}
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
            {isWin ? 'Objections Smashed!' : 'Needs Practice'}
          </h3>
          <p className="mt-1 text-sm font-medium text-t-dark-gray">
            {correctCount} of {SCENARIOS.length} correct &mdash;{' '}
            <span className="font-black text-t-magenta">{percentage}%</span>
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-stat rounded-xl p-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Points</p>
            <p className="mt-1 text-lg font-black text-foreground">{score}</p>
          </div>
          <div className="glass-stat rounded-xl p-3 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Accuracy</p>
            <p className="mt-1 text-lg font-black text-foreground">{percentage}%</p>
          </div>
        </div>

        {/* Per-scenario breakdown */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-t-dark-gray">Scenario Breakdown</p>
          {SCENARIOS.map((s, i) => {
            const wasCorrect = resultsByScenario[i];
            const attempted = i < resultsByScenario.length;
            return (
              <div key={s.id} className="glass-card flex items-center gap-3 rounded-xl px-3 py-2.5">
                <span className="text-lg shrink-0" aria-hidden="true">{s.emoji}</span>
                <p className="flex-1 text-xs font-medium text-t-dark-gray truncate">{s.customer}</p>
                {attempted ? (
                  wasCorrect ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-success-accent" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-error-accent" />
                  )
                ) : (
                  <span className="text-[10px] text-t-muted">—</span>
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

  // Playing or Feedback state
  const isFeedback = gameState === 'feedback';
  const isTimeout = selectedOptionIndex === -1;
  const selectedOption = isTimeout ? null : currentScenario.options[selectedOptionIndex!];
  const isCorrect = selectedOption?.isCorrect;

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between glass-card px-4 py-2 rounded-xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-t-magenta" />
            <span className="text-sm font-black tabular-nums">{score}</span>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 text-warning-accent animate-pulse">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-black">{streak}x Streak!</span>
            </div>
          )}
        </div>
        <ArcTimer timeLeft={timeLeft} totalTime={15} size={44} />
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {SCENARIOS.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= currentScenarioIndex ? 'bg-t-magenta' : 'bg-t-light-gray/50'}`} />
        ))}
      </div>

      {/* Scenario Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScenario.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-elevated rounded-2xl p-5 border-2 border-t-magenta/20 bg-t-magenta/5"
        >
          {/* Persona avatar */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl"
              style={{ background: currentScenario.avatarBg }}
              aria-hidden="true"
            >
              {currentScenario.emoji}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-t-muted">Customer</p>
              <p className="text-sm font-black text-foreground">{currentScenario.customer}</p>
            </div>
          </div>
          <p className="text-lg font-black text-t-dark-gray leading-snug">
            "{currentScenario.objection}"
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="space-y-3 pt-2">
        {currentScenario.options.map((opt, i) => {
          let btnClass = "glass-button text-t-dark-gray hover:border-t-magenta/40 hover:bg-t-magenta/5";

          if (isFeedback) {
            if (opt.isCorrect) {
              btnClass = "border-success-accent bg-success-surface text-success-foreground";
            } else if (selectedOptionIndex === i) {
              btnClass = "border-error-accent bg-error-surface text-error-foreground";
            } else {
              btnClass = "opacity-50 glass-button text-t-muted";
            }
          }

          return (
            <button
              key={i}
              disabled={isFeedback}
              onClick={() => handleSelectOption(i)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-bold leading-snug ${btnClass}`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Feedback Panel */}
      <AnimatePresence>
        {isFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <div className={`mt-4 p-4 rounded-xl border-2 ${isCorrect ? 'border-success-accent bg-success-surface' : 'border-error-accent bg-error-surface'}`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-success-accent shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-error-accent shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-xs font-black uppercase tracking-widest mb-1 ${isCorrect ? 'text-success-accent' : 'text-error-accent'}`}>
                    {isTimeout ? "Time's Up!" : isCorrect ? "Nailed it!" : "Not quite."}
                  </p>
                  <p className={`text-sm font-medium ${isCorrect ? 'text-success-foreground' : 'text-error-foreground'}`}>
                    {isTimeout ? "You have to be quick on your feet!" : selectedOption?.feedback}
                  </p>
                </div>
              </div>

              <button
                onClick={nextScenario}
                className={`mt-4 w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-[1.02] active:scale-[0.98] ${
                  isCorrect ? 'bg-success-accent' : 'bg-error-accent'
                }`}
              >
                Next Customer &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
