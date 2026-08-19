---
name: archive-agent-notes
description: Use when adding, pruning, archiving, restoring, or reviewing Agent Notes — checking new notes for superseded active records, classifying implemented notes by future decision value, deleting rejected notes that no longer prevent a tempting mistake, and moving low-value notes to the frozen archive.
---

# Archiving Agent Notes

Reduce the active decision corpus without erasing history that can still guide work. Judge every note semantically; word count and age are discovery aids, never archive criteria.

## Read the contracts

Read the repository's Agent Note rules, archive instructions, and the applicable lifecycle instructions before classifying. Use current skills, docs, newer notes, and inbound links to establish whether a rationale still owns or constrains anything.

## Check supersession when adding a note

Every new note triggers a scoped audit of active notes covering the same decision or mechanism. Classify each full or partial supersession while writing the new note: archive qualifying implemented pairs in the same PR, retain and cross-link partial supersessions, reject obsolete proposals, and delete rejected notes that no longer prevent a plausible mistake. Apply the consolidation rule when the new owner absorbs every unique proposition; do not defer a known match.

## Classify by future value

- **Implemented — keep active:** retain a note when its rationale, alternatives, negative guarantee, ownership boundary, or reintroduction condition is likely to guide a future change.
- **Implemented — archive:** archive a note when the shipped decision is complete and its body is unlikely to guide future work.
- **Proposed — never archive:** keep a live proposal active; if it is no longer worth pursuing, reject it with an honest reason.
- **Rejected — keep only as a guardrail:** retain a rejection only when the losing proposal remains a tempting, meaningful mistake.
- **Rejected — delete:** delete the whole pair when the rejected idea is obsolete or unlikely to prevent re-litigation. Repair or delete inbound links.

Do not archive toward a quota. Inspect every note in scope, classify analogous groups under one principle, and record genuinely borderline decisions.

## Archive one implemented pair

1. Move the complete `foo.md` and `foo.zh.md` pair from `implemented/{class}/` to `archived/{class}/`; `implemented` is deliberately absent from the archive path.
2. Make no body edits. Insert only `Archived: YYYY-MM-DD` immediately below `Status: implemented` in both files, using the same date on both sides.
3. Search for inbound links from active prose. Redirect them to current authority, retarget them to the archived path only when the historical snapshot is intentionally cited, or delete them. Never verify or repair links out of the archived note.

When inbound-link repair edited an active bilingual doc, hand the counterpart update to `translate-docs` so both sides stay in sync before the pairing gate.

After the pair is sealed, never edit, move, translate, reformat, or delete it. Archived notes remain valid inbound-link targets but are historical snapshots, not authority for current behavior.

## Validate and report

Run the repository's archive seal gate, then its documentation gates and `git diff --check`. Report active implemented notes kept, implemented notes archived, rejected notes kept/deleted, proposed notes rejected if any, and every genuinely borderline case with its chosen outcome.
