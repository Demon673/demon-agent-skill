#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const skillText = '---\nname: example\ndescription: Example fixture skill.\n---\n\n# Example\n'

function snapshotTree(directory) {
  const snapshot = []
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(current, entry.name)
      const name = relative(directory, path).replaceAll('\\', '/')
      if (entry.isDirectory()) {
        snapshot.push(`directory:${name}`)
        visit(path)
      } else {
        snapshot.push(`file:${name}:${readFileSync(path).toString('base64')}`)
      }
    }
  }
  visit(directory)
  return snapshot
}

function makeFixture(label) {
  const temporary = mkdtempSync(join(tmpdir(), `link-skills-${label}-`))
  const repo = join(temporary, 'example')
  const source = join(repo, 'skills', 'agent', 'example')
  mkdirSync(source, { recursive: true })
  mkdirSync(join(repo, 'scripts'))
  writeFileSync(join(source, 'SKILL.md'), skillText)
  copyFileSync(join(root, 'scripts', 'link-skills.ps1'), join(repo, 'scripts', 'link-skills.ps1'))
  copyFileSync(join(root, 'scripts', 'link-skills.sh'), join(repo, 'scripts', 'link-skills.sh'))
  return { temporary, repo, source }
}

function withFixture(label, run) {
  const fixture = makeFixture(label)
  try {
    run(fixture)
  } finally {
    rmSync(fixture.temporary, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
  }
}

function details(result) {
  return result.error?.message || [result.stdout, result.stderr].filter(Boolean).join('\n')
}

function requireSuccess(result) {
  assert.equal(result.error, undefined, result.error?.message)
  assert.equal(result.status, 0, details(result))
  return result
}

function requireOverlap(result, scenario = '') {
  assert.equal(result.error, undefined, result.error?.message)
  assert.notEqual(result.status, 0, [scenario, details(result)].filter(Boolean).join('\n'))
  assert.match(`${result.stdout}\n${result.stderr}`, /installation target overlaps the skill source tree/i)
}

function createAlias(target, alias) {
  mkdirSync(dirname(alias), { recursive: true })
  symlinkSync(target, alias, process.platform === 'win32' ? 'junction' : 'dir')
}

function negativeCases(fixture) {
  const alias = join(fixture.temporary, 'source-alias')
  createAlias(join(fixture.repo, 'skills'), alias)
  return [
    {
      name: 'destination equal to the containing skill directory',
      destination: join(fixture.repo, 'skills', 'agent'),
    },
    {
      name: 'destination nested below the source and not created',
      destination: join(fixture.source, 'nested-install'),
      forbiddenPath: join(fixture.source, 'nested-install'),
    },
    {
      name: 'destination whose target is the repository ancestor',
      destination: fixture.temporary,
    },
    {
      name: 'destination below a junction with a missing suffix',
      destination: join(alias, 'agent', 'not-created'),
      forbiddenPath: join(fixture.repo, 'skills', 'agent', 'not-created'),
    },
  ]
}

function assertNegativeCases(fixture, invoke) {
  for (const scenario of negativeCases(fixture)) {
    const before = snapshotTree(fixture.source)
    const result = invoke(fixture, scenario.destination)
    requireOverlap(result, scenario.name)
    assert.deepEqual(snapshotTree(fixture.source), before, scenario.name)
    if (scenario.forbiddenPath) {
      assert.equal(existsSync(scenario.forbiddenPath), false, `${scenario.name}: preflight must run before mkdir`)
    }
  }
}

function physicalPath(path) {
  const canonical = realpathSync.native(path).replaceAll('\\', '/')
  return process.platform === 'win32' ? canonical.toLowerCase() : canonical
}

function assertInstalledLink(target, source) {
  assert.equal(lstatSync(target).isSymbolicLink(), true, `${target} must be a link`)
  assert.equal(physicalPath(target), physicalPath(source))
}

function assertCopiedInstall(fixture, destination, invoke) {
  let before = snapshotTree(fixture.source)
  requireSuccess(invoke(fixture, destination, { copy: true }))
  assert.equal(lstatSync(destination).isSymbolicLink(), false)
  assert.equal(readFileSync(join(destination, 'example', 'SKILL.md'), 'utf8'), skillText)
  assert.deepEqual(snapshotTree(fixture.source), before)

  const installed = join(destination, 'example')
  const unrelated = join(destination, 'unrelated-sentinel.txt')
  writeFileSync(join(installed, 'stale.txt'), 'stale\n')
  writeFileSync(unrelated, 'keep\n')
  before = snapshotTree(fixture.source)
  requireSuccess(invoke(fixture, destination, { copy: true, force: true }))
  assert.equal(readFileSync(join(installed, 'SKILL.md'), 'utf8'), skillText)
  assert.equal(existsSync(join(installed, 'stale.txt')), false)
  assert.equal(readFileSync(unrelated, 'utf8'), 'keep\n')
  assert.deepEqual(snapshotTree(fixture.source), before)
}

function assertLinkedInstall(fixture, destination, invoke) {
  const sourceSentinel = join(fixture.source, 'source-sentinel.txt')
  writeFileSync(sourceSentinel, 'keep source\n')
  const before = snapshotTree(fixture.source)
  requireSuccess(invoke(fixture, destination))
  const installed = join(destination, 'example')
  assertInstalledLink(installed, fixture.source)

  const unrelated = join(destination, 'unrelated-sentinel.txt')
  writeFileSync(unrelated, 'keep\n')
  requireSuccess(invoke(fixture, destination))
  assertInstalledLink(installed, fixture.source)
  assert.equal(readFileSync(sourceSentinel, 'utf8'), 'keep source\n')
  assert.equal(readFileSync(unrelated, 'utf8'), 'keep\n')
  assert.deepEqual(snapshotTree(fixture.source), before)
}

function resolvePowerShell() {
  if (process.platform === 'win32') return 'powershell.exe'
  return 'pwsh'
}

function invokePowerShell(fixture, destination, { copy = false, force = false, mockDelete = false } = {}) {
  const installer = join(fixture.repo, 'scripts', 'link-skills.ps1')
  const flags = []
  if (copy) flags.push('-Copy')
  if (force) flags.push('-Force')

  if (mockDelete) {
    const wrapper = join(fixture.temporary, 'run-with-delete-guard.ps1')
    writeFileSync(wrapper, [
      'param([string] $Installer, [string] $RepoRoot, [string] $Destination)',
      "$ErrorActionPreference = 'Stop'",
      "function global:Remove-Item { throw 'unexpected deletion primitive' }",
      '& $Installer -RepoRoot $RepoRoot -Destination $Destination -Force',
      '',
    ].join('\n'))
    return spawnSync(resolvePowerShell(), [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', wrapper,
      '-Installer', installer, '-RepoRoot', fixture.repo, '-Destination', destination,
    ], { cwd: fixture.temporary, encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024 })
  }

  return spawnSync(resolvePowerShell(), [
    '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', installer,
    '-RepoRoot', fixture.repo, '-Destination', destination, ...flags,
  ], { cwd: fixture.temporary, encoding: 'utf8', timeout: 30000, maxBuffer: 1024 * 1024 })
}

function resolveGitBash() {
  if (process.platform !== 'win32') return 'bash'
  const candidates = [
    process.env.ProgramFiles && join(process.env.ProgramFiles, 'Git', 'bin', 'bash.exe'),
    process.env.ProgramW6432 && join(process.env.ProgramW6432, 'Git', 'bin', 'bash.exe'),
  ].filter(Boolean)
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  const git = spawnSync('git', ['--exec-path'], { encoding: 'utf8', timeout: 10000 })
  if (git.status === 0) {
    let current = git.stdout.trim()
    while (dirname(current) !== current) {
      const candidate = join(current, 'bin', 'bash.exe')
      if (existsSync(candidate)) return candidate
      current = dirname(current)
    }
  }
  throw new Error('Git Bash is required on Windows; install Git for Windows or expose its bin/bash.exe')
}

function bashPath(path) {
  if (process.platform !== 'win32') return path
  const absolute = resolve(path).replaceAll('\\', '/')
  return `/${absolute[0].toLowerCase()}${absolute.slice(2)}`
}

function invokeBash(fixture, destination, { copy = false, force = false, mockDelete = false } = {}) {
  const installer = join(fixture.repo, 'scripts', 'link-skills.sh')
  const flags = []
  if (copy) flags.push('--copy')
  if (force) flags.push('--force')
  const environment = { ...process.env, AGENT_SKILLS_DIR: bashPath(destination) }

  if (mockDelete) {
    const guard = join(fixture.temporary, 'delete-guard.bash')
    writeFileSync(guard, [
      'rm() { printf "%s\\n" "unexpected deletion primitive" >&2; exit 97; }',
      '',
    ].join('\n'))
    environment.BASH_ENV = bashPath(guard)
  } else {
    environment.BASH_ENV = ''
  }

  return spawnSync(resolveGitBash(), [bashPath(installer), ...flags], {
    cwd: fixture.temporary,
    encoding: 'utf8',
    env: environment,
    timeout: 30000,
    maxBuffer: 1024 * 1024,
  })
}

test('PowerShell linker rejects every source overlap before mutation', { skip: process.platform !== 'win32' }, () => {
  withFixture('powershell-negative', (fixture) => {
    assertNegativeCases(fixture, (current, destination) =>
      invokePowerShell(current, destination, { force: true, mockDelete: true }))
  })
})

test('PowerShell linker safely reinstalls copies and replaces source links', { skip: process.platform !== 'win32' }, () => {
  withFixture('powershell-positive', (fixture) => {
    assertCopiedInstall(fixture, join(fixture.temporary, 'installed-copy'), invokePowerShell)
    assertLinkedInstall(fixture, join(fixture.temporary, 'installed-link'), invokePowerShell)
  })
})

test('Windows linkers reject source aliases using NTFS short names', { skip: process.platform !== 'win32' }, (t) => {
  withFixture('short-name-negative', (fixture) => {
    const destination = join(fixture.repo, 'skills', 'agent')
    const result = requireSuccess(spawnSync(resolvePowerShell(), [
      '-NoProfile', '-NonInteractive', '-Command',
      '$fso = New-Object -ComObject Scripting.FileSystemObject; $fso.GetFolder($env:LINK_SKILLS_TEST_DIRECTORY).ShortPath',
    ], {
      env: { ...process.env, LINK_SKILLS_TEST_DIRECTORY: destination },
      encoding: 'utf8',
      timeout: 30000,
    }))
    const shortPath = result.stdout.trim()
    if (shortPath.toLowerCase() === destination.toLowerCase()) {
      t.skip('NTFS short names are disabled on the fixture volume')
      return
    }
    const before = snapshotTree(fixture.source)
    requireOverlap(invokePowerShell(fixture, shortPath, { force: true, mockDelete: true }))
    requireOverlap(invokeBash(fixture, shortPath, { force: true, mockDelete: true }))
    assert.deepEqual(snapshotTree(fixture.source), before)
  })
})

test('Bash linker rejects every source overlap before mutation', () => {
  withFixture('bash-negative', (fixture) => {
    assertNegativeCases(fixture, (current, destination) =>
      invokeBash(current, destination, { force: true, mockDelete: true }))
  })
})

test('Bash linker safely reinstalls copies and replaces source links', () => {
  withFixture('bash-positive', (fixture) => {
    assertCopiedInstall(fixture, join(fixture.temporary, 'installed-copy'), invokeBash)
    assertLinkedInstall(fixture, join(fixture.temporary, 'installed-link'), invokeBash)
  })
})
