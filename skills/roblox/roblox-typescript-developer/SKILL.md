---
name: roblox-typescript-developer
description: TypeScript-for-Roblox (roblox-ts) development workflow — compile TypeScript to Luau with rbxtsc, work with @rbxts/types, and apply TypeScript-to-Luau interop idioms in Rojo-synced Roblox projects. Use when working on a Roblox project that uses roblox-ts, rbxtsc, @rbxts packages, or a tsconfig targeting roblox-ts, when the user asks about TypeScript for Roblox, or when Roblox UI is authored in TypeScript; UI structure, focus, and motion follow `roblox-ui-developer`.
---

# Roblox TypeScript Developer

Workflow for Roblox projects authored in TypeScript and compiled to Luau with roblox-ts. The build pipeline, package ecosystem, and interop surface differ from plain Luau.

## Build pipeline

The canonical flow is `.ts` source → `rbxtsc` (the roblox-ts compiler) → `.lua` under `out/` → `rojo serve`/`rojo build` → Studio.

- Compiler: `roblox-ts` (npm), binary `rbxtsc`.
- Types: `@rbxts/types`, auto-published against the Roblox API.
- Config: `tsconfig.json` with `compilerOptions` targeting roblox-ts.
- Rojo maps the compiled `out/` directory into the place file, so `default.project.json` points at compiled output, not the `.ts` source.

Edit `.ts` source; `out/` is its build artifact, patched only in an emergency the user names.

## Project detection

Recognize a roblox-ts project by `rbxtsc` in `package.json` scripts, a `tsconfig.json` with roblox-ts settings, `@rbxts/*` packages, and an `out/` directory mapped by `default.project.json`.

## TypeScript-to-Luau interop

Luau and TypeScript index and call differently; see `references/typescript-luau-interop.md` for the full idiom set. The main ones:

- Roblox Instances are 1-indexed; read them through the `@rbxts/types` members.
- Multiple return values use `LuaTuple<[A, B]>` rather than an array.
- Preserve Luau colon-call method semantics when the generated code depends on `self`/`this`.
- Imports map to Rojo Instance paths through the compiled `out/` tree, not to the `.ts` filesystem path.

## UI in TypeScript

React-lua and Fusion have TypeScript bindings, so a screen can be authored as components that produce Instances instead of a hand-built Explorer hierarchy:

- `@rbxts/react` with `@rbxts/react-roblox` — React components for Roblox. JSX compiles through `compilerOptions.jsxFactory: "React.createElement"` and `jsxFragmentFactory: "React.Fragment"`.
- `@rbxts/fusion` — reactive state-driven UI; `@rbxts/ripple` for spring animation; `@rbxts/pretty-react-hooks` for shared hooks.

Component source lives in the Rojo-mapped source tree and the emitted Luau under `out/` is what Studio mounts, so a new UI module needs a matching Rojo path. Layout, safe areas, focus, motion, and the verification matrix are identical to any Roblox interface: follow `roblox-ui-developer`.

## Server/client boundary

The Roblox authority model is unchanged by TypeScript: authoritative state and validation live on the server; the client handles input, display, prediction, and requests; Remote parameters are type- and permission-checked; DataStore writes are throttled, retried, and failure-handled.

## Pitfalls

- A hand-edited file under `out/` disappears on the next build: fix the `.ts` source and rebuild.
- An import path that does not match the Rojo tree emits a `require` for the wrong Instance: align imports with the mapped `out/` layout.
- Array-shaped assumptions about Roblox APIs: they answer 1-indexed and can return several values — use `LuaTuple<[A, B]>` and the `@rbxts/types` members.
- Services looked up by string lose their type: import them from `@rbxts/services`.
- A stale build while Rojo serves leaves Studio on the previous behaviour: run the project's build or watch command.

## Verify

- Run the project's own scripts first: `npm run build`, `npx rbxtsc`, `rojo sourcemap`, `selene`, `stylua`.
- Grade the evidence: executed in Studio, statically checked (build, typecheck, lint, analyze), prepared but not run, or unverified. Never present the latter three as a Studio pass.

## Output

- Changes: which `.ts` files and behavior changed, and what Luau was generated.
- Server/client boundary: where authoritative logic lives.
- Remote/DataStore risk: interfaces added or changed.
- Verification: checks actually run, graded as above.
