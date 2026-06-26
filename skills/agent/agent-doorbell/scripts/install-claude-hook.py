#!/usr/bin/env python3
import argparse
import copy
import json
import sys
from pathlib import Path


DEFAULT_EVENTS = [
    "Stop",
    "StopFailure",
    "SubagentStop",
    "TeammateIdle",
    "PermissionRequest",
    "Elicitation",
]

ALLOWED_EVENTS = {
    "Stop",
    "StopFailure",
    "SubagentStop",
    "TeammateIdle",
    "PermissionRequest",
    "Elicitation",
}

STATUS_MESSAGE = "Agent Doorbell"


def parse_events(value):
    events = [item.strip() for item in value.split(",") if item.strip()]
    invalid = [event for event in events if event not in ALLOWED_EVENTS]
    if invalid:
        valid = ", ".join(sorted(ALLOWED_EVENTS))
        raise argparse.ArgumentTypeError(f"unsupported event(s): {', '.join(invalid)}. Valid: {valid}")
    if not events:
        raise argparse.ArgumentTypeError("at least one event is required")
    return events


def settings_path(scope, project_root):
    if scope == "user":
        return Path.home() / ".claude" / "settings.json"
    if scope == "project-local":
        return project_root / ".claude" / "settings.local.json"
    raise ValueError(f"unsupported scope: {scope}")


def load_settings(path):
    if not path.exists():
        return {}
    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Cannot update invalid JSON settings file: {path} ({exc})")
    if not isinstance(data, dict):
        raise SystemExit(f"Cannot update settings file because top-level JSON is not an object: {path}")
    return data


def write_settings(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(data, ensure_ascii=False, indent=2)
    path.write_text(text + "\n", encoding="utf-8")


def build_hook_entry(args):
    runner = Path(__file__).resolve().with_name("hook-runner.py")
    command = sys.executable if args.use_current_python else args.python_command
    return {
        "type": "command",
        "command": command,
        "args": [
            str(runner),
            "--mode",
            args.mode,
            "--intensity",
            args.intensity,
        ],
        "async": True,
        "timeout": args.timeout,
        "statusMessage": STATUS_MESSAGE,
    }


def is_doorbell_hook(hook):
    if not isinstance(hook, dict):
        return False
    if hook.get("statusMessage") == STATUS_MESSAGE:
        return True
    args = hook.get("args")
    if isinstance(args, list):
        return any(str(arg).endswith("hook-runner.py") for arg in args)
    return False


def remove_doorbell_hooks(settings):
    settings = copy.deepcopy(settings)
    removed = 0
    hooks = settings.get("hooks")
    if not isinstance(hooks, dict):
        return settings, removed

    empty_events = []
    for event, groups in list(hooks.items()):
        if not isinstance(groups, list):
            continue
        kept_groups = []
        for group in groups:
            if not isinstance(group, dict):
                kept_groups.append(group)
                continue
            handlers = group.get("hooks")
            if not isinstance(handlers, list):
                kept_groups.append(group)
                continue
            kept_handlers = [handler for handler in handlers if not is_doorbell_hook(handler)]
            removed += len(handlers) - len(kept_handlers)
            if kept_handlers:
                updated_group = copy.deepcopy(group)
                updated_group["hooks"] = kept_handlers
                kept_groups.append(updated_group)
        if kept_groups:
            hooks[event] = kept_groups
        else:
            empty_events.append(event)

    for event in empty_events:
        hooks.pop(event, None)
    if not hooks:
        settings.pop("hooks", None)
    return settings, removed


def install_hooks(settings, events, hook_entry):
    settings, removed = remove_doorbell_hooks(settings)
    hooks = settings.setdefault("hooks", {})
    for event in events:
        groups = hooks.setdefault(event, [])
        if not isinstance(groups, list):
            raise SystemExit(f"Cannot update hooks.{event}: expected a list")
        groups.append({"hooks": [copy.deepcopy(hook_entry)]})
    return settings, removed


def parse_args():
    parser = argparse.ArgumentParser(description="Install or remove Agent Doorbell Claude Code hooks.")
    parser.add_argument("--scope", choices=("user", "project-local"), default="user")
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument("--events", type=parse_events, default=list(DEFAULT_EVENTS))
    parser.add_argument("--mode", choices=("auto", "toast", "sound", "both", "none"), default="both")
    parser.add_argument("--intensity", choices=("quiet", "normal", "loud"), default="normal")
    parser.add_argument("--timeout", type=int, default=10)
    parser.add_argument("--python-command", default="python")
    parser.add_argument("--use-current-python", action="store_true")
    parser.add_argument("--remove", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main():
    args = parse_args()
    target = settings_path(args.scope, args.project_root.resolve())
    original = load_settings(target)
    hook_entry = build_hook_entry(args)

    if args.remove:
        updated, removed = remove_doorbell_hooks(original)
        action = "remove"
    else:
        updated, removed = install_hooks(original, args.events, hook_entry)
        action = "install"

    result = {
        "action": action,
        "scope": args.scope,
        "settings_path": str(target),
        "events": args.events,
        "removed_existing_hooks": removed,
        "hook_entry": hook_entry,
        "changed": updated != original,
        "dry_run": args.dry_run,
    }

    if not args.dry_run and updated != original:
        write_settings(target, updated)

    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
