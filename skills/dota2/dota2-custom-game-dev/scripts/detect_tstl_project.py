#!/usr/bin/env python3
"""Detect TypeScriptToLua/TSTL structure in a DOTA2 custom game project."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


TSTL_PACKAGE_HINTS = {
    "typescript-to-lua",
    "typescript",
    "@moddota/dota-lua-types",
    "@typescript-to-lua/language-extensions",
}


def load_json(path: Path) -> dict[str, Any] | None:
    text: str
    try:
        text = path.read_text(encoding="utf-8-sig")
    except FileNotFoundError:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        jsonc = strip_jsonc(text)
        try:
            return json.loads(jsonc)
        except json.JSONDecodeError as exc:
            return {"_error": f"{exc.msg} at line {exc.lineno}, column {exc.colno}"}


def strip_jsonc(text: str) -> str:
    out: list[str] = []
    i = 0
    in_string = False
    quote = ""
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ""
        if in_string:
            out.append(ch)
            if ch == "\\" and nxt:
                out.append(nxt)
                i += 2
                continue
            if ch == quote:
                in_string = False
            i += 1
            continue
        if ch in ("'", '"'):
            in_string = True
            quote = ch
            out.append(ch)
            i += 1
            continue
        if ch == "/" and nxt == "/":
            i = text.find("\n", i)
            if i == -1:
                break
            out.append("\n")
            i += 1
            continue
        if ch == "/" and nxt == "*":
            end = text.find("*/", i + 2)
            i = len(text) if end == -1 else end + 2
            continue
        out.append(ch)
        i += 1
    return re.sub(r",\s*([}\]])", r"\1", "".join(out))


def package_info(root: Path) -> dict[str, Any]:
    package_path = root / "package.json"
    package = load_json(package_path)
    if package is None:
        return {"path": None, "found": False}

    deps = {}
    for key in ("dependencies", "devDependencies", "peerDependencies"):
        value = package.get(key)
        if isinstance(value, dict):
            deps.update(value)

    scripts = package.get("scripts") if isinstance(package.get("scripts"), dict) else {}
    return {
        "path": str(package_path),
        "found": True,
        "name": package.get("name"),
        "dependencies": {k: deps[k] for k in sorted(deps) if k in TSTL_PACKAGE_HINTS},
        "tstlScripts": {k: v for k, v in scripts.items() if "tstl" in v.lower() or "build" in k.lower() or "dev" in k.lower()},
    }


def tsconfig_info(root: Path) -> list[dict[str, Any]]:
    configs: list[Path] = []
    for pattern in (
        "tsconfig*.json",
        "src/**/tsconfig*.json",
        "content/*/scripts/vscripts/tsconfig*.json",
        "game/*/scripts/vscripts/tsconfig*.json",
    ):
        configs.extend(path for path in root.glob(pattern) if "node_modules" not in path.parts)
    configs = sorted(set(configs))
    out: list[dict[str, Any]] = []
    for path in configs:
        data = load_json(path)
        if not isinstance(data, dict) or "_error" in data:
            out.append({"path": str(path), "error": "missing or invalid json"})
            continue
        compiler = data.get("compilerOptions") if isinstance(data.get("compilerOptions"), dict) else {}
        tstl = data.get("tstl") if isinstance(data.get("tstl"), dict) else {}
        out.append(
            {
                "path": str(path),
                "extends": data.get("extends"),
                "types": compiler.get("types"),
                "plugins": compiler.get("plugins"),
                "rootDir": compiler.get("rootDir"),
                "outDir": compiler.get("outDir"),
                "luaTarget": tstl.get("luaTarget") or data.get("luaTarget"),
                "luaLibImport": tstl.get("luaLibImport") or data.get("luaLibImport"),
                "noImplicitSelf": tstl.get("noImplicitSelf") or data.get("noImplicitSelf"),
                "luaPlugins": tstl.get("luaPlugins") or data.get("luaPlugins"),
            }
        )
    return out


def path_exists(root: Path, relative: str) -> bool:
    return (root / relative).exists()


def find_files(root: Path, patterns: list[str], limit: int) -> list[str]:
    matches: list[str] = []
    for pattern in patterns:
        for path in root.glob(pattern):
            if path.is_file():
                matches.append(str(path.relative_to(root)).replace("\\", "/"))
                if len(matches) >= limit:
                    return matches
    return matches


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", help="DOTA2 addon repository root")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    root = Path(args.root).resolve()
    if not root.exists():
        raise SystemExit(f"Root does not exist: {root}")

    result = {
        "root": str(root),
        "package": package_info(root),
        "tsconfig": tsconfig_info(root),
        "roots": {
            "srcVscripts": path_exists(root, "src/vscripts"),
            "srcPanorama": path_exists(root, "src/panorama"),
            "srcCommon": path_exists(root, "src/common"),
            "contentAddonVscripts": bool(find_files(root, ["content/*/scripts/vscripts/tsconfig.json", "content/*/scripts/vscripts/**/*.ts"], 1)),
            "gameAddonVscripts": bool(find_files(root, ["game/*/scripts/vscripts/**/*.lua"], 1)),
            "gameVscripts": path_exists(root, "game/scripts/vscripts"),
            "gameNpc": path_exists(root, "game/scripts/npc") or bool(find_files(root, ["game/*/scripts/npc/**/*.txt"], 1)),
            "contentPanorama": path_exists(root, "content/panorama") or bool(find_files(root, ["content/*/panorama/**/*.xml", "content/*/panorama/**/*.js"], 1)),
        },
        "sampleFiles": {
            "typescript": find_files(root, ["src/**/*.ts", "content/*/scripts/vscripts/**/*.ts"], args.limit),
            "generatedLua": find_files(root, ["game/scripts/vscripts/**/*.lua", "game/*/scripts/vscripts/**/*.lua"], args.limit),
            "kv": find_files(root, ["game/scripts/npc/**/*.txt", "game/*/scripts/npc/**/*.txt"], args.limit),
            "panoramaXml": find_files(root, ["content/panorama/layout/**/*.xml", "content/*/panorama/layout/**/*.xml"], args.limit),
            "panoramaCss": find_files(root, ["content/panorama/styles/**/*.css", "content/*/panorama/styles/**/*.css"], args.limit),
        },
    }

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
