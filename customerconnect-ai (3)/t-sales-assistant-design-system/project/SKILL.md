---
name: t-sales-assistant-design
description: Use this skill to generate well-branded interfaces and assets for T-Sales Assistant (CustomerConnect AI — T-Mobile virtual retail rep coaching PWA), either for production or throwaway prototypes/mocks/decks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

The system is grounded in:

- **T-Mobile magenta `#E20074`** as the only chromatic accent (deep-berry `#861B54` for gradient stops + text-pitch).
- **Poppins** (Google Fonts, weights 400/500/700/800/900) — 900 is the hero weight.
- **Apple-style Liquid Glass** cards: `rgba(255,255,255,0.36)` with `blur(24px)` and a 0.5px inset specular highlight.
- **Dense, uppercase, 0.2em-tracked micro-labels** as the signature typographic tell.
- **Lucide icons** (stroke-based, 2px stroke, 12–20px).
- **Coaching voice** — direct, second-person, contractions, verbs leading, frameworks invisible, talk-tracks quoted and conversational.

Always-on product reminders you must surface when coaching-related: HINT address check, P360 protection, T-Life digital orders, 120-day clawback window.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and create static HTML files for the user to view. Link Poppins from Google Fonts and Lucide from `https://unpkg.com/lucide@latest/dist/umd/lucide.js`. Import tokens from `colors_and_type.css`. Use the UI kit at `ui_kits/customer-connect/` as your component starting point — copy components out, don't rebuild.

If working on production code, read the source in `distractedhare/improved-robot` on GitHub for exact component implementations. The design tokens in `colors_and_type.css` mirror `src/index.css` in that repo.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (target audience — rep-facing? leadership-facing? which surface — home / game plan / objections / learn / level-up? / mobile-first or desktop? dark mode needed?), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
