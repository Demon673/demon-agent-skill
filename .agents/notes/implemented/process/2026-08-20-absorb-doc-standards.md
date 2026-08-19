# Agent Note: Absorb dsh-doc-standards at full parity

Status: implemented

English | [中文](2026-08-20-absorb-doc-standards.zh.md)

## Problem

The 2026-08-19 fusion deleted `doc-standards` as a "thin wrapper" and claimed its doc-side means folded into `find-simplifications`. The drift audit falsified that claim: the operational layer — the structure-before-prose placement workflow, the four placement-cost constraints, the six corpus-audit probes, and the budget-red probe workflow — has no home anywhere, and `docs/AGENTS.md` falsely named `find-simplifications` as the slop-checklist auditor.

## Decision

Revive `doc-standards` at full parity with `dsh-doc-standards`, generalized (no trimming): every cross-skill and documentation reference is by name, never by a repo-relative path, and no command example names a specific repository's scripts, so the skill runs unchanged in any host repository. Specifically: the sources-of-truth pointers, the five-step structural pass, the placement-cost constraints, the six corpus-audit probes, the budget-red workflow, and the validation/PR-hygiene section. Integrate it into the flow: `ask-demon`'s prose tool layer becomes a four-skill prose-and-docs layer, `setup-demon-skills` scaffolds the documentation standard it applies, and `docs/AGENTS.md` points at it for placement, validation, and slop auditing. This completes the eleven-of-eleven maintenance-skill absorption and partially supersedes the fusion note's doc-standards half (kept cross-linked).

## Alternatives considered

- **A slimmed version.** Rejected: the user requires deep parity; the operational probes and ordering rules are the value.
- **Fold the workflow into prose-standard.** Rejected: document structure is not prose; widening prose-standard's scope would dilute both.
- **Keep the fusion as is.** Rejected: four proposition groups are homeless, and the false slop-auditor pointer in docs/AGENTS.md misroutes real audits.

## Consequences

- All eleven deepseek-harness maintenance skills are now genuinely absorbed; the skills map and the fusion note reflect the reversal.
- `doc-standards` owns placement, structure, corpus audits, and budget probes; `prose-standard` owns editorial judgment; `find-simplifications` owns removable-surface surveys.
- New host repositories get the documentation standard scaffolded by `setup-demon-skills`, so `doc-standards` has a standard to apply from day one.
