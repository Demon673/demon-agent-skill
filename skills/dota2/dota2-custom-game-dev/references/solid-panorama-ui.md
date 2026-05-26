# SolidJS Panorama UI Reference

Use this reference when a DOTA2 custom game addon builds Panorama UI with SolidJS, TSX, and a custom Panorama renderer/build pipeline.

## Source References

- SolidJS documentation: `https://docs.solidjs.com/`
- SolidJS TypeScript guide: `https://docs.solidjs.com/configuration/typescript`
- SolidJS createSignal: `https://docs.solidjs.com/reference/basic-reactivity/create-signal`
- SolidJS createEffect: `https://docs.solidjs.com/reference/basic-reactivity/create-effect`
- SolidJS fine-grained reactivity: `https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity`
- Local case study: `C:\Repositories\tui12`

Use official SolidJS docs for core reactivity semantics, but use the project build/runtime for Panorama-specific behavior.

## tui12 Case Study

`C:\Repositories\tui12` is the reference project for this skill's SolidJS Panorama conventions.

Observed structure:

- `package.json` has `scripts.build:solid = ts-node -r ./solid/build-write-file.ts ./solid/build.ts`.
- `package.json` has `scripts.dev:solid = ts-node -r ./solid/build-write-file.ts ./solid/build.ts --watch`.
- `package.json.panorama` declares `Hud`, `FlyoutScoreboard`, `Tooltip`, `ContextMenu`, `Common`, `scripts`, `kv`, and `ServiceConfig` lists.
- `solid/build.ts` bundles `panorama-polyfill.js` through `solid-panorama-polyfill`, then starts Rollup watch/build.
- `solid/build-rollup-config.ts` builds entry files from `solid/src/ui/<name>/<name>.tsx`, tooltips from `solid/src/ui/tooltips/<name>/<name>.tsx`, and context menus from `solid/src/ui/context_menus/<name>/<name>.tsx`.
- Rollup outputs JS to `content/<addon>/panorama/scripts/custom_game`, XML to `content/<addon>/panorama/layout/custom_game`, and CSS to `content/<addon>/panorama/styles/custom_game`.
- Babel uses `@bigciba/babel-preset-solid-panorama` with `moduleName: "@bigciba/solid-panorama-runtime"` and `generate: "universal"`.
- TS config uses `jsx: "preserve"`, `jsxImportSource: "solid-js"`, and `@moddota/panorama-types`.
- UI entries import `render` from `@bigciba/solid-panorama-runtime` and mount into `$.GetContextPanel()`.
- Helpers such as `solid/src/utils/solid_utils.ts` wrap `CustomNetTables`, `GameEvents`, player data, and service data into Solid signals/stores with cleanup.

Do not copy tui12 business logic into other projects. Reuse the structural conventions only.

## Detection

A SolidJS Panorama project may have:

- `solid-js` in dependencies.
- Panorama-specific renderer/runtime packages such as `@bigciba/solid-panorama-runtime`, `@bigciba/babel-preset-solid-panorama`, `solid-panorama-all-in-jsx`, or `solid-panorama-polyfill`.
- `package.json.panorama` page lists.
- `solid/build.ts`, `solid/build-rollup-config.ts`, or equivalent Rollup/Babel build scripts.
- `solid/src/ui/**/*.tsx` UI entries.
- `solid/src/components/**/*.tsx` shared components.
- `solid/src/utils/**/*` helpers for `GameEvents`, `CustomNetTables`, localization, requests, and panel operations.
- Generated Panorama outputs under `content/<addon>/panorama/{scripts,layout,styles}/custom_game`.

Use `scripts/detect_solid_panorama_project.py <root>` for a quick inventory.

## Source Of Truth

Treat Solid TSX and style sources as source of truth.

- Edit `solid/src/ui/**/*.tsx`, `solid/src/components/**/*.tsx`, `solid/src/utils/**/*.ts`, and adjacent `.less`/`.scss` files.
- Edit `package.json.panorama` when adding/removing UI entries.
- Edit build plugins only when generated XML/CSS/manifest behavior is wrong.
- Inspect generated JS/XML/CSS for diagnosis, but do not patch generated output unless the user asks for an emergency output-only change.

## Entry Flow

For a UI panel named `hud_setting` in the tui12-style layout:

1. `package.json.panorama.Hud` contains `"hud_setting"`.
2. Source entry is `solid/src/ui/hud_setting/hud_setting.tsx`.
3. Optional source XML is `solid/src/ui/hud_setting/hud_setting.xml`.
4. Optional source style is `solid/src/ui/hud_setting/hud_setting.less` or `.scss`.
5. Build emits `hud_setting.js`, `hud_setting.xml`, and `hud_setting.css` into the DOTA2 `content/<addon>/panorama` output roots.
6. `custom_ui_manifest.xml` references the generated layout.

For tooltips and context menus, preserve nested output paths such as `tooltips/<name>` and `context_menus/<name>`.

## Solid Semantics In Panorama

- Components do not rerender like React components. Signals, memos, and effects update fine-grained dependencies.
- Use `createSignal` for local UI state, `createMemo` for derived state, and `createEffect` for side effects.
- Prefer `onMount` for Panorama subscriptions created after panel creation.
- Always clean up `GameEvents.Subscribe`, `CustomNetTables.SubscribeNetTableListener`, timers, and panel handlers with `onCleanup`.
- Do not assume browser DOM APIs exist. Panorama exposes `$`, `Panel`, `GameEvents`, `CustomNetTables`, `Players`, `Entities`, `Abilities`, and panel-specific APIs.
- Keep client UI state separate from server authority. Client requests must be validated by Lua/TSTL server code.

## Styling And XML

- Panorama CSS is not browser CSS. Validate properties with `search_dota2_api.py --kind css`.
- Use project-supported generated XML behavior. In tui12-style builds, XML plugins inject `eomstyle.css`, per-entry CSS, `panorama-polyfill.js`, `common.js`, and sequence actions when needed.
- Keep source XML includes minimal when the build plugin already injects common scripts/styles.
- Check generated XML only to confirm includes and output paths.

## Review Checklist

When changing SolidJS Panorama UI:

- Identify the entry in `package.json.panorama`.
- Confirm source TSX and generated output path.
- Confirm any adjacent `.less`, `.scss`, or `.xml` source.
- Check event/net table subscriptions and cleanup.
- Check server/client trust boundary for any request.
- Run `npm run build:solid` or the project's equivalent build command when available.
- If build cannot run, report why and mark validation as static-only.
