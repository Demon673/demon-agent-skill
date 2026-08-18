# Skill 编写

[English](skill-authoring.md) | 中文

一个 skill 是两个文件：`SKILL.md` 里的工作流，加上 `agents/openai.yaml` 里的主流 agent 元数据。两者都携带调用模式，各用各 harness 的语法，使一个 skill 无需改动即可在 DeepSeek Harness 和 Codex 之间移植。

## 布局

- `SKILL.md` —— frontmatter `name`（连字符）和 `description`（触发聚焦）；用户调用型 skill 再加 `disable-model-invocation: true`。
- `agents/openai.yaml` —— Codex 元数据：`display_name`、`short_description`、`default_prompt`；用户调用型 skill 再加 `policy.allow_implicit_invocation: false`。
- `references/` —— 渐进披露的参考，仅在 skill 触发时加载。

## 调用模式

| 模式 | SKILL.md | openai.yaml |
|---|---|---|
| Agent 调用（被动） | 有 `description`，无 `disable-model-invocation` | 仅 `interface`；隐式调用默认允许 |
| 用户调用（主动） | `disable-model-invocation: true`，或 description 里写明 "explicitly invokes" | `policy.allow_implicit_invocation: false` |

`disable-model-invocation` 仅在内部 skill 可用：发布 skill 由 skill-creator 校验器校验，只接受 `name` 和 `description`，因此发布的用户调用型 skill 在 `description` 里表达该模式。

独立能力是 agent 调用且解耦（发布）；刻意的流程步骤是用户调用且绑定本仓库。
