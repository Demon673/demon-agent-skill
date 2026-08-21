#!/usr/bin/env node
// Print the minimal-update briefing for out-of-sync translation pairs:
// `node scripts/gen-translation-brief.mjs [--apply] [pair paths...]`. With no
// arguments it discovers every out-of-sync pair; with arguments (any file of a
// pair) it briefs exactly those pairs and fails loud on in-sync, incomplete,
// or out-of-scope requests. Each briefing maps the change at the narrowest
// safe granularity — code-fence-only splice, changed Markdown units, heading
// sections, whole document — and `--apply` writes the computed counterpart
// for pairs whose change is code-fence-only.
// Faithful port of deepseek-harness scripts/gen-translation-brief.ts; the
// briefing rules live in scripts/lib/translation-brief.mjs.

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runGit } from './lib/git.mjs'
import { isExcluded, isScopeFile, pairAnchorOfArgument, parseTranslationPairingManifest, walk } from './lib/scope.mjs'
import { parseMarkdown, translationStructureDiff, translationStructureSignature } from './lib/markdown.mjs'
import { parseTranslationPairingRecord, translationPairPaths } from './lib/record.mjs'
import {
  changedSpanIndices,
  computeMechanicalUpdate,
  firstOccurrenceContext,
  markdownUnits,
  relevantTerminologyRows,
  renderTranslationBrief,
  sectionSpans,
  spansAligned,
} from './lib/translation-brief.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const manifest = parseTranslationPairingManifest(readFileSync(join(root, 'scripts/translation-pairing.manifest.json'), 'utf8'))
const terminology = readFileSync(join(root, 'docs/i18n/terminology.md'), 'utf8')

// --- scope and discovery ---------------------------------------------------

/** Discover every in-scope pair via its consistency record, as English anchors. */
function discoverAnchors() {
  const discovered = new Set()
  const all = [
    ...walk(join(root, 'docs'), 'docs', []),
    ...walk(join(root, '.agents/notes'), '.agents/notes', []),
    'README.i18n.yaml',
    'CONTRIBUTING.i18n.yaml',
    'CONTEXT.i18n.yaml',
  ]
  for (const file of all) {
    if (!file.endsWith('.i18n.yaml')) continue
    if (!existsSync(join(root, file))) continue
    const anchor = file.replace(/\.i18n\.yaml$/, '.md')
    if (isScopeFile(anchor)) discovered.add(anchor)
  }
  return [...discovered].sort()
}

// --- last-confirmed state --------------------------------------------------

function blobText(hash) {
  return runGit(root, ['cat-file', '-p', hash], 'git cat-file -p').toString('utf8')
}

