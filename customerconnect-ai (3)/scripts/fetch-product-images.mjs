#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { getProductImageManifest } from './product-image-manifest.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const CONCURRENCY_LIMIT = 6;
const FALLBACK_USER_AGENT = 'Mozilla/5.0 (AppleWebKit/537.36) Apple iOS/18.0';

const args = new Set(process.argv.slice(2));
const force = args.has('--force');

function parseIntArg(name, fallback) {
  const match = [...args].find((arg) => arg.startsWith(`${name}=`));
  if (!match) return fallback;
  const value = Number.parseInt(match.slice(name.length + 1), 10);
  if (Number.isNaN(value) || value <= 0) {
    throw new Error(`Invalid value for ${name}: ${match}`);
  }
  return value;
}

const limit = parseIntArg('--limit', CONCURRENCY_LIMIT);
const MAX_PARSE_DEPTH = 3;

function resolvePublicPath(targetPath) {
  const normalized = targetPath.replace(/^\//, '');
  return path.join(PUBLIC_DIR, normalized);
}

function isBrowserUrl(candidate) {
  return candidate.startsWith('http://') || candidate.startsWith('https://');
}

function absolutizeUrl(candidate, baseUrl) {
  const trimmed = candidate.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return null;
  }
}

function decodeUnicodeEscapes(candidate) {
  return candidate.replace(/\\u([0-9a-fA-F]{4})/g, (_, codePoint) => {
    return String.fromCharCode(parseInt(codePoint, 16));
  });
}

