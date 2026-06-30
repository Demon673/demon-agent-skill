param(
    [string]$Event = "Stop",
    [ValidateSet("done", "blocked", "cancelled", "needs-input", "")]
    [string]$Reason = "",
    [string]$Summary = "",
    [ValidateSet("auto", "toast", "sound", "both", "none")]
    [string]$Mode = "both",
    [ValidateSet("quiet", "normal", "loud")]
    [string]$Intensity = "normal",
    [ValidateSet("none", "gemini")]
    [string]$Output = "none"
)

$ErrorActionPreference = "SilentlyContinue"

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
        default {
            if ($ResolvedReason -eq "needs-input") { return "Agent is waiting for user input" }
            if ($ResolvedReason -eq "blocked") { return "Agent is blocked" }
            if ($ResolvedReason -eq "cancelled") { return "Agent stopped after cancellation or redirect" }
            return "Agent stopped and handed control back"
        }
    }
}

$resolvedReason = if ([string]::IsNullOrWhiteSpace($Reason)) { Get-ReasonForEvent -Name $Event } else { $Reason }
$resolvedSummary = if ([string]::IsNullOrWhiteSpace($Summary)) { Get-SummaryForEvent -Name $Event -ResolvedReason $resolvedReason } else { $Summary }
$ringScript = Join-Path $PSScriptRoot "ring.ps1"

try {
    $powerShellExe = (Get-Process -Id $PID).Path
    Start-Process -FilePath $powerShellExe -ArgumentList @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $ringScript,
        "-AgentName",
        "Agent",
        "-Summary",
        $resolvedSummary,
        "-Reason",
        $resolvedReason,
        "-Mode",
        $Mode,
        "-Intensity",
        $Intensity
    ) -WindowStyle Hidden | Out-Null
}
catch {
}

if ($Output -eq "gemini") {
    Write-Output '{"suppressOutput":true}'
}
