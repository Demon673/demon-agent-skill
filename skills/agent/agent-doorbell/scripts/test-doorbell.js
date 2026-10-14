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
  return run("powershell.exe", ["-NoProfile", "-File", path.join(__dirname, script), ...args], "{}");
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

for (const event of ["SubagentStop", "subagentStop", "TeammateIdle", "TaskCompleted"]) {
  const preview = JSON.parse(node("hook-runner.js", ["--event", event, "--mode", "both", "--dry-run"], "{}"));
  assert.equal(preview.skipped, true, `${event} must stay silent even with old hook registrations`);
  assert.equal(preview.command, undefined);
  if (process.platform === "win32") assert.equal(JSON.parse(powershell("hook-runner.ps1", ["-Event", event, "-DryRun"])).skipped, true);
}
assert.deepEqual(JSON.parse(node("hook-runner.js", ["--event", "subagentStop", "--output", "cursor"], '{"status":"error"}')), {});
for (const event of ["Stop", "StopFailure", "PermissionRequest", "Elicitation", "Notification"]) {
  assert.equal(JSON.parse(node("hook-runner.js", ["--event", event, "--dry-run"], '{"agent_id":"child-123"}')).skipped, true, `${event} with child identity must stay silent`);
}
assert.equal(JSON.parse(node("hook-runner.js", ["--event", "Notification", "--dry-run"], '{"notification_type":"agent_needs_input"}')).skipped, true);
if (process.platform === "win32") {
  for (const [payload, skipped] of [['{"agent_id":"child-123"}', true], ['not-json', true], ['{"agent_type":"custom-main"}', false]]) {
    const preview = JSON.parse(run("powershell.exe", ["-NoProfile", "-File", path.join(__dirname, "hook-runner.ps1"), "-Event", "PermissionRequest", "-DryRun"], payload));
    assert.equal(preview.skipped === true, skipped, "Native direct stdin must distinguish main and child input");
    if (!skipped) assert.equal(preview.reason, "approval");
  }
}
for (const event of ["PermissionRequest", "Elicitation", "Notification"]) {
  for (const payload of ["", "not-json", "null", "[]"]) assert.equal(JSON.parse(node("hook-runner.js", ["--event", event, "--dry-run"], payload)).skipped, true);
  const main = JSON.parse(node("hook-runner.js", ["--event", event, "--dry-run"], '{"agent_type":"custom-main","tool_input":{"agent_id":"data-only"}}'));
  assert.ok(Array.isArray(main.command), "Only top-level child identity suppresses a main reminder");
}

const expected = { Stop: "done", agentStop: "done", errorOccurred: "failed", permissionRequest: "approval", notification: "needs-input", AfterAgent: "done", Elicitation: "needs-input", PermissionRequest: "approval", StopFailure: "failed", Notification: "needs-input" };
for (const [event, reason] of Object.entries(expected)) {
  const preview = JSON.parse(node("hook-runner.js", ["--mode", "none", "--dry-run"], JSON.stringify({ hook_event_name: event, last_assistant_message: "Which approval?" })));
  assert.equal(preview.reason, reason);
  if (process.platform === "win32") {
    const native = JSON.parse(powershell("hook-runner.ps1", ["-Event", event, "-Mode", "none", "-DryRun"]));
    assert.equal(native.reason, reason);
  }
}

