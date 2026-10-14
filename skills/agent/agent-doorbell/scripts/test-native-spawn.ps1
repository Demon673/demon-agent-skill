$ErrorActionPreference = 'Stop'
$runner = Join-Path $PSScriptRoot 'hook-runner.ps1'
$global:doorbellCaptured = $null

function Start-Process {
    param($FilePath, $ArgumentList, $WindowStyle)
    $global:doorbellCaptured = $ArgumentList
}

& $runner -Event PermissionRequest -Summary "A user's input with spaces" -Mode sound
if ($null -eq $global:doorbellCaptured) { throw 'The native runner did not launch playback' }
$command = [System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String($global:doorbellCaptured[-1]))
$errors = $null
$tokens = $null
$ast = [System.Management.Automation.Language.Parser]::ParseInput($command, [ref]$tokens, [ref]$errors)
if ($errors.Count -gt 0) { throw 'The playback command is invalid PowerShell' }
$call = $ast.Find({ param($node) $node -is [System.Management.Automation.Language.CommandAst] }, $true)
$elements = @($call.CommandElements)
if ($elements[0].Value -ne (Join-Path $PSScriptRoot 'ring.ps1')) { throw 'The playback script path changed' }
$summaryIndex = -1
for ($index = 0; $index -lt $elements.Count; $index++) {
    if ($elements[$index].Extent.Text -eq '-Summary') { $summaryIndex = $index + 1 }
}
if ($summaryIndex -lt 0 -or $elements[$summaryIndex].Value -ne "A user's input with spaces") { throw 'The summary was split or escaped incorrectly' }
$global:doorbellCaptured = $null
& $runner -Event Stop -Mode none
if ($null -ne $global:doorbellCaptured) { throw 'Silent mode launched playback' }
Write-Output 'Native playback launch passed: quoted path, summary and silent mode.'
