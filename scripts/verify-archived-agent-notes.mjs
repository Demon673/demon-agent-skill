#!/usr/bin/env node
// Verify and append-seal the frozen Agent Note archive. Faithful port of
// deepseek-harness scripts/verify-archived-agent-notes.ts (minus the git
// baseline merge check, which is dsh-specific).

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gitBlobHash } from './lib/git.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const archiveRoot = join(root, '.agents/notes/archived')
const manifestPath = join(archiveRoot, 'manifest.json')
const CLASSES = ['feature', 'bug-fix', 'simplification', 'architecture', 'process', 'testing']
const ALLOWED_ROOT_FILES = new Set(['AGENTS.md', 'manifest.json'])

function archiveContentHash(content) {
  return `sha256:${createHash('sha256').update(content).digest('hex')}`
}

function parseManifest(text) {
  const value = JSON.parse(text)
  if (Object.keys(value).sort().join(',') !== 'files,version') throw new Error('expected exactly the fields `version` and `files`')
  if (value.version !== 1) throw new Error('unsupported manifest version (expected 1)')
  if (typeof value.files !== 'object' || value.files === null) throw new Error('`files` must be an object')
  const files = {}
  for (const [path, hash] of Object.entries(value.files)) {
    if (typeof hash !== 'string' || !/^sha256:[0-9a-f]{64}$/.test(hash)) throw new Error(`invalid content hash for ${path}`)
    files[path] = hash
  }
  return { version: 1, files }
}

function renderManifest(files) {
  return JSON.stringify({ version: 1, files: Object.fromEntries(Object.entries(files).sort()) }, null, 2) + '\n'
}

function readSidecarHashes(path) {
  const out = new Map()
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (line === '' || line.startsWith('#')) continue
    const m = /^([^:#]+\.md): ([0-9a-f]{40})$/.exec(line)
    if (!m?.[1] || !m[2] || out.has(m[1])) return undefined
    out.set(m[1], m[2])
  }
  return out
}

const args = process.argv.slice(2)
const writeMode = args.length === 1 && args[0] === '--write'
if (args.length > 0 && !writeMode) {
  console.error('verify-archived-agent-notes: usage: node scripts/verify-archived-agent-notes.mjs [--write]')
  process.exit(1)
}

const errors = []

let manifest = { version: 1, files: {} }
if (existsSync(manifestPath)) {
  try {
    manifest = parseManifest(readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    errors.push(`archived/manifest.json: ${error instanceof Error ? error.message : String(error)}`)
  }
} else if (!writeMode) {
  errors.push('archived/manifest.json is required; seal new artifacts with `node scripts/verify-archived-agent-notes.mjs --write`')
}

if (!existsSync(join(archiveRoot, 'AGENTS.md'))) errors.push('archived/AGENTS.md is required')

const artifacts = new Map() // rel -> Buffer (English side content)
const nextFiles = { ...manifest.files }
const added = []

for (const entry of readdirSync(archiveRoot, { withFileTypes: true })) {
  if (entry.isFile()) {
    if (!ALLOWED_ROOT_FILES.has(entry.name)) errors.push(`archived/${entry.name}: unexpected root file`)
    continue
  }
  if (!entry.isDirectory()) {
    errors.push(`archived/${entry.name}: only regular files and kind directories are allowed`)
    continue
  }
  if (!CLASSES.includes(entry.name)) {
    errors.push(`archived/${entry.name}: unknown class folder`)
    continue
  }
  for (const file of readdirSync(join(archiveRoot, entry.name), { withFileTypes: true })) {
    if (!file.isFile() || !file.name.endsWith('.md') || file.name.endsWith('.zh.md')) continue
    const rel = `.agents/notes/archived/${entry.name}/${file.name}`
    const abs = join(archiveRoot, entry.name, file.name)
    const zh = abs.replace(/\.md$/, '.zh.md')
    const meta = abs.replace(/\.md$/, '.i18n.yaml')
    if (!existsSync(zh) || !existsSync(meta)) {
      errors.push(`${rel}: archived triplet must be complete (both language files plus the .i18n.yaml record)`)
      continue
    }
    const content = readFileSync(abs)
    const zhContent = readFileSync(zh)
    const sidecar = readSidecarHashes(meta)
    if (sidecar === undefined) {
      errors.push(`${meta}: malformed consistency record`)
    } else if (sidecar.size !== 2
      || sidecar.get(file.name) !== gitBlobHash(content)
      || sidecar.get(file.name.replace(/\.md$/, '.zh.md')) !== gitBlobHash(zhContent)) {
      errors.push(`${meta}: consistency record must contain the current Git blob hashes of both archived sides`)
    }
    const body = content.toString('utf8')
    if (!/^Status: implemented$/m.test(body)) errors.push(`${rel}: archived note must retain \`Status: implemented\``)
    if (!/^Archived: \d{4}-\d{2}-\d{2}$/m.test(body)) errors.push(`${rel}: archived note must carry an \`Archived: YYYY-MM-DD\` line`)
    artifacts.set(rel, content)
    const zhRel = rel.replace(/\.md$/, '.zh.md')
    artifacts.set(zhRel, zhContent)
    if (manifest.files[rel] === undefined) {
      nextFiles[rel] = archiveContentHash(content)
      nextFiles[zhRel] = archiveContentHash(zhContent)
      added.push(rel, zhRel)
    }
  }
}

// Preserve every sealed path/hash and reject changed content.
for (const [path, expected] of Object.entries(manifest.files)) {
  const content = artifacts.get(path)
  if (content === undefined) {
    errors.push(`${path}: sealed artifact missing from archive`)
  } else if (archiveContentHash(content) !== expected) {
    errors.push(`${path}: sealed content hash changed`)
  }
}

if (writeMode) {
  if (errors.length > 0) {
    console.error('verify-archived-agent-notes: cannot seal, archive is invalid:')
    for (const e of errors) console.error(`  ${e}`)
    process.exit(1)
  }
  writeFileSync(manifestPath, renderManifest(nextFiles))
  console.log(`verify-archived-agent-notes: sealed ${added.length} artifact(s); ${Object.keys(nextFiles.files).length} total in manifest.`)
  process.exit(0)
}

if (errors.length === 0) {
  console.log(`verify-archived-agent-notes: ${artifacts.size / 2} archived triplet(s) checked, all sealed.`)
  process.exit(0)
}

console.error('verify-archived-agent-notes: violations found:')
for (const e of errors) console.error(`  ${e}`)
process.exit(1)
