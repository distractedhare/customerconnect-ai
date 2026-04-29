# Salvage from pwa (customerconnect-ai repo)

Rescued on 2026-04-19 during consolidation. The `pwa/` folder inside
`T-Mobile Sales Assistant/` was retired (it was a stale working copy
of the same codebase that became improved-robot). These files were
NOT in improved-robot at the time of consolidation:

- `SupportPanel.tsx` — component unique to pwa
- `TransferBailout.tsx` — component unique to pwa
- `LearnTagGroup.tsx` — component unique to pwa (goes in src/components/learn/)
- `OBJECTION-REDESIGN-PROMPT.md` — scratch prompt from objection redesign work
- `pwa-local-modifications-*.patch` — diff of uncommitted modifications to
  14 files pwa had modified locally (App.tsx, AccessoriesReference.tsx,
  data/devices.ts, etc.) — applied against the pwa state at archive time.
  Review before applying; do NOT `git apply` blindly.

The full pwa folder is archived at:
`T-Mobile Sales Assistant/.deprecated/pwa-customerconnect-ai-ARCHIVE-20260419/`
in case you need to recover anything else.

If you port any of these into improved-robot's main source tree,
delete the corresponding file from .salvage-from-pwa/.
