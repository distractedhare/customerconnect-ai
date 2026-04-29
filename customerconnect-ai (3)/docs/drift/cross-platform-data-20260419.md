# Cross-Platform Data Drift — 2026-04-19

**Context & target state:** T-Mobile Sales Assistant ships on three platforms: web
(React/TypeScript PWA in `improved-robot/`), iOS (SwiftUI in
`T-Mobile Sales Assistant/ios/`), and Android (not yet built). Today each platform
ships its own copy of the "sales knowledge" — plans, devices, competitors,
accessories, home internet, differentiators, sales methodology. That is a content
drift hazard: web is iterated weekly, iOS was last touched 2026-04-02, and any
Android build would start from a third snapshot.

**Target state:** a single shared-JSON source of truth under
`T-Mobile Toolkit/data/` that all three clients consume. This audit is the
pre-migration inventory — what shape is each side in today, which pairs are
easiest to merge, and which ones need a model redesign first.

---

## Audit access note — Drive read-deadlock

**All files under `/mnt/T-Mobile Sales Assistant/ios/.../Data/` and
`/mnt/.../Models/` returned `EDEADLK: Resource deadlock avoided` for the entire
duration of this audit run, across ~15 minutes of retries with exponential
backoff.** Other files in the same mount (e.g. `Views/Theme.swift`,
`Views/MainTabView.swift`) read fine, so the lock is scoped to the recently-
modified iOS data set, not the whole drive.

Because I could not see iOS file contents, this audit is a one-sided inventory:
full field-level detail on the web side, plus what can be inferred about iOS
from:

- Directory layout (`Data/*Data.swift` + `Models/*.swift` split)
- File sizes from `ls -l` (which were accessible)
- The ~99–103 byte `Models/*.swift` stubs, which indicate the model structs are
  tiny placeholder types (one or two stored properties at most) — this alone is
  strong evidence that iOS is running a **strict subset** of the web shape
- Relative `Data/*.swift` sizes, which sanity-check the record counts

The caller should re-run this audit once Drive releases the file locks (or do a
one-off `cp` outside the Claude session) to verify the iOS-side specifics
flagged below. Every "iOS (inferred)" cell in the tables below is marked
accordingly.

| iOS file | Size | Lock status |
|---|---|---|
| `AccessoriesData.swift` | 7,937 B | LOCKED |
| `CompetitorsData.swift` | 13,055 B | LOCKED |
| `DevicesData.swift` | 7,576 B | LOCKED |
| `DifferentiatorsData.swift` | 4,885 B | LOCKED |
| `HomeInternetData.swift` | 5,097 B | LOCKED |
| `PlansData.swift` | 6,904 B | LOCKED |
| `SalesMethodologyData.swift` | 6,160 B | LOCKED |
| `Models/*.swift` (7 files) | 93–103 B each | LOCKED |

---

## Summary table

