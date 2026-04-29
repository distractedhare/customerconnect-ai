# CLAUDE.md

**The canonical house rules for this folder live in `AGENTS.md`.** Read that
file first before making any changes. It covers folder layout, where things go,
and known pitfalls.

This stub exists so Claude Code / Claude Cowork pick up the rules automatically.
All content is in `AGENTS.md`. If something is out of date, fix it there, not here.

## Session memory (auto-loaded)

The following files are loaded into every session by the `@` references below.
They're maintained by the `librarian` subagent — never hand-edit them.

- `@.claude/notes/lessons.md` — generalized principles from prior corrections.
- `@.claude/notes/index.md` — table of contents for prior session logs.

When the user corrects an architectural or behavioral choice and the lesson
should outlive the current session, invoke the `librarian` subagent to append
to `lessons.md`. At the end of a substantive work block, invoke `librarian` to
write a terse session log into `.claude/notes/sessions/`. When the user asks
"what did we do last session" or similar, invoke `librarian` for recall.

@.claude/notes/lessons.md
@.claude/notes/index.md

