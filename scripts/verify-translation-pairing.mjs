#!/usr/bin/env node
// Enforce complete English/Chinese pairs, matching structure, and recorded git
// blob hashes for every in-scope document. Faithful port of deepseek-harness
// scripts/verify-translation-pairing.ts, minus the dsh-specific parts
// (--cached index mode and generated-region partitioning).
//
// Modes: --list (report state), --write <pair...> | --write --all (record),
// --check (full-corpus check, the default with no arguments).

import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { gitBlobHash, storeGitBlob } from './lib/git.mjs'
import { parseTranslationPairingRecord, renderTranslationPairingRecord, translationPairPaths } from './lib/record.mjs'
import {
  languageSwitcherTargets,
  linksTo,
  parseMarkdown,
  translationStructureDiff,
  translationStructureSignature,
} from './lib/markdown.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

// --- CLI argument parsing (port of parseTranslationPairingCliArgs) ----------

function pairAnchorOfArgument(argument) {
  const normalized = argument.split('\\').join('/').replace(/^\.\//, '')
  if (normalized.endsWith('.zh.md')) return `${normalized.slice(0, -'.zh.md'.length)}.md`
  if (normalized.endsWith('.i18n.yaml')) return `${normalized.slice(0, -'.i18n.yaml'.length)}.md`
  if (normalized.endsWith('.md')) return normalized
  return `${normalized}.md`
}

function parseCliArgs(argv) {
  const flags = argv.filter((argument) => argument.startsWith('--'))
  const anchors = [...new Set(argv.filter((argument) => !argument.startsWith('--')).map(pairAnchorOfArgument))].sort()
  const unknown = flags.filter((flag) => !['--list', '--write', '--all', '--check'].includes(flag))
  if (unknown.length > 0) throw new Error(`unknown flag(s): ${unknown.join(', ')}`)
  const listMode = flags.includes('--list')
  const writeMode = flags.includes('--write')
  const allMode = flags.includes('--all')
  const checkFlag = flags.includes('--check')
  if (listMode && (writeMode || allMode || checkFlag || anchors.length > 0)) {
    throw new Error('--list reports the whole corpus and takes no other flags or paths')
  }
  if (allMode && !writeMode) throw new Error('--all only applies to --write')
  if (writeMode && checkFlag) throw new Error('--check is a read-only check and cannot be combined with --write')
  if (writeMode) {
    if (anchors.length > 0 && allMode) throw new Error('--write takes either pair paths or --all, not both')
    if (anchors.length === 0 && !allMode) {
      throw new Error('--write requires the pair(s) you confirmed (any file of a pair), or --all to re-record every complete pair; recording pairs you did not review blesses unconfirmed content')
    }
    return { mode: 'write', scope: allMode ? 'corpus' : 'pairs', anchors }
  }
  if (listMode) return { mode: 'list', scope: 'corpus', anchors: [] }
  return { mode: 'check', scope: anchors.length > 0 ? 'pairs' : 'corpus', anchors }
}

// --- scope and discovery ---------------------------------------------------

/** Whether a repository-relative path belongs to the bilingual source corpus. */
function isScopeFile(file) {
  if (file.startsWith('.agents/notes/archived/')) return false
  return file.startsWith('docs/') || file.startsWith('.agents/notes/')
    || /^CONTRIBUTING(\.zh)?\.md$/.test(file)
    || /^README(\.zh)?\.md$/i.test(file)
    || /^CONTEXT(\.zh)?\.md$/i.test(file)
}

/** Recursively list regular files under a directory as posix relative paths. */
function walk(dir, base, out) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    const rel = `${base}${base ? '/' : ''}${entry.name}`
    if (entry.isDirectory()) walk(abs, rel, out)
    else out.push(rel)
  }
  return out
}

const manifest = JSON.parse(readFileSync(join(root, 'scripts/translation-pairing.manifest.json'), 'utf8'))

function isExcluded(file) {
  return manifest.excluded.some((entry) => (entry.endsWith('/') ? file.startsWith(entry) : file === entry))
}

