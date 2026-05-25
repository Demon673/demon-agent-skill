[CmdletBinding()]
param(
    [string] $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'
$skillsRoot = Join-Path $RepoRoot 'skills'

if (!(Test-Path -LiteralPath $skillsRoot)) {
    throw "Skills root not found: $skillsRoot"
}

Get-ChildItem -Path $skillsRoot -Filter SKILL.md -Recurse -File |
    Where-Object { $_.FullName -notmatch "[\\/]node_modules[\\/]" -and $_.FullName -notmatch "[\\/]deprecated[\\/]" } |
    ForEach-Object {
        $skillDir = $_.Directory.FullName
        $relative = $skillDir.Substring($RepoRoot.Length) -replace '^[\\/]+', ''
        $relative -replace '\\', '/'
    } |
    Sort-Object