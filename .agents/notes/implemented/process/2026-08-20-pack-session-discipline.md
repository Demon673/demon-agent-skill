# Agent Note: Pack the session discipline into setup and ask

Status: implemented

English | [中文](2026-08-20-pack-session-discipline.zh.md)

## Problem

The pack's behavioral guards existed only as prose in this repository. A host repository that adopts the pack gets the conventions but none of the execution discipline — the intent gate, red-checks-block-commits, verify-before-claiming, and named-confirmation-for-destructive-actions lines that real sessions distilled from real failures.

## Decision

The pack carries the four standing-order lines: setup-demon-skills appends them to a host repository's root AGENTS.md (always-loaded context, the only place a gate can actually hold), and ask-demon carries a Session discipline section that explains how each line runs, pointing at the host lines rather than restating them as a second rule. No confirm-intent skill: the discipline that must fire at the moment of misjudgment belongs in standing orders, not in a trigger-loaded skill.

## Alternatives considered

- **A confirm-intent skill.** Rejected: the model will not load it at the moment of misjudgment; the gate must be always in context.
- **ask-demon only.** Rejected: a manual without the host line gives the host no enforcement.
- **setup-demon-skills only.** Rejected: users need the operational explanation the router carries.

## Consequences

- Every repository set up by the pack starts with the four-line session discipline in its standing orders.
- ask-demon explains the discipline without duplicating its home; the rules stay one line each in the host AGENTS.md.
- This repository already carries the first line; the remaining three arrive when setup next runs here or elsewhere.
