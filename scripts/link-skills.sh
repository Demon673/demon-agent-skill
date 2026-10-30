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

REPO="$(cd -P "$(dirname "$0")/.." && pwd -P)"
DEST="${AGENT_SKILLS_DIR:-$HOME/.agents/skills}"

# Native Windows directory aliases need the PowerShell installer's reparse checks.
case "${OSTYPE-}" in
  msys*|cygwin*)
    args=(-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$(cygpath -w "$REPO/scripts/link-skills.ps1")"
      -RepoRoot "$(cygpath -w "$REPO")" -Destination "$(cygpath -w "$DEST")")
    [[ "$FORCE" == "1" ]] && args+=(-Force)
    [[ "$COPY" == "1" ]] && args+=(-Copy)
    exec powershell.exe "${args[@]}"
    ;;
esac

canonical_directory() {
  local parent name
  if [[ -d "$1" ]]; then
    (cd -P "$1" && pwd -P)
  else
    parent="$(canonical_directory "$(dirname "$1")")"
    name="$(basename "$1")"
    case "$name" in
      .) printf '%s\n' "$parent" ;;
      ..) dirname "$parent" ;;
      *) printf '%s/%s\n' "${parent%/}" "$name" ;;
    esac
  fi
}

[[ -d "$REPO/skills" ]] || { echo "skills root not found: $REPO/skills" >&2; exit 1; }
SOURCE="$(canonical_directory "$REPO/skills")"
DEST="$(canonical_directory "$DEST")"

find "$SOURCE" -name SKILL.md -not -path '*/node_modules/*' -not -path '*/deprecated/*' -print0 |
while IFS= read -r -d '' skill_md; do
  target="${DEST%/}/$(basename "$(dirname "$skill_md")")"
  if [[ "$target" == "$SOURCE" || "$target" == "$SOURCE/"* || "$SOURCE" == "$target/"* ]]; then
    echo "installation target overlaps the skill source tree: $target" >&2
    exit 1
  fi
done

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