| Concept | Web shape (verified) | iOS shape (inferred from size) | Records W / I (est.) | Drift | Clean-for-migration (1-5) |
|---|---|---|---|---|---|
| **Plans** | `Plan { name, tier, status, pricing[], features[], limitations?, eligibility?, notes? }` + `PlanPricing`, `SPECIALIZED_PLANS`, `RETIRED_PLANS`, `REG_FEES` | Thin `struct Plan` (~93 B stub) + ~7 KB flat data file | W=6 core + 6 prepaid + 4 retired + 4 specialized buckets; I≈5–6 core only | SUBSET | **5** |
| **Devices** | `Device { name, category, startingPrice, released, keySpecs, imageUrl?, sellingNotes? }` + `PHONES/TABLETS/WATCHES/HOTSPOTS` + `TRACKER_COMPARISON`, `ECOSYSTEM_HOOKS`, `CONNECTED_DEVICE_INFO`, `SAMSUNG_NOTE` | Thin `struct Device` (~95 B) + ~7.5 KB data | W=29 devices + 4 hotspots + 3 trackers + 2 ecosystem blocks; I≈20–25 devices | SUBSET | **4** |
| **HomeInternet** | `HomeInternetPlan { name, standalonePrice, withVoiceLine, typicalDownload, typicalUpload, gateway, features[], includedPerks[], bestFor }` + `OTHER_HOME_PRODUCTS`, `HINT_SELLING_FRAMEWORK` (4 openings, 6 objection handlers, 4 competitor comparisons, 4 promos), `FIBER_INFO`, `HINT_QUICK_FACTS` | Thin `struct HomeInternet` (~100 B) + ~5 KB data | W=3 HI plans + 4 fiber + 6 objections + 10 quick facts + 4 opening lines; I≈3 plans + promos only | DIVERGED (web is much larger) | **3** |
| **Competitors** | `Competitor { name, plans: CompetitorPlan[], vulnerabilities[], counterPoints[], fees?, salesPositioning? }` keyed `Record<string, Competitor>` | Thin `struct Competitor` (~99 B) + ~13 KB data (largest iOS data file) | W=11 competitors + ~34 plans total; I≈8–11 competitors | SUBSET (near-MATCH possible) | **4** |
| **Differentiators** | `Differentiator { category, headline, details[], competitorComparison? }` | Thin `struct Differentiator` (~103 B) + ~5 KB data | W=7 categories (Network, T-Satellite, Price Guarantee, International, Streaming, In-Flight, Perks); I≈5–7 | SUBSET | **5** |
| **Accessories** | Mixed — `ProtectionTier[]`, `PROTECTION_360_COVERAGE` string[], `P360_VS_APPLECARE` text block, `MAGSAFE_INFO`, `USB_C_NOTE`, `KEY_ACCESSORY_BRANDS`, `ESSENTIAL_BUNDLE_DEAL`, **plus a `buildAccessoryRecommendations(context)` function that emits a branching age×product recommendation tree with verified prices** | Thin `struct Accessory` (~99 B) + ~8 KB data | W=12+ recommendation categories × age brackets + 5 protection tiers + ~30 verified prices; I = flat catalog (presumably the non-function parts) | DIVERGED — web has logic, iOS has data only | **2** |
| **SalesMethodology** | 9 exported maps: `WELCOME_MESSAGES`, `ONE_LINERS`, `DISCOVERY_QUESTIONS`, `RAPPORT_BY_AGE`, `OBJECTION_TEMPLATES`, `PURCHASE_STEPS`, `CLOSING_TECHNIQUES`, `CPNI_REMINDERS`, `TRANSITIONS`, `SERVICE_TO_SALES`, `BTS_IOT_VALUE_PROPS` + 2 helper functions | ~6 KB (vs web 28 KB) — ~22% of web size | W=9 intents × 3–11 messages across ~10 dimensions; I≈subset of intents or shorter message lists | DIVERGED — size gap suggests iOS has ~4× less copy | **2** |

---

## Per-pair detail

### 1. Plans (`plans.ts` ↔ `PlansData.swift`)

**Web shape (verified, `src/data/plans.ts`):**
```ts
interface PlanPricing {
  lines: number;
  monthlyTotal: number;
  perLine: number;
  insider?: number;        // 20% Insider discount total
  insiderPerLine?: number;
  promoNote?: string;
}
interface Plan {
  name: string;
  tier: 'flagship' | 'mid' | 'family' | 'entry' | 'budget' | 'specialized';
  status: 'current' | 'retired' | 'legacy';
  pricing: PlanPricing[];
  features: string[];
  limitations?: string[];
  eligibility?: string[];
  notes?: string[];
}
```

**Records (web):**
- `POSTPAID_PLANS` = 5 current plans (Experience Beyond, Experience More, Better
  Value, Essentials, Essentials Saver)
- `SPECIALIZED_PLANS` = { senior, military, prepaid (6 tiers), business }
- `RETIRED_PLANS` = 4 legacy plans (Go5G, Go5G Plus, Go5G Next, Magenta)
- `REG_FEES` constant
- Pricing is modeled per line-count (1–12 lines) with Insider discount column

**iOS shape (inferred):**
Models/Plan.swift is 93 bytes — enough for `struct Plan: Codable { let name:
String; let price: String }` or similar. `PlansData.swift` is 6.9 KB (vs web's
9.8 KB). The thin Model size strongly implies iOS has **no per-line-count
pricing matrix, no Insider column, no retired plans, no specialized plans**. It
likely holds only the 5 current postpaid plans with a single display price.

