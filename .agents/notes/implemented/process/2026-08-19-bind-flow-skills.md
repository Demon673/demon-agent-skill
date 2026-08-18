# Agent Note: Bind the flow skills and mark them user-invoked

Status: implemented

English | [中文](2026-08-19-bind-flow-skills.zh.md)

## Problem

The previous turn published `find-simplifications` as a general skill, but it is a flow step — propose simplifications, then hand superseded records to `archive-agent-notes` — bound to this repository's Agent Note system, not an independent capability. The repository also lacked a distinction between skills the agent should fire on its own and skills only the human should invoke.

## Decision

Revert `find-simplifications` to internal and bound: restore the Agent Note proposal format and the `archive-agent-notes` handoff. Mark the four flow skills — `find-simplifications`, `archive-agent-notes`, `repo-standards-review`, `translate-docs` — user-invoked with `disable-model-invocation: true`. The criterion, recorded in the root `AGENTS.md`: independent capabilities are agent-invoked and decoupled (published); deliberate flow steps are user-invoked and bound to this repository.

## Alternatives considered

- **Keep `find-simplifications` published as general.** Rejected: a general skill cannot reference this repository's Agent Note system, so the handoff to `archive-agent-notes` is lost, and the survey-and-prove half is only half the value.
- **Mark every skill agent-invoked.** Rejected: flow steps are deliberate maintenance the human initiates; auto-firing them spends context load on descriptions that only fire by hand.

## Consequences

- The published manifest shrinks from 17 to 16; the internal set grows from 3 to 4.
- The flow (find-simplifications → archive-agent-notes) is explicit and user-invoked; the capabilities (prose-standard, trim-cot-leakage, prune-prompt-pollution, pre-push-checks, merging-stacked-prs) are agent-invoked and published.
