---
name: code-review
description: Review a pull request or a branch in this repository against its standards — skill frontmatter and body, docs and bilingual pairs, Agent Notes, and scripts — and report blockers separately from suggestions, prioritizing correctness and required behavior over style.
---

# Reviewing a PR

**This skill is guidance, not a complete checklist.** Verify the PR's live base and head, then read the diff and enough surrounding context to understand the design before judging. A short review with one substantiated blocker beats a list of nits.

## Sources of truth

- Root [AGENTS.md](../../../AGENTS.md): skill authoring, validation, and quality-gate rules.
- [docs/AGENTS.md](../../../docs/AGENTS.md): documentation placement and prose discipline.
- [prose-standard](../prose-standard/SKILL.md): required coverage and editorial judgment.
- [.agents/notes/README.md](../../../.agents/notes/README.md): Agent Note format and scope. Treat disagreement with a note as a design discussion, not an automatic veto.
- [docs/i18n/README.md](../../../docs/i18n/README.md) and [terminology.md](../../../docs/i18n/terminology.md): bilingual pairing and terminology.

## Blocking requirements

1. **New prose receives semantic review.** Critically review every added or changed `SKILL.md`, description, doc, Agent Note, and comment with [prose-standard](../prose-standard/SKILL.md). Automated checks do not establish coverage, accuracy, or placement.
2. **Skills follow the layout and manifest.** A new skill has a valid `name` (hyphen-case) and a trigger-focused `description`; it is listed in [.claude-plugin/plugin.json](../../../.claude-plugin/plugin.json); and its install name is unique across categories. Flag platform-specific metadata, runtime branding, and hard local paths unless justified.
3. **Bilingual pairs update together.** A change to either side of a pair updates the counterpart and keeps both switcher lines; `npm run doc-gates` is green. A green pairing check does not prove translation quality.
4. **Every non-trivial change carries an Agent Note** in the same diff, updated to shipped present-tense state when a proposal is implemented.
5. **Required evidence exists.** The author ran the relevant checks for the diff (`npm run doc-gates`, `.\scripts\validate-skills.ps1`, `git diff --check`); review covers the semantic gaps those cannot detect.

## Manual checks

- **Intent and contract:** trace both sides of every changed rule or workflow; confirm the change matches the PR description and any Agent Note.
- **Trigger quality:** a description's triggers are behavior-based and one per distinct branch, not a keyword pile or repo identity the body already carries.
- **One home per fact:** no rule restated in a second location without a link to its owner; no reasoning transcript, change narration, or duplicated rationale.
- **Scope and necessity:** challenge speculative generality and unrelated edits; each change maps to a current consumer or a recorded decision.
- **Scripts:** deterministic helpers handle failures loudly and state non-obvious contracts; generated files are not hand-edited.
- **Test/validation strength:** assertions fail on the intended regression rather than restating the implementation.

## Reporting findings

State the defect, location, impact, and evidence. Separate blockers from suggestions and omit issues a green check already enforces. When receiving review, verify each claim and fix or rebut it on technical grounds without performative agreement.
