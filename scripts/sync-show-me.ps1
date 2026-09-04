[CmdletBinding()]
param(
    [string] $RepoRoot,
    [string] $Ref = 'main',
    [switch] $Check
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrEmpty($RepoRoot)) {
    $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
}
$Repo = 'humanlayer/skills'
$UserAgent = 'show-me-sync/1.0'

# GitHub requires TLS 1.2+; PowerShell 5.1 defaults to older.
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Resolve the ref (branch, tag, or SHA) to a commit SHA via the GitHub API.
$resolveUri = "https://api.github.com/repos/$Repo/commits/$Ref"
$sha = (Invoke-RestMethod -Uri $resolveUri -Headers @{ 'User-Agent' = $UserAgent; 'Accept' = 'application/vnd.github+json' }).sha

$destSkill = Join-Path $RepoRoot 'skills\agent\show-me\SKILL.md'
$destLicense = Join-Path $RepoRoot 'skills\agent\show-me\LICENSE.upstream'

$temp = Join-Path ([System.IO.Path]::GetTempPath()) ("show-me-" + [guid]::NewGuid().ToString('N'))
[void](New-Item -ItemType Directory -Path $temp -Force)

try {
    $client = New-Object System.Net.WebClient
    try {
        $client.Headers.Add('User-Agent', $UserAgent)

        $downSkill = Join-Path $temp 'SKILL.md'
        $downLicense = Join-Path $temp 'LICENSE'
        $client.DownloadFile("https://raw.githubusercontent.com/$Repo/$sha/plugins/show-me/skills/show-me/SKILL.md", $downSkill)
        $client.DownloadFile("https://raw.githubusercontent.com/$Repo/$sha/LICENSE", $downLicense)
    }
    finally {
        $client.Dispose()
    }

    # Validate the downloaded SKILL.md before any destination write.
    if ([System.IO.File]::ReadAllText($downSkill) -notmatch '(?m)^name:\s*show-me\s*$') {
        throw "Downloaded SKILL.md from $Repo@$sha does not declare 'name: show-me'."
    }

    $pairs = @(
        @{ Down = $downSkill; Dest = $destSkill; Label = 'SKILL.md' },
        @{ Down = $downLicense; Dest = $destLicense; Label = 'LICENSE.upstream' }
    )

    $issues = @()
    $updated = @()
    foreach ($p in $pairs) {
        if (!(Test-Path -LiteralPath $p.Dest)) {
            $issues += "missing $($p.Label)"
            $updated += $p.Dest
        }
        elseif ((Get-FileHash -LiteralPath $p.Down -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath $p.Dest -Algorithm SHA256).Hash) {
            $issues += "drifting $($p.Label)"
            $updated += $p.Dest
        }
    }

    if ($issues.Count -gt 0) {
        if ($Check) {
            throw "show-me mirror drift at $Repo@${sha}: $($issues -join '; ')"
        }
        [void](New-Item -ItemType Directory -Force -Path (Split-Path -Path $destSkill -Parent))
        foreach ($p in $pairs) {
            if ($updated -contains $p.Dest) {
                Copy-Item -LiteralPath $p.Down -Destination $p.Dest -Force
                Write-Host "updated $($p.Label)"
            }
        }
    }

    Write-Host "[ok] $Repo@$sha"
}
finally {
    Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
}
