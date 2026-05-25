#!/usr/bin/env bash
set -euo pipefail

FORCE=0
COPY=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=1 ;;
    --copy) COPY=1 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${AGENT_SKILLS_DIR:-$HOME/.agents/skills}"
mkdir -p "$DEST"

find "$REPO/skills" -name SKILL.md -not -path '*/node_modules/*' -not -path '*/deprecated/*' -print0 |
while IFS= read -r -d '' skill_md; do
  src="$(dirname "$skill_md")"
  name="$(basename "$src")"
  target="$DEST/$name"

  if [[ -e "$target" || -L "$target" ]]; then
    if [[ ! -L "$target" && "$FORCE" != "1" ]]; then
      echo "skipping existing non-link target: $target (use --force to replace, or --copy to install a copy)" >&2
      continue
    fi
    rm -rf "$target"
  fi

  if [[ "$COPY" == "1" ]]; then
    cp -R "$src" "$target"
    echo "copied $name -> $target"
  else
    ln -s "$src" "$target"
    echo "linked $name -> $src"
  fi
done