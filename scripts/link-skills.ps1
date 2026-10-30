[CmdletBinding()]
param(
    [string] $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path,
    [string] $Destination = (Join-Path $HOME '.agents\skills'),
    [switch] $Force,
    [switch] $Copy
)

$ErrorActionPreference = 'Stop'
$skillsRoot = Join-Path $RepoRoot 'skills'

function Resolve-InstallDirectory {
    param([string] $Path, [int] $LinkDepth = 0)
    if ($LinkDepth -gt 40) { throw "Too many directory links: $Path" }
    $full = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Path)
    $parent = Split-Path -Parent $full
    if ($parent) {
        $full = Join-Path (Resolve-InstallDirectory $parent $LinkDepth) (Split-Path -Leaf $full)
    }
    $item = Get-Item -LiteralPath $full -Force -ErrorAction SilentlyContinue
    if ($item -and ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
        $target = @($item.Target)[0]
        if (!$target) { throw "Cannot resolve directory link: $full" }
        if (![System.IO.Path]::IsPathRooted($target)) { $target = Join-Path (Split-Path -Parent $full) $target }
        return Resolve-InstallDirectory $target ($LinkDepth + 1)
    }
    if ($item) { return $item.FullName }
    return $full
}

function Test-WithinDirectory {
    param([string] $Path, [string] $Directory)
    $pathKey = $Path.TrimEnd('\', '/')
    $directoryKey = $Directory.TrimEnd('\', '/')
    return $pathKey.Equals($directoryKey, [System.StringComparison]::OrdinalIgnoreCase) -or
        $pathKey.StartsWith($directoryKey + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)
}

if (!(Test-Path -LiteralPath $skillsRoot)) {
    throw "Skills root not found: $skillsRoot"
}

$skillsRoot = Resolve-InstallDirectory $skillsRoot
$Destination = Resolve-InstallDirectory $Destination

$skillFiles = Get-ChildItem -Path $skillsRoot -Filter SKILL.md -Recurse -File |
    Where-Object { $_.FullName -notmatch "[\\/]node_modules[\\/]" -and $_.FullName -notmatch "[\\/]deprecated[\\/]" }

foreach ($skillFile in $skillFiles) {
    # Resolve the parent only: replacing an installed link must not follow its target.
    $target = Join-Path $Destination $skillFile.Directory.Name
    $source = Resolve-InstallDirectory $skillFile.Directory.FullName
    if ((Test-WithinDirectory $target $skillsRoot) -or (Test-WithinDirectory $skillsRoot $target) -or
        (Test-WithinDirectory $target $source) -or (Test-WithinDirectory $source $target)) {
        throw "Installation target overlaps the skill source tree: $target"
    }
}

New-Item -ItemType Directory -Path $Destination -Force | Out-Null

foreach ($skillFile in $skillFiles) {
    $source = $skillFile.Directory.FullName
    $name = $skillFile.Directory.Name
    $target = Join-Path $Destination $name

    $item = Get-Item -LiteralPath $target -Force -ErrorAction SilentlyContinue
    if ($item) {
        $isLink = [bool]($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)

        if (!$Force -and !$isLink) {
            Write-Warning "Skipping existing non-link target: $target (use -Force to replace, or -Copy to install a copy)"
            continue
        }

        if ($isLink) { $item.Delete() }
        else { Remove-Item -LiteralPath $target -Recurse -Force }
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
