# Agent Note: 把文档治理整合进流程

Status: implemented

[English](2026-08-20-integrate-doc-governance.md) | 中文

## 问题

第一次尝试把全仓库文档治理打包为独立的用户调用 `govern-docs` skill。这个 wrapper 重述了 doc-standards 已有的委派映射，与 ask-demon 争夺同一个路由槽位，并多加了一层委托。用户的需求不是单独的命令，而是沿着 pack 既有 skill 流程运转的治理。

## 决策

删除未提交的 `govern-docs` skill。改为把治理织入流程：主流程在 review 与 simplify 之间增加一个条件性的 `doc-standards` 步骤（每个触及文档的变更都过结构关卡），ask-demon 增加一条成文的治理路径——基础检查、doc-standards 审计、确认后按域修复、经门禁与主流程收口。doc-standards 的描述加入治理触发词，setup-demon-skills 在脚手架完成后把工作交接给该路径。

## 备选方案

- **独立的 govern-docs skill。** 否决：thin wrapper 重述了 doc-standards 已拥有的委派关系；两个路由器会分散用户的入口注意力。
- **把治理路径并入 doc-standards。** 否决：流程描述属于路由器；doc-standards 保持审计引擎的角色。
- **完全不设治理路径。** 否决：全仓库文档审计是反复出现的请求，值得一条有完成判据的具名路径。

## 后果

- 一个路由器（ask-demon）拥有全部流程描述；一个引擎（doc-standards）拥有审计工作流；没有重复的委派映射。
- 触及文档的变更在主流程内过结构关卡，治理从"偶尔的命令"变成持续机制。
- 全仓库治理成为具名路径：逐步确认、复用既有门禁与笔记收口。
