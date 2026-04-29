import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, RotateCcw, ShieldAlert, Zap, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getRandomQuestions, QuizQuestion } from '../../constants/quizQuestions';
import { recordQuizScore } from '../../services/prizeService';
import { usePageVisibility } from '../../hooks/usePageVisibility';
import { heavyCrash } from '../../utils/haptics';

type GameState = 'start' | 'playing' | 'paused' | 'question' | 'gameover';

interface GameObject {
  id: number;
  type: 'coin' | 'obstacle';
  lane: number; // 0, 1, 2
  y: number;
  markedForDeletion?: boolean;
}

const LANES = 3;
const BASE_SPEED = 2;
const MAX_SPEED = 12;
const SPEED_INCREMENT = 0.003;
const SPAWN_RATE = 60; // frames

const COLORS = {
  background: '#1A1A1A',
  gridLine: 'rgba(226, 0, 116, 0.2)',
  player: '#E20074',
  playerOutline: '#FFFFFF',
  thruster: '#FF00FF',
  coin: '#FFD700',
  coinOutline: '#FFA500',
  obstacle: '#E10000',
  obstacleOutline: '#8B0000',
} as const;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function MagentaRunner() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [displayLane, setDisplayLane] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  // Mutable game state (refs to avoid re-renders during the animation loop)
  const playerLane = useRef(1);
  const objects = useRef<GameObject[]>([]);
  const speed = useRef(BASE_SPEED);
  const scoreRef = useRef(0);
  const frameCount = useRef(0);
  const isInvincible = useRef(0); // frames remaining for invincibility
  const objectIdCounter = useRef(0);

  // Touch handling
  const touchStartX = useRef(0);
  const reducedMotion = useRef(prefersReducedMotion());
  const isVisible = usePageVisibility();

  const startGame = useCallback(() => {
    playerLane.current = 1;
    objects.current = [];
    speed.current = BASE_SPEED;
    scoreRef.current = 0;
    frameCount.current = 0;
    isInvincible.current = 0;
    setScore(0);
    setFeedback(null);
    setDisplayLane(1);
    setGameState('playing');
  }, []);

  const moveLeft = useCallback(() => {
    if (gameState !== 'playing') return;
    const next = Math.max(0, playerLane.current - 1);
    playerLane.current = next;
    setDisplayLane(next);
  }, [gameState]);

  const moveRight = useCallback(() => {
    if (gameState !== 'playing') return;
    const next = Math.min(LANES - 1, playerLane.current + 1);
    playerLane.current = next;
    setDisplayLane(next);
  }, [gameState]);

  const triggerQuestion = useCallback(() => {
    setGameState('question');
    const questions = getRandomQuestions(1);
    setCurrentQuestion(questions[0]);
  }, []);

  const handleAnswer = (index: number) => {
    if (!currentQuestion) return;
    
    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setFeedback('correct');
      // Grant invincibility and resume
      setTimeout(() => {
        isInvincible.current = 60; // 1 second of invincibility
        setFeedback(null);
        setGameState('playing');
      }, 1500);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setGameState('gameover');
        if (scoreRef.current > 0) {
          // Record a nominal score based on distance/coins
          recordQuizScore(Math.min(100, Math.floor(scoreRef.current / 10)));
        }
      }, 1500);
    }
  };

  // Main Game Loop
  const updateGame = useCallback(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const laneWidth = width / LANES;
    const playerY = height - 80;
    const playerRadius = 20;

    const neonEnabled = !reducedMotion.current;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Draw Synthwave Grid
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 2;
    
    // Vertical lane dividers
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * laneWidth, 0);
      ctx.lineTo(i * laneWidth, height);
      ctx.stroke();
    }

    // Horizontal moving grid lines
    const gridSpacing = 50;
    const offset = (frameCount.current * speed.current) % gridSpacing;
    for (let y = offset; y < height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Update Speed & Score
    speed.current = Math.min(MAX_SPEED, speed.current + SPEED_INCREMENT);
    frameCount.current++;
    if (frameCount.current % 10 === 0) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }

    // Spawn Objects
    if (frameCount.current % Math.max(20, Math.floor(SPAWN_RATE / (speed.current / BASE_SPEED))) === 0) {
      const lane = Math.floor(Math.random() * LANES);
      const isObstacle = Math.random() > 0.6; // 40% chance of obstacle
      objects.current.push({
        id: objectIdCounter.current++,
        type: isObstacle ? 'obstacle' : 'coin',
        lane,
        y: -50,
      });
    }

    // Update & Draw Objects
    for (let i = objects.current.length - 1; i >= 0; i--) {
      const obj = objects.current[i];
      obj.y += speed.current;

      const objX = obj.lane * laneWidth + laneWidth / 2;

      // Collision Detection
      const distY = Math.abs(obj.y - playerY);
      if (distY < playerRadius * 2 && obj.lane === playerLane.current && !obj.markedForDeletion) {
        if (obj.type === 'coin') {
          scoreRef.current += 50;
          setScore(scoreRef.current);
          obj.markedForDeletion = true;
        } else if (obj.type === 'obstacle') {
          if (isInvincible.current > 0) {
            // Smash through it!
            obj.markedForDeletion = true;
          } else {
            // Hit obstacle! Pause game, ask question
            obj.markedForDeletion = true; // remove it so we don't hit it again
            heavyCrash();
            triggerQuestion();
            return; // Stop updating this frame
          }
        }
      }

      // Remove off-screen or marked objects
      if (obj.y > height + 50 || obj.markedForDeletion) {
        objects.current.splice(i, 1);
        continue;
      }

      // Draw Object
      if (obj.type === 'coin') {
        ctx.save();
        if (neonEnabled) {
          ctx.shadowColor = COLORS.coin;
          ctx.shadowBlur = 16;
        }
        ctx.beginPath();
        ctx.arc(objX, obj.y, 15, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.coin;
        ctx.fill();
        ctx.strokeStyle = COLORS.coinOutline;
        ctx.lineWidth = 3;
        ctx.stroke();
        // Draw '5G' text (no glow on text for legibility)
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('5G', objX, obj.y);
        ctx.restore();
      } else {
        ctx.save();
        if (neonEnabled) {
          ctx.shadowColor = COLORS.obstacle;
          ctx.shadowBlur = 14;
        }
        ctx.fillStyle = COLORS.obstacle;
        ctx.fillRect(objX - 20, obj.y - 20, 40, 40);
        ctx.strokeStyle = COLORS.obstacleOutline;
        ctx.lineWidth = 3;
        ctx.strokeRect(objX - 20, obj.y - 20, 40, 40);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', objX, obj.y);
        ctx.restore();
      }
    }

    // Draw Player
    const playerX = playerLane.current * laneWidth + laneWidth / 2;

    ctx.save();
    if (isInvincible.current > 0) {
      isInvincible.current--;
      ctx.globalAlpha = isInvincible.current % 10 < 5 ? 0.5 : 1; // Blink effect
    }
    if (neonEnabled) {
      ctx.shadowColor = COLORS.player;
      ctx.shadowBlur = 18;
    }

    // Draw a sleek magenta triangle/ship
    ctx.beginPath();
    ctx.moveTo(playerX, playerY - 25);
    ctx.lineTo(playerX + 20, playerY + 15);
    ctx.lineTo(playerX - 20, playerY + 15);
    ctx.closePath();
    ctx.fillStyle = COLORS.player;
    ctx.fill();
    ctx.strokeStyle = COLORS.playerOutline;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Thruster flame
    ctx.beginPath();
    ctx.moveTo(playerX - 10, playerY + 15);
    ctx.lineTo(playerX, playerY + 25 + Math.random() * 10);
    ctx.lineTo(playerX + 10, playerY + 15);
    ctx.fillStyle = COLORS.thruster;
    ctx.fill();

    ctx.restore();

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameState, triggerQuestion]);

  // Animation Loop Setup
  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, updateGame]);

  // Auto-pause when the tab is hidden mid-run.
  useEffect(() => {
    if (!isVisible && gameState === 'playing') {
      setGameState('paused');
    }
  }, [isVisible, gameState]);

  const resumeFromPause = useCallback(() => {
    if (gameState !== 'paused') return;
    setGameState('playing');
  }, [gameState]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        const next = Math.max(0, playerLane.current - 1);
        playerLane.current = next;
        setDisplayLane(next);
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        const next = Math.min(LANES - 1, playerLane.current + 1);
        playerLane.current = next;
        setDisplayLane(next);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Touch Controls
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (gameState !== 'playing') return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX.current;

    if (diff > 30) {
      const next = Math.min(LANES - 1, playerLane.current + 1);
      playerLane.current = next;
      setDisplayLane(next);
    } else if (diff < -30) {
      const next = Math.max(0, playerLane.current - 1);
      playerLane.current = next;
      setDisplayLane(next);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">

      {/* Canvas container — top half of the cabinet */}
      <div className="relative h-[420px] w-full overflow-hidden rounded-t-3xl border-4 border-b-0 border-t-dark-gray bg-[#1A1A1A] shadow-2xl">

        {/* The Game Canvas */}
        <canvas
          ref={canvasRef}
          width={400}
          height={420}
          className="w-full h-full block"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        {/* HTML Score HUD — pixel-crisp on all DPR */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <div className="pointer-events-none absolute right-3 top-3 z-10">
            <div className="flex items-baseline gap-1 rounded-xl bg-black/50 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Score</span>
              <span className="text-lg font-black tabular-nums text-white">{score}</span>
            </div>
          </div>
        )}

        {/* Overlays */}
      <AnimatePresence mode="wait">
        
        {/* Start Screen */}
        {gameState === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 bg-t-magenta/20 rounded-3xl flex items-center justify-center mb-4 border-2 border-t-magenta">
              <Zap className="w-8 h-8 text-t-magenta" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-1">Magenta Runner</h2>
            <p className="text-xs font-medium text-white/60 mb-5">
              Dodge obstacles. Collect 5G nodes. Answer quiz questions to survive.
            </p>

            {/* Lane diagram */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex flex-col items-center gap-1 opacity-60">
                <span className="text-white/80 text-lg">←</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">swipe</span>
              </div>
              {[0, 1, 2].map((lane) => (
                <div
                  key={lane}
                  className={`h-20 w-14 rounded-xl border-2 flex items-end justify-center pb-2 ${
                    lane === 1
                      ? 'border-t-magenta bg-t-magenta/20'
                      : 'border-white/20 bg-white/5'
                  }`}
                >
                  {lane === 1 && (
                    <div className="w-6 h-6 rounded-full bg-t-magenta flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex flex-col items-center gap-1 opacity-60">
                <span className="text-white/80 text-lg">→</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/50">swipe</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full max-w-[200px] py-3.5 rounded-2xl bg-t-magenta text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(226,0,116,0.5)]"
            >
              Play Now
            </button>
          </motion.div>
        )}

        {/* Paused Overlay */}
        {gameState === 'paused' && (
          <motion.div
            key="paused"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="w-16 h-16 bg-t-magenta/20 rounded-3xl flex items-center justify-center mb-4 border-2 border-t-magenta">
              <Pause className="w-8 h-8 text-t-magenta" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Paused</h2>
            <p className="text-xs font-medium text-white/60 mb-5">
              Run held while you were away. Tap resume to jump back in.
            </p>
            <button
              onClick={resumeFromPause}
              className="w-full max-w-[200px] py-3.5 rounded-2xl bg-t-magenta text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(226,0,116,0.5)]"
            >
              Resume
            </button>
          </motion.div>
        )}

        {/* Question Overlay (Obstacle Hit) */}
        {gameState === 'question' && currentQuestion && (
          <motion.div
            key="question"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
          >
            {!feedback ? (
              <>
                <div className="flex items-center gap-2 text-warning-accent mb-4 animate-pulse">
                  <ShieldAlert className="w-6 h-6" />
                  <span className="font-black uppercase tracking-widest text-sm">Obstacle Hit!</span>
                </div>
                <p className="text-white font-bold text-center mb-6 leading-snug">
                  {currentQuestion.question}
                </p>
                <div className="w-full space-y-3">
                  {currentQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-t-magenta/20 hover:border-t-magenta transition-colors text-left"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                {feedback === 'correct' ? (
                  <>
                    <CheckCircle2 className="w-20 h-20 text-success-accent mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest">Correct!</h3>
                    <p className="text-success-accent font-bold mt-2">Invincibility Granted</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-20 h-20 text-error-accent mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-widest">Wrong!</h3>
                    <p className="text-error-accent font-bold mt-2">Crash Landing...</p>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center"
          >
            <XCircle className="w-16 h-16 text-error-accent mb-4" />
            <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Run Ended</h2>
            <p className="text-lg font-medium text-white/70 mb-8">
              Final Score: <span className="text-t-magenta font-black text-2xl">{score}</span>
            </p>
            <button
              onClick={startGame}
              className="w-full max-w-[200px] py-4 rounded-2xl bg-t-magenta text-white font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </motion.div>
        )}

      </AnimatePresence>
      </div>{/* end canvas container */}

      {/* Retro Arcade Control Panel */}
      <div className="w-full rounded-b-3xl border-4 border-t-2 border-t-dark-gray bg-[#0f0f0f] px-6 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.7)]">
        {/* Decorative top groove line */}
        <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="flex items-center justify-between">
          {/* LEFT button */}
          <button
            onPointerDown={moveLeft}
            disabled={gameState !== 'playing'}
            aria-label="Move left"
            className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl
                       border-4 border-[#2e2e2e] bg-[#1c1c1c] text-white/60
                       shadow-[0_5px_0_rgba(0,0,0,0.9)]
                       transition-all duration-75
                       hover:enabled:border-t-magenta/60 hover:enabled:text-t-magenta
                       hover:enabled:shadow-[0_5px_0_rgba(0,0,0,0.9),0_0_18px_rgba(226,0,116,0.25)]
                       active:enabled:translate-y-[4px] active:enabled:shadow-[0_1px_0_rgba(0,0,0,0.9)]
                       active:enabled:border-t-magenta active:enabled:text-t-magenta
                       disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-9 w-9" />
          </button>

          {/* Center: lane indicator + label */}
          <div className="flex flex-col items-center gap-2.5">
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-150 ${
                    i === displayLane && gameState === 'playing'
                      ? 'bg-t-magenta shadow-[0_0_8px_rgba(226,0,116,0.9),0_0_16px_rgba(226,0,116,0.5)]'
                      : 'bg-white/15'
                  }`}
                />
              ))}
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.22em] text-white/25">
              Controls
            </span>
          </div>

          {/* RIGHT button */}
          <button
            onPointerDown={moveRight}
            disabled={gameState !== 'playing'}
            aria-label="Move right"
            className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl
                       border-4 border-[#2e2e2e] bg-[#1c1c1c] text-white/60
                       shadow-[0_5px_0_rgba(0,0,0,0.9)]
                       transition-all duration-75
                       hover:enabled:border-t-magenta/60 hover:enabled:text-t-magenta
                       hover:enabled:shadow-[0_5px_0_rgba(0,0,0,0.9),0_0_18px_rgba(226,0,116,0.25)]
                       active:enabled:translate-y-[4px] active:enabled:shadow-[0_1px_0_rgba(0,0,0,0.9)]
                       active:enabled:border-t-magenta active:enabled:text-t-magenta
                       disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-9 w-9" />
          </button>
        </div>

        {/* Decorative bottom groove line */}
        <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

    </div>
  );
}
