import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync, copyFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const root = fileURLToPath(new URL('..', import.meta.url))

test('root contribution and glossary Markdown files are checked', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'verify-md-links-'))
  mkdirSync(join(fixture, 'scripts', 'lib'), { recursive: true })
  copyFileSync(
    join(root, 'scripts', 'verify-md-links.mjs'),
    join(fixture, 'scripts', 'verify-md-links.mjs'),
  )
  copyFileSync(
    join(root, 'scripts', 'lib', 'markdown.mjs'),
    join(fixture, 'scripts', 'lib', 'markdown.mjs'),
  )
  symlinkSync(
    join(root, 'node_modules'),
    join(fixture, 'node_modules'),
    process.platform === 'win32' ? 'junction' : 'dir',
  )

  for (const file of ['README.md', 'README.zh.md', 'AGENTS.md']) {
    writeFileSync(join(fixture, file), `# ${file}\n`)
  }

  const linkedFiles = [
    'CONTRIBUTING.md',
    'CONTRIBUTING.zh.md',
    'GLOSSARY.md',
    'GLOSSARY.zh.md',
  ]
  for (const file of linkedFiles) {
    writeFileSync(join(fixture, file), `# ${file}\n\n[missing](${file}.target)\n`)
  }

  const result = spawnSync(
    process.execPath,
    [join(fixture, 'scripts', 'verify-md-links.mjs')],
    { cwd: fixture, encoding: 'utf8' },
  )

  assert.equal(result.status, 1, result.error?.message || result.stdout)
  for (const file of linkedFiles) {
    assert.match(result.stderr, new RegExp(`${file.replace('.', '\\.')}:3`))
  }
})
