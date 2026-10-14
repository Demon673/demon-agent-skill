#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { wav, motifs } = require("./generate-sounds.js");

function run(command, args, input) {
  const result = spawnSync(command, args, { input, encoding: "utf8", windowsHide: true });
  assert.equal(result.status, 0, result.error?.message || result.stderr);
  return result.stdout;
}
function node(script, args = [], input) {
  return run(process.execPath, [path.join(__dirname, script), ...args], input);
}
function powershell(script, args = []) {
  return run("powershell.exe", ["-NoProfile", "-File", path.join(__dirname, script), ...args]);
}

const durations = { done: 0.45, "needs-input": 0.46, approval: 0.53, blocked: 0.57, failed: 0.52 };
const hashes = new Set();
for (const reason of Object.keys(motifs)) {
  const bytes = fs.readFileSync(path.join(__dirname, "..", "assets", `${reason}.wav`));
  assert.deepEqual(bytes, wav(reason), `Regenerate ${reason}.wav`);
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.toString("ascii", 8, 12), "WAVE");
  assert.equal(bytes.readUInt16LE(22), 1);
  assert.equal(bytes.readUInt16LE(34), 16);
  const duration = bytes.readUInt32LE(40) / bytes.readUInt32LE(28);
  assert.ok(Math.abs(duration - durations[reason]) < 0.0001);
  let peak = 0;
  for (let i = 44; i < bytes.length; i += 2) peak = Math.max(peak, Math.abs(bytes.readInt16LE(i)));
  assert.ok(peak > 1000 && peak < 32767, `${reason} must be audible and unclipped`);
  hashes.add(require("node:crypto").createHash("sha256").update(bytes).digest("hex"));
  const preview = JSON.parse(node("ring.js", ["--reason", reason, "--mode", "none", "--dry-run"]));
  assert.equal(path.basename(preview.sound), `${reason}.wav`);
  if (process.platform === "win32") {
    const native = JSON.parse(powershell("ring.ps1", ["-Reason", reason, "-Mode", "none", "-DryRun"]));
    assert.equal(path.basename(native.sound), `${reason}.wav`);
    run("powershell.exe", ["-NoProfile", "-Command", `$ErrorActionPreference = 'Stop'; $p = New-Object System.Media.SoundPlayer '${preview.sound.replaceAll("'", "''")}'; try { $p.Load() } finally { $p.Dispose() }`]);
  }
}
assert.equal(hashes.size, 5, "Event sounds must differ");
assert.equal(node("ring.js", ["--reason", "cancelled", "--mode", "none"]), "");
if (process.platform === "win32") powershell("test-native-spawn.ps1");

const expected = { Stop: "done", AfterAgent: "done", Elicitation: "needs-input", PermissionRequest: "approval", StopFailure: "failed", Notification: "needs-input" };
for (const [event, reason] of Object.entries(expected)) {
  const preview = JSON.parse(node("hook-runner.js", ["--mode", "none", "--dry-run"], JSON.stringify({ hook_event_name: event, last_assistant_message: "Which approval?" })));
  assert.equal(preview.reason, reason);
  if (process.platform === "win32") {
    const native = JSON.parse(powershell("hook-runner.ps1", ["-Event", event, "-Mode", "none", "-DryRun"]));
    assert.equal(native.reason, reason);
  }
}

const root = fs.mkdtempSync(path.join(os.tmpdir(), "doorbell acceptance "));
const settingsPath = path.join(root, ".claude", "settings.local.json");
const fixture = { permissions: { allow: ["one"], deny: ["two", "three"] }, hooks: { Stop: [{ hooks: [{ type: "command", command: "other-hook", statusMessage: "Other Hook" }] }] } };
fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
for (const installer of ["node", ...(process.platform === "win32" ? ["powershell"] : [])]) {
  const install = (action, extra = []) => installer === "node"
    ? node("install-hooks.js", [action, "--runtime", "claude", "--scope", "project-local", "--project-root", root, "--mode", "none", ...extra])
    : powershell("install-hooks.ps1", ["-Action", action, "-Runtime", "claude", "-Scope", "project-local", "-ProjectRoot", root, "-Mode", "none", ...extra]);
  fs.writeFileSync(settingsPath, JSON.stringify(fixture));
  install("install");
  install("install");
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  assert.deepEqual(settings.permissions, fixture.permissions);
  assert.equal(settings.hooks.Stop[0].hooks[0].command, "other-hook");
  for (const event of ["Elicitation", "PermissionRequest", "Stop", "StopFailure"]) {
    const hooks = settings.hooks[event].flatMap(group => group.hooks).filter(hook => hook.statusMessage === "Agent Doorbell");
    assert.equal(hooks.length, 1, `${installer} duplicated ${event}`);
    assert.equal(hooks[0].command, process.platform === "win32" ? "powershell.exe" : "/bin/sh");
    assert.ok(hooks[0].args.some(arg => arg.includes("hook-runner.")), "Claude executable-form hooks preserve argument boundaries");
  }
  install("uninstall");
  assert.deepEqual(JSON.parse(fs.readFileSync(settingsPath, "utf8")), fixture);
}
console.log(`Doorbell acceptance passed: five WAVs, event mapping, ${process.platform === "win32" ? "both installers" : "Node installer"}, preservation and idempotency.`);
console.log(`Temporary acceptance settings: ${root}`);
