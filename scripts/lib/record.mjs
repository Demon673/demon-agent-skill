// Canonical paths, parsing, and rendering for bilingual pairing records.
// Faithful port of deepseek-harness scripts/translation-pairing-record.ts.

import { basename } from 'node:path'

const META_LINE = /^([^:#]+\.md): ([0-9a-f]{40})$/

/**
 * Derive the counterpart and consistency-record paths from an English document.
 */
export function translationPairPaths(source) {
  if (!source.endsWith('.md') || source.endsWith('.zh.md')) {
    throw new Error(`expected an English Markdown path, received ${JSON.stringify(source)}`)
  }
  return {
    source,
    zh: source.replace(/\.md$/, '.zh.md'),
    meta: source.replace(/\.md$/, '.i18n.yaml'),
  }
}

/** Derive one pair from its consistency-record path. */
export function translationPairPathsFromMeta(meta) {
  if (!meta.endsWith('.i18n.yaml')) {
    throw new Error(`expected a bilingual consistency-record path, received ${JSON.stringify(meta)}`)
  }
  return translationPairPaths(meta.replace(/\.i18n\.yaml$/, '.md'))
}

/**
 * Parse a consistency record for its expected sibling names. Returns undefined
 * for malformed, duplicate, or unexpected keys.
 */
export function parseTranslationPairingRecord(content, paths) {
  const hashes = new Map()
  for (const line of content.split('\n')) {
    if (line === '' || line.startsWith('#')) continue
    const match = META_LINE.exec(line)
    if (!match?.[1] || !match[2] || hashes.has(match[1])) return undefined
    hashes.set(match[1], match[2])
  }
  const sourceHash = hashes.get(basename(paths.source))
  const zhHash = hashes.get(basename(paths.zh))
  if (hashes.size !== 2 || sourceHash === undefined || zhHash === undefined) return undefined
  return { sourceHash, zhHash }
}

/** Render the canonical consistency record for a pair. */
export function renderTranslationPairingRecord(paths, record) {
  return [
    '# Bilingual-pair consistency record (docs/i18n/README.md): the git blob hash of each',
    '# side as of the last confirmed-consistent state. Both languages carry equal authority;',
    '# after editing either side, bring the other along and re-record with:',
    `#   node scripts/verify-translation-pairing.mjs --write ${paths.source}`,
    `${basename(paths.source)}: ${record.sourceHash}`,
    `${basename(paths.zh)}: ${record.zhHash}`,
    '',
  ].join('\n')
}
