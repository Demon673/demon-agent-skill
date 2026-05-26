# TSTL DOTA2 Reference

Use this reference when a DOTA2 custom game addon uses TypeScriptToLua (TSTL) for server vscripts or TypeScript for Panorama.

## Source References

- TypeScriptToLua configuration: `https://typescripttolua.github.io/docs/configuration`
- TypeScriptToLua language extensions: `https://typescripttolua.github.io/docs/advanced/language-extensions`
- DOTA2 Lua TypeScript declarations: `https://www.npmjs.com/package/@moddota/dota-lua-types`
- ModDota TypeScript addon template: `https://github.com/ModDota/TypeScriptAddonTemplate`
- ModDota TypeScript introduction: `https://moddota.com/scripting/Typescript/typescript-introduction`

Refresh these assumptions when the user asks for latest TSTL behavior.

## Detection

A DOTA2 TSTL project usually has:

- `package.json` with `typescript-to-lua`, `@moddota/dota-lua-types`, `typescript`, or `tstl` scripts.
- `tsconfig.json` with `tstl` options, `compilerOptions.types`, and possibly `compilerOptions.plugins`.
- `src/vscripts/**/*.ts` compiled to `game/scripts/vscripts/**/*.lua`.
- `src/panorama/**/*.ts` compiled to `content/panorama/scripts/custom_game/**/*.js`.
- `game/scripts/npc/*.txt` KV files that still point to generated `.lua` `ScriptFile` paths.

Use `scripts/detect_tstl_project.py <root>` for a quick inventory.

## Build Model

Treat TypeScript as source of truth.

- Edit `src/vscripts/**/*.ts` for server game logic.
- Edit `src/panorama/**/*.ts` for Panorama script logic when present.
- Do not edit generated Lua or JS unless the user explicitly asks for a generated-output patch.
- After source edits, run the repo's own scripts first: `npm run build`, `npm run build:vscripts`, `npm run build:panorama`, or `npm run dev`.
- If no scripts exist, inspect `package.json` and use `npx tstl -p tsconfig.json` only when that matches the project layout.

The ModDota template describes `src/vscripts` as TypeScript code compiled to `game/scripts/vscripts`, and `src/panorama` as TypeScript compiled to `content/panorama/scripts/custom_game`.

## tsconfig Checks

TSTL reads standard `tsconfig.json` files. Check:

- `tstl.luaTarget`: target Lua version. DOTA2 custom games commonly rely on LuaJIT/Lua 5.1-like behavior, so verify the project's existing value before changing it.
- `tstl.luaLibImport`: how helper library code is emitted or imported.
- `tstl.noImplicitSelf`: affects `this` handling and Lua colon/dot call behavior.
- `compilerOptions.types`: should include `@moddota/dota-lua-types` for DOTA2 server declarations and `@typescript-to-lua/language-extensions` when using TSTL helpers.
- `compilerOptions.plugins`: `@moddota/dota-lua-types/transformer` may be present in projects using those declarations.

Do not add or remove TSTL options casually. Preserve the project's current emit layout and module style unless a build error requires a change.

## DOTA2 Type Declarations

`@moddota/dota-lua-types` provides TypeScript declarations for DOTA2 Lua APIs designed for TypeScriptToLua.

Common setup:

```json
{
  "compilerOptions": {
    "types": ["@moddota/dota-lua-types"],
    "plugins": [{ "transform": "@moddota/dota-lua-types/transformer" }]
  }
}
```

The package also exposes normalized enum types through `@moddota/dota-lua-types/normalized`. Keep the style already used by the project.

For engine class extension, prefer declaration merging and project utilities rather than monkey-patching unclear globals.

## TSTL Semantics To Preserve

- `this` matters. DOTA2 APIs and class utilities may rely on Lua colon-call semantics.
- Use `this: void` for callback signatures that must not receive a Lua `self`.
- Use `LuaMultiReturn<T>` for Lua APIs returning multiple values.
- Use `LuaTable<K, V>` and `LuaTable*` helpers when the emitted code needs Lua table behavior instead of JS `Map` or array semantics.
- Arrays are not always Lua tables with identical indexing expectations. Check whether the project uses zero-based TypeScript arrays or one-based Lua-facing tables.
- Avoid JavaScript runtime assumptions such as DOM APIs, browser timers, or Node APIs in vscripts.
- Preserve decorator patterns used by the project for `registerAbility`, `registerModifier`, or custom class registration.

## DOTA2 Integration Checks

For abilities and modifiers:

1. Start from KV `ScriptFile`, `BaseClass`, ability name, and modifier names.
2. Find the generated Lua file only to map back to its source TypeScript.
3. Check registration utilities, decorators, exported class names, and intrinsic modifier names.
4. Search DOTA2 Lua API references through `search_dota2_api.py`.

For events and net tables:

1. Server authority remains in vscripts TypeScript.
2. Panorama TypeScript/JS can send intent with `GameEvents.SendCustomGameEventToServer`.
3. Server code must validate player identity and payload before mutating game state.
4. Shared payload types in `src/common` should match both server and Panorama usage.

For Panorama TypeScript:

- It compiles to Panorama JS, not browser JS.
- Keep using Panorama APIs such as `GameEvents`, `CustomNetTables`, `$`, `Players`, `Entities`, and panel methods.
- Validate CSS/XML with the DOTA2 Panorama references, not web browser docs.

## Review Output

When reviewing or changing TSTL code, report:

- Source file changed and generated file affected, if known.
- Build command run and result.
- Any TSTL semantic risk: `this`, multi-return, table/array indexing, decorators, or generated output drift.
- Any DOTA2 trust-boundary issue between Panorama and server vscripts.
