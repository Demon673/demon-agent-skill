---
name: workflow-capture
description: Turn a proven or user-requested workflow into a reusable skill. Use when the user asks to preserve, formalize, or reuse a repeated process.
---

# Workflow Capture

Turn a reused workflow into a skill — the reusable procedural artifact. Capture only when reuse is the user's explicit goal; a process that is not a repeatable procedure (facts, preferences, decisions, one-off tasks) is not this skill's job.

## Capture

1. Confirm the process actually recurs and the user wants it reusable; otherwise do not capture.
2. Extract the trigger, inputs, steps, checks, approval points, and done criteria.
3. Strip private context, local paths, secrets, and one-off details.
4. Propose the destination and scope before writing when either is unclear.
5. Write the `SKILL.md` once the destination and scope are confirmed.

## Output

A skill draft carries a hyphen-case `name`, a trigger-focused `description` (one branch per trigger), an ordered body of steps, and the non-obvious contracts.
