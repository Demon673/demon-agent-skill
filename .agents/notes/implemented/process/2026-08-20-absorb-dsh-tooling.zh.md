# Agent Note: 吸收 dsh 工具链层

Status: implemented

[English](2026-08-20-absorb-dsh-tooling.md) | 中文

## 问题

漂移审计与后续探索发现本仓库缺少 deepseek-harness 的工具链：change-scope（pre-push-checks 与 code-review 被设计围绕的确定性 diff 报告）、gen-translation-brief（translate-docs 简报驱动更新路径背后的助手）、verify-doc-refs（检查源码注释里文档引用的门禁，是 verify-md-links 看不到的一类链接）、以及 lefthook 预提交钩子层。经 setup-demon-skills 初始化的宿主仓库同样缺少这些被吸收技能以 "when present" 引用的工具。

## 决策

把四个工具全部移植进 scripts/，零依赖 ESM，输出契约与 dsh 原版一致；verify-doc-refs 接进 run-doc-gates 成为第七道门禁；change-scope 与 lefthook 模板打包进 setup-demon-skills，让宿主也能获得。verify-mermaid 与 doc-typecheck 继续搁置：本仓库没有 mermaid 栅栏、文档里没有 TypeScript 样例，且两个门禁都带着宿主不应继承的依赖重量。

## 备选方案

- **现在就吸收 verify-mermaid。** 搁置：这里还没有栅栏，且它需要 mermaid 与 jsdom；移植记录留给第一张架构图出现的那天。
- **现在就吸收 doc-typecheck。** 搁置：它编译栅栏 ts 块；目前还没有。
- **把 translation-brief 与 doc-refs 打包进 setup。** 搁置：宿主可选项；让 setup 的载荷保持为被吸收技能运行时引用的工具。

## 后果

- 本仓库的 pre-push-checks 与 code-review 现在有了确定性的范围输入；translate-docs 的简报路径端到端完整。
- doc-gates 检查第七个表面：源码注释中的文档引用。
- lefthook.yml 与安装器已落地但未激活；需要时运行 npm run install-lefthook 安装钩子。
- 每个移植都复用现有 lib 助手（record、git、markdown），不新增任何 npm 依赖。
