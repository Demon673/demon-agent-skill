#!/usr/bin/env node
// Enforce Agent Note headers, lifecycle-specific sections, alternatives, and
// retired marker rules. Faithful port of deepseek-harness
// scripts/verify-agent-note-format.ts. Classification and filenames belong to
// the closed-class set enforced here; translation structure belongs to the
// pairing gate.

import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const notesRoot = join(root, '.agents/notes')

const LIFECYCLES = ['proposed', 'implemented', 'rejected']
const CLASSES = ['feature', 'bug-fix', 'simplification', 'architecture', 'process', 'testing']

const FORMAT_ADOPTED = '2026-07-05'
const GRANDFATHER = '<!-- agent-note-format: alternatives-not-recorded (pre-format Agent Note) -->'
const LEGACY_MARKERS = ['XXX: legacy ADR/RFC body format', 'XXX: legacy ADR/Agent Note body format']

const STATUS = {
  proposed: /^Status: proposed$/,
  implemented: /^Status: implemented$/,
  rejected: /^Status: rejected — .+$/,
}

const REQUIRED = {
  proposed: ['## Proposal', '## Acceptance criteria', '## Risks'],
  implemented: ['## Decision', '## Consequences'],
  rejected: ['## Proposal'],
}

const BANNED_IMPLEMENTED = /^## (?:Proposal\b|Plan\b|Migration plan\b|Acceptance criteria\b)/i

/** Discover active notes as { rel, lifecycle, klass, date }. */
function walkAgentNotes() {
  const notes = []
  const errors = []
  for (const lifecycle of LIFECYCLES) {
    const lcDir = join(notesRoot, lifecycle)
    if (!exists(lcDir)) continue
    for (const klass of readdirSync(lcDir)) {
      const klassDir = join(lcDir, klass)
      if (!exists(klassDir) || !readdirSync(lcDir, { withFileTypes: true }).some((e) => e.name === klass && e.isDirectory())) continue
      if (!CLASSES.includes(klass)) {
        errors.push(`tree: ${relative(root, klassDir)} — unknown class folder`)
        continue
      }
      for (const entry of readdirSync(klassDir, { withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name.endsWith('.zh.md')) continue
        const date = entry.name.slice(0, 10)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          errors.push(`tree: ${relative(root, join(klassDir, entry.name))} — filename must start with yyyy-mm-dd`)
          continue
        }
        notes.push({ rel: relative(root, join(klassDir, entry.name)).split('\\').join('/'), lifecycle, klass, date })
      }
    }
  }
  return { notes, errors }
}

function exists(p) {
  try { readdirSync(p); return true } catch { return false }
}

const { notes, errors } = walkAgentNotes()

for (const note of notes) {
  const fail = (msg) => errors.push(`format: ${note.rel} — ${msg}`)
  const lines = readFileSync(join(root, note.rel), 'utf8').split('\n')

  // Format tokens inside fenced examples are not document structure.
  let inFence = false
  const prose = lines.filter((l) => {
    if (l.startsWith('```')) { inFence = !inFence; return false }
    return !inFence
  })

  if (!/^# Agent Note: \S/.test(lines[0] ?? '')) fail('line 1 must be `# Agent Note: <title>`')
  if (lines[1] !== '') fail('line 2 must be blank')
  const status = STATUS[note.lifecycle]
  if (status !== undefined && !status.test(lines[2] ?? '')) {
    fail(`line 3 must match the ${note.lifecycle} status grammar (${String(status)})`)
  }
  if (lines[3] !== '') fail('line 4 must be blank')
  const statusLines = prose.filter((l) => l.startsWith('Status:') && l !== lines[2])
  if (statusLines.length > 0 || prose.filter((l) => l === lines[2]).length > 1) {
    fail('the line-3 `Status:` line must be the only one in the file')
  }

  const h2s = prose.filter((l) => l.startsWith('## ')).map((l) => l.trimEnd())
  if (h2s[0] !== '## Problem') fail(`the first section must be \`## Problem\` (got ${JSON.stringify(h2s[0] ?? '<none>')})`)
  for (const required of REQUIRED[note.lifecycle] ?? []) {
    if (!h2s.includes(required)) fail(`missing the required \`${required}\` section`)
  }
  if (note.lifecycle === 'implemented') {
    for (const h2 of h2s.filter((h) => BANNED_IMPLEMENTED.test(h))) {
      fail(`\`${h2}\` is a proposal-era heading; an implemented Agent Note states what is (fold it into Decision/Consequences/Testing)`)
    }
  }

  const hasSection = h2s.includes('## Alternatives considered')
  const hasGrandfather = prose.includes(GRANDFATHER)
  if (hasSection && hasGrandfather) fail('carries both `## Alternatives considered` and the grandfather comment — drop the comment')
  if (!hasSection && !hasGrandfather) fail('missing `## Alternatives considered` (a pre-format Agent Note whose alternatives are not reconstructible carries the grandfather comment instead)')
  if (hasGrandfather && note.date >= FORMAT_ADOPTED) fail(`the grandfather comment is only valid for Agent Notes dated before ${FORMAT_ADOPTED}`)

  if (prose.some((line) => LEGACY_MARKERS.some((marker) => line.includes(marker)))) fail('carries the retired legacy-format debt marker')
}

if (errors.length === 0) {
  console.log(`verify-agent-note-format: ${notes.length} Agent Note(s) checked, all conform to .agents/notes/README.md § The file format.`)
  process.exit(0)
}

console.error('verify-agent-note-format: violations found:')
for (const e of errors) console.error(`  ${e}`)
process.exit(1)
