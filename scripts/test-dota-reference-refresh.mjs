import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

function snapshot(directory) {
  const files = {}
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name)
      if (entry.isDirectory()) visit(path)
      else files[relative(directory, path).replaceAll('\\', '/')] = readFileSync(path).toString('base64')
    }
  }
  visit(directory)
  return files
}

function snapshotPayload(directory) {
  const files = snapshot(directory)
  delete files['UPSTREAM.json']
  return files
}

function manifestContract(manifest) {
  const contract = { ...manifest }
  delete contract.updatedAt
  return contract
}

test('reference refresh preflights provenance, keeps snapshots stable and copies the upstream license', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'dota-reference-refresh-'))
  try {
    const upstream = join(fixture, 'upstream')
    const skill = join(fixture, 'skill')
    const script = join(skill, 'scripts', 'update_references.ps1')
    mkdirSync(join(upstream, 'resource'), { recursive: true })
    mkdirSync(join(skill, 'scripts'), { recursive: true })
    mkdirSync(join(fixture, 'empty-template'))
    writeFileSync(join(fixture, 'gitconfig'), '')
    copyFileSync(join(root, 'skills/dota2/dota2-custom-game-dev/scripts/update_references.ps1'), script)

    const environment = {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_CONFIG_GLOBAL: join(fixture, 'gitconfig'),
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: 'init.templateDir',
      GIT_CONFIG_VALUE_0: join(fixture, 'empty-template'),
    }
    const run = (command, args, cwd = upstream) => spawnSync(command, args, {
      cwd,
      encoding: 'utf8',
      env: environment,
      timeout: 30000,
    })
    const requireSuccess = (result) => {
      assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout)
      return result
    }
    const commitFixture = (message) => requireSuccess(run('git', [
      '-c', 'user.name=Test',
      '-c', 'user.email=test@example.invalid',
      '-c', 'commit.gpgsign=false',
      '-c', 'core.hooksPath=.git/hooks',
      'commit', '--quiet', '-m', message,
    ]))

    const markdown = new Map([
      ['resource/dump_panorama_events.md', ['# Events \t\r\n\r\n  indented event \r\n\r\n', '# Events\n\n  indented event\n']],
      ['resource/PanelList.md', ['\r\n\t \r\n', '']],
      ['resource/lua_api_changelog.md', ['# API 更新日志 \r\nentry\t\r\n\r\n', '# API 更新日志\nentry\n']],
    ])
    const raw = new Map([
      ['LICENSE', 'Copyright fixture\n\nPermission is hereby granted.\n'],
      ['resource/dota_script_help2.json', '{ "class_list": {}, "enum_list": {} }\r\n'],
      ['resource/cl_panorama_script_help_2.json', '{ "name": "preserve spaces " }\r\n'],
      ['resource/dump_panorama_css_properties.json', '{}\r\n'],
      ['resource/PanelList.json', '{}\r\n'],
      ['css.css-data.json', '{}\r\n'],
      ['html.html-data.json', ''],
    ])
    for (const [name, [input]] of markdown) writeFileSync(join(upstream, name), input)
    for (const [name, input] of raw) writeFileSync(join(upstream, name), input)

    requireSuccess(run('git', ['init', '--quiet']))
    requireSuccess(run('git', ['add', '.']))
    commitFixture('fixture')

    const powershell = process.platform === 'win32' ? 'powershell' : 'pwsh'
    const refresh = () => run(powershell, [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', script, '-UpstreamRoot', upstream,
    ], fixture)
    requireSuccess(refresh())

    const vendor = join(skill, 'references/vendor/vscode-dota2-tools')
    const expectedFiles = [
      'LICENSE',
      'resource/dota_script_help2.json',
      'resource/cl_panorama_script_help_2.json',
      'resource/dump_panorama_css_properties.json',
      'resource/dump_panorama_events.md',
      'resource/PanelList.json',
      'resource/PanelList.md',
      'resource/lua_api_changelog.md',
      'css.css-data.json',
      'html.html-data.json',
    ]
    const manifest = JSON.parse(readFileSync(join(vendor, 'UPSTREAM.json'), 'utf8').replace(/^\uFEFF/, ''))
    const commit = requireSuccess(run('git', ['rev-parse', 'HEAD'])).stdout.trim()
    assert.equal(manifest.commit, commit)
    assert.deepEqual(manifest.copiedFiles, expectedFiles)
    assert.deepEqual(readFileSync(join(vendor, 'LICENSE')), readFileSync(join(upstream, 'LICENSE')))
    for (const [name, [, expected]] of markdown) {
      assert.deepEqual(readFileSync(join(vendor, name)), Buffer.from(expected), name)
    }
    for (const [name, expected] of raw) {
      assert.deepEqual(readFileSync(join(vendor, name)), Buffer.from(expected), name)
    }

    const firstPayload = snapshotPayload(vendor)
    requireSuccess(refresh())
    const refreshedManifest = JSON.parse(readFileSync(join(vendor, 'UPSTREAM.json'), 'utf8').replace(/^\uFEFF/, ''))
    assert.deepEqual(snapshotPayload(vendor), firstPayload, 'refresh must preserve every copied snapshot file')
    assert.deepEqual(manifestContract(refreshedManifest), manifestContract(manifest), 'refresh must preserve manifest metadata')
    const beforeFailure = snapshot(vendor)

    if (process.platform === 'win32') {
      const wrapper = join(fixture, 'locked-publication.ps1')
      const marker = join(fixture, 'released-stage-lock.txt')
      writeFileSync(wrapper, [
        'param([string] $Script, [string] $UpstreamRoot, [string] $Marker)',
        "$ErrorActionPreference = 'Stop'",
        '$global:stageLock = $null',
        'function global:Copy-Item {',
        '  param([string] $LiteralPath, [string] $Destination, [switch] $Force)',
        '  Microsoft.PowerShell.Management\\Copy-Item @PSBoundParameters',
        "  if ([IO.Path]::GetFileName($LiteralPath) -eq 'LICENSE') {",
        '    $global:stageLock = [IO.File]::Open($Destination, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)',
        '  }',
        '}',
        'function global:Remove-Item {',
        '  param([string] $LiteralPath, [switch] $Recurse, [switch] $Force)',
        "  if ($global:stageLock -and ((Split-Path -Leaf $LiteralPath) -like '.vscode-dota2-tools-stage-*')) {",
        '    $global:stageLock.Dispose()',
        '    $global:stageLock = $null',
        "    [IO.File]::WriteAllText($Marker, 'released')",
        '  }',
        '  Microsoft.PowerShell.Management\\Remove-Item @PSBoundParameters',
        '}',
        'try { & $Script -UpstreamRoot $UpstreamRoot } finally { if ($global:stageLock) { $global:stageLock.Dispose() } }',
        '',
      ].join('\n'))
      const failedPublication = run(powershell, [
        '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', wrapper,
        '-Script', script, '-UpstreamRoot', upstream, '-Marker', marker,
      ], fixture)
      assert.notEqual(failedPublication.status, 0)
      assert.match(failedPublication.stderr, /Move\(\$safeStage/)
      assert.equal(readFileSync(marker, 'utf8'), 'released')
      assert.deepEqual(snapshot(vendor), beforeFailure, 'a failed directory publication must restore the prior snapshot')
      assert.deepEqual(
        readdirSync(join(skill, 'references/vendor')).filter((name) => /^\.vscode-dota2-tools-(backup|stage)-/u.test(name)),
        [],
      )
    }

    const required = join(upstream, 'resource/dota_script_help2.json')
    const requiredBytes = readFileSync(required)
    rmSync(required)
    const missing = refresh()
    assert.notEqual(missing.status, 0)
    assert.match(`${missing.stdout}\n${missing.stderr}`, /Missing required upstream reference: resource\/dota_script_help2\.json/)
    assert.deepEqual(snapshot(vendor), beforeFailure, 'missing input must not alter the prior snapshot')
    writeFileSync(required, requiredBytes)

    renameSync(join(upstream, '.git'), join(upstream, '.git-disabled'))
    const invalid = refresh()
    assert.notEqual(invalid.status, 0)
    assert.match(`${invalid.stdout}\n${invalid.stderr}`, /Invalid upstream provenance/)
    assert.deepEqual(snapshot(vendor), beforeFailure, 'invalid provenance must not alter the prior snapshot')
    renameSync(join(upstream, '.git-disabled'), join(upstream, '.git'))

    const dirtyLicense = join(upstream, 'LICENSE')
    const licenseBytes = readFileSync(dirtyLicense)
    writeFileSync(dirtyLicense, Buffer.concat([licenseBytes, Buffer.from('dirty')]))
    const dirty = refresh()
    assert.notEqual(dirty.status, 0)
    assert.match(`${dirty.stdout}\n${dirty.stderr}`, /tracked files differ/)
    assert.deepEqual(snapshot(vendor), beforeFailure, 'dirty source must not alter the prior snapshot')
    writeFileSync(dirtyLicense, licenseBytes)

    rmSync(join(upstream, 'html.html-data.json'))
    requireSuccess(run('git', ['add', '-u']))
    commitFixture('remove optional html')
    requireSuccess(refresh())
    const withoutHtml = JSON.parse(readFileSync(join(vendor, 'UPSTREAM.json'), 'utf8').replace(/^\uFEFF/, ''))
    assert.equal(withoutHtml.copiedFiles.includes('html.html-data.json'), false)
    assert.equal(readFileSync(join(vendor, 'UPSTREAM.json'), 'utf8').includes('html.html-data.json'), false)
    assert.equal(requireSuccess(run('git', ['status', '--short'])).stdout, '')

    const optionalPayload = snapshotPayload(vendor)
    const optionalManifest = JSON.parse(readFileSync(join(vendor, 'UPSTREAM.json'), 'utf8').replace(/^\uFEFF/, ''))
    requireSuccess(refresh())
    const repeatedOptionalManifest = JSON.parse(readFileSync(join(vendor, 'UPSTREAM.json'), 'utf8').replace(/^\uFEFF/, ''))
    assert.deepEqual(snapshotPayload(vendor), optionalPayload, 'optional-file removal must preserve copied snapshot files')
    assert.deepEqual(manifestContract(repeatedOptionalManifest), manifestContract(optionalManifest))
    assert.deepEqual(
      readdirSync(join(skill, 'references/vendor')).filter((name) => /^\.vscode-dota2-tools-(backup|stage)-/u.test(name)),
      [],
      'successful publication must leave no stage or backup directory',
    )

    const beforeCompetition = snapshot(vendor)
    const instrumented = join(skill, 'scripts', 'competing-refresh.ps1')
    const publication = '[System.IO.Directory]::Move($safeStage, $safeVendor)'
    const source = readFileSync(script, 'utf8')
    assert.equal(source.split(publication).length, 2)
    writeFileSync(instrumented, source.replace(publication, [
      '[IO.Directory]::CreateDirectory($safeVendor) | Out-Null',
      "        [IO.File]::WriteAllText((Join-Path $safeVendor 'foreign-snapshot.txt'), 'keep competing output')",
      `        ${publication}`,
    ].join('\n')))
    const competingPublication = run(powershell, [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', instrumented, '-UpstreamRoot', upstream,
    ], fixture)
    assert.notEqual(competingPublication.status, 0)
    assert.equal(readFileSync(join(vendor, 'foreign-snapshot.txt'), 'utf8'), 'keep competing output')
    const backups = readdirSync(join(skill, 'references/vendor')).filter((name) => name.startsWith('.vscode-dota2-tools-backup-'))
    assert.equal(backups.length, 1)
    assert.deepEqual(snapshot(join(skill, 'references/vendor', backups[0])), beforeCompetition)
    assert.equal(readdirSync(join(skill, 'references/vendor')).some((name) => name.startsWith('.vscode-dota2-tools-stage-')), false)
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
