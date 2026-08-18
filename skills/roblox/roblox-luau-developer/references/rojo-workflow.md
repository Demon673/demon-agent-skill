# Roblox Rojo Workflow

Filesystem-to-Studio sync workflow for Roblox projects. Understand the project structure safely, edit source, and avoid breaking generated assets.

## Workflow

1. Identify the entry point: find `default.project.json` or other `*.project.json`; read the Rojo tree to see which directories map to `ReplicatedStorage`, `ServerScriptService`, `StarterPlayer`, `StarterGui`, and other services; look for `wally.toml`, `pesde.toml`, `rokit.toml` (or the deprecated `aftman.toml`/`foreman.toml`), `.luaurc`, `selene.toml`, `.stylua.toml`.
2. Separate source from generated output: prefer editing project source outside `src/`/`Packages/`; do not edit `.rbxl`, `.rbxm`, `.rbxlx`, `.rbxmx` directly unless the user asks and explains the origin; do not hand-edit the sourcemap Rojo generates.
3. Build the path map before changing code: infer the Studio Instance path from the project json; when changing a require path, check callers and dependents; when adding a ModuleScript, confirm Rojo maps it into the intended service.
4. Run tools when available: `rojo sourcemap`, `wally install`, `pesde install`, `stylua --check`, `selene`, and the project's own npm/pesde/lune/rokit scripts.
5. State the delivery: which files sync to which Studio service, and whether the user must reconnect Rojo or Play Test in Studio.

## Toolchain notes

- Aftman is deprecated; prefer Rokit, which reads `aftman.toml`/`foreman.toml` for drop-in compatibility.
- Wally is in low-maintenance mode; `wally.toml` remains the most common format, but pesde is the actively maintained successor — recognize both and do not assume one over the other.

## Safety boundaries

- Do not assume every Roblox project uses Rojo.
- Do not rewrite the project structure automatically.
- Do not delete package-manager generated directories unless the user asks.
- Do not treat manual object changes in Studio as synced facts; ask for an export or source mapping.

## Output

- Rojo mapping: project file paths to Studio service paths.
- Source changes: specific files and module responsibilities.
- Needs sync: actions the user must take on the Studio/Rojo side.
- Verification: list the Rojo/Wally/Luau tools actually run.
