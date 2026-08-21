# Agent Note: Split find-simplifications conditional sections into references

Status: implemented

English | [中文](2026-08-20-split-find-simplifications-references.zh.md)

## Problem

The governance audit flagged `find-simplifications` as the largest unbudgeted SKILL.md (2,105 words). Two of its sections are explicitly conditional-triggered — the coalescing workflow fires "when the user asks to reduce or coalesce" the note tree, and the PR-folding workflow fires "when folding simplification ideas from another PR or branch" — so they belong in `references/` per the repository's own tier taxonomy, not in the always-loaded body.

## Decision

Move both sections into `references/coalesce-notes.md` and `references/folding-prs.md` verbatim; the body keeps one trigger-carrying pointer per section. Functional parity with dsh-find-simplifications is intact — the workflows load when their triggers fire — while structural parity ends here, recorded in the parity note.

## Alternatives considered

- **Keep everything inline.** Rejected: the repo's standard requires conditional material in `references/`, and the governance audit surfaced the 2,105-word body as the cost of the earlier parity decision.
- **Split the survey-and-prove core too.** Rejected: every branch of the workflow reaches it; it stays inline.

## Consequences

- The body drops from 2,105 to 1,674 words; the two workflows remain complete behind pointers.
- The parity note's "no references/ split" clause is superseded for these two sections and cross-linked from there.
