---
name: repo-standards-review
description: Review a pull request or a branch against the repository's standards — skill frontmatter and body, docs and bilingual pairs, Agent Notes, and scripts — and report blockers separately from suggestions, prioritizing correctness and required behavior over style.
---

# Reviewing a repository against its standards

**This skill is guidance, not a complete checklist.** Verify the PR's live base and head, then read the diff and enough surrounding context to understand the design before judging. A short review with one substantiated blocker beats a list of nits.

## Sources of truth

- The repository's root `AGENTS.md`: skill authoring, validation, and quality-gate rules.
- The repository's documentation standard (usually `docs/AGENTS.md`): placement and prose discipline.
- `prose-standard`: required coverage and editorial judgment.
- `trim-cot-leakage` and `prune-prompt-pollution`: reasoning-transcript and prompt-pollution smells respectively.
- The repository's Agent Note rules (usually `.agents/notes/README.md`): format and scope. Treat disagreement with a note as a design discussion, not an automatic veto.
- The repository's bilingual pairing contract and terminology table (usually `docs/i18n/README.md` and `docs/i18n/terminology.md`).

## Blocking requirements

1. **New prose receives semantic review.** Critically review every added or changed `SKILL.md`, description, doc, Agent Note, and comment with `prose-standard`. Automated checks do not establish coverage, accuracy, or placement.
2. **Skills follow the layout and manifest.** A new skill has a valid `name` (hyphen-case) and a trigger-focused `description`; it is listed in the skill manifest; and its install name is unique across categories. Flag platform-specific metadata, runtime branding, and hard local paths unless justified.
3. **Bilingual pairs update together.** A change to either side of a pair updates the counterpart and keeps both switcher lines; the documentation gates are green. A green pairing check does not prove translation quality.
4. **Every non-trivial change carries an Agent Note** in the same diff, updated to shipped present-tense state when a proposal is implemented.
5. **Required evidence exists.** The author ran the relevant checks for the diff (documentation gates, skill validator, `git diff --check`); review covers the semantic gaps those cannot detect.

## Manual checks

- **Intent and contract:** trace both sides of every changed rule or workflow; confirm the change matches the PR description and any Agent Note.
- **Trigger quality:** a description's triggers are behavior-based and one per distinct branch, not a keyword pile or repo identity the body already carries.
- **One home per fact:** no rule restated in a second location without a link to its owner; no reasoning transcript, change narration, or duplicated rationale.
- **Scope and necessity:** challenge speculative generality and unrelated edits; each change maps to a current consumer or a recorded decision.
- **Scripts:** deterministic helpers handle failures loudly and state non-obvious contracts; generated files are not hand-edited.
- **Test/validation strength:** assertions fail on the intended regression rather than restating the implementation.

## Reporting findings

State the defect, location, impact, and evidence. Separate blockers from suggestions and omit issues a green check already enforces. When receiving review, verify each claim and fix or rebut it on technical grounds without performative agreement. When the review surfaces dead, duplicated, speculative, or over-built surface, hand those candidates to `find-simplifications` to turn them into proposed Agent Notes or `TODO(tag)` markers.
