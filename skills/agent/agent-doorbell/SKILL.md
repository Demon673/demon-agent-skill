---
name: agent-doorbell
description: Install, update, or uninstall hook-based desktop/audio reminders for Agent stop and attention events. Use only when the user explicitly invokes agent-doorbell or asks to configure, enable, install, update, disable, remove, or uninstall automatic Agent doorbell hooks. Do not use for ordinary final responses or manual stop ringing.
disable-model-invocation: true
---

# Agent Doorbell

Use this skill to manage runtime hooks that ring the user's attention back when an Agent stops or needs input. The hook, not the Agent's final-response discipline, owns reliable reminders.

## Core Rule

This skill is a hook manager. When the latest user request explicitly invokes `agent-doorbell`, install or update the default runtime hook unless the request says to uninstall, remove, or disable it. Do not use this skill merely because the Agent is about to send a final response.

Once a hook is installed, the runtime calls an OS-native runner and returns quickly. Do not also run a manual doorbell helper for the same stop event.

## Action Routing

| User intent | Action |
| --- | --- |
| `agent-doorbell`, install, setup, enable, update, make reminders automatic | Install or update hooks |
| uninstall, remove, disable, turn off doorbell hooks | Uninstall hooks |
| test, dry-run, preview | Run installer with `--dry-run` |
| ordinary final response, progress pause, or internal checklist step | Do not trigger this skill |

If the user forbids tool use, shell commands, notifications, or settings changes for the turn, do not write hook settings. Explain the skipped setup briefly.

## Runtime Defaults

| Runtime | Default events | Settings target | Notes |
| --- | --- | --- | --- |
| Claude Code | `Elicitation`, `PermissionRequest`, `Stop`, `StopFailure` | `~/.claude/settings.json` | Uses command hooks with `command`, `args`, `async: true`, `timeout`, and `statusMessage`. |
| Gemini CLI | `AfterAgent`, `Notification` | `~/.gemini/settings.json` | Uses command hooks with a command string and millisecond timeout. The runner emits Gemini-compatible JSON output. |
| Codex | `Stop` | `~/.codex/hooks.json` | Uses a command string and second-based timeout. `PermissionRequest` is opt-in because it fires for tool approval requests and can be noisy. |
| Other Agent runtimes | Runtime-specific stop/finalize/input events | Runtime-specific local settings | Configure only when the runtime has documented lifecycle hooks. Connect those hooks to the OS-native runner. |

| Operating system | Default hook runner | Notes |
| --- | --- | --- |
| Windows | `powershell.exe` + `scripts/hook-runner.ps1` | Uses `ring.ps1` for native beep and tray/desktop notification. |
| macOS | `/bin/sh` + `scripts/hook-runner.sh` | Uses `osascript` notification and beep. |
| Linux | `/bin/sh` + `scripts/hook-runner.sh` | Uses `notify-send` when available, then terminal bell fallback. |

Prefer user-local settings by default because hook commands contain machine-local executable and skill paths. Use project-local settings only when the user asks for per-project behavior.

Do not chase every Agent runtime. Support only runtimes with documented lifecycle hooks. When no documented hook exists, say that reliable automatic stop reminders are not available through this skill yet.

## Install Workflow

1. Resolve the skill directory that contains this `SKILL.md`.
2. Choose the runtime.
   - Use `claude` when the request mentions Claude Code or the current surface is Claude Code.
   - Use `gemini` when the request mentions Gemini CLI.
   - Use `codex` when the request mentions Codex or the current surface is Codex.
   - If the runtime is unclear, ask one short question instead of writing the wrong settings file.
3. Choose the action.
   - Default action is install/update when the user explicitly invokes `agent-doorbell`.
   - Use uninstall when the user says `uninstall`, `remove`, `disable`, or equivalent wording.
4. Run the bundled installer when one is available, or edit the target settings JSON directly using the hook shapes below.

Claude Code install:

