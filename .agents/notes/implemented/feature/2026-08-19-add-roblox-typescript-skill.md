# Agent Note: Add the roblox-typescript-developer skill

Status: implemented

English | [中文](2026-08-19-add-roblox-typescript-skill.zh.md)

## Problem

The Roblox skills covered only plain Luau. TypeScript-for-Roblox (roblox-ts) is a distinct toolchain — the `rbxtsc` compiler, an npm-based package ecosystem, and a large TypeScript-to-Luau interop surface — that no skill addressed.

## Decision

Add a published [`roblox-typescript-developer`](../../../../skills/roblox/roblox-typescript-developer/SKILL.md) skill under `skills/roblox/`: it covers the `rbxtsc` build pipeline, `@rbxts/types`, TypeScript-to-Luau interop idioms, and the Rojo sync path, and is self-contained with no dependency on the Luau skill. It covers the compiler and interop only; framework layers such as Flamework are out of scope.

## Alternatives considered

- **Fold the TypeScript workflow into `roblox-luau-developer`.** Rejected: it is a separate compiler, package ecosystem, and interop surface, not a thin layer over Luau.
- **Cover the Flamework framework.** Rejected: Flamework is a framework on top of the compiler, not part of the roblox-ts core.

## Consequences

- The published manifest grows from 14 to 15 skills.
- TypeScript-for-Roblox projects now have a dedicated, self-contained entry skill.
