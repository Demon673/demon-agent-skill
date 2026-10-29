# Skills map: deepseek-harness absorption status

English | [中文](skills-map.zh.md)

This reference maps deepseek-harness skills at revision [`f3803c9`](https://github.com/deepseek-ai/deepseek-harness/tree/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/.agents/skills) to their disposition here. Absorbed skills are portable adaptations, not verbatim mirrors; the [synchronization decision](../.agents/notes/implemented/process/2026-10-30-sync-upstream-skills.md) records retained differences. The governing concepts — absorption, seam, host repository — are defined in [GLOSSARY.md](../GLOSSARY.md).

| deepseek-harness skill | Disposition | Counterpart here | Record |
|---|---|---|---|
| dsh-find-simplifications | absorbed; effect-path and consumer evidence | skills/agent/find-simplifications/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-find-simplifications-parity.md) |
| dsh-pre-push-checks | absorbed; evidence-selection machinery restored | skills/agent/pre-push-checks/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-pre-push-checks-parity.md) |
| dsh-prose-standard | absorbed; code-prose coverage restored as union | skills/agent/prose-standard/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-prose-standard-parity.md) |
| dsh-translate-docs | absorbed; briefing and gate machinery restored; invocation stays default (dsh is user-only) | skills/agent/translate-docs/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-translate-docs-parity.md) |
| dsh-archive-agent-notes | absorbed; i18n sidecar step restored | skills/agent/archive-agent-notes/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-archive-agent-notes-sidecar.md) |
| dsh-trim-cot-leakage | absorbed; non-leakage boundary list restored | skills/agent/trim-cot-leakage/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-trim-cot-leakage-boundaries.md) |
| dsh-merging-stacked-prs | absorbed; minor generalization kept | skills/agent/merging-stacked-prs/SKILL.md | — |
| dsh-code-review | checklist absorbed; review flow owned by Matt's code-review | skills/agent/workspace-standards-review/references/code-review-checklist.md | [note](../.agents/notes/archived/process/2026-08-20-absorb-code-review-checklist.md) |
| dsh-doc | portable placement and operational verification absorbed; host templates and website projection excluded | skills/agent/doc-standards/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-absorb-doc-standards.md) |
| record-browser-gif | absorbed including the deterministic encoder | skills/agent/record-browser-gif/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-absorb-record-browser-gif.md) |
| dsh-ci-test-reliability | deferred as a standalone skill; portable review questions included in pre-push and code review | — | — |
| dsh-error-handling | deferred: assess against existing diagnosis and review workflows before adding another trigger | — | — |
| dsh-speed-up-perf | deferred: requires a separate portable profiling workflow | — | — |
| dsh-pr-description | not absorbed: host PR policy; installed pr skill owns the entry point | — | — |
| dsh-create-upgrade-guide | not absorbed: host release and compatibility records | — | — |
| dsh-client-ui-ux | not absorbed: host client conventions and components | — | — |
| dsh-responsive-ui | not absorbed: host client layout and input conventions | — | — |
| dsh-session-projection | not absorbed: host Session services and persistence | — | — |
| dsh-official-plugin-artwork | not absorbed: host plugin branding and metadata | — | — |
| cordis-styling-nitpicking | not absorbed: host Cordis lifecycle audit | — | — |
| agent-experience | not absorbed: host preset skill linked from its package | — | — |

## Seams

- Matt's pack owns the engineering loop (grill → spec → tickets → implement → code-review); this pack owns the repository-maintenance flow (workspace-standards-review → find-simplifications → archive-agent-notes → pairing verification), the prose tool layer, and standalone tools. ask-demon routes both.
- code-review: Matt's code-review is the single review entry point. The deepseek-harness review checklist is generalized into workspace-standards-review's references so any Standards-axis review can load it for code-facing changes.
- translate-docs: the deepseek-harness original is user-only; here it stays model+user reachable for explicit translation tasks. Routine counterpart edits stay with their owning change and do not invoke the extended workflow.
- writing: Matt's writing skills (`writing-for-agents` and its siblings) own the agent-facing delivery frame — pointer wording, information hierarchy, progressive disclosure, pruning; `prose-standard` owns what agent-facing docs must say.
