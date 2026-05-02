import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const playableCharacters = {
  apple: 'apple_titanium_duelist',
  samsung: 'samsung_foldwing_warrior',
  tcl: 'tcl_display_brawler',
  motorola: 'motorola_flip_rider',
  pixel: 'pixel_scout',
};
const abilitySlots = ['smash', 'blast', 'core'];

const rasterVariants = (assetPath) => [`${assetPath}.png`, `${assetPath}.webp`];

const requiredAssets = Object.entries(playableCharacters).flatMap(([id, slug]) => [
  ...rasterVariants(`public/levelup/runner/cards/${slug}_card`),
  ...rasterVariants(`public/levelup/runner/heroes/${slug}_hero`),
  ...rasterVariants(`public/levelup/runner/portraits/${slug}_portrait`),
  ...rasterVariants(`public/levelup/runner/avatars/${slug}_avatar`),
  ...rasterVariants(`public/levelup/runner/banners/${slug}_banner`),
  ...rasterVariants(`public/levelup/runner/mobile/${slug}_mobile`),
  ...abilitySlots.flatMap((slot) => rasterVariants(`public/levelup/runner/abilities/${id}-${slot}`)),
]);

requiredAssets.push(
  ...abilitySlots.flatMap((slot) => rasterVariants(`public/levelup/runner/abilities/kip-${slot}`)),
  ...rasterVariants('public/levelup/runner/cards/tmobile_sidekick_core_command_card_v2'),
  ...rasterVariants('public/levelup/runner/portraits/tmobile_sidekick_core_portrait'),
);

const sourceFilesToScan = [
  'src/components/levelup/runner/content.ts',
  'src/components/levelup/runner/components/UI/HUD.tsx',
  'src/components/levelup/runner/components/UI/CharacterCard.tsx',
  'src/components/levelup/runner/components/UI/CollectionMenu.tsx',
  'src/components/levelup/runner/components/UI/RunnerPicture.tsx',
  'public/sw.js',
];

const missing = requiredAssets.filter((asset) => !existsSync(join(root, asset)));
const sourceViolations = [];
const legacyFactionRoot = '/assets' + '/factions/';

for (const file of sourceFilesToScan) {
  const abs = join(root, file);
  if (!existsSync(abs)) {
    sourceViolations.push(`${file}: missing source file`);
    continue;
  }

  const text = readFileSync(abs, 'utf8');
  if (text.includes(legacyFactionRoot)) {
    sourceViolations.push(`${file}: uses retired faction art path ${legacyFactionRoot}`);
  }
  if (file.endsWith('content.ts')) {
    for (const [id, slug] of Object.entries(playableCharacters)) {
      const requiredSnippets = [
        `/levelup/runner/heroes/${slug}_hero.png`,
        `/levelup/runner/portraits/${slug}_portrait.png`,
        `/levelup/runner/avatars/${slug}_avatar.png`,
        ...abilitySlots.map((slot) => `/levelup/runner/abilities/${id}-${slot}.png`),
      ];
      for (const snippet of requiredSnippets) {
        if (!text.includes(snippet)) {
          sourceViolations.push(`${file}: missing content reference for ${snippet}`);
        }
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

console.log(`Runner clipped-art asset check passed (${requiredAssets.length} assets).`);
