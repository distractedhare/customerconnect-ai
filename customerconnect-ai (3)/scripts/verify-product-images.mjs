#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getProductImageManifest } from './product-image-manifest.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const EXPECTED_COUNTS = {
  device: 44,
  accessory: 62,
  learn: 5,
  fallback: 1,
};

const BRAND_ASSETS = [
  '/images/brands/apple.svg',
  '/images/brands/google.svg',
  '/images/brands/motorola.svg',
  '/images/brands/samsung.svg',
  '/images/brands/third-party.svg',
  '/images/brands/tmobile.svg',
];

function resolvePublicPath(targetPath) {
  const normalized = targetPath.replace(/^\//, '');
  return path.join(PUBLIC_DIR, normalized);
}

async function getFileBytesSafe(filePath) {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

async function main() {
  const manifest = await getProductImageManifest();
  const args = new Set(process.argv.slice(2));
  const failOnFallback = args.has('--fail-on-fallback');
  const missing = [];
  const empty = [];
  const duplicates = [];
  const fallbackHits = [];
  const missingBrandAssets = [];
  const emptyBrandAssets = [];
  const actualCounts = {
    device: 0,
    accessory: 0,
    learn: 0,
    fallback: 0,
  };
  const seen = new Set();
  const fallbackPath = resolvePublicPath('/images/ui/product-card-fallback.svg');
  const fallbackBytes = await getFileBytesSafe(fallbackPath);

  for (const item of manifest) {
    actualCounts[item.kind] = (actualCounts[item.kind] || 0) + 1;

    if (seen.has(item.path)) {
      duplicates.push(item.path);
      continue;
    }
    seen.add(item.path);

    const localPath = resolvePublicPath(item.path);
    const localBytes = await getFileBytesSafe(localPath);
    if (localBytes === null) {
      missing.push(item.path);
      continue;
    }
    const size = localBytes.byteLength;
    if (size === 0) {
      empty.push(item.path);
    }

    if (item.path !== '/images/ui/product-card-fallback.svg' && fallbackBytes && Buffer.compare(localBytes, fallbackBytes) === 0) {
      fallbackHits.push(item.path);
    }
  }

  for (const assetPath of BRAND_ASSETS) {
    const localPath = resolvePublicPath(assetPath);
    const localBytes = await getFileBytesSafe(localPath);
    if (localBytes === null) {
      missingBrandAssets.push(assetPath);
      continue;
    }

    if (localBytes.byteLength === 0) {
      emptyBrandAssets.push(assetPath);
    }
  }

  const mismatch = [];
  for (const [kind, expected] of Object.entries(EXPECTED_COUNTS)) {
    const actual = actualCounts[kind] || 0;
    if (actual !== expected) {
      mismatch.push(`Image manifest kind mismatch for ${kind}: expected ${expected}, got ${actual}`);
    }
  }

  if (missing.length > 0) {
    console.error(`Missing image files (${missing.length}):`);
    for (const item of missing) {
      console.error(`- ${item}`);
    }
  }

  if (empty.length > 0) {
    console.error(`Empty image files (${empty.length}):`);
    for (const item of empty) {
      console.error(`- ${item}`);
    }
  }

  if (fallbackHits.length > 0) {
    const method = failOnFallback ? console.error : console.warn;
    method(`Fallback-only image files (${fallbackHits.length}):`);
    for (const item of fallbackHits) {
      method(`- ${item}`);
    }
  }

  if (duplicates.length > 0) {
    console.error(`Duplicate manifest entries (${duplicates.length}):`);
    for (const item of duplicates) {
      console.error(`- ${item}`);
    }
  }

  if (missingBrandAssets.length > 0) {
    console.error(`Missing brand assets (${missingBrandAssets.length}):`);
    for (const item of missingBrandAssets) {
      console.error(`- ${item}`);
    }
  }

  if (emptyBrandAssets.length > 0) {
    console.error(`Empty brand assets (${emptyBrandAssets.length}):`);
    for (const item of emptyBrandAssets) {
      console.error(`- ${item}`);
    }
  }

  if (mismatch.length > 0) {
    console.error('Image manifest count check failed:');
    for (const item of mismatch) {
      console.error(`- ${item}`);
    }
  }

  let hasFailure = missing.length > 0
    || empty.length > 0
    || duplicates.length > 0
    || mismatch.length > 0
    || missingBrandAssets.length > 0
    || emptyBrandAssets.length > 0;
  if (failOnFallback && fallbackHits.length > 0) {
    hasFailure = true;
  }

  if (hasFailure) {
    process.exit(1);
  }

  console.log(`Image verification passed for ${manifest.length} image paths.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
