# Agent Note: Protect maintenance inputs and source data

Status: implemented

English | [中文](2026-10-30-protect-maintenance-inputs.zh.md)

## Problem

An installation destination can alias the skill source tree. An incomplete upstream refresh can claim a new revision while retaining older reference files. Offline API lookup can reorder arguments, fail on a Windows output encoding, or return an entire enum for a single matching constant.

## Decision

The [PowerShell](../../../../scripts/link-skills.ps1) and [Bash](../../../../scripts/link-skills.sh) installers resolve destination parents and reject targets inside or above the source tree before creating or replacing installed entries. On Windows, Bash delegates to PowerShell for the same reparse-point checks. An installed link remains replaceable without following its leaf target. Link installations reflect source edits immediately; copies require reinstalling, as described in [CONTRIBUTING](../../../../CONTRIBUTING.md).

The [reference refresh](../../../../skills/dota2/dota2-custom-game-dev/scripts/update_references.ps1) verifies required inputs and source provenance before changing bundled output, and carries the upstream license with its snapshot. The [source map](../../../../skills/dota2/dota2-custom-game-dev/references/upstream-source-map.md) owns the file inventory and refresh policy. Formatting follows the [snapshot normalization decision](2026-10-30-normalize-vendor-markdown.md); the [synchronization decision](../process/2026-10-30-sync-upstream-skills.md) retains the source baselines.

The [query helper](../../../../skills/dota2/dota2-custom-game-dev/scripts/search_dota2_api.py) preserves upstream argument positions and writes UTF-8 JSON. A constant-value match returns matching enum members; an enum-name match retains the full enum. Real CLI and isolated refresh tests verify these behaviors independently of the caller's output encoding and commit-signing configuration.

These safeguards complement the [maintenance checks and publication decision](2026-10-30-close-maintenance-gaps.md), which retains its hook, translation, and GIF ownership rules.

## Alternatives considered

**Trust the destination spelling.** Rejected: a directory alias can address the source tree under another path, and force replacement must not delete source data.

**Warn and publish an incomplete refresh.** Rejected: a successful exit and new commit identifier would describe mixed source revisions.

**Return every member of a matching enum.** Rejected: a lookup for one constant can consume a large part of an agent's context without supplying more relevant results.

## Consequences

Unsafe install targets and incomplete source inputs fail before changing existing output. Ordinary link and copy installation retain their explicit replacement behavior. Enum-value results are narrower; callers needing the complete enum query its name. Existing version, formatting, and publication decisions remain active because their independent guarantees still apply.
