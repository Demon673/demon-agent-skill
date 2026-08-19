---
name: translate-docs
description: Use when maintaining the English ↔ Simplified Chinese bilingual documentation pairs in a repository — writing a new counterpart, applying a minimal update to keep an existing pair in sync, or verifying pair consistency after an edit.
---

# Translating documentation

## Invocation boundary

Run this workflow when the task is explicitly about maintaining bilingual pairs — a whole-document translation, a batch of new counterparts, or a requested pairing audit. It is model- and user-reachable on purpose, because the `ask-demon` cascade fires it after an earlier flow step touched docs or notes. Routine counterpart updates for a small prose change are made directly in one pass after loading the repository's terminology table; they do not need this skill.

## What this skill is

**This skill is guidance, not a translation memory.** Both languages carry equal authority — a change is authored in either one, and that side is the source for that update. The rules below say what must hold, not how to phrase any sentence; phrasing judgment is yours, terminology is not.

## Triage by change type

- **Update** (pair exists, one side edited): follow [the update path](#the-update-path-briefing-driven). It is briefing-driven and deliberately cheap: no guidance-corpus re-reading, no git archaeology, smallest counterpart edit. Never re-translate a whole document to apply an update — a minimal update preserves the reviewed phrasing of everything that did not change.
- **New pair** (no counterpart yet): follow [the whole-document path](#the-whole-document-path-new-pairs).
- **Deleted or renamed doc**: delete or rename the counterpart and the `.i18n.yaml` consistency record alongside it — the pairing gate reports an incomplete pair otherwise.

Frozen archived notes are not translation work; never update either side after archival.

## The update path (briefing-driven)

1. **Generate the briefing.** Run the repository's translation-brief script for the pair when it has one (no arguments briefs every out-of-sync pair); without one, derive the changed units by diffing the edited side against the last-confirmed counterpart. The briefing maps the change at the narrowest safely aligned granularity — changed Markdown units (paragraph, table row, list item, heading), then whole heading sections, then whole document — and carries each changed unit's last-confirmed source, current source, and current counterpart text, plus the terminology rows the change touches.
2. **Mechanical-only diff? Apply it.** When every change lies inside code fences the pair shares byte-identically, the repository's translation-brief script, when present, with its apply flag splices the edited fences into the counterpart and structure-validates the result before writing — no subagent, no hand-editing.
3. **Prose diff? Delegate to a subagent, passing the briefing** (or the command to generate it). The briefing is the translator's whole working set — the subagent does not re-read the guidance corpus or re-derive the diff. It escalates to the whole-document path's sources of truth only when the briefing leaves a decision genuinely unanswerable — an unlisted term with no precedent nearby, or a whole-document briefing, which always means reconciling by hand under the repository's translation rules.
4. **Smallest edit that covers the diff.** Preserve the reviewed phrasing of everything the diff does not touch, then verify the changed hunks clause by clause against the source: nothing added, nothing dropped, terminology per the table, code spans verbatim.
5. **Record and verify, scoped.** Re-record the pair with the pairing gate's `--write <pair>` flag, then run the scoped check on that pair. The corpus-wide check still runs in the repository's documentation gates; do not run it per update.

## The whole-document path (new pairs)

When translations need to be written from scratch, the orchestrating agent does not translate: spawn a subagent to do the translation work. The translator reads the sources of truth below first, then translates the whole file into the other language — section by section for long documents, keeping each section's structure locked to the source as you go.

### Sources of truth (read, don't re-summarize)

- The repository's pairing contract — the pairing rules, switchers, the `.i18n.yaml` consistency record's both-side blob hashes, scope, and exclusions.
- The repository's translation rules — faithfulness, structure preservation, terminology discipline, typography, and the MUST/SHOULD levels.
- The repository's terminology table — binding in both directions. Load it before translating, not when a term feels uncertain; the terms you don't notice are the ones that drift.
- `prose-standard` — required prose coverage and editorial judgment. Apply it to both sides without adding or dropping source propositions.

### Translate

- **Pass 1 — write, don't transpose.** Read a semantic unit, then restate it as a native technical author in the register of the nearest style sample the repository keeps. Preserve the required frame without forcing sentence-by-sentence correspondence.
- **Pass 2 — verify against the source, clause by clause.** Confirm nothing was added or dropped, every term follows the table, and each code span survived verbatim. Fix by rewriting the sentence natively, not by patching words in.
- **Read the completed counterpart alone** and rewrite phrasing whose awkwardness only shows in isolation. Write only the final text, never drafts.
- Every term in the terminology table renders exactly as listed. An unlisted term needs a citable precedent or stays English with a short gloss; never invent a rendering inline.
- Code blocks are byte-identical across the pair, comments included. Relative links keep their `.md` targets; only the switcher line links `.zh.md`.
- The pairing gate checks heading depths, fenced blocks, table row and column counts, list kinds and starts, list item counts, and link targets. In Pass 2, manually verify list and table order, noncanonical list numbering, inline code, emphasis, meaning, terminology, and tone.

## Find the work

- The pairing gate with `--list` prints every in-scope document as missing / out-of-sync / ok. Missing and out-of-sync rows are contract violations; the normal check rejects them.
- The repository's translation-brief script, when present, run with no arguments prints the briefing for every out-of-sync pair.
- In a change that edits paired docs, the work list is the diff itself: every changed side of a pair needs its counterpart updated and the pair re-recorded in the same change, and the gate goes red if you forget.

## Finish the pair

1. Switcher: `English | [中文](foo.zh.md)` after the English H1, `[English](foo.md) | 中文` after the Chinese H1 — add both for a new pair. Instruction files named `AGENTS.md` and `SKILL.md` never get a counterpart.
2. Record consistency: the pairing gate's `--write <pair>` flag recomputes and records both sides' blob hashes in the `.i18n.yaml` consistency record. The record's diff is the reviewable statement "I confirmed these two say the same thing" — run it only after you actually have.
3. No manifest entry is needed for an ordinary document: every in-scope source requires a pair. Change the repository's pairing manifest only when the owning policy documents a genuine generated, instructional, or bilingual-by-construction exclusion.
4. Before the change: the touched pairs are green under the scoped check; the repository's documentation gates (which include the corpus-wide pairing check plus wrap and link checks) run once per change, not inside each translation task.
5. Keep the change reviewable: state which pairs are new versus minimally updated and list any unlisted terms prominently.

## How to respond to translation review

Follow the review reporting guidance in `repo-standards-review`: evaluate each comment on its merits. For terminology comments, the terminology table is the contract — apply a reviewer's rendering decision to the terminology table, not only to one file.
