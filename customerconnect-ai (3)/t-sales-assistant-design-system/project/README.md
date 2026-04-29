# T-Sales Assistant Design System

_CustomerConnect AI — offline-first coaching for T-Mobile virtual retail reps._

This design system describes the visual + content language of **T-Sales Assistant** (internal codename: CustomerConnect AI), a Progressive Web App that sits on a rep's screen during live phone calls and coaches them in real time — building instant plays, flipping objections, and surfacing accessory strategy based on customer intent (Exploring, Upgrade/Add a Line, Ready to Buy, HINT, Support).

## What this system is for

Use it to design or build:

- New screens / flows inside the PWA (home, call flows, playbooks, learn modules, level-up games).
- Coaching surface UIs for the same audience (virtual retail reps).
- Decks, mocks, and prototypes that need to feel native to the CustomerConnect AI product.
- Internal comms material that borrows the app's visual voice.

It is **not** a general T-Mobile brand guide — it's a coaching-app-specific system that uses T-Mobile magenta but has its own glass + dense-UI DNA.

## Sources

| Source | Path | Notes |
|---|---|---|
| Codebase | `distractedhare/improved-robot` (branch: `main`) | Vite + React 19 + TypeScript + Tailwind v4. Read on-demand via GitHub. |
| Brand color | `src/index.css` | Canonical token file. All colors / glass / shadow values here are lifted from that file. |
| Logo / icons | `public/` → imported to `assets/` | T-Mobile magenta square with white "T" (`tmo-logo.svg`), brand logos for Apple / Google / Samsung / Motorola. |
| Iconography | `lucide-react@^0.546.0` (via CDN) | The codebase imports from `lucide-react`; we link `unpkg.com/lucide-static` in mocks. |
| Font | Google Fonts — **Poppins** (300/400/500/700/800/900) | Loaded from Google Fonts in the live app and in `colors_and_type.css`. No font substitution needed. |

---

## Index

| File / folder | What's in it |
|---|---|
| `README.md` | This file — system overview, content + visual foundations, iconography. |
| `colors_and_type.css` | Full CSS custom-property token set (colors, glass, semantic, type scale, radii). Light + dark. |
| `SKILL.md` | Agent-skill manifest so this folder can be dropped into Claude Code. |
| `assets/` | Logos (T-Mobile, Apple, Google, Samsung, Motorola), PWA icons, product-card fallback. |
| `preview/` | Design system preview cards (palette, type, glass, components). Rendered in the Design System tab. |
| `ui_kits/customer-connect/` | React UI kit — Header, HomeScreen, GamePlanCards, InstantPlays, CustomerContextForm. `index.html` is a clickable replica of the app shell. |

---

## CONTENT FUNDAMENTALS

Voice is **direct, supportive, coaching-style** — "experienced teammate whispering in your ear during a hard call." Every piece of copy is written to be glanceable in 2–3 seconds _while the rep is on a live call_. Density is a feature, not a bug, but density is the _result_ of being ruthlessly concrete, not cramming words.

### Tone rules

- **Second person ("you"), never "we" or "the rep."** The copy talks _to_ the rep.
- **Contractions always.** "Don't pitch yet." "They're on the fence." Nothing stiff.
- **Verbs lead.** Section headers are commands: _Open Strong. Dig Deeper. Close It Out. Getting Pushback? Let's Flip It._
- **Frameworks stay invisible.** The psychology is Gottman / Voss / NVC under the hood; the output says "Ask one more question than you think you need to." Never "apply SFBT miracle question."
- **No corporate hedging.** "Nobody switches carriers for fun." "P360 isn't an accessory — it's a given."
- **Talk-tracks are quoted, first-person, and read out loud.** They open with a greeting, land on a concrete number or offer, and end with the next step. Example: _"Let me check your address real quick. If you're in a good spot, we can get you off that cable bill today."_

### Casing + punctuation

- **UPPERCASE + wide tracking** (`letter-spacing: 0.2em`) on micro-labels, section eyebrows, button text, tab labels. This is the single strongest typographic signal in the system.
- **Title Case** on card headings ("Your Game Plan", "Today's Hot").
- **Sentence case** on all body copy.
- **Em dashes** used freely — the voice is conversational and a little breathless.
- **Numbers with `$` and `/mo`**, not spelled out: `$5/mo`, `$400 in trade-in credit`, `$30-40/mo`. Money ranges use en-dashes.
- **Proper nouns are capitalized exactly as T-Mobile uses them**: T-Mobile, T-Life, Home Internet, HINT, P360, SyncUP (camel-case intentional), Experience Beyond, Magenta MAX, Month On Us, 5-Year Price Guarantee, Keep & Switch.

