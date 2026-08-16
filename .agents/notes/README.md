# Agent Notes

English | [中文](README.zh.md)

One kind of design document lives here. An **Agent Note** records a decision or proposal that affects this repository — the *why* and *what we gave up*, the parts skills and code cannot carry. This file defines where Agent Notes live, when to write one, and the in-file format.

## Layout and naming

Every Agent Note has two axes, both encoded in its **path** — `{lifecycle}/{class}/yyyy-mm-dd-topic-title.md`:

- **Lifecycle** (the top-level folder) is the note's status, and a note moves between folders as that status changes:
  - **`proposed/`** — proposals reviewed before implementation; not yet built (or only partly).
  - **`implemented/`** — the decision shipped. The file records what was decided and what was rejected, and is **kept current with what actually shipped**: when the repo later renames a skill or changes a default, the note is updated in the same change to match (facts only — paths, names, defaults — not the decision itself). See [implemented/AGENTS.md](implemented/AGENTS.md).
  - **`rejected/`** — the proposal was considered and declined. Keep it only while its rationale prevents a tempting, meaningful mistake; otherwise delete the complete pair.
- **Class** (the nested folder) is the kind of decision — see the Classification section below.

The date in the filename is when the topic was **first proposed**. Cross-references use relative Markdown links, never bare prose or note numbers, so they are checkable and survive moves between folders. Do not add a centralized index; browse the lifecycle/class folders.

## Classification

Each note belongs to one path-encoded class from this closed set:

| Class | What it covers |
|---|---|
| `feature` | A new user- or agent-facing capability. |
| `bug-fix` | Corrects a defect or closes a gap a postmortem surfaced. |
| `simplification` | Removes surface, prose, or code without adding a capability. |
| `architecture` | A structural decision about how the repo is organized and how skills relate. |
| `process` | Tooling, policy, or workflow around the repo — gates, naming, publishing — not runtime behavior. |
| `testing` | Validation and strategy. |

The `architecture` / `process` line: **architecture** is about the repo's structure; **process** is the surrounding tooling and workflow.

## Archiving and deletion

Archive an implemented note when the shipped decision is complete and its rationale is unlikely to guide future work. Keep it active when its alternatives, ownership boundary, negative guarantee, or reintroduction condition remains useful. Never archive a proposed note: reject an obsolete proposal. Keep a rejected note only while it prevents a plausible mistake; otherwise delete its English and Chinese files together. Use [`archive-agent-notes`](../../skills/agent/archive-agent-notes/SKILL.md) rather than word count, age, or a quota.

The archive is path-encoded as `archived/{class}/yyyy-mm-dd-topic-title.md`; `implemented` is deliberately absent because only implemented notes can enter it. An archival change moves the complete triplet, retains `Status: implemented`, inserts the same `Archived: YYYY-MM-DD` line immediately below that status in both files, and repairs or deletes inbound links. These are the only permitted content changes during archival. Once sealed, an archived triplet is frozen: never edit, translate, reformat, or delete it, and never treat it as authority for current behavior.

## When to write one

Every non-trivial change MUST add or update at least one Agent Note in the same PR. A change is non-trivial when it alters a skill's behavior, the repo's structure or conventions, process or tooling, or another decision a maintainer may reasonably revisit. A proposal for substantial future work starts in `proposed/`; a decision already made starts in `implemented/`. Updating the note that already owns the decision satisfies the rule; do not create a duplicate. A purely mechanical or local edit with no change to behavior, structure, process, or rationale is exempt.

A note is never edited into a *different decision*: supersede it with a new one and keep both cross-linked. A fully superseded note may be consolidated into the current owning note and deleted after its unique rationale, alternatives, and consequences are preserved and inbound links repaired; partial supersession keeps both notes cross-linked.

## The file format

Every active note follows one in-file format.

### The header block

The first three lines are exactly:

```markdown
# Agent Note: <title>

Status: <status>
```

followed by a blank line. `Status:` is one of three forms and must agree with the lifecycle folder:

- `Status: proposed`
- `Status: implemented`
- `Status: rejected — <why, in one line>`

The status carries no dates: the filename holds the first-proposed date. The rejection reason is the one status with content, because a rejected note's verdict is the fact readers come for.

### The body skeleton

Every note opens its body with `## Problem` — the motivation, written to stand without the solution. Recurring sections use these canonical names; bespoke technical sections remain free-form between the required ones.

#### `proposed/`

```markdown
## Problem
## Proposal
…bespoke sections…
## Alternatives considered
## Acceptance criteria
## Risks
```

`## Proposal` may speak in the future tense — plans and migration steps belong here while the work is unbuilt. `## Acceptance criteria` says what observable state means done. `## Risks` covers what could go wrong and what the change knowingly gives up.

#### `implemented/`

```markdown
## Problem
## Decision
…bespoke sections…
## Alternatives considered
## Consequences
```

`## Decision` describes shipped reality in the present tense. `## Consequences` records what the trade-off cost and bought. Proposal-era headings (`## Proposal`, `## Plan`, `## Acceptance criteria`) may not appear in an implemented note.

#### `rejected/`

A rejected note keeps whatever proposal-time sections it had, and the verdict lives on the `Status:` line.

### Alternatives considered — mandatory

Every note carries an `## Alternatives considered` section: each genuine alternative and why it lost, one bold-led paragraph per alternative. A decision recorded without what it beat invites re-litigation.

### Moving between lifecycles

Moving a file between lifecycle folders means updating the `Status:` line and re-satisfying that folder's skeleton in the same change. `proposed/` → `implemented/` rewrites `## Proposal` into a present-tense `## Decision` and folds `## Acceptance criteria` and `## Risks` into `## Consequences`. `proposed/` → `rejected/` only adds the reason to the `Status:` line and freezes the file.

### Chinese counterparts

A `.zh.md` counterpart mirrors its English sibling section-for-section under the [i18n contract](../../docs/i18n/README.md); the machine-checked header tokens (`# Agent Note: ` and `Status:`) stay in English verbatim. The pairing gate (`node scripts/verify-translation-pairing.mjs`) enforces the triplet's completeness, recorded blob hashes, switchers, and structural signature; review owns parity and translation quality.
