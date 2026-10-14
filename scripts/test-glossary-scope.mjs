#!/usr/bin/env node
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isScopeFile } from './lib/scope.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const fixture = mkdtempSync(join(tmpdir(), 'glossary-scope-'))
cpSync(join(root, 'scripts'), join(fixture, 'scripts'), { recursive: true })
writeFileSync(join(fixture, 'package.json'), '{"type":"module"}\n')
symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir')
mkdirSync(join(fixture, 'docs', 'i18n'), { recursive: true })
writeFileSync(join(fixture, 'docs', 'i18n', 'terminology.md'), '# Terminology\n')

function run(command, args) {
  return spawnSync(command, args, { cwd: fixture, encoding: 'utf8' })
}
function succeed(result) {
  assert.equal(result.status, 0, result.error?.message || result.stderr)
  return result.stdout
}
function tool(name, args = []) {
  return run(process.execPath, [join(fixture, 'scripts', name), ...args])
}

succeed(run('git', ['init', '--quiet']))
assert.equal(isScopeFile('GLOSSARY.md'), true)
assert.equal(isScopeFile('GLOSSARY.zh.md'), true)
assert.equal(isScopeFile('GLOSSARYxmd'), false)
assert.equal(isScopeFile('CONTEXT.md'), false)
writeFileSync(join(fixture, 'GLOSSARY.md'), '# Glossary\n\nEnglish | [中文](GLOSSARY.zh.md)\n\nVocabulary.\n')
writeFileSync(join(fixture, 'GLOSSARY.zh.md'), '# 术语表\n\n[English](GLOSSARY.md) | 中文\n\n词汇。\n')
succeed(tool('verify-translation-pairing.mjs', ['--write', 'GLOSSARY.md']))
assert.match(succeed(tool('verify-translation-pairing.mjs')), /1 pair\(s\).*all consistent/)
assert.match(succeed(tool('verify-translation-pairing.mjs', ['--list'])), /ok\s+GLOSSARY\.md/)

writeFileSync(join(fixture, 'GLOSSARY.md'), readFileSync(join(fixture, 'GLOSSARY.md'), 'utf8').replace('Vocabulary.', 'Updated vocabulary.'))
const drift = tool('verify-translation-pairing.mjs')
assert.equal(drift.status, 1)
assert.match(drift.stderr, /GLOSSARY\.md: out of sync/)
assert.match(succeed(tool('gen-translation-brief.mjs')), /GLOSSARY\.md/)
console.log('Glossary scope acceptance passed: corpus discovery, drift rejection and automatic briefing.')
console.log(`Isolated fixture retained at ${fixture}`)
