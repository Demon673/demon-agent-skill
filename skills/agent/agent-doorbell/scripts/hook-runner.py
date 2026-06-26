#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
from pathlib import Path


REASON_BY_EVENT = {
    "Elicitation": "needs-input",
    "PermissionRequest": "needs-input",
    "StopFailure": "blocked",
    "TeammateIdle": "done",
}


def limit_text(text, max_length):
    text = (text or "").strip()
    if len(text) <= max_length:
        return text
    return text[: max(0, max_length - 3)] + "..."


def read_event():
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"hook_event_name": "unknown"}


def infer_agent_name(event):
    if event.get("teammate_name"):
        return event["teammate_name"]
    if event.get("agent_type"):
        return event["agent_type"]
    if event.get("tool_name"):
        return f"Agent permission: {event['tool_name']}"
    if event.get("mcp_server_name"):
        return f"Agent input: {event['mcp_server_name']}"
    return "Agent"


def infer_reason(event):
    event_name = event.get("hook_event_name", "")
    if event_name in REASON_BY_EVENT:
        return REASON_BY_EVENT[event_name]

    message = (event.get("last_assistant_message") or "").lower()
    if any(token in message for token in ("blocked", "can't proceed", "cannot proceed", "unable to proceed")):
        return "blocked"
    if any(token in message for token in ("cancelled", "canceled", "stopped by user")):
        return "cancelled"
    if any(token in message for token in ("?", "confirm", "approval", "permission", "choose", "which option")):
        return "needs-input"
    return "done"


def infer_summary(event, reason):
    event_name = event.get("hook_event_name") or "Agent stop"
    if event_name == "PermissionRequest":
        tool_name = event.get("tool_name") or "tool"
        return limit_text(f"Waiting for permission to use {tool_name}", 180)
    if event_name == "Elicitation":
        message = event.get("message") or "external input"
        return limit_text(f"Waiting for {message}", 180)
    if event_name == "StopFailure":
        error = event.get("error") or "error"
        return limit_text(f"Stopped because of {error}", 180)
    if event_name == "SubagentStop":
        message = event.get("last_assistant_message")
        if message:
            return limit_text(message, 180)
        return "Subagent stopped"
    if event_name == "TeammateIdle":
        return "Teammate became idle"
    if reason == "needs-input":
        return "Stopped and waiting for user input"
    if reason == "blocked":
        return "Stopped because progress is blocked"
    if reason == "cancelled":
        return "Stopped after cancellation or redirect"
    message = event.get("last_assistant_message")
    if message:
        return limit_text(message, 180)
    return "Stopped and handed control back"


def parse_args():
    parser = argparse.ArgumentParser(description="Run the Agent Doorbell cue from a lifecycle hook.")
    parser.add_argument("--mode", choices=("auto", "toast", "sound", "both", "none"), default="both")
    parser.add_argument("--intensity", choices=("quiet", "normal", "loud"), default="normal")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def main():
    args = parse_args()
    event = read_event()
    reason = infer_reason(event)
    agent_name = limit_text(infer_agent_name(event), 48)
    summary = infer_summary(event, reason)
    ring_script = Path(__file__).resolve().with_name("ring.py")

    command = [
        sys.executable,
        str(ring_script),
        "--agent-name",
        agent_name,
        "--summary",
        summary,
        "--reason",
        reason,
        "--mode",
        args.mode,
        "--intensity",
        args.intensity,
    ]

    if args.dry_run:
        print(json.dumps({
            "event": event.get("hook_event_name"),
            "agent": agent_name,
            "reason": reason,
            "summary": summary,
            "command": command,
        }, ensure_ascii=False, separators=(",", ":")))
        return 0

    try:
        subprocess.run(command, check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
