# Agent Note: Thin the workflow-capture skill

Status: implemented

English | [中文](2026-08-19-thin-workflow-capture.zh.md)

## Problem

`workflow-capture` carried a seven-artifact taxonomy (checklist, workflow template, plugin idea, MCP idea, context flow, and more) plus negation-heavy trigger boundaries and workspace-specific destination rules. The 2026 guidance is that a reusable procedure belongs in a skill, so the taxonomy and scaffolding were speculative generality that added cognitive load without changing the outcome.

## Decision

Collapse `workflow-capture` to its one job: turn a reused workflow into a skill. Keep the capture loop — confirm reuse, extract trigger/steps/checks, strip private detail, confirm destination, write — and drop the artifact table, the capture-brief template, the destination directory list, and the independence/negation sections. The description now names the output as a skill.

## Alternatives considered

- **Keep the full artifact taxonomy.** Rejected: procedures belong in skills; the checklist/template/plugin/MCP rows are speculative and pre-2026.
- **Remove the skill entirely.** Rejected: it produces skills and clears the procedural bar — the one meta skill that still earns its keep.

## Consequences

- `workflow-capture` is a thin meta-skill that emits a skill, down from a 114-line taxonomy to a focused capture loop.
- The "smallest artifact" decision is gone; the output is a skill or nothing.
