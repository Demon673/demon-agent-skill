# Agent Note: 新增 roblox-typescript-developer 技能

Status: implemented

[English](2026-08-19-add-roblox-typescript-skill.md) | 中文

## 问题

Roblox 技能只覆盖纯 Luau。TypeScript-for-Roblox（roblox-ts）是一套独立的工具链——`rbxtsc` 编译器、基于 npm 的包生态，以及一大片 TypeScript 到 Luau 的互操作表面——没有任何技能覆盖它。

## 决策

在 `skills/roblox/` 下新增一个发布的 [`roblox-typescript-developer`](../../../../skills/roblox/roblox-typescript-developer/SKILL.md) 技能：覆盖 `rbxtsc` 构建管线、`@rbxts/types`、TypeScript 到 Luau 的互操作习语和 Rojo 同步路径，且自包含、不依赖 Luau 技能。它只覆盖编译器与互操作；诸如 Flamework 的框架层不在范围内。

## 备选方案

- **把 TypeScript 工作流并入 `roblox-luau-developer`。** 否决：它是独立的编译器、包生态与互操作表面，不是 Luau 上的薄层。
- **覆盖 Flamework 框架。** 否决：Flamework 是编译器之上的框架，不属于 roblox-ts 的核心。

## 后果

- 发布清单从 14 增至 15 个技能。
- TypeScript-for-Roblox 项目现在有了专属、自包含的入口技能。
