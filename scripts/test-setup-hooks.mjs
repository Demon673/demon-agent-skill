#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const lefthook = createRequire(import.meta.url).resolve('lefthook')

test('fresh-host hooks accept records without optional gates and reject whitespace', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'setup-hooks-'))
  const run = (command, args) => spawnSync(command, args, { cwd: fixture, encoding: 'utf8' })
  const succeed = (result) => assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout)
  succeed(run('git', ['init', '--quiet']))
  copyFileSync(join(root, 'skills/agent/setup-demon-skills/scripts/lefthook.template.yml'), join(fixture, 'lefthook.yml'))
  mkdirSync(join(fixture, '.agents/notes/archived/process'), { recursive: true })
  writeFileSync(join(fixture, 'example.i18n.yaml'), 'example.md: hash\n')
  writeFileSync(join(fixture, '.agents', 'notes', 'archived', 'process', 'example.md'), '# Example\n')
  succeed(run('git', ['add', '.']))
  succeed(run(process.execPath, [lefthook, 'run', 'pre-commit']))

  writeFileSync(join(fixture, 'whitespace.txt'), 'invalid trailing space \n')
  succeed(run('git', ['add', 'whitespace.txt']))
  const rejected = run(process.execPath, [lefthook, 'run', 'pre-commit'])
  assert.notEqual(rejected.status, 0)
  assert.match(rejected.stdout + rejected.stderr, /trailing whitespace/)
  console.log(`Isolated hook fixture retained at ${fixture}`)
})
