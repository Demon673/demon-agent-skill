#!/usr/bin/env node
// Verify root-relative documentation paths in repo-authored source. Faithful
// port of deepseek-harness scripts/verify-doc-refs.ts (and its repo-files.ts
// helper), adapted to this repository's script file types (.mjs, .js, .ps1).
// The textual scan covers `docs/*.md` and `.agents/notes/*.md`, requires the
// extension, checks matching string literals too, and skips generated or
// dependency directories. Node has no `globSync`, so discovery is a builtin
// `readdirSync` walk with symlink deduplication.

import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

/** Repo-authored script file extensions that may cite docs in comments or strings. */
const EXTENSIONS = ['.mjs', '.js', '.ps1']

/** Directory names skipped during the walk: dependencies and generated state. */
const SKIP_DIRS = new Set(['node_modules', '.venv', '.git'])

/** Root-relative Markdown path token, excluding trailing prose. */
const DOC_REF = /(?:\bdocs|\.agents\/notes)\/[A-Za-z0-9._/-]+\.md/g

/**
 * Enumerate every matching script file under the root in stable, sorted order,
 * deduplicating symlinked files by canonical path.
 */
function uniqueRepoFiles() {
  const seen = new Set()
  const files = []
  const stack = [root]
  while (stack.length > 0) {
    const dir = stack.pop()
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      continue
    }
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue
      const abs = join(dir, entry.name)
      if (entry.isDirectory()) {
        stack.push(abs)
        continue
      }
      if (!entry.isFile()) continue
      const rel = relative(root, abs).split(sep).join('/')
      if (!EXTENSIONS.some((ext) => rel.endsWith(ext))) continue
      const real = realpathSync(abs)
      if (seen.has(real)) continue
      seen.add(real)
      files.push({ abs, real, rel })
    }
  }
  files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0))
  return files
}

/** Find every broken root-relative documentation reference in one script file. */
function findViolations(absPath) {
  const file = relative(root, absPath).split(sep).join('/')
  const out = []
  const lines = readFileSync(absPath, 'utf8').split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue
    for (const match of line.matchAll(DOC_REF)) {
      const ref = match[0]
      if (!existsSync(resolve(root, ref))) out.push({ file, line: i + 1, ref })
    }
  }
  return out
}

const files = uniqueRepoFiles()
const all = files.flatMap((file) => findViolations(file.abs))
const checked = files.length

if (all.length === 0) {
  console.log(`verify-doc-refs: ${checked} file(s) checked, all documentation references resolve.`)
  process.exit(0)
}

console.error('verify-doc-refs: broken documentation references found in source comments (target does not exist):')
for (const v of all) {
  console.error(`  ${v.file}:${v.line}  ${v.ref}`)
}
process.exit(1)
