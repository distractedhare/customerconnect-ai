# Image Duplicates Audit — 2026-04-19

**Context:** All groups below are byte-identical PNG files (same md5) at different paths under `improved-robot/public/images/`. Before iOS/Android start consuming these assets, we need to know which filenames are real distinct references (used by code) and which are placeholder duplicates that each still need their own real image.

**Method:** For each filename, grepped `improved-robot/src/`, `improved-robot/scripts/`, `public/manifest.json`, `public/device-ecosystem-matrix.json`, `public/sw.js`, `vite.config.ts`, `vercel.json`, `package.json`, and `app/`+`api/`.

**Important reference pattern:** accessory images are loaded dynamically via
`getAccessoryImageUrl(name)` → `` `/images/accessories/${slugifyAccessoryName(name)}.png` ``
(see `src/data/accessoryImagePaths.ts`). The live caller is
`src/components/GamePlanTab.tsx:464`, where `name = rec.items[0] ?? rec.category`.
`rec.items` is populated from `public/device-ecosystem-matrix.json` `accessories[].items`.
So an accessory filename counts as REFERENCED only if some matrix `items[0]` value
slugifies to exactly that filename stem.

`imageKey: slugifyAccessoryName(...)` in `src/data/accessoryCatalog.ts` is set but
**never read** anywhere in `src/` — it's currently a dead property, so it does NOT
make a filename referenced by itself.

`scripts/product-image-manifest.mjs` is the download/scrape manifest used by the
asset-download pipeline. It declares a destination `path` for each product. A
filename being listed there means "we intended this to be a distinct real
asset" — it's a strong signal of intent, but it doesn't mean the PWA currently
renders that path. For this audit, treat manifest-only references as
UNREFERENCED **by the app code**, but flagged as "declared in download manifest".

---

## Summary table

| Group | Files (n) | Live src/ references | Recommendation |
|---|---|---|---|
| A — plan tiers | 5 | All 5 in `PlansSection.tsx` + all 5 in manifest | Keep all; they render 5 distinct plan tiles — need 5 real images |
| B — car mount/charger | 4 | 0 in src/ (all in manifest only) | Keep all; all declared in download manifest as distinct products — need 4 real images |
| C — protection/screen bundle | 3 | 1 (`protection-360.png` via accessoryCatalog imageKey, but imageKey is dead; none via live render path) | Declared 3 distinct in manifest; live app never renders them — needs human decision |
| D — SyncUP Tracker | 2 | `syncup-tracker-2.png` LIVE (devices); `syncup-tracker.png` unreferenced in src/ (manifest only) | Keep tracker-2; the accessory copy is duplicate/placeholder |
| E — SyncUP Drive | 2 | `syncup-drive.png` LIVE (devices); accessories/syncup-drive.png unreferenced in src/ | Keep devices copy; accessories copy is duplicate/placeholder |
| F — Samsung clear / Otterbox-Case-Mate | 2 | 0 in src/ (manifest only) | Keep both for now; distinct products in manifest — need 2 real images |
| G — ZAGG Glass Elite std / screen-protector | 2 | 0 in src/ (manifest only) | Keep both; distinct entries in manifest |
| H — tablet / ZAGG screen protector | 2 | 0 in src/ (manifest only) | Keep both; distinct entries in manifest |
| I — tech21-evoclear / case-mate-tech21 | 2 | 0 in src/ (manifest only) | Keep both; distinct entries in manifest |
| J — Apple Watch SE 3 / 2nd gen | 2 | BOTH LIVE in `deviceImagePaths.ts` + manifest | Keep both; each is a distinct device — need 2 real images |
| K — AirPods Pro 3 / 2 | 2 | `airpods-pro-3.png` LIVE via matrix items; `airpods-pro-2.png` in `accessoryPitches.ts` string only (no image path) | Keep both; each is a distinct product |
| L — iPad Air 11 / 13 M4 | 2 | BOTH LIVE in `deviceImagePaths.ts` + manifest | Keep both; distinct devices — need 2 real images |
| M — MagSafe charger (2 aliases) | 2 | 0 in src/ (manifest only) | Mixed / human decision — these are likely intentional aliases for the SAME product |
| N — tablet-keyboard / zagg-keyboard | 2 | 0 in src/ (manifest only) | Keep both; distinct entries in manifest |
| O — extra-watch-band / samsung-wireless-charger-duo | 2 | 0 in src/ (manifest only) | Keep both; TOTALLY unrelated products — byte-identity is clearly an accidental placeholder |
| P — belkin-qi2 / magsafe-qi2 | 2 | 0 in src/ (manifest only) | Keep both; distinct entries in manifest (but possibly intentional aliases) |

