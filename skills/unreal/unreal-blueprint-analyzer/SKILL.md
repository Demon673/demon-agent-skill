---
name: unreal-blueprint-analyzer
description: Read-only analysis of Unreal Engine Blueprint assets, including .uasset, .umap, Widget Blueprint, Animation Blueprint, Behavior Tree, Data Asset, and map assets. Use structured parsers (CUE4Parse, UAssetAPI, FModel), binary strings, editor exports, C++ or scripting source, project docs, config, and asset references to infer Blueprint purpose. Use when the user asks to parse, inspect, explain, reverse-read, or understand any Unreal Engine Blueprint or Blueprint-related asset.
---

# Unreal Blueprint Analyzer

Read-only analysis of Blueprint binary assets in any Unreal Engine project. Treat `.uasset`, `.umap`, and similar Unreal assets as binary source files; never patch them in place.

## Core rules

- Do not edit `.uasset`, `.umap`, `.navmesh`, or other Unreal binary assets directly.
- Separate confirmed fact from inference. Label evidence sources as source, docs, references, binary strings, or editor exports.
- Prefer the most reliable source available: official editor exports, Commandlets, user-provided screenshots, or JSON.
- If the user asks to modify a Blueprint, give safe editor steps or a scriptable editor/export pipeline, not a binary patch.

## Parsing method

Prefer structured parsers over raw string grepping:

- CUE4Parse (the .NET library behind FModel) for `.uasset`, `.umap`, and `.pak` package structure.
- UAssetAPI for Blueprint Kismet bytecode and expression graphs.
- FModel as a ready-made viewer and exporter.

Fall back to `python <skill>/scripts/extract_uasset_strings.py <asset> --json` (or `strings` / PowerShell byte reads) when no structured parser is available.

## Workflow

1. Identify the asset path and type: Actor Blueprint, UI Widget, Behavior Tree Task, Data Asset, Map, or unknown.
2. Find adjacent source, config, and docs: match the asset name or path to nearby C++, Blueprint nativization output, Python/Editor Utility, Verse, Lua, C#, plugin scripts, config files, data tables, or project scripting layers; search asset names, generated class names, parent classes, ClassPaths, component names, Widget names, event/function names, Delegates, RPC names, Gameplay Tags, Blackboard keys, Input Actions, Data Table rows, and config references; read `AGENTS.md`, `CONTEXT.md`, `README.md`, design docs, plugin docs, or source comments if present.
3. Extract clues without modifying the asset: prefer the built-in script `python <skill>/scripts/extract_uasset_strings.py <asset> --json`; otherwise use `strings`, PowerShell byte reads, or editor exports.
4. Classify the extracted clues: asset paths, ClassPaths, and parent classes; component names, Widget names, and exposed variables; function, event, and RPC names; Blackboard keys, Data Table names, tags, sockets, animation names, and referenced assets.
5. Cross-validate clues against source, config, docs, and editor exports. Strings that appear only in the binary are weak evidence; clues that also appear in source, config, docs, or exports are stronger.
6. Write a short report. When static analysis cannot prove execution flow, give a confidence level and concrete editor re-check points.

## Sunset note

Blueprint is still a first-class authoring system in shipping UE5, but Epic has announced a gradual migration to Verse (UE6 early access expected Q4 2027, full by mid-2029). Treat Blueprint assets as long-lived but not evergreen; do not present this workflow as permanent.

## Output format

Unless the user specifies otherwise, use this structure:

- Asset: path, inferred type, and related source/config/export paths.
- Purpose: what the Blueprint most likely does, with a confidence level.
- Evidence: grouped into confirmed source/doc evidence and binary-string inference.
- Runtime contracts: component names, Widget names, fields, Blackboard keys, RPCs, asset paths, and save/sync fields the runtime depends on.
- Risks / Unknowns: what static binary analysis cannot prove.
- Editor follow-up: specific items to re-check in the Blueprint editor, or safe manual changes.

## Local command examples

```powershell
python .\scripts\extract_uasset_strings.py <path-to-asset>.uasset --json
rg "BP_Door|Door_C|OpenDoor|Interact|BeginOverlap" Source Content Config Plugins docs
```

When a project uses a custom Unreal tech stack, follow that stack for adjacent code — do not presume a scripting language. For example: C++ classes in `Source/`, Editor Utility Python, Verse in UEFN projects, Lua in Oasis/PUBG Mobile UGC projects, C# in UnrealCLR-style integrations, plugin-defined Blueprint Libraries, or data-driven config.
