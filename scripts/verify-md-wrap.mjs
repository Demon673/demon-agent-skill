#!/usr/bin/env node
// Reject Markdown prose paragraphs spanning multiple physical lines. The GFM
// AST distinguishes paragraphs from multiline structural nodes. Faithful port
// of deepseek-harness scripts/verify-md-wrap.ts.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMarkdown, visitMarkdown } from './lib/markdown.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

function walk(dir, out) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'archived' && dir.endsWith('.agents/notes')) continue
      walk(abs, out)
    } else if (entry.name.endsWith('.md')) {
      out.push(abs)
    }
  }
  return out
}

const files = [
  join(root, 'README.md'),
  join(root, 'AGENTS.md'),
  ...walk(join(root, '.agents/notes'), []),
  ...walk(join(root, 'docs'), []),
].filter((f, i, a) => a.indexOf(f) === i)

function maskVitePressStructure(source) {
  const lines = source.split('\n')
  if (lines[0] === '---') {
    const closing = lines.indexOf('---', 1)
    if (closing !== -1) for (let index = 0; index <= closing; index++) lines[index] = ''
  }
  return lines.map((line) => (line.trimStart().startsWith(':::') ? '' : line)).join('\n')
}

function findViolations(absPath) {
  const file = relative(root, absPath)
  const source = readFileSync(absPath, 'utf8')
  const tree = parseMarkdown(maskVitePressStructure(source))
  const out = []
  visitMarkdown(tree, (node) => {
    if (node.type === 'paragraph' && node.position) {
      const { start, end } = node.position
      if (end.line > start.line) {
        const firstLine = source.split('\n')[start.line - 1] ?? ''
        out.push({ file, line: start.line, text: firstLine.trim() })
      }
      return false
    }
  })
  return out
}

const all = files.flatMap((file) => findViolations(file))

if (all.length === 0) {
  console.log(`verify-md-wrap: ${files.length} file(s) checked, no hard-wrapped prose paragraphs.`)
  process.exit(0)
}

console.error('verify-md-wrap: hard-wrapped prose paragraphs found (write one physical line per paragraph):')
for (const v of all) {
  console.error(`  ${v.file}:${v.line}  ${v.text.slice(0, 80)}${v.text.length > 80 ? '…' : ''}`)
}
process.exit(1)
