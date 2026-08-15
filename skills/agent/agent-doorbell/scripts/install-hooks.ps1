param(
    [ValidateSet("install", "uninstall", "remove")]
    [string]$Action = "install",
    [ValidateSet("claude", "gemini", "codex")]
    [string]$Runtime = "claude",
    [ValidateSet("user", "project-local", "project")]
    [string]$Scope = "user",
    [string]$ProjectRoot = (Get-Location).Path,
    [AllowEmptyString()]
    [string]$Events = $null,
    [ValidateSet("auto", "toast", "sound", "both", "none")]
    [string]$Mode = "both",
    [ValidateSet("quiet", "normal", "loud")]
    [string]$Intensity = "normal",
    [int]$Timeout = 10,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$StatusMessage = "Agent Doorbell"

function Test-JsonLeaf {
    param($Value)

    return ($null -eq $Value -or $Value -is [System.IConvertible] -or $Value -is [guid])
}

function Test-JsonArray {
    param($Value)

    return ($Value -is [array] -or $Value -is [System.Collections.IList])
}

function ConvertTo-Hashtable {
    param($Value)

    if ($null -eq $Value) { return $null }
    if (Test-JsonLeaf $Value) { return $Value }
    if ($Value -is [System.Collections.IDictionary]) {
        $hash = @{}
        foreach ($key in $Value.Keys) {
            $hash[$key] = ConvertTo-Hashtable $Value[$key]
        }
        return $hash
    }
    if ($Value -is [System.Collections.IEnumerable] -and $Value -isnot [string]) {
        $array = @()
        foreach ($item in $Value) {
            $array += ,(ConvertTo-Hashtable $item)
        }
        return ,$array
    }
    if ($Value -is [pscustomobject]) {
        $hash = @{}
        foreach ($property in $Value.PSObject.Properties) {
            $hash[$property.Name] = ConvertTo-Hashtable $property.Value
        }
        return $hash
    }
    return $Value
}

function Get-DefaultEvents {
    param([string]$Name)

    if ($Name -eq "claude") {
        return @("Elicitation", "PermissionRequest", "Stop", "StopFailure")
    }
    if ($Name -eq "codex") { return @("Stop") }
    return @("AfterAgent", "Notification")
}

function Get-AllowedEvents {
    param([string]$Name)

    if ($Name -eq "claude") {
        return @("Stop", "StopFailure", "SubagentStop", "TeammateIdle", "PermissionRequest", "Elicitation")
    }
    if ($Name -eq "codex") { return @("Stop", "SubagentStop", "PermissionRequest") }

    return @(
        "SessionStart",
        "SessionEnd",
        "BeforeAgent",
        "AfterAgent",
        "BeforeModel",
        "AfterModel",
        "BeforeToolSelection",
        "BeforeTool",
        "AfterTool",
        "PreCompress",
        "Notification"
    )
}

function Assert-AllowedEvents {
    param(
        [string]$RuntimeName,
        [string[]]$EventNames
    )

    $events = @($EventNames)
    if ($events.Count -eq 0) { throw "At least one event is required" }

    $allowed = @(Get-AllowedEvents -Name $RuntimeName)
    $invalid = @($events | Where-Object { $allowed -notcontains $_ })
    if ($invalid.Count -gt 0) {
        $valid = ($allowed | Sort-Object) -join ", "
        throw "Unsupported $RuntimeName event(s): $($invalid -join ', '). Valid: $valid"
    }
}

function Get-ReasonForEvent {
    param([string]$Name)

    switch ($Name) {
        "AfterAgent" { return "done" }
        "Elicitation" { return "needs-input" }
        "Notification" { return "needs-input" }
        "PermissionRequest" { return "needs-input" }
        "StopFailure" { return "blocked" }
        default { return "done" }
    }
}

function Get-SettingsPath {
    param(
        [string]$RuntimeName,
        [string]$ScopeName,
        [string]$Root
    )

    if ($RuntimeName -eq "claude") {
        if ($ScopeName -eq "user") { return Join-Path $HOME ".claude\settings.json" }
        if ($ScopeName -eq "project-local") { return Join-Path $Root ".claude\settings.local.json" }
        return Join-Path $Root ".claude\settings.json"
    }

    if ($RuntimeName -eq "codex") {
        if ($ScopeName -eq "project-local") { throw "Codex does not have a project-local hooks file; use user or project scope" }
        if ($ScopeName -eq "user") { return Join-Path $HOME ".codex\hooks.json" }
        return Join-Path $Root ".codex\hooks.json"
    }

    if ($ScopeName -eq "user") { return Join-Path $HOME ".gemini\settings.json" }
    return Join-Path $Root ".gemini\settings.json"
}

function Read-Settings {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) { return @{} }
    $text = Get-Content -Raw -Encoding utf8 -LiteralPath $Path
    if ([string]::IsNullOrWhiteSpace($text)) { return @{} }
    return ConvertTo-Hashtable ($text | ConvertFrom-Json)
}

