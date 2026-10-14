# Agent Note: Pack the session discipline into setup and ask

Status: implemented

English | [中文](2026-08-20-pack-session-discipline.zh.md)

## Problem

The pack's behavioral guards existed only as prose in this repository. A host repository that adopts the pack gets the conventions but none of the execution discipline — the intent gate, red-checks-block-commits, verify-before-claiming, and named-confirmation-for-destructive-actions lines that real sessions distilled from real failures.

## Decision

The pack carries five standing-order lines: [setup-demon-skills](../../../../skills/agent/setup-demon-skills/SKILL.md) appends them to a host repository's root AGENTS.md (always-loaded context, the only place a gate can actually hold), and [ask-demon](../../../../skills/agent/ask-demon/SKILL.md) carries a Session discipline section that explains how each line runs, pointing at the host lines rather than restating them as a second rule. No confirm-intent skill: the discipline that must fire at the moment of misjudgment belongs in standing orders, not in a trigger-loaded skill. Task ownership and bounded delegation belong in the same block so independent work can run in parallel while coordination costs remain controlled.

## Alternatives considered

- **A confirm-intent skill.** Rejected: the model will not load it at the moment of misjudgment; the gate must be always in context.
- **ask-demon only.** Rejected: a manual without the host line gives the host no enforcement.
- **setup-demon-skills only.** Rejected: users need the operational explanation the router carries.

## Consequences

- Every repository set up by the pack starts with the five-line session discipline in its standing orders.
- ask-demon explains the discipline without duplicating its home; the rules stay one line each in the host AGENTS.md.
- This repository's root [AGENTS.md](../../../../AGENTS.md#session-discipline) carries all five lines under Session discipline.
