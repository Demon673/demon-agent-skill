#!/usr/bin/env node
// Verify that relative Markdown links, images, and definitions resolve — the
// target file must exist AND a `#fragment` onto a Markdown target must name a
// real heading slug or explicit `<a id>`. Faithful port of deepseek-harness
// scripts/verify-md-links.ts.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { documentAnchors, parseMarkdown, visitMarkdown } from './lib/markdown.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

function walk(dir, out) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, out)
    else if (entry.name.endsWith('.md')) out.push(abs)
  }
  return out
}

const files = [
  join(root, 'README.md'),
  join(root, 'AGENTS.md'),
  ...walk(join(root, '.agents/notes'), []),
  ...walk(join(root, '.agents/skills'), []),
  ...walk(join(root, 'docs'), []),
  ...walk(join(root, 'skills'), []),
].filter((f, i, a) => a.indexOf(f) === i)

function isExternal(url) {
  if (url.startsWith('//') || url.startsWith('/')) return true
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)
}

function pathPart(url) {
  const raw = url.replace(/[#?].*$/, '')
  try { return decodeURIComponent(raw) } catch { return raw }
}

function fragmentPart(url) {
  const hash = url.indexOf('#')
  if (hash === -1) return null
  const raw = url.slice(hash + 1).replace(/\?.*$/, '')
  try { return decodeURIComponent(raw) } catch { return raw }
}

function anchorCache() {
  const cache = new Map()
  return (absPath) => {
    const hit = cache.get(absPath)
    if (hit) return hit
    const anchors = documentAnchors(readFileSync(absPath, 'utf8'))
    cache.set(absPath, anchors)
    return anchors
  }
}

function findViolations(absPath, anchorsOf) {
  const file = relative(root, absPath)
  const dir = dirname(absPath)
  const tree = parseMarkdown(readFileSync(absPath, 'utf8'))
  const out = []

  const check = (url, node) => {
    if (isExternal(url)) return
    const target = pathPart(url)
    const resolved = target === '' ? absPath : resolve(dir, target)
    if (!existsSync(resolved)) {
      out.push({ file, line: node.position?.start.line ?? 0, url, reason: 'target' })
      return
    }
    const fragment = fragmentPart(url)
    if (fragment === null || !resolved.endsWith('.md')) return
    if (!anchorsOf(resolved).has(fragment)) {
      out.push({ file, line: node.position?.start.line ?? 0, url, reason: 'anchor' })
    }
  }

  visitMarkdown(tree, (node) => {
    if ((node.type === 'link' || node.type === 'image' || node.type === 'definition') && 'url' in node) {
      check(node.url, node)
    }
  })
  return out
}

const anchorsOf = anchorCache()
const all = files.flatMap((file) => findViolations(file, anchorsOf))

if (all.length === 0) {
  console.log(`verify-md-links: ${files.length} file(s) checked, all relative cross-links and fragments resolve.`)
  process.exit(0)
}

console.error('verify-md-links: broken relative cross-links found:')
for (const v of all) {
  console.error(`  ${v.file}:${v.line}  ${v.url}  (${v.reason === 'target' ? 'target does not exist' : 'no such anchor in target'})`)
}
process.exit(1)
