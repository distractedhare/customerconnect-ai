/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Award, Brain, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useStore } from '../../store';

const difficultyLabel = (difficulty: number) => {
  if (difficulty <= 1) return 'Foundation';
  if (difficulty === 2) return 'Skilled';
  if (difficulty === 3) return 'Advanced';
  return 'Elite';
};

// Header kicker variants. Most prompts are a "Signal Check"; HESITATION-
// prefixed prompts (the customer-objection beats) escalate to "Kip Challenge";
// elite-difficulty signals get the "Bonus Round" treatment.
const triviaSurfaceLabel = (question: string, difficulty: number): string => {
  if (question.startsWith('HESITATION:')) return 'Kip Challenge';
  if (difficulty >= 4) return 'Bonus Round';
  return 'Signal Check';
};

export const TriviaModal: React.FC = () => {
  const currentTriviaQuestion = useStore((state) => state.currentTriviaQuestion);
  const triviaFeedback = useStore((state) => state.triviaFeedback);
  const answerTrivia = useStore((state) => state.answerTrivia);
  const closeTrivia = useStore((state) => state.closeTrivia);

  if (!currentTriviaQuestion) return null;

  const surfaceLabel = triviaSurfaceLabel(
    currentTriviaQuestion.question,
    currentTriviaQuestion.difficulty,
  );

  return (
    <div className="absolute inset-0 z-[120] bg-black/65 backdrop-blur-2xl p-4 flex items-center justify-center pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-2xl rounded-[2rem] overflow-hidden border border-white/10 bg-[#0A0A12]/95 text-white shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
      >
        <div className="px-6 py-5 bg-gradient-to-r from-[#E20074] to-[#8A2BE2] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              {currentTriviaQuestion.question.startsWith('HESITATION:') ? <ShieldAlert size={24} /> : <Brain size={24} />}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-white/65">{surfaceLabel}</div>
              <div className="text-2xl font-black font-cyber italic">{difficultyLabel(currentTriviaQuestion.difficulty)} signal</div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] uppercase tracking-[0.25em]">
              {currentTriviaQuestion.category}
            </div>
            <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] uppercase tracking-[0.25em]">
              Difficulty {currentTriviaQuestion.difficulty}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {!triviaFeedback ? (
            <>
              <div className="text-2xl md:text-3xl font-black leading-tight mb-8">
                {currentTriviaQuestion.question.replace('HESITATION: ', '')}
              </div>
              <div className="grid gap-4">
                {currentTriviaQuestion.options.map((option, idx) => (
                  <button
                    key={`${currentTriviaQuestion.id}-${idx}`}
                    onClick={() => answerTrivia(idx)}
                    className="w-full p-5 rounded-[1.4rem] border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-2xl border border-[#E20074]/30 bg-[#E20074]/10 text-[#ff8cc6] flex items-center justify-center font-black group-hover:bg-[#E20074] group-hover:text-white transition-colors">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div className="flex-1 text-white/88 leading-relaxed font-semibold">{option}</div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 border ${
                  triviaFeedback.correct ? 'bg-green-500/15 border-green-400/40' : 'bg-red-500/15 border-red-400/40'
                }`}
              >
                {triviaFeedback.correct ? <Award size={46} className="text-green-400" /> : <X size={46} className="text-red-400" />}
              </motion.div>

              <div className={`text-4xl font-black font-cyber italic mb-4 ${triviaFeedback.correct ? 'text-green-400' : 'text-red-400'}`}>
                {triviaFeedback.correct ? 'Correct' : 'Close'}
              </div>
              <div className="max-w-xl mx-auto text-lg text-white/85 leading-relaxed mb-5">{triviaFeedback.msg}</div>
              {triviaFeedback.explanation && (
                <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5 text-left max-w-xl mx-auto mb-8">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#E20074] mb-2 flex items-center gap-2"><Sparkles size={12} /> Why this matters</div>
                  <div className="text-white/80 leading-relaxed">{triviaFeedback.explanation}</div>
                </div>
              )}
              <button
                onClick={closeTrivia}
                className="w-full py-5 rounded-2xl bg-[#E20074] font-black uppercase tracking-[0.3em] hover:scale-[1.01] transition-all"
              >
                Back to run
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-white/5 border-t border-white/10 text-[10px] uppercase tracking-[0.35em] text-white/40 flex items-center justify-center gap-2">
          <AlertCircle size={12} /> Faster thinking. Cleaner closes.
        </div>
      </motion.div>
    </div>
  );
};
