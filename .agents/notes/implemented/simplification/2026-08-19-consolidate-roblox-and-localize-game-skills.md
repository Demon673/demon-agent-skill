# Agent Note: Consolidate the Roblox skills and localize the game skills

Status: implemented

English | [中文](2026-08-19-consolidate-roblox-and-localize-game-skills.zh.md)

## Problem

The published set carried three overlapping Roblox skills (`roblox-luau-developer`, `roblox-gameplay-debugger`, `roblox-rojo-workflow`) that all cover Luau scripts, RemoteEvent/DataStore, and server/client boundaries, and four game skills whose bodies were written in Chinese against the English-only `SKILL.md` rule. Two Roblox toolchain anchors were also stale: Aftman is deprecated and Wally is in low-maintenance mode.

## Decision

Merge the three Roblox skills into one [`roblox-luau-developer`](../../../../skills/roblox/roblox-luau-developer/SKILL.md) entry point: the debugging playbook moves to `references/gameplay-debugging.md`, the Rojo workflow to `references/rojo-workflow.md`, and the two former entry skills are deleted. Rewrite the four Chinese game-skill bodies into English, and refresh the stale toolchain references: Rojo projects now use Rokit in place of the deprecated Aftman, and pesde is noted as Wally's actively maintained successor. The Unreal skill's method moves from raw binary strings to structured parsers (CUE4Parse, UAssetAPI, FModel).

## Alternatives considered

- **Remove the game skills outright as out-of-scope.** Rejected: web research against primary sources (GitHub releases and commit dates) shows Dota 2, Roblox/Luau/Rojo, and Unreal Blueprint are all active in 2026, so they are not useless residue.
- **Keep the three Roblox skills separate.** Rejected: they share triggers and content; the overlap is exactly the surface this note consolidates.
- **Keep the Chinese bodies.** Rejected: `SKILL.md` bodies must be English; frontmatter is already English and a Chinese body violates the standard.

## Consequences

- The published manifest shrinks from 16 to 14 skills; Roblox goes from three entry skills to one plus two references.
- The four game skills now carry English bodies; the Roblox toolchain references are current (Rokit, pesde).
- Unreal Blueprint analysis now prefers structured parsers and carries the UE6/Verse sunset note.
