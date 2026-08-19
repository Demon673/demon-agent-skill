# Skills map: deepseek-harness absorption status

English | [中文](skills-map.zh.md)

This reference maps every deepseek-harness skill to its disposition in this repository. One home per capability: where Matt's pack owns a capability, this pack records a seam instead of a second skill. Absorption means: 1:1 port, generalized (no deepseek-harness paths, commands, or architecture facts except named examples), plain name, and an implemented Agent Note recording the disposition.

| deepseek-harness skill | Disposition | Counterpart here | Record |
|---|---|---|---|
| dsh-find-simplifications | absorbed; parity verified | skills/agent/find-simplifications/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-find-simplifications-parity.md) |
| dsh-pre-push-checks | absorbed; evidence-selection machinery restored | skills/agent/pre-push-checks/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-pre-push-checks-parity.md) |
| dsh-prose-standard | absorbed; code-prose coverage restored as union | skills/agent/prose-standard/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-prose-standard-parity.md) |
| dsh-translate-docs | absorbed; briefing and gate machinery restored; invocation stays default (dsh is user-only) | skills/agent/translate-docs/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-translate-docs-parity.md) |
| dsh-archive-agent-notes | absorbed; i18n sidecar step restored | skills/agent/archive-agent-notes/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-archive-agent-notes-sidecar.md) |
| dsh-trim-cot-leakage | absorbed; non-leakage boundary list restored | skills/agent/trim-cot-leakage/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-trim-cot-leakage-boundaries.md) |
| dsh-merging-stacked-prs | absorbed; minor generalization kept | skills/agent/merging-stacked-prs/SKILL.md | — |
| dsh-code-review | checklist absorbed; review flow owned by Matt's code-review | skills/agent/repo-standards-review/references/code-review-checklist.md | [note](../.agents/notes/implemented/process/2026-08-20-absorb-code-review-checklist.md) |
| dsh-doc-standards | fused into find-simplifications; the structural audit lives in docs/AGENTS.md | — | [note](../.agents/notes/implemented/process/2026-08-19-fuse-find-simplifications.md) |
| dsh-doc-site-sync | deferred: port when a host repo has a docs-site projection | — | — |
| record-browser-gif | absorbed including the deterministic encoder | skills/agent/record-browser-gif/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-absorb-record-browser-gif.md) |
| cordis-plugin-development | not absorbed: deepseek-harness product domain; use the original in its repo | — | — |
| editing-cordis-compositions | not absorbed: same reason | — | — |
| dsh-badge | not absorbed: deepseek-harness branding | — | — |

## Seams

- Matt's pack owns the engineering loop (grill → spec → tickets → implement → code-review); this pack owns the repository-maintenance flow (repo-standards-review → find-simplifications → archive-agent-notes → translate-docs), the prose tool layer, and standalone tools. ask-demon routes both.
- code-review: Matt's code-review is the single review entry point. The deepseek-harness review checklist is generalized into repo-standards-review's references so any Standards-axis review can load it for code-facing changes.
- translate-docs: the deepseek-harness original is user-only; here it stays model+user reachable because the maintenance-flow cascade needs it.
