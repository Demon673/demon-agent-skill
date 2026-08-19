# Agent Note: Publish three general-purpose skills and rename code-review

Status: implemented

English | [中文](2026-08-18-publish-general-skills.zh.md)

## Problem

The internal `skills/agent/` set held four skills with general-purpose cores coupled to this repository: `prose-standard`, `trim-cot-leakage`, `pre-push-checks`, and `code-review`. The first three referenced this repository's docs, scripts, and each other, so they could not be installed into a global skill directory. `code-review` also collided by name with the general-purpose `code-review` from `mattpocock/skill` that is installed globally.

## Decision

Publish [`prose-standard`](../../../../skills/agent/prose-standard/SKILL.md), [`trim-cot-leakage`](../../../../skills/agent/trim-cot-leakage/SKILL.md), and [`pre-push-checks`](../../../../skills/agent/pre-push-checks/SKILL.md) under `skills/agent/`, each decoupled to be self-contained: cross-skill references are inlined and tool commands are generalized to "your repository's …". Rename the internal [`code-review`](../../../../skills/agent/repo-standards-review/SKILL.md) to `repo-standards-review` and keep it under `skills/agent/`, so it no longer shadows the global `code-review`.

## Alternatives considered

- **Keep them internal, self-contained only.** Rejected: a self-contained internal skill is not a product to install globally.
- **Publish but keep cross-references.** Rejected: a skill installed globally cannot resolve this repository's docs, scripts, or sibling skills.
- **Keep the `code-review` name.** Rejected: it collides with the globally installed mattpocock `code-review`, which reviews code diffs, not this repository's documentation discipline.

## Consequences

- The published manifest grows from 12 to 15 skills; the internal set shrinks from 9 to 6.
- `repo-standards-review` is now the repository's own artifact-review skill, distinct from the general `code-review`.
- The three published skills are self-contained and install cleanly into global.
