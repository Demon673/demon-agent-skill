# Skill authoring

English | [中文](skill-authoring.zh.md)

A skill is two files: the workflow in `SKILL.md`, and the mainstream-agent metadata in `agents/openai.yaml`. Both carry the invocation mode, each in its own harness's syntax, so a skill ports across DeepSeek Harness and Codex without edit.

## Layout

- `SKILL.md` — frontmatter `name` (hyphen-case) and `description` (trigger-focused); add `disable-model-invocation: true` for a user-invoked skill.
- `agents/openai.yaml` — Codex metadata: `display_name`, `short_description`, `default_prompt`; add `policy.allow_implicit_invocation: false` for a user-invoked skill.
- `references/` — disclosed reference, loaded only when the skill fires.

## Invocation modes

| Mode | SKILL.md | openai.yaml |
|---|---|---|
| Agent-invoked (passive) | `description` present, no `disable-model-invocation` | `interface` only; implicit invocation defaults to allowed |
| User-invoked (active) | `disable-model-invocation: true` | `policy.allow_implicit_invocation: false` |

Independent capabilities are agent-invoked and decoupled (published); deliberate flow steps are user-invoked and bound to this repository.
