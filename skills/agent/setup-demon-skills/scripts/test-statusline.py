#!/usr/bin/env python3
import argparse
import json
import os
import re
import runpy
import shlex
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parent


def run_script(script, *arguments, payload=None, env=None):
    return subprocess.run([sys.executable, "-I", str(script), *arguments], input=json.dumps(payload).encode() if payload is not None else None, capture_output=True, env=env)


def ok(result):
    assert result.returncode == 0, result.stderr.decode("utf-8", "replace")
    return result.stdout.decode("utf-8")


def check_transient_context():
    with tempfile.TemporaryDirectory(prefix="demon statusline continuity ") as temporary:
        environment = {**os.environ, "CLAUDE_CONFIG_DIR": temporary}
        payload = {"session_id": "continuity-test", "context_window": {"used_percentage": 42, "context_window_size": 200000, "current_usage": {"input_tokens": 84000, "output_tokens": 100}}}
        before = ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment))
        assert "] 42%" in re.sub(r"\x1b\[[0-9;]*m", "", before)
        payload["context_window"] = {"used_percentage": 0, "remaining_percentage": 100, "context_window_size": 200000, "current_usage": None}
        after = ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment))
        plain = re.sub(r"\x1b\[[0-9;]*m", "", after)
        assert "] 42%" in plain, f"Context reset during missing usage: {plain.strip()}"
        assert "~116K left (last)" in plain
        payload["context_window"]["current_usage"] = {}
        empty = re.sub(r"\x1b\[[0-9;]*m", "", ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment)))
        assert "] 42%" in empty and "(last)" in empty, "An empty usage object must not replace a measurement with zero"
        payload["context_window"] = {"used_percentage": 12, "context_window_size": 200000, "current_usage": {"input_tokens": 24000}}
        updated = re.sub(r"\x1b\[[0-9;]*m", "", ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment)))
        assert "] 12%" in updated and "(last)" not in updated
        payload["context_window"]["used_percentage"] = 0
        payload["context_window"]["current_usage"] = {"input_tokens": 0}
        zero = re.sub(r"\x1b\[[0-9;]*m", "", ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment)))
        assert "] 0%" in zero and "(last)" not in zero
        payload["session_id"] = "another-session"
        payload["context_window"]["current_usage"] = None
        fresh = ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment))
        assert "%" not in fresh and "(last)" not in fresh
        payload = {"session_id": "partial-capacity", "context_window": {"used_percentage": 42, "context_window_size": 200000, "current_usage": {"input_tokens": 84000}}}
        ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment))
        payload["context_window"] = {"used_percentage": 12, "current_usage": {"input_tokens": 24000}}
        partial = re.sub(r"\x1b\[[0-9;]*m", "", ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment)))
        assert "] 12%" in partial and "left" not in partial and "(last)" not in partial
        payload["context_window"] = {"used_percentage": 0, "context_window_size": 200000, "current_usage": None}
        held = re.sub(r"\x1b\[[0-9;]*m", "", ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment)))
        assert "42% / 200K ~116K left (last)" in held, "A capacity-free update must preserve the last complete measurement"
        payload["context_window"] = {"used_percentage": 12, "context_window_size": 200000, "current_usage": {"input_tokens": 24000}}
        recovered = re.sub(r"\x1b\[[0-9;]*m", "", ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment)))
        assert "12% / 200K ~176K left" in recovered and "(last)" not in recovered
        renderer = runpy.run_path(str(SCRIPTS / "statusline.py"))
        retain = renderer["retain_resources"]
        render = renderer["render"]
        sample = {
            "session_id": "resources-test", "model": {"id": "model-a", "display_name": "Model A"},
            "effort": {"level": "high"}, "session_name": "Before",
            "context_window": {"used_percentage": 42, "context_window_size": 200000, "current_usage": {"input_tokens": 84000}},
            "cost": {"total_duration_ms": 1560000},
            "rate_limits": {"five_hour": {"used_percentage": 28, "resets_at": 1100}, "seven_day": {"used_percentage": 35, "resets_at": 1200}},
        }
        def replay(value, now):
            return re.sub(r"\x1b\[[0-9;]*m", "", render(retain(value, Path(temporary), now=now), now=now))
        replay(sample, 1000)
        missing = {"session_id": "resources-test", "model": sample["model"], "context_window": {"used_percentage": 0, "current_usage": None}}
        held = replay(missing, 1010)
        assert "42% / 200K ~116K left (last)" in held and "Run 26m (last)" in held
        assert "5h 72% left reset 1m (last)" in held and "weekly 65% left (last)" in held
        assert "Before" not in held and "high" not in held
        assert "5h " not in replay(missing, 1031) and "weekly " not in replay(missing, 1031)
        assert "5h " not in replay(missing, 1100)
        changed = {**sample, "context_window": {"used_percentage": 5, "context_window_size": 200000, "current_usage": {"input_tokens": 10000}}, "cost": {"total_duration_ms": 0}, "effort": {"level": "low"}, "session_name": "After", "rate_limits": {"five_hour": {"used_percentage": 0, "resets_at": 1200}, "seven_day": {"used_percentage": 0, "resets_at": 1300}}}
        fresh = replay(changed, 1110)
        assert "] 5%" in fresh and "Run <1m" in fresh and "5h 100% left" in fresh and "weekly 100% left" in fresh
        assert "(last)" not in fresh and "Model A low" in fresh and "After" in fresh
        resized = {**missing, "context_window": {"context_window_size": 1000000, "current_usage": None}}
        assert "Context 1M" in replay(resized, 1111) and "5%" not in replay(resized, 1111)
        switched = {**missing, "model": {"id": "model-b", "display_name": "Model B"}}
        assert "42%" not in replay(switched, 1112) and "5h " not in replay(switched, 1112)
        assert "42%" not in replay({**missing, "session_id": "different-resources"}, 1113)
        assert "42%" not in replay({key: value for key, value in missing.items() if key != "session_id"}, 1114)
        assert "<1%" in replay({"context_window": {"used_percentage": 0.2}}, 1115)
        replay({**sample, "session_id": "no-reset", "rate_limits": {"five_hour": {"used_percentage": 28}}}, 1116)
        assert "5h " not in replay({"session_id": "no-reset"}, 1117)
        replay(sample, 1120)
        partial = {**missing, "context_window": {"used_percentage": 12, "current_usage": {"input_tokens": 24000}}}
        assert "] 12%" in replay(partial, 1120 + 86399)
        assert "42%" not in replay(missing, 1120 + 86401), "Partial updates must not extend the complete measurement's lifetime"
        cache = Path(temporary) / "statusline-demon" / "cache"
        for path in cache.glob("*.json"):
            path.write_text("broken", encoding="utf-8")
        assert "42%" not in replay(missing, 1121)
        blocked = Path(temporary) / "blocked"
        blocked.write_text("not a directory", encoding="utf-8")
        assert "42%" in render(retain(sample, blocked, now=1122))
    print("Transient resource continuity passed: missing samples, valid resets, isolated sessions, expiry and cache failures.")


