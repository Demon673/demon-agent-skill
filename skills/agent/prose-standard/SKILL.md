---
name: prose-standard
description: Use when writing, reviewing, restoring, trimming, or auditing prose — deciding where documentation or comments are required across Markdown, skill frontmatter and bodies, JSDoc, code and test comments, prompts, descriptions, diagnostics, and CLI or UI strings, and preserving complete contracts while removing reasoning transcripts and repetition.
---

# Prose Standard

Write enough to preserve the contract, then remove reasoning transcripts, repetition, and decoration. A **contract** is an obligation, invariant, precondition, postcondition, or compatibility promise that a caller, callee, implementer, producer, consumer, reader, or maintainer relies on. This skill owns editorial judgment and required prose coverage; follow your repository's documentation standard for placement, budgets, bilingual pairs, and documentation gates, and audit reasoning-transcript leakage — dead session citations, change narration, review choreography, hedges — with its own taxonomy. It is guidance, not a script.

Treat `contract`, `boundary`, `shape`, `surface`, `seam`, `gate`, and `vocabulary` as terms to check before use, not banned words. First ask whether the exact rule, API, field set, type, validation, timing point, component split, or failure states the fact better. Keep a term when it names the exact technical subject, including caller/callee contracts and security or process boundaries.

## Inputs and exclusions

Require an explicit `scope`. If it is missing, report the required input and stop; do not infer a repository-wide scope or begin an interview.

Accept `mode: automatic | interactive`; default to `automatic`. Enter interactive mode only when the user explicitly requests questions or calibration. `mode` controls questions, not write authority: review and audit tasks report findings without editing; explicitly requested write, fix, or trim tasks apply clear changes.

Always exclude `vendor/` from discovery, review, and edits, even when the requested scope is the whole repository. Do not follow a symlink into it. Put exclusions after inclusion globs so a later include cannot re-admit it — for example, end ripgrep commands with `--glob '!vendor/**'` and give Git commands an explicit `:(exclude)vendor/**` pathspec. If the requested scope contains only `vendor/`, report that no eligible files remain.

Also exclude frozen archived notes from review and edits. Archived notes are frozen snapshots; inspect an exact target only to understand a historical inbound citation, never to modernize its prose or outbound links.

Treat generated catalogs, snapshots, and fixtures as derivative. Edit the owning source or scenario first, then regenerate the artifact. When a generator extracts a summary from owner prose, make the extracted sentence complete for that surface. Bilingual pairs have no permanent owner: either language may be the authored side for an update, and the counterpart must follow in the same change.

## Preserve the complete proposition

Before editing, identify every proposition in the passage. Preserve each relevant:

- actor and action;
- condition, timing, and ordering;
- modality such as must, may, or never;
- negative guarantee and exception;
- ownership, side effect, failure mode, and consequence.

Remove adjectives, repetition, and narration only when every factual clause survives and the result is clearer. A smaller word count alone is not an improvement.

Keep a complete local contract at the point of use: behavior, failure, ownership, and consequence that a caller or maintainer needs there. Aggressively link to the owning document for architecture, rationale, algorithms, history, or extended examples. One explanation has one home; essential contract facts may repeat locally. Keep non-obvious rationale when omitting it could plausibly cause misuse or an incorrect simplification; otherwise state the consequence and link the rationale home.

## Required coverage by location

Comments describe non-obvious contracts or rationale that code cannot express; they do not restate what code already implies. This is not a one-way shortening pass: add or restore prose when code, types, and structure do not communicate a required contract, and do not add a comment when those facts are already obvious locally.

Required coverage spans skill bodies and descriptions, instruction files, READMEs, Agent Notes, JSDoc, internal and module comments, tests, cookbooks, postmortems, configuration comments, prompts and visible strings, and diagnostics. The full per-location list lives in [the coverage reference](references/coverage.md). Preserve searchable mechanism names and meaningful modal, temporal, or negative emphasis; normalize decorative emphasis only.

## Workflow

1. Confirm the scope, mode, current branch or PR base, and the applicable instruction files. Do not inspect unrelated branches.
2. Read your repository's documentation standard and the owning code or document before judging a passage. For calibration or unfamiliar cases, read [the coverage reference](references/coverage.md) and [the distilled examples](references/examples.md).
3. Inspect the requested scope, not only the largest files. Use searches and word counts to find candidates, then judge passages semantically.
4. Classify each candidate as keep, add, trim, restore, restructure, or defer. Apply clear changes only when the task authorizes edits; do not manufacture edits to satisfy a deletion target.
5. Update the owner before derivative artifacts. Re-check analogous passages after learning a new rule.
6. Run your repository's narrow relevant checks, documentation gates, `git diff --check`, and behavior tests for visible strings. Verify the final diff contains no `vendor/` path and report any accidental vendor match rather than claiming a clean exclusion history.
7. Report the inspected scope, clear changes, deliberate keeps, deferred cases, and checks actually run.

## Borderline decisions

A case is borderline only when at least two versions satisfy the complete-proposition rule but trade accepted principles, and this skill does not already resolve the tradeoff. A rewrite with one proposition-preserving answer is not borderline.

In automatic mode, apply clear edits when authorized and report genuine borderline cases without asking questions. Do not weaken a proposition to make progress.

In interactive mode, group analogous passages under the governing principle. Present two or three viable versions, recommend one, and state the factual or structural difference. Do not offer inferior distractors. Use the user's requested channel; when calibrating a change through inline comments, place the recommended provisional version in the diff and attach the alternatives to that exact line.

After the user decides, distill the principle and versions into [the examples](references/examples.md), without review history or reviewer narration, and apply the learned rule to every analogous passage in scope.