function decodeCandidate(candidate) {
  return candidate
    .replace(/\\\//g, '/')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')
    .replace(/\\\\/g, '\\')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .trim();
}

function isLikelyImageUrl(candidate) {
  const lower = candidate.toLowerCase();

  if (/(?:\.)(?:png|jpe?g|webp|gif|bmp|svg|avif)(?:\?|$)/i.test(lower)) {
    return true;
  }

  if (/(?:\?|&)(?:fmt=|wid=|hei=|w=|h=|qlt=|res=)/i.test(lower)) {
    return /storeimages|as-images|scene7|cdn-apple|apple\.com\/shop|shop\.apple\.com|motorola\.com\/us|samsung\.com\/us|t-mobile\.com\/cell-phones|t-mobile\.com\/devices|t-mobile\.com\/accessories/.test(lower);
  }

  return false;
}

function getAttr(tag, attr) {
  const pattern = new RegExp(`${attr}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = tag.match(pattern);
  return match ? match[2].trim() : null;
}

function parseSrcsetValues(value) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.split(/\s+/)[0])
    .filter(Boolean);
}

function collectImageCandidates(rawValue, baseUrl, candidates, seen) {
  const normalized = decodeCandidate(decodeUnicodeEscapes(rawValue));
  const absolute = absolutizeUrl(normalized, baseUrl);

  if (!absolute || !isLikelyImageUrl(absolute) || seen.has(absolute)) {
    return;
  }

  seen.add(absolute);
  candidates.push(absolute);
}

function collectFromJsonValue(value, baseUrl, candidates, seen) {
  if (!value) {
    return;
  }
  if (typeof value === 'string') {
    if (isLikelyImageUrl(value)) {
      collectImageCandidates(value, baseUrl, candidates, seen);
    }
    return;
  }
  if (typeof value !== 'object') {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectFromJsonValue(item, baseUrl, candidates, seen);
    }
    return;
  }

  for (const item of Object.values(value)) {
    if (typeof item === 'object' || typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
      collectFromJsonValue(item, baseUrl, candidates, seen);
    }
  }
}

function parseImageCandidatesFromHtml(html, pageUrl) {
  const candidates = [];
  const seen = new Set();

  const metaTags = html.matchAll(/<meta[^>]+>/gi);
  for (const tagMatch of metaTags) {
    const tag = tagMatch[0];
    const property = (getAttr(tag, 'property') || getAttr(tag, 'name') || '').toLowerCase();
    const content = getAttr(tag, 'content');

    if (!content) continue;

    const isImageMeta = property === 'og:image'
      || property === 'og:image:url'
      || property === 'og:image:secure_url'
      || property === 'twitter:image'
      || property === 'twitter:image:src';

    if (!isImageMeta) continue;

    collectImageCandidates(content, pageUrl, candidates, seen);
  }

  const linkTags = html.matchAll(/<link[^>]+>/gi);
  for (const tagMatch of linkTags) {
    const tag = tagMatch[0];
    const rel = (getAttr(tag, 'rel') || '').toLowerCase();
    if (rel !== 'image_src' && rel !== 'icon' && rel !== 'shortcut icon' && rel !== 'apple-touch-icon') {
      continue;
    }
    const href = getAttr(tag, 'href');
    if (!href) continue;
    collectImageCandidates(href, pageUrl, candidates, seen);
  }

  const attrPatternTargets = [
    { tag: /<img[^>]*>/gi, attrs: ['src', 'data-src', 'data-lazy-src', 'srcset', 'data-srcset'] },
    { tag: /<source[^>]*>/gi, attrs: ['src', 'srcset', 'data-srcset'] },
    { tag: /<a[^>]*>/gi, attrs: ['href'] },
    { tag: /<link[^>]*>/gi, attrs: ['href'] },
  ];

  for (const { tag: pattern, attrs } of attrPatternTargets) {
    for (const tagMatch of html.matchAll(pattern)) {
      const tag = tagMatch[0];
      for (const attr of attrs) {
        const rawValue = getAttr(tag, attr);
        if (!rawValue) continue;
        if (attr.endsWith('srcset') || attr === 'data-srcset') {
          for (const value of parseSrcsetValues(rawValue)) {
            collectImageCandidates(value, pageUrl, candidates, seen);
          }
          continue;
        }
        collectImageCandidates(rawValue, pageUrl, candidates, seen);
      }
    }
  }

  const rawUrlPattern = /https?:\/\/[^"'`\\s<>]+(?:\?[^"'`\\s<>]*)?/g;
  for (const rawMatch of html.matchAll(rawUrlPattern)) {
    collectImageCandidates(rawMatch[0], pageUrl, candidates, seen);
  }

  const scriptTags = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  for (const scriptMatch of scriptTags) {
    const scriptBody = scriptMatch[1] ?? '';
    collectFromJsonValue(scriptBody, pageUrl, candidates, seen);

    for (const rawMatch of scriptBody.matchAll(rawUrlPattern)) {
      collectImageCandidates(rawMatch[0], pageUrl, candidates, seen);
    }
  }

  const ldJsonPattern = /<script[^>]+type=(["'])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi;
  for (const scriptMatch of html.matchAll(ldJsonPattern)) {
    try {
      const parsed = JSON.parse(scriptMatch[2]);
      collectFromJsonValue(parsed, pageUrl, candidates, seen);
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  }

  return candidates;
}

async function requestAsBuffer(url, label, visitedPages, depth = 0) {
  if (depth > MAX_PARSE_DEPTH) {
    throw new Error(`Parse depth exceeded while resolving ${label}`);
  }

  const response = await fetch(url, {
    headers: {
      'User-Agent': FALLBACK_USER_AGENT,
      'Accept': 'text/html,application/xhtml+xml,application/json,image/*,*/*;q=0.8',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${label}: ${response.status} ${response.statusText}`);
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('text/html') || contentType.includes('application/xhtml') || contentType.includes('application/json')) {
    if (visitedPages.has(url)) {
      throw new Error(`Image fallback loop while resolving ${label}`);
    }
    visitedPages.add(url);
    const body = await response.text();
    const candidates = parseImageCandidatesFromHtml(body, url);
    for (const candidate of candidates) {
      try {
        return await requestAsBuffer(candidate, label, visitedPages, depth + 1);
      } catch {
        // Keep searching.
      }
    }

    throw new Error(`No resolvable image found on page ${label}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength === 0) {
    throw new Error(`Empty image response for ${label}`);
  }
  return buffer;
}

// Minimum byte size for an image to be considered already downloaded (not a placeholder).
// Placeholders in this project are ≤31KB. Real product photos start at ~100KB.
const MIN_REAL_IMAGE_BYTES = 50_000;

async function getFileSizeSafe(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

// Write via rename to work around filesystem locks on existing files.
async function writeViaRename(outputPath, buffer) {
  const tmpPath = outputPath + '.tmp.' + Date.now();
  await fs.writeFile(tmpPath, buffer);
  await fs.rename(tmpPath, outputPath);
}

async function copyFromFallback(outputPath, sourcePath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  if (sourcePath === outputPath) {
    return;
  }
  const srcBuffer = await fs.readFile(sourcePath);
  await writeViaRename(outputPath, srcBuffer);
}

async function writeImage(targetPath, source, kind, label) {
  const outputPath = resolvePublicPath(targetPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  if (!force) {
    const existingSize = await getFileSizeSafe(outputPath);
    if (existingSize >= MIN_REAL_IMAGE_BYTES) {
      // Already a real image — skip re-download.
      return { targetPath, status: 'skip' };
    }
    // File is missing or a small placeholder — proceed with download.
  }

  if (!isBrowserUrl(source)) {
    const fallbackPath = resolvePublicPath(source);
    await copyFromFallback(outputPath, fallbackPath);
    return { targetPath, status: 'downloaded', kind, label };
  }

  const buffer = await requestAsBuffer(source, `${kind} ${label}`, new Set());
  // Reject images that are too small to be real product photos (probably icons or error page images).
  const MIN_BUFFER_BYTES = (kind === 'learn' || kind === 'fallback') ? 1_000 : 20_000;
  if (buffer.byteLength < MIN_BUFFER_BYTES) {
    throw new Error(`Downloaded image too small for ${kind} ${label}: ${buffer.byteLength} bytes (min ${MIN_BUFFER_BYTES})`);
  }
  await writeViaRename(outputPath, buffer);
  return { targetPath, status: 'downloaded', kind, label };
}

async function runWithLimit(entries, worker) {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, entries.length) }, async () => {
    while (index < entries.length) {
      const currentIndex = index++;
      const item = entries[currentIndex];
      results.push(await worker(item));
    }
  });

  await Promise.all(workers);
  return results;
}

async function main() {
  const manifest = await getProductImageManifest();
  const errors = [];

  const results = await runWithLimit(
    manifest,
    async ({ path: targetPath, sourceUrls, fallbackSource, kind, label }) => {
      const attemptedSources = [...new Set([...sourceUrls, fallbackSource])];
      const tries = [];
      for (const sourceUrl of attemptedSources) {
        tries.push(sourceUrl);
      }

      for (const sourceUrl of tries) {
        try {
          return await writeImage(targetPath, sourceUrl, kind, label || targetPath);
        } catch (error) {
          console.warn(`[${targetPath}] source failed: ${sourceUrl} (${error instanceof Error ? error.message : String(error)})`);
        }
      }

      errors.push({ targetPath, error: 'All image sources failed for this item.' });
      return { targetPath, status: 'failed' };
    },
  );

  const failed = results.filter((item) => item.status === 'failed');
  if (failed.length > 0) {
    console.error(`Image download failed for ${failed.length}/${manifest.length} files.`);
    for (const item of failed) {
      console.error(`- ${item.targetPath}`);
    }
    process.exit(1);
  }

  const skipped = results.filter((item) => item.status === 'skip').length;
  const downloaded = results.filter((item) => item.status === 'downloaded').length;

  console.log(`Downloaded ${downloaded} images, skipped ${skipped} existing images.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
