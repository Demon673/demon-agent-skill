---
name: trim-cot-leakage
description: Use when auditing or fixing prose that reads like a leaked reasoning transcript — dead design-session citations such as decision numbers, audit codes, plan phases, or draft sections; change narration such as "used to", "no longer", or "this cut"; PR or review vantage; reviewer-addressed justifications; control-flow narration; or hedged planning residue in docs, skill bodies, comments, generated prose, or Agent Notes.
---

# Trimming Chain-of-Thought Leakage

Chain-of-thought leakage is prose whose vantage is the authoring session rather than the repository: it cites artifacts only that session could see, narrates the change instead of the state, or argues with a reviewer who has left. The fix is never deletion alone when a passage carries factual clauses — restate each so it stands from the repository's vantage, then delete the transcript around it; a passage carrying none is deleted outright. **Before editing, enumerate the complete proposition:** preserve each actor, action, condition, timing, modality, negative guarantee, exception, ownership, side effect, failure mode, and consequence. It is guidance, not a script.

## The one test

For every suspect passage ask: **could a reader with no access to any session transcript, PR thread, or uncommitted draft resolve every reference and verify every claim?** If no, restate the surviving facts and delete the rest. Resolvability clears this skill's citation bar only: a change story on a current-state surface (README, docs, JSDoc, skill body) is still change narration and belongs in a commit, PR, or Agent Note.

## Taxonomy

1. **Dead design-session citations** — `(decision 7)`, `(audit C2)`, `design §4.7`, `plan §1.4`, phase labels (`T4`, `W3`, `P-I`), or an uncommitted design ledger. If the decision has a committed owner, cite it by name and path; otherwise delete the citation and restate its factual clause.
2. **Stack and PR vantage** — "a later PR in this stack", "this PR adds", "the previous commit". State the shipped mechanism or extension point; deferred work becomes a `TODO` marker or an issue reference.
3. **Change narration and version stamps** — "used to", "no longer", "the old X", and indexical stamps ("v1", "this cut", "today", or "now" contrasting with a past state). State the present behavior; a fixed regression becomes a present-tense counterfactual ("without X, Y happens"), never repo history.
4. **Review choreography** — "rejected in review", "the reviewer confirmed", draft ordinals ("v5 of this note"), or round attributions. Keep the surviving decision and rationale as plain fact.
5. **Reviewer-addressed justification** — "the cast is safe — it simply…", "this is correct because…". A comment arguing its own correctness addresses a reviewer; state the invariant that makes the code or rule safe, or delete the comment.
6. **Restatement and derivation transcripts** — control-flow narration ("first we X, then we Y"), test walkthroughs, or proofs of obvious branches. Delete; keep only a non-obvious contract or invariant.
7. **Hedges and planning residue** — "probably fine for now", "should be enough", deferrals with no marker. Promote to `TODO`/`FIXME` or restate as the actual bound.
8. **Authoring-language slips** — untranslated working-language fragments or session separators in prose whose language is otherwise English, or the reverse in a `.zh.md` counterpart. Translate or delete.

## What is not leakage

Unaided citation passes fail in both directions by deleting durable references and keeping dead ones. Apply these keep rules as written:
- **Issue references** — `#1470`, `TODO(name):`, "issue #N owns the follow-up" resolve at HEAD; keep them on any surface, including READMEs. Do not relocate them to Agent Notes.
- **Merged-PR and issue citations inside Agent Notes and postmortems** — sanctioned evidence per the documentation standard's change-story routing.
- **Suppression justifications** — lint-disable `-- reason` clauses, coverage-ignore reasons, and empty-catch explanations are required prose; fix a false reason, never delete it.
- **Counterfactual-present regression pins** — "without X, Y happens", "a naive X would…".
- **Measured bounds** — "(measured: …)" calibrating a constant; the provenance word "measured" is load-bearing.
- **Runtime old/new states and natural time** — "the old connection drains before the new one accepts" names live lifecycle objects, and a prompt asking for today's date uses the runtime clock; neither is repository history.
- **Historical stage names inside a note's change-story sections** — "the first cut shipped X" is current-state-safe there; indexical stamps ("this cut") stay banned everywhere.
- **External references that resolve outside the repo by design** — standards sections (RFC 9110 §10.1.5), design-artifact names (a Figma frame). The §-ban covers uncommitted internal drafts, not external standards or committed docs that own their §-numbering.
- **Project voice and genre forms** — "we" as project voice; a note's Alternatives-considered section, where "Rejected" is the required verdict rather than review choreography.
- **Terms that also occur in live contexts** — instrumental "used to", protocol or path names such as `v1`, PR workflow instructions, and runtime state descriptions match the batteries but do not adopt a change's vantage.

## Workflow

1. Require an explicit scope. Never touch `vendor/` or frozen archived notes. Treat recorded fixtures and snapshots as derivatives: change the owning source or scenario, then regenerate them only when an authorized behavior change needs new evidence.
2. Audit read-only first: run the [recall batteries](references/recall-batteries.md), calibrating each probe against a known positive and a near-miss negative before trusting its output, then judge every hit semantically. The batteries over-match by design and under-match by nature — also read the densest prose in scope without a pattern in hand.
3. Fix owner-first: trace every consumer; for generated output, fix the source and regenerate each derivative; for a bilingual pair, update the counterpart minimally and refresh its consistency record; correct a shared code fence once and copy it byte-for-byte into both sides. Change model- or user-visible strings only with the owning behavior evidence; otherwise leave them unchanged and report the deferral.
4. Before deleting anything, enumerate the passage's propositions and check the [overcorrection traps](references/examples.md).
5. Verify: re-run the batteries expecting only sanctioned keeps and calibration evidence, confirm every remaining citation resolves, and run the documentation and behavior checks for touched surfaces.