```powershell
.\scripts\install-hooks.ps1 -Runtime claude -Scope user
```

Claude Code uninstall:

```powershell
.\scripts\install-hooks.ps1 -Action uninstall -Runtime claude -Scope user
```

Gemini CLI install:

```powershell
.\scripts\install-hooks.ps1 -Runtime gemini -Scope user
```

Gemini CLI uninstall:

```powershell
.\scripts\install-hooks.ps1 -Action uninstall -Runtime gemini -Scope user
```

Codex install/update:

```powershell
.\scripts\install-hooks.ps1 -Runtime codex -Scope user
```

Codex uninstall:

```powershell
.\scripts\install-hooks.ps1 -Action uninstall -Runtime codex -Scope user
```

Node convenience installer examples, useful on macOS/Linux when Node is available:

```bash
node scripts/install-hooks.js --runtime claude --scope user
node scripts/install-hooks.js uninstall --runtime claude --scope user
node scripts/install-hooks.js --runtime gemini --scope user
node scripts/install-hooks.js --runtime codex --scope user
```

Project-local examples:

```bash
node scripts/install-hooks.js --runtime claude --scope project-local --project-root .
node scripts/install-hooks.js --runtime gemini --scope project --project-root .
node scripts/install-hooks.js --runtime codex --scope project --project-root .
```

Use `--dry-run` to preview changes without writing settings:

```powershell
.\scripts\install-hooks.ps1 -Runtime claude -Scope user -DryRun
```

The installers are convenience tools for writing JSON. The generated hooks default to OS-native runners and do not require Node or Python at stop time. The installer is idempotent: it removes previous Agent Doorbell hook entries before writing the replacement. It removes only hooks identified by `statusMessage`/`name` of `Agent Doorbell` or a command that points to `hook-runner.ps1`, `hook-runner.sh`, or `hook-runner.js`; it also recognizes legacy `hook-runner.py` entries so older Python-based hooks can be replaced cleanly.

Use `--runner node` only when the user explicitly wants Node-based hooks:

```bash
node scripts/install-hooks.js --runtime claude --scope user --runner node
```

## Hook Shapes

Claude Code on Windows writes entries equivalent to this shape:

```json
{
  "hooks": {
    "Stop": [{"hooks": [{"type": "command", "command": "powershell.exe", "args": ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "<skill-path>/scripts/hook-runner.ps1", "-Event", "Stop", "-Reason", "done", "-Mode", "both", "-Intensity", "normal", "-Output", "none"], "async": true, "timeout": 10, "statusMessage": "Agent Doorbell"}]}]
  }
}
```

Claude Code on macOS/Linux uses `/bin/sh` with `scripts/hook-runner.sh` and the same event/reason arguments.

Gemini CLI on macOS/Linux writes entries equivalent to this shape, with a shell-quoted command string:

```json
{
  "hooks": {
    "AfterAgent": [{"hooks": [{"name": "Agent Doorbell", "type": "command", "command": "/bin/sh <skill-path>/scripts/hook-runner.sh --event AfterAgent --reason done --mode both --intensity normal --output gemini", "timeout": 10000, "description": "Ring a non-blocking Agent Doorbell cue when the agent stops or needs attention."}]}]
  }
}
```

Gemini CLI on Windows uses a `powershell.exe ... hook-runner.ps1 ... -Output gemini` command string instead.

## Boundaries

- Do not install hooks just because the Agent is stopping.
- Do not ring manually as a fallback for ordinary final responses.
- Do not write shareable project settings with machine-local paths unless the user explicitly chooses project scope.
- Do not include secrets, private identifiers, raw logs, or large output in hook summaries.
- Do not open windows, steal focus, or loop sounds.
- Keep unsupported runtimes honest: if there is no documented lifecycle hook, say that reliable automatic stop reminders are not available through this skill yet.
- Do not generate default hook configs that depend on Python or Node. Use OS-native runners by default.

## Verification

For test commands and expected behavior, see `references/verification.md`.
