# Agent Note: Make maintenance checks and outputs reliable

Status: implemented

English | [中文](2026-10-30-close-maintenance-gaps.zh.md)

## Problem

A fresh host can receive hooks that reference gates it does not have. Empty skill identity fields can pass validation, root contribution and glossary links can escape checking, and regression tests can exist without running in CI. Routine counterpart edits can also trigger the extended translation workflow. A rejected GIF encoding can replace a valid output before its failure is reported.

## Decision

The setup template enables only staged whitespace checking. Optional documentation jobs require host-owned scripts, helpers, manifests, dependencies, and a successful gate run before activation. The [tooling port](../process/2026-08-20-absorb-dsh-tooling.md) retains its generic installer and optional-gate boundary.

The validator rejects empty names and descriptions after stripping whitespace. The Markdown link gate includes both root contribution and glossary pairs. `npm test` runs the Node entry-path checks, Python validator regressions, and real media tests; [CI](../../../../.github/workflows/gates.yml) prepares the validator environment and FFmpeg before running them.

Routine counterpart edits remain with the owning change and finish with pairing verification. `translate-docs` stays model- and user-reachable for explicit whole-document translations, batches, and pairing audits. This narrows the translation handoff in the [cooperation graph](../architecture/2026-08-19-wire-skill-cooperation.md) while preserving the [pack's shared entry points](../architecture/2026-08-19-package-maintenance-flow-as-pack.md) and the [extended translation machinery](../process/2026-08-20-restore-translate-docs-parity.md).

The GIF encoder validates a temporary sibling before publication. Forced output uses atomic replacement; ordinary output uses hard-link creation so a concurrently created target is preserved. Failed encoding or verification cleans the owned temporary file without changing the target. The [GIF port](../process/2026-08-20-absorb-record-browser-gif.md) keeps its capture and publication rules.

## Alternatives considered

**Ship every documentation gate with setup.** Rejected: scripts, manifests, parser dependencies, and repository conventions would become an unnecessarily large installation requirement. Optional jobs belong to hosts that provide those contracts.

**Check only text or metadata presence.** Rejected: isolated CLI fixtures must demonstrate acceptance and rejection through the real validator, link checker, and hook runner. Media tests must observe the output and original target after failure.

**Replace a GIF before validation.** Rejected: a nonzero exit does not restore a valid file that was already overwritten. Temporary output keeps the original intact until success.

## Consequences

Fresh-host hooks run with Git alone, while hosts with documentation tooling retain stronger optional checks. Routine translation avoids an unnecessary delegated workflow. CI requires Python with PyYAML and FFmpeg; default GIF publication requires hard-link support and fails safely when the filesystem lacks it. The older notes retain independent packaging, translation, and tooling rationale and remain active with their changed mechanisms cross-linked here.
