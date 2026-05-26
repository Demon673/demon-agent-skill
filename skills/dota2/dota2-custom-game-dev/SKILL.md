---
name: dota2-custom-game-dev
description: Use when working on DOTA2 custom game addons, including server Lua, TypeScriptToLua/TSTL vscripts, SolidJS Panorama UI, TypeScript Panorama, Panorama JavaScript, Panorama CSS/XML, KV files, abilities, modifiers, custom game events, net tables, and API lookup against BigCiba/vscode-dota2-tools references.
---

# DOTA2 Custom Game Dev

Use this skill for DOTA2 custom game addon work across Lua, TypeScriptToLua/TSTL, SolidJS Panorama UI, Panorama JS/TS, Panorama CSS/XML, and KV files.

## Reference Source

Primary API reference data comes from `BigCiba/vscode-dota2-tools`.

- Upstream repo: `https://github.com/BigCiba/vscode-dota2-tools`
- Preview docs: `https://bigciba.github.io/`
- Local source map: `references/upstream-source-map.md`
- TSTL DOTA2 guide: `references/tstl-dota2.md`
- SolidJS Panorama guide: `references/solid-panorama-ui.md`
- Refresh script: `scripts/update_references.ps1`
- API search helper: `scripts/search_dota2_api.py`
- TSTL project detector: `scripts/detect_tstl_project.py`
- SolidJS Panorama detector: `scripts/detect_solid_panorama_project.py`

Do not treat the bundled references as permanent truth. They are snapshots and should be refreshed from upstream when the user asks for latest API behavior or when API accuracy matters.

## Project Model

Start by identifying the addon roots:

- Game scripts: `game/scripts/vscripts/`
- NPC/KV config: `game/scripts/npc/`
- Panorama layout: `content/panorama/layout/custom_game/`
- Panorama JS: `content/panorama/scripts/custom_game/`
- Panorama CSS: `content/panorama/styles/custom_game/`
- Localization: `game/resource/`
- TSTL source, when present: `src/vscripts/`, `src/panorama/`, `src/common/`
- SolidJS Panorama source, when present: `solid/src/ui/`, `solid/src/components/`, `solid/src/utils/`

If the project layout differs, search for `addon_game_mode.lua`, `npc_abilities_custom.txt`, `custom_net_tables.txt`, `custom_events.txt`, `custom_ui_manifest.xml`, `layout/custom_game`, `package.json`, `tsconfig.json`, `tstl`, `solid/build.ts`, and `solid/src/ui`.

For TSTL projects, inspect the generated Lua but edit the TypeScript source. Do not patch generated Lua under `game/scripts/vscripts/` unless the user explicitly asks for an emergency generated-output patch.

For SolidJS Panorama projects, inspect generated JS/XML/CSS but edit the Solid TSX, Less/SCSS, declarations, or build scripts. Do not patch generated Panorama assets unless the user explicitly asks for an emergency generated-output patch.

## API Lookup Workflow

Prefer targeted lookup through the bundled script instead of reading large JSON files directly.

```powershell
python C:\Users\MAC\.agents\skills\dota2-custom-game-dev\scripts\search_dota2_api.py --kind lua --query CustomGameEventManager
python C:\Users\MAC\.agents\skills\dota2-custom-game-dev\scripts\search_dota2_api.py --kind js --query SendCustomGameEventToServer
python C:\Users\MAC\.agents\skills\dota2-custom-game-dev\scripts\search_dota2_api.py --kind css --query flow-children
python C:\Users\MAC\.agents\skills\dota2-custom-game-dev\scripts\search_dota2_api.py --kind panel --query DOTAAbilityImage
python C:\Users\MAC\.agents\skills\dota2-custom-game-dev\scripts\detect_tstl_project.py C:\path\to\addon
python C:\Users\MAC\.agents\skills\dota2-custom-game-dev\scripts\detect_solid_panorama_project.py C:\path\to\addon
```