**Headline:** 2 groups (D, E) are clearly safe to dedupe by dropping the unreferenced copy. The remaining 14 groups are placeholder/duplicate PNGs where each filename is a semantically distinct product that needs its own real image before iOS/Android go live — **not** intentional aliases.

---

## Per-group detail

### GROUP A — Plan tier images (5 copies)
**Filenames:**
- `plan-better-value.png`
- `plan-essentials-saver.png`
- `plan-experience-beyond.png`
- `plan-essentials.png`
- `plan-experience-more.png`

**Code references found (all LIVE):**
- `plan-experience-beyond.png` → `src/components/learn/PlansSection.tsx:14`
- `plan-experience-more.png` → `src/components/learn/PlansSection.tsx:21`
- `plan-better-value.png` → `src/components/learn/PlansSection.tsx:28`
- `plan-essentials.png` → `src/components/learn/PlansSection.tsx:35`
- `plan-essentials-saver.png` → `src/components/learn/PlansSection.tsx:42`
- All 5 also declared in `scripts/product-image-manifest.mjs:1171,1181,1191,1201,1211`.

**Semantic implication:** Each filename is one of T-Mobile's 5 plan tiles (Experience Beyond, Experience More, Better Value, Essentials, Essentials Saver).

**Classification:**
- All 5 → **ALIAS** (referenced with this exact name in `PlansSection.tsx` — the code treats each as a distinct tile).

**Recommendation:** Keep all. They're all referenced. Each needs its own real plan-tier tile image — the current byte-identical fallback is a placeholder.

---

### GROUP B — Car mount / car charger (4 copies)
**Filenames:**
- `iottie-qi2-mini-wireless-charging-car-mount.png`
- `scosche-car-charger.png`
- `car-mount-car-charger.png`
- `belkin-magsafe-car-mount.png`

**Code references found:**
- None in `src/`.
- All four declared as distinct products in `scripts/product-image-manifest.mjs:613,646,742,1028`.
- Note: the live `device-ecosystem-matrix.json` references `"iOttie Qi2 Wireless Charging Car Mount"` → slug `iottie-qi2-wireless-charging-car-mount` (no "mini") — **that doesn't resolve to any of these files**. So even the iOttie filename is only hit if the matrix entry were renamed to match; today it misses.

**Semantic implication:** Four different car-related accessory products (iOttie mount, Scosche charger, generic car mount/charger bundle, Belkin mount).

**Classification:**
- All 4 → **UNREFERENCED** by src/, but **declared in download manifest** as distinct products.

**Recommendation:** Keep all. They're all intended to be distinct products in the download manifest — each needs its own real image. None are intentional code aliases.

---

### GROUP C — Protection / screen-protector bundle (3 copies)
**Filenames:**
- `protection-360.png`
- `watch-screen-protector.png`
- `zagg-glass-elite-privacy-360-iphone.png`

**Code references found:**
- `accessoryCatalog.ts:32` has `imageKey: slugifyAccessoryName('Protection 360')` → `protection-360` — but `imageKey` is never read. Dead reference.
- `accessoryCatalog.ts:202` has `imageKey: slugifyAccessoryName('ZAGG Glass Elite Privacy 360')` → slugifies to `zagg-glass-elite-privacy-360` (no `-iphone` suffix) — doesn't match the `-iphone` file anyway.
- None match via the live `getAccessoryImageUrl` path (matrix never yields these slugs).
- All three declared in `scripts/product-image-manifest.mjs:696,872,1116`.

**Semantic implication:** Three unrelated protection SKUs — P360 service tile, watch screen protector, iPhone-specific ZAGG privacy protector.

**Classification:**
- `protection-360.png` → **UNREFERENCED** (imageKey is dead code; no live code reads it)
- `watch-screen-protector.png` → **UNREFERENCED**
- `zagg-glass-elite-privacy-360-iphone.png` → **UNREFERENCED**

**Recommendation:** Mixed / human decision. All three are unused by the app today, but all three are distinct products in the download manifest. If you plan to wire up `imageKey` → image URL on the catalog entries, you'll want `protection-360.png` and (a renamed) `zagg-glass-elite-privacy-360-iphone.png` as real assets. Otherwise all three can be considered placeholders.

