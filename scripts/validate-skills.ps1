[CmdletBinding()]
param(
    [string] $RepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path,
    [string[]] $SkillPath,
    [string] $Python = 'python',
    [string] $SkillCreatorRoot,
    [switch] $NoInstall
)

$ErrorActionPreference = 'Stop'

$requirements = Join-Path $RepoRoot 'requirements\skill-validation.txt'
$venvRoot = Join-Path $RepoRoot '.venv\skill-validation'
$venvPython = Join-Path $venvRoot 'Scripts\python.exe'
$env:PYTHONUTF8 = '1'

if (!(Test-Path -LiteralPath $requirements)) {
    throw "Validation requirements not found: $requirements"
}

if (!(Test-Path -LiteralPath $venvPython)) {
    Write-Host "creating validation venv: $venvRoot"
    & $Python -m venv $venvRoot
}

function Test-YamlAvailable {
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        & $venvPython -c "import yaml" *> $null
        return $LASTEXITCODE -eq 0
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

$hasYaml = Test-YamlAvailable

if (!$hasYaml) {
    if ($NoInstall) {
        throw "PyYAML is not installed in $venvRoot. Rerun without -NoInstall to install validation dependencies."
    }

    Write-Host "installing validation dependencies"
    & $venvPython -m pip install --disable-pip-version-check -r $requirements
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install validation dependencies from $requirements"
    }

    if (!(Test-YamlAvailable)) {
        throw "PyYAML is still unavailable after dependency installation."
    }
}

function Resolve-QuickValidate {
    param(
        [string] $ExplicitSkillCreatorRoot
    )

    $candidates = @()

    if ($ExplicitSkillCreatorRoot) {
        $candidates += (Join-Path $ExplicitSkillCreatorRoot 'scripts\quick_validate.py')
    }

    if ($env:CODEX_HOME) {
        $candidates += (Join-Path $env:CODEX_HOME 'skills\.system\skill-creator\scripts\quick_validate.py')
    }

    $candidates += (Join-Path $HOME '.codex\skills\.system\skill-creator\scripts\quick_validate.py')

    foreach ($candidate in $candidates) {
        if (Test-Path -LiteralPath $candidate) {
            return (Resolve-Path -LiteralPath $candidate).Path
        }
    }

    throw "Could not find skill-creator quick_validate.py. Pass -SkillCreatorRoot explicitly."
}

function Get-SkillDirectories {
    param(
        [Parameter(Mandatory = $true)][string] $RepoRoot
    )

    $skillsRoot = Join-Path $RepoRoot 'skills'
    if (!(Test-Path -LiteralPath $skillsRoot)) {
        throw "Skills root not found: $skillsRoot"
    }

    Get-ChildItem -Path $skillsRoot -Filter SKILL.md -Recurse -File |
        Where-Object { $_.FullName -notmatch "[\\/]node_modules[\\/]" -and $_.FullName -notmatch "[\\/]deprecated[\\/]" } |
        ForEach-Object { $_.Directory.FullName } |
        Sort-Object -Unique
}

function Get-RelativeSkillPath {
    param(
        [Parameter(Mandatory = $true)][string] $RepoRoot,
        [Parameter(Mandatory = $true)][string] $SkillDir
    )

    $relative = $SkillDir
    if ($SkillDir.StartsWith($RepoRoot)) {
        $relative = $SkillDir.Substring($RepoRoot.Length) -replace '^[\\/]+', ''
    }

    $relative
}

function Test-UniqueInstallNames {
    param(
        [Parameter(Mandatory = $true)][string] $RepoRoot,
        [Parameter(Mandatory = $true)][string[]] $SkillDirs
    )

    $duplicates = $SkillDirs |
        ForEach-Object {
            [PSCustomObject]@{
                Name = Split-Path -Leaf $_
                Path = Get-RelativeSkillPath -RepoRoot $RepoRoot -SkillDir $_
            }
        } |
        Group-Object -Property Name |
        Where-Object { $_.Count -gt 1 }

    if ($duplicates.Count -gt 0) {
        $messages = $duplicates | ForEach-Object {
            $paths = $_.Group | ForEach-Object { $_.Path }
            "$($_.Name): $($paths -join ', ')"
        }
        throw "Duplicate skill install names detected. link-skills.ps1 installs by directory name: $($messages -join '; ')"
    }

    Write-Host "[ok] unique skill install names"
}

function Test-PluginManifest {
    param(
        [Parameter(Mandatory = $true)][string] $RepoRoot,
        [Parameter(Mandatory = $true)][string[]] $SkillDirs
    )

    $manifestPath = Join-Path $RepoRoot '.claude-plugin\plugin.json'
    if (!(Test-Path -LiteralPath $manifestPath)) {
        throw "Plugin manifest not found: $manifestPath"
    }

    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    $actual = @($manifest.skills | Sort-Object)
    $expected = @(
        $SkillDirs |
            ForEach-Object {
                './' + ((Get-RelativeSkillPath -RepoRoot $RepoRoot -SkillDir $_) -replace '\\', '/')
            } |
            Sort-Object
    )

    $missing = @($expected | Where-Object { $_ -notin $actual })
    $extra = @($actual | Where-Object { $_ -notin $expected })

    if ($missing.Count -gt 0 -or $extra.Count -gt 0) {
        $parts = @()
        if ($missing.Count -gt 0) {
            $parts += "missing: $($missing -join ', ')"
        }
        if ($extra.Count -gt 0) {
            $parts += "extra: $($extra -join ', ')"
        }
        throw "Plugin manifest is out of date ($($parts -join '; '))"
    }

    Write-Host "[ok] .claude-plugin/plugin.json"
}

$quickValidate = Resolve-QuickValidate -ExplicitSkillCreatorRoot $SkillCreatorRoot

if ($SkillPath -and $SkillPath.Count -gt 0) {
    $skillDirs = $SkillPath | ForEach-Object {
        $path = $_
        if (!(Split-Path -Path $path -IsAbsolute)) {
            $path = Join-Path $RepoRoot $path
        }
        (Resolve-Path -LiteralPath $path).Path
    }
}
else {
    $skillDirs = @(Get-SkillDirectories -RepoRoot $RepoRoot)
    Test-UniqueInstallNames -RepoRoot $RepoRoot -SkillDirs $skillDirs
    Test-PluginManifest -RepoRoot $RepoRoot -SkillDirs $skillDirs
}

$failed = @()

foreach ($skillDir in $skillDirs) {
    $relative = Get-RelativeSkillPath -RepoRoot $RepoRoot -SkillDir $skillDir

    & $venvPython $quickValidate $skillDir
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[ok] $relative"
    }
    else {
        Write-Host "[fail] $relative"
        $failed += $relative
    }
}

if ($failed.Count -gt 0) {
    throw "Skill validation failed for: $($failed -join ', ')"
}

Write-Host "validated $($skillDirs.Count) skill(s)"