When references are missing or stale, refresh them:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Users\MAC\.agents\skills\dota2-custom-game-dev\scripts\update_references.ps1
```

If the skill is used from a cloned source repo, run the script from the repo path instead.

## Boundaries

- Server Lua is authoritative. Do not trust Panorama client payloads for economy, damage, inventory, rewards, cooldowns, or win conditions.
- Panorama JS is client UI logic. It can send intent to the server, read public state from custom net tables, and update panels, but server Lua must validate.
- KV files define data and engine bindings. Verify `ScriptFile`, `BaseClass`, `AbilitySpecial`, modifier names, and localization tokens against Lua and Panorama usage.
- CSS is Panorama CSS, not browser CSS. Check the DOTA2 CSS reference before using modern web CSS.
- XML panels are Panorama panels, not DOM elements. Check panel-specific attributes/events before assuming browser semantics.
- TSTL changes should preserve emitted Lua semantics. Be careful with `this`, multi-return values, Lua arrays/tables, decorators, module imports, and APIs that rely on Lua colon-call behavior.
- Generated Lua and generated Panorama JS are build artifacts in TSTL template projects. Prefer fixing `src/**/*.ts` and then running the repo's build/typecheck command.
- SolidJS Panorama is not browser DOM work. Components render into Panorama panels, use Panorama events/attributes, and must respect Panorama CSS/XML limitations.
- Solid effects and subscriptions must clean up `GameEvents`, `CustomNetTables`, timers, and panel handlers with `onCleanup` or the project's helper utilities.

## Common Workflows

For Lua ability or modifier work:

1. Find the KV entry and `ScriptFile`.
2. Inspect Lua class names, `LinkLuaModifier`, intrinsic modifiers, and special value reads.
3. Search the Lua API reference for engine calls.
4. Validate server/client boundary and authority.

For TSTL vscripts work:

1. Run or emulate `scripts/detect_tstl_project.py` to find `package.json`, `tsconfig.json`, TSTL packages, and source/output roots.
2. Read `references/tstl-dota2.md` before changing TypeScript semantics.
3. Trace from KV `ScriptFile` to generated Lua and then back to `src/vscripts/**/*.ts`.
4. Prefer source edits in TypeScript and validate with the repository's scripts such as `npm run build`, `npm run build:vscripts`, `npm run dev`, or `npx tstl -p tsconfig.json`, depending on what exists.
5. If build commands need dependencies or network, ask for permission or report the missing dependency clearly.

For Panorama UI work:

1. Locate XML, JS, CSS, and `custom_ui_manifest.xml`.
2. Search JS APIs for `GameEvents`, `CustomNetTables`, `Players`, `Entities`, or `Abilities`.
3. Search CSS and panel references for unsupported properties or wrong panel attributes.
4. Trace event flow between JS and Lua through `CustomGameEventManager` and `GameEvents`.

For SolidJS Panorama UI work:

1. Run or emulate `scripts/detect_solid_panorama_project.py` to find `package.json.panorama`, Solid dependencies, source roots, build scripts, and output roots.
2. Read `references/solid-panorama-ui.md` before changing Solid rendering, reactivity, generated XML/CSS, or manifest behavior.
3. Trace a UI entry from `package.json.panorama` to `solid/src/ui/<name>/<name>.tsx`, then to generated `content/<addon>/panorama/scripts/custom_game/<name>.js`, layout XML, styles, and `custom_ui_manifest.xml`.
4. Prefer source edits in TSX/Less/SCSS/declarations/build plugins and validate with `npm run build:solid` or the project's equivalent command.
5. Keep DOTA2 trust boundaries: Solid/Panorama may send intent and render replicated state, but server vscripts remain authoritative.

For synchronization bugs:

1. Identify whether state should be push event, net table, or local-only UI state.
2. In Lua, inspect `CustomGameEventManager:RegisterListener`, `CustomNetTables:SetTableValue`, and player validation.
3. In JS, inspect `GameEvents.Subscribe`, `GameEvents.SendCustomGameEventToServer`, and `CustomNetTables.SubscribeNetTableListener`.
4. Report stale state, trust boundary, and lifecycle risks separately.

## Output

When explaining an API or fixing code, include:

- Which layer is involved: Lua server, Panorama JS, CSS/XML, KV, or localization.
- The exact project files and API references used.
- Any server/client trust boundary.
- Whether the code is source TypeScript or generated Lua/JS.
- Whether SolidJS Panorama source or generated Panorama assets were changed.
- Any reference freshness caveat if the bundled snapshot was not refreshed in the current turn.
