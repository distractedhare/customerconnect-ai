# Subagent roster · CustomerConnect AI

Single source of truth for the project's Claude Code subagents. Update this
file whenever an agent's status flips (stub ↔ active). The `librarian` is
authorized to edit this file as part of its `PROMOTE` workflow.

Each agent lives at `.claude/agents/<name>.md` with YAML frontmatter (`name`,
`description`, `tools`, `model`, `permissionMode`) plus a system prompt body.
Agents are physically gated by their `tools:` allowlist — that's the runtime
contract. The system prompt body is the behavioral contract.

## Active roster (5)

| Name | Job | Tools | Model | Invoke when |
|---|---|---|---|---|
| `librarian` | Cross-session memory: lessons ledger, session logs, recall, agent promotion. | Read, Edit, Write, Glob, Grep | haiku | User corrects an architectural/behavioral choice (CORRECTION); end of a substantive work block (END-OF-BLOCK); user asks "where did we leave off" (RECALL); orchestrator observes a demand pattern matching a stub (PROMOTE). |
| `qa-engineer` | Read-only diagnostician. Diagnose-don't-fix. | Read, Bash, Glob, Grep | sonnet | A bug resists two fix attempts; visual regression needs reproduction across viewports; behavioral edge case needs tracing; orchestrator wants a diagnose-only second opinion. |
| `sales-trainer` | T-Mobile floor-manager critic. Reads features through a rep's daily reality. | Read, Glob, Grep | sonnet | Need a "would a rep actually use this?" read on a feature, Kip line, Learn surface, Live Call flow, or gamification mechanic. |
| `kip-systems-designer` | Tunes Kip — voice, line bank, tone/mood enums, when-to-fire rules. | Read, Edit, Glob, Grep | sonnet | Adding/revising Kip lines for a new mood; expanding `KipTone`; rebalancing tone-per-surface; wiring Kip into a new surface. Edit scope: `src/services/kip/`, `src/components/kip/`, `src/types/kip.ts`. |
| `product-engineer` | Frontline implementer. Bounded feature work with a tight spec. | Read, Edit, Write, Bash, Glob, Grep | sonnet | Orchestrator has a precise spec (file paths + change + acceptance criteria) and wants focused execution that returns a working diff. |

## Stub roster (5)

These exist for auto-delegation discoverability and as targets for the
librarian's PROMOTE workflow. Each stub responds with "I'm a stub, what
specific outcome do you need?" and stops — they do not invent persona
behavior.

| Name | Intended job | Tools (when promoted) | Model | What would prompt promotion |
|---|---|---|---|---|
| `ux-designer` | Layout + flow critic; pre-build spec, no code. | Read, Glob, Grep, Bash | sonnet | Same role pattern requested ≥3 times across distinct sessions; user explicitly asks "promote ux-designer"; orchestrator hits recurring delegation that doesn't match an active agent. |
| `data-analyst` | Read telemetry / usage state, surface engagement patterns. | Read, Bash, Glob, Grep | haiku | App ships a usage-event pipeline (currently absent — this is the hard blocker); demand for behavior-pattern reads. |
| `product-manager` | Scope-creep referee, prioritization second opinion. | Read, Glob, Grep | sonnet | User explicitly wants a referee on a scope decision; recurring "is this in or out for launch" questions. |
| `visual-designer` | Visual-taste critic, polish-gap audit, brand-artist eye. | Read, Glob, Grep, Bash | sonnet | Recurring polish-pass requests; new brand assets need direction; surface-level visual mismatch with the Magenta Pulse design system. |
| `devops` | Build / deploy / headers / PWA / bundle-size review. | Read, Bash, Glob, Grep | sonnet | Major infra change requested; bundle-size or perf regression that needs structural diagnosis. |

## PROMOTION CRITERIA

The librarian uses these — verbatim — to decide whether to promote a stub to
an active agent:

1. **Demand frequency:** the same role pattern has been requested ≥3 times
   across distinct sessions (read `.claude/notes/sessions/` to verify), AND
   the orchestrator did not cover it cleanly itself, OR
2. **Explicit user request:** the user explicitly says "promote the X agent"
   or equivalent, OR
3. **Recurring delegation gap:** the orchestrator hits a recurring delegation
   that doesn't match any active agent and the closest stub matches the
   pattern.

When criteria are met, the librarian:
1. Replaces the stub's system prompt with a fully fleshed persona (preserve
   YAML frontmatter, swap only the body). Reuse structural patterns from
   `librarian.md`: "Files you own / MUST NOT touch", numbered "When called
   for X" workflows, strict-constraints block.
2. Updates this file: move the agent's row from the Stub roster to the Active
   roster.
3. Replies terse: "promoted X."

When criteria are NOT met, the librarian replies with what threshold would
unlock promotion (e.g. "needs 1 more occurrence in a future session, or
explicit user go-ahead").

## How to add a brand-new role (not in this roster)

If a need emerges that none of the 10 cover, the orchestrator (not the
librarian) creates a new file at `.claude/agents/<name>.md`. The librarian
then updates this README to add the row. Don't proliferate roles — three
strong agents beat ten weak ones. Add a new role only when the demand pattern
clearly doesn't fit any existing agent (active or stub).

## Notes

- **Tool gating is the safety contract.** An agent without `Edit`/`Write`
  literally cannot mutate files. Use that to enforce diagnose-don't-fix and
  read-only personas.
- **Behavioral scope is the second contract.** The system prompt names what
  the agent will and won't do, what files it owns, what it must escalate.
  Belt-and-suspenders with the tool gate.
- **No subagent can spawn another subagent.** Plan delegation accordingly.
- **Permission-mode and project settings interact.** See
  `.claude/settings.json` `permissions.allow` for the project-level
  authorizations that make subagent self-writes work without prompting.
