#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const python = [
  join(root, '.venv/skill-validation/Scripts/python.exe'),
  join(root, '.venv/skill-validation/bin/python'),
].find(existsSync) || 'python'
const nodeTests = readdirSync(join(root, 'scripts')).filter((name) => /^test-.*\.mjs$/.test(name)).sort()
const commands = [
  [process.execPath, ['--test', ...nodeTests.map((name) => join(root, 'scripts', name))]],
  [python, ['-m', 'unittest', 'discover', '-s', 'scripts', '-p', 'test_*.py', '-v']],
  [python, ['-m', 'unittest', 'discover', '-s', 'skills/agent/record-browser-gif/scripts', '-p', 'test_*.py', '-v']],
  [process.execPath, ['skills/agent/agent-doorbell/scripts/test-doorbell.js']],
  [python, ['-I', 'skills/agent/setup-demon-skills/scripts/test-statusline.py']],
]

let failed = false
for (const [command, args] of commands) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: { ...process.env, PYTHONUTF8: '1' } })
  if (result.error) console.error(result.error.message)
  if (result.status !== 0) failed = true
}
process.exitCode = failed ? 1 : 0
