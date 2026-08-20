# Agent Note: Flip the intent rule from permission to gate

Status: implemented

English | [中文](2026-08-20-flip-intent-rule.zh.md)

## Problem

The standing order said "Ask one clarifying question only when acting without clarity would go wrong" — a permission-style default. A session executed a large change during a discussion ("看看应该怎么整合") because the execution momentum of a long session overrode the weak gate.

## Decision

Rewrite the root AGENTS.md line into a gate: act only on an explicit execution signal and confirmed scope; otherwise ask one clarifying question. A fuller confirm-intent protocol skill is shelved until the one-line flip proves insufficient.

## Alternatives considered

- **Add a confirm-intent skill now.** Rejected for now: the rule already existed; the failure was the default's polarity, so flip the one line first and observe.
- **Keep the old wording.** Rejected: permission-style defaults fail under execution momentum.

## Consequences

- The default is now "ask unless explicitly told to execute"; discussion and analysis requests never authorize writes.
- The changed line is the standing order itself; no skill or other file carries the rule.