**Drift type:** SUBSET (iOS ⊂ web)

**Fields web-only:** `tier`, `status`, `PlanPricing[]` matrix (Insider +
promoNote), `limitations[]`, `eligibility[]`, `notes[]`, entire
`SPECIALIZED_PLANS` and `RETIRED_PLANS` buckets, `REG_FEES`.

**Records web-only (probable):** All 6 prepaid tiers, all 4 retired plans, all 4
specialized plan buckets (senior/military/prepaid/business). If iOS only has
flagship/mid/family/entry/budget, it's missing the entire prepaid and legacy
surface.

**Cleanliness: 5/5** — Plans is the cleanest pair to migrate. Shape is rigid
(fixed line counts, fixed features list), naturally JSON-serializable, and the
web version is already the superset. Proposed shared JSON:
`T-Mobile Toolkit/data/plans.json` with a top-level schema like
`{ postpaid: Plan[], specialized: {...}, retired: Plan[], regFees: {...} }`.
iOS picks up everything it needs; Android starts from this.

---

### 2. Devices (`devices.ts` ↔ `DevicesData.swift`)

**Web shape (verified):**
```ts
interface Device {
  name: string;
  category: 'iphone' | 'samsung' | 'pixel' | 'other' | 'tablet' | 'watch' | 'hotspot';
  startingPrice: number | string;
  released: string;
  keySpecs: string;
  imageUrl?: string;
  sellingNotes?: string;
}
```

Plus four collections `PHONES` (19 entries), `TABLETS` (9), `WATCHES` (10),
`HOTSPOTS` (4) — **total 42 devices.** Wait — recount: phones 19, tablets 9,
watches 10, hotspots 4 = **42**. Plus exports `TRACKER_COMPARISON` (3 items),
`ECOSYSTEM_HOOKS` (apple + samsung), `CONNECTED_DEVICE_INFO`, `SAMSUNG_NOTE`.

**iOS shape (inferred):** `Device.swift` at 95 B → minimal struct (probably
`name, category, price, specs`). `DevicesData.swift` 7.6 KB vs web's 17 KB — iOS
has roughly 45% of the web content. Likely missing `sellingNotes` (which is
where the long talk-track copy lives), `imageUrl`, `TRACKER_COMPARISON`,
`ECOSYSTEM_HOOKS`, `CONNECTED_DEVICE_INFO`.

**Drift type:** SUBSET

**Fields web-only:** `sellingNotes` (huge — this is the commission-earning
copy), `imageUrl`, `withDeviceImage()` enrichment path that pulls from
`DEVICE_IMAGE_PATHS`. Plus the whole `TRACKER_COMPARISON`, `ECOSYSTEM_HOOKS`,
`CONNECTED_DEVICE_INFO` side-tables.

**Records web-only (probable):** Hard to say without reading iOS, but given the
7.6 KB file size, iOS almost certainly omits the Note 2 tier devices (Galaxy
XCover7 Pro, moto g 2026, REVVL 8, REVVL 8 Pro) and likely the niche Pixel
entries (Pixel 10a, Pixel 10 Pro Fold).

**Notable:** The comment at the top of web `devices.ts` says "promos are NOT
stored here — they come exclusively from weekly-update.json to prevent stale
promo data." This is already a migration signal — web has separated the
volatile promo layer from the specs layer. The shared JSON should keep that
separation.

**Cleanliness: 4/5** — Device struct is clean. The `category` enum is the same
concept on both sides. Main work is decomposing `sellingNotes` (currently one
long string) — it's fine to migrate as-is. Proposed JSON:
`T-Mobile Toolkit/data/devices.json` with `{ phones, tablets, watches, hotspots,
ecosystemHooks, trackerComparison, connectedDeviceInfo, samsungNote }`.

---

### 3. HomeInternet (`homeInternet.ts` ↔ `HomeInternetData.swift`)

**Web shape (verified):**
```ts
interface HomeInternetPlan {
  name: string; standalonePrice: number; withVoiceLine: number;
  typicalDownload: string; typicalUpload: string; gateway: string;
  features: string[]; includedPerks: string[]; bestFor: string;
}
```

