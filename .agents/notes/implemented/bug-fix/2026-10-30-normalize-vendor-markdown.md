# Agent Note: Normalize generated Markdown snapshot whitespace

Status: implemented

English | [中文](2026-10-30-normalize-vendor-markdown.zh.md)

## Problem

Upstream Markdown snapshots contain trailing spaces and terminal blank lines that fail the repository's full whitespace check. Cleaning only a generated file leaves the same defect in the next refresh; excluding vendor paths would leave a known failure outside the check.

## Decision

The [refresh script](../../../../skills/dota2/dota2-custom-game-dev/scripts/update_references.ps1) normalizes Markdown to LF, removes trailing spaces/tabs and terminal blank lines, and writes one final newline for non-empty content. JSON snapshots remain byte copies. `UPSTREAM.json` records the source revision and normalization policy, as described in the [source map](../../../../skills/dota2/dota2-custom-game-dev/references/upstream-source-map.md).

This replaces the whitespace exception in the [upstream synchronization record](../process/2026-10-30-sync-upstream-skills.md) while retaining its source baselines and adaptation boundaries. The isolated refresh regression runs the actual PowerShell script, checks UTF-8 text, indentation, empty Markdown, unchanged JSON bytes, and repeated-refresh stability.

## Alternatives considered

**Edit only the generated snapshots.** Rejected: the next refresh would copy the upstream whitespace back.

**Exclude vendor paths or relax Git's whitespace rules.** Rejected: the complete diff must pass the existing check.

## Consequences

Snapshot Markdown has a reproducible local format instead of byte equality with upstream. API data and non-whitespace text remain unchanged, and the full whitespace check includes generated snapshots. The earlier synchronization note remains active for its independent source and skill decisions.