function Write-Settings {
    param(
        [string]$Path,
        $Settings
    )

    $json = ($Settings | ConvertTo-Json -Depth 50) + [Environment]::NewLine
    $encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $json, $encoding)
}

function Assert-HooksShape {
    param($Settings)

    if (-not $Settings.Contains("hooks")) { return }
    if (-not ($Settings.hooks -is [System.Collections.IDictionary])) {
        throw "Cannot update hooks: expected an object"
    }
    foreach ($event in @($Settings.hooks.Keys)) {
        if (-not (Test-JsonArray $Settings.hooks[$event])) {
            throw "Cannot update hooks.$($event): expected a list"
        }
    }
}

function Test-DoorbellRunnerReference {
    param([string]$Value)

    $normalized = $Value.Replace("\", "/")
    return ($normalized -match '(^|/)agent-doorbell/scripts/hook-runner\.(js|py|ps1|sh)(["''\s]|$)')
}

function Test-DoorbellHook {
    param($Hook)

    if ($null -eq $Hook -or $Hook -isnot [System.Collections.IDictionary]) { return $false }
    if ($Hook.statusMessage -eq $StatusMessage -or $Hook.name -eq $StatusMessage) { return $true }
    if ($Hook.args -is [System.Collections.IEnumerable] -and $Hook.args -isnot [string]) {
        foreach ($arg in $Hook.args) {
            if (Test-DoorbellRunnerReference -Value ([string]$arg)) { return $true }
        }
    }
    if ($Hook.command -is [string] -and (Test-DoorbellRunnerReference -Value $Hook.command)) { return $true }
    return $false
}

function Remove-DoorbellHooks {
    param($Settings)

    $removed = 0
    Assert-HooksShape -Settings $Settings
    if (-not $Settings.Contains("hooks")) {
        return @{ Settings = $Settings; Removed = $removed }
    }

    foreach ($event in @($Settings.hooks.Keys)) {
        $groups = @($Settings.hooks[$event])
        $keptGroups = @()
        foreach ($group in $groups) {
            if (-not ($group -is [System.Collections.IDictionary]) -or -not (Test-JsonArray $group.hooks)) {
                $keptGroups += $group
                continue
            }
            $keptHooks = @()
            foreach ($hook in @($group.hooks)) {
                if (Test-DoorbellHook $hook) {
                    $removed += 1
                }
                else {
                    $keptHooks += $hook
                }
            }
            if ($keptHooks.Count -gt 0) {
                $updatedGroup = @{}
                foreach ($key in $group.Keys) { $updatedGroup[$key] = $group[$key] }
                $updatedGroup["hooks"] = $keptHooks
                $keptGroups += $updatedGroup
            }
        }
        if ($keptGroups.Count -gt 0) {
            $Settings.hooks[$event] = $keptGroups
        }
        else {
            $Settings.hooks.Remove($event)
        }
    }

    if ($Settings.hooks.Count -eq 0) {
        $Settings.Remove("hooks")
    }

    return @{ Settings = $Settings; Removed = $removed }
}

function Quote-CommandArg {
    param([string]$Value)

    if ($Value -notmatch '[\s"]') { return $Value }
    return '"' + $Value.Replace('"', '\"') + '"'
}

function New-HookEntry {
    param(
        [string]$RuntimeName,
        [string]$EventName
    )

    $runner = Join-Path $PSScriptRoot "hook-runner.ps1"
    $reason = Get-ReasonForEvent -Name $EventName
    $args = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $runner,
        "-Event",
        $EventName,
        "-Reason",
        $reason,
        "-Mode",
        $Mode,
        "-Intensity",
        $Intensity,
        "-Output",
        $(if ($RuntimeName -eq "gemini") { "gemini" } else { "none" })
    )

    if ($RuntimeName -eq "gemini" -or $RuntimeName -eq "codex") {
        $entry = @{
            type = "command"
            command = (@("powershell.exe") + $args | ForEach-Object { Quote-CommandArg $_ }) -join " "
            timeout = $(if ($RuntimeName -eq "gemini") { $Timeout * 1000 } else { $Timeout })
        }
        if ($RuntimeName -eq "gemini") {
            $entry.name = $StatusMessage
            $entry.description = "Ring a non-blocking Agent Doorbell cue when the agent stops or needs attention."
        }
        else {
            $entry.statusMessage = $StatusMessage
        }
        return $entry
    }

    return @{
        type = "command"
        command = "powershell.exe"
        args = $args
        async = $true
        timeout = $Timeout
        statusMessage = $StatusMessage
    }
}

