# Agent Note: Publish merging-stacked-prs

Status: implemented

English | [中文](2026-08-19-publish-merging-stacked-prs.zh.md)

## Problem

`merging-stacked-prs` was fully general (GitHub native `gh stack`, no coupling to this repository) but sat in the internal `skills/agent/` set. Before publishing it, two things had to be confirmed: that it carries no cross-references, and that it does not overlap the `resolving-merge-conflicts` skill from `mattpocock/skill`, which the user installs globally.

## Decision

Publish [`merging-stacked-prs`](../../../../skills/agent/merging-stacked-prs/SKILL.md) under `skills/agent/`. It layers with, and does not overlap, `resolving-merge-conflicts`: `merging-stacked-prs` lands a stack of dependent PRs through GitHub's native stack API; `resolving-merge-conflicts` resolves an in-progress merge/rebase conflict hunk by hunk. The two are upstream and downstream — a stack rebase that hits a conflict hands off to hunk resolution, then returns to the stack workflow.

## Alternatives considered

- **Keep it internal.** Rejected: it is general, self-contained, and not covered by any installed skill, so publishing makes it usable across projects.
- **Merge it into `resolving-merge-conflicts`.** Rejected: different trigger and different layer (stack orchestration vs conflict resolution), and it depends on `gh stack`, which conflict resolution does not.

## Consequences

- The published manifest grows from 15 to 16 skills; the internal set shrinks from 6 to 5.
- No name or semantic conflict with the installed `mattpocock/skill` set: `merging-stacked-prs` and `resolving-merge-conflicts` coexist as separate layers.
