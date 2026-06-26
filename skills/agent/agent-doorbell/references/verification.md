# Agent Doorbell Verification

Use these checks when changing the skill or helper script.

## Dry Run Test

From the skill directory:

```bash
python scripts/ring.py --agent-name "Agent A" --summary "Validation dry run" --reason done --mode none --dry-run
```

```powershell
.\scripts\ring.ps1 -AgentName "Agent A" -Summary "Validation dry run" -Reason done -Mode none -DryRun
```

Expected behavior:

- The script exits successfully.
- The output includes agent, reason, summary, mode, title, pattern, and message.
- No desktop notification or sound is emitted.

## Windows Best-Effort Test

From the skill directory:

```powershell
.\scripts\ring.ps1 -AgentName "Agent A" -Summary "Notification test" -Reason done -Mode both
```

Expected behavior:

- A short generated tone pattern plays when audio is available.
- A desktop or tray notification appears when the environment allows it.
- No foreground application, browser, modal dialog, or terminal window opens.
- Keyboard and mouse focus remain with the user's current activity.
- The command returns promptly after starting the cue; it does not wait for the full balloon display duration.

## Stop Reason Test

Run dry-run checks for all stop reasons:

```bash
python scripts/ring.py --agent-name "Agent A" --summary "Completed" --reason done --mode none --dry-run
python scripts/ring.py --agent-name "Agent B" --summary "Blocked" --reason blocked --mode none --dry-run
python scripts/ring.py --agent-name "Agent C" --summary "Waiting for input" --reason needs-input --mode none --dry-run
python scripts/ring.py --agent-name "Agent D" --summary "Cancelled" --reason cancelled --mode none --dry-run
```

```powershell
.\scripts\ring.ps1 -AgentName "Agent A" -Summary "Completed" -Reason done -Mode none -DryRun
.\scripts\ring.ps1 -AgentName "Agent B" -Summary "Blocked" -Reason blocked -Mode none -DryRun
.\scripts\ring.ps1 -AgentName "Agent C" -Summary "Waiting for input" -Reason needs-input -Mode none -DryRun
.\scripts\ring.ps1 -AgentName "Agent D" -Summary "Cancelled" -Reason cancelled -Mode none -DryRun
```

Expected behavior:

- Each output identifies the Agent name and stop reason.
- Each output includes a distinct tone pattern summary.
- No output contains secrets, raw logs, or large summary text.

## Intensity Test

Run dry-run checks for normal and loud intensity:

```bash
python scripts/ring.py --agent-name "Agent A" --summary "Normal pattern" --reason done --mode none --intensity normal --dry-run
python scripts/ring.py --agent-name "Agent A" --summary "Loud pattern" --reason done --mode none --intensity loud --dry-run
```

```powershell
.\scripts\ring.ps1 -AgentName "Agent A" -Summary "Normal pattern" -Reason done -Mode none -Intensity normal -DryRun
.\scripts\ring.ps1 -AgentName "Agent A" -Summary "Loud pattern" -Reason done -Mode none -Intensity loud -DryRun
```

Expected behavior:

- Both commands exit successfully.
- The dry-run output exposes the same base pattern.
- `loud` is reserved for actual playback when the user wants a stronger cue; it should repeat the pattern without looping indefinitely.

## Portability Test

Expected behavior:

- `scripts/ring.py` works with Python 3 and no third-party packages.
- `scripts/ring.py` generates a temporary WAV and uses the best available native player: Windows `winsound`, macOS `afplay`, or Linux `paplay`, `aplay`, or `play`.
- If no native player is available, it falls back to terminal bell or text output.
- `scripts/ring.ps1` remains a Windows/PowerShell helper, not the only implementation.

## Hook Runner Dry Run Test

From the skill directory:

```bash
printf '{"hook_event_name":"Stop","last_assistant_message":"All done."}' | python scripts/hook-runner.py --mode none --dry-run
printf '{"hook_event_name":"PermissionRequest","tool_name":"Bash"}' | python scripts/hook-runner.py --mode none --dry-run
printf '{"hook_event_name":"StopFailure","error":"rate_limit"}' | python scripts/hook-runner.py --mode none --dry-run
```

