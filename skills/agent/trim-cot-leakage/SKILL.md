---
name: trim-cot-leakage
description: Use when auditing or fixing prose that reads like a leaked reasoning transcript — dead session citations, change narration, review residue, or hedged planning in docs, skill bodies, comments, or Agent Notes.
---

# Trimming Chain-of-Thought Leakage

Chain-of-thought leakage is prose whose vantage is the authoring session rather than the repository: it cites artifacts only that session could see, narrates the change instead of the state, or argues with a reviewer who has left. The fix is never deletion alone when a passage carries factual clauses — restate each so it stands on its own, then delete the transcript around it; a passage carrying none is deleted outright. **Before editing, enumerate the complete proposition:** preserve each actor, action, condition, timing, modality, negative guarantee, exception, ownership, side effect, failure mode, and consequence. It is guidance, not a script.

## The one test

For every suspect passage ask: **could a reader with no access to any session transcript, PR thread, or uncommitted draft resolve every reference and verify every claim?** If no, restate the surviving facts and delete the rest. If yes, it is not leakage — but a resolvable change story on a current-state surface (README, docs, skill body) is still change narration and belongs in a commit, PR, or Agent Note.

## Taxonomy

1. **Dead design-session citations** — `(decision 7)`, `(audit C2)`, `design §4.7`, phase labels (`T4`, `W3`). If the decision has a committed owner, cite it by name and path; otherwise delete the citation and restate its factual clause.
2. **Stack and PR vantage** — "a later PR in this stack", "this PR adds", "the previous commit". State the shipped mechanism; deferred work becomes a `TODO` marker or an issue reference.
3. **Change narration and version stamps** — "used to", "no longer", "the old X", and indexical stamps ("v1", "this cut", "today"). State the present behavior; a fixed regression becomes a present-tense counterfactual ("without X, Y happens"), never repo history.
4. **Review choreography** — "rejected in review", "the reviewer confirmed", draft ordinals ("v5 of this note"). Keep the surviving decision and rationale as plain fact.
5. **Reviewer-addressed justification** — "the cast is safe — it simply…", "this is correct because…". State the invariant that makes the code or rule safe, or delete the comment.
6. **Restatement and derivation transcripts** — control-flow narration ("first we X, then we Y"), proofs of obvious branches. Delete; keep only a non-obvious contract.
7. **Hedges and planning residue** — "probably fine for now", "should be enough", deferrals with no marker. Promote to `TODO`/`FIXME` or restate as the actual bound.
8. **Authoring-language slips** — untranslated fragments in prose whose language is otherwise English, or the reverse in a `.zh.md` counterpart. Translate or delete.

## What is not leakage

Unaided citation passes fail in both directions by deleting durable references and keeping dead ones. Apply these keep rules as written:
- **Issue references** — `#1470`, `TODO(name):`, "issue #N owns the follow-up" resolve at HEAD; keep them on any surface, including READMEs. Do not relocate them to Agent Notes.
- **Merged-PR and issue citations inside Agent Notes and postmortems** — sanctioned evidence per the documentation standard's change-story routing.
- **Suppression justifications** — lint-disable `-- reason` clauses, coverage-ignore reasons, and empty-catch explanations are required prose; fix a false reason, never delete it.
- **Counterfactual-present regression pins** — "without X, Y happens", "a naive X would…".
- **Measured bounds** — "(measured: …)" calibrating a constant; the provenance word "measured" is load-bearing.
- **Runtime old/new states** — "the old connection drains before the new one accepts" is runtime lifecycle, not change history.
- **Historical stage names inside a note's change-story sections** — "the first cut shipped X" is current-state-safe there; indexical stamps ("this cut") stay banned everywhere.
- **External references that resolve outside the repo by design** — standards sections (RFC 9110 §10.1.5), design-artifact names (a Figma frame). The §-ban covers uncommitted internal drafts, not external standards or committed docs that own their §-numbering.
- **Project voice and genre forms** — "we" as project voice; a note's Alternatives-considered section.

## Workflow

1. Require an explicit scope. Never touch `vendor/`, frozen archived notes, or recorded fixtures and snapshots — recorded model output and sealed history keep their original voice.
2. Audit read-only first: run the [recall batteries](references/recall-batteries.md), then judge every hit semantically. The batteries over-match by design and under-match by nature — also read the densest prose in scope without a pattern in hand.
3. Fix owner-first: for a bilingual pair, update the counterpart; for a generated or manifest-listed surface, fix the source.
4. Before deleting anything, enumerate the passage's propositions and check the [overcorrection traps](references/examples.md).
5. Verify: re-run the batteries expecting only sanctioned keeps, confirm every remaining citation resolves, and run your repository's documentation checks for touched docs.
