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
.\scripts\install-hooks.ps1 -Runtime codex -Scope user -Mode none -DryRun
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
node scripts/install-hooks.js --runtime codex --events NotARealEvent --dry-run
node scripts/install-hooks.js --runtime claude --events "" --dry-run
```

```powershell
.\scripts\install-hooks.ps1 -Runtime claude -Events NotARealEvent -DryRun
.\scripts\install-hooks.ps1 -Runtime gemini -Events NotARealEvent -DryRun
.\scripts\install-hooks.ps1 -Runtime codex -Events NotARealEvent -DryRun
.\scripts\install-hooks.ps1 -Runtime claude -Events "" -DryRun
```

Expected behavior:

- Each command rejects the unsupported event and exits unsuccessfully.
- Explicit empty event lists are rejected instead of silently falling back to defaults.
- Dry runs do not write or modify Claude Code or Gemini CLI settings files.
- The PowerShell installer enforces the same runtime-specific event allowlist as the Node convenience installer.
- Codex defaults to `Stop`; `PermissionRequest` must be selected explicitly because it fires for tool approvals.

## PowerShell Settings Preservation Test

From the skill directory on Windows PowerShell 5.1:

```powershell
$root = Join-Path $env:TEMP ("agent-doorbell-settings-preservation-" + [guid]::NewGuid().ToString("N"))
if (Test-Path -LiteralPath $root) { Remove-Item -LiteralPath $root -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $root ".claude") -Force | Out-Null
'{"permissions":{"defaultMode":"default","allow":["mcp__codegraph__*"],"deny":["a","b"]}}' |
    Set-Content -Encoding UTF8 -LiteralPath (Join-Path $root ".claude\settings.local.json")
.\scripts\install-hooks.ps1 -Runtime claude -Scope project-local -ProjectRoot $root -Mode none | Out-Null
$settings = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $root ".claude\settings.local.json") | ConvertFrom-Json
if ($settings.permissions.allow[0] -ne "mcp__codegraph__*") { throw "permissions.allow was not preserved" }
if ($settings.permissions.deny[0] -ne "a" -or $settings.permissions.deny[1] -ne "b") { throw "permissions.deny was not preserved" }
$bytes = [System.IO.File]::ReadAllBytes((Join-Path $root ".claude\settings.local.json"))
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) { throw "settings file was written with a UTF-8 BOM" }
```

Expected behavior:

- Existing settings fields remain present after a real project-local install.
- Single-item and multi-item string arrays remain JSON arrays of strings.
- No string array is rewritten as objects such as `{ "Length": 17 }`.
- PowerShell writes settings as UTF-8 without a BOM so the Node installer can parse the file later.

## Installer Shape Safety Test

From the skill directory:

```powershell
$root = Join-Path $env:TEMP ("agent-doorbell-shape-safety-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path (Join-Path $root ".claude") -Force | Out-Null
[System.IO.File]::WriteAllText((Join-Path $root ".claude\settings.local.json"), '{"hooks":[]}', (New-Object System.Text.UTF8Encoding($false)))
.\scripts\install-hooks.ps1 -Runtime claude -Scope project-local -ProjectRoot $root -Mode none
node scripts/install-hooks.js --runtime claude --scope project-local --project-root $root --mode none

$root = Join-Path $env:TEMP ("agent-doorbell-event-shape-safety-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path (Join-Path $root ".claude") -Force | Out-Null
[System.IO.File]::WriteAllText((Join-Path $root ".claude\settings.local.json"), '{"hooks":{"OtherEvent":{}}}', (New-Object System.Text.UTF8Encoding($false)))
.\scripts\install-hooks.ps1 -Runtime claude -Events Stop -Scope project-local -ProjectRoot $root -Mode none
node scripts/install-hooks.js --runtime claude --events Stop --scope project-local --project-root $root --mode none
```

Expected behavior:

- Both installers reject malformed `hooks` shapes instead of replacing, ignoring, or partially rewriting them.
- Existing malformed `hooks.<event>` values that are not arrays are rejected before writing.
- Non-target malformed events, such as `hooks.OtherEvent`, are rejected even when installing only `Stop`.

## Hook Removal Scope Test

From the skill directory:

```powershell
$root = Join-Path $env:TEMP ("agent-doorbell-removal-scope-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path (Join-Path $root ".claude") -Force | Out-Null
$json = '{"hooks":{"Stop":[{"hooks":[{"type":"command","command":"powershell.exe","args":["-File","C:\\Tools\\other\\scripts\\hook-runner.ps1"],"statusMessage":"Other Hook"},{"type":"command","command":"powershell.exe","args":["-File","C:\\Users\\Me\\.agents\\skills\\agent-doorbell\\scripts\\hook-runner.ps1"]}]}]}}'
[System.IO.File]::WriteAllText((Join-Path $root ".claude\settings.local.json"), $json, (New-Object System.Text.UTF8Encoding($false)))
.\scripts\install-hooks.ps1 -Action uninstall -Runtime claude -Scope project-local -ProjectRoot $root | Out-Null
```

Expected behavior:

- Hooks named `Agent Doorbell` or pointing to `agent-doorbell/scripts/hook-runner.*` are removable.
- Unrelated hooks that happen to use a file named `hook-runner.ps1`, `hook-runner.sh`, `hook-runner.js`, or `hook-runner.py` are preserved.

## Node BOM Compatibility Test

From the skill directory:

```powershell
$root = Join-Path $env:TEMP ("agent-doorbell-node-bom-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path (Join-Path $root ".claude") -Force | Out-Null
'{"permissions":{"allow":["x"]}}' | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $root ".claude\settings.local.json")
node scripts/install-hooks.js --runtime claude --scope project-local --project-root $root --mode none --dry-run
```

Expected behavior:

- The Node installer accepts existing UTF-8 BOM settings files produced by Windows PowerShell 5.1.

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

## Codex Installer Dry Run

From the skill directory:

```bash
node scripts/install-hooks.js --runtime codex --scope user --mode none --dry-run
node scripts/install-hooks.js --runtime codex --events PermissionRequest --scope user --mode none --dry-run
```

```powershell
.\scripts\install-hooks.ps1 -Runtime codex -Scope user -Mode none -DryRun
.\scripts\install-hooks.ps1 -Runtime codex -Events PermissionRequest -Scope user -Mode none -DryRun
```

Expected behavior:

- The default event list is only `Stop`.
- `PermissionRequest` remains available only when explicitly requested.
- Entries use a command string, seconds for `timeout`, and no `async` field because Codex does not support asynchronous command hooks.
- User scope targets `~/.codex/hooks.json`; project scope targets `<project>/.codex/hooks.json`.

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