### Emoji + symbols

- **Emoji: sparingly, and only in HomeScreen greeting / role-selector contexts** where the role config carries one. Never in talk-tracks, never as bullets, never as decorative icons in cards (that's Lucide's job).
- **No unicode check-marks / arrows** as icon substitutes — always Lucide `<CheckCircle2>`, `<ChevronRight>`, `<ArrowRight>`.

### Signature rep-facing phrases (use these verbatim where relevant)

- "Perfect upgrade cycle" — the philosophy of using trade-in + plan moves to keep bills flat.
- "Keep & Switch over forced upgrades" — credit-sensitive guidance; don't push a financed phone on someone with fragile credit.
- "120-day clawback window" — the reason reps care about durability of the sale.
- "HINT address check" — the always-on reminder: check Home Internet availability early.
- "P360 isn't an accessory — it's a given."
- "T-Life digital orders."
- "Stack the Month On Us offer."

### Copy examples (taken straight from the app)

| Use | Example |
|---|---|
| Hero greeting | "Good afternoon 👋 — every call is a chance to change someone's bill _and_ your paycheck." |
| Eyebrow label | `TODAY'S HOT` / `QUICK PLAYS` / `OPEN STRONG` / `DIG DEEPER` / `CLOSE IT OUT` |
| Play title | "The 'What Brings You In' Open" |
| Play description | "Lower the pressure by acknowledging they might just be looking." |
| Talk-track (magenta, quoted) | "Hey! No pressure at all — are you just exploring what's out there today, or did something specific catch your eye?" |
| CTA button | `BUILD LIVE PLAN →` |
| Pushback CTA | `GETTING PUSHBACK? LET'S FLIP IT` |
| Coach banner | "Coach: Smile while you say this. Your energy sets the tone for the entire interaction." |
| Reminder banner | "Check the address for Home Internet first. Rebate and Month On Us value land best after availability is confirmed." |

---

## VISUAL FOUNDATIONS

The visual language is **"iOS 26 Liquid Glass over magenta ambient light."** Three ingredients define everything:

1. **Transparent glass cards** floating on a subtly magenta-tinted page.
2. **T-Mobile magenta** as the single accent color — never diluted with blues, teals, or purples.
3. **Dense, uppercase, tightly-tracked typography** that reads as "pro tool" rather than "consumer app."

### Color

- **Single brand hue.** `#E20074` magenta is the _only_ chromatic accent. Deep magenta `#861B54` ("T-Berry") is used for text-on-light (`--text-pitch`) and gradient stops. Everything else is neutral — whites, off-whites, graphite, near-black.
- **Semantic "info" is magenta, not blue.** Info surfaces use `rgba(226, 0, 116, 0.06)` with a magenta foreground. This is intentional — blue would pull focus from brand magenta.
- **Success green** (`#00A550`) is used sparingly, only for explicit confirmation states and daily prizes.
- **Error red** (`#D32F2F`) is muted and appears only for real errors.
- **Backgrounds are dark-first** — the canonical canvas is near-black (`#0D0D0D → #1A0912 → #0D0D0D`) with four saturated magenta/berry radial blobs baked into `--page-bg`. Light theme exists and inverts to an off-white substrate with softer magenta tints, but the system is designed and photographed dark. Pick the dark render when showing the system unless specifically asked for light.

### Type

- **Poppins only**, weights 400 / 500 / 700 / 800 / 900. 900 is the hero weight — used on H1s, talk-track titles, and CTA buttons. 700 is the "bold body" weight for card labels. 400–500 is reserved for running description text.
- **Signature pattern:** `9px–10px`, `font-black`, `uppercase`, `letter-spacing: 0.2em` for micro-eyebrows. This appears dozens of times per screen.
- **H1 is gradient-filled** — a magenta → berry → magenta diagonal. Nothing else in the product gets a text gradient.
- Line heights run _tight_ (`1.1–1.25`) on headings, normal (`1.4`) on body, relaxed (`1.6`) only on talk-tracks.

### Liquid Glass — the core material

