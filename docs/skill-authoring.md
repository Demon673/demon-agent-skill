# Skill authoring

English | [中文](skill-authoring.zh.md)

This repository ships skills, so it follows the Agent Skills standard for `SKILL.md` and its directory layout. This page is the reference an author consults before writing or editing a skill.

## Directory layout

```text
skill-name/
├── SKILL.md      # required — frontmatter + body
├── references/   # optional — loaded on demand
├── scripts/      # optional — deterministic helpers
└── agents/       # optional — per-agent metadata

```

## SKILL.md frontmatter

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | lowercase-hyphen identifier, at most 64 characters |
| `description` | yes | what the skill does and when to fire — the discovery surface |
| `license` | no | SPDX identifier |
| `allowed-tools` | no | comma-separated tool allow-list |
| `metadata` | no | arbitrary key-value map |
| `disable-model-invocation` | no | `true` = the model will not auto-invoke; only the user can. Default `false` |
| `user-invocable` | no | whether the user can invoke by name |

## Body

- Write for the agent: ordered steps and, where needed, flat reference, co-located so one heading carries its rules and caveats.
- Keep `SKILL.md` concise; push detailed, conditional, or platform-specific material into `references/`, loaded only when a pointer fires.
- The `description` is the context pointer: front-load the trigger, one branch per trigger, cut identity the body already carries.

## Invocation modes

By default both the model and the user can invoke a skill: the `description` lets the model auto-fire it, and the user can also type its name. There is one flag:

| Mode | SKILL.md | Codex `openai.yaml` |
|---|---|---|
| Default (model and user) | `disable-model-invocation` absent | `interface` only; implicit invocation allowed |
| User-only (model does not auto-fire) | `disable-model-invocation: true` | `policy.allow_implicit_invocation: false` |

`disable-model-invocation: true` also makes a skill unreachable by other skills, so a flow step that another skill fires must stay default. Mark it only for a skill the model must never auto-fire and that no other skill needs to reach.

## Per-agent metadata

- Codex reads `agents/openai.yaml`: `interface.display_name`, `interface.short_description`, `interface.default_prompt`, and `policy.allow_implicit_invocation`.
- Other agents read the standard `SKILL.md` frontmatter.

## Sources

- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Agent Skills](https://agentskills.so)
- [SKILL.md frontmatter reference](https://agentpatterns.ai/tool-engineering/skill-frontmatter-reference/)
