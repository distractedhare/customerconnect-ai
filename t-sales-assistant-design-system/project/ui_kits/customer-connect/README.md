# T-Sales Assistant UI Kit

React JSX components that recreate the CustomerConnect AI PWA shell. Use these as starting points for prototypes — copy components into your own page, don't rebuild.

## Components

- **Header.jsx** — app header with brand lockup + call context, plus bottom TabBar.
- **CustomerContextForm.jsx** — the intent/age/vibe chip picker that gates the game plan.
- **PlayCard.jsx** — PlayCard, HintBanner, CoachBanner, SectionHeader — the signature card primitives.
- **GamePlan.jsx** — the post-submit "Your Game Plan" view (Open / Dig / Close).
- **Objections.jsx** — the "Flip It" objection-handler list.

## Running it

Open `index.html` directly in a browser — it's a standalone Babel-transpiled React demo. The shell walks through: **Context → Live Game Plan → Flip / Learn / Level Up tabs**.

## Design fidelity

Based on `distractedhare/improved-robot` source: `src/components/CustomerContextForm.tsx`, `InstantPlays.tsx`, `HomeScreen.tsx`, `Header.tsx`. Visuals match the production Liquid Glass system — `rgba(255,255,255,0.36)` + `blur(24px)` + 0.5px specular inset, T-Mobile magenta `#E20074`, Poppins 900 for headlines.

## Tokens

All colors/type/shadow come from `../../colors_and_type.css`. Don't hardcode hex values — use the CSS variables.
