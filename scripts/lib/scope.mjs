// Shared bilingual-corpus scope and discovery helpers. One home for the
// in-scope rule so every gate and tool that needs the corpus reads the same
// definition instead of restating it.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/** Whether a repository-relative path belongs to the bilingual source corpus. */
export function isScopeFile(file) {
  if (file.startsWith('.agents/notes/archived/')) return false
  return file.startsWith('docs/') || file.startsWith('.agents/notes/')
    || /^CONTRIBUTING(.zh)?.md$/.test(file)
    || /^README(.zh)?.md$/i.test(file)
    || /^CONTEXT(.zh)?.md$/i.test(file)
}

/** Recursively list regular files under a directory as posix relative paths. */
export function walk(dir, base, out) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name)
    const rel = `${base}${base ? '/' : ''}${entry.name}`
    if (entry.isDirectory()) walk(abs, rel, out)
    else out.push(rel)
  }
  return out
}

/** Normalize one CLI pair argument to its English anchor path. */
export function pairAnchorOfArgument(argument) {
  const normalized = argument.split('\\').join('/').replace(/^\.\//, '')
  if (normalized.endsWith('.zh.md')) return `${normalized.slice(0, -'.zh.md'.length)}.md`
  if (normalized.endsWith('.i18n.yaml')) return `${normalized.slice(0, -'.i18n.yaml'.length)}.md`
  if (normalized.endsWith('.md')) return normalized
  return `${normalized}.md`
}

/** Parse and validate the checked-in bilingual manifest. */
export function parseTranslationPairingManifest(content) {
  const value = JSON.parse(content)
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('translation-pairing.manifest.json: expected an object')
  }
  const unsupported = Object.keys(value).filter((field) => field !== 'excluded')
  if (unsupported.length > 0) {
    throw new Error(`translation-pairing.manifest.json: unsupported field(s): ${unsupported.join(', ')}; every in-scope document is required`)
  }
  const excluded = value.excluded
  if (!Array.isArray(excluded) || !excluded.every((entry) => typeof entry === 'string')) {
    throw new Error('translation-pairing.manifest.json: excluded must be an array of strings')
  }
  return { excluded }
}

/** Whether a repository-relative path sits in the manifest's excluded list. */
export function isExcluded(manifest, file) {
  return manifest.excluded.some((entry) => (entry.endsWith('/') ? file.startsWith(entry) : file === entry))
}
