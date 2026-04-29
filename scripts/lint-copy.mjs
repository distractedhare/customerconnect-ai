#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import ts from 'typescript';
import { allowedTerms, typoRules } from './copy-dictionary.mjs';

const ROOT_DIR = path.resolve(process.cwd());
const TARGET_DIRS = [
  path.join(ROOT_DIR, 'src/components'),
  path.join(ROOT_DIR, 'src/data'),
];
const TARGET_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const MIN_SUSPICIOUS_CAPS = 6;

const PUNCTUATION_START = /(?:^|[.!?]\s+)([a-z][a-z0-9'"])/g;

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'for',
  'from',
  'how',
  'if',
  'in',
  'is',
  'it',
  'i',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'you',
  'your',
]);
const CLASS_TOKEN = /^[-_a-z0-9()[\].:/%#\\]+$/i;
const CLASS_PREFIXES = new Set([
  'bg',
  'text',
  'border',
  'rounded',
  'flex',
  'grid',
  'gap',
  'items',
  'justify',
  'w',
  'h',
  'p',
  'pl',
  'pr',
  'pt',
  'pb',
  'px',
  'py',
  'm',
  'ml',
  'mr',
  'mt',
  'mb',
  'mx',
  'my',
  'min',
  'max',
  'sm',
  'md',
  'lg',
  'xl',
  'hidden',
  'block',
  'inline',
  'relative',
  'absolute',
  'sticky',
  'hover',
  'focus',
  'transition',
  'animate',
  'object',
  'ring',
  'shadow',
  'z',
  'font',
  'leading',
  'tracking',
  'line',
  'space',
  'uppercase',
  'normal-case',
  'normalcase',
  'italic',
]);

function isClassLikeToken(token) {
  if (token.length <= 1) return false;
  const value = token.trim().toLowerCase();

  if (!CLASS_TOKEN.test(value)) {
    return false;
  }
  if (/^[_a-z]/.test(value) && /[-:/[\].]/.test(value)) {
    return true;
  }

  return token.includes('/') || token.includes('-') || token.includes(':') || token.includes('[') || token.includes(']') || token.includes('(');
}

function looksLikeUtilityWord(value) {
  const normalized = value.toLowerCase();
  if (CLASS_TOKEN.test(normalized) && /^[-_a-z]/.test(normalized)) {
    return CLASS_PREFIXES.has(normalized)
      || normalized.includes(':')
      || /^-?[a-z]+[/-]/.test(normalized)
      || /^-?[a-z]+\d/.test(normalized)
      || /^text-[a-z]/.test(normalized)
      || /^bg-[a-z]/.test(normalized)
      || /^border-[a-z]/.test(normalized)
      || /^rounded-/.test(normalized)
      || /^w-/.test(normalized)
      || /^h-/.test(normalized)
      || /^p[trblxy]?-\d/.test(normalized)
      || /^m[trblxy]?-\d/.test(normalized)
      || /^space-/.test(normalized);
  }

  return false;
}

function looksLikeClassList(rawText) {
  const text = rawText.trim();
  const tokens = text.split(/\s+/);
  if (tokens.length < 3) return false;
  if (!tokens.every((token) => isClassLikeToken(token) || looksLikeUtilityWord(token))) {
    return false;
  }

  const utilityCount = tokens.filter((token) => looksLikeUtilityWord(token) || /[./:#\[\]-]/.test(token)).length;
  return utilityCount >= Math.ceil(tokens.length * 0.75);
}

function hasNaturalStopword(text) {
  const normalized = text.toLowerCase();
  return normalized.split(/\s+/).some((word) => STOP_WORDS.has(word.replace(/[^a-z]/g, '')));
}

function isLikelyRuntimeText(text) {
  const words = text.split(/\s+/).filter(Boolean);
  return words.some((word) => /[A-Za-z]{3,}/.test(word));
}

function isTextCandidate(value) {
  if (typeof value !== 'string') return false;
  const cleaned = value.trim();
  if (!cleaned || cleaned.length < 4) return false;
  if (/^(0x[a-f0-9]+|https?:\/\/|\/|#|[{}[\]]|[<>])$/i.test(cleaned)) return false;
  if (/^[{\[()].*[}\])]/.test(cleaned) && /(;|=>|return|function|const|let|var|class|interface|type|import|export)/i.test(cleaned)) {
    return false;
  }
  if (/^var\(/i.test(cleaned)) {
    return false;
  }
  if (looksLikeClassList(cleaned)) return false;
  if (!isLikelyRuntimeText(cleaned)) return false;
  if (!/[\w$]/.test(cleaned)) return false;
  if (cleaned.startsWith('/') || cleaned.endsWith('/>') || cleaned.includes('&nbsp;')) return false;
  if (cleaned.startsWith('<!--') || cleaned.endsWith('-->')) return false;
  if (cleaned.includes('=>') || cleaned.includes('?.')) return false;
  if (cleaned === 'true' || cleaned === 'false' || cleaned === 'null') return false;
  if (!hasNaturalStopword(cleaned) && !/[.!?,:]/.test(cleaned)) return false;

  return /[A-Za-z]/.test(cleaned);
}

function lineNumberFromIndex(content, index) {
  return content.slice(0, index).split('\n').length;
}

function isInJsxAttribute(node) {
  let current = node.parent;
  while (current) {
    if (ts.isJsxAttribute(current)) {
      return true;
    }
    current = current.parent;
  }
  return false;
}

function shouldSkipCopyFromNode(node) {
  if (isInJsxAttribute(node)) {
    return true;
  }

  const parent = node.parent;
  if (!parent) return false;

  return (
    ts.isImportDeclaration(parent)
    || ts.isExportAssignment(parent)
    || ts.isExportDeclaration(parent)
  );
}

function addTextFindings(value, node, content, relPath, sourceFile, findings) {
  const cleaned = unescapeString(value).trim();
  if (!isTextCandidate(cleaned)) return;

  const line = lineNumberFromIndex(content, node.getStart(sourceFile));
  const issues = collectFindings(cleaned, relPath);
  for (const issue of issues) {
    addFinding(findings, relPath, line, issue.message, cleaned, issue.type);
  }
}

function shouldCheckSentenceCase(filePath) {
  return filePath.endsWith('.tsx') && filePath.includes(`${path.sep}src${path.sep}components${path.sep}`);
}

function unescapeString(raw) {
  try {
    return raw
      .replace(/\\u[\dA-F]{4}/gi, (match) => String.fromCharCode(Number.parseInt(match.replace('\\u', ''), 16)))
      .replace(/\\n/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/\\\\/g, '\\')
      .trim();
  } catch {
    return raw;
  }
}

function hasSuspiciousCapitalization(text) {
  const allCaps = text.match(/\b[A-Z0-9][A-Z0-9&/+\-]{2,}\b/g) || [];
  return allCaps
    .filter((word) => word.length >= MIN_SUSPICIOUS_CAPS)
    .filter((word) => !allowedTerms.has(word))
    .filter((word) => !/[\d/\\-]/.test(word))
    .filter((word) => !/^[0-9]+$/.test(word))
    .map(word => ({
      type: 'capitalization',
      message: `Unexpected full-uppercase token "${word}". Confirm casing.`,
      word,
    }));
}

function hasSentenceCaseViolation(text) {
  const issues = [];
  for (const match of text.matchAll(PUNCTUATION_START)) {
    const sample = (match[1] || '').trim();
    if (!sample) continue;

    // Skip deliberate lower-case commands or short labels.
    if (sample.length < 3 || /^(it|if|in|on|of|to|up|my|i)\b/i.test(sample)) {
      continue;
    }

    const startIndex = (match.index || 0) + match[0].indexOf(sample);
    const segment = sample.replace(/[^\w].*$/, '').trim();
    const words = segment.split(/\s+/);
    if (words.length >= 2) {
      issues.push({
        type: 'sentence-case',
        message: `Sentence may need sentence-casing: "${segment}"`,
        index: startIndex,
      });
    }
  }

  // Also check line-starting sentence fragments.
  const trimmed = text.trim();
  if (trimmed.length > 4 && /^[a-z]/.test(trimmed) && trimmed.includes(' ')) {
    issues.push({
      type: 'sentence-case',
      message: `Copy line may start with lower-case: "${trimmed.slice(0, 60)}..."`,
      index: 0,
    });
  }

  return issues;
}

function collectFindings(value, filePath) {
  return [
    ...(shouldCheckSentenceCase(filePath) ? hasSentenceCaseViolation(value) : []),
    ...hasTypoViolation(value),
    ...hasSuspiciousCapitalization(value),
  ];
}

function hasTypoViolation(text) {
  const findings = [];
  for (const rule of typoRules) {
    for (const match of text.matchAll(rule.pattern)) {
      if (!match[0]) continue;
      findings.push({
        type: 'typo',
        message: `${rule.message} Matched "${match[0]}".`,
      });
    }
  }
  return findings;
}

function addFinding(findings, filePath, lineNumber, message, snippet, source) {
  findings.push({
    filePath,
    line: lineNumber,
    message,
    snippet,
    source,
  });
}

async function gatherFiles(directory) {
  const items = await fs.readdir(directory, { withFileTypes: true });
  const result = [];

  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      if (item.name === 'node_modules' || item.name === '.git') {
        continue;
      }
      result.push(...(await gatherFiles(fullPath)));
      continue;
    }
    if (TARGET_EXTS.has(path.extname(item.name))) {
      result.push(fullPath);
    }
  }
  return result;
}

async function run() {
  const files = (await Promise.all(TARGET_DIRS.map(gatherFiles))).flat();
  const findings = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    const relPath = path.relative(ROOT_DIR, filePath);
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TSX);

    const visitNode = (node) => {
      if (shouldSkipCopyFromNode(node)) {
        return;
      }

      if (ts.isStringLiteral(node)) {
        addTextFindings(node.text, node, content, relPath, sourceFile, findings);
        return;
      }

      if (ts.isNoSubstitutionTemplateLiteral(node) && node.text) {
        addTextFindings(node.text, node, content, relPath, sourceFile, findings);
        return;
      }

      if (ts.isTemplateExpression(node)) {
        addTextFindings(node.head.text, node.head, content, relPath, sourceFile, findings);
        for (const span of node.templateSpans) {
          addTextFindings(span.literal.text, span.literal, content, relPath, sourceFile, findings);
        }
        return;
      }

      if (ts.isJsxText(node)) {
        const value = node.getText();
        addTextFindings(value, node, content, relPath, sourceFile, findings);
        return;
      }

      ts.forEachChild(node, visitNode);
    };
    visitNode(sourceFile);
  }

  if (findings.length === 0) {
    console.log('Copy lint passed.');
    return;
  }

  const unique = [];
  const seen = new Set();
  for (const finding of findings) {
    const key = `${finding.filePath}:${finding.line}:${finding.message}:${finding.source}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(finding);
  }

  console.error(`Copy lint found ${unique.length} issue(s).`);
  for (const finding of unique) {
    console.error(`- ${finding.filePath}:${finding.line} [${finding.source}] ${finding.message}`);
    if (finding.snippet) {
      console.error(`  snippet: ${finding.snippet}`);
    }
  }

  process.exit(1);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
