[CmdletBinding()]
param(
    [string] $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path,
    [string] $SourceRepo = 'https://github.com/Roblox/creator-docs.git',
    [string] $Ref = 'main',
    [switch] $SkipManifest
)

$ErrorActionPreference = 'Stop'

function Assert-InRepo {
    param(
        [Parameter(Mandatory = $true)][string] $Path,
        [Parameter(Mandatory = $true)][string] $RepoRoot
    )

    $repoFull = [System.IO.Path]::GetFullPath($RepoRoot).TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
    $pathFull = [System.IO.Path]::GetFullPath($Path).TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
    $repoPrefix = $repoFull + [System.IO.Path]::DirectorySeparatorChar

    if ($pathFull -eq $repoFull -or !$pathFull.StartsWith($repoPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to sync outside repository root: $pathFull"
    }
}

function Write-Utf8Lf {
    param(
        [Parameter(Mandatory = $true)][string] $Path,
        [Parameter(Mandatory = $true)][string] $Content
    )

    $normalized = ($Content -replace "`r?`n", "`n").TrimEnd("`n") + "`n"
    $encoding = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $normalized, $encoding)
}

function Update-PluginManifest {
    param(
        [Parameter(Mandatory = $true)][string] $RepoRoot
    )

    $manifestPath = Join-Path $RepoRoot '.claude-plugin\plugin.json'
    if (!(Test-Path -LiteralPath $manifestPath)) {
        Write-Warning "Plugin manifest not found, skipping: $manifestPath"
        return
    }

    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    $skillsRoot = Join-Path $RepoRoot 'skills'
    $skills = Get-ChildItem -Path $skillsRoot -Filter SKILL.md -Recurse -File |
        Where-Object { $_.FullName -notmatch "[\\/]node_modules[\\/]" -and $_.FullName -notmatch "[\\/]deprecated[\\/]" } |
        ForEach-Object {
            $relative = $_.Directory.FullName.Substring($RepoRoot.Length) -replace '^[\\/]+', ''
            './' + ($relative -replace '\\', '/')
        } |
        Sort-Object

    $updated = [ordered]@{
        name = $manifest.name
        skills = @($skills)
    }

    $json = $updated | ConvertTo-Json -Depth 5
    Write-Utf8Lf -Path $manifestPath -Content $json
    Write-Host "updated .claude-plugin/plugin.json"
}

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)][string[]] $Arguments
    )

    & git @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "git $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
    }
}

if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    throw 'git is required to sync Roblox Assistant skills.'
}

$repoRootFull = (Resolve-Path -LiteralPath $RepoRoot).Path
$destination = Join-Path $repoRootFull 'skills\roblox-assistant'
Assert-InRepo -Path $destination -RepoRoot $repoRootFull

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("roblox-creator-docs-" + [System.Guid]::NewGuid().ToString('N'))

try {
    Invoke-Git @('clone', '--quiet', '--depth', '1', '--filter=blob:none', '--sparse', $SourceRepo, $tempRoot)
    Invoke-Git @('-C', $tempRoot, 'fetch', '--quiet', '--depth', '1', 'origin', $Ref)
    Invoke-Git @('-C', $tempRoot, '-c', 'advice.detachedHead=false', 'checkout', '--quiet', 'FETCH_HEAD')
    Invoke-Git @('-C', $tempRoot, 'sparse-checkout', 'set', 'skills')

    $sourceSkills = Join-Path $tempRoot 'skills'
    if (!(Test-Path -LiteralPath $sourceSkills)) {
        throw "Upstream skills directory not found: $sourceSkills"
    }

    $destinationParent = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null

    if (Test-Path -LiteralPath $destination) {
        Remove-Item -LiteralPath $destination -Recurse -Force
    }

    New-Item -ItemType Directory -Path $destination -Force | Out-Null
    Copy-Item -Path (Join-Path $sourceSkills '*') -Destination $destination -Recurse -Force

    $commit = (& git -C $tempRoot rev-parse HEAD).Trim()
    if ($LASTEXITCODE -ne 0) {
        throw "git rev-parse HEAD failed with exit code $LASTEXITCODE"
    }
    $upstream = [ordered]@{
        source = 'Roblox/creator-docs'
        path = 'skills'
        ref = $Ref
        commit = $commit
        syncedAtUtc = (Get-Date).ToUniversalTime().ToString('o')
    }
    Write-Utf8Lf -Path (Join-Path $destination 'UPSTREAM.json') -Content ($upstream | ConvertTo-Json -Depth 5)

    if (!$SkipManifest) {
        Update-PluginManifest -RepoRoot $repoRootFull
    }

    Get-ChildItem -Path $destination -Filter SKILL.md -Recurse -File |
        ForEach-Object {
            $relative = $_.Directory.FullName.Substring($repoRootFull.Length) -replace '^[\\/]+', ''
            $relative -replace '\\', '/'
        } |
        Sort-Object |
        ForEach-Object { Write-Host "synced $_" }
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
