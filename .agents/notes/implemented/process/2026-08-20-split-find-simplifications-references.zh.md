# Agent Note: 把 find-simplifications 的条件章节拆进 references

Status: implemented

[English](2026-08-20-split-find-simplifications-references.md) | 中文

## 问题

治理审计把 `find-simplifications` 标为最大的未预算 SKILL.md（2,105 词）。其中两节是明确条件触发的——合并工作流在「用户要求缩减或合并」note 树时触发，PR 折合工作流在「从另一个 PR 或分支折合简化想法」时触发——按本仓库自己的层级表，它们属于 `references/`，不属于常驻正文。

## 决策

把两节逐字移入 `references/coalesce-notes.md` 与 `references/folding-prs.md`；正文每节保留一句带触发条件的指针。与 dsh-find-simplifications 的功能对等完好——工作流在触发时加载——结构对等到此为止，并记录在 parity 笔记中。

## 备选方案

- **全部保持内联。** 否决：本仓库标准要求条件材料进 `references/`，治理审计把 2,105 词正文标为早前 parity 决策的代价。
- **连 survey+证明 核心也拆。** 否决：工作流的每个分支都会到达它；保持内联。

## 后果

- 正文从 2,105 词降到 1,674 词；两个工作流在指针之后保持完整。
- parity 笔记中「不拆 references/」的条款对这两节被取代，并在那里交叉链接。
