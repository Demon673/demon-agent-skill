# Agent Note: Restore the flow-skill cascade

Status: implemented

English | [中文](2026-08-19-restore-flow-cascade.zh.md)

## Problem

[bind-flow-skills](../../archived/process/2026-08-19-bind-flow-skills.md) marked the four flow skills — `find-simplifications`, `archive-agent-notes`, `workspace-standards-review`, `translate-docs` — user-invoked with `disable-model-invocation: true`. A user-invoked skill has no model-facing description, so no other skill can reach it; the flow that note meant to formalize could not cascade, and `find-simplifications` could not hand off to `archive-agent-notes` on its own.

## Decision

Restore the four flow skills to default (model and user) invocation — drop `disable-model-invocation: true` — so one flow step can fire the next. Record the criterion in the root `AGENTS.md`: skills default to both model and user invocation so a flow can cascade; mark `disable-model-invocation: true` only for a skill the model must never auto-fire and that no other skill needs to reach. The published-vs-internal split it recorded is superseded: [package-maintenance-flow-as-pack](../architecture/2026-08-19-package-maintenance-flow-as-pack.md) publishes all four flow skills, and the archived [bind-flow-skills](../../archived/process/2026-08-19-bind-flow-skills.md) holds the earlier split.

## Alternatives considered

- **Keep the flow skills user-invoked.** Rejected: a user-invoked skill is unreachable by other skills, so the cascade breaks and the flow becomes fully manual.
- **Publish the flow skills instead.** Rejected at this point: they are bound to this repository's Agent Note system rather than independent capabilities; [package-maintenance-flow-as-pack](../architecture/2026-08-19-package-maintenance-flow-as-pack.md) later moved all four into the published pack.

## Consequences

- The four flow skills now cascade (find-simplifications → archive-agent-notes) under default invocation.
- The invocation-mode criterion lives in the root `AGENTS.md`; [package-maintenance-flow-as-pack](../architecture/2026-08-19-package-maintenance-flow-as-pack.md) owns the published-vs-internal criterion.
- This note supersedes only the invocation-mode half of the archived [bind-flow-skills](../../archived/process/2026-08-19-bind-flow-skills.md); [package-maintenance-flow-as-pack](../architecture/2026-08-19-package-maintenance-flow-as-pack.md) supersedes its internal/bound half.
