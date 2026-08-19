# Agent Note: 恢复流程 skill 的级联

Status: implemented

[English](2026-08-19-restore-flow-cascade.md) | 中文

## 问题

[bind-flow-skills](2026-08-19-bind-flow-skills.md) 把四个流程 skill——`find-simplifications`、`archive-agent-notes`、`repo-standards-review`、`translate-docs`——用 `disable-model-invocation: true` 标记为用户调用。用户调用的 skill 没有面向模型的描述，其他 skill 无法触达它；那条 note 本想固化的流程因此无法级联，`find-simplifications` 也无法自行把记录交给 `archive-agent-notes`。

## 决策

把四个流程 skill 恢复为默认（模型+用户）调用——去掉 `disable-model-invocation: true`——让一个流程步骤能触发下一个。判据写入根 `AGENTS.md`：skill 默认同时面向模型和用户调用，以便流程级联；只有模型绝不能自动触发、且其他 skill 也不需要触达的 skill，才标 `disable-model-invocation: true`。`bind-flow-skills` 里「能力发布且解耦、流程步骤内部且绑定」的发布/内部分界保持不变。

## 备选方案

- **保持流程 skill 用户调用。** 否决：用户调用的 skill 其他 skill 触达不到，级联断裂，流程变成全手动。
- **改为发布这些流程 skill。** 否决：`bind-flow-skills` 已否决；它们绑定本仓库的 Agent Note 体系，不是独立能力。

## 后果

- 四个流程 skill 现在在默认调用下级联（find-simplifications → archive-agent-notes）。
- 调用模式判据落在根 `AGENTS.md`；发布/内部分界判据不变。
- 本 note 只取代 `bind-flow-skills` 的「调用模式」半段；那条 note 仍保留其「内部/绑定」决策。
