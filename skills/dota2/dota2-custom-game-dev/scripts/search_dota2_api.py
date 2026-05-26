#!/usr/bin/env python3
"""Search bundled DOTA2 custom game API reference snapshots."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Iterable


SKILL_ROOT = Path(__file__).resolve().parents[1]
VENDOR_ROOT = SKILL_ROOT / "references" / "vendor" / "vscode-dota2-tools"
RESOURCE_ROOT = VENDOR_ROOT / "resource"


def load_json(path: Path) -> Any:
    if not path.exists():
        raise SystemExit(f"Reference file missing: {path}\nRun update_references.ps1 first.")
    return json.loads(path.read_text(encoding="utf-8"))


def contains_query(value: Any, query: str) -> bool:
    if isinstance(value, dict):
        return any(contains_query(v, query) for v in value.values())
    if isinstance(value, list):
        return any(contains_query(v, query) for v in value)
    return query in str(value).lower()


def iter_lua(query: str) -> Iterable[dict[str, Any]]:
    data = load_json(RESOURCE_ROOT / "dota_script_help2.json")
    for class_name, functions in data.get("class_list", {}).items():
        for item in functions:
            if contains_query(item, query) or query in class_name.lower():
                params = item.get("params") or {}
                ordered_params = [
                    {
                        "name": p.get("params_name", key),
                        "type": p.get("type", ""),
                        "description": p.get("description", ""),
                    }
                    for key, p in sorted(params.items())
                ]
                yield {
                    "kind": "lua",
                    "class": class_name,
                    "function": item.get("function"),
                    "return": item.get("return"),
                    "server": item.get("server"),
                    "client": item.get("client"),
                    "description": item.get("description"),
                    "params": ordered_params,
                    "example": item.get("example"),
                }
    for enum_name, enum_values in data.get("enum_list", {}).items():
        payload = {"enum": enum_name, "values": enum_values}
        if query in enum_name.lower() or contains_query(enum_values, query):
            yield {"kind": "lua-enum", **payload}


def iter_js(query: str) -> Iterable[dict[str, Any]]:
    data = load_json(RESOURCE_ROOT / "cl_panorama_script_help_2.json")
    for class_name, functions in data.items():
        for fn_name, item in functions.items():
            if query in class_name.lower() or query in fn_name.lower() or contains_query(item, query):
                yield {
                    "kind": "panorama-js",
                    "class": class_name,
                    "function": item.get("Function", fn_name),
                    "signature": item.get("Signature"),
                    "description": item.get("Description"),
                }


def iter_css(query: str) -> Iterable[dict[str, Any]]:
    data = load_json(RESOURCE_ROOT / "dump_panorama_css_properties.json")
    for prop, item in data.items():
        if query in prop.lower() or contains_query(item, query):
            yield {
                "kind": "panorama-css",
                "property": prop,
                "description": item.get("description") if isinstance(item, dict) else item,
            }


def iter_panel(query: str) -> Iterable[dict[str, Any]]:
    panel_json = load_json(RESOURCE_ROOT / "PanelList.json")
    for panel, item in panel_json.items():
        if query in panel.lower() or contains_query(item, query):
            yield {"kind": "panorama-panel", "panel": panel, "index": item}

    md_path = RESOURCE_ROOT / "PanelList.md"
    if md_path.exists():
        text = md_path.read_text(encoding="utf-8", errors="replace")
        blocks = text.split("\n# ")
        for block in blocks:
            if query in block.lower():
                yield {
                    "kind": "panorama-panel-doc",
                    "excerpt": trim(block.replace("\r", ""), 1200),
                }


def trim(value: Any, max_chars: int) -> Any:
    if not isinstance(value, str):
        return value
    text = value.strip()
    return text if len(text) <= max_chars else text[: max_chars - 3].rstrip() + "..."


def compact_result(result: dict[str, Any], max_chars: int) -> dict[str, Any]:
    return {k: trim(v, max_chars) for k, v in result.items() if v not in (None, "", [], {})}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kind", choices=["all", "lua", "js", "css", "panel"], default="all")
    parser.add_argument("--query", required=True)
    parser.add_argument("--limit", type=int, default=12)
    parser.add_argument("--max-chars", type=int, default=500)
    args = parser.parse_args()

    query = args.query.lower()
    iterators = []
    if args.kind in ("all", "lua"):
        iterators.append(iter_lua(query))
    if args.kind in ("all", "js"):
        iterators.append(iter_js(query))
    if args.kind in ("all", "css"):
        iterators.append(iter_css(query))
    if args.kind in ("all", "panel"):
        iterators.append(iter_panel(query))

    count = 0
    for iterator in iterators:
        for result in iterator:
            print(json.dumps(compact_result(result, args.max_chars), ensure_ascii=False))
            count += 1
            if count >= args.limit:
                return 0

    if count == 0:
        print(json.dumps({"matches": 0, "query": args.query}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
