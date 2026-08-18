# Agent Note: 合并 Roblox 技能并将游戏技能正文本地化为英文

Status: implemented

[English](2026-08-19-consolidate-roblox-and-localize-game-skills.md) | 中文

## 问题

发布集合里有三个高度重叠的 Roblox 技能（`roblox-luau-developer`、`roblox-gameplay-debugger`、`roblox-rojo-workflow`），全都覆盖 Luau 脚本、RemoteEvent/DataStore 和 server/client 边界；另有四个游戏技能正文用中文写成，违反了 `SKILL.md` 只写英文的规则。两个 Roblox 工具链锚点也已过期：Aftman 已弃用、Wally 处于低维护状态。

## 决策

把三个 Roblox 技能合并为一个 [`roblox-luau-developer`](../../../../skills/roblox/roblox-luau-developer/SKILL.md) 入口：调试 playbook 移入 `references/gameplay-debugging.md`，Rojo 工作流移入 `references/rojo-workflow.md`，原来的两个入口技能删除。把四个中文游戏技能正文重写为英文，并刷新过期的工具链引用：Rojo 项目现在用 Rokit 取代已弃用的 Aftman，并注明 pesde 是 Wally 在积极维护的继任者。Unreal 技能的方法从原始二进制字符串改为结构化解析器（CUE4Parse、UAssetAPI、FModel）。

## 备选方案

- **把游戏技能当作越界直接删除。** 否决：针对主源（GitHub release 与提交日期）的网络调研显示，Dota 2、Roblox/Luau/Rojo 和 Unreal Blueprint 在 2026 年都活跃，它们不是无用的残留。
- **保持三个 Roblox 技能分开。** 否决：它们共享触发与内容；这份重叠正是本 note 要合并的表面。
- **保留中文正文。** 否决：`SKILL.md` 正文必须是英文；frontmatter 已是英文，中文正文违反标准。

## 后果

- 发布清单从 16 减至 14 个技能；Roblox 从三个入口技能变为一个入口加两份引用。
- 四个游戏技能现在携带英文正文；Roblox 工具链引用已是当前状态（Rokit、pesde）。
- Unreal Blueprint 分析现在优先结构化解析器，并携带 UE6/Verse 日落说明。
