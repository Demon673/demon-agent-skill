# Agent Note: Carry Codex metadata for mainstream-agent portability

Status: implemented

English | [中文](2026-08-19-codex-metadata.zh.md)

## Problem

Skills carried only the DeepSeek Harness frontmatter (`name`, `description`, `disable-model-invocation`), so the invocation mode had no expression in Codex and a skill did not port across mainstream agents. The portability convention was not written down, so a future skill would silently drop it.

## Decision

Every skill carries a Codex metadata file `agents/openai.yaml` beside `SKILL.md`, with `interface.display_name`, `interface.short_description`, `interface.default_prompt`, and — for user-invoked skills — `policy.allow_implicit_invocation: false`. The invocation mode is expressed in both harnesses: `disable-model-invocation: true` (DeepSeek Harness frontmatter) maps to `allow_implicit_invocation: false` (Codex yaml). The convention is recorded in [`docs/skill-authoring.md`](../../../../docs/skill-authoring.md), referenced from the root `AGENTS.md`.

## Alternatives considered

- **Keep the DSH frontmatter only.** Rejected: the invocation mode then has no meaning in Codex, and the skill does not port.
- **Fold the metadata into `SKILL.md` frontmatter.** Rejected: `SKILL.md` frontmatter is validated by the skill-creator's `quick_validate.py`, which rejects non-standard keys; Codex reads `agents/openai.yaml` instead.

## Consequences

- The nine developed skills now carry `agents/openai.yaml`; the four flow skills are `allow_implicit_invocation: false`, the five capabilities default to allowed.
- The two-harness mapping is durable documentation, so future skills keep it without re-deriving it.
