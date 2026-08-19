# Agent Note: Restore the flow-skill cascade

Status: implemented

English | [中文](2026-08-19-restore-flow-cascade.zh.md)

## Problem

[bind-flow-skills](2026-08-19-bind-flow-skills.md) marked the four flow skills — `find-simplifications`, `archive-agent-notes`, `repo-standards-review`, `translate-docs` — user-invoked with `disable-model-invocation: true`. A user-invoked skill has no model-facing description, so no other skill can reach it; the flow that note meant to formalize could not cascade, and `find-simplifications` could not hand off to `archive-agent-notes` on its own.

## Decision

Restore the four flow skills to default (model and user) invocation — drop `disable-model-invocation: true` — so one flow step can fire the next. Record the criterion in the root `AGENTS.md`: skills default to both model and user invocation so a flow can cascade; mark `disable-model-invocation: true` only for a skill the model must never auto-fire and that no other skill needs to reach. The published-vs-internal split from `bind-flow-skills` (capabilities published and decoupled; flow steps internal and bound) is unchanged.

## Alternatives considered

- **Keep the flow skills user-invoked.** Rejected: a user-invoked skill is unreachable by other skills, so the cascade breaks and the flow becomes fully manual.
- **Publish the flow skills instead.** Rejected: already rejected in `bind-flow-skills`; they are bound to this repository's Agent Note system, not independent capabilities.

## Consequences

- The four flow skills now cascade (find-simplifications → archive-agent-notes) under default invocation.
- The invocation-mode criterion lives in the root `AGENTS.md`; the published-vs-internal criterion is unchanged.
- This note supersedes only the invocation-mode half of `bind-flow-skills`; that note remains for the internal/bound decision.