Plus:
- `HOME_INTERNET_PLANS` — 3 plans (Rely, Amplified, All-In)
- `HOME_INTERNET_BUNDLE_DISCOUNT` — pricing note string
- `OTHER_HOME_PRODUCTS` — { away, backup, fiber, testDrive }
- `HINT_SELLING_FRAMEWORK` — **large nested object**: everyCallReminder,
  openingLines (4), objectionHandlers (6 {objection, response} pairs),
  vsCompetitors (4 competitors × bullet lists), currentPromos (4 keys)
- `FIBER_INFO` — { status, overview, plans (4), keyDifferences (5),
  whatToTellCustomers }
- `HINT_QUICK_FACTS` — 10-item string array

**iOS shape (inferred):** `HomeInternet.swift` at 100 B → minimal struct.
`HomeInternetData.swift` 5.1 KB vs web's 10.7 KB — iOS has ~47% of content.
Very likely missing the entire `HINT_SELLING_FRAMEWORK` objection/opening/
competitor scripts, which is the largest chunk. Likely has the 3 HI plans + a
few facts.

**Drift type:** DIVERGED — not a strict subset because `HINT_SELLING_FRAMEWORK`
is sales-playbook content that may live in iOS's `SalesMethodology` stub
instead, or be duplicated in the iOS Learn tab views.

**Cleanliness: 3/5** — The `HomeInternetPlan` struct is migrate-ready. But the
playbook material (objections, openings, competitor comparisons) is actually
SalesMethodology-adjacent and may have been split differently on iOS. Before
migrating, decide: does the sales-script copy live in `homeInternet.json` or
`salesMethodology.json`? Recommendation: keep it in a `homeInternet.json` with
a `playbook` sub-object, because the copy is domain-specific.

Proposed JSON: `T-Mobile Toolkit/data/homeInternet.json`.

---

### 4. Competitors (`competitors.ts` ↔ `CompetitorsData.swift`)

**Web shape (verified):**
```ts
interface CompetitorPlan {
  name: string; singleLine: string; fourLinePer?: string;
  priorityData: string; hotspot: string; streamingPerks: string; notes?: string;
}
interface Competitor {
  name: string; plans: CompetitorPlan[]; vulnerabilities: string[];
  counterPoints: string[]; fees?: string[]; salesPositioning?: string;
}
```

Exported as `Record<string, Competitor>` keyed by informal name.

**Records (web):** 11 competitors — AT&T, Verizon, Xfinity, US Cellular,
Spectrum, "Prepaid (Mint, Boost, etc.)" (aggregator stub), Cricket, Metro,
Visible, Boost, Mint. ~34 plan rows total.

**iOS shape (inferred):** `Competitor.swift` 99 B → minimal struct.
`CompetitorsData.swift` 13 KB (this is actually **close to the web's 14 KB**
— the smallest size gap of any pair). Suggests the iOS competitors file is the
best-maintained iOS data set and may be an actual **near-MATCH**.

**Drift type:** SUBSET-trending-MATCH (best guess)

**Cleanliness: 4/5** — Near-MATCH shape. Good candidate for migration #2 after
Plans. The 99-byte Model struct is a concern — if iOS dropped `vulnerabilities`
or `counterPoints` down to a single string, that has to unify. Once the shape
is confirmed, `T-Mobile Toolkit/data/competitors.json` is a drop-in.

---

### 5. Differentiators (`differentiators.ts` ↔ `DifferentiatorsData.swift`)

**Web shape (verified):**
```ts
interface Differentiator {
  category: string; headline: string;
  details: string[]; competitorComparison?: string;
}
```

**Records (web):** 7 — Network, T-Satellite, Price Guarantee, International,
Streaming, In-Flight Wi-Fi, Perks.

**iOS shape (inferred):** `Differentiator.swift` 103 B → small struct.
`DifferentiatorsData.swift` 4.9 KB vs web's 6.1 KB — **very close**. iOS almost
certainly has all 7 categories, possibly with shorter `details[]` arrays.

**Drift type:** SUBSET (near-MATCH)

