# Agent Note: Scaffold the documentation budget gate

Status: implemented

English | [中文](2026-08-20-scaffold-budget-gate.zh.md)

## Problem

setup-demon-skills scaffolded the word-budget policy into a host repository's documentation standard, but shipped no enforcement: the host gets the relocate-condense-raise rule and the standing-order line "a red check blocks the commit" without any gate that could go red.

## Decision

The pack now carries the self-contained budget executor: setup-demon-skills copies its scripts/verify-doc-budgets.mjs (a dependency-free Node script, functionally identical to this repository's gate) into the host's scripts/ together with a manifest template whose ceilings the host adjusts. ask-demon's governance-run Foundation step and its Setup section both check the gate's presence, so a missing gate is found and repaired rather than silently absent.

## Alternatives considered

- **Ship the whole doc-gates chain to hosts.** Rejected: the other gates (pairing, note format, links, wrap) depend on the host having the conventions they check; the budget gate is the only one that is self-contained and universal.
- **Policy without the executor.** Rejected: a rule with no gate is a suggestion; the session-discipline line assumes a gate exists.

## Consequences

- Every repository set up by the pack runs a real budget gate from day one; the four standing-order lines all have teeth.
- The template executor stays functionally identical to this repository's gate (comment lines differ) so fixes propagate by copying the file.
