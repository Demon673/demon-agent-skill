#!/usr/bin/env node
// Run every documentation gate once (`doc-sync` equivalent). Faithful in shape
// to deepseek-harness scripts/run-gates.ts, but running this repository's seven
// gate scripts and aggregating their results.

import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const GATES = [
  'verify-translation-pairing.mjs',
  'verify-agent-note-format.mjs',
  'verify-md-wrap.mjs',
  'verify-md-links.mjs',
  'verify-doc-refs.mjs',
  'verify-doc-budgets.mjs',
  'verify-archived-agent-notes.mjs',
]

const failures = []
for (const gate of GATES) {
  const result = spawnSync(process.execPath, [resolve(root, 'scripts', gate)], { stdio: 'inherit' })
  if (result.status !== 0) failures.push(gate)
}

if (failures.length > 0) {
  console.error(`\ndoc-gates: ${failures.length} gate(s) failed: ${failures.join(', ')}`)
  process.exit(1)
}

console.log(`\ndoc-gates: ${GATES.length} gate(s) passed.`)
