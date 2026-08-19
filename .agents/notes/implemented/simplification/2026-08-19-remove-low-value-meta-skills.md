# Agent Note: Remove the low-value meta skills

Status: implemented

English | [中文](2026-08-19-remove-low-value-meta-skills.zh.md)

## Problem

Four published skills — `answer-only`, `context-curator`, `evidence-checker`, `task-intake` — wrapped behaviors that frontier models now perform by default or that native agent features absorb: answering without acting, curating durable context (auto-memory), labeling evidence, and clarifying an ambiguous entry. They were rarely invoked and spent permanent context load through always-loaded descriptions.

## Decision

Remove `answer-only`, `context-curator`, `evidence-checker`, and `task-intake` from `skills/agent/` and from the manifest. Demote `task-intake`'s clarification rule to a one-line rule in the root `AGENTS.md`. The remaining skills are genuine procedures or unique domains and stay.

## Alternatives considered

- **Keep them as thin skills.** Rejected: the 2026 guidance is that facts and output conventions belong in rules and output styles, not skills; a skill that restates default behavior is negative — token cost, dilution, and rot.
- **Remove `workflow-capture` too.** Rejected: it produces skills and clears the procedural bar; its fate is a separate decision.

## Consequences

- The published manifest shrinks from 15 to 11 skills.
- The clarification rule now lives in `AGENTS.md`; context curation is left to the model's native auto-memory.
- `workflow-capture`'s reference to `context-curator/FLOWS.md` is removed.