Every card, button, pill, tab-bar and FAB in the system is rendered in **Liquid Glass** — a single three-variant material lifted from iOS 26. Do not invent new card backgrounds; pick a variant.

**Three variants:**

| Class | When | Recipe |
|---|---|---|
| `.glass` | Default — every content card, headers, ghost buttons, chips at rest | white 8% fill (dk) / 55% (lt) · `blur(32px) saturate(180%)` · specular top + ring + soft drop |
| `.glass-magenta` | HINT reminders, talk-track wells, active-state pills, anything that wants to feel "magenta-adjacent" without being a solid CTA | magenta 14% fill · same blur · magenta-tinted drop + inset |
| `.glass-elevated` | Tab bar, modals, sheets, floating toolbars | white 14% (dk) / 72% (lt) · `blur(40px) saturate(200%)` · 100%-white top specular · doubled drop |

**Three ingredients make it read as glass, not as a translucent panel:**

1. **Substrate.** The `--page-bg` gradient (4 magenta/berry radials + linear base) gives the blur something chromatic to refract. Glass on pure white or pure black looks dead — always render on `var(--page-bg)`.
2. **Backdrop.** `blur(32px) saturate(180%)` — the saturate is what stops the blur from going gray and muddy; it's what makes the glass look lit.
3. **Specular shadows.** A full layered `box-shadow` stack: an outer drop, a **bright inset top** (simulating light refracting off the curved lip), a **faint dark inset bottom** (defining the base edge), and two inset rings — white 1px then black 1.5px — as the "ferrule." These come bundled in `var(--glass-shadow)`, `--glass-shadow-magenta`, `--glass-shadow-elevated`.

**Non-negotiable rules:**

- **No `border` property on glass surfaces.** The edge is drawn entirely by the inset-ring part of `box-shadow`. Adding a border stacks a second hairline and destroys the specular effect.
- **Never set a flat `background: white` or `background: #161616` on anything that should read as glass.** If you need an opaque card, that's a design decision — and it means it's not part of the glass family. Almost nothing in this product should be opaque.
- **Tinted glass ≠ solid magenta.** If you want magenta presence, reach for `.glass-magenta` first. Solid `#E20074` is reserved for the _primary CTA button_ and the active-state fill on tabs/chips.
- **Stack sparingly.** Glass-on-glass is fine 1 level deep (e.g. a magenta-tinted pill inside a default-glass card). Beyond that the blurs compound and everything turns into a gray haze.

Spec previews: `preview/glass-card.html`, `preview/glass-backdrop.html`, `preview/specular-edges.html`, `preview/glass-tokens.html`.

### Corner radii

- `rounded-lg` / 8px — form inputs, small buttons.
- `rounded-xl` / 12px — compact cards, toggles, pills inside cards.
- `rounded-2xl` / 16px — **the standard card radius** (90% of cards).
- `rounded-3xl` / 20px — primary containers (CustomerContextForm shell, Next-Steps panel).
- `rounded-full` — pills, role toggles, CTA buttons, avatar circles.

### Shadows + elevation

The shadow system _is_ the glass system — elevation is controlled by which `--glass-shadow-*` token you use. There are four in total:

| Token | Drop | Inset top | Inset ring | When |
|---|---|---|---|---|
| `--glass-shadow` | 12·32 · .10 | `#fff 0.95` | `#fff 0.60` + `#000 0.04` | Default cards, ghost buttons, chips |
| `--glass-shadow-elevated` | 24·50 · .14 | `#fff 1.00` | `#fff 0.70` + `#000 0.04` | Tab bar, modals, sheets |
| `--glass-shadow-magenta` | 14·34 magenta .22 | `#fff 0.75` | `#fff 0.40` + magenta .10 | HINT, talk-track wells, active pills |
| `0 10–12·22–26 magenta .28` (inline) | strong magenta halo | `#fff 0.35` | `#000 0.08` (lower) | Primary CTA button only |

The only place magenta glows externally is the **primary CTA button**. Everything else either wears a neutral drop (`--glass-shadow`) or a tinted-but-restrained magenta drop (`--glass-shadow-magenta`).

**Rule of thumb:** if you're about to write a `box-shadow` by hand, stop. Use a token.

### Hover + press states

