# Agent Note: 脚手架文档预算门禁

Status: implemented

[English](2026-08-20-scaffold-budget-gate.md) | 中文

## 问题

setup-demon-skills 把词预算政策脚手架进宿主仓库的文档标准，却没有交付任何强制力：宿主得到 relocate-condense-raise 规则和 standing order 行「红灯禁止提交」，却没有一扇可能变红的门。

## 决策

pack 现在自带自包含的预算执行器：setup-demon-skills 把其 scripts/verify-doc-budgets.mjs（零依赖 Node 脚本，与本仓库门禁功能一致）连同 manifest 模板复制进宿主的 scripts/，宿主自行调整上限。ask-demon 治理路径的 Foundation 步骤与 Setup 节都会检查该门禁是否存在——缺失的门禁会被发现并补上，而不是静默缺席。

## 备选方案

- **把整条 doc-gates 链送给宿主。** 否决：其余门禁（配对、笔记格式、链接、折行）依赖宿主先有它们所检查的约定；预算门禁是唯一自包含且通用的。
- **只要政策不要执行器。** 否决：没有门禁的规则只是建议；会话纪律行假设门禁存在。

## 后果

- 每个经 pack 初始化的仓库从第一天起就有真实预算门禁在跑；四条 standing order 行都有了牙齿。
- 模板执行器与本仓库门禁保持功能一致（注释行不同），修复靠复制文件即可传播。
