import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname);
const sourceRoot = '/Users/brandenschulze/Desktop/untitled folder';
const publicRoot = path.join(repoRoot, 'public');

const png = (relative) => path.join(publicRoot, relative);
const source = (name) => path.join(sourceRoot, name);

const CHARACTER_OUTPUTS = {
  card: { width: 606, height: 1872, fit: 'contain' },
  banner: { width: 606, height: 341, fit: 'cover' },
  hero: { width: 606, height: 820, fit: 'cover' },
  portrait: { width: 512, height: 512, fit: 'cover' },
  avatar: { width: 192, height: 192, fit: 'cover' },
  mobile: { width: 512, height: 192, fit: 'cover' },
};

const BOSS_OUTPUTS = {
  banner: { width: 606, height: 341, fit: 'cover' },
  portrait: { width: 512, height: 512, fit: 'cover' },
  avatar: { width: 192, height: 192, fit: 'cover' },
};

const SOURCE_SHEETS = [
  ['KIP 1.png', 'kip/source-sheets/kip-icon-system.png'],
  ['KIP 2.png', 'kip/source-sheets/kip-production-review.png'],
  ['Apple character.png', 'levelup/runner/source-sheets/apple-character.png'],
  ['Samsung character.png', 'levelup/runner/source-sheets/samsung-character.png'],
  ['Motorola Character.png', 'levelup/runner/source-sheets/motorola-character.png'],
  ['Pixel Character.png', 'levelup/runner/source-sheets/pixel-character.png'],
  ['Pixel Character', 'levelup/runner/source-sheets/pixel-character-alt.png'],
  ['TCL Character', 'levelup/runner/source-sheets/tcl-character.png'],
  ['Bell Character 1.png', 'levelup/runner/source-sheets/bell-character-master.png'],
  ['Bell Character 2.png', 'levelup/runner/source-sheets/bell-encounter-system.png'],
  ['Deadzone Boss.png', 'levelup/runner/source-sheets/dead-zone-titan.png'],
  ['ATT Character.png', 'levelup/runner/source-sheets/atlas-backbone.png'],
  ['Verizon Character.png', 'levelup/runner/source-sheets/redline-commander.png'],
  ['Xfinity Character.png', 'levelup/runner/source-sheets/throttle-maw.png'],
  ['Multi character.png', 'levelup/runner/source-sheets/patchwork-hydra.png'],
  ['CL Character.png', 'levelup/runner/source-sheets/cl-character-unwired.png'],
];

const PLAYABLE = [
  {
    sheet: 'Apple character.png',
    slug: 'apple_titanium_duelist',
    crops: {
      card: [8, 10, 352, 760],
      banner: [368, 42, 492, 282],
      hero: [368, 42, 492, 282],
      portrait: [868, 48, 274, 274],
      avatar: [1170, 54, 150, 150],
      mobile: [368, 696, 760, 72],
    },
  },
  {
    sheet: 'Samsung character.png',
    slug: 'samsung_foldwing_warrior',
    crops: {
      card: [10, 10, 354, 704],
      banner: [380, 48, 570, 284],
      hero: [380, 48, 570, 284],
      portrait: [965, 48, 235, 284],
      avatar: [1210, 56, 150, 150],
      mobile: [1168, 392, 268, 312],
    },
  },
  {
    sheet: 'Motorola Character.png',
    slug: 'motorola_flip_rider',
    crops: {
      card: [10, 10, 350, 668],
      banner: [402, 48, 520, 284],
      hero: [402, 48, 520, 284],
      portrait: [930, 48, 240, 284],
      avatar: [1205, 56, 150, 150],
      mobile: [1188, 374, 246, 290],
    },
  },
  {
    sheet: 'Pixel Character.png',
    slug: 'pixel_scout',
    crops: {
      card: [10, 10, 366, 666],
      banner: [386, 48, 512, 302],
      hero: [386, 48, 512, 302],
      portrait: [908, 48, 240, 302],
      avatar: [1168, 58, 150, 150],
      mobile: [1166, 368, 270, 304],
    },
  },
  {
    sheet: 'TCL Character',
    slug: 'tcl_display_brawler',
    crops: {
      card: [294, 20, 232, 666],
      banner: [534, 48, 378, 324],
      hero: [534, 48, 378, 324],
      portrait: [923, 48, 232, 324],
      avatar: [1178, 58, 150, 150],
      mobile: [294, 724, 792, 118],
    },
  },
];