const request = parseCliArgs(process.argv.slice(2))
const listMode = request.mode === 'list'
const writeMode = request.mode === 'write'

const files = new Set()
if (request.scope === 'pairs') {
  for (const anchor of request.anchors) {
    const { source, zh, meta } = translationPairPaths(anchor)
    for (const file of [source, zh, meta]) if (existsSync(join(root, file))) files.add(file)
    if (!existsSync(join(root, anchor))) files.add(anchor)
  }
} else {
  const all = [...walk(join(root, 'docs'), 'docs', []), ...walk(join(root, '.agents/notes'), '.agents/notes', [])]
  for (const f of ['CONTRIBUTING.md', 'CONTRIBUTING.zh.md', 'README.md', 'README.zh.md', 'CONTEXT.md', 'CONTEXT.zh.md']) if (existsSync(join(root, f))) all.push(f)
  for (const file of all) if (isScopeFile(file)) files.add(file)
}

const translations = [...files].filter((f) => f.endsWith('.zh.md')).sort()
const metas = [...files].filter((f) => f.endsWith('.i18n.yaml')).sort()
const sources = [...files].filter((f) => f.endsWith('.md') && !f.endsWith('.zh.md')).sort()

if (request.scope === 'pairs') {
  const rejected = request.anchors.filter((anchor) => !isScopeFile(anchor) || isExcluded(anchor))
  const absent = request.anchors.filter((anchor) => {
    const { source, zh, meta } = translationPairPaths(anchor)
    return ![source, zh, meta].some((f) => existsSync(join(root, f)))
  })
  if (rejected.length > 0 || absent.length > 0) {
    for (const anchor of rejected) console.error(`verify-translation-pairing: ${anchor} is not an in-scope pair (excluded or outside the documentation corpus; see docs/i18n/README.md)`)
    for (const anchor of absent) console.error(`verify-translation-pairing: ${anchor} names no pair on disk (none of its three files exist)`)
    process.exit(2)
  }
}

// --- --write ---------------------------------------------------------------

if (writeMode) {
  let written = 0
  for (const source of sources) {
    if (isExcluded(source)) continue
    const paths = translationPairPaths(source)
    const { zh, meta } = paths
    if (!existsSync(join(root, source)) || !existsSync(join(root, zh))) {
      if (request.scope === 'pairs') {
        console.error(`verify-translation-pairing: cannot record ${source}: missing ${existsSync(join(root, source)) ? zh : source}`)
        process.exit(2)
      }
      continue
    }
    const sourceContent = readFileSync(join(root, source))
    const zhContent = readFileSync(join(root, zh))
    const record = renderTranslationPairingRecord(paths, {
      sourceHash: storeGitBlob(root, sourceContent),
      zhHash: storeGitBlob(root, zhContent),
    })
    if (existsSync(join(root, meta)) && readFileSync(join(root, meta), 'utf8') === record) continue
    writeFileSync(join(root, meta), record)
    console.log(`verify-translation-pairing: recorded ${meta}`)
    written++
  }
  console.log(`verify-translation-pairing: ${written} record(s) written; run the check to validate the pairs.`)
  process.exit(0)
}

// --- check / --list --------------------------------------------------------

const errors = []
const state = new Map()

for (const source of sources) {
  if (isExcluded(source)) continue
  const { zh } = translationPairPaths(source)
  if (!existsSync(join(root, zh))) {
    errors.push(`${source}: in-scope documentation must merge bilingual (docs/i18n/README.md); add the counterpart and record the pair`)
    state.set(source, 'missing')
  }
}

const pairAnchors = new Set()
for (const zh of translations) pairAnchors.add(zh.replace(/\.zh\.md$/, '.md'))
for (const meta of metas) pairAnchors.add(meta.replace(/\.i18n\.yaml$/, '.md'))