---

### GROUP D — SyncUP Tracker (2 copies)
**Filenames:**
- `accessories/syncup-tracker.png`
- `devices/syncup-tracker-2.png`

**Code references found:**
- `syncup-tracker-2.png` (devices path) → **LIVE** in `src/data/deviceImagePaths.ts:45` (`'SyncUP TRACKER 2'`); also `scripts/product-image-manifest.mjs:275`.
- `syncup-tracker.png` (accessories path) → only `scripts/product-image-manifest.mjs:1050`. No src/ reference.
- Note: accessoryCatalog's `SyncUP Tracker 2` entry slugifies to `syncup-tracker-2`, which points to `/images/accessories/syncup-tracker-2.png` — a file that doesn't exist in the accessories dir (the -2 copy is only in `devices/`). This is a latent bug unrelated to dedupe.

**Semantic implication:** `syncup-tracker-2.png` is the current T-Mobile SyncUP Tracker 2 product. `accessories/syncup-tracker.png` implies a legacy/original tracker; no product of that name is active.

**Classification:**
- `devices/syncup-tracker-2.png` → **ALIAS/LIVE** (referenced in deviceImagePaths)
- `accessories/syncup-tracker.png` → **UNREFERENCED**

**Recommendation:** Keep `devices/syncup-tracker-2.png`, drop `accessories/syncup-tracker.png` (unreferenced). It's a leftover from the pre-Tracker-2 lineup.

---

### GROUP E — SyncUP DRIVE (2 copies)
**Filenames:**
- `accessories/syncup-drive.png`
- `devices/syncup-drive.png`

**Code references found:**
- `devices/syncup-drive.png` → **LIVE** in `src/data/deviceImagePaths.ts:44` (`'SyncUP DRIVE'`); also `scripts/product-image-manifest.mjs:265`.
- `accessories/syncup-drive.png` → only `scripts/product-image-manifest.mjs:1040`.
- Note: accessoryCatalog's `SyncUP DRIVE` entry slugifies to `syncup-drive` → would resolve to `/images/accessories/syncup-drive.png`. So the accessories copy IS the target of a (dead-code-path) `imageKey`. Live app never asks for it, but a future wiring of imageKey would.

**Semantic implication:** Both filenames point at the same physical product. `devices/` is for device-grid; `accessories/` is for accessory-catalog.

**Classification:**
- `devices/syncup-drive.png` → **ALIAS/LIVE**
- `accessories/syncup-drive.png` → **AMBIGUOUS** (not currently referenced, but is the natural target if `imageKey` wiring is turned on)

**Recommendation:** Keep devices copy for sure. For the accessories copy, either (a) keep it because it's the catalog target, or (b) drop it and rely on a single source once catalog wiring goes live. **One real image should back both paths** — these really are the same product. Good candidate to dedupe by having the catalog read from `/images/devices/syncup-drive.png`, or by symlinking.

---

### GROUP F — Samsung clear case / Otterbox-Case-Mate (2 copies)
**Filenames:**
- `accessories/samsung-clear-case-otterbox.png`
- `accessories/otterbox-case-mate-case.png`

**Code references found:**
- None in `src/`.
- Both in `scripts/product-image-manifest.mjs:996,676`.
- Note: `accessoryPitches.ts:30` has a text item `'OtterBox / Case-Mate Case'` (a name, no image rendering path).

**Semantic implication:** `samsung-clear-case-otterbox.png` is an Otterbox clear case for Samsung; `otterbox-case-mate-case.png` is a generic iPhone Otterbox/Case-Mate placeholder (the pitch text mentions both brands). Different products.

**Classification:** Both → **UNREFERENCED** by src/; both declared in manifest.

**Recommendation:** Keep both; they represent different SKUs in the download manifest. Each still needs a real image.

---

### GROUP G — ZAGG Glass Elite standard / screen-protector (2 copies)
**Filenames:**
- `accessories/zagg-glass-elite-standard.png`
- `accessories/screen-protector.png`

**Code references found:**
- None in `src/`.
- Both in `scripts/product-image-manifest.mjs:1126,862`.
- Note: `accessoryCatalog.ts:180` has `imageKey: slugifyAccessoryName('ZAGG Glass Elite')` → slug `zagg-glass-elite` (not `-standard`) — doesn't match.
- Matrix line 478 has `"Screen protectors"` (plural, slug `screen-protectors`) — doesn't match `screen-protector.png` (singular).

