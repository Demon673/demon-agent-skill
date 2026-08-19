# Agent Note: Absorb dsh-code-review checklist into repo-standards-review

Status: implemented

English | [中文](2026-08-20-absorb-code-review-checklist.zh.md)

## Problem

`repo-standards-review` reviewed a change against the repository's standards — skill frontmatter and bodies, docs and bilingual pairs, Agent Notes, and scripts — but carried no code-facing guidance for lifecycle, concurrency, invariants, disposal, and other implementation semantics. The deepseek-harness `dsh-code-review` skill held exactly that checklist, and a generalized 1:1 port belonged here so a code-facing review does not lose the coverage.

Preparing the port surfaced a factual error in the [fusion note](2026-08-19-fuse-find-simplifications.md): it claims the four doc-side simplification means (one home per fact, hunt duplication, hand-restated inventories, change-history narration) "fold cleanly into" `find-simplifications`, but they have zero presence there.

## Decision

Add [`references/code-review-checklist.md`](../../../../skills/agent/repo-standards-review/references/code-review-checklist.md) to `repo-standards-review`: a generalized 1:1 port of `dsh-code-review` that keeps all six blocking requirements and manual checks while parameterizing deepseek-harness sources — standing orders and package rules, the defensive-patterns doc, the prose standard, the testing doc, the change-scope tool, the invariant and disposal conventions, and the translation rules and terminology. Add one pointer line in `repo-standards-review/SKILL.md` so code-facing reviews load the reference.

Correct the fusion note's factual claim in place: the four doc-side means live in the `docs/AGENTS.md` tier taxonomy and slop checklist, plus `prose-standard` and `trim-cot-leakage` — not in `find-simplifications`. The fusion decision (fuse into `find-simplifications`, delete `doc-standards`) is unchanged.

## Alternatives considered

- **Keep the code-facing checklist in `repo-standards-review/SKILL.md`.** Rejected: the checklist is conditional reference that only code-facing reviews reach, and the skill stays concise when the material lives behind a pointer.
- **Leave code-facing review uncovered.** Rejected: lifecycle, concurrency, invariant, and disposal review is the substance of a code review, and the checklist already exists to port.
- **Leave the fusion note's claim as-is.** Rejected: it misstates where the means live, and implemented notes must match shipped reality.

## Consequences

- `repo-standards-review` now covers code-facing review semantics through `references/code-review-checklist.md`, reached by a pointer rather than always loaded.
- The fusion note records the actual homes of the four doc-side means, so a reader no longer looks for them inside `find-simplifications`.
