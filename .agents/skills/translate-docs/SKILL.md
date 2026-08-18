---
name: translate-docs
description: Use when maintaining the English ↔ Simplified Chinese bilingual documentation pairs in this repository — writing a new counterpart, applying a minimal update to keep an existing pair in sync, or verifying pair consistency after an edit.
disable-model-invocation: true
---

# Translating documentation

## Invocation boundary

Run this workflow when the task is explicitly about maintaining bilingual pairs — a whole-document translation, a batch of new counterparts, or a requested pairing audit. Routine counterpart updates for a small prose change are made directly in one pass after loading [terminology.md](../../../docs/i18n/terminology.md); they do not need this skill.

## What this skill is

**This skill is guidance, not a translation memory.** Both languages carry equal authority — a change is authored in either one, and that side is the source for that update. The rules below say what must hold, not how to phrase any sentence; phrasing judgment is yours, terminology is not.

## Triage by change type

- **Update** (pair exists, one side edited): follow [the update path](#the-update-path). Never re-translate a whole document to apply an update — a minimal update preserves the reviewed phrasing of everything that did not change.
- **New pair** (no counterpart yet): follow [the whole-document path](#the-whole-document-path-new-pairs).
- **Deleted or renamed doc**: delete or rename the counterpart alongside it — the pairing check reports an incomplete pair otherwise.

Frozen notes under `.agents/notes/archived/` are not translation work; never update either side after archival.

## The update path

1. Diff the edited side against what the counterpart still reflects; identify only the changed units.
2. Load [terminology.md](../../../docs/i18n/terminology.md) before touching wording; the terms you don't notice are the ones that drift.
3. Apply the smallest edit that covers the diff; preserve the reviewed phrasing of everything the diff does not touch.
4. Verify the changed hunks clause by clause against the source: nothing added, nothing dropped, terminology per the table, code spans verbatim.
5. Confirm both switcher lines still point at each other, re-record the pair with `node scripts/verify-translation-pairing.mjs --write <pair>`, then verify it is green.

## The whole-document path (new pairs)

Translate the whole file into the other language, section by section, keeping each section's structure locked to the source as you go.

### Sources of truth (read, don't re-summarize)

- [docs/i18n/README.md](../../../docs/i18n/README.md) — the pairing contract, switchers, scope, and exclusions.
- [docs/i18n/terminology.md](../../../docs/i18n/terminology.md) — the terminology table, binding in both directions. Load it before translating, not when a term feels uncertain.
- [prose-standard](../../../skills/agent/prose-standard/SKILL.md) — apply it to both sides without adding or dropping source propositions.

### Translate

- **Pass 1 — write, don't transpose.** Read a semantic unit, then restate it as a native technical author. Preserve the required frame without forcing sentence-by-sentence correspondence.
- **Pass 2 — verify against the source, clause by clause.** Confirm nothing was added or dropped, every term follows the table, and each code span survived verbatim. Fix by rewriting the sentence natively, not by patching words in.
- **Read the completed counterpart alone** and rewrite phrasing whose awkwardness only shows in isolation. Write only the final text, never drafts.
- Every term in [terminology.md](../../../docs/i18n/terminology.md) renders exactly as listed. An unlisted term needs a citable rendering or stays English with a short gloss; never invent a rendering inline.
- Code blocks are byte-identical across the pair, comments included. Relative links keep their `.md` targets; only the switcher line links `.zh.md`.

## Finish the pair

1. Switcher: `English | [中文](foo.zh.md)` after the English H1, `[English](foo.md) | 中文` after the Chinese H1. Instruction files named `AGENTS.md` and `SKILL.md` files never get a counterpart.
2. Re-record with `node scripts/verify-translation-pairing.mjs --write <pair>`, then run `node scripts/verify-translation-pairing.mjs` and confirm it is green.
3. Keep the PR reviewable: state which pairs are new versus minimally updated, and list any unlisted terms prominently.