**Semantic implication:** `zagg-glass-elite-standard.png` is the ZAGG Glass Elite standard screen protector; `screen-protector.png` looks like a generic/fallback screen-protector thumbnail.

**Classification:** Both → **UNREFERENCED**.

**Recommendation:** Keep both for now; each is a distinct manifest entry. `screen-protector.png` in particular reads as a generic placeholder — worth asking whether it should exist as a real file or be replaced by a category-level fallback.

---

### GROUP H — Tablet / ZAGG screen protector (2 copies)
**Filenames:**
- `accessories/tablet-screen-protector.png`
- `accessories/zagg-screen-protector.png`

**Code references found:**
- None in `src/`.
- Both in `scripts/product-image-manifest.mjs:912,1156`.
- Note: `accessoryPitches.ts` has a text pitch named `'ZAGG Screen Protector'` but no image render path.

**Semantic implication:** A tablet screen protector vs a ZAGG-branded (phone) screen protector — different products.

**Classification:** Both → **UNREFERENCED**.

**Recommendation:** Keep both; each is a distinct manifest product.

---

### GROUP I — Tech21 EvoClear / Case-Mate Tech21 (2 copies)
**Filenames:**
- `accessories/tech21-evoclear-w-magsafe.png`
- `accessories/case-mate-tech21-case.png`

**Code references found:**
- None in `src/`.
- Both in `scripts/product-image-manifest.mjs:1062,656`.
- Note: `accessoryCatalog.ts:87` has `imageKey: slugifyAccessoryName('Tech21 EvoClear w/ MagSafe')` → slug `tech21-evoclear-w-magsafe` — matches the filename exactly, but imageKey is never consumed.

**Semantic implication:** Tech21 EvoClear MagSafe case vs a Case-Mate/Tech21 pairing placeholder — different SKUs.

**Classification:** Both → **UNREFERENCED** (tech21-evoclear is AMBIGUOUS — latent target if imageKey gets wired up).

**Recommendation:** Keep both. `tech21-evoclear-w-magsafe.png` is particularly important to have as a real image since it's already named to match the slugify output.

---

### GROUP J — Apple Watch SE 3 / SE 2nd gen (2 copies)
**Filenames:**
- `devices/apple-watch-se-3.png`
- `devices/apple-watch-se-2nd-gen.png`

**Code references found:**
- `apple-watch-se-3.png` → **LIVE** in `src/data/deviceImagePaths.ts:33`; also manifest :411.
- `apple-watch-se-2nd-gen.png` → **LIVE** in `src/data/deviceImagePaths.ts:34`; also manifest :422.

**Semantic implication:** Two distinct Apple Watch SKUs — the new SE 3 and the older SE 2nd gen (still actively sold).

**Classification:** Both → **ALIAS/LIVE**.

**Recommendation:** Keep both. They're both rendered live; each needs its own real image.

---

### GROUP K — AirPods Pro 3 / 2 (2 copies)
**Filenames:**
- `accessories/airpods-pro-3.png`
- `accessories/airpods-pro-2.png`

**Code references found:**
- `airpods-pro-3.png` → **LIVE** via `device-ecosystem-matrix.json:249` (`"AirPods Pro 3"` → slug `airpods-pro-3`); also `accessoryCatalog.ts:549` imageKey; also manifest :523.
- `airpods-pro-2.png` → `accessoryPitches.ts:27` has a text item named `'AirPods Pro 2'` (no live image render); manifest :513.

**Semantic implication:** Distinct SKUs — Pro 3 is current, Pro 2 is the older generation still referenced in legacy pitches.

**Classification:**
- `airpods-pro-3.png` → **ALIAS/LIVE**
- `airpods-pro-2.png` → **UNREFERENCED** in live render path, but the name appears in pitches text.

**Recommendation:** Keep both. Pro 3 is actively rendered; Pro 2 is used in pitch copy and should remain as a distinct product image if that pitch ever gets wired to an image.

---

### GROUP L — iPad Air 11" / 13" M4 (2 copies)
**Filenames:**
- `devices/ipad-air-11-m4.png`
- `devices/ipad-air-13-m4.png`

**Code references found:**
- Both **LIVE** in `src/data/deviceImagePaths.ts:25,26`; both in manifest :327,337.

**Semantic implication:** Two sizes of the M4 iPad Air — distinct products.

**Classification:** Both → **ALIAS/LIVE**.