**Cleanliness: 5/5** — Tied with Plans as the cleanest migration. Simple flat
array of objects, no functions, no cross-references. Proposed JSON:
`T-Mobile Toolkit/data/differentiators.json`.

---

### 6. Accessories (`accessories.ts` ↔ `AccessoriesData.swift`)

**Web shape (verified):** This is the odd one out. `accessories.ts` is
**primarily a function**, not a data export:

```ts
export function buildAccessoryRecommendations(
  context: SalesContext
): AccessoryRecommendation[]
```

It branches on `context.product`, `context.age`, and `context.purchaseIntent`
to emit different recommendation sets (Phone accessories, Tablet accessories,
Watch accessories, Protection 360 push, SyncUP Tracker, SyncUP DRIVE). Inside,
each recommendation has age-specific `why` copy (18–24 / 25–34 / 35–54 / 55+
variants) and a `verifiedPrices[]` array with ~30 real SKUs.

The **static data** exports from this file are just: `PROTECTION_360_TIERS` (5
tiers), `PROTECTION_360_COVERAGE` (12 bullets), `P360_VS_APPLECARE` (long
string), `BASIC_DEVICE_PROTECTION` (string), `MAGSAFE_INFO` (2 fields),
`USB_C_NOTE` (string), `KEY_ACCESSORY_BRANDS` (5 brand lists),
`ESSENTIAL_BUNDLE_DEAL` (3 fields).

**iOS shape (inferred):** `Accessory.swift` 99 B + `AccessoriesData.swift` 8 KB.
Swift cannot trivially port a 380-line recommendation-builder function to a flat
struct. iOS almost certainly has a **static accessory catalog** (the protection
tiers, the MagSafe info, the brand lists, maybe a flat list of SKUs with
price/category) — **not** the age-branching recommendation logic. So iOS is
displaying a static catalog where web emits dynamic recommendations.

**Drift type:** DIVERGED — different computation model, not just fewer fields.

**Cleanliness: 2/5** — This pair needs a model redesign before JSON extraction.
Options:

1. **Migrate only the static data** (tiers, brand lists, P360 info) to shared
   JSON; keep `buildAccessoryRecommendations()` in web code as a platform
   function that consumes shared JSON plus local context. Android/iOS re-
   implement the function natively.
2. **Move recommendation logic to a rules engine** in shared JSON (age × product
   → recommendation-ids) and have each platform resolve IDs. This is a bigger
   lift but unifies behavior.

**Recommendation:** Do option 1 first. The static data alone
(`accessoriesCatalog.json`, `protectionTiers.json`) is valuable and safe to
extract. Postpone the recommendation-logic unification until after the other
6 pairs are migrated.

Note: The wider web repo also has `accessoryCatalog.ts`, `accessoryPitches.ts`,
`essentialAccessories.ts` — these are likely closer to the shape iOS is using.
Worth consolidating the web side first (4 overlapping files → 1) before
exporting to JSON.

---

### 7. SalesMethodology (`salesMethodology.ts` ↔ `SalesMethodologyData.swift`)

**Web shape (verified):** Not a single interface — it's a module of nine
`Record<string, ...>` dictionaries keyed by sales intent, age bracket, product,
or objection type. Size: 28 KB, 447 lines.

Exported surfaces:
- `WELCOME_MESSAGES` — Record<intent, string[]> (6 intents × 3 messages = 18)
- `ONE_LINERS` — Record<intent, string[]> (18 messages)
- `DISCOVERY_QUESTIONS` — Record<product, string[]> (5 products × 6–11 qs)
- `RAPPORT_BY_AGE` — Record<age, { tone, topics[], avoid[] }> (5 brackets)
- `OBJECTION_TEMPLATES` — Record<objection, { rebuttal, talkingPoints[] }>
  (9 objections)
- `PURCHASE_STEPS` — Record<product, string[]> (5 products × 6–8 steps)
- `CLOSING_TECHNIQUES` — Record<intent, string[]> (6 intents × 2–3 each)
- `CPNI_REMINDERS` — 6-item string array
- `TRANSITIONS` — 3 keys × 3 phrases each
- `SERVICE_TO_SALES` — Record<intent, { timing, pivots[] }> (3 intents)
- `BTS_IOT_VALUE_PROPS` — { watches, tablets, trackers, hotspot, commissionTip }
- 2 helper functions (`getRapportTips`, `getServiceToSalesPivots`)

