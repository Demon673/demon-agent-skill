#!/usr/bin/env python3
"""Detect SolidJS Panorama UI structure in a DOTA2 custom game project."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


SOLID_PACKAGE_HINTS = {
    "solid-js",
    "@moddota/panorama-types",
    "@bigciba/babel-plugin-jsx-panorama-expressions",
    "@bigciba/babel-preset-solid-panorama",
    "@bigciba/solid-panorama-runtime",
    "solid-panorama-all-in-jsx",
    "solid-panorama-polyfill",
    "rollup",
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
    panorama = package.get("panorama") if isinstance(package.get("panorama"), dict) else {}
    return {
        "path": str(package_path),
        "found": True,
        "name": package.get("name"),
        "dependencies": {k: deps[k] for k in sorted(deps) if k in SOLID_PACKAGE_HINTS},
        "solidScripts": {k: v for k, v in scripts.items() if "solid" in k.lower() or "panorama" in v.lower()},
        "panoramaKeys": sorted(panorama.keys()),
        "panoramaCounts": {
            key: len(value)
            for key, value in panorama.items()
            if isinstance(value, list)
        },
    }


def tsconfig_info(root: Path) -> list[dict[str, Any]]:
    configs = sorted((root / "solid").glob("**/tsconfig*.json")) if (root / "solid").exists() else []
    out: list[dict[str, Any]] = []
    for path in configs:
        data = load_json(path)
        if not isinstance(data, dict) or "_error" in data:
            out.append({"path": str(path), "error": "missing or invalid json"})
            continue
        compiler = data.get("compilerOptions") if isinstance(data.get("compilerOptions"), dict) else {}
        out.append(
            {
                "path": str(path),
                "include": data.get("include"),
                "jsx": compiler.get("jsx"),
                "jsxImportSource": compiler.get("jsxImportSource"),
                "types": compiler.get("types"),
                "plugins": compiler.get("plugins"),
                "rootDir": compiler.get("rootDir"),
                "target": compiler.get("target"),
                "lib": compiler.get("lib"),
            }
        )
    return out


def path_exists(root: Path, relative: str) -> bool:
    return (root / relative).exists()


def find_files(root: Path, patterns: list[str], limit: int) -> list[str]:
    matches: list[str] = []
    for pattern in patterns:
        for path in root.glob(pattern):
            if "node_modules" in path.parts:
                continue
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
            "solid": path_exists(root, "solid"),
            "solidSrcUi": path_exists(root, "solid/src/ui"),
            "solidSrcComponents": path_exists(root, "solid/src/components"),
            "solidSrcUtils": path_exists(root, "solid/src/utils"),
            "contentPanorama": path_exists(root, "content"),
            "customGameLayout": bool(find_files(root, ["content/*/panorama/layout/custom_game/custom_ui_manifest.xml"], 1)),
        },
        "buildFiles": find_files(root, ["solid/build*.ts", "solid/rollup*.ts", "solid/plugin*.ts"], args.limit),
        "sampleFiles": {
            "tsxEntries": find_files(root, ["solid/src/ui/**/*.tsx"], args.limit),
            "components": find_files(root, ["solid/src/components/**/*.tsx"], args.limit),
            "styles": find_files(root, ["solid/src/ui/**/*.less", "solid/src/ui/**/*.scss", "solid/src/components/**/*.less", "solid/src/components/**/*.scss"], args.limit),
            "xmlSources": find_files(root, ["solid/src/ui/**/*.xml"], args.limit),
            "generatedJs": find_files(root, ["content/*/panorama/scripts/custom_game/**/*.js"], args.limit),
            "generatedXml": find_files(root, ["content/*/panorama/layout/custom_game/**/*.xml"], args.limit),
            "generatedCss": find_files(root, ["content/*/panorama/styles/custom_game/**/*.css"], args.limit),
        },
    }

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
