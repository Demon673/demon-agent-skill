#!/usr/bin/env python3
import argparse
import json
import math
import os
import platform
import shutil
import struct
import subprocess
import sys
import tempfile
import time
import wave


PATTERNS = {
    "done": [(880, 120, 80), (1175, 160, 0)],
    "needs-input": [(988, 90, 70), (988, 90, 70), (1319, 120, 0)],
    "blocked": [(392, 160, 70), (659, 120, 70), (392, 220, 0)],
    "cancelled": [(523, 120, 80), (392, 180, 0)],
}


def limit_text(text, max_length):
    text = (text or "").strip()
    if len(text) <= max_length:
        return text
    return text[: max(0, max_length - 3)] + "..."


def pattern_for(reason):
    return PATTERNS.get(reason, PATTERNS["done"])


def pattern_summary(reason):
    return ",".join(f"{freq}x{duration}" for freq, duration, _gap in pattern_for(reason))


def repeat_for(intensity):
    if intensity == "loud":
        return 2
    return 1


def write_pattern_wav(path, reason, intensity):
    sample_rate = 44100
    amplitude = 13000
    frames = []

    for repeat_index in range(repeat_for(intensity)):
        for freq, duration_ms, gap_ms in pattern_for(reason):
            tone_samples = int(sample_rate * duration_ms / 1000)
            for index in range(tone_samples):
                # Short fade avoids clicks without changing the recognizable pitch.
                fade = min(1.0, index / 120, (tone_samples - index) / 120)
                value = int(amplitude * fade * math.sin(2 * math.pi * freq * index / sample_rate))
                frames.append(struct.pack("<h", value))
            gap_samples = int(sample_rate * gap_ms / 1000)
            frames.extend([struct.pack("<h", 0)] * gap_samples)
        if repeat_index + 1 < repeat_for(intensity):
            frames.extend([struct.pack("<h", 0)] * int(sample_rate * 0.45))

    with wave.open(path, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(b"".join(frames))


def play_wav(path):
    system = platform.system().lower()

    if system == "windows":
        import winsound

        winsound.PlaySound(path, winsound.SND_FILENAME)
        return True

    for command in ("afplay", "paplay", "aplay", "play"):
        executable = shutil.which(command)
        if executable:
            subprocess.run([executable, path], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            return True

    return False


def terminal_bell(reason, intensity):
    for repeat_index in range(repeat_for(intensity)):
        for _freq, duration_ms, gap_ms in pattern_for(reason):
            sys.stdout.write("\a")
            sys.stdout.flush()
            time.sleep((duration_ms + gap_ms) / 1000)
        if repeat_index + 1 < repeat_for(intensity):
            time.sleep(0.45)
    return True


def show_notification(title, message):
    system = platform.system().lower()

    if system == "darwin" and shutil.which("osascript"):
        script = f'display notification "{message.replace(chr(34), chr(92) + chr(34))}" with title "{title.replace(chr(34), chr(92) + chr(34))}"'
        subprocess.run(["osascript", "-e", script], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True

    if system == "linux" and shutil.which("notify-send"):
        subprocess.run(["notify-send", title, message], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return True

    return False


def play_sound(reason, intensity):
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(prefix="agent-doorbell-", suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
        write_pattern_wav(tmp_path, reason, intensity)
        if play_wav(tmp_path):
            return True
    except Exception as exc:
        print(f"Generated doorbell sound failed: {exc}", file=sys.stderr)
    finally:
        if tmp_path:
            try:
                os.remove(tmp_path)
            except OSError:
                pass

    try:
        return terminal_bell(reason, intensity)
    except Exception as exc:
        print(f"Terminal bell fallback failed: {exc}", file=sys.stderr)
        return False


def parse_args():
    parser = argparse.ArgumentParser(description="Ring a non-blocking Agent doorbell cue.")
    parser.add_argument("--agent-name", default="Agent")
    parser.add_argument("--summary", default="Agent stopped")
    parser.add_argument("--reason", choices=("done", "blocked", "cancelled", "needs-input"), default="done")
    parser.add_argument("--mode", choices=("auto", "toast", "sound", "both", "none"), default="both")
    parser.add_argument("--intensity", choices=("quiet", "normal", "loud"), default="normal")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main():
    args = parse_args()
    agent = limit_text(args.agent_name, 48)
    summary = limit_text(args.summary, 180)
    title = limit_text(f"{agent} stopped", 64)
    message = limit_text(f"{args.reason} - {summary}", 240)

    payload = {
        "agent": agent,
        "reason": args.reason,
        "summary": summary,
        "mode": args.mode,
        "intensity": args.intensity,
        "pattern": pattern_summary(args.reason),
        "title": title,
        "message": message,
    }

    if args.dry_run:
        print(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))
        return 0

    delivered = False
    if args.mode in ("auto", "sound", "both"):
        delivered = play_sound(args.reason, args.intensity) or delivered

    if args.mode in ("auto", "toast", "both"):
        try:
            delivered = show_notification(title, message) or delivered
        except Exception as exc:
            print(f"Desktop notification failed: {exc}", file=sys.stderr)

    if not delivered:
        print(f"{title} - {message}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
