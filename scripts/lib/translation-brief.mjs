// Pure assembly of the minimal-update briefing for one out-of-sync
// translation pair. Faithful port of deepseek-harness
// scripts/translation-brief.ts: the granularity ladder (code-fence-only
// splice, changed Markdown units, heading sections, whole document),
// terminology-row matching, first-occurrence movement notes, and the
// binding-rule digest. The unit mapping, mechanical code splice, and
// first-occurrence tracking follow the incremental-pipeline planner mechanics.
// The CLI wrapper is scripts/gen-translation-brief.mjs.

import { parseMarkdown } from './markdown.mjs'

/** One block-level span of a Markdown document, in document order. */

function linesOf(markdown) {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n')
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

function sliceLines(lines, startLine, endLine) {
  return `${lines.slice(startLine - 1, endLine).join('\n')}\n`
}

/**
 * List a document's translation units: the outermost block nodes a minimal
 * update can replace independently. Headings, paragraphs, code fences, table
 * rows, list items, block quotes, HTML blocks, thematic breaks, and link
 * definitions are units; the container path is part of the kind so kind
 * sequences only align when container membership also aligns.
 *
 * @param markdown - Document text.
 * @returns Units in document order.
 */
export function markdownUnits(markdown) {
  const positions = []
  const visit = (node, path) => {
    let kind
    switch (node.type) {
      case 'heading':
        kind = `${path}:heading:${node.depth}`
        break
      case 'paragraph':
      case 'code':
      case 'tableRow':
      case 'listItem':
      case 'blockquote':
      case 'html':
      case 'thematicBreak':
      case 'definition':
        kind = `${path}:${node.type}`
        break
      default:
        break
    }
    if (kind !== undefined && node.position !== undefined) {
      positions.push({ kind, label: node.type, startLine: node.position.start.line, endLine: node.position.end.line })
      return
    }
    if ('children' in node) for (const [index, child] of node.children.entries()) visit(child, `${path}.${index}`)
  }
  visit(parseMarkdown(markdown), 'root')
  positions.sort((left, right) => left.startLine - right.startLine)
  const lines = linesOf(markdown)
  return positions.map((position, index) => ({
    index,
    ...position,
    text: sliceLines(lines, position.startLine, position.endLine),
  }))
}

/**
 * List a document's heading-delimited sections, including a leading
 * `preamble` span when content precedes the first heading.
 *
 * @param markdown - Document text.
 * @returns Sections in document order.
 */
export function sectionSpans(markdown) {
  const headings = []
  const visit = (node) => {
    if (node.type === 'heading' && node.position !== undefined) {
      let label = ''
      const collect = (child) => {
        if ('value' in child && typeof child.value === 'string') label += child.value
        if ('children' in child) for (const grandchild of child.children) collect(grandchild)
      }
      for (const child of node.children) collect(child)
      headings.push({ depth: node.depth, line: node.position.start.line, label })
    }
    if ('children' in node) for (const child of node.children) visit(child)
  }
  visit(parseMarkdown(markdown))
  headings.sort((left, right) => left.line - right.line)
  const lines = linesOf(markdown)
  const spans = []
  const firstHeadingLine = headings[0]?.line ?? lines.length + 1
  if (firstHeadingLine > 1) {
    spans.push({ index: 0, kind: 'preamble', label: '(preamble before the first heading)', startLine: 1, endLine: firstHeadingLine - 1, text: sliceLines(lines, 1, firstHeadingLine - 1) })
  }
  for (const [order, heading] of headings.entries()) {
    const endLine = (headings[order + 1]?.line ?? lines.length + 1) - 1
    spans.push({
      index: spans.length,
      // Depth only: heading TEXT is translated across a pair, so it cannot
      // participate in cross-language alignment.
      kind: `section:${heading.depth}`,
      label: heading.label === '' ? '(untitled section)' : heading.label,
      startLine: heading.line,
      endLine,
      text: sliceLines(lines, heading.line, endLine),
    })
  }
  return spans
}

/**
 * Whether two span lists map one to one: same non-zero length and the same
 * kind at every position.
 */
export function spansAligned(left, right) {
  return left.length > 0
    && left.length === right.length
    && left.every((span, index) => span.kind === right[index]?.kind)
}

/**
 * Indices whose text differs between two aligned span lists.
 *
 * @param before - Spans of the earlier state.
 * @param after - Spans of the later state, aligned with `before`.
 * @returns Ascending changed indices.
 */
export function changedSpanIndices(before, after) {
  return before.filter((span, index) => span.text !== after[index]?.text).map((span) => span.index)
}

function codeSpansOf(markdown) {
  return markdownUnits(markdown).filter((span) => span.kind.endsWith(':code'))
    .map((span, index) => ({ ...span, index }))
}

function replaceSpanTexts(markdown, spans, replacements) {
  const lines = linesOf(markdown)
  for (const [index, replacement] of [...replacements.entries()].sort((left, right) => right[0] - left[0])) {
    const span = spans[index]
    if (span === undefined) throw new Error(`translation brief: unknown replacement span ${index}`)
    lines.splice(span.startLine - 1, span.endLine - span.startLine + 1, ...linesOf(replacement))
  }
  return `${lines.join('\n')}\n`
}

function maskCodeSpans(markdown, spans) {
  return replaceSpanTexts(markdown, spans, new Map(spans.map((span) => [span.index, `DSH_TRANSLATION_CODE_${span.index}\n`])))
}

/**
 * Compute the counterpart update for a change confined to fenced code blocks.
 * Fences are byte-identical across a pair, so when the source's prose is
 * untouched and the counterpart's fences match the last-confirmed source,
 * splicing the edited fences into the counterpart is the complete update — no
 * translation judgment is involved.
 *
 * @param confirmedSource - The changed side's last-confirmed text.
 * @param currentSource - The changed side's current text.
 * @param counterpart - The other side's current text.
 * @returns The updated counterpart, or undefined when the change is not code-only.
 */
export function computeMechanicalUpdate(confirmedSource, currentSource, counterpart) {
  const confirmed = codeSpansOf(confirmedSource)
  const current = codeSpansOf(currentSource)
  const target = codeSpansOf(counterpart)
  if (confirmed.length === 0 || confirmed.length !== current.length || confirmed.length !== target.length) return undefined
  if (maskCodeSpans(confirmedSource, confirmed) !== maskCodeSpans(currentSource, current)) return undefined
  if (confirmed.some((span, index) => span.text !== target[index]?.text)) return undefined
  const changed = current.filter((span, index) => span.text !== confirmed[index]?.text)
  if (changed.length === 0) return undefined
  return replaceSpanTexts(counterpart, target, new Map(changed.map((span) => [span.index, span.text])))
}

/** One parsed terminology-table data row. */

/** Strip Markdown emphasis and code markers from a terminology cell. */
function plainTerm(cell) {
  return cell.replaceAll('`', '').replaceAll('**', '').trim()
}

/**
 * Parse the data rows of the terminology table.
 *
 * @param terminology - Full `docs/i18n/terminology.md` contents.
 * @returns Rows in table order.
 */
export function parseTerminologyRows(terminology) {
  const rows = []
  for (const line of terminology.split('\n')) {
    if (!line.startsWith('|')) continue
    if (/^\|[\s:|-]+\|$/.test(line)) continue
    const cells = line.split('|').map((cell) => cell.trim())
    const english = plainTerm(cells[1] ?? '')
    if (english === '' || english === 'English') continue
    rows.push({ english, chinese: plainTerm(cells[2] ?? ''), first: plainTerm(cells[3] ?? ''), line })
  }
  return rows
}

/**
 * Character offsets of a term's occurrences. English word-like terms match on
 * word boundaries and accept plural inflections (`agents`, `registries`);
 * other terms match as case-insensitive substrings.
 */
export function termOffsets(text, term, englishInflections = false) {
  if (term === '') return []
  const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const wordLike = /^[A-Za-z0-9][A-Za-z0-9 ._-]*[A-Za-z0-9]$/.test(term)
  const inflected = englishInflections && wordLike
    ? /[^aeiou]y$/i.test(term)
      ? `${escape(term.slice(0, -1))}(?:y|ies)`
      : `${escape(term)}(?:s|es)?`
    : escape(term)
  const expression = new RegExp(wordLike ? `(?<![A-Za-z0-9_])${inflected}(?![A-Za-z0-9_])` : inflected, 'gi')
  return [...text.matchAll(expression)].map((match) => match.index)
}

/** Whether a row's source-language term occurs in the given text. */
function rowOccurs(row, direction, text) {
  const terms = direction === 'en-to-zh' ? [row.english] : [row.first, row.chinese].filter((term) => /[一-鿿]/.test(term))
  return terms.some((term) => termOffsets(text, term, direction === 'en-to-zh').length > 0)
}

/**
 * Select the terminology rows whose source-language term occurs in the changed
 * text (old and new states combined).
 */
export function relevantTerminologyRows(terminology, direction, changedText) {
  return parseTerminologyRows(terminology).filter((row) => rowOccurs(row, direction, changedText))
}

function lineAtOffset(text, offset) {
  return text.slice(0, offset).split('\n').length
}

function spanIndexAtOffset(text, spans, offset) {
  if (offset === undefined) return undefined
  const line = lineAtOffset(text, offset)
  return spans.find((span) => line >= span.startLine && line <= span.endLine)?.index
}

/**
 * Track document-wide first occurrences of the relevant English terms. The
 * 首次出现 rendering attaches to a term's first occurrence, so when an edit
 * moves that occurrence across spans, both the old and new spans need
 * counterpart edits even when only one of them changed.
 *
 * @returns Notes and extra span indices to include.
 */
export function firstOccurrenceContext(confirmedSource, currentSource, confirmedSpans, currentSpans, rows, changed) {
  const notes = []
  const extra = new Set()
  for (const row of rows) {
    if (row.first === '') continue
    const oldIndex = spanIndexAtOffset(confirmedSource, confirmedSpans, termOffsets(confirmedSource, row.english, true)[0])
    const newIndex = spanIndexAtOffset(currentSource, currentSpans, termOffsets(currentSource, row.english, true)[0])
    if (oldIndex === newIndex) continue
    for (const index of [oldIndex, newIndex]) {
      if (index !== undefined && !changed.has(index)) extra.add(index)
    }
    notes.push(`${row.english}: the document-wide first occurrence moved from ${oldIndex === undefined ? 'absent' : `#${oldIndex}`} to ${newIndex === undefined ? 'absent' : `#${newIndex}`}; the ${row.first} form moves with it (later occurrences drop the annotation).`)
  }
  return { notes, extraSpanIndices: [...extra].sort((left, right) => left - right) }
}

/** Smallest fence of `mark` characters that safely wraps `body`. */
function fenceFor(body, mark) {
  let longest = 2
  for (const line of body.split('\n')) {
    const run = new RegExp(`^\\s*(${mark === '`' ? '`' : '~'}{3,})`).exec(line)
    if (run?.[1] !== undefined && run[1].length > longest) longest = run[1].length
  }
  return mark.repeat(longest + 1)
}

const ZH_TARGET_DIGEST = [
  '- Edit ONLY what the change requires; preserve the reviewed phrasing of everything unchanged.',
  '- Nothing added, nothing dropped: the Chinese must state exactly what the new English states.',
  '- Write natural institutional technical Chinese, not word-by-word gloss; terse stays terse.',
  '- Code fences byte-identical to the English side, comments included; inline code spans verbatim.',
  '- Relative links keep the `.md` target; only the switcher line links `.zh.md`.',
  '- Structure mirrors the counterpart: heading depths and order, list kinds and item counts, table rows and columns.',
  '- 首次出现 annotations attach to the document-wide first occurrence only; later occurrences use the bare form, and an empty 首次出现 cell means never gloss.',
  '- Typography: one half-width space between Chinese and Latin or digits; full-width punctuation in Chinese prose; 顿号 for enumerations; second person is 你.',
  '- One physical line per paragraph; exactly one trailing newline.',
]

const EN_TARGET_DIGEST = [
  '- Edit ONLY what the change requires; preserve the reviewed phrasing of everything unchanged.',
  '- Nothing added, nothing dropped: the English must state exactly what the new Chinese states.',
  '- Write concise professional developer prose, not word-by-word gloss; terse stays terse.',
  '- Code fences byte-identical to the Chinese side, comments included; inline code spans verbatim.',
  '- Relative links keep the `.md` target; only the switcher line links `.zh.md`.',
  '- Structure mirrors the counterpart: heading depths and order, list kinds and item counts, table rows and columns.',
  '- One physical line per paragraph; exactly one trailing newline.',
]

function renderBundles(out, input, bundles, firstOccurrenceNotes) {
  const sourceLanguage = input.direction === 'en-to-zh' ? 'English' : 'Chinese'
  const counterpartLanguage = input.direction === 'en-to-zh' ? 'Chinese' : 'English'
  for (const bundle of bundles) {
    out.push('')
    out.push(`### #${bundle.index} ${bundle.label}${bundle.reason === 'first-occurrence' ? ' — unchanged; included for a first-occurrence move' : ''} — counterpart at ${input.counterpartPath}:${bundle.counterpartStartLine}`)
    const fence = fenceFor([bundle.confirmedSourceText, bundle.currentSourceText, bundle.counterpartText].join('\n'), '~')
    if (bundle.confirmedSourceText !== bundle.currentSourceText) {
      out.push('')
      out.push(`Last-confirmed ${sourceLanguage}:`)
      out.push('')
      out.push(`${fence}markdown`)
      out.push(bundle.confirmedSourceText.trimEnd())
      out.push(fence)
    }
    out.push('')
    out.push(`Current ${sourceLanguage}:`)
    out.push('')
    out.push(`${fence}markdown`)
    out.push(bundle.currentSourceText.trimEnd())
    out.push(fence)
    out.push('')
    out.push(`Current ${counterpartLanguage} (bring this along):`)
    out.push('')
    out.push(`${fence}markdown`)
    out.push(bundle.counterpartText.trimEnd())
    out.push(fence)
  }
  if (firstOccurrenceNotes.length > 0) {
    out.push('')
    out.push('## First-occurrence notes')
    out.push('')
    for (const note of firstOccurrenceNotes) out.push(`- ${note}`)
  }
}

/**
 * Render the complete briefing for one out-of-sync pair.
 *
 * @param input - Diff, mapped scope, terminology, and pair identity.
 * @returns Markdown briefing text.
 */
export function renderTranslationBrief(input) {
  const sourceLanguage = input.direction === 'en-to-zh' ? 'English' : 'Chinese'
  const counterpartLanguage = input.direction === 'en-to-zh' ? 'Chinese' : 'English'
  const out = []
  out.push(`# Translation update briefing: ${input.sourcePath}`)
  out.push('')
  out.push(`The ${sourceLanguage} side changed; bring \`${input.counterpartPath}\` along with the smallest edit that covers the change.`)
  if (input.scope.kind === 'mechanical') {
    out.push('')
    out.push('## Mechanical update — no translation judgment involved')
    out.push('')
    out.push(`Every change since the last confirmed state is inside fenced code blocks, which are byte-identical across the pair. Run \`node scripts/gen-translation-brief.mjs --apply ${input.sourcePath}\` to splice the updated fences into the counterpart (the result is structure-validated before writing), then record per the Finish steps.`)
  }
  out.push('')
  out.push(`## ${sourceLanguage} diff (last-confirmed → current)`)
  out.push('')
  const diffFence = fenceFor(input.diff, '`')
  out.push(`${diffFence}diff`)
  out.push(input.diff.trimEnd())
  out.push(diffFence)
  switch (input.scope.kind) {
    case 'mechanical':
      break
    case 'units':
      out.push('')
      out.push(`## Changed units (last-confirmed ${sourceLanguage} → current ${sourceLanguage}, with the current ${counterpartLanguage})`)
      renderBundles(out, input, input.scope.bundles, input.scope.firstOccurrenceNotes)
      break
    case 'sections':
      out.push('')
      out.push('## Changed sections (fine-grained units do not align across the pair; whole heading sections shown)')
      renderBundles(out, input, input.scope.bundles, input.scope.firstOccurrenceNotes)
      break
    case 'document':
      out.push('')
      out.push('## Whole-document update required')
      out.push('')
      out.push(`${input.scope.reason} Open \`${input.counterpartPath}\` directly, locate the affected regions yourself, and reconcile under docs/i18n/translation-rules.md.`)
      break
    default:
      break
  }
  if (input.terminology.length > 0) {
    out.push('')
    out.push('## Binding terminology rows matching this change (docs/i18n/terminology.md)')
    out.push('')
    out.push('| English | 中文 | 首次出现 | 不要译作 |')
    out.push('|---|---|---|---|')
    for (const row of input.terminology) out.push(row.line)
    out.push('')
    out.push('For any term you introduce that is not listed above, consult the full table before inventing a rendering.')
  }
  out.push('')
  out.push('## Rules digest (full rules: docs/i18n/translation-rules.md)')
  out.push('')
  out.push(...(input.direction === 'en-to-zh' ? ZH_TARGET_DIGEST : EN_TARGET_DIGEST))
  out.push('')
  out.push('## Finish')
  out.push('')
  out.push('1. Apply the smallest counterpart edit that covers the change, then verify the changed spans clause by clause against the source.')
  out.push(`2. \`node scripts/verify-translation-pairing.mjs --write ${input.sourcePath.replace(/\.zh\.md$/, '.md')}\``)
  out.push(`3. \`node scripts/verify-translation-pairing.mjs ${input.sourcePath.replace(/\.zh\.md$/, '.md')}\``)
  out.push('')
  return out.join('\n')
}
