# Agent Note: Mirror the show-me skill

Status: implemented

English | [中文](2026-09-04-mirror-show-me-skill.zh.md)

## Problem

The repository had no visual explanation capability: an agent could not be asked to explain the current topic with concise diagrams, code-shape sketches, and focused HTML artifacts. A one-off copy of the upstream skill would drift from its source and would drop the license.

## Decision

Publish the upstream [`show-me` SKILL.md](../../../../skills/agent/show-me/SKILL.md) byte-for-byte at `skills/agent/show-me`, retain the upstream [`LICENSE`](../../../../skills/agent/show-me/LICENSE.upstream) as `LICENSE.upstream`, and add the local metadata: an [`agents/openai.yaml`](../../../../skills/agent/show-me/agents/openai.yaml) and an entry in the plugin [manifest](../../../../.claude-plugin/plugin.json). A manual [`sync-show-me.ps1`](../../../../scripts/sync-show-me.ps1) resolves a ref (defaulting to `main`) to the current commit, downloads both files, validates SKILL.md, and checks both SHA-256 hashes. `-Check` detects drift without writing; a normal run copies only changed or missing mirrored files and preserves local additions.

## Alternatives considered

- **Absorb and generalize the skill.** Rejected: the request requires a verbatim mirror, not a generalized port.
- **Use a git submodule.** Rejected: submodules add packaging and install complexity for a single skill.
- **Schedule a GitHub Action.** Rejected: the request asked for a manual sync.

## Consequences

- Upstream content ships verbatim, so the platform-specific `open` command embedded in the SKILL.md remains uncorrected.
- Synchronization is manual; the mirror drifts until `sync-show-me.ps1` is run.
- The upstream license is retained for attribution.
- Local Codex metadata and the plugin manifest entry are not upstream-owned.
