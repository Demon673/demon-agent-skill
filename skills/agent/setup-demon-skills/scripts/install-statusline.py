#!/usr/bin/env python3
import argparse
import json
import os
import shlex
import shutil
import sys
import tempfile
import uuid
from pathlib import Path


def write_json(path, value):
    with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
        temporary = stream.name
    try:
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)


def read_object(path):
    value = json.loads(path.read_text(encoding="utf-8-sig")) if path.exists() else {}
    if not isinstance(value, dict):
        raise ValueError(f"Expected a JSON object: {path}")
    return value


def main():
    parser = argparse.ArgumentParser(description="Configure the optional Claude Code status line after approval.")
    parser.add_argument("--action", choices=("install", "restore"), default="install")
    parser.add_argument("--mode", choices=("replace", "compose"))
    parser.add_argument("--shell-kind", choices=("posix", "powershell"))
    parser.add_argument("--shell-path")
    parser.add_argument("--config-dir", type=Path, default=Path(os.environ.get("CLAUDE_CONFIG_DIR") or Path.home() / ".claude"))
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    config_dir = args.config_dir.expanduser().resolve()
    settings_path = config_dir / "settings.json"
    folder = config_dir / "statusline-demon"
    state_path = folder / "state.json"
    settings_bytes = settings_path.read_bytes() if settings_path.exists() else None
    settings = read_object(settings_path)
    state = read_object(state_path)
    current = settings.get("statusLine")
    if state.get("active") and current != state.get("installed"):
        raise ValueError("The status line was changed by another tool; keep it and review before installing or restoring.")
    if args.action == "restore":
        if not state.get("active"):
            raise ValueError("No active Demon status line installation to restore.")
        original = state.get("original")
        if original is None:
            settings.pop("statusLine", None)
        else:
            settings["statusLine"] = original
        state["active"] = False
    else:
        if args.mode is None or args.shell_kind is None:
            parser.error("install requires --mode and --shell-kind after the user chooses")
        original = state.get("original") if state.get("active") else current
        if original is not None and (not isinstance(original, dict) or original.get("type") != "command" or not isinstance(original.get("command"), str)):
            raise ValueError("Existing statusLine is not a command configuration; keep it and review manually.")
        if original and str(folder / "statusline.py").replace("\\", "/") in original["command"].replace("\\", "/"):
            raise ValueError("Existing command refers to this renderer without matching ownership state; restore its backup before composing.")
        previous = None
        if args.mode == "compose" and original:
            if not args.shell_path:
                parser.error("composition requires --shell-path for the shell Claude Code uses")
            shell = shutil.which(args.shell_path)
            if shell is None:
                raise ValueError("The previous status line shell is not executable.")
            previous = {"kind": args.shell_kind, "shell": Path(shell).as_posix(), "command": original["command"]}
        renderer = folder / "statusline.py"
        executable = Path(sys.executable).as_posix()
        if args.shell_kind == "powershell":
            command = "& '" + executable.replace("'", "''") + "' -I '" + renderer.as_posix().replace("'", "''") + "'"
        else:
            command = shlex.join([executable, "-I", renderer.as_posix()])
        installed = dict(original or {})
        if args.mode == "replace":
            installed.pop("hideVimModeIndicator", None)
        installed.update(type="command", command=command)
        if original is None:
            installed["refreshInterval"] = 3
        settings["statusLine"] = installed
        state = {"active": True, "original": original, "installed": installed, "previous": previous, "config_dir": str(config_dir)}
    result = {"action": args.action, "settings_path": str(settings_path), "statusLine": settings.get("statusLine"), "dry_run": args.dry_run}
    if not args.dry_run:
        latest_bytes = settings_path.read_bytes() if settings_path.exists() else None
        if latest_bytes != settings_bytes:
            raise ValueError("Settings changed during setup; preview again before writing.")
        config_dir.mkdir(parents=True, exist_ok=True)
        if settings_path.exists():
            backup = config_dir / f"settings.before-statusline-{uuid.uuid4().hex}.json"
            shutil.copy2(settings_path, backup)
            result["backup"] = str(backup)
        folder.mkdir(exist_ok=True)
        if args.action == "install":
            shutil.copy2(Path(__file__).with_name("statusline.py"), folder / "statusline.py")
        previous_state = read_object(state_path)
        write_json(state_path, state)
        try:
            write_json(settings_path, settings)
        except OSError:
            write_json(state_path, previous_state)
            raise
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError) as error:
        print(f"install-statusline: {error}", file=sys.stderr)
        sys.exit(1)
