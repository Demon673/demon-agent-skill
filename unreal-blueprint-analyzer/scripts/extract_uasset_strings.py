#!/usr/bin/env python3
"""Read-only string extractor for Unreal .uasset/.umap files.

This is intentionally conservative: it does not parse or modify Unreal package
serialization. It extracts printable ASCII and UTF-16LE strings, deduplicates
preserving order, and groups common Blueprint clues.
"""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path
from typing import Iterable

ASCII_RE = re.compile(rb"[\x20-\x7e]{4,}")
IDENT_RE = re.compile(r"^[A-Za-z_][A-Za-z0-9_:.\-/']{2,}$")
ASSET_PATH_RE = re.compile(
    r"(/Game/|/Script/|/Engine/|Content/|Asset/|Blueprint/|Prefabs/|UI/|UMG|BehaviorTree|Blackboard|"
    r"Material|Texture|Sound|Audio|Anim|SkeletalMesh|StaticMesh|Niagara|DataTable|Curve|Input)",
    re.I,
)
EVENT_RE = re.compile(
    r"(K2Node|BlueprintGeneratedClass|UberGraph|ExecuteUbergraph|EventGraph|ConstructionScript|"
    r"BeginPlay|Tick|Receive|Construct|Destruct|BeginOverlap|EndOverlap|Hit|OnClicked|OnPressed|"
    r"OnReleased|Delegate|Multicast|ServerRPC|ClientRPC|NetMulticast|OnRep|RepNotify|Blackboard|"
    r"GameplayTag|InputAction|EnhancedInput|Timeline|WidgetAnimation|AnimGraph|StateMachine|"
    r"BehaviorTree|EQS|Niagara|Button_|Text|Image|Panel|Widget|CanvasPanel|Border|ScrollBox)",
    re.I,
)


def iter_ascii(data: bytes) -> Iterable[str]:
    for match in ASCII_RE.finditer(data):
        yield match.group(0).decode("utf-8", "ignore")


def iter_utf16le(data: bytes, min_chars: int) -> Iterable[str]:
    chars: list[str] = []
    i = 0
    limit = len(data) - 1
    while i < limit:
        lo = data[i]
        hi = data[i + 1]
        if hi == 0 and 32 <= lo <= 126:
            chars.append(chr(lo))
            i += 2
            continue
        if len(chars) >= min_chars:
            yield "".join(chars)
        chars = []
        i += 2 if hi == 0 else 1
    if len(chars) >= min_chars:
        yield "".join(chars)


def clean_string(value: str) -> str:
    return value.strip().replace("\x00", "")


def unique(values: Iterable[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        value = clean_string(value)
        if not value or value in seen:
            continue
        seen.add(value)
        out.append(value)
    return out


def classify(strings: list[str]) -> dict[str, list[str]]:
    categories = {
        "asset_paths": [],
        "blueprint_clues": [],
        "identifiers": [],
        "other": [],
    }
    for value in strings:
        if ASSET_PATH_RE.search(value) or value.endswith(("_C", ".uasset", ".umap")):
            categories["asset_paths"].append(value)
        elif EVENT_RE.search(value):
            categories["blueprint_clues"].append(value)
        elif IDENT_RE.match(value):
            categories["identifiers"].append(value)
        else:
            categories["other"].append(value)
    return categories


def main() -> int:
    parser = argparse.ArgumentParser(description="Extract printable strings from an Unreal binary asset without modifying it.")
    parser.add_argument("asset", help="Path to .uasset/.umap/.uexp or another Unreal binary asset")
    parser.add_argument("--min", type=int, default=4, help="Minimum string length, default: 4")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of text")
    parser.add_argument("--limit", type=int, default=300, help="Maximum entries per category in text output")
    args = parser.parse_args()

    path = Path(args.asset)
    data = path.read_bytes()
    strings = unique(list(iter_ascii(data)) + list(iter_utf16le(data, args.min)))
    categories = classify(strings)

    payload = {
        "asset": str(path),
        "size_bytes": os.path.getsize(path),
        "string_count": len(strings),
        "categories": categories,
    }

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0

    print(f"Asset: {path}")
    print(f"Size: {payload['size_bytes']} bytes")
    print(f"Strings: {payload['string_count']}")
    for name, values in categories.items():
        print(f"\n[{name}] {len(values)}")
        for value in values[: args.limit]:
            print(value)
        if len(values) > args.limit:
            print(f"... {len(values) - args.limit} more")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
