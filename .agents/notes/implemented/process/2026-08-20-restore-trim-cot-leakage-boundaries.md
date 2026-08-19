# Agent Note: Restore the trim-cot-leakage not-leakage boundaries

Status: implemented

English | [中文](2026-08-20-restore-trim-cot-leakage-boundaries.zh.md)

## Problem

The published `trim-cot-leakage` kept the taxonomy, the one test, and a six-item keep list from `dsh-trim-cot-leakage`, but condensed away the "What is not leakage" boundary items that prevent false positives: runtime old/new states, historical stage names inside a note's change-story sections, project voice and genre forms, and postmortems as a sanctioned citation tier. The workflow also dropped the `vendor/` and recorded-fixtures-and-snapshots exclusions, keeping only archived notes. An unaided pass following the skill would delete durable references and keep dead ones — the skill's own warning against that failure mode was removed with the boundary it names.

## Decision

Restore the full "What is not leakage" boundary list in `skills/agent/trim-cot-leakage/SKILL.md`, generalized. Host-neutral wording replaces deepseek-harness specifics: lint-disable `-- reason` clauses, coverage-ignore reasons, and empty-catch explanations stand in for the oxlint example, and design-artifact names (a Figma frame) join standards sections (RFC 9110 §10.1.5) as a named example of external resolution. The 8-class taxonomy and the one test are unchanged. The workflow exclusion becomes "never touch `vendor/`, frozen archived notes, or recorded fixtures and snapshots". The boundary list stays inline — the restored body is 44 lines, under the ~60-line threshold that would move it into `references/`. This note restores, rather than reverses, the decoupling recorded in [2026-08-18-publish-general-skills](2026-08-18-publish-general-skills.md).

## Alternatives considered

- **Keep the six-item list and rely on the one test alone.** Rejected: the one test states resolvability but not the enumerated keeps; without them a pass deletes "the old connection drains before the new one accepts" as change narration and relocates issue references into Agent Notes.
- **Move the boundary list into `references/`.** Rejected: the restored body stays under the ~60-line threshold, the keep rules are the skill's core anti-false-positive contract rather than conditional reference, and the source also keeps them inline.
- **Restore the source's "examples calibrate each" pointer.** Rejected: this repository's `references/examples.md` is a condensed port without a "Keeps" section, so the pointer would over-claim; the keep rules are self-contained.

## Consequences

- `skills/agent/trim-cot-leakage/SKILL.md` grows from 40 to 44 lines and again names the false-positive boundary items a pass must keep.
- The skill stays host-agnostic: the enumerated keeps use host-neutral examples (RFC sections, Figma frame names, `vendor/`, `#1470`) rather than deepseek-harness paths or commands.
- The workflow exclusion now covers vendored code and recorded fixtures and snapshots, not only archived notes.
