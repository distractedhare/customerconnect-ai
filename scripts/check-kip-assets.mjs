import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const requiredAssets = [
  'public/kip/hero.png',
  'public/kip/hero.webp',
  'public/kip/portrait.png',
  'public/kip/portrait.webp',
  'public/kip/orb.png',
  'public/kip/orb.webp',
  'public/kip/icons/kip-visor.svg',
  'public/kip/states/kip-idle.svg',
  'public/kip/states/kip-listening.svg',
  'public/kip/states/kip-tip.svg',
  'public/kip/states/kip-alert.svg',
  'public/kip/states/kip-success.svg',
  'public/kip/states/kip-loading.svg',
  'public/kip/states/kip-speaking.svg',
  'public/kip/states/kip-notification.svg',
  'public/kip/source-sheets/kip-production-review.png',
  'public/kip/source-sheets/kip-icon-system.png',
];

const kipAvatarSizes = [16, 32, 64, 128];
const kipAvatarStates = ['idle', 'listening', 'tip', 'alert', 'success', 'loading', 'speaking'];
for (const size of kipAvatarSizes) {
  for (const state of kipAvatarStates) {
    requiredAssets.push(`public/assets/kip/kip_${size}_${state}.svg`);
  }
}

const sourceFilesToScan = [
  'src/components/kip/kipAssets.ts',
  'src/components/kip/KipAvatar.tsx',
  'src/components/kip/KipBadge.tsx',
  'src/components/kip/KipHero.tsx',
  'src/components/levelup/runner/content.ts',
];

const forbiddenReferences = [
  {
    pattern: /\/levelup\/runner\/portraits\/tmobile_sidekick_core_portrait\.png/g,
    reason: 'Sidekick Core UI must use canonical /kip portrait assets, not runner portrait fallbacks.',
  },
];

const missing = requiredAssets.filter((asset) => !existsSync(join(root, asset)));

const violations = [];
for (const file of sourceFilesToScan) {
  const abs = join(root, file);
  if (!existsSync(abs)) {
    violations.push(`${file}: missing source file`);
    continue;
  }
  const text = readFileSync(abs, 'utf8');
  for (const rule of forbiddenReferences) {
    if (rule.pattern.test(text)) violations.push(`${file}: ${rule.reason}`);
    rule.pattern.lastIndex = 0;
  }
}

if (missing.length > 0 || violations.length > 0) {
  if (missing.length > 0) {
    console.error('Missing Kip assets:');
    for (const asset of missing) console.error(`- ${asset}`);
  }
  if (violations.length > 0) {
    console.error('Kip asset policy violations:');
    for (const violation of violations) console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Kip asset check passed (${requiredAssets.length} assets).`);
