# Agent Note: Fuse find-simplifications and doc-standards into one general skill

Status: implemented

English | [中文](2026-08-19-fuse-find-simplifications.zh.md)

## Problem

`find-simplifications` had a general core — survey for dead, duplicated, speculative, or over-built surface, prove or reject with consumer evidence, and record the worthwhile ones — but its "record" half was coupled to this repository's Agent Note format and `archive-agent-notes`. `doc-standards` held the doc-side simplification means (one home per fact, hunt duplication, hand-restated inventories, change-history narration), while its repo-specific parts (tier taxonomy, budgets, gates) already live in `docs/AGENTS.md`, leaving the skill a thin wrapper.

## Decision

Fuse the two into one published, self-contained [`find-simplifications`](../../../../skills/agent/find-simplifications/SKILL.md) under `skills/agent/`: it surveys code, docs, and skills, proves or rejects each candidate with consumer evidence, and records proposals into the host repository's decision-record system or inline `TODO(tag)` markers. The find-simplifications half of this decision stands; the doc-standards half is superseded by [2026-08-20-absorb-doc-standards](2026-08-20-absorb-doc-standards.md), which revived doc-standards at full parity as a published skill.

## Alternatives considered

- **Keep both, publish only find-simplifications.** Rejected: `doc-standards` is a thin wrapper over `docs/AGENTS.md`, and two overlapping maintenance skills is the packaging this note replaces.
- **Keep `doc-standards` internal and drop find-simplifications.** Rejected: the survey-and-prove workflow is the valuable half, and it is general; the doc-side means already live in `docs/AGENTS.md` (the tier taxonomy and slop checklist) and in `prose-standard` and `trim-cot-leakage`, so `doc-standards` would only duplicate them.

## Consequences

- One coherent general "find simplifications" skill spans code, docs, and skills, with no cross-references.
- doc-standards is a published workflow skill again (see the absorbing note); this note's remaining claim is the find-simplifications fusion only.
- Documentation placement and budgets are governed directly by `docs/AGENTS.md`; the doc-side means live in the `docs/AGENTS.md` tier taxonomy and slop checklist plus `prose-standard` and `trim-cot-leakage`.
