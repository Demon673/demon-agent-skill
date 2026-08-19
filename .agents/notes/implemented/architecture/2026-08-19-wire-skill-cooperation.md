# Agent Note: Wire the skill cooperation edges

Status: implemented

English | [中文](2026-08-19-wire-skill-cooperation.zh.md)

## Problem

The skills each fired on their own trigger; only `find-simplifications` → `archive-agent-notes` was wired. Adjacent skills that should hand off — a review surfacing simplification candidates, an archive touching a bilingual pair, a pre-push gate needing semantic review — had no explicit cooperation, so the flow depended on the model guessing the next step.

## Decision

Wire four cooperation edges, keeping every skill independently invocable: descriptions are unchanged, and handoffs are body-only pointers, not hard dependencies.

- `repo-standards-review` → `find-simplifications`: a review that surfaces dead, duplicated, speculative, or over-built surface hands those candidates to `find-simplifications`.
- `repo-standards-review` → `trim-cot-leakage` and `prune-prompt-pollution`: those two own the reasoning-transcript and prompt-pollution smells the review checks.
- `archive-agent-notes` → `translate-docs`: inbound-link repair that edited an active bilingual doc hands the counterpart update to `translate-docs`.
- `pre-push-checks` → `repo-standards-review`: expressed in the root `AGENTS.md` as a pre-push semantic gate, because `pre-push-checks` is published and self-contained and cannot reference the internal `repo-standards-review`.

## Alternatives considered

- **One linear pipeline with a fixed order.** Rejected: each skill has its own trigger and must stay independently invocable; forcing one sequence would add a router layer and couple skills that are also used alone.
- **Wire the pre-push edge inside `pre-push-checks`.** Rejected: `pre-push-checks` is a published, self-contained skill; referencing the internal `repo-standards-review` would break it when installed elsewhere, so the edge lives in the root `AGENTS.md`.

## Consequences

- The cooperation graph is explicit: review → simplify → archive → translate, with `prose-standard`/`trim-cot-leakage`/`prune-prompt-pollution` as the shared prose tools.
- Each skill remains independently invocable; handoffs are soft pointers in the body.
- `pre-push-checks` stays generic; the repo-local pre-push review gate is documented in `AGENTS.md`.