const BOSSES = [
  {
    sheet: 'Deadzone Boss.png',
    slug: 'dead-zone-titan',
    crops: {
      banner: [392, 48, 580, 276],
      portrait: [982, 48, 220, 276],
      avatar: [1234, 58, 150, 150],
    },
  },
  {
    sheet: 'ATT Character.png',
    slug: 'atlas-backbone',
    crops: {
      banner: [368, 48, 558, 276],
      portrait: [934, 48, 232, 276],
      avatar: [1210, 58, 150, 150],
    },
  },
  {
    sheet: 'Verizon Character.png',
    slug: 'redline-commander',
    crops: {
      banner: [396, 48, 478, 276],
      portrait: [887, 48, 266, 276],
      avatar: [1210, 58, 150, 150],
    },
  },
  {
    sheet: 'Xfinity Character.png',
    slug: 'throttle-maw',
    crops: {
      banner: [399, 48, 570, 276],
      portrait: [980, 48, 218, 276],
      avatar: [1230, 58, 150, 150],
    },
  },
  {
    sheet: 'Multi character.png',
    slug: 'patchwork-hydra',
    crops: {
      banner: [378, 48, 616, 276],
      portrait: [1006, 48, 194, 276],
      avatar: [1232, 58, 150, 150],
    },
  },
  {
    sheet: 'Bell Character 2.png',
    slug: 'bell-encounter',
    crops: {
      banner: [6, 64, 670, 196],
      portrait: [754, 698, 120, 164],
      avatar: [754, 698, 120, 164],
    },
  },
  {
    sheet: 'Bell Character 1.png',
    slug: 'bell',
    crops: {
      banner: [6, 68, 468, 450],
      portrait: [1084, 68, 358, 266],
      avatar: [1084, 68, 358, 266],
    },
  },
];

const KIP = [
  { sheet: 'KIP 1.png', dest: 'kip/hero.png', crop: [15, 68, 315, 460], output: { width: 512, height: 512, fit: 'cover' } },
  { sheet: 'KIP 1.png', dest: 'kip/portrait.png', crop: [910, 68, 245, 250], output: { width: 256, height: 256, fit: 'cover' } },
  { sheet: 'KIP 1.png', dest: 'kip/orb.png', crop: [1168, 72, 264, 250], output: { width: 256, height: 256, fit: 'cover' } },
  { sheet: 'KIP 1.png', dest: 'levelup/runner/abilities/kip-smash.png', crop: [1060, 1014, 40, 40], output: { width: 192, height: 192, fit: 'cover' } },
  { sheet: 'KIP 1.png', dest: 'levelup/runner/abilities/kip-blast.png', crop: [745, 1014, 40, 40], output: { width: 192, height: 192, fit: 'cover' } },
  { sheet: 'KIP 1.png', dest: 'levelup/runner/abilities/kip-core.png', crop: [625, 1014, 40, 40], output: { width: 192, height: 192, fit: 'cover' } },
];

const ABILITIES = [
  ['apple', 'Apple character.png', ['apple-smash', 'apple-blast', 'apple-core'], [793, 380, 190, 190], 210],
  ['samsung', 'Samsung character.png', ['samsung-smash', 'samsung-blast', 'samsung-core'], [755, 408, 160, 160], 140],
  ['tcl', 'TCL Character', ['tcl-smash', 'tcl-blast', 'tcl-core'], [850, 438, 150, 150], 205],
  ['motorola', 'Motorola Character.png', ['motorola-smash', 'motorola-blast', 'motorola-core'], [775, 385, 150, 150], 175],
  ['pixel', 'Pixel Character.png', ['pixel-smash', 'pixel-blast', 'pixel-core'], [722, 390, 150, 150], 152],
];

