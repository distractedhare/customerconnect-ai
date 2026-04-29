import type {
  KipMessage,
  KipRecommendation,
  LearnKipNoteInput,
  LevelUpKipBriefingInput,
  LiveKipRecommendationInput,
} from '../../types/kip';
import { getSupportFocusOption } from '../../constants/supportFocus';
import { pickKipLine } from './kipVoice';

const FIRST_FALLBACK_SAY_THIS = 'Let me narrow this down so we get you the best fit without overbuilding the quote.';
const FIRST_FALLBACK_ASK_THIS = 'Are you mostly trying to lower the bill, upgrade the phone, or add something useful today?';

function firstUseful(values: string[] | undefined, fallback: string): string {
  return values?.find((value) => value.trim().length > 0) ?? fallback;
}

function cleanLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function conciseLine(value: string, maxLength = 180): string {
  const line = cleanLine(value);
  return line.length > maxLength ? `${line.slice(0, maxLength - 3).trimEnd()}...` : line;
}

function getIntentHeadline(input: LiveKipRecommendationInput): string {
  const { context } = input;
  const supportFocus = getSupportFocusOption(context.supportFocus);

  if (supportFocus) {
    return pickKipLine('liveSupportFocus', supportFocus.id);
  }

  switch (context.purchaseIntent) {
    case 'ready to buy':
      return pickKipLine('liveReadyToBuy');
    case 'upgrade / add a line':
      return pickKipLine('liveUpgrade');
    case 'tech support':
      return pickKipLine('liveTechSupport');
    case 'account support':
      return pickKipLine('liveAccountSupport');
    case 'order support':
      return pickKipLine('liveOrderSupport');
    case 'exploring':
    default:
      return pickKipLine('liveExploring');
  }
}

function getIntentWatchOut(input: LiveKipRecommendationInput): string {
  const { context, script, objectionResult } = input;
  const supportFocus = getSupportFocusOption(context.supportFocus);

  if (objectionResult?.complianceNotes) {
    return conciseLine(objectionResult.complianceNotes);
  }

  if (supportFocus) {
    return supportFocus.planCue.coach;
  }

  if (context.product.includes('Home Internet') && context.hintAvailable === undefined) {
    return 'Hold the HINT pitch until availability’s checked.';
  }

  if (context.product.includes('Home Internet') && context.hintAvailable === false) {
    return pickKipLine('pivotHintBlocked');
  }

  if (script.coachsCorner) {
    return conciseLine(script.coachsCorner);
  }

  return pickKipLine('pivotAttachHold');
}

function getOptionalAttach(input: LiveKipRecommendationInput): string | undefined {
  const { context, script } = input;
  const hasPrimaryProductFit = context.product.some((product) => product === 'Phone' || product === 'BTS' || product === 'IOT');
  const firstAttach = script.accessoryRecommendations?.[0];

  if (!hasPrimaryProductFit || !firstAttach) return undefined;

  return conciseLine(`${firstAttach.name}: ${firstAttach.why}`);
}

export function buildLiveKipRecommendation(input: LiveKipRecommendationInput): KipRecommendation {
  const { script } = input;
  const supportFocus = getSupportFocusOption(input.context.supportFocus);
  const action = supportFocus?.planCue.step
    ?? firstUseful(script.valuePropositions, firstUseful(script.purchaseSteps, 'Lead one strong path. Then ask one narrowing question.'));

  return {
    id: `kip-live-${input.context.purchaseIntent.replaceAll(' ', '-')}`,
    mode: 'live',
    tone: supportFocus ? 'pivot' : 'operator',
    headline: getIntentHeadline(input),
    action: conciseLine(action),
    sayThis: conciseLine(firstUseful(script.welcomeMessages, FIRST_FALLBACK_SAY_THIS)),
    askThis: conciseLine(firstUseful(script.discoveryQuestions, FIRST_FALLBACK_ASK_THIS)),
    watchOut: getIntentWatchOut(input),
    optionalAttach: getOptionalAttach(input),
    confidence: supportFocus || script.welcomeMessages.length > 0 ? 'high' : 'medium',
    sourceReason: 'Built from the local sales plan, selected intent, support focus, HINT state, and attach recommendations.',
  };
}

export function buildLearnKipNote({ section }: LearnKipNoteInput): KipMessage {
  const notes: Record<LearnKipNoteInput['section'], KipMessage> = {
    briefing: {
      id: 'kip-learn-briefing',
      mode: 'learn',
      tone: 'tip',
      headline: 'Kip’s read',
      body: 'Grab one fresh briefing item. Translate it into one sentence a customer can use. That’s your call-ready talk track.',
      sourceReason: 'Briefing should shorten the path from weekly intel to a usable line.',
    },
    devices: {
      id: 'kip-learn-devices',
      mode: 'learn',
      tone: 'tip',
      headline: 'Pick the winner, skip the spec recital',
      body: 'Two or three real fits. Name the tradeoff out loud. Don’t turn the compare into a spec sheet — the customer’s eyes are already glazing.',
      sourceReason: 'Device learning is most useful when it speeds up a call decision.',
    },
    plans: {
      id: 'kip-learn-plans',
      mode: 'learn',
      tone: 'tease',
      headline: 'Common trap',
      body: 'Don’t list every plan. Anchor on the customer reason, then show the one plan move that changes the math.',
    },
    homeinternet: {
      id: 'kip-learn-homeinternet',
      mode: 'learn',
      tone: 'pivot',
      headline: 'HINT lane only when it’s open',
      body: 'Always check availability first. If spots are full, pivot clean — priority list, voice lines, or the mobile-network proof.',
    },
    playbook: {
      id: 'kip-learn-playbook',
      mode: 'learn',
      tone: 'coach',
      headline: 'Why this talk track lands',
      body: 'The best line makes the customer feel understood before it asks them to choose. Read it out loud once.',
    },
    edge: {
      id: 'kip-learn-edge',
      mode: 'learn',
      tone: 'coach',
      headline: 'Coach the behavior, not the answer',
      body: 'Edge cases are pivot reps. When support pressure starts to crowd the sale, your safe move is rehearsed here.',
    },
  };

  return notes[section];
}

export function buildLevelUpMissionBriefing({ area }: LevelUpKipBriefingInput): KipMessage {
  const briefings: Record<LevelUpKipBriefingInput['area'], KipMessage> = {
    bingo: {
      id: 'kip-level-up-bingo',
      mode: 'level-up',
      tone: 'mission',
      headline: 'Mission focus: build the muscle',
      body: 'Bingo rewards the moves you want to repeat live — discovery, clean pivots, confident closes. Stack the squares, the habit follows.',
    },
    practice: {
      id: 'kip-level-up-practice',
      mode: 'level-up',
      tone: 'mission',
      headline: 'Mission focus: rehearse before the call',
      body: 'Pick one scenario. Run it for real. Then jump straight into Live with the plan already loaded.',
    },
    runner: {
      id: 'kip-level-up-runner',
      mode: 'level-up',
      tone: 'mission',
      headline: 'Mission focus: attention under pressure',
      body: 'Runner trains quick reads — dodge the noise, grab the right signal, recover fast after a whiff. Same shape as a hot call.',
    },
    prizes: {
      id: 'kip-level-up-prizes',
      mode: 'level-up',
      tone: 'mission',
      headline: 'Mission focus: momentum, not noise',
      body: 'Rewards reinforce useful behavior. Don’t bury yourself in a checklist — chase the streaks that match the moves you want.',
    },
  };

  return briefings[area];
}