**Recommendation:** Keep both. Each is rendered as a distinct device.

---

### GROUP M — MagSafe charger (2 copies, likely aliases)
**Filenames:**
- `accessories/magsafe-charger-apple.png`
- `accessories/apple-magsafe-charger-2m.png`

**Code references found:**
- None in `src/` live render path.
- Both in `scripts/product-image-manifest.mjs:545,535`.
- `accessoryCatalog.ts:362` has `imageKey: slugifyAccessoryName('Apple MagSafe Charger 2m')` → slug `apple-magsafe-charger-2m` — exact match but imageKey is dead.
- `device-ecosystem-matrix.json:259` has `"Apple MagSafe Charger"` → slug `apple-magsafe-charger` — matches **neither** file (missing `-2m` and not `-apple` word order).
- `accessoryPitches.ts:25` has text `'MagSafe Charger (Apple)'` (no image rendering).

**Semantic implication:** Almost certainly the **same physical product** (Apple 2m MagSafe charger) with two different naming conventions. `magsafe-charger-apple.png` looks like a reverse-word placeholder; `apple-magsafe-charger-2m.png` is the canonical catalog slug.

**Classification:** Both → **UNREFERENCED** in live code, but `apple-magsafe-charger-2m.png` is the latent catalog target.

**Recommendation:** Mixed / human decision. These look like intentional duplicate names for the same product. Recommend: keep `apple-magsafe-charger-2m.png` as the real asset, delete `magsafe-charger-apple.png` — OR pick one convention and update manifest accordingly. Also worth renaming the matrix entry from `"Apple MagSafe Charger"` → `"Apple MagSafe Charger 2m"` so its slug lines up.

---

### GROUP N — Tablet keyboard / ZAGG keyboard (2 copies)
**Filenames:**
- `accessories/tablet-keyboard-case.png`
- `accessories/zagg-keyboard-case.png`

**Code references found:**
- None in `src/` live render path.
- Both in `scripts/product-image-manifest.mjs:902,1136`.
- `accessoryPitches.ts:62` has text `'ZAGG Keyboard Case'` (no image rendering).
- `positioningService.ts:352` has a regex name `'Tablet Keyboard Case'` (categorization only, no image).

**Semantic implication:** Generic tablet keyboard case vs ZAGG-branded keyboard case — possibly the same product, possibly two SKUs.

**Classification:** Both → **UNREFERENCED**.

**Recommendation:** Keep both for now; distinct manifest entries. Possibly intentional aliases — worth confirming whether `tablet-keyboard-case.png` is meant to be a category placeholder vs a specific product.

---

### GROUP O — Extra watch band / Samsung wireless charger duo (2 copies)
**Filenames:**
- `accessories/extra-watch-band.png`
- `accessories/samsung-wireless-charger-duo.png`

**Code references found:**
- None in `src/` live render path.
- Both in `scripts/product-image-manifest.mjs:842,986`.
- Both appear as text names in `accessoryPitches.ts:70,39` (no image rendering).

**Semantic implication:** A watch band and a wireless charger duo — **totally unrelated products** that happen to share a byte-identical placeholder image. This is almost certainly an accidental copy from a single fallback source during asset scaffolding.

**Classification:** Both → **UNREFERENCED**.

**Recommendation:** Keep both; they're clearly intended to be different products. The byte-identity is an accident of placeholder generation — each needs a real, distinct image before iOS/Android go live.

---

### GROUP P — Belkin Qi2 / MagSafe Qi2 wireless charger (2 copies)
**Filenames:**
- `accessories/belkin-qi2-charger.png`
- `accessories/magsafe-qi2-wireless-charger.png`

**Code references found:**
- None in `src/` live render path.
- Both in `scripts/product-image-manifest.mjs:624,555`.
- `accessoryPitches.ts:53` has text `'Belkin Qi2 Charger'` (no image rendering).

**Semantic implication:** Both are Qi2 wireless chargers — possibly the same physical product (Belkin brand, Qi2 spec), possibly two different SKUs. `magsafe-qi2-wireless-charger.png` reads as a generic category label while `belkin-qi2-charger.png` is brand-specific.

**Classification:** Both → **UNREFERENCED**.

**Recommendation:** Keep both; each is a distinct manifest entry. Possibly intentional aliases — worth confirming if `magsafe-qi2-wireless-charger.png` is meant to be a generic category thumbnail vs a specific SKU.
