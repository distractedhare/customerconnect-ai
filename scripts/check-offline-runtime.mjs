#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const RUNTIME_SCAN_TARGETS = [
  path.join(ROOT_DIR, 'src'),
  path.join(ROOT_DIR, 'public'),
];

const TEXT_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.html',
  '.json',
  '.webmanifest',
]);

const URL_PATTERN = /https?:\/\/[^\s"'`)<]+/g;

function shouldSkipTextMatch(line, url) {
  return line.includes('xmlns=') || url.includes('example.com/logo.png');
}

function isTextFile(filePath) {
  return TEXT_EXTENSIONS.has(path.extname(filePath));
}

async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (fullPath.includes(`${path.sep}public${path.sep}images`)) {
        continue;
      }
      results.push(...(await walk(fullPath)));
      continue;
    }

    if (isTextFile(fullPath)) {
      results.push(fullPath);
    }
  }

  return results;
}

async function scanForRemoteUrls() {
  const findings = [];

  for (const target of RUNTIME_SCAN_TARGETS) {
    const files = await walk(target);
    for (const filePath of files) {
      const source = await fs.readFile(filePath, 'utf8');
      const lines = source.split('\n');

      lines.forEach((line, index) => {
        for (const match of line.matchAll(URL_PATTERN)) {
          const url = match[0];
          if (shouldSkipTextMatch(line, url)) {
            continue;
          }

          findings.push({
            filePath,
            line: index + 1,
            url,
          });
        }
      });
    }
  }

  return findings;
}

async function scanForSvgInPng() {
  const imagesRoot = path.join(ROOT_DIR, 'public', 'images');
  const pngFiles = [];

  async function walkImages(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        await walkImages(fullPath);
        continue;
      }

      if (fullPath.endsWith('.png')) {
        pngFiles.push(fullPath);
      }
    }
  }

  await walkImages(imagesRoot);

  const findings = [];
  for (const filePath of pngFiles) {
    const bytes = await fs.readFile(filePath);
    const header = bytes.subarray(0, 64).toString('utf8').trimStart();
    if (header.startsWith('<svg')) {
      findings.push(filePath);
    }
  }

  return findings;
}

async function main() {
  const remoteUrls = await scanForRemoteUrls();
  const fakePngs = await scanForSvgInPng();

  if (remoteUrls.length > 0) {
    console.error(`Remote runtime URLs found (${remoteUrls.length}):`);
    for (const finding of remoteUrls) {
      console.error(`- ${path.relative(ROOT_DIR, finding.filePath)}:${finding.line} -> ${finding.url}`);
    }
  }

  if (fakePngs.length > 0) {
    console.error(`PNG files containing SVG markup (${fakePngs.length}):`);
    for (const filePath of fakePngs) {
      console.error(`- ${path.relative(ROOT_DIR, filePath)}`);
    }
  }

  if (remoteUrls.length > 0 || fakePngs.length > 0) {
    process.exit(1);
  }

  console.log('Offline runtime audit passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
