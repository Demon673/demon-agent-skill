# Agent Note: Offer a Claude Code status line during setup

Status: implemented

English | [中文](2026-10-14-optional-claude-statusline.zh.md)

## Problem

A personal status-line command depends on local script and plugin paths, making it hard to reuse. Its transcript scan duplicates session state that current Claude Code supplies directly. A setup flow that replaces the single statusLine command can also erase another status-line tool's configuration or starve it of stdin.

## Decision

[setup-demon-skills](../../../../skills/agent/setup-demon-skills/SKILL.md) offers the status line only when the agent running setup is Claude Code. Other runtimes skip it. [The optional setup reference](../../../../skills/agent/setup-demon-skills/references/statusline.md) owns the inspection, approval, composition and restoration procedure; the renderer and installer are bundled scripts. Configuring the status line requires approval separately from repository scaffolding, and installing the skill pack remains the user's choice.

The renderer consumes the current [Claude Code payload](https://code.claude.com/docs/en/statusline): directory, model, live effort and session name on the first row; context usage and capacity with a twenty-cell bracketed bar using filled and shaded blocks, and estimated tokens remaining, cumulative running-session duration, and available five-hour and weekly quotas on the second. The Context segment changes color together from light green through dark yellow to red as usage rises; the empty track remains neutral and dimmed. The five-hour quota includes its reset countdown when supplied and is omitted after expiry. Unavailable values without a retained measurement are omitted, control characters in labels are stripped, and active Ponytail state adds a badge without a plugin-path dependency. Transcript scanning is unnecessary for this payload contract.

A session-scoped numeric cache distinguishes unavailable measurements from valid zero values. Claude Code clears `current_usage` after compaction until the next API response; retaining the last context snapshot avoids a false zero while `(last)` identifies its old measurement and token estimate. Duration can retain a missing measurement too. Quota snapshots persist only briefly with an unexpired reset timestamp. Valid decreases and zero values update the display immediately; complete measurements replace snapshots. A percentage without capacity leaves the last complete snapshot intact without extending its lifetime, avoiding estimates from measurements taken at different times. Model or capacity changes invalidate incompatible context. Identity fields stay live. [The setup reference](../../../../skills/agent/setup-demon-skills/references/statusline.md) owns retention limits and cache placement.

An existing status line is kept unless the user selects composition or replacement. Composition replays the same JSON bytes to the original command under its explicitly selected shell, preserves its output on separate rows, and bounds its wait to two seconds. Padding and refresh interval are retained. Composition keeps the existing Vim-mode visibility setting; replacement restores the native indicator because this renderer does not draw it. The installer records the original and installed configurations, backs up settings, and stops if another tool has changed statusLine. Restoration follows the same ownership check and leaves unrelated settings intact.

## Alternatives considered

- **Configure every agent runtime.** The status-line payload and setting belong to Claude Code; other runtimes need no prompt or adapter.
- **Create a separate status-line skill.** The requested entry is setup's optional prompt; a disclosed reference keeps one reusable procedure without another discovery entry.
- **Concatenate commands sharing stdin.** The first renderer can consume all input; replaying the bytes gives each renderer a complete payload.
- **Overwrite an existing command by default.** Preserving it and asking about composition or replacement keeps other status-line tools under the user's control.
- **Treat every zero as missing, or merge whole prior payloads.** Zero and decreases are valid after resets and compaction; reusing identity fields would hide live edits. Only unavailable resource measurements are retained, with an explicit last-measurement label.

## Consequences

- Python 3 is required only for users who opt into this status line. Config paths are resolved at installation; no personal script or plugin path is distributed.
- Composition can repeat fields the original tool already displays. A failed or slow prior command is omitted while the Demon row remains visible; neither wrapper composition nor restoration promises to merge concurrent external edits.
- [Isolated acceptance checks](../../../../skills/agent/setup-demon-skills/scripts/test-statusline.py) cover live fields, consecutive missing measurements, session isolation, valid zeros and decreases, quota expiry, cache failures, input replay, display-option preservation, repeated installation, restoration, and refusal after external edits. Real terminal rendering and shell selection are verified during an approved installation.
