---
name: doc-standards
description: Use when writing, moving, reviewing, or auditing documentation in this repository — choosing hierarchy and detail, separating tutorials from references, trimming doc slop, deciding where a fact belongs, or responding to a request like "improve the docs", "audit the docs", or "this doc is too long".
---

# Applying the Documentation Standard

The rules live in [docs/AGENTS.md](../../../docs/AGENTS.md). This workflow covers placement, corpus audits, and validation across Markdown, skill frontmatter, and Agent Notes. It is guidance, not a script; use [prose-standard](../prose-standard/SKILL.md) for required coverage and editorial judgment, and never treat length alone as a defect.

## Sources of truth (read, don't re-summarize)

- [docs/AGENTS.md](../../../docs/AGENTS.md) — structure, tutorial/reference forms, taxonomy, budgets, and the slop checklist.
- [.agents/notes/README.md](../../../.agents/notes/README.md) — when a decision earns an Agent Note, how to file it, and what goes inside one.
- [docs/i18n/README.md](../../../docs/i18n/README.md) — the bilingual pairing rules; editing either side of a pair obligates the counterpart in the same change.
- Root [AGENTS.md](../../../AGENTS.md) — the standing orders this standard protects.

## Review structure before prose

Apply the authoring order to every human-facing document in scope. Do not apply this structural pass to Agent Notes — they follow their own format.

1. Locate the document in the tree. State its own subject and identify its direct children.
2. Set the permitted level of detail: full detail on the document's own subject, summarize direct children by purpose and responsibility, link deeper material to their owners.
3. Classify the document from its intended use, not its path. A tutorial leads through ordered work to an observable outcome; a reference supports lookup within an explicit scope.
4. For a tutorial, classify the starting reader and each concept as beginner, intermediate, or advanced; trace prerequisites and move optional advanced detail out.
5. Split substantial mixed forms; put a small secondary form in a clearly labeled section.

Then check constraints that make placement expensive:

- Paired docs cost a `.zh.md` counterpart update on every edit — prefer an unpaired home for content that will churn.
- Before renaming or moving a doc, grep for inbound references: a move is atomic (remove, add, fix every inbound link in one change).
- A `SKILL.md` description is a discovery surface; keep it trigger-focused and leave the workflow to the body.

## Audit the corpus

Hunt the slop checklist with the cheapest probes first:

1. Measure: `git ls-files '*.md' | xargs wc -w | sort -rn | head -30` to spot unbudgeted outliers.
2. Hunt reasoning-transcript leakage with [trim-cot-leakage](../trim-cot-leakage/SKILL.md).
3. Hunt duplication by grepping distinctive phrases; keep one home and link the rest.
4. Replace hand-written inventories with the authoritative tree or script.
5. In `implemented/` Agent Notes, remove migration plans, acceptance checklists, and future-tense spec language; keep the verification contract and named coverage gaps.
6. If removing prose changes a promised behavior rather than its explanation, record a proposed Agent Note first (see [find-simplifications](../find-simplifications/SKILL.md)).

Exclude `.agents/notes/archived/` from audits and edits; active prose may repair or delete an inbound link, but never follow a cleanup into the frozen target.

## Validation

Run `npm run doc-gates` for the documentation gates, `.\scripts\validate-skills.ps1` for any changed skill, and `git diff --check`. The PR body should explain any deliberately long document and list the checks run.