**iOS shape (inferred):** `SalesMethodologyData.swift` is 6.1 KB — **~22% of
web's 28 KB**. iOS is running a drastically slimmed version. Probably has 1–2
of these dictionaries (most likely `RAPPORT_BY_AGE` and possibly
`OBJECTION_TEMPLATES` or `DISCOVERY_QUESTIONS`) but not all 9.

**Drift type:** DIVERGED — significant content gap, and the two sides may
structure it differently (Swift nested enums vs. TS Record maps).

**Cleanliness: 2/5** — Needs decomposition before JSON extraction. Each of the
nine dictionaries above should probably become its **own** JSON file
(`welcomeMessages.json`, `oneLiners.json`, `objections.json`, etc.) so
platforms can load only what they need and so the files are mergeable per-
topic. The current monolithic `salesMethodology.ts` is already a refactor
candidate even before cross-platform work.

---

## Cross-cutting observations

1. **iOS lag.** All iOS Data files last modified 2026-04-02 or 2026-04-03
   (from `ls -l`). Web files range from 2026-04-08 through 2026-04-17. iOS is
   carrying a snapshot that is 2–3 weeks stale across the board, which is
   exactly the drift hazard the migration is meant to solve.

2. **Weekly promo split already exists on web.** `devices.ts` comment: "promos
   are NOT stored here — they come exclusively from weekly-update.json". That's
   a design pattern worth preserving in the shared JSON layout — a
   `data/static/` folder for stable specs and a `data/weekly/` folder for
   promos/credits, each platform fetching both.

3. **iOS Models dir is structurally suspect.** Every `Models/*.swift` file
   (Accessory, Competitor, Device, Differentiator, HomeInternet, Plan) weighs
   93–103 bytes. That's barely enough for
   `struct Foo: Codable { let id: String }` — these are almost certainly
   placeholder types generated from the data files, not first-class domain
   models. A migration to shared JSON would replace these stubs with real
   `Codable` structs deserialized from `Toolkit/data/*.json`.

4. **Web has richer multi-file relationships.** The web `src/data/` directory
   has 24+ `.ts` files — `accessoryCatalog.ts`, `offerPlaybooks.ts`,
   `objectionPlaybook.ts`, `affirmations.ts`, `recommendationRules.ts`, and
   more — that the iOS side appears to not mirror at all. Those are out of the
   7-pair scope but they're future migration candidates too.

---

## Migration roadmap

### Order of migration (easiest → hardest)

| # | Pair | Cleanliness | Rationale |
|---|---|---|---|
| 1 | **Plans** | 5/5 | Rigid schema, business-critical, iOS is a known subset |
| 2 | **Differentiators** | 5/5 | Tiny, flat, near-MATCH, low risk |
| 3 | **Competitors** | 4/5 | Near-MATCH size (biggest iOS data file), high-value for sales battlecards |
| 4 | **Devices** | 4/5 | Clean Device struct; `sellingNotes` is a single long string that ports cleanly |
| 5 | **HomeInternet** | 3/5 | Plans port easily; the playbook sub-object needs a home (decide: here or in salesMethodology?) |
| 6 | **Accessories** | 2/5 | Static data can migrate; recommendation function stays in platform code for now |
| 7 | **SalesMethodology** | 2/5 | Decompose the 9 Record maps into per-topic JSON files before extracting |

### Cheapest first move

**Plans.** 5/5 cleanliness + business-critical + iOS is a clean subset + web is
already the superset. Single shared file `T-Mobile Toolkit/data/plans.json`
replaces ~17 KB of duplicate code on web + iOS + future Android. This is the
proof-of-concept migration that validates the shared-JSON pattern.

Structure proposal:
```
T-Mobile Toolkit/data/plans.json
├─ postpaid: Plan[]           (Experience Beyond, More, Better Value, Essentials, Essentials Saver)
├─ specialized: { senior, military, prepaid[], business }
├─ retired: Plan[]
└─ regFees: { voiceLine, miLine, note }
```

