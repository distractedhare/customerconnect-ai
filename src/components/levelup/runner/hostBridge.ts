import { ALL_QUIZ_QUESTIONS, type QuizQuestion as AppQuizQuestion } from '../../../constants/quizQuestions';
import { loadWeeklyUpdate } from '../../../services/localGenerationService';
import type { WeeklyUpdate } from '../../../services/weeklyUpdateSchema';
import { getPrizeData, recordQuizScore } from '../../../services/prizeService';
import { submitScore } from '../../../services/leaderboardService';
import { encodeArcadeToken, getTeamConfig } from '../../../services/teamConfigService';
import { getVariantIndex, loadVocabulary } from '../../../services/vocabularyService';
import type { ExternalRunnerContent, RunnerHostBridge, RunnerSavePayload } from './bridge';
import type { TriviaQuestion as RunnerTriviaQuestion } from './content';

const RUNNER_HOST_SAVE_KEY = 'cc-runner-host-save-v1';
const RUNNER_CONTENT_SEED_KEY = 'cc-runner-content-seed-v1';
const FACT_LIMIT = 24;

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures so the runner still works.
  }
}

function getContentSeed(): number {
  const cached = readJson<number>(RUNNER_CONTENT_SEED_KEY);
  if (typeof cached === 'number' && Number.isFinite(cached)) return cached;

  const seed = Math.floor(Date.now() / 86_400_000);
  writeJson(RUNNER_CONTENT_SEED_KEY, seed);
  return seed;
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function deterministicShuffle<T>(items: T[], getKey: (item: T) => string, salt: string): T[] {
  return [...items].sort((left, right) => {
    const leftScore = hashString(`${salt}:${getKey(left)}`);
    const rightScore = hashString(`${salt}:${getKey(right)}`);
    return leftScore - rightScore;
  });
}

function toRunnerCategory(category: AppQuizQuestion['category']): RunnerTriviaQuestion['category'] {
  if (category === 'products') return 'devices';
  if (category === 'tmobile') return 'plans';
  if (category === 'competitors') return 'objection';
  return 'sales';
}

function polishLead(label: string, value: string, variant: number): string {
  if (!value) return value;
  if (variant % 3 === 1) return `${label}: ${value}`;
  if (variant % 3 === 2) return `${value} Keep that angle clean.`;
  return value;
}

function normalizeQuestionStem(question: string, variant: number): string {
  if (variant % 3 === 0) return question;
  if (variant % 3 === 1) {
    return question
      .replace(/^What's\b/i, 'What is')
      .replace(/\bBest\b/g, 'Strongest')
      .replace(/\bbest\b/g, 'strongest')
      .replace(/\bkey\b/g, 'headline');
  }
  return question
    .replace(/\bWhat is\b/g, 'Quick check: what is')
    .replace(/\bWhat\'s\b/g, 'Quick check: what is')
    .replace(/\bbest\b/g, 'cleanest')
    .replace(/\bBest\b/g, 'Cleanest');
}

function buildAppTrivia(variant: number, seed: number): RunnerTriviaQuestion[] {
  const mapped = ALL_QUIZ_QUESTIONS.map((question, index) => {
    const difficulty = Math.min(4, question.difficulty + (question.category === 'competitors' ? 1 : 0)) as RunnerTriviaQuestion['difficulty'];
    const difficultyBonus = difficulty * 4;

    return {
      id: `app-${question.id}`,
      question: normalizeQuestionStem(question.question, (variant + index) % 3),
      options: question.options,
      correctIndex: question.correctIndex,
      explanation: polishLead('Why it matters', question.explanation, (variant + index + 1) % 3),
      difficulty,
      category: toRunnerCategory(question.category),
      healthReward: 10 + difficultyBonus,
      scoreReward: 220 + difficulty * 120,
    } satisfies RunnerTriviaQuestion;
  });

  return deterministicShuffle(mapped, (question) => question.id, `app-quiz:${variant}:${seed}`);
}

function buildWeeklyTrivia(weeklyData: WeeklyUpdate | null, variant: number): RunnerTriviaQuestion[] {
  if (!weeklyData) return [];

  const promoQuestions = weeklyData.currentPromos.slice(0, 8).map((promo, index) => ({
    id: `weekly-promo-${index}-${promo.name}`,
    question: normalizeQuestionStem(`Which sales lane fits "${promo.name}" best right now?`, (variant + index) % 3),
    options: [
      'Ignore it unless the customer asks',
      'Use it only after objections',
      'Match it to the caller intent and lead with the clean value story',
      'Pitch it before discovery every time',
    ],
    correctIndex: 2,
    explanation: polishLead('Promo note', `${promo.details} ${promo.commonObjections[0]?.response || ''}`.trim(), (variant + index + 1) % 3),
    difficulty: 3 as const,
    category: 'plans' as const,
    healthReward: 22,
    scoreReward: 520,
  }));

  const issueQuestions = weeklyData.knownIssues.slice(0, 6).map((issue, index) => ({
    id: `weekly-issue-${index}`,
    question: normalizeQuestionStem(`A caller is hitting "${issue.issue}". What is the cleanest rep move?`, (variant + index + 2) % 3),
    options: [
      'Ignore it and continue pitching',
      'Use the weekly workaround and keep the customer moving',
      'Transfer immediately without context',
      'Promise it will fix itself later',
    ],
    correctIndex: 1,
    explanation: polishLead('Workaround', issue.workaround, (variant + index) % 3),
    difficulty: 2 as const,
    category: 'service' as const,
    healthReward: 18,
    scoreReward: 360,
  }));

  const playbookQuestions = Object.entries(weeklyData.intentPlaybooks)
    .slice(0, 6)
    .map(([intent, playbook], index) => ({
      id: `weekly-intent-${intent}-${index}`,
      question: normalizeQuestionStem(`For a ${intent} caller, which move should the rep anchor first?`, (variant + index + 1) % 3),
      options: [
        playbook.keyMoves[0] || 'Start with discovery',
        playbook.avoidMoves[0] || 'Skip discovery and rush the close',
        playbook.discovery[0] || 'Feature dump early',
        playbook.closingTips[0] || 'Only quote price',
      ],
      correctIndex: 0,
      explanation: polishLead('Playbook move', playbook.closingTips[0] || playbook.oneLiners?.[0] || weeklyData.weeklyFocus.context, (variant + index + 2) % 3),
      difficulty: 3 as const,
      category: intent.includes('support') ? 'service' as const : 'sales' as const,
      healthReward: 20,
      scoreReward: 460,
    }));

  return [...promoQuestions, ...issueQuestions, ...playbookQuestions];
}

function buildFactDeck(weeklyData: WeeklyUpdate | null, variant: number, seed: number): string[] {
  const facts: string[] = [];

  if (weeklyData) {
    facts.push(polishLead('Weekly focus', weeklyData.weeklyFocus.headline, variant));
    facts.push(polishLead('Context', weeklyData.weeklyFocus.context, variant + 1));
    weeklyData.currentPromos.slice(0, 6).forEach((promo, index) => {
      facts.push(polishLead('Promo', `${promo.name} - ${promo.details}`, variant + index));
    });
    weeklyData.competitiveIntel.slice(0, 4).forEach((intel, index) => {
      facts.push(polishLead('Competitive read', intel.talkingPoint, variant + index + 1));
    });
    weeklyData.knownIssues.slice(0, 4).forEach((issue, index) => {
      facts.push(polishLead('Heads up', `${issue.issue}. ${issue.workaround}`, variant + index + 2));
    });
  }

  const prizeData = getPrizeData();
  facts.push(
    prizeData.daily.momentumEarned
      ? 'Momentum is already live today. Keep stacking clean reps.'
      : 'Momentum today comes from clean repetition, not random volume.'
  );

  const uniqueFacts = Array.from(new Set(facts.filter(Boolean)));
  return deterministicShuffle(uniqueFacts, (fact) => fact, `facts:${variant}:${seed}`).slice(0, FACT_LIMIT);
}

function getLeaderboardPayload(score: number): { initials: string; teamToken: string } | null {
  const config = getTeamConfig();
  const base = (config.managerName || config.teamName || '').replace(/[^A-Za-z]/g, '').toUpperCase();
  const initials = base.slice(0, 3);
  if (initials.length !== 3 || !config.teamName.trim()) return null;

  try {
    return {
      initials,
      teamToken: encodeArcadeToken(config),
    };
  } catch {
    return null;
  }
}

export async function createRunnerHostBridge(): Promise<{ bridge: RunnerHostBridge; content: ExternalRunnerContent }> {
  await loadVocabulary();

  let weeklyData: WeeklyUpdate | null = null;
  try {
    const result = await loadWeeklyUpdate();
    weeklyData = result.data;
  } catch {
    weeklyData = null;
  }

  const variant = getVariantIndex();
  const seed = getContentSeed();
  const content: ExternalRunnerContent = {
    trivia: [
      ...buildAppTrivia(variant, seed),
      ...buildWeeklyTrivia(weeklyData, variant),
    ],
    facts: buildFactDeck(weeklyData, variant, seed),
  };

  const bridge: RunnerHostBridge = {
    saveRunnerState(payload: RunnerSavePayload) {
      writeJson(RUNNER_HOST_SAVE_KEY, payload);
    },
    loadRunnerState() {
      return readJson<RunnerSavePayload>(RUNNER_HOST_SAVE_KEY);
    },
    getRunnerContent() {
      return content;
    },
    onRunnerEvent(type: string, payload?: any) {
      const score = typeof payload?.score === 'number' ? payload.score : null;
      if (type === 'tlife-runner-game-over' || type === 'tlife-runner-victory') {
        if (score !== null) {
          const normalized = Math.max(0, Math.min(100, Math.round(score / 120)));
          recordQuizScore(normalized);

          const leaderboardPayload = getLeaderboardPayload(score);
          if (leaderboardPayload) {
            void submitScore(leaderboardPayload.initials, leaderboardPayload.teamToken, score);
          }
        }
      }
    },
  };

  return { bridge, content };
}