assert.equal(JSON.parse(node("hook-runner.js", ["--event", "PermissionRequest", "--reason", "approval", "--mode", "none", "--dry-run"], JSON.stringify({ hookEventName: "PermissionRequest" }))).reason, "approval", "Command arguments must preserve the runtime event when payload keys differ");
assert.deepEqual(JSON.parse(node("hook-runner.js", ["--mode", "none", "--output", "gemini"], JSON.stringify({ hook_event_name: "AfterAgent" }))), {}, "Gemini reminders must return neutral JSON");
if (process.platform === "win32") {
  assert.deepEqual(JSON.parse(powershell("hook-runner.ps1", ["-Event", "AfterAgent", "-Mode", "none", "-Output", "gemini"])), {});
}
for (const event of ["stop"]) {
  for (const [status, reason] of [["completed", "done"], ["error", "failed"], ["aborted", "cancelled"]]) {
    const preview = JSON.parse(node("hook-runner.js", ["--event", event, "--reason", "done", "--output", "cursor", "--mode", "none", "--dry-run"], JSON.stringify({ status })));
    assert.equal(preview.reason, reason, `Cursor ${event} must distinguish ${status}`);
    assert.deepEqual(JSON.parse(node("hook-runner.js", ["--event", event, "--output", "cursor", "--mode", "none"], JSON.stringify({ status }))), {});
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
  const legacy = structuredClone(fixture);
  for (const event of ["SubagentStop", "TeammateIdle", "TaskCompleted"]) legacy.hooks[event] = [{ hooks: [{ type: "command", command: "old-doorbell", statusMessage: "Agent Doorbell" }] }];
  fs.writeFileSync(settingsPath, JSON.stringify(legacy));
  install("install");
  install("install");
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  assert.deepEqual(settings.permissions, fixture.permissions);
  assert.equal(settings.hooks.Stop[0].hooks[0].command, "other-hook");
  for (const event of ["Elicitation", "PermissionRequest", "Stop", "StopFailure", "Notification"]) {
    assert.ok(Array.isArray(settings.hooks[event]), `${installer} default install must cover ${event}`);
    const hooks = settings.hooks[event].flatMap(group => group.hooks).filter(hook => hook.statusMessage === "Agent Doorbell");
    assert.equal(hooks.length, 1, `${installer} duplicated ${event}`);
    assert.equal(hooks[0].command, process.platform === "win32" ? "powershell.exe" : "/bin/sh");
    assert.ok(hooks[0].args.some(arg => arg.includes("hook-runner.")), "Claude executable-form hooks preserve argument boundaries");
  }
  assert.equal(settings.hooks.Notification[0].matcher, "permission_prompt|idle_prompt|elicitation_dialog|elicitation_url_dialog");
  for (const event of ["SubagentStop", "TeammateIdle", "TaskCompleted"]) assert.equal(settings.hooks[event], undefined, `${installer} must remove old ${event} reminders`);
  install("uninstall");
  assert.deepEqual(JSON.parse(fs.readFileSync(settingsPath, "utf8")), fixture);
}
for (const runtime of ["gemini", "codex"]) {
  const runtimePath = path.join(root, `.${runtime}`, runtime === "codex" ? "hooks.json" : "settings.json");
  const events = runtime === "gemini" ? ["AfterAgent"] : ["Stop"];
  for (const installer of ["node", ...(process.platform === "win32" ? ["powershell"] : [])]) {
    const install = (action, extra = []) => installer === "node"
      ? node("install-hooks.js", [action, "--runtime", runtime, "--scope", "project", "--project-root", root, "--mode", "none", ...extra])
      : powershell("install-hooks.ps1", ["-Action", action, "-Runtime", runtime, "-Scope", "project", "-ProjectRoot", root, "-Mode", "none", ...extra]);
    fs.mkdirSync(path.dirname(runtimePath), { recursive: true });
    const fixture = { model: "unchanged", hooks: { [events[0]]: [{ hooks: [{ type: "command", command: "other-hook", name: "Other Hook" }] }] } };
    fs.writeFileSync(runtimePath, JSON.stringify(fixture));
    install("install", installer === "node" ? ["--dry-run"] : ["-DryRun"]);
    assert.deepEqual(JSON.parse(fs.readFileSync(runtimePath, "utf8")), fixture);
    install("install");
    install("install");
    const settings = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
    assert.equal(settings.model, "unchanged");
    assert.equal(settings.hooks[events[0]][0].hooks[0].command, "other-hook");
    for (const event of events) {
      const entries = settings.hooks[event].flatMap(group => group.hooks).filter(hook => hook.name === "Agent Doorbell" || hook.statusMessage === "Agent Doorbell");
      assert.equal(entries.length, 1, `${installer} duplicated ${runtime} ${event}`);
      assert.equal(typeof entries[0].command, "string");
      assert.equal(entries[0].timeout, runtime === "gemini" ? 10000 : 10);
      assert.equal(entries[0].async, undefined);
      if (runtime === "gemini") assert.match(entries[0].command, /(?:-Output|--output) gemini/);
      assert.match(entries[0].command, /(?:-Event|--event) /);
    }
    install("uninstall");
    assert.deepEqual(JSON.parse(fs.readFileSync(runtimePath, "utf8")), fixture);
  }
}
for (const runtime of ["copilot", "cursor"]) {
  const runtimePath = runtime === "copilot" ? path.join(root, ".github", "hooks", "agent-doorbell.json") : path.join(root, ".cursor", "hooks.json");
  const events = runtime === "copilot" ? ["agentStop"] : ["stop"];
  for (const installer of ["node", ...(runtime === "copilot" && process.platform === "win32" ? ["powershell"] : [])]) {
    const install = (action, extra = []) => installer === "node"
      ? node("install-hooks.js", [action, "--runtime", runtime, "--scope", "project", "--project-root", root, "--mode", "none", ...(runtime === "cursor" ? ["--runner", "node"] : []), ...extra])
      : powershell("install-hooks.ps1", ["-Action", action, "-Runtime", runtime, "-Scope", "project", "-ProjectRoot", root, "-Mode", "none", ...extra]);
    fs.mkdirSync(path.dirname(runtimePath), { recursive: true });
    const fixture = { version: 1, label: "unchanged", hooks: { [events[0]]: [{ type: "command", command: "other-hook" }] } };
    fs.writeFileSync(runtimePath, JSON.stringify(fixture));
    install("install", installer === "node" ? ["--dry-run"] : ["-DryRun"]);
    assert.deepEqual(JSON.parse(fs.readFileSync(runtimePath, "utf8")), fixture);
    install("install");
    install("install");
    const settings = JSON.parse(fs.readFileSync(runtimePath, "utf8"));
    assert.equal(settings.version, 1);
    assert.equal(settings.label, "unchanged");
    assert.equal(settings.hooks[events[0]][0].command, "other-hook");
    for (const event of events) {
      const entries = settings.hooks[event].filter(hook => hook.command !== "other-hook");
      assert.equal(entries.length, 1, `${installer} duplicated ${runtime} ${event}`);
      const hook = entries[0];
      assert.equal(hook.hooks, undefined, "Flat adapters must not inherit Claude matcher groups");
      if (runtime === "copilot") {
        assert.equal(hook.timeoutSec, 10);
        assert.equal(hook.exec, process.platform === "win32" ? "powershell.exe" : "/bin/sh");
        assert.ok(hook.args.includes(event));
        const reasonIndex = hook.args.indexOf(process.platform === "win32" ? "-Reason" : "--reason");
        assert.equal(hook.args[reasonIndex + 1], expected[event], `Copilot ${event} must have one exact chime reason`);
        assert.equal(hook.statusMessage, undefined);
        const testArgs = hook.args.filter((argument, index) => argument !== "-ExecutionPolicy" && hook.args[index - 1] !== "-ExecutionPolicy");
        assert.equal(run(hook.exec, testArgs, "{}"), "");
      } else {
        assert.equal(hook.timeout, 10);
        assert.match(hook.command, /--output cursor/);
        const shell = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh";
        const result = spawnSync(hook.command, { shell, input: JSON.stringify({ status: "error" }), encoding: "utf8", windowsHide: true });
        assert.equal(result.status, 0, result.error?.message || result.stderr);
        assert.deepEqual(JSON.parse(result.stdout), {});
      }
    }
    for (const event of ["subagentStop", "permissionRequest", "notification", "errorOccurred"]) assert.equal(settings.hooks[event], undefined);
    install("uninstall");
    assert.deepEqual(JSON.parse(fs.readFileSync(runtimePath, "utf8")), fixture);
    const invalid = { ...fixture, version: 2 };
    fs.writeFileSync(runtimePath, JSON.stringify(invalid));
    const before = fs.readFileSync(runtimePath);
    const result = installer === "node"
      ? spawnSync(process.execPath, [path.join(__dirname, "install-hooks.js"), "--runtime", runtime, "--scope", "project", "--project-root", root, ...(runtime === "cursor" ? ["--runner", "node"] : [])], { encoding: "utf8" })
      : spawnSync("powershell.exe", ["-NoProfile", "-File", path.join(__dirname, "install-hooks.ps1"), "-Runtime", runtime, "-Scope", "project", "-ProjectRoot", root], { encoding: "utf8" });
    assert.notEqual(result.status, 0, "An unknown flat hook version must be refused before writing");
    assert.deepEqual(fs.readFileSync(runtimePath), before);
  }
}
for (const [runtime, event] of [["claude", "SubagentStop"], ["codex", "SubagentStop"], ["copilot", "subagentStop"], ["cursor", "subagentStop"], ["gemini", "Notification"]]) {
  const result = spawnSync(process.execPath, [path.join(__dirname, "install-hooks.js"), "--runtime", runtime, "--scope", "project", "--project-root", root, "--events", event, ...(runtime === "cursor" ? ["--runner", "node"] : [])], { encoding: "utf8" });
  assert.notEqual(result.status, 0, `${runtime} must reject ${event} reminders`);
  assert.match(result.stderr, /Unsupported/);
  if (process.platform === "win32" && runtime !== "cursor") {
    const native = spawnSync("powershell.exe", ["-NoProfile", "-File", path.join(__dirname, "install-hooks.ps1"), "-Runtime", runtime, "-Scope", "project", "-ProjectRoot", root, "-Events", event], { encoding: "utf8" });
    assert.notEqual(native.status, 0, `Native ${runtime} must reject ${event} reminders`);
    assert.match(native.stderr, /Unsupported/);
  }
}
console.log("Doorbell acceptance passed: five WAVs, main-agent reminders, silent children, five runtime adapters, preservation and idempotency.");
console.log(`Temporary acceptance settings: ${root}`);