### Proposed shared JSON filenames

```
T-Mobile Toolkit/data/
├─ plans.json               # migration #1
├─ differentiators.json     # migration #2
├─ competitors.json         # migration #3
├─ devices.json             # migration #4 — includes trackerComparison, ecosystemHooks
├─ homeInternet.json        # migration #5 — includes HINT_SELLING_FRAMEWORK and FIBER_INFO
├─ accessories/             # migration #6 — static data only
│  ├─ protectionTiers.json
│  ├─ brands.json
│  ├─ p360Info.json
│  └─ magSafeInfo.json
└─ salesMethodology/        # migration #7 — decomposed
   ├─ welcomeMessages.json
   ├─ oneLiners.json
   ├─ discoveryQuestions.json
   ├─ rapportByAge.json
   ├─ objectionTemplates.json
   ├─ purchaseSteps.json
   ├─ closingTechniques.json
   ├─ serviceToSales.json
   ├─ btsIotValueProps.json
   └─ cpniReminders.json
```

### Pairs that need model redesign first (1–2 rated)

1. **Accessories (2/5).** The web `buildAccessoryRecommendations()` function
   doesn't serialize to JSON. Choices: (a) migrate only static data, keep the
   recommendation function as platform code, or (b) design a rules-engine
   schema and port the branching to data. Recommend (a) now, (b) later.

2. **SalesMethodology (2/5).** The 28 KB TS file is too monolithic to migrate
   as-is. Decompose into ~10 per-topic JSON files so the migration is
   incremental and platforms can consume only the parts they use.

### Leave in platform code — do not migrate to shared JSON

- **`buildAccessoryRecommendations()` function body.** Platform-specific
  recommendation logic; consume shared JSON plus local `SalesContext`, emit
  platform-appropriate UI.
- **`withDeviceImage()` enrichment** in `devices.ts`. This joins a device record
  with a local asset path (`DEVICE_IMAGE_PATHS`) — image paths are per-platform
  and cannot go to shared JSON. Keep the enrichment function at the platform
  boundary.
- **`imageUrl` field on Device.** iOS will use an asset catalog key, web uses a
  URL path, Android would use `R.drawable.*`. The shared JSON should carry a
  stable image identifier (e.g. `imageId: "iphone-17-pro-max"`), and each
  platform resolves that to its own image.
- **Helper functions in `salesMethodology.ts`** (`getRapportTips`,
  `getServiceToSalesPivots`). These are trivial lookups — reimplement per
  platform against the shared JSON.
- **UI copy that bundles state-specific behavior.** If any field's value
  implies a UI action (button label, modal trigger), that coupling stays in
  platform code.

---

## Suspicious / stale-snapshot flags

1. **iOS Data/ files all dated 2026-04-02 / 2026-04-03.** Web files are
   actively maintained — 6 of 7 web files have been touched in April 2026.
   Gap: iOS was not touched after the accessories/devices/competitors refresh
   on the web side. This suggests iOS is running a ~2-week-old snapshot.

2. **iOS `AccessoriesData.swift` at 8 KB cannot fit the web
   `buildAccessoryRecommendations()` logic.** It almost certainly replaced the
   function with a flat catalog — so iOS users see a catalog without
   age-specific recommendations. This is a feature gap, not just drift.

3. **iOS `SalesMethodologyData.swift` at 6 KB holds ≈22% of web's content.**
   The sales playbook is drastically thinner on iOS. If the iOS Learn tab
   pulls from this file, reps using the iOS app are missing ~4× the objection
   handling, closing techniques, and service-to-sales pivots available on web.

4. **Model stubs at ~100 bytes.** Any iOS view consuming `Plan`,
   `Accessory`, `Device` etc. is locked to a 1–2 field view model, which
   constrains what the iOS UI can display regardless of what the data file
   contains. The migration to shared JSON should be paired with richer
   `Codable` structs on iOS.

5. **Drive read-deadlock prevented iOS verification.** Every assertion above
   about the iOS side is inference. Re-run this audit once the locks release
   and replace the "inferred" columns with actual reads.
