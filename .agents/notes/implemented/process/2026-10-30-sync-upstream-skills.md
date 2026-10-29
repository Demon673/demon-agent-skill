# Agent Note: Synchronize portable upstream skill updates

Status: implemented

English | [中文](2026-10-30-sync-upstream-skills.zh.md)

## Problem

The upstream sources evolve independently. A byte mirror, an adapted maintenance workflow, and generated API snapshots need different update policies; replacing them uniformly would discard local invocation rules and introduce host-only paths, templates, or dependencies.

## Decision

Synchronize the existing sources at immutable revisions: DeepSeek Harness [`f3803c9`](https://github.com/deepseek-ai/deepseek-harness/tree/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/.agents/skills), HumanLayer [`653b641`](https://github.com/humanlayer/skills/tree/653b6411c1f70c275a18e37673b042ff99f67ceb/plugins/show-me), and Dota 2 tools [`7488fc4`](https://github.com/BigCiba/vscode-dota2-tools/tree/7488fc4583868ef2014dee88a0eb0f729170df0e). The [skills map](../../../../docs/skills-map.md) records the current DeepSeek Harness dispositions, including deferred additions.

The maintenance skills absorb effect-path and consumer tracing, operational documentation checks, generated-prose review, test-isolation questions, merge checkpoint preservation, and continuous-video GIF encoding with focused regression tests. Their generic names, local metadata, disclosed references, translation invocation policy, and repository-owned note retention rules remain authoritative. Host documentation templates, website machinery, Session-specific test lanes, and direct deletion of small implemented notes are excluded.

The [show-me mirror decision](../feature/2026-09-04-mirror-show-me-skill.md) retains byte equality and the upstream manual invocation setting. The Dota refresh uses its generator and records the source revision in `UPSTREAM.json`; Markdown whitespace follows the [deterministic normalization policy](../bug-fix/2026-10-30-normalize-vendor-markdown.md). The [GIF port decision](2026-08-20-absorb-record-browser-gif.md) retains generic staging and evidence rules while supporting continuous video and screenshot input. Existing absorption notes retain their independent rationale; this synchronization updates the source baseline without superseding their ownership decisions.

## Alternatives considered

**Replace every skill with upstream files.** Rejected: adapted skills would acquire unsupported host paths, schemas, and workflow policies.

**Import every new upstream skill.** Deferred: each new trigger needs a demonstrated use and an overlap check with the installed engineering skills.

**Normalize the vendor snapshots by hand.** Rejected: the generator owns those files, and preserving upstream content makes source verification reproducible.

## Consequences

Portable behavior updates remain reviewable independently from generated API data. Skill validation, documentation gates, focused GIF media tests, and Dota search smoke checks provide evidence; live application recording and game-runtime verification remain separate tasks. Full whitespace checking includes the generated snapshots under their generator's normalization policy.
