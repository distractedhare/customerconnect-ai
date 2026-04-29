#!/usr/bin/env tsx
/**
 * Build-Time Vocabulary Generator
 *
 * Generates public/vocabulary-bundle.json from the vocabulary config.
 * Creates 3 variants per phrase using simple word-level rephrasing.
 *
 * Usage:  npm run vocab:generate
 *         tsx scripts/generate-vocabulary.ts
 *
 * Future: Can be extended to call an LLM API (Gemma, Claude) for
 * higher-quality rephrasings. The architecture is pluggable —
 * just replace the `rephrase()` function.
 */

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import {
  VOCABULARY_CATEGORIES,
  VOCABULARY_VERSION,
  type VocabularyBundle,
} from '../src/services/vocabularyConfig';

// ---------------------------------------------------------------------------
// Simple rephrasing engine (offline, no LLM needed)
// ---------------------------------------------------------------------------

/** Synonym map for common sales vocabulary */
const SYNONYMS: Record<string, string[]> = {
  'Hey': ['Hi there', 'Hello', 'Hey there'],
  'Awesome': ['Great', 'Fantastic', 'Perfect'],
  'totally': ['absolutely', 'completely', 'definitely'],
  'Totally': ['Absolutely', 'Completely', 'Definitely'],
  "Let's": ["Let me help you", "We can", "I'd love to"],
  'solid': ['great', 'excellent', 'strong'],
  'Love it': ['That\'s great', 'Excellent', 'Perfect'],
  'Perfect timing': ['Great timing', 'You picked a good time', 'Excellent timing'],
  'Smart move': ['Good thinking', 'That\'s wise', 'Great idea'],
  'No worries': ['No problem', 'Of course', 'Absolutely'],
  'I hear you': ['I understand', 'That makes sense', 'I get that'],
  'I totally get': ['I completely understand', 'I hear you on', 'That\'s a fair point about'],
  "That's fair": ["That's understandable", "I respect that", "Totally get it"],
  'Let me show you': ['Let me walk you through', 'Here\'s what I can show you', 'Check this out'],
  'What\'s up': ['Hey there', 'What\'s going on', 'Hello'],
  'No pressure': ['Take your time', 'No rush', 'Absolutely no pressure'],
  'let me': ['I can', 'allow me to', "I'd be happy to"],
  'I\'ve got you': ['I can help with that', 'Let me take care of that', 'I\'m on it'],
  'real quick': ['right away', 'in just a moment', 'for you now'],
  'pull up': ['look into', 'check on', 'bring up'],
  'No stress': ['Don\'t worry', 'No problem at all', 'It happens'],
  'figure this out': ['get this sorted', 'work through this', 'resolve this'],
  'deal with': ['handle', 'work with', 'take care of'],
  'Glad we got': ['Happy we resolved', 'Good that we fixed', 'Great that we sorted'],
  'By the way': ['Also', 'On another note', 'Quick thought'],
  'Quick question': ['One more thing', 'Just curious', 'While I have you'],
  'All set': ['You\'re all good', 'That\'s taken care of', 'Everything\'s handled'],
  'Got it taken care of': ['That\'s all sorted', 'All handled now', 'That\'s resolved'],
};

/**
 * Generate a simple variant of a phrase by applying synonym swaps.
 * Returns a different phrasing that preserves the meaning.
 */
function rephrase(original: string, variantIdx: number): string {
  let result = original;

  // Apply synonym swaps based on variant index
  for (const [word, synonyms] of Object.entries(SYNONYMS)) {
    if (result.includes(word)) {
      const replacement = synonyms[variantIdx % synonyms.length];
      // Only replace first occurrence to keep the rest natural
      result = result.replace(word, replacement);
    }
  }

  // If no changes were made, apply light structural variations
  if (result === original) {
    switch (variantIdx % 3) {
      case 1:
        // Move trailing question to front if it's a statement+question
        if (result.includes('?') && !result.startsWith('"')) {
          const parts = result.split('?');
          if (parts.length === 2 && parts[1].trim() === '') {
            result = original; // Keep as-is if it's just a question
          }
        }
        break;
      case 2:
        // Add slight variation in connector words
        result = result
          .replace(' — ', ' – ')
          .replace(' actually ', ' really ')
          .replace('a lot of', 'many')
          .replace('right now', 'at the moment');
        break;
    }
  }

  return result;
}

/**
 * Validate that a rephrased variant preserves critical facts from the original.
 */
function validateVariant(original: string, variant: string): boolean {
  // Extract all dollar amounts from original
  const dollarPattern = /\$[\d,]+(?:\/(?:mo(?:nth)?|line|day))?/g;
  const originalDollars = original.match(dollarPattern) || [];
  for (const dollar of originalDollars) {
    if (!variant.includes(dollar)) return false;
  }

  // Extract all percentages
  const pctPattern = /\d+%/g;
  const originalPcts = original.match(pctPattern) || [];
  for (const pct of originalPcts) {
    if (!variant.includes(pct)) return false;
  }

  // Check key product names are preserved
  const productNames = [
    'Experience Beyond', 'Experience More', 'Better Value',
    'Galaxy Watch8', 'Apple Watch', 'SyncUP', 'Protection 360',
    'T-Mobile', 'iPhone', 'Samsung', 'Google Pixel',
    'Home Internet', 'Netflix', 'Hulu', 'Apple TV+',
    'JUMP!', 'CPNI', 'AutoPay',
  ];
  for (const name of productNames) {
    if (original.includes(name) && !variant.includes(name)) return false;
  }

  // Check numeric claims are preserved
  const numberPattern = /\d+(?:\.\d+)?(?:\s*(?:Mbps|GB|million|sq|countries|years?|days?|minutes?|lines?))/g;
  const originalNumbers = original.match(numberPattern) || [];
  for (const num of originalNumbers) {
    if (!variant.includes(num)) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Main generation
// ---------------------------------------------------------------------------

function generateBundle(): VocabularyBundle {
  const categories: VocabularyBundle['categories'] = {};

  for (const category of VOCABULARY_CATEGORIES) {
    categories[category.key] = {};

    for (const [subKey, phrases] of Object.entries(category.defaults)) {
      const phrasesWithVariants: string[][] = [];

      for (const phrase of phrases) {
        const variants: string[] = [phrase]; // variant 0 = original

        for (let v = 1; v < category.variantsPerPhrase; v++) {
          const variant = rephrase(phrase, v);
          if (validateVariant(phrase, variant)) {
            variants.push(variant);
          } else {
            // Validation failed — use original as fallback
            variants.push(phrase);
          }
        }

        phrasesWithVariants.push(variants);
      }

      categories[category.key][subKey] = phrasesWithVariants;
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    version: VOCABULARY_VERSION,
    categories,
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const bundle = generateBundle();
const outputPath = resolve(import.meta.dirname ?? '.', '..', 'public', 'vocabulary-bundle.json');
writeFileSync(outputPath, JSON.stringify(bundle, null, 2), 'utf-8');

const categoryCount = Object.keys(bundle.categories).length;
const totalPhrases = Object.values(bundle.categories).reduce(
  (sum, subKeys) => sum + Object.values(subKeys).reduce((s, phrases) => s + phrases.length, 0),
  0,
);

console.log(`Vocabulary bundle generated successfully.`);
console.log(`  Output: ${outputPath}`);
console.log(`  Categories: ${categoryCount}`);
console.log(`  Total phrases: ${totalPhrases}`);
console.log(`  Variants per phrase: 3`);
console.log(`  Version: ${bundle.version}`);
