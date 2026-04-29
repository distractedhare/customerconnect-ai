import type { ObjectionAnalysis, SalesContext, SalesScript } from '../types';

export type KipMode = 'live' | 'learn' | 'level-up';

/**
 * Kip's tone register — the emotional setting of a given line.
 *
 * - `operator`  — neutral status read ("HINT clean. Attach hot.")
 * - `coach`     — teaching/explaining ("Use this when …")
 * - `mission`   — pre-game framing ("Mission focus: …")
 * - `tip`       — ambient, low-pressure suggestion
 * - `pivot`     — mid-call redirect
 * - `celebrate` — wins
 * - `recover`   — misses, errors, empty states
 * - `hype`      — pre-call / pre-game energy
 * - `tease`     — playful nudge
 */
export type KipTone =
  | 'operator'
  | 'coach'
  | 'mission'
  | 'tip'
  | 'pivot'
  | 'celebrate'
  | 'recover'
  | 'hype'
  | 'tease';

/**
 * KipMood is the line-bank key used by `pickKipLine`. It's narrower
 * than KipTone — moods describe the *situation* ("celebrateBingoRow"),
 * tone describes the *register* ("celebrate").
 */
export type KipMood =
  | 'greetingMorning'
  | 'greetingAfternoon'
  | 'greetingEvening'
  | 'liveExploring'
  | 'liveReadyToBuy'
  | 'liveUpgrade'
  | 'liveTechSupport'
  | 'liveAccountSupport'
  | 'liveOrderSupport'
  | 'liveSupportFocus'
  | 'pivotHintBlocked'
  | 'pivotPriceObjection'
  | 'pivotAttachHold'
  | 'celebrateBingoCell'
  | 'celebrateBingoRow'
  | 'celebrateBingoBoard'
  | 'celebrateRunnerWin'
  | 'celebrateRunnerLoss'
  | 'celebrateAttachSave'
  | 'celebrateClose'
  | 'recoverGenericError'
  | 'recoverEmpty'
  | 'recoverIdle'
  | 'recoverLoading'
  | 'hypePreCall'
  | 'hypePreGame'
  | 'teaseRecital'
  | 'teaseOverbuild'
  | 'briefingLearn'
  | 'briefingPractice'
  // Runner-specific moods. Operator voice only — these fire from the
  // runner HUD when battery state changes, lanes open, bosses phase,
  // or the run ends. See plan: Pass 1 (text + voice).
  | 'runnerBatteryOvercharged'
  | 'runnerBatteryStable'
  | 'runnerBatteryRedline'
  | 'runnerBatteryCritical'
  | 'runnerLaneRead'
  | 'runnerBossPhase'
  | 'runnerRunEnd';

export interface KipMessage {
  id: string;
  mode: KipMode;
  tone: KipTone;
  headline: string;
  body: string;
  sourceReason?: string;
}

export interface KipRecommendation {
  id: string;
  mode: KipMode;
  tone: KipTone;
  headline: string;
  action: string;
  sayThis?: string;
  askThis?: string;
  watchOut?: string;
  optionalAttach?: string;
  confidence: 'high' | 'medium' | 'low';
  sourceReason: string;
}

export type KipLearnSection = 'briefing' | 'devices' | 'plans' | 'homeinternet' | 'playbook' | 'edge';
export type KipLevelUpArea = 'bingo' | 'practice' | 'runner' | 'prizes';

export interface LiveKipRecommendationInput {
  context: SalesContext;
  script: SalesScript;
  activeTab?: string;
  objectionResult?: ObjectionAnalysis | null;
}

export interface LearnKipNoteInput {
  section: KipLearnSection;
}

export interface LevelUpKipBriefingInput {
  area: KipLevelUpArea;
}