```powershell
'{"hook_event_name":"Stop","last_assistant_message":"All done."}' | python scripts/hook-runner.py --mode none --dry-run
'{"hook_event_name":"PermissionRequest","tool_name":"Bash"}' | python scripts/hook-runner.py --mode none --dry-run
'{"hook_event_name":"StopFailure","error":"rate_limit"}' | python scripts/hook-runner.py --mode none --dry-run
```

Expected behavior:

- Each command exits successfully.
- The output identifies the event, agent, reason, summary, and helper command.
- `Stop` maps to `done` unless the final message implies blocked, cancelled, or needs-input.
- `PermissionRequest` maps to `needs-input`.
- `StopFailure` maps to `blocked`.
- No sound or desktop notification is emitted in dry-run mode.

## Claude Code Hook Installer Test

From the skill directory:

```bash
python scripts/install-claude-hook.py --dry-run --scope user --mode none
python scripts/install-claude-hook.py --dry-run --scope project-local --project-root . --mode none
python scripts/install-claude-hook.py --dry-run --scope user --remove
```

Expected behavior:

- Each command exits successfully and prints JSON.
- Dry runs do not write or modify Claude Code settings files.
- Install output includes async command hooks for the selected events.
- The default event list includes `Stop`, `StopFailure`, `SubagentStop`, `TeammateIdle`, `PermissionRequest`, and `Elicitation`.
- Re-running install is idempotent: existing Agent Doorbell hooks are removed before replacement.
- Remove mode targets only hooks identified as Agent Doorbell hooks.
- Real installs write only local user or project-local settings, not shareable project settings with machine-specific paths.

## Agent-Stop Boundary Test

Prompt:

```text
Ring the doorbell whenever this Agent stops so I know to come back.
```

Expected behavior:

- The Agent performs work normally.
- The Agent sends one cue just before it stops and hands control back.
- The Agent also cues for needs-input or blocked stops whenever it stops and hands control back.
- The Agent also cues for tiny clarification stops because the Agent is waiting for the user.
- The Agent does not cue repeatedly during ordinary progress updates while it continues working.
- If a runtime stop hook owns doorbells for the current Agent surface, the hook sends the cue and the Agent does not also run the manual helper for the same final response.

## Planned Checkpoint Test

Scenario A:

```text
Complete phase A, then stop and wait for me to say continue before phase B.
```

Expected behavior:

- The Agent performs phase A normally.
- When phase A is complete and the Agent stops for user confirmation, it sends one cue.
- The stop reason is `needs-input`, even though the overall task is not complete.

Scenario B:

```text
Work through phases A, B, and C without waiting between phases.
```

Expected behavior:

- The Agent may mention internal progress as it moves between phases.
- The Agent does not send a cue between phases while it is continuing work.
- The Agent sends a cue only when it actually stops, becomes blocked, is cancelled, or needs user input.

## Approval Wait Test

Scenario A:

```text
Investigate the issue, then ask before making any filesystem changes.
```

Expected behavior:

- The Agent investigates normally.
- If the Agent stops to ask for approval, permission, credentials, a choice, or another user action, it sends one cue.
- The stop reason is `needs-input`.
- The Agent does not send a second cue for the same stop event in the final text.

Scenario B:

```text
Run the relevant validation, asking for permission first if required.
```

Expected behavior:

- If approval is required before the Agent can start or continue the requested task, it sends one cue before waiting.
- The stop reason is `needs-input`.

## Tiny Clarification Stop Test

Scenario:

```text
Build the thing.
```

Expected behavior:

- If the Agent must stop to ask a tiny clarifying question before it can proceed, it sends one cue.
- The stop reason is `needs-input`.
- The Agent does not send a cue if it asks a rhetorical or inline question but continues working without waiting.

## Quiet Constraint Test

Scenario:

```text
Do this without sounds, desktop notifications, or shell commands.
```

Expected behavior:

- The Agent respects the turn-level constraint.
- The Agent does not run `scripts/ring.py`, `scripts/ring.ps1`, or another notification helper.
- If doorbell behavior is otherwise enabled, the Agent may briefly say it skipped the cue because this turn forbids notifications or tool use.
