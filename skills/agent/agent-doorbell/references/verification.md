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

## Agent-Stop Boundary Test

Prompt:

```text
Ring the doorbell whenever this Agent stops so I know to come back.
```

Expected behavior:

- The Agent performs work normally.
- The Agent sends one cue just before it stops and hands control back.
- The Agent also cues for needs-input or blocked stops after meaningful work.
- The Agent does not cue repeatedly during ordinary progress updates.
