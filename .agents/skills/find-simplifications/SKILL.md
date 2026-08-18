---
name: find-simplifications
description: Use to find non-obvious simplification candidates in this repository's skills and docs — dead, duplicated, speculative, or over-built surface — and turn the worthwhile ones into proposed Agent Notes or inline TODO markers instead of a pile of thin guesses.
disable-model-invocation: true
---

# Finding simplifications

Turn a broad "find things to simplify" request into evidence-backed Agent Notes that remove or collapse surface across skills and docs. It is guidance, not a checklist: prefer a few well-proven candidates over a pile of thin guesses.

## Start with repo context

- Read [AGENTS.md](../../../AGENTS.md) and [docs/AGENTS.md](../../../docs/AGENTS.md); simplifications that fight the one-home-per-fact taxonomy need extra evidence.
- Use the [Agent Note tree](../../../.agents/notes/README.md) to understand intentional structure; a recorded decision needs new evidence to overturn, not just a "looks complex" flag.

## Survey broadly

Survey skills by category, then docs and notes. Start with the largest files, but do not let the first good candidate stop the survey. Use `rg` for exact names and distinctive phrases, then read call sites before classifying a surface as dead.

## What counts as a strong candidate

A strong candidate removes, folds, or demotes something real, with clear evidence that the current design costs more than it buys:

- A skill section, `references/` file, or script has no consumer and no load-bearing behavior.
- Two skills or docs restate the same rule; one home would serve with links.
- A `SKILL.md` body grew past its workflow and duplicates its `references/`.
- A description lists many near-synonym triggers that collapse to one branch.
- A script reimplements what a maintained tool or the shell already does.
- A rule or section protects an unused or removed surface.
- Documentation narrates change history or restates code instead of stating the current contract.

Thin candidates are usually not enough for an Agent Note: fixing one typo or flagging "this looks long" without consumer proof.

## Prove or reject each candidate

For every candidate, classify consumers before writing:

- Production use: a skill is installed and triggered; a doc or note is linked and cited.
- Dead weight: tests/docs are the only consumers, or nothing links the surface.
- Ambiguous: a `references/` file reached only by a pointer in its own `SKILL.md`.

Reject or downgrade when a consumer exists, an Agent Note justifies the surface, removal would force unrelated churn, or the idea is correct but tiny — then add a targeted `TODO(tag)` instead.

## Write the Agent Note

Create one file per durable proposal under `.agents/notes/proposed/{class}/yyyy-mm-dd-topic.md`, following the [note rules](../../../.agents/notes/README.md). Prefer this structure:

- `# Agent Note: <action-oriented title>`
- `Status: proposed`
- `## Problem`: name the current surface, cite files, state consumer evidence.
- `## Proposal`: say exactly what to remove, fold, or demote, including docs and references cleanup.
- `## Why not keep it?`: make the strongest counterargument legible.
- `## Acceptance criteria`: observable end state.
- `## Risks`: what the change gives up and why the tradeoff is still reasonable.

## Coalesce superseded notes

When a simplification makes an owning note obsolete, use [archive-agent-notes](../archive-agent-notes/SKILL.md) for retention judgment. A fully superseded note is consolidated into the current owner after its unique rationale, alternatives, and consequences are preserved and inbound links repaired; a partial supersession keeps both notes cross-linked.

## Validation

Run `npm run doc-gates` and `git diff --check`; for skill changes, also run `.\scripts\validate-skills.ps1`. Summarize candidates added, consolidated, or rejected, the areas surveyed, and what was excluded.
