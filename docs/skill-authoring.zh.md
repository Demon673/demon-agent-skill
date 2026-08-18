# Skill 编写

[English](skill-authoring.md) | 中文

本仓库发布 skill，因此遵循 Agent Skills 标准来编写 `SKILL.md` 及其目录布局。本页是作者在编写或修改 skill 前查阅的参考。

## 目录布局

```text
skill-name/
├── SKILL.md      # required — frontmatter + body
├── references/   # optional — loaded on demand
├── scripts/      # optional — deterministic helpers
└── agents/       # optional — per-agent metadata

```

## SKILL.md frontmatter

| 字段 | 必填 | 含义 |
|---|---|---|
| `name` | 是 | 连字符小写标识，最多 64 字符 |
| `description` | 是 | skill 做什么、何时触发——发现面 |
| `license` | 否 | SPDX 标识 |
| `allowed-tools` | 否 | 逗号分隔的工具白名单 |
| `metadata` | 否 | 任意键值映射 |
| `disable-model-invocation` | 否 | `true` = 模型不自动调用、只有用户能调。默认 `false` |
| `user-invocable` | 否 | 用户可否按名调用 |

## 正文

- 面向 agent 书写：有序步骤，必要时加扁平参考，同置使一个标题下携带其规则与注意事项。
- 保持 `SKILL.md` 简洁；把详细、有条件或平台特定的材料推入 `references/`，仅在指针触发时加载。
- `description` 是上下文指针：前置触发、每个分支一个触发、去掉正文已承载的身份。

## 调用模式

默认情况下，模型和用户都能调用一个 skill：`description` 让模型自动触发，用户也能输入其名字。只有一个标志：

| 模式 | SKILL.md | Codex `openai.yaml` |
|---|---|---|
| 默认（模型和用户） | 无 `disable-model-invocation` | 仅 `interface`；隐式调用允许 |
| 用户专属（模型不自动触发） | `disable-model-invocation: true` | `policy.allow_implicit_invocation: false` |

仅在「刻意的命令或破坏性操作、模型绝不能自行触发」时标 `disable-model-invocation: true`；能力保持默认。

## 各 agent 元数据

- Codex 读取 `agents/openai.yaml`：`interface.display_name`、`interface.short_description`、`interface.default_prompt`、`policy.allow_implicit_invocation`。
- 其他 agent 读取标准 `SKILL.md` frontmatter。

## 来源

- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Agent Skills](https://agentskills.so)
- [SKILL.md frontmatter reference](https://agentpatterns.ai/tool-engineering/skill-frontmatter-reference/)
