---
name: roblox-luau-developer
description: Roblox Luau development — implement, review, and refactor Luau gameplay scripts (ModuleScripts, ServerScripts/LocalScripts, RemoteEvent/RemoteFunction, DataStore, server/client boundaries); diagnose Roblox gameplay, replication, performance, DataStore, and runtime issues; and understand or sync Rojo-managed Roblox codebases (default.project.json, wally.toml, aftman.toml/rokit.toml, sourcemap.json). Use when working on Roblox, Luau, Roblox Studio code, or Rojo projects, or when debugging Roblox runtime issues.
---

# Roblox Luau Developer

Workflow for implementing, reviewing, and refactoring Roblox Luau code, diagnosing runtime issues, and syncing Rojo-managed codebases. Assumes Luau and the Roblox server/client model; does not assume a project uses Rojo or TypeScript.

## Identify the project shape

First determine how the project is organized:

- Rojo project: look for `default.project.json`, `*.project.json`, `sourcemap.json`.
- Package/tool managers: look for `wally.toml`, `pesde.toml`, `rokit.toml` (or the deprecated `aftman.toml`/`foreman.toml`), `.luaurc`, `selene.toml`, `.stylua.toml`.
- Studio export: recognize `.rbxlx`, `.rbxmx`, `.model.json`, `src/`, `ReplicatedStorage/`, `ServerScriptService/`.
- TypeScript source: a `roblox-ts` project carries `tsconfig.json`, `rbxtsc`, and `@rbxts/*` packages; treat its `.ts` source as the source of truth and do not patch generated Luau under `out/`.

## Read before editing

- Search services, modules, Remote names, Attribute names, and CollectionService tags with `rg`.
- Map the call direction of ServerScripts, LocalScripts, and ModuleScripts.
- Do not invent Instance paths, Remote names, or UI control names.

## Keep the server/client layering

- Authoritative state and validation live on the server.
- The client handles input, display, prediction, and requests.
- Remote parameters must be type- and permission-checked.
- DataStore writes need throttling, retries, and failure handling.

## Prefer small changes

- Preserve an existing module's return shape, service names, and require style.
- Avoid implicit global state in public modules.
- Provide a cleanup path for shared tables and connection objects.

## Debugging

For runtime, replication, performance, DataStore, and UI-not-updating issues, follow the playbook in `references/gameplay-debugging.md`.

## Rojo projects

For understanding, maintaining, and syncing a Rojo-managed codebase, follow `references/rojo-workflow.md`.

## Verify

- Prefer existing checks: `selene`, `stylua`, `luau-lsp`, `lune`, `rojo`, or project scripts.
- If only static analysis is possible, say explicitly that no Studio / Play Solo run happened.

## Output

- Changes: which scripts and behavior changed.
- Server/client boundary: where authoritative logic lives.
- Remote/DataStore risk: interfaces added or changed.
- Verification: checks actually run; note when Studio cannot run.