for (const source of [...pairAnchors].sort()) {
  const paths = translationPairPaths(source)
  const { zh, meta } = paths
  const have = {
    source: existsSync(join(root, source)),
    zh: existsSync(join(root, zh)),
    meta: existsSync(join(root, meta)),
  }

  if (isExcluded(source)) {
    if (have.zh) errors.push(`${zh}: ${source} is excluded from pairing; this translation must not exist`)
    if (have.meta) errors.push(`${meta}: ${source} is excluded from pairing; this consistency record must not exist`)
    continue
  }
  const missing = Object.entries(have).filter(([, ok]) => !ok).map(([k]) => (k === 'source' ? source : k === 'zh' ? zh : meta))
  if (missing.length > 0) {
    errors.push(`${source}: incomplete pair — missing ${missing.join(', ')} (pairs merge whole: both languages plus the .i18n.yaml record)`)
    continue
  }

  const sourceContent = readFileSync(join(root, source))
  const zhContent = readFileSync(join(root, zh))
  const metaContent = readFileSync(join(root, meta))
  const record = parseTranslationPairingRecord(metaContent.toString('utf8'), paths)
  if (record === undefined) {
    errors.push(`${meta}: malformed consistency record (expected exactly \`${basename(source)}: <40-hex>\` and \`${basename(zh)}: <40-hex>\`)`)
    continue
  }

  let consistent = true
  for (const [file, content] of [[source, sourceContent], [zh, zhContent]]) {
    const current = gitBlobHash(content)
    const recorded = file === source ? record.sourceHash : record.zhHash
    if (recorded !== current) {
      errors.push(`${file}: out of sync — content no longer matches the pair's last confirmed-consistent state in ${meta} (bring the other side along, then re-record with --write)`)
      consistent = false
    }
  }
  if (!consistent) {
    state.set(source, 'out-of-sync')
    continue
  }

  const sourceTree = parseMarkdown(sourceContent.toString('utf8'))
  const zhTree = parseMarkdown(zhContent.toString('utf8'))
  const sourceSwitcherTargets = languageSwitcherTargets(source)
  const zhSwitcherTargets = languageSwitcherTargets(zh)
  if (!linksTo(zhTree, sourceSwitcherTargets)) {
    errors.push(`${zh}: missing language switcher — no link to ${basename(source)}`)
  }
  if (!linksTo(sourceTree, zhSwitcherTargets)) {
    errors.push(`${source}: missing language switcher — no link back to ${basename(zh)}`)
  }
  for (const divergence of translationStructureDiff(
    translationStructureSignature(sourceTree, zhSwitcherTargets),
    translationStructureSignature(zhTree, sourceSwitcherTargets),
  )) {
    errors.push(`${source} ↔ ${zh}: ${divergence}`)
  }
  if (!state.has(source)) state.set(source, 'ok')
}

for (const source of sources) {
  if (!isExcluded(source) && !state.has(source)) state.set(source, 'missing')
}

if (listMode) {
  const order = { 'out-of-sync': 0, missing: 1, ok: 2 }
  const rows = [...state.entries()].sort((a, b) => order[a[1]] - order[b[1]] || a[0].localeCompare(b[0]))
  for (const [file, status] of rows) {
    console.log(`${status.padEnd(11)} ${file}${status === 'missing' ? '  (required)' : ''}`)
  }
  const counts = { ok: 0, 'out-of-sync': 0, missing: 0 }
  for (const status of state.values()) counts[status]++
  console.log(`verify-translation-pairing: ${counts.ok} ok, ${counts['out-of-sync']} out-of-sync, ${counts.missing} missing (of ${state.size} in scope)`)
  process.exit(0)
}

if (errors.length === 0) {
  console.log(request.scope === 'pairs'
    ? `verify-translation-pairing: ${pairAnchors.size} named pair(s) consistent; the corpus-wide check still runs in doc-gates.`
    : `verify-translation-pairing: ${pairAnchors.size} pair(s) checked across all in-scope documentation, all consistent.`)
  process.exit(0)
}

console.error('verify-translation-pairing: bilingual pairing rules violated (see docs/i18n/README.md):')
for (const message of errors) console.error(`  ${message}`)
process.exit(1)
