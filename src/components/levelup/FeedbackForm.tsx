import { useState } from 'react';
import { Send, CheckCircle2, Star, ThumbsUp, ThumbsDown, Meh, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Rating = 1 | 2 | 3 | 4 | 5;

interface QuickQuestion {
  id: string;
  label: string;
  options: { value: string; label: string; icon?: typeof ThumbsUp }[];
}

const QUESTIONS: QuickQuestion[] = [
  {
    id: 'useful',
    label: 'Is the app helping you on calls?',
    options: [
      { value: 'yes', label: 'Yes', icon: ThumbsUp },
      { value: 'sometimes', label: 'Sometimes', icon: Meh },
      { value: 'not-really', label: 'Not really', icon: ThumbsDown },
    ],
  },
  {
    id: 'frequency',
    label: 'How often are you using it?',
    options: [
      { value: 'every-call', label: 'Every call' },
      { value: 'few-times', label: 'A few times a day' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'rarely', label: 'Rarely' },
    ],
  },
  {
    id: 'favorite',
    label: 'Most useful feature?',
    options: [
      { value: 'instant-plays', label: 'Instant Plays' },
      { value: 'game-plan', label: 'Game Plan' },
      { value: 'objections', label: 'Objection Handler' },
      { value: 'devices', label: 'Device Lookup' },
      { value: 'accessories', label: 'Accessories' },
      { value: 'hint', label: 'Home Internet' },
    ],
  },
  {
    id: 'missing',
    label: 'What\'s missing?',
    options: [
      { value: 'more-promos', label: 'More promos' },
      { value: 'plan-compare', label: 'Plan comparison' },
      { value: 'scripts', label: 'More scripts' },
      { value: 'nothing', label: 'Nothing — it\'s good' },
    ],
  },
];

const CONTACT_EMAIL = 'branden.schulze2@t-mobile.com';

export default function FeedbackForm() {
  const [step, setStep] = useState<'questions' | 'comment' | 'sent'>('questions');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [overallRating, setOverallRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState('');
  const [hardestObjection, setHardestObjection] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const allAnswered = QUESTIONS.every(q => answers[q.id]);

  const handleSend = async () => {
    setSending(true);
    setSendError(null);

    // Build labeled answers for the email
    const labeledAnswers: Record<string, string> = {};
    for (const q of QUESTIONS) {
      const answer = answers[q.id];
      const option = q.options.find(o => o.value === answer);
      labeledAnswers[q.label] = option?.label || answer || 'Skipped';
    }

    if (hardestObjection.trim()) {
      labeledAnswers['Hardest objection right now'] = hardestObjection.trim();
    }

    const payload = {
      rating: overallRating,
      answers: labeledAnswers,
      comment: comment.trim() || null,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStep('sent');
      } else {
        // Fallback to mailto if the API isn't configured yet
        const subject = encodeURIComponent(
          `[CustomerConnect AI Feedback] ${overallRating ? overallRating + '/5' : 'Quick feedback'}`
        );
        const lines = [
          'ANONYMOUS FEEDBACK — CustomerConnect AI',
          `Overall Rating: ${overallRating ? overallRating + '/5' : 'Not rated'}`,
          '',
          '--- Quick Answers ---',
          ...Object.entries(labeledAnswers).map(([q, a]) => `${q}: ${a}`),
          '',
          '--- Comments ---',
          comment.trim() || '(none)',
          '',
          `Sent: ${new Date().toLocaleString()}`,
        ];
        const body = encodeURIComponent(lines.join('\n'));
        window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
        setStep('sent');
      }
    } catch {
      // Network error — fall back to mailto
      const subject = encodeURIComponent('[CustomerConnect AI Feedback]');
      const body = encodeURIComponent(
        Object.entries(labeledAnswers).map(([q, a]) => `${q}: ${a}`).join('\n')
        + (comment ? '\n\nComments: ' + comment : '')
      );
      window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, '_blank');
      setStep('sent');
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setStep('questions');
    setAnswers({});
    setOverallRating(null);
    setComment('');
    setHardestObjection('');
    setSendError(null);
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* STEP 1: Quick questions */}
        {step === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-1">Step 1 of 2</p>
              <h3 className="text-lg font-black uppercase tracking-tight">Quick Feedback</h3>
              <p className="text-xs text-t-dark-gray font-medium mt-1">
                What helps, what doesn't, what's missing — 100% anonymous
              </p>
            </div>

            {/* Overall rating */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-t-dark-gray">Overall, how's the app?</p>
              <div className="flex gap-2 justify-center">
                {([1, 2, 3, 4, 5] as Rating[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setOverallRating(r)}
                    className={`focus-ring p-2 rounded-xl transition-all ${
                      overallRating && r <= overallRating
                        ? 'bg-t-magenta text-white shadow-lg shadow-t-magenta/20'
                        : 'bg-surface-elevated text-t-muted hover:bg-t-magenta/10 hover:text-t-magenta'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${overallRating && r <= overallRating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick questions */}
            {QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-2">
                <p className="text-xs font-bold text-t-dark-gray">{q.label}</p>
                <div className="flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleAnswer(q.id, opt.value)}
                        className={`focus-ring flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-[10px] font-bold uppercase tracking-wide transition-all ${
                          selected
                            ? 'bg-t-magenta text-white border-t-magenta shadow-lg shadow-t-magenta/20'
                            : 'bg-[var(--bg-intent)] text-[var(--text-intent)] border-[var(--border-intent)] hover:border-t-magenta/50 hover:bg-t-magenta/5'
                        }`}
                      >
                        {opt.icon && <opt.icon className="w-3 h-3" />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('comment')}
                disabled={!allAnswered}
                className={`focus-ring flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  allAnswered
                    ? 'bg-t-magenta text-white shadow-lg shadow-t-magenta/30'
                    : 'bg-[var(--border-surface)] text-[var(--text-tertiary)]'
                }`}
              >
                {allAnswered ? 'Next — Add a comment (optional)' : 'Answer all to continue'}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Optional comment + send */}
        {step === 'comment' && (
          <motion.div
            key="comment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-1">Step 2 of 2</p>
              <h3 className="text-lg font-black uppercase tracking-tight">Anything else?</h3>
              <p className="text-xs text-t-dark-gray font-medium mt-1">
                Both fields are optional — skip them and hit send, or give us the details.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-t-dark-gray">Hardest objection you're hearing right now?</p>
              <input
                type="text"
                value={hardestObjection}
                onChange={(e) => setHardestObjection(e.target.value)}
                placeholder='e.g. "I can get the same plan cheaper at Verizon"'
                className="focus-ring glass-reading w-full rounded-xl px-4 py-3 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-t-dark-gray">General comments or ideas</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bugs? Feature ideas? Things you love? Lay it on me..."
                rows={3}
                className="focus-ring glass-reading w-full rounded-2xl p-4 text-sm font-medium text-foreground placeholder:text-t-dark-gray/30 resize-none transition-all"
              />
            </div>

            {sendError && (
              <p className="text-xs font-bold text-error-accent text-center">{sendError}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('questions')}
                className="focus-ring glass-control px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-all"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="focus-ring cta-primary flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Feedback
                  </>
                )}
              </button>
            </div>

            <p className="text-[9px] text-t-muted font-medium text-center">
              Submitted anonymously — no names, no IDs, no tracking.
            </p>
          </motion.div>
        )}

        {/* SENT — Success */}
        {step === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-8"
          >
            <div className="glass-feature mx-auto flex h-16 w-16 items-center justify-center rounded-full">
              <CheckCircle2 className="w-8 h-8 text-t-magenta" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">Thank you!</h3>
            <p className="text-sm text-t-dark-gray font-medium max-w-xs mx-auto">
              Your anonymous feedback helps make this tool better for everyone on the floor.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="focus-ring glass-control px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-t-dark-gray transition-all"
            >
              Send another
            </button>

            <div className="glass-reading mt-6 rounded-xl p-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-t-muted mb-2">
                Want to share more? Reach out directly
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-xs font-bold text-t-magenta hover:text-t-berry transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                {CONTACT_EMAIL}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
