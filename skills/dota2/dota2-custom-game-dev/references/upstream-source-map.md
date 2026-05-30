# Upstream Source Map

The DOTA2 API references in this skill are derived from:

- Repository: `https://github.com/BigCiba/vscode-dota2-tools`
- License: MIT, matching the upstream repository license at the time this source map was created.

The upstream README describes DOTA2 documentation support for Lua API, JS API, CSS document, and panel document browsing. It also includes KV editor, completion, icon browser, localization, and KV conversion tools.

## Bundled Snapshot Paths

The refresh script copies these files into `references/vendor/vscode-dota2-tools/`:

- `resource/dota_script_help2.json`: DOTA2 Lua API classes, functions, constants, return types, parameter metadata, descriptions, and examples.
- `resource/cl_panorama_script_help_2.json`: Panorama JavaScript API classes and functions.
- `resource/dump_panorama_css_properties.json`: Panorama CSS property list and descriptions.
- `resource/dump_panorama_events.md`: Panorama event reference.
- `resource/PanelList.json`: Panorama panel list and index ranges.
- `resource/PanelList.md`: Panorama panel attributes/events document.
- `resource/lua_api_changelog.md`: Lua API changelog snapshot.
- `css.css-data.json`: VS Code CSS custom data contributed by upstream.
- `html.html-data.json`: VS Code HTML custom data contributed by upstream, if present.

Large asset databases such as `items_game.json`, `rogue_wearable.json`, and `soundevents.json` are intentionally not copied by default. Add them only for tasks that need cosmetics, sound events, or full game asset lookup.

## Update Policy

When the user asks to update this skill's DOTA2 API references, refresh from upstream instead of editing vendor files manually:

```powershell
powershell -ExecutionPolicy Bypass -File .\skills\dota2\dota2-custom-game-dev\scripts\update_references.ps1
```

The script writes `references/vendor/vscode-dota2-tools/UPSTREAM.json` with the upstream commit, update time, source URL, and copied file list.

If upstream changes file names or schema, update `scripts/search_dota2_api.py` and this source map in the same change.
