# Agent Note: Package the maintenance flow as a Matt-style pack

Status: implemented

English | [中文](2026-08-19-package-maintenance-flow-as-pack.zh.md)

## Problem

The four flow skills — `find-simplifications`, `archive-agent-notes`, `repo-standards-review`, `translate-docs` — lived in the internal `.agents/skills/` set, bound to this repository's paths and therefore not installable as part of the published pack. The pack also lacked the two structural skills Matt's suite uses — a router and a setup skill — so there was no entry point into the flow.

## Decision

Publish the flow as a coordinated pack. Move the four flow skills into `skills/agent/`, decouple them (repo-specific paths generalized to "your repository's …", sibling handoffs by name), and add two entry skills: `ask-demon` (a user-invoked router that draws the maintenance flow, prose tool layer, and standalone skills) and `setup-demon-skills` (scaffolds the Agent Note tree and bilingual pairing convention). Cross-skill references are by name — the Matt pattern — so the pack installs together and resolves.

## Alternatives considered

- **Keep the flow internal and bound.** Rejected: the goal is an installable pack that complements Matt's skills, not repo-internal tooling.
- **Make each skill fully self-contained with no cross-references.** Rejected: Matt's pack works because skills reference each other by name; a coordinated flow needs those handoffs, and installing the pack together resolves them.
- **Fold the flow into Matt's engineering loop.** Rejected: Matt owns grill → spec → tickets → implement; this pack owns docs/Agent-Note maintenance and game work, which Matt does not cover.

## Consequences

- The published manifest grows from 11 to 17 skills; the internal `.agents/skills/` set is empty and removed.
- `ask-demon` is the single entry point; the maintenance flow cascades `repo-standards-review` → `find-simplifications` → `archive-agent-notes` → `translate-docs`.
- The historical "internal vs published" notes are superseded by this decision; their links now point at `skills/agent/`.