def check_interrupted_setup():
    with tempfile.TemporaryDirectory(prefix="demon statusline interruption ") as temporary:
        root = Path(temporary)
        fault = root / "interrupt.py"
        fault.write_text('import os,runpy,sys\nfrom pathlib import Path\nscript,point,*arguments=sys.argv[1:]\nmodule=runpy.run_path(script)\nwriter=module["write_json"]\nsettings_written=False\ndef interrupt(path,value):\n    global settings_written\n    if point=="before-settings" and path.name=="settings.json": os._exit(86)\n    if point=="after-settings" and settings_written and path.name=="state.json": os._exit(86)\n    writer(path,value)\n    if path.name=="settings.json": settings_written=True\nmodule["main"].__globals__["write_json"]=interrupt\nsys.argv=[script,*arguments]\nmodule["main"]()\n', encoding="utf-8")
        original = {"statusLine": {"type": "command", "command": "original renderer", "padding": 2}, "permissions": {"allow": ["unchanged"]}}
        for point in ("before-settings", "after-settings"):
            for operation in ("install", "restore"):
                for retry in ("install", "restore"):
                    config = root / f"{point}-{operation}-{retry}"
                    config.mkdir()
                    settings_path = config / "settings.json"
                    settings_path.write_text(json.dumps(original), encoding="utf-8")
                    install = ["--config-dir", str(config), "--mode", "replace", "--shell-kind", "posix"]
                    restore = ["--config-dir", str(config), "--action", "restore"]
                    if operation == "restore":
                        ok(run_script(SCRIPTS / "install-statusline.py", *install))
                    result = run_script(fault, str(SCRIPTS / "install-statusline.py"), point, *(install if operation == "install" else restore))
                    assert result.returncode == 86
                    state_path = config / "statusline-demon" / "state.json"
                    interrupted_settings = settings_path.read_bytes()
                    interrupted_state = state_path.read_bytes()
                    resume = install if retry == "install" else restore
                    ok(run_script(SCRIPTS / "install-statusline.py", *resume, "--dry-run"))
                    assert settings_path.read_bytes() == interrupted_settings and state_path.read_bytes() == interrupted_state
                    ok(run_script(SCRIPTS / "install-statusline.py", *resume))
                    recovered = json.loads(state_path.read_text())
                    assert "pending" not in recovered and recovered["active"] == (retry == "install")
                    assert recovered["original"] == original["statusLine"]
                    if retry == "install":
                        assert json.loads(settings_path.read_text())["statusLine"] == recovered["installed"]
                        ok(run_script(SCRIPTS / "install-statusline.py", *restore))
                    assert json.loads(settings_path.read_text()) == original
                    settings_path.write_bytes(interrupted_settings)
                    state_path.write_bytes(interrupted_state)
                    external = {**original, "statusLine": {"type": "command", "command": "external renderer"}}
                    settings_path.write_text(json.dumps(external), encoding="utf-8")
                    for arguments in (install, restore):
                        result = run_script(SCRIPTS / "install-statusline.py", *arguments)
                        assert result.returncode == 1 and b"changed by another tool" in result.stderr
                        assert json.loads(settings_path.read_text()) == external and state_path.read_bytes() == interrupted_state
        config = root / "no-original"
        install = ["--config-dir", str(config), "--mode", "replace", "--shell-kind", "posix"]
        result = run_script(fault, str(SCRIPTS / "install-statusline.py"), "before-settings", *install)
        assert result.returncode == 86 and not (config / "settings.json").exists()
        ok(run_script(SCRIPTS / "install-statusline.py", "--config-dir", str(config), "--action", "restore"))
        assert json.loads((config / "settings.json").read_text()) == {}
    print("Interrupted setup passed: install/restore at both write boundaries, dry-run, original retention and foreign-edit refusal.")


