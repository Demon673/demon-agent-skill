import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))

test('reference refresh normalizes Markdown, preserves JSON bytes and is idempotent', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'dota-reference-refresh-'))
  const upstream = join(fixture, 'upstream')
  const skill = join(fixture, 'skill')
  const script = join(skill, 'scripts', 'update_references.ps1')
  mkdirSync(join(upstream, 'resource'), { recursive: true })
  mkdirSync(join(skill, 'scripts'), { recursive: true })
  copyFileSync(join(root, 'skills/dota2/dota2-custom-game-dev/scripts/update_references.ps1'), script)

  const markdown = new Map([
    ['resource/dump_panorama_events.md', ['# Events \t\r\n\r\n  indented event \r\n\r\n', '# Events\n\n  indented event\n']],
    ['resource/PanelList.md', ['\r\n\t \r\n', '']],
    ['resource/lua_api_changelog.md', ['# API 更新日志 \r\nentry\t\r\n\r\n', '# API 更新日志\nentry\n']],
  ])
  const raw = new Map([
    ['resource/dota_script_help2.json', '{ "class_list": {}, "enum_list": {} }\r\n'],
    ['resource/cl_panorama_script_help_2.json', '{ "name": "preserve spaces " }\r\n'],
    ['resource/dump_panorama_css_properties.json', '{}\r\n'],
    ['resource/PanelList.json', '{}\r\n'],
    ['css.css-data.json', '{}\r\n'],
    ['html.html-data.json', ''],
  ])
  for (const [name, [input]] of markdown) writeFileSync(join(upstream, name), input)
  for (const [name, input] of raw) writeFileSync(join(upstream, name), input)

  const run = (command, args, cwd = upstream) => {
    const result = spawnSync(command, args, { cwd, encoding: 'utf8' })
    assert.equal(result.status, 0, result.error?.message || result.stderr || result.stdout)
    return result.stdout
  }
  run('git', ['init', '--quiet'])
  run('git', ['add', '.'])
  run('git', ['-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', '-c', 'core.hooksPath=.git/hooks', 'commit', '--quiet', '-m', 'fixture'])
  const refresh = () => run(process.platform === 'win32' ? 'powershell' : 'pwsh', [
    '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', script, '-UpstreamRoot', upstream,
  ], fixture)
  refresh()
  const vendor = join(skill, 'references/vendor/vscode-dota2-tools')
  for (const [name, [, expected]] of markdown) {
    assert.deepEqual(readFileSync(join(vendor, name)), Buffer.from(expected), name)
  }
  for (const [name, expected] of raw) {
    assert.deepEqual(readFileSync(join(vendor, name)), Buffer.from(expected), name)
  }
  const manifest = JSON.parse(readFileSync(join(vendor, 'UPSTREAM.json'), 'utf8').replace(/^\uFEFF/, ''))
  assert.equal(manifest.commit, run('git', ['rev-parse', 'HEAD']).trim())
  assert.equal(manifest.markdownNormalization, 'LF; trim trailing spaces/tabs; one final newline for non-empty files')
  refresh()
  for (const [name, [, expected]] of markdown) {
    assert.deepEqual(readFileSync(join(vendor, name)), Buffer.from(expected), name)
  }
  console.log(`Isolated refresh fixture retained at ${fixture}`)
})