/** Unified diff between two texts, headers stripped, via `git diff --no-index`. */
function diffTexts(before, after) {
  const dir = mkdtempSync(join(tmpdir(), 'translation-brief-'))
  try {
    writeFileSync(join(dir, 'last-confirmed.md'), before)
    writeFileSync(join(dir, 'current.md'), after)
    const result = spawnSync('git', ['-C', root, 'diff', '--no-index', '--unified=2', join(dir, 'last-confirmed.md'), join(dir, 'current.md')], { encoding: 'utf8', maxBuffer: 1 << 26 })
    if (result.error) throw result.error
    if (![0, 1].includes(result.status ?? -1)) {
      throw new Error(`git diff --no-index failed: ${result.stderr}`)
    }
    return result.stdout.split('\n')
      .filter((line) => !line.startsWith('diff --git') && !line.startsWith('index ') && !line.startsWith('--- ') && !line.startsWith('+++ '))
      .join('\n')
      .trim()
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** Load one pair's recorded and current state, or explain why it cannot be briefed. */
function loadPair(anchor) {
  const paths = translationPairPaths(anchor)
  const zh = paths.zh
  const meta = paths.meta
  if (!isScopeFile(anchor) || isExcluded(manifest, anchor)) {
    return `${anchor}: not an in-scope documentation pair (docs/i18n/README.md)`
  }
  const missing = [anchor, zh, meta].filter((file) => !existsSync(join(root, file)))
  if (missing.length > 0) {
    return `${anchor}: incomplete pair (missing ${missing.join(', ')}) — a new counterpart is whole-document translation work, not a minimal update`
  }
  const record = parseTranslationPairingRecord(readFileSync(join(root, meta), 'utf8'), paths)
  if (record === undefined) {
    return `${meta}: malformed consistency record`
  }
  const enCurrent = readFileSync(join(root, anchor), 'utf8')
  const zhCurrent = readFileSync(join(root, zh), 'utf8')
  const enLast = blobText(record.sourceHash)
  const zhLast = blobText(record.zhHash)
  return {
    anchor,
    zh,
    meta,
    enDrifted: enCurrent !== enLast,
    zhDrifted: zhCurrent !== zhLast,
    enLast,
    zhLast,
  }
}

// --- granularity ladder ----------------------------------------------------

/** Assemble bundles for the given changed + first-occurrence span indices. */
function bundlesFor(indices, extraIndices, confirmed, current, counterpart) {
  const extras = new Set(extraIndices)
  return [...new Set([...indices, ...extraIndices])].sort((left, right) => left - right).map((index) => {
    const confirmedSpan = confirmed[index]
    const currentSpan = current[index]
    const counterpartSpan = counterpart[index]
    if (confirmedSpan === undefined || currentSpan === undefined || counterpartSpan === undefined) {
      throw new Error(`gen-translation-brief: span ${index} is unmapped despite alignment`)
    }
    return {
      index,
      label: currentSpan.label,
      reason: extras.has(index) && confirmedSpan.text === currentSpan.text ? 'first-occurrence' : undefined,
      confirmedSourceText: confirmedSpan.text,
      currentSourceText: currentSpan.text,
      counterpartText: counterpartSpan.text,
      counterpartStartLine: counterpartSpan.startLine,
    }
  })
}

/** Choose the narrowest safely mapped granularity for one drifted side. */
function planScope(sourceLast, sourceCurrent, counterpartCurrent, direction, bothDrifted) {
  const wholeChangedText = `${sourceLast}\n${sourceCurrent}`
  if (bothDrifted) {
    return {
      scope: { kind: 'document', reason: 'BOTH sides changed since the pair was last confirmed consistent, so no side is a trustworthy mapping anchor; decide which side owns each divergence.' },
      changedText: wholeChangedText,
    }
  }
  const mechanical = computeMechanicalUpdate(sourceLast, sourceCurrent, counterpartCurrent)
  if (mechanical !== undefined) {
    return { scope: { kind: 'mechanical' }, changedText: wholeChangedText, mechanicalResult: mechanical }
  }
  for (const [kind, spansOf] of [['units', markdownUnits], ['sections', sectionSpans]]) {
    const confirmed = spansOf(sourceLast)
    const current = spansOf(sourceCurrent)
    const counterpart = spansOf(counterpartCurrent)
    if (!spansAligned(confirmed, current) || !spansAligned(confirmed, counterpart)) continue
    const changed = changedSpanIndices(confirmed, current)
    if (changed.length === 0) continue
    const changedText = changed.map((index) => `${confirmed[index]?.text ?? ''}\n${current[index]?.text ?? ''}`).join('\n')
    const rows = relevantTerminologyRows(terminology, direction, changedText)
    const occurrence = direction === 'en-to-zh'
      ? firstOccurrenceContext(sourceLast, sourceCurrent, confirmed, current, rows, new Set(changed))
      : { notes: [], extraSpanIndices: [] }
    return {
      scope: {
        kind,
        bundles: bundlesFor(changed, occurrence.extraSpanIndices, confirmed, current, counterpart),
        firstOccurrenceNotes: occurrence.notes,
      },
      changedText,
    }
  }
  return {
    scope: { kind: 'document', reason: 'Neither fine-grained units nor heading sections align one to one across the last-confirmed source, current source, and current counterpart.' },
    changedText: wholeChangedText,
  }
}

/** Validate a computed mechanical counterpart and write it. */
function applyMechanical(counterpartPath, sourceCurrent, result) {
  const counterpartBase = basename(counterpartPath)
  const sourceBase = counterpartBase.endsWith('.zh.md')
    ? counterpartBase.replace(/\.zh\.md$/, '.md')
    : counterpartBase.replace(/\.md$/, '.zh.md')
  const errors = translationStructureDiff(
    translationStructureSignature(parseMarkdown(sourceCurrent), counterpartBase),
    translationStructureSignature(parseMarkdown(result), sourceBase),
  )
  if (errors.length > 0) {
    throw new Error(`gen-translation-brief: computed mechanical update for ${counterpartPath} violates the pair structure: ${errors.join('; ')}`)
  }
  writeFileSync(join(root, counterpartPath), result)
  console.error(`gen-translation-brief: applied code-fence splice to ${counterpartPath}; review the diff, then record the pair.`)
}

/** Render (and under `--apply`, apply) the briefing for one drifted side. */
function briefDirection(pair, direction, apply) {
  const sourceIsEnglish = direction === 'en-to-zh'
  const sourcePath = sourceIsEnglish ? pair.anchor : pair.zh
  const counterpartPath = sourceIsEnglish ? pair.zh : pair.anchor
  const sourceLast = sourceIsEnglish ? pair.enLast : pair.zhLast
  const sourceCurrent = readFileSync(join(root, sourcePath), 'utf8')
  const counterpartCurrent = readFileSync(join(root, counterpartPath), 'utf8')
  const diff = diffTexts(sourceLast, sourceCurrent)
  const planned = planScope(sourceLast, sourceCurrent, counterpartCurrent, direction, pair.enDrifted && pair.zhDrifted)
  if (apply && planned.mechanicalResult !== undefined) {
    applyMechanical(counterpartPath, sourceCurrent, planned.mechanicalResult)
  }
  return renderTranslationBrief({
    sourcePath,
    counterpartPath,
    direction,
    diff,
    scope: planned.scope,
    terminology: relevantTerminologyRows(terminology, direction, planned.changedText),
  })
}

// --- CLI -------------------------------------------------------------------

const argv = process.argv.slice(2)
const flags = argv.filter((argument) => argument.startsWith('--'))
const unknownFlags = flags.filter((flag) => flag !== '--apply')
if (unknownFlags.length > 0) {
  console.error(`gen-translation-brief: unknown flag(s): ${unknownFlags.join(', ')} (only --apply is supported)`)
  process.exit(2)
}
const applyMode = flags.includes('--apply')
const requested = argv.filter((argument) => !argument.startsWith('--')).map(pairAnchorOfArgument)

let anchors
if (requested.length > 0) {
  anchors = [...new Set(requested)].sort()
} else {
  anchors = discoverAnchors()
}

const briefs = []
const problems = []
const skipped = []
for (const anchor of anchors) {
  const pair = loadPair(anchor)
  if (typeof pair === 'string') {
    if (requested.length > 0) problems.push(pair)
    continue
  }
  if (!pair.enDrifted && !pair.zhDrifted) {
    if (requested.length > 0) skipped.push(`${anchor}: pair is consistent with its record — nothing to brief`)
    continue
  }
  if (pair.enDrifted) briefs.push(briefDirection(pair, 'en-to-zh', applyMode))
  if (pair.zhDrifted) briefs.push(briefDirection(pair, 'zh-to-en', applyMode))
}

if (problems.length > 0 || skipped.length > 0) {
  for (const message of [...problems, ...skipped]) console.error(`gen-translation-brief: ${message}`)
  process.exit(2)
}
if (briefs.length === 0) {
  console.log('gen-translation-brief: every recorded pair matches its consistency record; nothing to brief.')
  process.exit(0)
}
console.log(briefs.join('\n\n---\n\n'))
