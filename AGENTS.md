# AGENTS.md — T-Mobile CustomerConnect AI (customerconnect-ai)

_This file is the canonical instruction set for AI tools working in this repo.
Claude Code, Claude Cowork, Claude Desktop, Codex, Cursor, Gemini CLI, and any
other coding agent should READ THIS FIRST before modifying files. If you are
Claude Code, note that `CLAUDE.md` in this repo defers to this file._

**Last updated:** 2026-04-30
**Maintained by:** B (certorian@gmail.com)

---

## 1. What this repo is

This is the live T-Mobile CustomerConnect AI sales assistant — a React/TypeScript
PWA that helps virtual retail reps during calls. This folder (`customerconnect-ai/`)
is the **singular canonical master** for the web app code. There are no other
active forks or working copies.

GitHub: https://github.com/distractedhare/customerconnect-ai

### Hard rule: one repo, one master

Do not create another fork, copy, or "-v2" folder. Do not nest a second copy of
this codebase inside `T-Mobile Sales Assistant/`. If you need to experiment, use
a git branch — not a new folder.

> **Note on `improved-robot/`:** A sibling folder named `improved-robot/` exists
> on the Desktop but has been retired (it contains a `RETIRED.md`). Do not edit
> it, import from it, or treat it as current. It is staged for deletion.

### PERSONAL CONTENT ISOLATION RULE

**AI tools working in this repo MUST NOT:**
- Load, reference, or surface content from `T-Mobile Personal/`
- Include personal career, status, performance, or employment information in any
  component, service, data file, API response, or user-facing feature
- Use personal context to influence app behavior, copy, or data

This is a sales tool for external use. Personal owner info stays completely out.

### Shared canon — the full T-Mobile workspace

```
~/Desktop/
├── customerconnect-ai/        ← YOU ARE HERE — the web app (canonical)
├── T-Mobile Sales Assistant/  ← native apps + docs + sales materials
│   ├── ios/                   ← SwiftUI companion app
│   ├── android/               ← Android app (scaffold)
│   ├── docs/                  ← project documentation
│   └── sales-materials/       ← decks, flyers, HINT guides, sales assets
└── _TO-DELETE/                ← staging area for retired folders (do not reference)

~/Documents/Claude/Projects/
├── T-Mobile Toolkit/          ← long-term knowledge base (reference only)
│   ├── philosophy/            ← Magenta Pulse design philosophy
│   ├── presentations/         ← pitch decks, flyers
│   ├── sales-reference/       ← HINT quick-picks, playbook, value summaries
│   ├── promo-assets/          ← QR cards, promo graphics
│   ├── design-system/         ← UI design system (uniform across all apps)
│   ├── gemini-handoff/        ← Gemini AI Studio reference exports
│   ├── scraper/               ← T-Mobile data pipeline (promotions, plans, devices)
│   └── archive/               ← old handoff prompts, deprecated specs
└── T-Mobile Personal/         ← owner personal info (career, status, notes)
    ╔══════════════════════════════════════════════════════╗
    ║  ISOLATION: Never reference from this app folder.    ║
    ║  Personal context only. Not for sales tools or app.  ║
    ╚══════════════════════════════════════════════════════╝

For the complete ecosystem map, see:
~/Documents/Claude/Projects/T-Mobile Toolkit/T-MOBILE-ECOSYSTEM.md
```

---

## 2. Tech stack

- React 19 + TypeScript
- Vite (build), Vercel (deploy)
- Tailwind CSS, motion/react, lucide-react icons
- Offline-first PWA (service worker, local generation)
- AI enhancement via optional remote calls, with local fallbacks

---

## 3. Folder layout inside this repo

```
customerconnect-ai/
├── src/
│   ├── App.tsx                ← top-level shell, lazy-loads feature panels
│   ├── components/            ← UI components (one per file, PascalCase)
│   │   ├── learn/             ← the "Learn" tab subtree
│   │   └── levelup/           ← gamification (leaderboard, bingo, quiz)
│   ├── services/              ← side-effecting logic (AI calls, storage, tracking)
│   ├── data/                  ← static data (devices, accessories, playbooks)
│   ├── constants/             ← enums, static config
│   ├── types/                 ← shared TypeScript types
│   ├── hooks/                 ← React hooks
│   └── utils/                 ← pure helpers
├── app/                       ← Next.js App Router directory (legitimate; do not delete)
├── api/                       ← Vercel serverless functions
├── public/                    ← static assets served as-is
├── scripts/                   ← dev/build utilities
├── .salvage-from-pwa/         ← rescued files from the retired pwa fork (see that folder's README)
├── .firecrawl/                ← STALE: web-scrape data was migrated to T-Mobile Toolkit/archive/firecrawl-tmobile-scrapes-20260408/ on 2026-04-19; Drive sync locked the source so the duplicate folder lingers. Do not import from. Read CANONICAL-MOVED.md inside.
├── .claude/                   ← Claude Code local config (skills, settings)
└── dist/                      ← Vite build output (gitignored)
```

