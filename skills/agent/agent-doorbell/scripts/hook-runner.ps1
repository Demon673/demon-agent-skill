param(
    [string]$Event = "Stop",
    [ValidateSet("done", "blocked", "cancelled", "needs-input", "approval", "failed", "")]
    [string]$Reason = "",
    [string]$Summary = "",
    [ValidateSet("auto", "toast", "sound", "both", "none")]
    [string]$Mode = "both",
    [ValidateSet("quiet", "normal", "loud")]
    [string]$Intensity = "normal",
    [ValidateSet("none", "gemini")]
    [string]$Output = "none",
    [switch]$DryRun
)

$ErrorActionPreference = "SilentlyContinue"

$raw = ($input | Out-String)
if ([string]::IsNullOrWhiteSpace($raw) -and [Console]::IsInputRedirected) { $raw = [Console]::In.ReadToEnd() }
$payload = $null
try {
    $value = $raw | ConvertFrom-Json -ErrorAction Stop
    if ($value -is [pscustomobject]) { $payload = $value }
}
catch {}
$sharedEvent = $Event -in @("PermissionRequest", "Elicitation", "Notification", "errorOccurred")
if ($Event -in @("SubagentStart", "SubagentStop", "TeammateIdle", "TaskCreated", "TaskCompleted") -or
    $payload.agent_id -or $payload.notification_type -in @("agent_needs_input", "agent_completed") -or
    ($sharedEvent -and $null -eq $payload)) {
    if ($DryRun) { @{ event = $Event; skipped = $true } | ConvertTo-Json -Compress }
    elseif ($Output -eq "gemini") { Write-Output '{}' }
    exit 0
}

function Get-ReasonForEvent {
    param([string]$Name)

    switch ($Name) {
        "AfterAgent" { return "done" }
        "Elicitation" { return "needs-input" }
        "Notification" { return "needs-input" }
        "PermissionRequest" { return "approval" }
        "StopFailure" { return "failed" }
        "errorOccurred" { return "failed" }
        default { return "done" }
    }
}

function Get-SummaryForEvent {
    param(
        [string]$Name,
        [string]$ResolvedReason
    )

    switch ($Name) {
        "AfterAgent" { return "Agent finished responding" }
        "Elicitation" { return "Agent is waiting for user input" }
        "Notification" { return "Agent notification needs attention" }
        "PermissionRequest" { return "Agent is waiting for permission" }
        "StopFailure" { return "Agent stopped because of an error" }
        "errorOccurred" { return "Agent stopped because of an error" }
        default {
            if ($ResolvedReason -eq "needs-input") { return "Agent is waiting for user input" }
            if ($ResolvedReason -eq "blocked") { return "Agent is blocked" }
            if ($ResolvedReason -eq "approval") { return "Agent is waiting for permission" }
            if ($ResolvedReason -eq "failed") { return "Agent stopped because of an error" }
            if ($ResolvedReason -eq "cancelled") { return "Agent stopped after cancellation or redirect" }
            return "Agent stopped and handed control back"
        }
    }
}

$resolvedReason = if ([string]::IsNullOrWhiteSpace($Reason)) { Get-ReasonForEvent -Name $Event } else { $Reason }
$resolvedSummary = if ([string]::IsNullOrWhiteSpace($Summary)) { Get-SummaryForEvent -Name $Event -ResolvedReason $resolvedReason } else { $Summary }
$ringScript = Join-Path $PSScriptRoot "ring.ps1"

if ($DryRun) {
    & $ringScript -AgentName "Agent" -Summary $resolvedSummary -Reason $resolvedReason -Mode $Mode -Intensity $Intensity -DryRun
    exit 0
}
if ($Mode -eq "none" -or $resolvedReason -eq "cancelled") {
    if ($Output -eq "gemini") { Write-Output '{}' }
    exit 0
}

try {
    $powerShellExe = (Get-Process -Id $PID).Path
    $command = "& '" + $ringScript.Replace("'", "''") + "' -AgentName 'Agent' -Summary '" + $resolvedSummary.Replace("'", "''") + "' -Reason '" + $resolvedReason + "' -Mode '" + $Mode + "' -Intensity '" + $Intensity + "'"
    $encoded = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($command))
    Start-Process -FilePath $powerShellExe -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-EncodedCommand", $encoded) -WindowStyle Hidden | Out-Null
}
catch {
}

if ($Output -eq "gemini") {
    Write-Output '{}'
}
