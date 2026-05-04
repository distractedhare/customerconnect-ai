import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['src', 'app', 'api', 'config', 'public'];
const TEXT_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx',
  '.txt',
]);
const BINARY_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.pdf',
  '.png',
  '.webp',
]);

const forbiddenRepoPaths = [
  '.codex/agents',
  '.codex/config.toml',
  '.codex/hooks.json',
  '.qa-diff.mjs',
  '.qa-harness.mjs',
];

const forbiddenContent = [
  { label: 'Evy personal agent', pattern: /\bEvy\b/ },
  { label: 'personal workspace', pattern: /T-Mobile Personal/ },
  { label: 'owner email', pattern: /certorian@gmail\.com/i },
  { label: 'owner full name', pattern: /Branden Schulze/i },
  { label: 'personal life-management copy', pattern: /life (?:manager|management)/i },
  { label: 'Codex-only agent roster path', pattern: /\.codex\/agents/i },
];

function extensionFor(filePath) {
  const match = filePath.match(/(\.[^.\/]+)$/);
  return match ? match[1].toLowerCase() : '';
}

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === 'dist') continue;
      walk(fullPath, files);
      continue;
    }

    if (!stat.isFile()) continue;

    const ext = extensionFor(fullPath);
    if (BINARY_EXTENSIONS.has(ext)) continue;
    if (TEXT_EXTENSIONS.size && !TEXT_EXTENSIONS.has(ext)) continue;

    files.push(fullPath);
  }

  return files;
}

const failures = [];

for (const repoPath of forbiddenRepoPaths) {
  if (existsSync(join(ROOT, repoPath))) {
    failures.push(`${repoPath}: Codex/private agent files do not belong in the app repo.`);
  }
}

for (const dir of SCAN_DIRS) {
  for (const filePath of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, filePath);
    const text = readFileSync(filePath, 'utf8');

    for (const check of forbiddenContent) {
      if (check.pattern.test(text)) {
        failures.push(`${rel}: contains ${check.label}.`);
      }
    }
  }
}

if (failures.length) {
  console.error('Personal-agent leak check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Personal-agent leak check passed.');
