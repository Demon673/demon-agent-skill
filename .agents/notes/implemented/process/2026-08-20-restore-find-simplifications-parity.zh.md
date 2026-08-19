# Agent Note: 恢复 find-simplifications 与 dsh-find-simplifications 的功能对等

Status: implemented

[English](2026-08-20-restore-find-simplifications-parity.md) | 中文

## 问题

发布的 `find-simplifications` skill（技能）只保留了 `dsh-find-simplifications`（deepseek-harness 仓库 `.agents/skills/dsh-find-simplifications/SKILL.md`）的 survey-证明-记录骨架。`31b2ba5` 中的移植把 146 行正文改写为 61 行，丢掉了代码面候选分类、调查域与并行子代理、信任与生命周期边界审计、依赖替换流程、Agent Note（决策记录）coalesce（合并）算法及其 added-then-removed 规则、内联 TODO/FIXME/XXX 语义、并入另一个 PR（Pull Request）或分支、以及验证与 PR 卫生。两个 skill 不再共享功能——这是功能漂移而非通用化——且融合 Agent Note 中「发布的 skill 覆盖 code、docs 与 skills」的表述与交付的正文不符。

## 决策

重写 `find-simplifications`，承载 `dsh-find-simplifications` 的完整工作流，并把宿主引用参数化：根 `AGENTS.md` 约定、架构文档、Agent Note 树、依赖政策与仓库 gate（门禁）取代 deepseek-harness 的路径、命令与架构事实。具体的宿主事实只以具名示例保留（`packages/*/src`、`knip`、pnpm gate 命令、`.agents/notes/<lifecycle>/<class>/` 布局）。正文保持 `SKILL.md` 自包含、不拆 `references/`，因为工作流的每个分支都会到达每一节。发布名称与调用默认值不变，Codex 元数据（`agents/openai.yaml`）同步更新。本记录落实而非推翻 [2026-08-19-fuse-find-simplifications](2026-08-19-fuse-find-simplifications.md) 记录的融合决策。

## 备选方案

- **保留漂移后的正文。** 否决：用户要求与 `dsh-find-simplifications` 功能一致并通用化，被删的几节——信任与生命周期审计、依赖门槛、合并算法、PR 卫生——正是主要价值。
- **把详细章节拆进 `references/`。** 否决：融合记录将本 skill 发布为自包含，且每节都是工作流每个分支都会到达的步骤，不是条件性参考。正文因此保持 146 行——高于简洁默认值，但在发布先例之内（`agent-doorbell` 165 行、`merging-stacked-prs` 127 行），且为对等规格所要求。
- **改名为 `dsh-find-simplifications`。** 否决：`dsh-` 前缀标记 deepseek-harness 内部 skill；本仓库以普通名称发布可移植 skill。

## 后果

- `skills/agent/find-simplifications/SKILL.md` 从 61 行增至 146 行，重新覆盖 code、docs 与 skills，与融合记录一致。
- 描述现在点名 coalesce-notes 与 fold-PR 两个分支，这两类请求可以触发本 skill。
- 本 skill 保持宿主无关：在 deepseek-harness 中运行会从同一份正文复现 dsh 风格的行为；在任何其他仓库中运行则把同一工作流套用到该宿主的约定上。