def check_malformed_composition():
    with tempfile.TemporaryDirectory(prefix="demon statusline malformed ") as temporary:
        root = Path(temporary)
        renderer = root / "statusline.py"
        shutil.copyfile(SCRIPTS / "statusline.py", renderer)
        environment = {**os.environ, "CLAUDE_CONFIG_DIR": str(root)}
        payload = {"model": {"display_name": "Model"}, "context_window": {"used_percentage": 42, "context_window_size": 200000}}
        invalid = ["oops", 1, ["oops"], {"kind": "posix", "shell": ["invalid"], "command": "ignored"}, {"kind": "posix", "shell": "missing-shell", "command": ["invalid"]}, {"kind": "unknown", "shell": "missing-shell", "command": "ignored"}, {"kind": "posix", "shell": "", "command": "ignored"}, {"kind": "posix", "shell": "missing-shell", "command": "ignored\x00"}]
        for previous in invalid:
            (root / "state.json").write_text(json.dumps({"active": True, "previous": previous, "config_dir": str(root)}), encoding="utf-8")
            result = run_script(renderer, payload=payload, env=environment)
            output = re.sub(r"\x1b\[[0-9;]*m", "", ok(result))
            assert "Model" in output and "] 42%" in output and not result.stderr
    print("Malformed composition passed: invalid previous-command types preserve the current row without a traceback.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--transient-context", action="store_true")
    parser.add_argument("--review-regressions", choices=("install", "composition"))
    parser.add_argument("--shell-kind", choices=("posix", "powershell"), default="powershell" if os.name == "nt" else "posix")
    parser.add_argument("--shell-path")
    args = parser.parse_args()
    if args.review_regressions:
        (check_interrupted_setup if args.review_regressions == "install" else check_malformed_composition)()
        return
    check_transient_context()
    if args.transient_context:
        return
    check_interrupted_setup()
    check_malformed_composition()
    with tempfile.TemporaryDirectory(prefix="demon statusline ") as temporary:
        root = Path(temporary)
        config = root / "config"
        config.mkdir()
        environment = {**os.environ, "CLAUDE_CONFIG_DIR": str(config)}
        payload = {
            "workspace": {"current_dir": "/workspace/项目"},
            "model": {"display_name": "Model"},
            "effort": {"level": "high"},
            "context_window": {"used_percentage": 82, "context_window_size": 1000000},
            "rate_limits": {"seven_day": {"used_percentage": 35}},
            "session_name": "Live name",
            "transcript_path": str(root / "missing-transcript.jsonl"),
        }
        output = ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment))
        assert "/workspace/项目" in output and "Model high" in output and "Live name" in output
        assert "\x1b[38;2;217;110;30mContext " in output
        assert "\x1b[38;2;217;110;30m 82% / 1M ~180K left\x1b[0m" in output
        assert "[████████████████░░░░] 82%" in re.sub(r"\x1b\[[0-9;]*m", "", output)
        assert "weekly 65% left" in output
        assert ok(run_script(SCRIPTS / "statusline.py", payload={}, env=environment)).strip() == ""
        assert ok(run_script(SCRIPTS / "statusline.py", payload={"effort": "high", "model": [], "rate_limits": {"seven_day": None}}, env=environment)).strip() == ""
        payload["context_window"] = {"used_percentage": 0, "context_window_size": 200000}
        payload["rate_limits"] = {"seven_day": {"used_percentage": 0}}
        payload["session_name"] = "safe\x1b[2J\nname"
        payload["effort"]["level"] = "low"
        output = ok(run_script(SCRIPTS / "statusline.py", payload=payload, env=environment))
        assert "Model low" in output and "\x1b[38;2;134;239;172mContext " in output
        assert "\x1b[38;2;134;239;172m 0% / 200K ~200K left\x1b[0m" in output
        assert "weekly 100% left" in output and "\x1b[2J" not in output
        assert output.count("\n") == 2
        renderer = runpy.run_path(str(SCRIPTS / "statusline.py"))
        render = renderer["render"]
        progress_bar = renderer["progress_bar"]
        context_color = renderer["context_color"]
        assert context_color(0) == "\x1b[38;2;134;239;172m"
        assert context_color(70) == "\x1b[38;2;202;138;4m"
        assert context_color(100) == "\x1b[38;2;239;68;68m"
        assert context_color(None) == "\x1b[33m"
        for used, filled in [(0, 0), (38, 8), (80, 16), (82, 16), (100, 20)]:
            bar = progress_bar(used)
            color = context_color(used)
            assert bar == color + "[" + "█" * filled + "\x1b[0m\x1b[2m" + "░" * (20 - filled) + "\x1b[0m" + color + "]\x1b[0m"
            plain = re.sub(r"\x1b\[[0-9;]*m", "", bar)
            assert len(plain) == 22 and plain == "[" + "█" * filled + "░" * (20 - filled) + "]"
        for used in range(101):
            colored = render({"context_window": {"used_percentage": used, "context_window_size": 1000000}})
            color = context_color(used)
            assert colored.startswith(color + "Context ")
            assert colored.endswith(color + f" {used}% / 1M ~" + renderer["tokens"](1000000 * (100 - used) / 100) + " left\x1b[0m")
            assert "\x1b[0m\x1b[2m" in colored
            assert "\x1b[2m" + "░" * (20 - int(used / 5 + 0.5)) + "\x1b[0m" in colored
        resources = {
            "context_window": {"used_percentage": 38, "remaining_percentage": 61.5, "context_window_size": 1000000},
            "cost": {"total_duration_ms": 1560000},
            "rate_limits": {"five_hour": {"used_percentage": 28, "resets_at": 6040}},
        }
        rendered = render(resources, now=1000)
        assert context_color(38) + "Context " + progress_bar(38) + context_color(38) + " 38% / 1M ~615K left\x1b[0m" in rendered
        assert "Run 26m" in rendered and "5h 72% left reset 1h24m" in rendered
        assert "5h " not in render(resources, now=6040)
        assert "5h 72% left reset <1m" in render(resources, now=6039)
        for used, clamped, left in [(0, 0, "1M"), (100, 100, "0"), (-1, 0, "1M"), (101, 100, "0")]:
            rendered = render({"context_window": {"used_percentage": used, "context_window_size": 1000000}})
            assert progress_bar(clamped) in rendered and f"~{left} left" in rendered
        assert progress_bar(25) + context_color(25) + " 25% / 200K ~150K left\x1b[0m" in render({"context_window": {"remaining_percentage": 75, "context_window_size": 200000}})
        assert "Context 200K" in render({"context_window": {"context_window_size": 200000}})
        assert "~1M left" in render({"context_window": {"used_percentage": 0.01, "context_window_size": 1000000}})
        assert "Run <1m" in render({"cost": {"total_duration_ms": 0}})
        assert "Run 1h01m" in render({"cost": {"total_duration_ms": 3660000}})
        assert "Run" not in render({"cost": {"total_duration_ms": -1}})
        assert "5h 100% left" in render({"rate_limits": {"five_hour": {"used_percentage": 0}}})
        assert "5h " not in render({"rate_limits": {"five_hour": {"resets_at": 6040}}}, now=1000)
        assert render({"context_window": {"used_percentage": float("nan")}, "cost": {"total_duration_ms": float("inf")}}) == ""
        (config / ".ponytail-active").write_text("ultra\n", encoding="utf-8")
        assert "[PONYTAIL:ULTRA]" in ok(run_script(SCRIPTS / "statusline.py", payload={}, env=environment))

        shell_kind = args.shell_kind
        shell = shutil.which(args.shell_path or ("powershell.exe" if shell_kind == "powershell" else "sh"))
        assert shell, "Native shell is required for composition acceptance"
        previous = root / "previous.py"
        previous.write_text('import json,sys\nsys.stdin.reconfigure(encoding="utf-8")\nsys.stdout.reconfigure(encoding="utf-8")\np=json.load(sys.stdin)\nprint("Existing " + p["session_name"])\nprint("[PONYTAIL:ULTRA]")\n', encoding="utf-8")
        if shell_kind == "powershell":
            previous_command = "& '" + Path(sys.executable).as_posix().replace("'", "''") + "' '" + previous.as_posix().replace("'", "''") + "'"
        else:
            previous_command = shlex.join([Path(sys.executable).as_posix(), previous.as_posix()])
        original_line = {"type": "command", "command": previous_command, "padding": 2, "hideVimModeIndicator": True, "refreshInterval": 6}
        original = {"statusLine": original_line, "permissions": {"allow": ["unchanged"]}, "model": "unchanged"}
        settings_path = config / "settings.json"
        settings_path.write_text(json.dumps(original), encoding="utf-8")
        arguments = ["--config-dir", str(config), "--mode", "compose", "--shell-kind", shell_kind, "--shell-path", shell]
        ok(run_script(SCRIPTS / "install-statusline.py", *arguments, "--dry-run"))
        assert not (config / "statusline-demon").exists()
        assert json.loads(settings_path.read_text()) == original
        ok(run_script(SCRIPTS / "install-statusline.py", *arguments))
        installed = json.loads(settings_path.read_text())
        assert installed["permissions"] == original["permissions"] and installed["model"] == original["model"]
        for key in ("padding", "hideVimModeIndicator", "refreshInterval"):
            assert installed["statusLine"][key] == original_line[key]
        ok(run_script(SCRIPTS / "install-statusline.py", *arguments))
        assert json.loads(settings_path.read_text()) == installed
        state = json.loads((config / "statusline-demon" / "state.json").read_text())
        assert state["previous"]["command"] == previous_command
        payload["session_name"] = "Renamed"
        command_args = [shell, "-NoProfile", "-NonInteractive", "-Command", installed["statusLine"]["command"]] if shell_kind == "powershell" else [shell, "-c", installed["statusLine"]["command"]]
        output = ok(subprocess.run(command_args, input=json.dumps(payload).encode(), capture_output=True, env=environment))
        assert "Existing Renamed" in output and "Model low" in output
        assert any("Renamed" in line and "Model low" in line for line in output.splitlines())
        assert output.count("[PONYTAIL:ULTRA]") == 1
        assert output.count("Existing Renamed") == 1
        previous.write_text('import sys\nsys.exit(1)\n', encoding="utf-8")
        output = ok(run_script(config / "statusline-demon" / "statusline.py", payload=payload, env=environment))
        assert "Model low" in output and "Existing" not in output
        previous.write_text('import subprocess,sys\nsubprocess.run([sys.executable,"-c","import time; time.sleep(20)"])\n', encoding="utf-8")
        output = ok(subprocess.run([sys.executable, "-I", str(config / "statusline-demon" / "statusline.py")], input=json.dumps(payload).encode(), capture_output=True, env=environment, timeout=8))
        assert "Model low" in output
        external = {**installed, "statusLine": {"type": "command", "command": "external renderer"}}
        settings_path.write_text(json.dumps(external), encoding="utf-8")
        for args in (arguments, ["--config-dir", str(config), "--action", "restore"]):
            result = run_script(SCRIPTS / "install-statusline.py", *args)
            assert result.returncode == 1 and b"changed by another tool" in result.stderr
            assert json.loads(settings_path.read_text()) == external
        settings_path.write_text(json.dumps(installed), encoding="utf-8")
        ok(run_script(SCRIPTS / "install-statusline.py", "--config-dir", str(config), "--action", "restore"))
        assert json.loads(settings_path.read_text()) == original
        assert not json.loads((config / "statusline-demon" / "state.json").read_text())["active"]
        ok(run_script(SCRIPTS / "install-statusline.py", "--config-dir", str(config), "--mode", "replace", "--shell-kind", shell_kind))
        replaced = json.loads(settings_path.read_text())
        assert "hideVimModeIndicator" not in replaced["statusLine"]
        assert replaced["statusLine"]["padding"] == 2 and replaced["statusLine"]["refreshInterval"] == 6
        assert json.loads((config / "statusline-demon" / "state.json").read_text())["previous"] is None
        ok(run_script(SCRIPTS / "install-statusline.py", "--config-dir", str(config), "--action", "restore"))
        assert json.loads(settings_path.read_text()) == original
        for backup in config.glob("settings.before-statusline-*.json"):
            assert json.loads(backup.read_text())["permissions"] == original["permissions"]
        event_only = {**original, "statusLine": {key: value for key, value in original_line.items() if key != "refreshInterval"}}
        for mode in ("compose", "replace"):
            settings_path.write_text(json.dumps(event_only), encoding="utf-8")
            ok(run_script(SCRIPTS / "install-statusline.py", "--config-dir", str(config), "--mode", mode, "--shell-kind", shell_kind, "--shell-path", shell))
            assert "refreshInterval" not in json.loads(settings_path.read_text())["statusLine"]
            ok(run_script(SCRIPTS / "install-statusline.py", "--config-dir", str(config), "--action", "restore"))
            assert json.loads(settings_path.read_text()) == event_only
        empty_config = root / "empty"
        ok(run_script(SCRIPTS / "install-statusline.py", "--config-dir", str(empty_config), "--mode", "replace", "--shell-kind", shell_kind))
        assert json.loads((empty_config / "settings.json").read_text())["statusLine"]["refreshInterval"] == 3
        ok(run_script(SCRIPTS / "install-statusline.py", "--config-dir", str(empty_config), "--action", "restore"))
        assert json.loads((empty_config / "settings.json").read_text()) == {}
    print("Status line acceptance passed: live payload, stdin replay, preserved settings, repeated install, restore and conflict refusal.")


if __name__ == "__main__":
    main()
