// Shared Markdown parsing and the structural signature used by the bilingual
// pairing gate. Faithful port of deepseek-harness scripts/markdown.ts and the
// signature logic in scripts/translation-pairing.ts — the signature is built
// from the official mdast/GFM AST, never hand-rolled regex over Markdown.

import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { gfm } from 'micromark-extension-gfm'
import { basename } from 'node:path'

/** Parse GitHub-flavored Markdown with the repository's standard extensions. */
export function parseMarkdown(source) {
  return fromMarkdown(source, { extensions: [gfm()], mdastExtensions: [gfmFromMarkdown()] })
}

/** Visit a Markdown tree depth-first; returning false prunes a node's children. */
export function visitMarkdown(node, visitor) {
  if (visitor(node) === false) return
  if ('children' in node) {
    for (const child of node.children) visitMarkdown(child, visitor)
  }
}

/** Text a reader sees from one Markdown node; raw HTML contributes none. */
function renderedText(node) {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value
  if (node.type === 'image' || node.type === 'imageReference') return node.alt ?? ''
  if (node.type === 'break') return ' '
  if ('children' in node) return node.children.map((child) => renderedText(child)).join('')
  return ''
}

/** Return every parsed Markdown heading with its rendered text and source line. */
export function markdownHeadingLines(source) {
  const rawLines = source.split('\n')
  const headings = []
  visitMarkdown(parseMarkdown(source), (node) => {
    if (node.type !== 'heading' || node.position === undefined) return
    headings.push({
      depth: node.depth,
      index: node.position.start.line,
      raw: rawLines[node.position.start.line - 1] ?? '',
      text: renderedText(node),
    })
  })
  return headings
}

/** Whether the tree contains a link to any accepted target. */
export function linksTo(tree, targets) {
  const accepted = new Set(typeof targets === 'string' ? [targets] : targets)
  let found = false
  const visit = (node) => {
    if (node.type === 'link' && accepted.has(node.url)) found = true
    if ('children' in node) for (const child of node.children) visit(child)
  }
  visit(tree)
  return found
}

/** Return the accepted relative link target to one counterpart. */
export function languageSwitcherTargets(counterpart) {
  return [basename(counterpart)]
}

/**
 * Collect the ordered structural signature, skipping accepted switcher targets.
 * Each field is an ordered list; the two sides of a pair must be identical.
 */
export function translationStructureSignature(tree, switcherTargets) {
  const acceptedSwitchers = new Set(
    typeof switcherTargets === 'string' ? [switcherTargets] : switcherTargets,
  )
  const sig = { headings: [], code: [], tables: [], lists: [], links: [] }
  const visit = (node) => {
    switch (node.type) {
      case 'heading':
        sig.headings.push(node.depth)
        break
      case 'code':
        sig.code.push(`\`\`\`${node.lang ?? ''}${node.meta ? ` ${node.meta}` : ''}\n${node.value}`)
        break
      case 'table':
        sig.tables.push(`${node.children.length}x${node.children[0]?.children.length ?? 0}`)
        break
      case 'list':
        sig.lists.push(node.ordered
          ? `ordered:start=${node.start ?? 1}:items=${node.children.length}`
          : `bullet:items=${node.children.length}`)
        break
      case 'link':
        if (!acceptedSwitchers.has(node.url)) sig.links.push(node.url)
        break
      default:
        break
    }
    if ('children' in node) for (const child of node.children) visit(child)
  }
  visit(tree)
  return sig
}

/** Render a signature element for an error message, truncated for readability. */
function show(value) {
  if (value === undefined) return 'nothing'
  const text = JSON.stringify(value)
  return text.length > 72 ? `${text.slice(0, 72)}…` : text
}

/** Return the first divergence for each structural field; empty means equal. */
export function translationStructureDiff(source, zh) {
  const out = []
  const fields = [
    ['heading (depth)', source.headings, zh.headings],
    ['code block', source.code, zh.code],
    ['table (row x column count)', source.tables, zh.tables],
    ['list (kind, start, item count)', source.lists, zh.lists],
    ['link target', source.links, zh.links],
  ]
  for (const [field, sourceValues, zhValues] of fields) {
    const length = Math.max(sourceValues.length, zhValues.length)
    for (let index = 0; index < length; index++) {
      if (sourceValues[index] !== zhValues[index]) {
        out.push(`${field} #${index + 1} diverges between the pair: ${show(sourceValues[index])} vs ${show(zhValues[index])}`)
        break
      }
    }
  }
  return out
}

/** GitHub's heading-slug algorithm, computed from RENDERED heading text. */
export function githubSlug(heading) {
  return heading.toLowerCase().replace(/[^\p{L}\p{N}_ -]/gu, '').replaceAll(' ', '-')
}

/**
 * Every anchor one Markdown document exposes: each heading's GitHub slug plus
 * every explicit `<a id="…">` in real HTML flow (commented-out or fenced HTML
 * registers nothing). Collisions get GitHub's occupied-set `-1`, `-2`, … suffix.
 */
export function documentAnchors(source) {
  const anchors = new Set()
  const occurrences = new Map()
  for (const heading of markdownHeadingLines(source)) {
    const base = githubSlug(heading.text)
    let result = base
    let bump = occurrences.get(base) ?? 0
    while (anchors.has(result)) {
      bump += 1
      result = `${base}-${bump}`
    }
    occurrences.set(base, bump)
    anchors.add(result)
  }
  visitMarkdown(parseMarkdown(source), (node) => {
    if (node.type !== 'html') return
    const html = node.value.replace(/<!--[\s\S]*?-->/g, '')
    for (const match of html.matchAll(/<a id="([^"]+)"/g)) anchors.add(match[1] ?? '')
  })
  return anchors
}
