# Agent Note: 做薄 workflow-capture skill

Status: implemented

[English](2026-08-19-thin-workflow-capture.md) | 中文

## 问题

`workflow-capture` 携带了一个七选一的工件分类法（checklist、workflow template、plugin idea、MCP idea、context flow 等），加上否定式的触发边界和与工作区绑定的目标目录规则。2026 的指引是「可复用的流程就该放进 skill」，所以这套分类法和脚手架是投机性的通用化，只增加认知负担，不改变结果。

## 决策

把 `workflow-capture` 收敛到它唯一的工作：把一个复用过的流程变成一个 skill。保留捕获循环——确认复用、提取触发/步骤/检查、剥离私有细节、确认目标位置、落笔——并删掉工件表、捕获简报模板、目标目录清单，以及 independence/否定段落。description 现在直接点名输出是 skill。

## 备选方案

- **保留完整的工件分类法。** 否决：流程属于 skill；checklist/template/plugin/MCP 这些行是投机且过时的（pre-2026）。
- **整个移除该 skill。** 否决：它生产 skill，过了流程门槛——是唯一仍站得住的元 skill。

## 后果

- `workflow-capture` 是一个输出 skill 的薄元 skill，从 114 行的分类法收缩为一个聚焦的捕获循环。
- 「最小工件」的决策消失；输出要么是 skill，要么不捕获。
