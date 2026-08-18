---
name: roblox-typescript-developer
description: TypeScript-for-Roblox (roblox-ts) development workflow — compile TypeScript to Luau with rbxtsc, work with @rbxts/types, and apply TypeScript-to-Luau interop idioms in Rojo-synced Roblox projects. Use when working on a Roblox project that uses roblox-ts, rbxtsc, @rbxts packages, or a tsconfig targeting roblox-ts, or when the user asks about TypeScript for Roblox.
---

# Roblox TypeScript Developer

Workflow for Roblox projects authored in TypeScript and compiled to Luau with roblox-ts. The build pipeline, package ecosystem, and interop surface differ from plain Luau, so keep them distinct from Luau-authoring habits.

## Build pipeline

The canonical flow is `.ts` source → `rbxtsc` (the roblox-ts compiler) → `.lua` under `out/` → `rojo serve`/`rojo build` → Studio.

- Compiler: `roblox-ts` (npm), binary `rbxtsc`.
- Types: `@rbxts/types`, auto-published against the Roblox API.
- Config: `tsconfig.json` with `compilerOptions` targeting roblox-ts.
- Rojo maps the compiled `out/` directory into the place file, so `default.project.json` points at compiled output, not the `.ts` source.

Edit `.ts` source as the source of truth; do not patch generated Luau under `out/` unless the user asks for an emergency generated-output patch.

## Project detection

Recognize a roblox-ts project by `rbxtsc` in `package.json` scripts, a `tsconfig.json` with roblox-ts settings, `@rbxts/*` packages, and an `out/` directory mapped by `default.project.json`.

## TypeScript-to-Luau interop

Luau and TypeScript index and call differently; see `references/typescript-luau-interop.md` for the full idiom set. The main ones:

- Roblox Instances are 1-indexed; prefer the `@rbxts/types` API surface over raw numeric indexing.
- Multiple return values use `LuaTuple<[A, B]>` rather than an array.
- Preserve Luau colon-call method semantics when the generated code depends on `self`/`this`.
- Imports map to Rojo Instance paths through the compiled `out/` tree, not to the `.ts` filesystem path.

## Server/client boundary

The Roblox authority model is unchanged by TypeScript: authoritative state and validation live on the server; the client handles input, display, prediction, and requests; Remote parameters are type- and permission-checked; DataStore writes are throttled, retried, and failure-handled.

## Verify

- Prefer the project's own scripts: `npm run build`, `npx rbxtsc`, `rojo sourcemap`, `selene`, `stylua`.
- If only static analysis is possible, say explicitly that no Studio / Play Solo run happened.

## Output

- Changes: which `.ts` files and behavior changed, and what Luau was generated.
- Server/client boundary: where authoritative logic lives.
- Remote/DataStore risk: interfaces added or changed.
- Verification: checks actually run; note when Studio cannot run.