function Install-DoorbellHooks {
    param(
        $Settings,
        [string[]]$EventNames
    )

    $removedResult = Remove-DoorbellHooks -Settings $Settings
    $updated = $removedResult.Settings
    if (-not $updated.Contains("hooks")) {
        $updated.hooks = @{}
    }

    foreach ($eventName in $EventNames) {
        if (-not $updated.hooks.Contains($eventName)) { $updated.hooks[$eventName] = @() }
        elseif (-not (Test-JsonArray $updated.hooks[$eventName])) { throw "Cannot update hooks.$($eventName): expected a list" }
        $updated.hooks[$eventName] = @($updated.hooks[$eventName]) + @{ hooks = @(New-HookEntry -RuntimeName $Runtime -EventName $eventName) }
    }

    return @{ Settings = $updated; Removed = $removedResult.Removed }
}

if ($Action -eq "remove") { $Action = "uninstall" }
$eventList = @(if (-not $PSBoundParameters.ContainsKey("Events")) { Get-DefaultEvents -Name $Runtime } else { $Events.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ } })
Assert-AllowedEvents -RuntimeName $Runtime -EventNames $eventList
$settingsPath = Get-SettingsPath -RuntimeName $Runtime -ScopeName $Scope -Root (Resolve-Path -LiteralPath $ProjectRoot).ProviderPath
$original = Read-Settings -Path $settingsPath
$originalJson = $original | ConvertTo-Json -Depth 50 -Compress
$result = if ($Action -eq "uninstall") { Remove-DoorbellHooks -Settings $original } else { Install-DoorbellHooks -Settings $original -EventNames $eventList }
$changed = ($originalJson -ne ($result.Settings | ConvertTo-Json -Depth 50 -Compress))

if (-not $DryRun -and $changed) {
    $parent = Split-Path -Parent $settingsPath
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    Write-Settings -Path $settingsPath -Settings $result.Settings
}

[pscustomobject]@{
    action = $Action
    runtime = $Runtime
    runner = "powershell"
    scope = $Scope
    settings_path = $settingsPath
    events = $eventList
    removed_existing_hooks = $result.Removed
    changed = $changed
    dry_run = [bool]$DryRun
} | ConvertTo-Json -Depth 20
