[CmdletBinding()]
param(
    [string] $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path,
    [string] $Destination = (Join-Path $HOME '.agents\skills'),
    [switch] $Force,
    [switch] $Copy
)

$ErrorActionPreference = 'Stop'
$skillsRoot = Join-Path $RepoRoot 'skills'

if (!(Test-Path -LiteralPath $skillsRoot)) {
    throw "Skills root not found: $skillsRoot"
}

New-Item -ItemType Directory -Path $Destination -Force | Out-Null

$skillFiles = Get-ChildItem -Path $skillsRoot -Filter SKILL.md -Recurse -File |
    Where-Object { $_.FullName -notmatch "[\\/]node_modules[\\/]" -and $_.FullName -notmatch "[\\/]deprecated[\\/]" }

foreach ($skillFile in $skillFiles) {
    $source = $skillFile.Directory.FullName
    $name = $skillFile.Directory.Name
    $target = Join-Path $Destination $name

    if (Test-Path -LiteralPath $target) {
        $item = Get-Item -LiteralPath $target -Force
        $isLink = [bool]($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)

        if (!$Force -and !$isLink) {
            Write-Warning "Skipping existing non-link target: $target (use -Force to replace, or -Copy to install a copy)"
            continue
        }

        Remove-Item -LiteralPath $target -Recurse -Force
    }

    if ($Copy) {
        Copy-Item -LiteralPath $source -Destination $target -Recurse -Force
        Write-Host "copied $name -> $target"
    }
    else {
        New-Item -ItemType Junction -Path $target -Target $source | Out-Null
        Write-Host "linked $name -> $source"
    }
}