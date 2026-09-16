---
name: roblox-luau-developer
description: Roblox Luau development — implement, review, and refactor Luau gameplay scripts; diagnose Roblox gameplay, replication, performance, DataStore, and runtime issues; and understand or sync Rojo-managed Roblox codebases. Use when working on Roblox, Luau, Roblox Studio code, or Rojo projects, or when debugging Roblox runtime issues.
---

# Roblox Luau Developer

Workflow for implementing, reviewing, and refactoring Roblox Luau code, diagnosing runtime issues, and syncing Rojo-managed codebases. Assumes Luau and the Roblox server/client model; the project shape comes next.

## Identify the project shape

First determine how the project is organized:

- Rojo project: a `default.project.json` or `*.project.json`; the toolchain files and sync workflow live in `references/rojo-workflow.md`.
- Studio export: recognize `.rbxlx`, `.rbxmx`, `.model.json`, `src/`, `ReplicatedStorage/`, `ServerScriptService/`.
- TypeScript source: a `roblox-ts` project carries `tsconfig.json`, `rbxtsc`, and `@rbxts/*` packages; its `.ts` source is the source of truth and `out/` is the build artifact `roblox-typescript-developer` owns.

## Read before editing

- Search services, modules, Remote names, Attribute names, and CollectionService tags with `rg`.
- Map the call direction of ServerScripts, LocalScripts, and ModuleScripts.
- Instance paths, Remote names, and UI control names come from the project.

## Keep the server/client layering

- Authoritative state and validation live on the server.
- The client handles input, display, prediction, and requests.
- Remote parameters must be type- and permission-checked.
- DataStore writes need throttling, retries, and failure handling.

## Prefer small changes

- Preserve an existing module's return shape, service names, and require style.
- Module state lives in the module or arrives as a parameter.
- Provide a cleanup path for shared tables and connection objects.

## Debugging

For runtime, replication, performance, DataStore, and UI-not-updating issues, follow the playbook in `references/gameplay-debugging.md`. When the defect is UI layout, focus, or screen lifecycle rather than data flow, hand it to `roblox-ui-developer`.

## Rojo projects

For understanding, maintaining, and syncing a Rojo-managed codebase, follow `references/rojo-workflow.md`.

## Pitfalls

- Client input is untrusted: validate the type and range of every remote argument on the server, which owns health, currency, and inventory.
- `LocalScript` placement decides whether client code runs at all — `StarterPlayerScripts`, `StarterCharacterScripts`, `StarterGui`, or a tool. Server `Script`s belong in `ServerScriptService` or `Workspace`.
- Use `task.wait`, `task.spawn`, and `task.delay`; the globals `wait`, `spawn`, and `delay` are deprecated and schedule worse.
- Set properties before `Parent`: parenting replicates, so the instance should replicate once, in its final state.
- The client can see `nil` for an object that has not replicated yet: index through `parent:WaitForChild("Name")` right after a join.
- Keep connection objects and disconnect them on teardown; long-lived `:Connect` handlers leak and fire on destroyed instances. Use `:Once` for a single expected call.
- `RemoteFunction` blocks its caller, so a slow client can stall the server: prefer one-way `RemoteEvent`s unless a reply is genuinely required.

## Verify

- Prefer existing checks: `selene`, `stylua`, `luau-lsp`, `lune`, `rojo`, or project scripts.
- Grade the evidence: executed in Studio, statically checked (lint, analyze, sourcemap), prepared but not run, or unverified. Never present the latter three as a Studio pass.

## Output

- Changes: which scripts and behavior changed.
- Server/client boundary: where authoritative logic lives.
- Remote/DataStore risk: interfaces added or changed.
- Verification: checks actually run, graded as above.
