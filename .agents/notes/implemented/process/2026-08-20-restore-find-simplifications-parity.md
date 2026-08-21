# Agent Note: Restore find-simplifications parity with dsh-find-simplifications

Status: implemented

English | [中文](2026-08-20-restore-find-simplifications-parity.zh.md)

## Problem

The published `find-simplifications` kept only the survey-prove-record skeleton of `dsh-find-simplifications` (deepseek-harness `.agents/skills/dsh-find-simplifications/SKILL.md`). The port in `31b2ba5` rewrote the 146-line body down to 61 lines and dropped the code-surface candidate classes, survey domains and parallel subagents, trust-and-lifecycle audit, dependency-swap procedure, the Agent Note coalescing algorithm with its added-then-removed rules, inline TODO/FIXME/XXX semantics, folding another PR or branch, and validation/PR hygiene. The two skills stopped sharing functionality — feature drift rather than generalization — and the fusion note's claim that the published skill "surveys code, docs, and skills" no longer matched the shipped body.

## Decision

Rewrite `find-simplifications` to carry the full `dsh-find-simplifications` workflow with host references parameterized: root `AGENTS.md` conventions, the architecture doc, the Agent Note tree, the dependency policy, and the repository's gates replace deepseek-harness paths, commands, and architecture facts. Concrete host facts remain only as named examples (`packages/*/src`, `knip`, pnpm gate commands, the `.agents/notes/<lifecycle>/<class>/` layout). The body stays self-contained in `SKILL.md`; two conditional sections (coalescing superseded notes, folding another PR or branch) later moved into `references/` — see [2026-08-20-split-find-simplifications-references](2026-08-20-split-find-simplifications-references.md) — while the survey-and-prove core stays inline. The published name and invocation defaults are unchanged, and the Codex metadata (`agents/openai.yaml`) is updated to match. This note realizes, rather than reverses, the fusion recorded in [2026-08-19-fuse-find-simplifications](2026-08-19-fuse-find-simplifications.md).

## Alternatives considered

- **Keep the drifted body.** Rejected: the user requires the same functionality as `dsh-find-simplifications`, generalized, and the dropped sections — trust-and-lifecycle audit, dependency bar, coalescing algorithm, PR hygiene — are the main value.
- **Split the detailed sections into `references/`.** Rejected: the fusion note published the skill as self-contained, and each section is a workflow step every branch reaches, not conditional reference. The body therefore stayed at 146 lines until the governance audit; the two conditional sections were then split into `references/` (see the split note), and the survey-and-prove core remains inline.
- **Rename it `dsh-find-simplifications`.** Rejected: the `dsh-` prefix marks deepseek-harness-internal skills; this repository publishes portable skills under their plain names.

## Consequences

- `skills/agent/find-simplifications/SKILL.md` grows from 61 to 146 lines and again spans code, docs, and skills, matching what the fusion note recorded.
- The description now names the coalesce-notes and fold-PR branches, so those requests can trigger the skill.
- The skill remains host-agnostic: a run in deepseek-harness reproduces the dsh-flavored behavior from the same body; a run in any other repository applies the same workflow to that host's conventions.
