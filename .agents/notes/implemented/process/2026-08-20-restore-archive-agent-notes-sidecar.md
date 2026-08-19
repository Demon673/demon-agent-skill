# Agent Note: Restore the archive-agent-notes sidecar handling

Status: implemented

English | [中文](2026-08-20-restore-archive-agent-notes-sidecar.zh.md)

## Problem

The published `archive-agent-notes` moved and deleted Agent Notes as `foo.md` + `foo.zh.md` pairs, but this repository's notes are bilingual triplets — `foo.md` + `foo.zh.md` + `foo.i18n.yaml` consistency record — and the archive gate (`verify-archived-agent-notes.mjs`) checks that record against the current git blob hashes of both sides. The port dropped the deepseek-harness sidecar step: the archive step moved only the two language files, the rejected-delete and consolidation steps deleted only the pair, and no step re-recorded the consistency record after the two metadata-only `Archived:` edits. A moved or deleted note would therefore leave or lose its `.i18n.yaml` inconsistently, and an archived triplet would fail the sidecar hash check.

## Decision

Restore the sidecar step in `archive-agent-notes`, generalized: the unit moved or deleted is always the complete triplet, and an edited pair's consistency record is re-recorded mechanically through the repository's pairing recorder in write mode (in this repository, `node scripts/verify-translation-pairing.mjs --write <en-path>`). The archive step inserts `Archived: YYYY-MM-DD` below `Status: implemented` in both language files only, re-records the consistency record for those two metadata-only edits while the note is still in `implemented/`, then moves the complete triplet to `archived/`. The supersession paragraph archives triplets, the rejected-delete step deletes the whole triplet, and the consolidation rule is stated as deleting the absorbed triplet whole. "Validate and report" adds the seal-then-verify order: seal the archive manifest in append-only write mode, then run the archive gate, the documentation gates, and `git diff --check`. The pairing recorder and archive seal gate stay named generically, with this repository's concrete commands as named examples. This note realizes the `archive-agent-notes` item of the set-level disposition in [2026-08-20-absorb-dsh-skill-set](2026-08-20-absorb-dsh-skill-set.md).

## Alternatives considered

- **Keep "pair" and add only the re-record step.** Rejected: "pair" under-specifies the unit for consolidation and rejected-delete too; every move that relocates or deletes a note must carry its `.i18n.yaml`, so the term is "triplet" wherever the unit moves.
- **Re-record after the move, targeting the archived path.** Rejected: the pairing recorder refuses out-of-scope (archived) paths, so the re-record must run while the note is still in `implemented/`, before the move; `git mv` preserves content, so the hashes stay valid after relocation.
- **Re-record by editing the `.i18n.yaml` hashes by hand.** Rejected: the pairing recorder computes git blob hashes deterministically; hand-editing invites drift and bypasses the recorder the gate trusts.
- **Name deepseek-harness's pnpm commands verbatim.** Rejected: this repository runs its own node scripts; the concrete commands stay as named examples of the generic "pairing recorder" and "archive seal gate", not as host facts.

## Consequences

- `skills/agent/archive-agent-notes/SKILL.md` now moves and deletes triplets, re-records the consistency record after the metadata-only `Archived:` edits, and seals the archive before verifying.
- The archive gate's sidecar hash check is satisfied by the re-record step, so a correctly run archive passes `verify-archived-agent-notes.mjs` without hand-touching hashes.
- The re-record runs while the note is still in `implemented/`; the pairing recorder's out-of-scope rejection for archived paths is why the step precedes the move rather than follows it.
- This note's own triplet is recorded with the pairing recorder, exercising the command the skill now documents.
