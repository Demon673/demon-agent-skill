# Agent Note: 将维护流程打包为 Matt 式 skill pack

Status: implemented

[English](2026-08-19-package-maintenance-flow-as-pack.md) | 中文

## 问题

四个流程 skill——`find-simplifications`、`archive-agent-notes`、`repo-standards-review`、`translate-docs`——一直待在内部 `.agents/skills/` 集合里，绑定本仓库路径，因此无法作为发布 pack 的一部分安装。这个 pack 也缺少 Matt 套件用到的两个结构性 skill——路由和 setup skill——所以流程没有入口。

## 决策

把流程发布为一个协同的 pack。把四个流程 skill 移入 `skills/agent/`，解耦（仓库专属路径泛化为「你仓库的 …」，兄弟 skill 交接按名字），并新增两个入口 skill：`ask-demon`（用户调用的路由，画出维护流程、prose 工具层和独立 skill）和 `setup-demon-skills`（搭建 Agent Note 目录树与双语配对约定）。跨 skill 引用按名字——即 Matt 的模式——这样 pack 一起安装即可解析。

## 备选方案

- **保持流程内部且绑定。** 否决：目标是发布一个补充 Matt 的、可安装的 pack，不是仓库内部工具。
- **把每个 skill 做成完全自包含、零交叉引用。** 否决：Matt 的 pack 之所以成立，正因为 skill 按名字互相引用；协同流程需要这些交接，而 pack 一起安装即可解析。
- **把流程并入 Matt 的工程环。** 否决：Matt 拥有 grill → spec → tickets → implement；本 pack 拥有文档/Agent Note 维护和游戏工作，Matt 不覆盖这些。

## 后果

- 发布清单从 11 增至 17 个 skill；内部 `.agents/skills/` 集合清空并移除。
- `ask-demon` 是唯一入口；维护流程级联 `repo-standards-review` → `find-simplifications` → `archive-agent-notes` → `translate-docs`。
- 历史「内部 vs 发布」note 被本决策取代；其链接现在指向 `skills/agent/`。
