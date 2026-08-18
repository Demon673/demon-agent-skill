---
name: find-simplifications
description: Use to survey a codebase for non-obvious simplification candidates — dead, duplicated, speculative, or over-built surface across code, docs, and skills — prove or reject each with consumer evidence, and record the worthwhile ones as proposals or TODO markers instead of a pile of thin guesses.
---

# Finding simplifications

Turn a broad "find things to simplify" request into evidence-backed proposals that remove or collapse surface across code, docs, and skills. It is guidance, not a checklist: prefer a few well-proven candidates over a pile of thin guesses.

## Survey broadly

Survey code, docs, and skills by area. Start with the largest files, but do not let the first good candidate stop the survey. Use `rg` for exact names and distinctive phrases, then read call sites before classifying a surface as dead.

## What counts as a strong candidate

A strong candidate removes, folds, or demotes something real, with clear evidence that the current design costs more than it buys:

- A function, export, script, or skill section has no production consumer.
- Two places restate the same rule or logic; one home would serve with links (one home per fact).
- A hand-written list or inventory duplicates what source, a generator, or the environment already provides.
- A description or interface lists near-synonym branches that collapse to one.
- A module reimplements what a maintained dependency or the standard library already does.
- A rule, section, or test exists only to protect an unused or removed surface.
- Documentation narrates change history or restates code instead of stating the current contract.

Thin candidates are not enough: fixing one typo or flagging "this looks long" without consumer proof.

## Prove or reject each candidate

For every candidate, classify consumers before writing:

- Production use: the surface is called, installed, linked, or cited.
- Dead weight: only tests or docs reference it, or nothing links it.
- Ambiguous: reached only by a pointer in its own file.

Reject or downgrade when a consumer exists, a recorded decision justifies the surface, removal would force unrelated churn, or the idea is correct but tiny — then add a targeted `TODO(tag)` instead.

## Record the worthwhile ones

Write one proposal per durable candidate into your repository's decision-record system, or an inline `TODO(tag)` for a small local cleanup. Each proposal names the surface, cites the files, states the consumer evidence, makes the strongest counterargument legible, and gives an observable acceptance criterion.

## Validation

Run your repository's checks for the touched surfaces and `git diff --check`. Summarize candidates added, consolidated, or rejected, the areas surveyed, and what was excluded.
