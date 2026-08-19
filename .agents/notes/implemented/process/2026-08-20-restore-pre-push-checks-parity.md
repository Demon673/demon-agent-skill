# Agent Note: Restore pre-push-checks parity with dsh-pre-push-checks

Status: implemented

English | [中文](2026-08-20-restore-pre-push-checks-parity.zh.md)

## Problem

The published `pre-push-checks` kept only the generic selection skeleton of `dsh-pre-push-checks` (deepseek-harness `.agents/skills/dsh-pre-push-checks/SKILL.md`): confirm the checkout, list generic skill/docs/bilingual/whitespace checks, force-with-lease, and a four-step push procedure. The port dropped the evidence-selection machinery — the change-scope report with `--base`/`--head`, the code-and-behavior evidence bullets, unit-coverage selection that names both the owning tests and the covered source, the full local rehearsal, post-sync validation after a stack-sync rewrite, and PR CI inspection. The two skills stopped sharing behavior, and the skill's own description — select the smallest checks that cover the outgoing diff — no longer matched a body that offered no way to compute that scope.

## Decision

Rewrite `pre-push-checks` as a union of the published generic checks and the restored machinery, with host references parameterized: the repository's change-scope tool (when present), its test runner and coverage flags, its validator and documentation gates, and `gh pr checks` replace deepseek-harness paths, commands, and architecture facts. Concrete host facts remain only as clearly-labeled named examples (`pnpm --silent run change-scope --base <ref>`, Vitest `--coverage.include`, `gh stack sync`). The published name and invocation defaults are unchanged. The body stays self-contained in `SKILL.md` with no `references/` split, because the merged body is 100 lines — under the ~110-line budget — and every restored section is a workflow step, not conditional reference. This note extends, rather than reverses, the decoupling recorded in [2026-08-18-publish-general-skills](2026-08-18-publish-general-skills.md): the generic checks remain, and the dropped machinery returns in generalized form.

## Alternatives considered

- **Keep the drifted body.** Rejected: the user requires the same functionality as `dsh-pre-push-checks`, generalized, and the dropped machinery — change-scope, coverage selection, full local rehearsal, post-sync validation, PR CI — is the main value.
- **Restore the machinery but keep it deepseek-harness-specific.** Rejected: this repository publishes portable skills; the port must run in any host repository, so paths, commands, and architecture facts become parameterized references with named examples.
- **Split the platform-specific command examples into `references/`.** Rejected: the dsh skill is self-contained and the parity specification keeps the evidence-selection workflow in one body; the Vitest/pnpm/`gh` invocations appear as labeled examples. This mirrors the find-simplifications parity decision.
- **Split the conditional sections into `references/`.** Rejected: the merged body stays under the ~110-line budget and each restored section is a workflow step every branch reaches, not conditional reference.

## Consequences

- `skills/agent/pre-push-checks/SKILL.md` grows from 50 to 100 lines and again selects the narrowest checks from a computed outgoing scope instead of listing generic checks only.
- The skill remains host-agnostic: a run in deepseek-harness reproduces the dsh-flavored behavior from the same body; a run in any other repository applies the same workflow to that host's tools.
- The generic skill/docs/bilingual/whitespace checks remain, so the skill still covers a docs-and-skills-only repository with no change-scope tool or Vitest.
