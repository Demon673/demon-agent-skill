# Agent Note: 绑定流程 skill 并标记为用户调用

Status: implemented

[English](2026-08-19-bind-flow-skills.md) | 中文

## 问题

上一轮把 `find-simplifications` 作为通用 skill 发布了，但它其实是一个流程步骤——提出简化、再把被取代的记录交给 `archive-agent-notes`——绑定于本仓库的 Agent Note 体系，而非独立能力。仓库也缺少「agent 该自己触发的 skill」与「只有人该调用的 skill」之间的区分。

## 决策

把 `find-simplifications` 回退为内部且绑定：恢复 Agent Note 提案格式和 `archive-agent-notes` 交接。把四个流程 skill——`find-simplifications`、`archive-agent-notes`、`repo-standards-review`、`translate-docs`——用 `disable-model-invocation: true` 标记为用户调用。判据已写入根 `AGENTS.md`：独立能力是 agent 调用且解耦（发布）；刻意的流程步骤是用户调用且绑定本仓库。

## 备选方案

- **保持 `find-simplifications` 发布为通用。** 否决：通用 skill 无法引用本仓库的 Agent Note 体系，从而丢失向 `archive-agent-notes` 的交接，而 survey+证明 只是价值的一半。
- **把所有 skill 都标记为 agent 调用。** 否决：流程步骤是人发起的刻意维护；自动触发它们，等于为「只会手动触发」的描述白白付出 context 负载。

## 后果

- 发布清单从 17 减至 16；内部集合从 3 增至 4。
- 流程（find-simplifications → archive-agent-notes）显式且用户调用；能力（prose-standard、trim-cot-leakage、prune-prompt-pollution、pre-push-checks、merging-stacked-prs）是 agent 调用且发布。
- 本决策的「调用模式」半段被 [restore-flow-cascade](2026-08-19-restore-flow-cascade.md) 取代：流程 skill 现在保持默认调用，使流程可级联。
