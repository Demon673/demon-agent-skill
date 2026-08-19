# Agent Note: 移除低价值的元 skill

Status: implemented

[English](2026-08-19-remove-low-value-meta-skills.md) | 中文

## 问题

四个发布的 skill——`answer-only`、`context-curator`、`evidence-checker`、`task-intake`——包装的都是前沿模型默认就会、或原生 agent 能力已吸收的行为：只答不干、策展持久上下文（自动记忆）、给证据贴标签、澄清模糊入口。它们很少被调用，却通过常驻的 description 持续消耗 context。

## 决策

从 `skills/agent/` 和 manifest 中移除 `answer-only`、`context-curator`、`evidence-checker`、`task-intake`。把 `task-intake` 的澄清规则降级为根 `AGENTS.md` 里的一行规则。其余 skill 都是真流程或独有领域，保留。

## 备选方案

- **保留为薄 skill。** 否决：2026 的指引是「事实和输出约定属于规则与输出风格，不属于 skill」；复述默认行为的 skill 是负资产——token 开销、稀释注意力、会腐烂。
- **连 `workflow-capture` 一起移除。** 否决：它生产 skill，过了流程门槛；其去留是另一个独立决策。

## 后果

- 发布清单从 15 减至 11 个 skill。
- 澄清规则现在落在 `AGENTS.md`；上下文策展交给模型的原生自动记忆。
- `workflow-capture` 对 `context-curator/FLOWS.md` 的引用被移除。
