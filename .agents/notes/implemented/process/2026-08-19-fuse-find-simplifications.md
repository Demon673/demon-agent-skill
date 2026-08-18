# Agent Note: Fuse find-simplifications and doc-standards into one general skill

Status: implemented

English | [中文](2026-08-19-fuse-find-simplifications.zh.md)

## Problem

`find-simplifications` had a general core — survey for dead, duplicated, speculative, or over-built surface, prove or reject with consumer evidence, and record the worthwhile ones — but its "record" half was coupled to this repository's Agent Note format and `archive-agent-notes`. `doc-standards` held the doc-side simplification means (one home per fact, hunt duplication, hand-restated inventories, change-history narration), while its repo-specific parts (tier taxonomy, budgets, gates) already live in `docs/AGENTS.md`, leaving the skill a thin wrapper.

## Decision

Fuse the two into one published, self-contained [`find-simplifications`](../../../../skills/agent/find-simplifications/SKILL.md) under `skills/agent/`: it surveys code, docs, and skills, proves or rejects each candidate with consumer evidence, and records proposals into the host repository's decision-record system or inline `TODO(tag)` markers. Delete the internal `doc-standards`; its placement and budget rules stay in `docs/AGENTS.md`, which the root `AGENTS.md` already points to.

## Alternatives considered

- **Keep both, publish only find-simplifications.** Rejected: `doc-standards` is a thin wrapper over `docs/AGENTS.md`, and two overlapping maintenance skills is the packaging this note replaces.
- **Keep `doc-standards` internal and drop find-simplifications.** Rejected: the survey-and-prove workflow is the valuable half, and it is general; the doc-side means fold cleanly into it.

## Consequences

- The published manifest grows from 16 to 17 skills; the internal set shrinks from 5 to 3.
- One coherent general "find simplifications" skill spans code, docs, and skills, with no cross-references.
- Documentation placement and budgets are governed directly by `docs/AGENTS.md`, not by a wrapper skill.
