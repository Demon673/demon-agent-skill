# Agent Note: 为本仓库配置 Matt 工程 skills

Status: implemented

[English](2026-08-20-setup-matt-engineering-skills.md) | 中文

## 问题

Matt 的工程 skills（grill、to-spec、to-tickets、implement、code-review、triage、wayfinder）依赖每个仓库的配置，而本仓库此前完全没有：issue tracker 在哪里、triage label 词汇是什么、领域文档在哪里。

## 决策

通过 setup-matt-pocock-skills 流程配置：issue 与 spec 存放在 GitHub issue 中，由 `gh` CLI 驱动，"PRs as a request surface" 关闭；五个规范 triage label 映射为与角色同名的字符串；领域文档采用单上下文布局（根目录 `CONTEXT.md` 加 `docs/adr/`，由 domain-modeling 惰性创建）。配置以双语三件套记录在 `docs/agents/` 下，根 `AGENTS.md` 的 `## Agent skills` 块指向它。AGENTS.md 的词数预算上限从 600 词提高到 620 词，因为该文件此前已到上限，而强制要求的块需要这些空间。

## 备选方案

- **本地 markdown tracker（.scratch/ 下）。** 否决：本仓库是带 remote 的公开 GitHub 仓库；gh-CLI 流程是这些 skills 的默认姿势。
- **多上下文领域文档。** 否决：没有 monorepo 信号（无 workspace 文件、无 packages/）。
- **自定义 triage label 字符串。** 否决：默认 label 与 skills 的规范角色一一对应。

## 后果

- Matt 的工程 skills 现在可以在本仓库创建、读取、triage 与关闭 issue，并在探索时定位领域文档。
- 根 AGENTS.md 新增一个 Agent-skills 块；docs/agents/ 加入双语三件套约定。
- 以后切换 tracker 或 label，只需编辑 docs/agents/ 并重跑 setup-matt-pocock-skills。