- **Hover:** bump `--glass-bg` alpha by ~50% (e.g. 0.08 → 0.12), add `translateY(-1px)`, transition `0.2s cubic-bezier(0.4, 0, 0.2, 1)`. No gradient sweeps, no shine.
- **Press:** `scale(0.97–0.98)` on buttons and chips, `scale(0.95)` on icon buttons. `transition: transform 0.1s ease`.
- **Focus ring:** 2px solid `#E20074`, 2px outset offset — drawn with `outline`, not `box-shadow`, so it doesn't fight the glass shadow stack.

### Borders

- **Glass surfaces have no `border`.** The edge is drawn by the inset-ring part of `--glass-shadow`. Adding a CSS border stacks a second hairline and breaks the specular illusion.
- **Selected chips + tabs have no border either** — they're filled solid magenta with a single `inset 0 1px 0 0 rgba(255,255,255,0.38)` highlight.
- The one place a true border still exists: dividers inside token tables and specs — `1px solid var(--glass-border-subtle)` on thin rules.

### Backgrounds, gradients, imagery

- **No full-bleed photography.** The app ships zero lifestyle photos.
- **No hand-drawn illustrations.** Nothing hand-drawn anywhere.
- **One hero gradient: the page substrate.** `--page-bg` is a stacked composition — four radial blobs (magenta + berry + darker plum + cool gray) layered over a linear near-black → plum-black base. Fixed to the viewport. Nothing else in the product uses gradients — they'd fight the substrate.
- **Magenta → berry → magenta diagonal** — used in _exactly one place_: the H1 gradient-fill text (`linear-gradient(135deg, #E20074 0%, #861B54 50%, #E20074 100%)`). No solid-fill gradient backgrounds on cards or banners — those are glass.
- **No animated orbs, no shimmer, no prismatic edges.** The old system had `.bg-orb`, `.glass-shine`, `.glass-prismatic`, `btn-magenta-shimmer` — all retired. The glass itself is the visual event; layering animation on top muddies it.
- **Hover sheen (only effect that survives):** a subtle 1–2% bump in `--glass-bg` alpha + a tiny `translateY(-1px)`, transitioning in 0.2s. No gradient sweeps.

### Motion

- Everything uses `framer-motion` with `y: 10–20, opacity: 0 → 1` entrances, staggered by `delay: 0.1 → 0.4`.
- Ease curves: `cubic-bezier(0.4, 0, 0.2, 1)` (material standard) for most, `spring(260, 20)` for card flips and tab indicators.
- Card flips (`WelcomeFlipCard`, `ValuePropFlipCard`) are 3D rotateY with `transform-style: preserve-3d`. Back faces are **near-black `bg-t-dark-gray`** with magenta text, so the flip reveals a contrasting surface.
- `prefers-reduced-motion`: all orbs stop, shimmer stops, all transitions collapse to 0.01ms. **Honored.**

### Transparency + blur

