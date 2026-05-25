---
name: unreal-blueprint-analyzer
description: Analyze Unreal Engine Blueprint assets such as .uasset and .umap files without modifying them, then infer their purpose from binary strings, editor exports, native/source code, project docs, configs, and asset references. Use when the user asks to parse, inspect, explain, reverse-read, or understand any Unreal Engine Blueprint, widget blueprint, animation blueprint, behavior tree asset, data asset, map asset, or plugin/game-specific Blueprint file.
---

# Unreal Blueprint Analyzer

Use this skill for read-only analysis of Unreal Blueprint-style binary assets from any Unreal Engine project. Treat `.uasset`, `.umap`, and similar Unreal assets as binary source-of-truth files that should not be patched directly.

## Ground rules

- Never directly edit `.uasset`, `.umap`, `.navmesh`, or other Unreal binary assets.
- Separate confirmed facts from inference. Label evidence as script/docs/reference/binary-string/editor-export.
- Prefer official editor export, commandlets, or user-provided screenshots/JSON if available.
- If the user asks for modification, provide safe editor steps or scriptable editor/export-pipeline options instead of binary patching.

## Workflow

1. Identify the asset path and type: actor Blueprint, UI widget, behavior tree task, data asset, map, or unknown.
2. Find adjacent code, configs, and docs:
   - Match the asset name/path to nearby C++, Blueprint nativization artifacts, Python/Editor Utility scripts, Verse, Lua, C#, plugin scripts, config files, data tables, or project-specific script layers.
   - Search for asset name, generated class name, parent class, class path, component/widget names, event/function names, delegates, RPC names, gameplay tags, blackboard keys, input actions, data table rows, and config references.
   - Read project notes such as `AGENTS.md`, `CONTEXT.md`, `README.md`, design docs, plugin docs, and source comments when present.
3. Extract binary strings from the asset without changing it:
   - Prefer bundled script: `python <skill>/scripts/extract_uasset_strings.py <asset> --json`.
   - If Python is unavailable, use platform tools such as `strings`, PowerShell byte reads, or editor exports.
4. Classify extracted clues:
   - Asset/class paths and parent-class clues.
   - Component/widget names and exposed variables.
   - Function/event/RPC names.
   - Blackboard keys, data table names, tags, sockets, animation names, and referenced assets.
5. Cross-check clues against source, configs, docs, and editor exports. A string found only in binary is weak evidence; a binary string also used by code, config, docs, or exported asset data is stronger.
6. Produce a short report with confidence levels and exact follow-up editor checks when static analysis cannot prove execution flow.

## Output Shape

Use this structure unless the user requested a different format:

- **Asset**: path, inferred type, related source/config/export paths.
- **Purpose**: what the Blueprint likely does, with confidence.
- **Evidence**: bullets grouped by confirmed script/docs evidence and inferred binary-string evidence.
- **Runtime Contracts**: required component/widget names, fields, blackboard keys, RPCs, resource paths, save/sync fields.
- **Risks / Unknowns**: what cannot be proven from static binary analysis.
- **Editor Follow-Up**: concrete Blueprint editor checks or safe changes the user should make manually.

## Local Command Examples

```powershell
python C:\Users\MAC\.agents\skills\unreal-blueprint-analyzer\scripts\extract_uasset_strings.py Content\Blueprints\BP_Door.uasset --json
rg "BP_Door|Door_C|OpenDoor|Interact|BeginOverlap" Source Content Config Plugins docs
```

For project-specific Unreal stacks, adapt the adjacent-code search to that stack instead of assuming a scripting language. Examples: native C++ classes in `Source/`, Editor Utility Python, Verse in UEFN projects, Lua in Oasis/PUBG Mobile UGC projects, C# in UnrealCLR-style integrations, plugin-defined Blueprint libraries, or data-driven configs.
