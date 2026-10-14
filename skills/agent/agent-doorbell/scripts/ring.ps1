param(
    [string]$AgentName = "Agent",
    [string]$Summary = "Agent stopped",
    [ValidateSet("done", "blocked", "cancelled", "needs-input", "approval", "failed")]
    [string]$Reason = "done",
    [ValidateSet("auto", "toast", "sound", "both", "none")]
    [string]$Mode = "both",
    [ValidateSet("quiet", "normal", "loud")]
    [string]$Intensity = "normal",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Limit-Text {
    param(
        [string]$Text,
        [int]$MaxLength
    )

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return ""
    }

    if ($Text.Length -le $MaxLength) {
        return $Text
    }

    return $Text.Substring(0, [Math]::Max(0, $MaxLength - 3)) + "..."
}

function Get-IconKind {
    param([string]$Reason)

    switch ($Reason) {
        "done" { return "Info" }
        "needs-input" { return "Warning" }
        "blocked" { return "Error" }
        "failed" { return "Error" }
        "approval" { return "Warning" }
        "cancelled" { return "Warning" }
        default { return "Info" }
    }
}

function Get-SoundPath {
    param([string]$Reason)

    if ($Reason -eq "cancelled") { return "" }
    return Join-Path (Join-Path (Join-Path $PSScriptRoot "..") "assets") "$Reason.wav"
}

function Invoke-DoorbellSound {
    param(
        [string]$Path,
        [string]$Intensity
    )

    $player = New-Object System.Media.SoundPlayer $Path
    try {
        $player.Load()
        $player.PlaySync()
        if ($Intensity -eq "loud") {
            Start-Sleep -Milliseconds 450
            $player.PlaySync()
        }
    }
    finally {
        $player.Dispose()
    }
}

function Invoke-SystemFallbackSound {
    param([string]$Reason)

    $sound =
        if ($Reason -eq "done") { [System.Media.SystemSounds]::Asterisk }
        elseif ($Reason -in @("blocked", "failed")) { [System.Media.SystemSounds]::Hand }
        else { [System.Media.SystemSounds]::Exclamation }

    $sound.Play()
}

function Show-WindowsBalloon {
    param(
        [string]$Title,
        [string]$Message,
        [string]$Reason
    )

    $iconKind = Get-IconKind -Reason $Reason
    $encodedCommand = @"
`$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
`$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
`$notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
`$notifyIcon.Visible = `$true
`$notifyIcon.BalloonTipTitle = '$($Title.Replace("'", "''"))'
`$notifyIcon.BalloonTipText = '$($Message.Replace("'", "''"))'
`$notifyIcon.BalloonTipIcon = [System.Enum]::Parse([System.Windows.Forms.ToolTipIcon], '$iconKind')
try {
    `$notifyIcon.ShowBalloonTip(5000)
    Start-Sleep -Seconds 6
}
finally {
    `$notifyIcon.Dispose()
}
"@

    $bytes = [System.Text.Encoding]::Unicode.GetBytes($encodedCommand)
    $encoded = [Convert]::ToBase64String($bytes)
    $powerShellExe = (Get-Process -Id $PID).Path
    Start-Process -FilePath $powerShellExe -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-EncodedCommand", $encoded) -WindowStyle Hidden | Out-Null
}

function Show-PlatformNotification {
    param(
        [string]$Title,
        [string]$Message,
        [string]$Reason
    )

    $isWindows = $IsWindows -or $env:OS -like "*Windows*"

    if ($isWindows) {
        Show-WindowsBalloon -Title $Title -Message $Message -Reason $Reason
        return $true
    }

    $notifySend = Get-Command notify-send -ErrorAction SilentlyContinue
    if ($notifySend) {
        & $notifySend.Source $Title $Message | Out-Null
        return $true
    }

    $osascript = Get-Command osascript -ErrorAction SilentlyContinue
    if ($osascript) {
        $safeTitle = $Title.Replace('"', '\"')
        $safeMessage = $Message.Replace('"', '\"')
        & $osascript.Source -e "display notification ""$safeMessage"" with title ""$safeTitle""" | Out-Null
        return $true
    }

    return $false
}

$agent = Limit-Text -Text $AgentName -MaxLength 48
$summaryText = Limit-Text -Text $Summary -MaxLength 180
$title = Limit-Text -Text "$agent stopped" -MaxLength 64
$message = Limit-Text -Text "$Reason - $summaryText" -MaxLength 240
$soundPath = Get-SoundPath -Reason $Reason
$wantSound = $Reason -ne "cancelled" -and $Mode -in @("auto", "sound", "both")
$wantToast = $Reason -ne "cancelled" -and $Mode -in @("auto", "toast", "both")

if ($DryRun) {
    [pscustomobject]@{
        agent = $agent
        reason = $Reason
        summary = $summaryText
        mode = $Mode
        intensity = $Intensity
        sound = $soundPath
        title = $title
        message = $message
    } | ConvertTo-Json -Compress
    exit 0
}

$delivered = $false

if ($wantSound) {
    try {
        Invoke-DoorbellSound -Path $soundPath -Intensity $Intensity
        $delivered = $true
    }
    catch {
        Write-Warning "Generated doorbell sound failed: $($_.Exception.Message)"
        try {
            Invoke-SystemFallbackSound -Reason $Reason
            $delivered = $true
        }
        catch {
            Write-Warning "System fallback sound failed: $($_.Exception.Message)"
        }
    }
}

if ($wantToast) {
    try {
        if (Show-PlatformNotification -Title $title -Message $message -Reason $Reason) {
            $delivered = $true
        }
    }
    catch {
        Write-Warning "Desktop notification failed: $($_.Exception.Message)"
    }
}

if (-not $delivered -and $Mode -ne "none" -and $Reason -ne "cancelled") {
    Write-Host "$title - $message"
}
