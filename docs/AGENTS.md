# AGENTS.md — The documentation standard

This file defines document structure, writing rules, and the one-home-per-fact taxonomy for this repository. Use [`doc-standards`](../skills/agent/doc-standards/SKILL.md) for placement and validation, and [`prose-standard`](../skills/agent/prose-standard/SKILL.md) for required coverage and editorial judgment. Agent Notes ([.agents/notes/README.md](../.agents/notes/README.md)) carry decision rationale; they follow their own format but obey the writing rules below.

## Document structure

These rules apply to human-facing documentation. Agent Notes remain outside the structure rules but inside the writing rules.

Classify every in-scope document as a **tutorial** or a **reference**. A tutorial leads through ordered steps to an observable outcome and introduces only what each step needs. A reference supports lookup within an explicit scope without requiring sequential reading. Separate substantial mixed forms; label a small secondary form as its own section.

A document's subject and tree position fix its scope: describe the subject at full detail and direct children only by purpose and responsibility; link to the owning descendant for lower-level detail. A reference may be exhaustive only about its own subject. A tutorial establishes prerequisites before dependent concepts and moves optional advanced material to a later tutorial or reference.

Author in this order: locate the document in the tree; set its permitted detail; choose tutorial or reference; order concepts by prerequisite; relocate descendant-owned detail; replace lower-level explanations with links to their owners.

## The tier taxonomy: one home per fact

Each fact has one home — the tier whose job it is; elsewhere, link there.

| Tier | Job | Does NOT belong there |
|---|---|---|
| Root `AGENTS.md` | Standing orders: rules an agent needs in context every session, one to three lines each, linking its home | Stories, worked examples, procedures, anything restated from a linked home |
| Subtree `AGENTS.md` (`docs/`, `.agents/notes/`) | Orders specific to that subtree | Repo-wide rules the root file already carries |
| Skill `SKILL.md` | The installable capability: frontmatter trigger plus the workflow steps | Deep, conditional, or platform-specific reference (→ `references/`), rationale that a docs page owns |
| Skill `references/` | Disclosed reference loaded only when the skill's pointer fires | Content every run needs (that stays in `SKILL.md`) |
| [Agent Notes](../.agents/notes/README.md) | Decision records: the why, what was given up, and required verification | Migration plans, acceptance checklists, and spec-speak once a decision has shipped |
| [postmortem/](postmortem/README.md) | Incident stories — the only tier where war-story narrative belongs | Decision rationale (→ Agent Notes) |
| `README.md` | User-facing repository entry: install, map, commands | Contributor procedure detail, decision history |
| `docs/` | Repo-level standards and conventions (this file, [i18n](i18n/README.md)) | Skill-specific workflows (→ the owning `SKILL.md`) |
| `scripts/` | Deterministic helpers and their behavior | Rationale for why a script exists (→ an Agent Note) |

Placement: rationale → Agent Notes; procedures → the owning skill or README; bugs → postmortems; standards → `docs/`; standing orders → root `AGENTS.md` with a rationale link.

## Writing rules

- **Document current state, not change history.** Avoid "previously / now / no longer", PR numbers, and stack positions in durable prose; name the live mechanism. Put change stories in commits, PRs, or Agent Notes.
- **Every non-trivial change adds or updates at least one Agent Note in the same PR.** Only purely mechanical or local edits are exempt ([scope](../.agents/notes/README.md#when-to-write-one)).
- **One physical line per paragraph** (`git diff --check`): use editor soft-wrap. Code blocks, tables, and list structure keep their formatting.
- **Comments and descriptions state contracts, not reasoning transcripts.** Preserve behavior, failure, timing, ownership, modality, exceptions, and consequences; delete narration, walkthroughs, and code restatement. Use [`prose-standard`](../skills/agent/prose-standard/SKILL.md) for details.
- **Write directly.** Name actors and facts. Reserve emphasis for the clause that changes behavior. Prefer the exact check, file, or rule over a metaphor.
- **Cross-reference with relative Markdown links**, never bare filenames or note numbers.

## Word budgets

Budgets are guardrails, not reduction targets. Keep the always-loaded files small and push detail behind pointers:

- Root `AGENTS.md` and each `SKILL.md` stay concise; move detailed, conditional, or platform-specific material into `references/` or the owning docs page.
- A `SKILL.md` description stays under one short trigger paragraph; the body covers the workflow, not the rationale.
- Ceilings are enforced by `node scripts/verify-doc-budgets.mjs` from `scripts/doc-budgets.manifest.json`; raise a ceiling only when the words need the space.

## The slop checklist

Hunt these in any doc; [`doc-standards`](../skills/agent/doc-standards/SKILL.md) runs this list as an audit:

- The same rule stated in more than one home. Grep a distinctive phrase; keep one home and link the rest.
- Narrated history or war stories ("previously", "now", "no longer", "renamed", PR numbers). State the current fact; link an Agent Note or postmortem when needed.
- Implementation-status annotations in prose ("implemented!", "future: …"). Status rots; the tree and manifests carry it.
- Hand-restated inventories of skills, scripts, or checks when the source or a generator is authoritative.
- Reasoning transcripts: step-by-step narration, proofs of obvious branches, rejected local alternatives. Keep the resulting contract or durable rationale; delete the path used to derive it.
- Rationale repeated beside sibling methods instead of once at the owning rule or helper.
- Paragraph walls: one paragraph carrying several rules and parenthetical asides. Split it or demote the detail to its home.
- Emphasis inflation: bold, CAPS, or "critically" everywhere means nothing stands out.

## Validation

Run `npm run doc-gates` for the documentation gates (pairing, note format, budgets, links, wrap, archive) and `.\scripts\validate-skills.ps1` for skill frontmatter and manifest consistency. See [README.md](../README.md) for the exact commands.
