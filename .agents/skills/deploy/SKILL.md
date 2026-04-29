---
description: Deploy to main with conflict prevention and build verification
user_invocable: true
---

# Deploy Skill

Follow these steps to deploy the current work to main:

1. **Sync with main** — run `git fetch origin main` then `git rebase origin/main` on the current branch. If conflicts arise, resolve them by understanding both sides semantically, not just line-level diffs.
2. **Run the build** — `npx vite build`. If the build fails, fix the errors before proceeding.
3. **Run TypeScript check** — `npx tsc --noEmit`. Fix any type errors (ignore the pre-existing psychologyRefLoader warning).
4. **Merge to main** — if on a feature branch, checkout main and merge. If already on main, skip this step.
5. **Push** — `git push -u origin main`. If push fails due to network, retry up to 4 times with exponential backoff.
6. **Verify** — confirm the push succeeded and report the latest commit hash to the user.

If any step fails, stop and report the issue rather than forcing through.
