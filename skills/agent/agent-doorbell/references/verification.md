# Agent Doorbell Verification

Use these checks when changing the skill or helper scripts.

## Node Syntax Test

From the skill directory:

```bash
node --check scripts/install-hooks.js
node --check scripts/hook-runner.js
node --check scripts/ring.js
```

Expected behavior:

- Each command exits successfully.
- No Python runtime is required.
- Node is required only for the JS convenience installer and the optional Node runner, not for the default generated hook.

## Native Runner Syntax Test

From the skill directory:

```powershell
.\scripts\hook-runner.ps1 -Event Stop -Reason done -Mode none -Output none
.\scripts\hook-runner.ps1 -Event AfterAgent -Reason done -Mode none -Output gemini
.\scripts\install-hooks.ps1 -Runtime claude -Scope user -Mode none -DryRun
.\scripts\install-hooks.ps1 -Runtime gemini -Scope user -Mode none -DryRun
```

```bash
/bin/sh scripts/hook-runner.sh --event Stop --reason done --mode none --output none
/bin/sh scripts/hook-runner.sh --event AfterAgent --reason done --mode none --output gemini
```

Expected behavior:

- The PowerShell runner works on Windows.
- The PowerShell installer works on Windows without Node or Python.
- The shell runner works on macOS/Linux.
- Gemini output mode emits `{"suppressOutput":true}`.
- No Node or Python runtime is needed for the default hook runners.

## Installer Event Validation Test

From the skill directory:

```bash
node scripts/install-hooks.js --runtime claude --events NotARealEvent --dry-run
node scripts/install-hooks.js --runtime gemini --events NotARealEvent --dry-run
node scripts/install-hooks.js --runtime claude --events "" --dry-run
```

```powershell
.\scripts\install-hooks.ps1 -Runtime claude -Events NotARealEvent -DryRun
.\scripts\install-hooks.ps1 -Runtime gemini -Events NotARealEvent -DryRun
.\scripts\install-hooks.ps1 -Runtime claude -Events "" -DryRun
```

Expected behavior:

- Each command rejects the unsupported event and exits unsuccessfully.
- Explicit empty event lists are rejected instead of silently falling back to defaults.
- Dry runs do not write or modify Claude Code or Gemini CLI settings files.
- The PowerShell installer enforces the same runtime-specific event allowlist as the Node convenience installer.

## Ring Helper Dry Run

From the skill directory:

```bash
node scripts/ring.js --agent-name "Agent A" --summary "Validation dry run" --reason done --mode none --dry-run
```

```powershell
.\scripts\ring.ps1 -AgentName "Agent A" -Summary "Validation dry run" -Reason done -Mode none -DryRun
```

Expected behavior:

- The script exits successfully.
- The output includes agent, reason, summary, mode, title, pattern, and message.
- No desktop notification or sound is emitted.
- On Windows, real delivery may use `ring.ps1`; hook configs still call Node, not Python.

## Hook Runner Dry Run

From the skill directory:

```bash
printf '{"hook_event_name":"Stop","last_assistant_message":"All done."}' | node scripts/hook-runner.js --mode none --dry-run
printf '{"hook_event_name":"PermissionRequest","tool_name":"Bash"}' | node scripts/hook-runner.js --mode none --dry-run
printf '{"hook_event_name":"AfterAgent","prompt_response":"Gemini done."}' | node scripts/hook-runner.js --mode none --output gemini --dry-run
printf '{"hook_event_name":"Notification","message":"Permission required."}' | node scripts/hook-runner.js --mode none --output gemini --dry-run
```

```powershell
'{"hook_event_name":"Stop","last_assistant_message":"All done."}' | node scripts/hook-runner.js --mode none --dry-run
'{"hook_event_name":"PermissionRequest","tool_name":"Bash"}' | node scripts/hook-runner.js --mode none --dry-run
'{"hook_event_name":"AfterAgent","prompt_response":"Gemini done."}' | node scripts/hook-runner.js --mode none --output gemini --dry-run
'{"hook_event_name":"Notification","message":"Permission required."}' | node scripts/hook-runner.js --mode none --output gemini --dry-run
```

Expected behavior:

- Each command exits successfully.
- `Stop` maps to `done`.
- `PermissionRequest` maps to `needs-input`.
- `AfterAgent` maps to `done`.
- `Notification` maps to `needs-input`.
- Dry-run mode emits JSON describing the Node command and does not ring.

## Claude Code Installer Dry Run

From the skill directory:

```bash
node scripts/install-hooks.js --runtime claude --scope user --mode none --dry-run
node scripts/install-hooks.js uninstall --runtime claude --scope user --dry-run
node scripts/install-hooks.js --runtime claude --scope project-local --project-root . --mode none --dry-run
```

Expected behavior:

- Each command exits successfully and prints JSON.
- Dry runs do not write or modify Claude Code settings files.
- The default event list is `Elicitation`, `PermissionRequest`, `Stop`, and `StopFailure`.
- Hook entries use the OS-native runner by default: `powershell.exe` + `hook-runner.ps1` on Windows, or `/bin/sh` + `hook-runner.sh` on macOS/Linux.
- Hook entries include `async: true`, `timeout`, and `statusMessage`.
- Re-running install is idempotent: existing Agent Doorbell hooks are removed before replacement.
- Uninstall targets only hooks identified as Agent Doorbell hooks.
- Default output contains no `python` or Node hook command.
- The PowerShell installer should produce equivalent Windows hook entries without Node.

## Gemini CLI Installer Dry Run

From the skill directory:

```bash
node scripts/install-hooks.js --runtime gemini --scope user --mode none --dry-run
node scripts/install-hooks.js uninstall --runtime gemini --scope user --dry-run
node scripts/install-hooks.js --runtime gemini --scope project --project-root . --mode none --dry-run
```

Expected behavior:

- Each command exits successfully and prints JSON.
- Dry runs do not write or modify Gemini CLI settings files.
- The default event list is `AfterAgent` and `Notification`.
- Hook entries use a shell-quoted command string containing the OS-native runner: `powershell.exe ... hook-runner.ps1` on Windows, or `/bin/sh ... hook-runner.sh` on macOS/Linux.
- The command includes `--output gemini` so hook output is Gemini-compatible.
- Uninstall targets only hooks identified as Agent Doorbell hooks.
- Default output contains no `python` or Node hook command.
- The PowerShell installer should produce equivalent Windows hook entries without Node.

## Real Install Safety Test

Before doing a real install:

- Confirm the user explicitly invoked `agent-doorbell` for setup or uninstall.
- Confirm the runtime is known.
- Prefer user scope unless the user explicitly asked for project scope.
- Do not write shareable project settings with machine-local paths by accident.
- Use `--dry-run` first when the target settings file already contains unrelated hooks.

Expected behavior:

- Real install writes only the selected runtime settings file.
- Existing unrelated hooks remain intact.
- Previous Agent Doorbell hook entries are replaced, not duplicated.

## Quality Gate

Expected behavior:

- `SKILL.md` does not tell Agents to ring manually for ordinary final responses.
- Hook setup requires explicit user invocation.
- Uninstall is available through the positional `uninstall` action and the older `--remove` alias.
- Claude Code-specific text is limited to the Claude adapter.
- Gemini CLI-specific text is limited to the Gemini adapter.
- Unsupported runtimes are not described as guaranteed unless a documented lifecycle hook exists.
- Default hook configs do not depend on Python or Node.
- macOS is covered through `/bin/sh` plus `osascript` in `hook-runner.sh`.
