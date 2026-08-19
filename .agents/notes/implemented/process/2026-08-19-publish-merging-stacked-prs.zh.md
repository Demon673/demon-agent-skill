# Agent Note: 发布 merging-stacked-prs

Status: implemented

[English](2026-08-19-publish-merging-stacked-prs.md) | 中文

## 问题

`merging-stacked-prs` 完全通用（GitHub 原生 `gh stack`，不耦合本仓库），却一直放在内部的 `skills/agent/` 集合里。发布前需确认两点：它没有任何跨引用，以及它与用户全局安装的 `mattpocock/skill` 中的 `resolving-merge-conflicts` 不重叠。

## 决策

把 [`merging-stacked-prs`](../../../../skills/agent/merging-stacked-prs/SKILL.md) 发布到 `skills/agent/` 下。它与 `resolving-merge-conflicts` 是分层关系、不重叠：`merging-stacked-prs` 通过 GitHub 原生栈 API 落地一组依赖 PR；`resolving-merge-conflicts` 逐 hunk 解决进行中的 merge/rebase 冲突。两者是上下游——栈 rebase 遇到冲突时交给逐 hunk 解决，再回到栈流程。

## 备选方案

- **留内部。** 否决：它通用、自包含，且没有任何已装 skill 覆盖，发布后能跨项目复用。
- **并入 `resolving-merge-conflicts`。** 否决：触发不同、层级不同（栈编排 vs 冲突解决），且它依赖 `gh stack`，而冲突解决不依赖。

## 后果

- 发布清单从 15 增至 16 个 skill；内部集合从 6 减至 5 个。
- 与已安装的 `mattpocock/skill` 集合无名称或语义冲突：`merging-stacked-prs` 与 `resolving-merge-conflicts` 作为两个层级共存。