- Default glass blur is **`blur(32px) saturate(180%)`**. Elevated glass is **`blur(40px) saturate(200%)`**. Do not go lower than 24 or higher than 48 — the first looks like a cheap translucent panel; the second washes out the substrate.
- **Every glass surface is blurred.** Pills, chips, toggle backgrounds, talk-track wells — all use either `--glass-blur` or a reduced `blur(12–16px)` for smaller elements where the fuller 32px would over-soften the specular edge.
- Headers are default-glass capsules, not bars; the tab bar is elevated-glass (stronger material since it's the floating chrome).

### Density + layout rules

- **Max content width is `max-w-2xl` (672px) on HomeScreen, `max-w-5xl` (1024px) on the Header**. This is a _mobile-first_ product; large widths exist only for the nav shell.
- **Grids are 1-col on mobile, 2-col from `sm:` breakpoint.** The flip cards grid is always 2-col above mobile.
- **Horizontal padding:** `px-3 → px-4 → px-6` responsively.
- **Vertical rhythm:** section gaps are `space-y-4 → space-y-6` (16–24px). Within cards, `p-4 → p-5` (16–20px).
- **Fixed elements:** the Header is `sticky top-0 z-20` with safe-area-inset-top padding. The `bg-orb` layers are `position: fixed; z-index: 0` behind everything.

### Always-on reminders (UI pattern)

Four reminders appear globally on every play surface. They must always be present somewhere on the screen:

1. **HINT address check** — before any pitch lands, availability is confirmed.
2. **P360** — pitched as part of the device purchase, not an add-on.
3. **T-Life digital orders** — push customer to digital order flow to reduce drop-off.
4. **120-day clawback window** — flag any sale risk within this window.

Typically these ride in a `rounded-xl` magenta-gradient banner or inside the "Coach's Corner" footer on each screen.

---

## ICONOGRAPHY

- **Primary set: [Lucide](https://lucide.dev/) (`lucide-react@0.546.0`).** The codebase imports from `lucide-react` directly; preview HTML pulls icons from `https://unpkg.com/lucide@latest/dist/umd/lucide.js`. Icons are **stroke-based, 2px stroke, `w-3`/`w-4`/`w-5` (12/16/20px)**. Icons inside micro-labels are `w-3 h-3`, icons inside buttons are `w-4`, icons inside card headers are `w-5`.
- **Icon color defaults to `currentColor`.** Magenta-tinted icons use `text-t-magenta`, muted icons use `text-t-muted`. Icons never get their own fill color outside these two defaults.
- **Common icons in use:** `Zap` (quick plays, live), `Target` (discovery), `MessageSquare` (objections), `ShoppingBag` (accessories), `Shield` (P360, protection), `Sparkles` (AI/Sharper Read), `Wifi` / `Home` (HINT), `Trophy` (Level Up), `BookOpen` (Learn), `Flame` (Today's Hot), `Star` (highlights), `ChevronRight` / `ChevronDown` (disclosure), `Settings`, `User`, `Users`, `Monitor`, `Sun`, `Moon`, `UserPlus`, `RefreshCw`, `Play`, `CheckCircle2`, `ArrowRight`, `ArrowRightLeft`, `Calculator`, `CreditCard`, `Loader2`, `Headphones`, `Smartphone`, `MapPin`, `Tag`, `TrendingUp`.
- **Brand logos** live in `assets/brands/` as inline SVGs — Apple, Google, Samsung, Motorola, Third-Party, T-Mobile. These are the _device ecosystem_ logos (attached to device recommendations), not general third-party branding.
- **T-Mobile logo** is `assets/tmo-logo.svg` — a 52×52 magenta square with a white "T" glyph. Used as the app's home button in the top-left corner of the Header, and as the `apple-touch-icon`. Never recolor it, never scale it below 28px (legibility).
- **No emoji icons.** The only emoji that appears is the one embedded in a role-config greeting (e.g., "Good afternoon 👋"), and that's content, not UI chrome.
- **No custom-drawn SVG icons.** Any icon you need that Lucide doesn't cover, ask — don't draw a placeholder.

---

## Next steps for the reader

- Want the full token set? → `colors_and_type.css`.
- Want to see every component rendered? → `ui_kits/customer-connect/index.html`.
- Want to drop this skill into Claude Code? → `SKILL.md`.
- Want to preview the system cards? → open the **Design System** tab of this project.

---

## APPENDIX: T-Mobile.com vs. T-Sales Assistant

The **public t-mobile.com** site uses a related but distinct button/type vocabulary — captured 2026-04-18 from the Switch Deals page. If you're designing material that lives next to t-mobile.com (customer-facing comms, embed-in-web widgets), match that system instead of ours:

| Token | t-mobile.com | T-Sales Assistant |
|---|---|---|
| Primary button bg | `#A7005A` (T-Magenta pressed) | `#E20074` (T-Magenta) |
| Button radius | `4px` | `999px` (pill) |
| Button type | `system-ui 14/600`, Title Case | `Poppins 11/900`, UPPERCASE, `0.18em` tracking |
| Button padding | `8px 16px` | `14px 22px` |
| Display font | **TeleNeo** (corporate, prices only) | Poppins 900 |
| Body / UI font | `system-ui` | Poppins 400/500 |
| Card eyebrow | `MAGENTA STATUS` (uppercase) | `TODAY'S HOT` (uppercase) |
| Plan card | Black header `16px` top radius, white card, TeleNeo price | Liquid glass, full `16px` radius, Poppins price |
| Logo | `tmo-logo-v4.svg` (52×52, magenta square, white T) | same |

The **eyebrow + magenta square logo** are shared DNA. Everything else (buttons, radii, type family) diverges — the coaching app is denser, pill-heavier, and Poppins-led because it's a pro tool; the public web is softer, system-ui-led, and uses **TeleNeo** (T-Mobile's licensed corporate font) for prices and display. Preview cards: `preview/tmobile-web-vs-app.html`, `preview/tmobile-web-plan-card.html`.
