# Agent Note: 携带 Codex 元数据以实现主流 agent 通配

Status: implemented

[English](2026-08-19-codex-metadata.md) | 中文

## 问题

skill 只携带 DeepSeek Harness 的 frontmatter（`name`、`description`、`disable-model-invocation`），因此调用模式在 Codex 里没有表达，skill 无法跨主流 agent 移植。可移植性约定没有写下来，未来的 skill 会静默丢掉它。

## 决策

每个 skill 都在 `SKILL.md` 旁携带 Codex 元数据文件 `agents/openai.yaml`，含 `interface.display_name`、`interface.short_description`、`interface.default_prompt`，以及——对用户调用型 skill——`policy.allow_implicit_invocation: false`。调用模式在两个 harness 里都表达：`disable-model-invocation: true`（DeepSeek Harness frontmatter）对应 `allow_implicit_invocation: false`（Codex yaml）。约定记录在根 `AGENTS.md`。

## 备选方案

- **只保留 DSH frontmatter。** 否决：调用模式在 Codex 里没有意义，skill 无法移植。
- **把元数据折进 `SKILL.md` frontmatter。** 否决：`SKILL.md` frontmatter 由 skill-creator 的 `quick_validate.py` 校验，会拒绝非标准键；Codex 读的是 `agents/openai.yaml`。

## 后果

- 九个开发 skill 现在都携带 `agents/openai.yaml`；四个流程 skill 为 `allow_implicit_invocation: false`，五个能力默认允许。
- 双 harness 映射是持久文档，未来 skill 无需重新推导即可保留它。
