# Agent Note: Absorb the deepseek-harness skill set

Status: implemented

English | [中文](2026-08-20-absorb-dsh-skill-set.zh.md)

## Problem

The 2026-08-17 port from deepseek-harness rewrote nine maintenance skills into roughly half-size generic shells, leaving three majors drifts (pre-push-checks, prose-standard, translate-docs), two minor ones (archive-agent-notes, trim-cot-leakage), three absences (code-review, doc-site-sync, record-browser-gif), and a fusion note that overstated what doc-standards contributed. The user's goal is to learn the deepseek-harness development skill set while keeping one home per capability with Matt's pack.

## Decision

Absorb the deepseek-harness skill set per the disposition table in [docs/skills-map.md](../../../../docs/skills-map.md): restore the drifted skills as generalized 1:1 ports, absorb dsh-code-review as a checklist reference under repo-standards-review (the review flow stays with Matt's code-review), port record-browser-gif with its encoder, defer doc-site-sync until a host has a docs-site projection, and skip the Cordis product skills and the badge. Each skill change carries its own implemented note; this note records the set-level decisions and seams.

## Alternatives considered

- **Port code-review as a same-named skill.** Rejected: the name and trigger collide with Matt's code-review; the checklist-in-references route keeps one review home.
- **Absorb the Cordis product skills.** Rejected: they are bound to the deepseek-harness runtime; the originals remain available in their repo.
- **Port doc-site-sync now.** Rejected: no docs-site projection exists here, and a skill with no host machinery is dead weight.

## Consequences

- Ten of the eleven deepseek-harness maintenance skills are present as skills or as a checklist reference; only doc-site-sync is deferred.
- One home per capability holds: Matt owns the engineering loop, this pack owns the maintenance flow; the seams are recorded in docs/skills-map.md and ask-demon.
- Parity is checkable per pair through the map and each skill's note.
