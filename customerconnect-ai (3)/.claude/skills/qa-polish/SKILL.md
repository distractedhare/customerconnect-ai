---
description: QA polish pass for executive-presentation quality
user_invocable: true
---

# QA Polish Skill

Run a systematic quality review of the app for presentation readiness:

## Visual Review
1. Read `CLAUDE.md` for style conventions before making any changes.
2. Check all glass/shine/specular effects — they must be **subtle and professional**, not flashy (except HomeScreen which should feel energetic and premium).
3. Verify no `saturate()` in backdrop-filter (violates Apple Liquid Glass guidelines).
4. Check glass opacity ranges: light mode 0.28-0.38, dark mode 0.10-0.14.
5. Verify blur values are 20-28px range.

## Code Quality
6. Run `npx tsc --noEmit` — fix any TypeScript errors.
7. Run `npx vite build` — confirm clean build with no errors.
8. Check for hardcoded colors that should use CSS variables.
9. Check for inline styles that should use Tailwind classes.
10. Look for console.log/debugger statements that shouldn't ship.

## Consistency
11. Verify all components use the glass-card utility classes consistently.
12. Check mobile responsiveness — no fixed widths that would break on small screens.
13. Verify dark mode works (all colors use CSS variables, no hardcoded whites/blacks).

## Final Check
14. Would this look professional in a leadership demo? If anything feels off, flag it.

Report a summary of findings and fix any issues found.