const EXISTING_WEBP_FALLBACKS = [
  'levelup/runner/cards/mech_character_cards_preview.png',
  'levelup/runner/cards/tmobile_sidekick_core_command_card_v2.png',
  'levelup/runner/portraits/tmobile_sidekick_core_portrait.png',
];

const OBSOLETE_GENERATED_ASSETS = [
  'levelup/runner/bosses/bell-master-banner.png',
  'levelup/runner/bosses/bell-master-banner.webp',
];

function cropBox([left, top, width, height]) {
  return { left, top, width, height };
}

async function ensureParent(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeCrop({ input, dest, crop, output }) {
  const pngDest = png(dest);
  const webpDest = pngDest.replace(/\.png$/i, '.webp');
  await ensureParent(pngDest);
  console.log(`write ${dest}`);

  const fit = output.fit ?? 'cover';
  const background = { r: 5, g: 0, b: 17, alpha: 1 };
  const image = sharp(input).extract(cropBox(crop)).resize({
    width: output.width,
    height: output.height,
    fit,
    background,
    position: 'centre',
    withoutEnlargement: false,
  });

  await image.png({ compressionLevel: 9 }).toFile(pngDest);
  await sharp(pngDest).webp({ quality: 84, effort: 4 }).toFile(webpDest);
}

async function copySourceSheets() {
  for (const [inputName, dest] of SOURCE_SHEETS) {
    const input = source(inputName);
    const output = png(dest);
    await ensureParent(output);
    try {
      await fs.access(output);
      continue;
    } catch {
      // Source sheet has not been archived yet.
    }
    await fs.copyFile(input, output);
  }
}

async function cleanupObsoleteAssets() {
  for (const relativePath of OBSOLETE_GENERATED_ASSETS) {
    await fs.rm(png(relativePath), { force: true });
  }
}

async function main() {
  console.log('archive source sheets');
  await copySourceSheets();
  await cleanupObsoleteAssets();

  console.log('write Kip assets');
  for (const item of KIP) {
    await writeCrop({
      input: source(item.sheet),
      dest: item.dest,
      crop: item.crop,
      output: item.output,
    });
  }

  console.log('write playable runner assets');
  for (const character of PLAYABLE) {
    const input = source(character.sheet);
    for (const [kind, crop] of Object.entries(character.crops)) {
      const folder = kind === 'card' ? 'cards' : kind === 'banner' ? 'banners' : kind === 'hero' ? 'heroes' : kind === 'portrait' ? 'portraits' : kind === 'avatar' ? 'avatars' : 'mobile';
      const suffix = kind === 'card' ? 'card' : kind === 'banner' ? 'banner' : kind === 'hero' ? 'hero' : kind === 'portrait' ? 'portrait' : kind === 'avatar' ? 'avatar' : 'mobile';
      await writeCrop({
        input,
        dest: `levelup/runner/${folder}/${character.slug}_${suffix}.png`,
        crop,
        output: CHARACTER_OUTPUTS[kind],
      });
    }
  }

  console.log('write boss assets');
  for (const boss of BOSSES) {
    const input = source(boss.sheet);
    for (const [kind, crop] of Object.entries(boss.crops)) {
      const suffix = kind === 'banner' ? 'banner' : kind === 'portrait' ? 'portrait' : 'avatar';
      await writeCrop({
        input,
        dest: `levelup/runner/bosses/${boss.slug}-${suffix}.png`,
        crop,
        output: BOSS_OUTPUTS[kind],
      });
    }
  }

  console.log('write ability assets');
  for (const [, sheet, names, [x, y, w, h], gap] of ABILITIES) {
    for (let index = 0; index < names.length; index += 1) {
      await writeCrop({
        input: source(sheet),
        dest: `levelup/runner/abilities/${names[index]}.png`,
        crop: [x + index * gap, y, w, h],
        output: { width: 192, height: 192, fit: 'cover' },
      });
    }
  }

  console.log('write existing WebP fallbacks');
  for (const relativePath of EXISTING_WEBP_FALLBACKS) {
    const input = png(relativePath);
    await sharp(input).resize({ width: 606, withoutEnlargement: true }).webp({ quality: 84, effort: 4 }).toFile(input.replace(/\.png$/i, '.webp'));
  }

  console.log('Runner art assets generated.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
