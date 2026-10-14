#!/usr/bin/env python3
import hashlib
import json
import math
import os
import re
import signal
import subprocess
import sys
import tempfile
import time
from pathlib import Path

RESET = "\x1b[0m"
SEPARATOR = "\x1b[2m · " + RESET


def clean(value):
    return re.sub(r"[\x00-\x1f\x7f-\x9f]", "", str(value or ""))


def number(value):
    return value if isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value) else None


def object_value(value):
    return value if isinstance(value, dict) else {}


def percentage(value):
    value = number(value)
    return max(0, min(100, value)) if value is not None else None


def tokens(value):
    if value >= 1000000:
        return "%gM" % (value / 1000000)
    if value >= 1000:
        thousands = round(value / 1000)
        return "%gM" % (thousands / 1000) if thousands >= 1000 else f"{thousands}K"
    return str(round(value))


def duration(seconds):
    minutes = int(max(0, seconds) // 60)
    hours, minutes = divmod(minutes, 60)
    return f"{hours}h{minutes:02d}m" if hours else f"{minutes}m" if minutes else "<1m"


def row(segments):
    return SEPARATOR.join("\x1b[%dm" % color + clean(text) + RESET for text, color in segments if text)


def retain_resources(payload, config_dir, now=None):
    now = time.time() if now is None else now
    session = payload.get("session_id")
    path = None
    cached = {}
    if isinstance(session, str) and session:
        path = config_dir / "statusline-demon" / "cache" / (hashlib.sha256(session.encode()).hexdigest() + ".json")
        try:
            cached = object_value(json.loads(path.read_text(encoding="utf-8")))
        except (OSError, ValueError, UnicodeError):
            pass
    result = dict(payload)
    result["last_resources"] = []
    model = object_value(payload.get("model"))
    model_name = model.get("id") or model.get("display_name")
    model_key = hashlib.sha256(model_name.encode()).hexdigest() if isinstance(model_name, str) and model_name else None
    if model_key and cached.get("model") and model_key != cached["model"]:
        cached = {"cost": cached.get("cost")}
    saved = {"model": model_key or cached.get("model")}

    def previous(key, lifetime):
        entry = object_value(cached.get(key))
        recorded = number(entry.get("at"))
        return object_value(entry.get("value")) if recorded is not None and 0 <= now - recorded <= lifetime else {}

    context = object_value(payload.get("context_window"))
    used = percentage(context.get("used_percentage"))
    remaining = percentage(context.get("remaining_percentage"))
    size = number(context.get("context_window_size"))
    size = size if size is not None and size > 0 else None
    value = {"context_window_size": size} if size is not None else {}
    # Claude clears current_usage after compaction until another API response supplies it.
    usage = object_value(context.get("current_usage"))
    measurable = "current_usage" not in context or any(number(usage.get(key)) is not None and usage[key] >= 0 for key in ("input_tokens", "output_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))
    old = previous("context_window", 86400)
    if measurable and (used is not None or remaining is not None):
        value.update(used_percentage=used if used is not None else 100 - remaining, remaining_percentage=remaining if remaining is not None else 100 - used)
        # A partial ratio cannot be paired with an old capacity; keep the complete snapshot intact.
        if size is None and number(old.get("context_window_size")) is not None and old["context_window_size"] > 0:
            saved["context_window"] = cached["context_window"]
        else:
            saved["context_window"] = {"at": now, "value": value}
    else:
        if old and (size is None or size == old.get("context_window_size")) and percentage(old.get("used_percentage")) is not None:
            value = old
            saved["context_window"] = cached["context_window"]
            result["last_resources"].append("context_window")
    result["context_window"] = value

    elapsed = number(object_value(payload.get("cost")).get("total_duration_ms"))
    cost = {}
    if elapsed is not None and elapsed >= 0:
        cost = {"total_duration_ms": elapsed}
        saved["cost"] = {"at": now, "value": cost}
    else:
        old = previous("cost", 86400)
        if number(old.get("total_duration_ms")) is not None and old["total_duration_ms"] >= 0:
            cost = old
            saved["cost"] = cached["cost"]
            result["last_resources"].append("cost")
    result["cost"] = cost

    limits = object_value(payload.get("rate_limits"))
    result["rate_limits"] = {}
    for window in ("five_hour", "seven_day"):
        value = object_value(limits.get(window))
        used = percentage(value.get("used_percentage"))
        reset = number(value.get("resets_at"))
        if reset is not None and reset <= now:
            continue
        if used is not None:
            value = {"used_percentage": used}
            if reset is not None:
                value["resets_at"] = reset
            saved[window] = {"at": now, "value": value}
        else:
            old = previous(window, 30)
            old_reset = number(old.get("resets_at"))
            if old_reset is None or old_reset <= now or (reset is not None and reset != old_reset) or percentage(old.get("used_percentage")) is None:
                continue
            value = old
            saved[window] = cached[window]
            result["last_resources"].append(window)
        result["rate_limits"][window] = value

    if path is not None:
        temporary = None
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as stream:
                json.dump(saved, stream)
                temporary = stream.name
            os.replace(temporary, path)
            for old_path in path.parent.glob("*.json"):
                if re.fullmatch(r"[0-9a-f]{64}\.json", old_path.name) and time.time() - old_path.stat().st_mtime > 86400:
                    old_path.unlink()
        except (OSError, ValueError):
            pass
        finally:
            if temporary is not None:
                try:
                    Path(temporary).unlink(missing_ok=True)
                except OSError:
                    pass
    return result


def context_color(used):
    if used is None:
        return "\x1b[33m"
    if used <= 70:
        start, end, fraction = (134, 239, 172), (202, 138, 4), used / 70
    else:
        start, end, fraction = (202, 138, 4), (239, 68, 68), (used - 70) / 30
    red, green, blue = (round(first + (last - first) * fraction) for first, last in zip(start, end))
    return f"\x1b[38;2;{red};{green};{blue}m"


def progress_bar(used):
    filled = int(used * 20 / 100 + 0.5)
    color = context_color(used)
    return color + "[" + "█" * filled + RESET + "\x1b[2m" + "░" * (20 - filled) + RESET + color + "]" + RESET


def render(payload, now=None):
    now = time.time() if now is None else now
    directory = object_value(payload.get("workspace")).get("current_dir") or payload.get("cwd") or ""
    model = clean(object_value(payload.get("model")).get("display_name"))
    effort = object_value(payload.get("effort")).get("level")
    if effort in ("low", "medium", "high", "xhigh", "max"):
        model = (model + " " + effort).strip()
    context = object_value(payload.get("context_window"))
    used = percentage(context.get("used_percentage"))
    remaining = percentage(context.get("remaining_percentage"))
    if used is None and remaining is not None:
        used = 100 - remaining
    if remaining is None and used is not None:
        remaining = 100 - used
    size = number(context.get("context_window_size"))
    size = size if size is not None and size > 0 else None
    context_text = ""
    last = payload.get("last_resources")
    last = last if isinstance(last, list) else []
    color = context_color(used)
    if used is not None:
        label = "<1%" if 0 < used < 1 else f"{round(used)}%"
        context_text = color + "Context " + progress_bar(used) + color + " " + label
        if size is not None:
            context_text += " / " + tokens(size) + " ~" + tokens(size * remaining / 100) + " left"
        if "context_window" in last:
            context_text += " (last)"
        context_text += RESET
    elif size is not None:
        context_text = color + "Context " + tokens(size) + RESET
    limits = object_value(payload.get("rate_limits"))
    five_hour = object_value(limits.get("five_hour"))
    five_used = percentage(five_hour.get("used_percentage"))
    resets_at = number(five_hour.get("resets_at"))
    five_text = ""
    if five_used is not None and (resets_at is None or resets_at > now):
        five_text = "5h %d%% left" % round(100 - five_used)
        if resets_at is not None:
            five_text += " reset " + duration(resets_at - now)
        if "five_hour" in last:
            five_text += " (last)"
    seven_day = object_value(limits.get("seven_day"))
    weekly = percentage(seven_day.get("used_percentage"))
    weekly_reset = number(seven_day.get("resets_at"))
    weekly_text = "weekly %d%% left" % round(100 - weekly) if weekly is not None and (weekly_reset is None or weekly_reset > now) else ""
    if weekly_text and "seven_day" in last:
        weekly_text += " (last)"
    elapsed = number(object_value(payload.get("cost")).get("total_duration_ms"))
    elapsed_text = "Run " + duration(elapsed / 1000) if elapsed is not None and elapsed >= 0 else ""
    if elapsed_text and "cost" in last:
        elapsed_text += " (last)"
    identity = row([(directory, 36), (model, 32), (payload.get("session_name"), 35)])
    metrics = row([(elapsed_text, 2), (five_text, 34), (weekly_text, 34)])
    resources = SEPARATOR.join(filter(None, [context_text, metrics]))
    return "\n".join(filter(None, [identity, resources]))


def ponytail(config_dir):
    try:
        mode = (config_dir / ".ponytail-active").read_text(encoding="utf-8-sig").splitlines()[0].strip()
        if mode in ("", "full", "lite", "ultra"):
            label = "PONYTAIL" if mode in ("", "full") else "PONYTAIL:" + mode.upper()
            return "\x1b[38;5;%dm[%s]%s" % (173 if mode == "ultra" else 108, label, RESET)
    except (OSError, IndexError, UnicodeError):
        pass
    return ""


def previous_output(raw, previous):
    argv = [previous["shell"], "-NoProfile", "-NonInteractive", "-Command", previous["command"]] if previous["kind"] == "powershell" else [previous["shell"], "-c", previous["command"]]
    try:
        with tempfile.TemporaryFile() as output:
            child = subprocess.Popen(argv, stdin=subprocess.PIPE, stdout=output, stderr=subprocess.DEVNULL, start_new_session=os.name != "nt")
            try:
                child.communicate(raw, timeout=2)
            except subprocess.TimeoutExpired:
                try:
                    if os.name == "nt":
                        subprocess.run(["taskkill", "/PID", str(child.pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=2)
                    else:
                        os.killpg(child.pid, signal.SIGKILL)
                finally:
                    child.kill()
                    child.wait(timeout=2)
                return ""
            output.seek(0)
            return output.read().decode("utf-8", "replace").rstrip("\r\n") if child.returncode == 0 else ""
    except (OSError, subprocess.TimeoutExpired):
        return ""


def main():
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    raw = sys.stdin.buffer.read()
    try:
        payload = json.loads(raw)
    except (ValueError, UnicodeError):
        return
    if not isinstance(payload, dict):
        return
    config_dir = Path(os.environ.get("CLAUDE_CONFIG_DIR") or Path.home() / ".claude")
    previous = ""
    try:
        state = json.loads(Path(__file__).with_name("state.json").read_text(encoding="utf-8"))
        if state.get("active") and state.get("previous"):
            previous = previous_output(raw, state["previous"])
        config_dir = Path(state["config_dir"])
    except (OSError, ValueError, KeyError):
        pass
    current = render(retain_resources(payload, config_dir))
    badge = ponytail(config_dir)
    if badge and "[PONYTAIL" not in previous:
        lines = current.split("\n") if current else [""]
        lines[0] = SEPARATOR.join(filter(None, [lines[0], badge]))
        current = "\n".join(lines)
    print("\n".join(line + RESET for text in [previous, current] if text for line in text.split("\n")))


if __name__ == "__main__":
    main()
