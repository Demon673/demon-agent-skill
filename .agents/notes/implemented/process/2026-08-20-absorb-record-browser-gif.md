# Agent Note: Absorb record-browser-gif

Status: implemented

English | [中文](2026-08-20-absorb-record-browser-gif.zh.md)

## Problem

This repository has no skill for recording a browser or Web UI interaction as an optimized GIF. The deepseek-harness `record-browser-gif` skill covers the workflow end to end — state-based frame capture, deterministic encoding, and assets-branch publication — but is written against its host: it names the host's build commands, the `DSH_HOME`/`DSH_AGENTS_HOME` state roots, "real API key and real model rounds", the host's browser-control skill, and a host-local evidence-chain note. To publish it here it must be generalized so it names no host-specific paths, commands, or architecture facts.

## Decision

Absorb it as [`record-browser-gif`](../../../../skills/agent/record-browser-gif/SKILL.md) under `skills/agent/` — a 1:1 port with the generalizations below. Copy the encoder `scripts/encode_gif.py` verbatim (it is already generic) and add `agents/openai.yaml` per the repo convention. Generalize: the host's build commands become "the repository's build commands for the recorded tree"; `DSH_HOME`/`DSH_AGENTS_HOME` become "the application's fresh state roots"; "real API key and real model rounds" becomes "a real server, real credentials, and real data flow (real model rounds where the app is model-backed)"; the host browser-control skill becomes "the repository's browser-control skill when available, otherwise the repository-declared Playwright dependency"; the host evidence-chain note link is dropped because the staging rules already state that rationale. Keep the MUST-GIF rule for user-visible GUI pull requests, the staging and evidence rules, frame discipline, the `GIF_SKILL_DIR` encoder invocation, verification steps, assets-branch publication with `?raw=true`, and the pull-request-head re-check.

## Alternatives considered

- **Port with the host references intact.** Rejected: the skill would name host build commands and state roots, violating this repo's rule against host-specific paths and commands, and the evidence-chain link would dangle.
- **Rewrite as a thinner skill.** Rejected: the workflow's value is its exact staging, frame, and publication discipline; a rewrite risks dropping the verification steps that make a recording trustworthy.
- **Skip the port.** Rejected: the repo has no GIF-recording skill, and the workflow is generic to any browser UI, so it is directly reusable here.

## Consequences

- The published skill set grows by one: `record-browser-gif`.
- The encoder is preserved byte-for-byte, so its timing, dimension, and size checks transfer unchanged.
- The skill names no deepseek-harness-specific paths, commands, or state roots; the remaining concrete names are labeled examples (`.playwright-mcp/`, the GitHub assets-branch workflow) and the encoder's declared dependencies, which are the skill's subject rather than host coupling. The generalization substitutions are recorded here so later ports of host-coupled skills can reuse them.
