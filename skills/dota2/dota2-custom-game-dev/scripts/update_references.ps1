[CmdletBinding()]
param(
    [string] $UpstreamRoot = "",
    [string] $SourceUrl = "https://github.com/BigCiba/vscode-dota2-tools.git",
    [string] $Ref = "main"
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillRoot = Resolve-Path -LiteralPath (Join-Path $scriptRoot "..")
$vendorParent = Join-Path $skillRoot "references\vendor"
$vendorRoot = Join-Path $vendorParent "vscode-dota2-tools"
$cloneRoot = $null
$stageRoot = $null
$backupRoot = $null

function Remove-TemporaryRoot([string] $Path) {
    if ([string]::IsNullOrWhiteSpace($Path) -or !(Test-Path -LiteralPath $Path)) {
        return
    }
    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $tempPath = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
    if (!$fullPath.StartsWith($tempPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove a temporary path outside $tempPath`:$fullPath"
    }
    Remove-Item -LiteralPath $fullPath -Recurse -Force
}

function Assert-OwnedPath([string] $Path, [string] $Parent) {
    $fullPath = [System.IO.Path]::GetFullPath($Path)
    $fullParent = [System.IO.Path]::GetFullPath($Parent).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
    if (![string]::Equals([System.IO.Path]::GetDirectoryName($fullPath), $fullParent, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing path outside $fullParent`:$fullPath"
    }
    if (Test-Path -LiteralPath $fullPath) {
        $attributes = (Get-Item -Force -LiteralPath $fullPath).Attributes
        if (($attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            throw "Refusing to move or remove a reparse point: $fullPath"
        }
    }
    return $fullPath
}

try {
    if ([string]::IsNullOrWhiteSpace($SourceUrl) -or [string]::IsNullOrWhiteSpace($Ref)) {
        throw "Source provenance is incomplete: SourceUrl and Ref are required."
    }

    if ([string]::IsNullOrWhiteSpace($UpstreamRoot)) {
        $cloneRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("vscode-dota2-tools-" + [System.Guid]::NewGuid().ToString("N"))
        $cloneSucceeded = $true
        try {
            git clone --depth 1 --branch $Ref $SourceUrl $cloneRoot | Write-Host
        } catch {
            $cloneSucceeded = $false
        }
        if (!$cloneSucceeded -or $LASTEXITCODE -ne 0) {
            throw "Unable to clone $SourceUrl at $Ref"
        }
        $UpstreamRoot = $cloneRoot
    }

    $upstreamFullPath = (Resolve-Path -LiteralPath $UpstreamRoot -ErrorAction Stop).Path
    $commit = $null
    $commitVerified = $true
    try {
        $commit = (& git -C $upstreamFullPath rev-parse --verify HEAD 2>$null)
    } catch {
        $commitVerified = $false
    }
    if (!$commitVerified -or $LASTEXITCODE -ne 0) {
        throw "Invalid upstream provenance: $upstreamFullPath is not a Git checkout."
    }
    $commit = ($commit | Out-String).Trim()
    if ($commit -notmatch '^[0-9a-f]{40}([0-9a-f]{24})?$') {
        throw "Invalid upstream provenance: Git did not return a full commit ID."
    }

    $requiredFiles = @(
        "LICENSE",
        "resource/dota_script_help2.json",
        "resource/cl_panorama_script_help_2.json",
        "resource/dump_panorama_css_properties.json",
        "resource/dump_panorama_events.md",
        "resource/PanelList.json",
        "resource/PanelList.md",
        "resource/lua_api_changelog.md",
        "css.css-data.json"
    )
    $optionalFiles = @("html.html-data.json")
    $files = @($requiredFiles)

    foreach ($relative in $requiredFiles) {
        $source = Join-Path $upstreamFullPath ($relative -replace "/", [System.IO.Path]::DirectorySeparatorChar)
        if (!(Test-Path -LiteralPath $source -PathType Leaf)) {
            throw "Missing required upstream reference: $relative"
        }
    }
    foreach ($relative in $optionalFiles) {
        $source = Join-Path $upstreamFullPath ($relative -replace "/", [System.IO.Path]::DirectorySeparatorChar)
        if (Test-Path -LiteralPath $source -PathType Leaf) {
            $files += $relative
        }
    }
    foreach ($relative in $files) {
        $tracked = $true
        try {
            & git -C $upstreamFullPath ls-files --error-unmatch -- $relative >$null 2>&1
        } catch {
            $tracked = $false
        }
        if (!$tracked -or $LASTEXITCODE -ne 0) {
            throw "Invalid upstream provenance: $relative is not tracked at $commit."
        }
    }

    $dirty = @()
    $statusVerified = $true
    try {
        $dirty = @(& git -C $upstreamFullPath status --porcelain --untracked-files=no 2>$null)
    } catch {
        $statusVerified = $false
    }
    if (!$statusVerified -or $LASTEXITCODE -ne 0) {
        throw "Unable to verify upstream provenance at $commit."
    }
    if ($dirty.Count -gt 0) {
        throw "Invalid upstream provenance: tracked files differ from commit $commit."
    }

    New-Item -ItemType Directory -Force -Path $vendorParent | Out-Null
    $stageRoot = Join-Path $vendorParent (".vscode-dota2-tools-stage-" + [System.Guid]::NewGuid().ToString("N"))
    $stageRoot = Assert-OwnedPath $stageRoot $vendorParent
    New-Item -ItemType Directory -Path $stageRoot | Out-Null

    $copied = @()
    foreach ($relative in $files) {
        $source = Join-Path $upstreamFullPath ($relative -replace "/", [System.IO.Path]::DirectorySeparatorChar)
        $staged = Join-Path $stageRoot ($relative -replace "/", [System.IO.Path]::DirectorySeparatorChar)
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $staged) | Out-Null
        if ([System.IO.Path]::GetExtension($source) -eq '.md') {
            $content = [System.IO.File]::ReadAllText($source) -replace '\r\n?', "`n"
            $content = ($content -replace '(?m)[ \t]+$', '').TrimEnd("`n")
            if ($content.Length -gt 0) { $content += "`n" }
            [System.IO.File]::WriteAllText($staged, $content, [System.Text.UTF8Encoding]::new($false))
        } else {
            Copy-Item -LiteralPath $source -Destination $staged
        }
        $copied += $relative
    }

    $manifest = [ordered]@{
        source = "BigCiba/vscode-dota2-tools"
        sourceUrl = $SourceUrl
        ref = $Ref
        commit = $commit
        updatedAt = (Get-Date).ToUniversalTime().ToString("o")
        copiedFiles = $copied
        markdownNormalization = "LF; trim trailing spaces/tabs; one final newline for non-empty files"
        note = "Generated by scripts/update_references.ps1. Do not manually edit vendor snapshots."
    }
    $manifestJson = ($manifest | ConvertTo-Json -Depth 6) -replace '\r\n?', "`n"
    $manifestJson = $manifestJson.TrimEnd("`n") + "`n"
    [System.IO.File]::WriteAllText(
        (Join-Path $stageRoot "UPSTREAM.json"),
        $manifestJson,
        [System.Text.UTF8Encoding]::new($false)
    )

    $safeStage = Assert-OwnedPath $stageRoot $vendorParent
    $safeVendor = Assert-OwnedPath $vendorRoot $vendorParent
    if (Test-Path -LiteralPath $safeVendor) {
        $backupRoot = Join-Path $vendorParent (".vscode-dota2-tools-backup-" + [System.Guid]::NewGuid().ToString("N"))
        $safeBackup = Assert-OwnedPath $backupRoot $vendorParent
        [System.IO.Directory]::Move($safeVendor, $safeBackup)
    }

    try {
        [System.IO.Directory]::Move($safeStage, $safeVendor)
        $stageRoot = $null
    } catch {
        if ($backupRoot -and (Test-Path -LiteralPath $backupRoot)) {
            $null = Assert-OwnedPath $backupRoot $vendorParent
            if (Test-Path -LiteralPath $safeVendor) {
                Write-Warning "The snapshot destination was recreated; retaining its contents and the previous snapshot at $backupRoot"
            } else {
                [System.IO.Directory]::Move($backupRoot, $safeVendor)
            }
        }
        throw
    }

    if ($backupRoot -and (Test-Path -LiteralPath $backupRoot)) {
        $safeBackup = Assert-OwnedPath $backupRoot $vendorParent
        try {
            Remove-Item -LiteralPath $safeBackup -Recurse -Force
        } catch {
            Write-Warning "Published the new snapshot, but could not remove backup: $safeBackup"
        }
    }

    Write-Host "Updated DOTA2 references from $SourceUrl at $commit"
    Write-Host "Vendor root: $vendorRoot"
} finally {
    if ($stageRoot) {
        $stageRoot = Assert-OwnedPath $stageRoot $vendorParent
        if (Test-Path -LiteralPath $stageRoot) {
            Remove-Item -LiteralPath $stageRoot -Recurse -Force
        }
    }
    Remove-TemporaryRoot $cloneRoot
}
