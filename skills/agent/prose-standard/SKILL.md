---
name: prose-standard
description: Use when writing, reviewing, restoring, trimming, or auditing prose — deciding where documentation or comments are required across Markdown, skill frontmatter and bodies, comments, prompts, descriptions, and strings, and preserving complete contracts while removing reasoning transcripts and repetition.
---

# Prose Standard

Write enough to preserve the contract, then remove reasoning transcripts, repetition, and decoration. A **contract** is an obligation, invariant, precondition, postcondition, or promise that a caller, reader, or maintainer relies on. This skill owns editorial judgment and required prose coverage. Placement and budgets follow the repository's own documentation standard; reasoning-transcript leakage — dead session citations, change narration, review choreography, hedges — is a separate audit with its own taxonomy. It is guidance, not a script.

## Inputs and exclusions

Require an explicit `scope`. If it is missing, report the required input and stop; do not infer a repository-wide scope.

Accept `mode: automatic | interactive`; default to `automatic`. `mode` controls questions, not write authority: review and audit tasks report findings without editing; explicitly requested write or trim tasks apply changes.

Always exclude frozen archived notes from review and edits. Archived notes are frozen snapshots; inspect an exact target only to understand a historical inbound citation, never to modernize its prose.

## Preserve the complete proposition

Before editing, identify every proposition in the passage. Preserve each relevant:

- actor and action;
- condition, timing, and ordering;
- modality such as must, may, or never;
- negative guarantee and exception;
- ownership, side effect, failure mode, and consequence.

Remove adjectives, repetition, and narration only when every factual clause survives and the result is clearer. A smaller word count alone is not an improvement.

Keep a complete local contract at the point of use, and link the owning document for rationale and history. One explanation has one home; essential contract facts may repeat locally. Keep non-obvious rationale when omitting it could plausibly cause misuse; otherwise state the consequence and link the rationale home.

## Required coverage by location

- **Skill `SKILL.md`:** state behavioral guardrails and explicit scope limitations such as "guidance, not a checklist." Keep the workflow concise and link its source of truth; move detailed or conditional reference into `references/`.
- **Skill descriptions:** front-load the trigger, list one trigger per distinct branch, and cut identity the body already carries.
- **`AGENTS.md` files:** one to three lines per rule, each linking its home; no restated procedures.
- **READMEs:** include the consumer contract — install, configuration, semantics, failures, and limitations — and link generated catalogs and owning docs.
- **Agent Notes:** retain unique rationale, mechanisms, alternatives, consequences, shipped verification evidence, and named coverage gaps. Implemented notes state shipped reality in the present tense; remove planning checklists, not evidence.
- **Comments and scripts:** document non-obvious contracts and rationale, not what the code already shows; delete control-flow narration and restatement.
- **Prompts and visible strings:** treat wording as behavior; inspect generated output and run behavior validation or state why none applies.

Preserve searchable mechanism names and meaningful modal, temporal, or negative emphasis. Normalize decorative emphasis only.

## Workflow

1. Confirm scope, mode, and the applicable `AGENTS.md` files.
2. Read your repository's documentation standard and the owning doc or code before judging a passage. For calibration, read [the distilled examples](references/examples.md).
3. Inspect the requested scope, not only the largest files. Use searches and word counts to find candidates, then judge passages semantically.
4. Classify each candidate as keep, add, trim, restore, restructure, or defer. Apply changes only when the task authorizes edits.
5. Run your repository's documentation and skill checks, plus `git diff --check`. Report the inspected scope, changes, deliberate keeps, deferred cases, and checks run.

## Borderline decisions

A case is borderline only when at least two versions satisfy the complete-proposition rule but trade accepted principles. In automatic mode, apply clear edits when authorized and report genuine borderline cases without asking. In interactive mode, group analogous passages, present two or three viable versions with a recommendation, and state the factual difference. After the user decides, distill the principle into [the examples](references/examples.md) and apply it to every analogous passage in scope.