### Where new things go

| New thing | Goes in |
|---|---|
| UI component | `src/components/` (or `src/components/learn/` / `levelup/` if it fits the subtree) |
| State/AI/storage logic | `src/services/` |
| Static lookup data | `src/data/` |
| Shared type | `src/types/` (or co-located if only one file uses it) |
| Scratch prompts / handoff docs | `T-Mobile Toolkit/archive/` — NOT this repo |
| Sales references / HINT PDFs | `T-Mobile Toolkit/sales-reference/` — NOT this repo |

---

## 4. House rules for AI tools

1. **Follow the design system.** The Magenta Pulse design system lives at
   `../T-Mobile Toolkit/design-system/`. Colors, typography, spacing, component
   behavior should come from there. When in doubt, read that folder before
   designing anything new.

2. **No root-level scratch files.** Don't drop `HANDOFF.md`, `PLAN.md`, `NOTES.md`
   at the repo root. Either commit the actual work or put scratch docs in
   `T-Mobile Toolkit/archive/` with a dated filename.

3. **Don't create parallel `-v2` files.** No `App-v2.tsx`, no `data 2.ts`. Edit in
   place; git is your history. Finder/Dropbox-style " 2.ts" files should be
   deleted on sight.

4. **Don't create new top-level folders without a reason.** If you think you need
   one, update this AGENTS.md first, then create the folder.

5. **`.deprecated/` is the local trash bin.** Don't reference, import from, or
   act on anything inside `.deprecated/` in any of the three workspace folders.

6. **When you finish a task, clean up after yourself.** Scratch files, test
   outputs, `.DS_Store`, `.playwright-cli/`, and similar artifacts should either
   be committed intentionally, gitignored, or moved to `.deprecated/`.

7. **Don't commit to main without asking.** B wants to review commits before push.

8. **Use relevant tools automatically.** Do not ask permission to inspect files,
   search the repo, read docs, check branches/commits, run tests, or validate
   the app. Ask only before destructive actions, deployments, merges, major
   architecture pivots, or when access is blocked.

9. **If you break one of these rules or spot drift, update AGENTS.md before
   fixing the drift.** Rules that aren't written down don't count.

---

## 5. Things AI tools have tripped over before

- **The improved-robot / customerconnect-ai split.** There used to be two app folders
  on the Desktop with similar code. `improved-robot/` is retired. This folder
  (`customerconnect-ai/`) is the only one that matters. If you see `improved-robot/`
  referenced anywhere, that reference is stale — update it.

- **GitHub remote:** This repo's only remote is `origin → customerconnect-ai.git`.
  Do not add a second remote.

- **GitHub branch pollution.** If you create a branch, use a meaningful name and
  delete after merge. Avoid accumulating `claude/*` branches.

- **Duplicate `2.ts` files.** Google Drive / Finder sometimes creates filename
  duplicates with " 2.ts" suffix. These are not real files — delete on sight.

- **Google Drive sync deadlocks.** This folder is synced via Drive. If `rm` fails
  with "Operation not permitted", use `mv` to `.deprecated/` instead.

- **Personal content.** Never pull from `T-Mobile Personal/`. If you're unsure
  whether something is personal, err on the side of leaving it out.

---

## 6. Salvaged files

See `.salvage-from-pwa/README.md`. Three components (`SupportPanel.tsx`,
`TransferBailout.tsx`, `LearnTagGroup.tsx`) from the retired pwa fork are
preserved there. They may or may not fit this repo's current architecture —
review before porting in.

---

## 7. Subagents

This project ships a roster of Claude Code subagents in `.claude/agents/`.
Five are fully-fleshed personas (`librarian`, `qa-engineer`, `sales-trainer`,
`kip-systems-designer`, `product-engineer`) and five are stubs awaiting
demand-driven promotion (`ux-designer`, `data-analyst`, `product-manager`,
`visual-designer`, `devops`). The librarian handles cross-session memory and
is authorized to promote stubs to full agents per the criteria in
`.claude/agents/README.md` — that README is the canonical roster, when-to-
invoke guide, and promotion-rules document. Read it before adding or
modifying any agent.

These agent files are development-only coordination helpers. They must never be
imported, bundled, exposed in the UI, exported in knowledge data, or treated as
app personas. Personal helper agents such as Evy stay outside this app repo.
KIP is the only approved app-facing assistant persona unless B explicitly
approves another sales-app persona.
