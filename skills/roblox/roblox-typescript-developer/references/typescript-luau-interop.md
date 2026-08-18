# TypeScript-to-Luau Interop

Idioms that differ between TypeScript source and the Luau that roblox-ts emits. Consult this when a roblox-ts change touches indexing, callbacks, tuples, imports, or the Rojo path map.

## Indexing

Roblox APIs are 1-indexed; TypeScript arrays are 0-indexed. The `@rbxts/types` surface maps Roblox Instance methods and properties, so prefer those typed members over raw numeric indexing wherever the typed API exposes them.

## Multiple return values

Luau functions can return multiple values; TypeScript expresses them with `LuaTuple<[A, B]>`. Unpack the tuple through the roblox-ts helpers rather than assuming an array.

## Callbacks vs methods

Some Roblox API methods behave differently when wrapped as TypeScript functions; preserve the Luau call semantics (including colon-call method receivers) when the generated code depends on `self`/`this`.

## Imports and Rojo paths

A TypeScript import resolves through the compiled `out/` directory into a Rojo Instance path. Keep the import path aligned with the Rojo tree so the emitted `require` points at the right Instance; do not rely on the `.ts` filesystem path.

## Source of truth

Generated Luau under `out/` is a build artifact. Prefer editing the `.ts` source and running the project's build command; only patch generated Luau when the user asks for an emergency generated-output patch.
