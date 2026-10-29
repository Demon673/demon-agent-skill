# Agent Note: Absorb record-browser-gif

Status: implemented

English | [中文](2026-08-20-absorb-record-browser-gif.zh.md)

## Problem

This repository has no skill for recording a browser or Web UI interaction as an optimized GIF. The deepseek-harness `record-browser-gif` skill covers the workflow end to end — state-based frame capture, deterministic encoding, and assets-branch publication — but is written against its host: it names the host's build commands, the `DSH_HOME`/`DSH_AGENTS_HOME` state roots, "real API key and real model rounds", the host's browser-control skill, and a host-local evidence-chain note. To publish it here it must be generalized so it names no host-specific paths, commands, or architecture facts.

## Decision

Absorb it as [`record-browser-gif`](../../../../skills/agent/record-browser-gif/SKILL.md) under `skills/agent/` with a generic encoder, focused media tests, the upstream license, and local `agents/openai.yaml`. The skill uses the repository's build and browser-control workflows, fresh application state, and real server behavior; it keeps host-specific build commands, state roots, and architecture references out of the published workflow. Preserve the MUST-GIF rule for user-visible GUI pull requests, staging and evidence rules, continuous-video capture with screenshot fallback, timing disclosure, the `GIF_SKILL_DIR` encoder invocation, artifact verification, and the demonstrated pull-request-head re-check. Publication prefers supported `gh --attach` and falls back to a dedicated assets branch. The [synchronization decision](2026-10-30-sync-upstream-skills.md) records the upstream revision.

## Alternatives considered

- **Port with the host references intact.** Rejected: the skill would name host build commands and state roots, violating this repo's rule against host-specific paths and commands, and the evidence-chain link would dangle.
- **Rewrite as a thinner skill.** Rejected: the workflow's value is its exact staging, frame, and publication discipline; a rewrite risks dropping the verification steps that make a recording trustworthy.
- **Skip the port.** Rejected: the repo has no GIF-recording skill, and the workflow is generic to any browser UI, so it is directly reusable here.

## Consequences

- The published skill set grows by one: `record-browser-gif`.
- The encoder supports video and screenshot input; focused media tests pin timing, dimensions, size limits, invalid-input rejection, and target preservation. It validates a temporary sibling before atomic publication under the [maintenance safety decision](../bug-fix/2026-10-30-close-maintenance-gaps.md).
- The skill names no deepseek-harness-specific paths, commands, or state roots; the remaining concrete names are labeled examples (`.playwright-mcp/`, the GitHub assets-branch workflow) and the encoder's declared dependencies, which are the skill's subject rather than host coupling. The generalization substitutions are recorded here so later ports of host-coupled skills can reuse them.
