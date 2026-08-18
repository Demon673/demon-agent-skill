# Agent Note: 新增 prune-prompt-pollution skill

Status: implemented

[English](2026-08-18-add-prune-prompt-pollution.md) | 中文

## 问题

对外发布的 skill 集合里，没有 skill 负责让面向 agent 的文档免于提示污染——否定启动、缺席声明、陈旧元叙事和稻草人警告。维护类 skill 里 `prose-standard` 管契约保真、`trim-cot-leakage` 管思维链泄漏，但不管这些激活模式，其中三类是净新增。

## 决策

在 `skills/agent/` 下新增 [`prune-prompt-pollution`](../../../../skills/agent/prune-prompt-pollution/SKILL.md) 作为发布 skill，完全自包含，以便干净地装进 global skill 目录。作用域：自动作用于 agent 指令和当前态文档（规则文件、skill 正文与 description、prompt、设计/计划/流程文档）；任务与会话文件仅在显式请求时处理；绝不作用于代码、提交信息、决策记录、事故复盘或面向玩家/用户的文案。承重否定通过 keep list 保留（硬护栏、反事实回归钉、承重缺席、抑制理由、实测边界）。

## 备选方案

- **作用于所有 agent-consumed 文档。** 否决：决策记录和事故复盘记录的是历史与理由，其中「我们否决了 X」是承重内容，不是污染。
- **把四个模式并入 `prose-standard` 或 `trim-cot-leakage`。** 否决：否定启动、缺席声明、稻草人警告是净新增，且该 skill 是独立的事实正向视角，必须单独安装。
- **把排除清单写进 description。** 否决：在常驻指针里放否定；正文的 Scope 正向陈述边界。

## 后果

- 发布清单增至 12 个 skill。
- skill 自包含，装进 global 后无断链引用。
- 「引导 prose vs 记录」的边界是刻意决策；想扫决策记录的工作应回到本 note 重议，而不是就地改动该 skill。
