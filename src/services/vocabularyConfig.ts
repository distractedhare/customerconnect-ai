/**
 * Vocabulary Configuration — Single Update Point
 *
 * Defines all vocabulary categories, their hardcoded defaults, and refresh prompts.
 * This file is the ONE place to update when vocabulary needs to change across
 * PWA, iOS, and Android apps. Future native apps consume the generated
 * vocabulary-bundle.json which is built from this config.
 *
 * Architecture:
 *   vocabularyConfig.ts  →  scripts/generate-vocabulary.ts  →  public/vocabulary-bundle.json
 *                        →  vocabularyService.ts (runtime loader)
 */

import {
  WELCOME_MESSAGES,
  DISCOVERY_QUESTIONS,
  TRANSITIONS,
  CLOSING_TECHNIQUES,
  OBJECTION_TEMPLATES,
} from '../data/salesMethodology';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VocabularyCategory {
  /** Unique key, e.g. 'welcome' */
  key: string;
  /** Human-readable description */
  description: string;
  /** Hardcoded defaults keyed by sub-category, e.g. { exploring: [...], 'ready to buy': [...] } */
  defaults: Record<string, string[]>;
  /** Prompt template for LLM to rephrase. {{PHRASES}} is replaced with the originals. */
  refreshPrompt: string;
  /** Guardrails — items that must survive rephrasing verbatim */
  constraints: string[];
  /** How many variant rephrasings to generate per phrase */
  variantsPerPhrase: number;
}

export interface VocabularyBundle {
  generatedAt: string;
  version: string;
  /**
   * category key → sub-key → array of phrases.
   * Each phrase is either a string (single variant) or the selected variant.
   * The bundle stores the full variants array per phrase:
   *   categories.welcome.exploring = [["variant1","variant2","variant3"], ...]
   */
  categories: Record<string, Record<string, string[][]>>;
}

// ---------------------------------------------------------------------------
// Shared constraints
// ---------------------------------------------------------------------------

const PRESERVE_FACTS = [
  'Preserve all dollar amounts exactly (e.g. $5/month, $100/mo, $672)',
  'Preserve all product names exactly (Experience Beyond, Galaxy Watch8, SyncUP, etc.)',
  'Preserve all promotional terms (FREE, BOGO, bill credits, 36 monthly credits)',
  'Preserve all numeric claims (309 Mbps, 215+ countries, 5-Year Price Guarantee)',
  'Maintain T-Mobile brand voice: enthusiastic, empathetic, not pushy',
];

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

function buildObjectionDefaults(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, template] of Object.entries(OBJECTION_TEMPLATES)) {
    result[key] = [template.rebuttal, ...template.talkingPoints];
  }
  return result;
}

export const VOCABULARY_CATEGORIES: VocabularyCategory[] = [
  {
    key: 'welcome',
    description: 'Welcome messages by purchase intent',
    defaults: WELCOME_MESSAGES,
    refreshPrompt:
      'Rephrase these T-Mobile sales welcome messages to sound fresh and natural. ' +
      'Keep the same warmth, energy level, and meaning. ' +
      'Each message should feel like something a real rep would say on a call. {{PHRASES}}',
    constraints: PRESERVE_FACTS,
    variantsPerPhrase: 3,
  },
  {
    key: 'discovery',
    description: 'Discovery questions by product category',
    defaults: DISCOVERY_QUESTIONS,
    refreshPrompt:
      'Rephrase these T-Mobile sales discovery questions to sound fresh and conversational. ' +
      'Keep the same information-gathering intent. {{PHRASES}}',
    constraints: PRESERVE_FACTS,
    variantsPerPhrase: 3,
  },
  {
    key: 'transitions',
    description: 'Transition phrases between sales stages',
    defaults: TRANSITIONS,
    refreshPrompt:
      'Rephrase these sales transition phrases to sound natural and unrehearsed. ' +
      'These bridge discovery, value presentation, and closing. {{PHRASES}}',
    constraints: PRESERVE_FACTS,
    variantsPerPhrase: 3,
  },
  {
    key: 'closing',
    description: 'Closing techniques by purchase intent',
    defaults: CLOSING_TECHNIQUES,
    refreshPrompt:
      'Rephrase these sales closing lines to sound fresh. ' +
      'Preserve the closing strategy (assumptive, soft, urgency) but change the wording. {{PHRASES}}',
    constraints: PRESERVE_FACTS,
    variantsPerPhrase: 3,
  },
  {
    key: 'objectionRebuttals',
    description: 'Objection rebuttals and talking points',
    defaults: buildObjectionDefaults(),
    refreshPrompt:
      'Rephrase these objection rebuttals for T-Mobile sales reps. ' +
      'Keep empathy first, then facts. Never change the factual claims or numbers. {{PHRASES}}',
    constraints: PRESERVE_FACTS,
    variantsPerPhrase: 3,
  },
];

/** Current bundle version — bump when categories change structurally */
export const VOCABULARY_VERSION = '1.0.1';

/** How often on-device refresh should run (hours) */
export const VOCABULARY_TTL_HOURS = 168; // 7 days
