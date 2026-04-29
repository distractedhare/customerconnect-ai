import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const playableFactionIds = ['apple', 'samsung', 'tcl', 'motorola', 'pixel'];
const abilitySlots = ['smash', 'blast', 'core'];

const requiredAssets = playableFactionIds.flatMap((id) => [
  `public/assets/factions/${id}/cutout_transparent.png`,
  `public/assets/factions/${id}/hud_portrait.png`,
  `public/assets/factions/${id}/avatar_small.png`,
  ...abilitySlots.map((slot) => `public/assets/factions/${id}/abilities/${slot}.svg`),
]);

requiredAssets.push(
  'public/assets/factions/pixel/abilities/swarm.svg',
  'public/assets/factions/pixel/abilities/laser.svg',
  'public/assets/factions/pixel/abilities/protocol.svg',
);

const sourceFilesToScan = [
  'src/components/levelup/runner/content.ts',
  'src/components/levelup/runner/components/UI/CharacterCard.tsx',
  'src/components/levelup/runner/components/UI/CollectionMenu.tsx',
];

const missing = requiredAssets.filter((asset) => !existsSync(join(root, asset)));
const sourceViolations = [];

for (const file of sourceFilesToScan) {
  const abs = join(root, file);
  if (!existsSync(abs)) {
    sourceViolations.push(`${file}: missing source file`);
    continue;
  }

  const text = readFileSync(abs, 'utf8');
  for (const id of playableFactionIds) {
    const factionRoot = `/assets/factions/${id}`;
    const requiredSnippets = [
      `${factionRoot}/cutout_transparent.png`,
      `${factionRoot}/hud_portrait.png`,
      `${factionRoot}/avatar_small.png`,
      ...abilitySlots.map((slot) => `${factionRoot}/abilities/${slot}.svg`),
    ];
    for (const snippet of requiredSnippets) {
      if (file.endsWith('content.ts') && !text.includes(snippet)) {
        sourceViolations.push(`${file}: missing content reference for ${snippet}`);
      }
    }
  }
}

if (missing.length > 0 || sourceViolations.length > 0) {
  if (missing.length > 0) {
    console.error('Missing runner faction assets:');
    for (const asset of missing) console.error(`- ${asset}`);
  }
  if (sourceViolations.length > 0) {
    console.error('Runner asset policy violations:');
    for (const violation of sourceViolations) console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log(`Runner faction asset check passed (${requiredAssets.length} assets).`);
