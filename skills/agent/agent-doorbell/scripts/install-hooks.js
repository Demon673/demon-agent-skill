#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const CLAUDE_DEFAULT_EVENTS = ["Elicitation", "PermissionRequest", "Stop", "StopFailure"];
const GEMINI_DEFAULT_EVENTS = ["AfterAgent", "Notification"];
const CLAUDE_ALLOWED_EVENTS = new Set(["Stop", "StopFailure", "SubagentStop", "TeammateIdle", "PermissionRequest", "Elicitation"]);
const GEMINI_ALLOWED_EVENTS = new Set([
  "SessionStart",
  "SessionEnd",
  "BeforeAgent",
  "AfterAgent",
  "BeforeModel",
  "AfterModel",
  "BeforeToolSelection",
  "BeforeTool",
  "AfterTool",
  "PreCompress",
  "Notification",
]);
const STATUS_MESSAGE = "Agent Doorbell";

function parseArgs(argv) {
  const args = {
    action: "install",
    runtime: "claude",
    scope: "user",
    projectRoot: process.cwd(),
    events: null,
    mode: "both",
    intensity: "normal",
    timeout: 10,
    nodeCommand: process.execPath,
    runner: "native",
    dryRun: false,
  };

  const positional = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === "--runtime") {
      args.runtime = value || args.runtime;
      index += 1;
    } else if (arg === "--scope") {
      args.scope = value || args.scope;
      index += 1;
    } else if (arg === "--project-root") {
      args.projectRoot = value || args.projectRoot;
      index += 1;
    } else if (arg === "--events") {
      args.events = parseEvents(value || "");
      index += 1;
    } else if (arg === "--mode") {
      args.mode = value || args.mode;
      index += 1;
    } else if (arg === "--intensity") {
      args.intensity = value || args.intensity;
      index += 1;
    } else if (arg === "--timeout") {
      args.timeout = Number.parseInt(value || String(args.timeout), 10);
      index += 1;
    } else if (arg === "--node-command") {
      args.nodeCommand = value || args.nodeCommand;
      index += 1;
    } else if (arg === "--runner") {
      args.runner = value || args.runner;
      index += 1;
    } else if (arg === "--remove") {
      args.action = "uninstall";
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (!arg.startsWith("--")) {
      positional.push(arg);
    }
  }

  if (positional[0]) args.action = positional[0];
  if (args.action === "remove") args.action = "uninstall";
  if (!["install", "uninstall"].includes(args.action)) fail(`Unsupported action: ${args.action}`);
  if (!["claude", "gemini"].includes(args.runtime)) fail(`Unsupported runtime: ${args.runtime}`);
  if (!["user", "project-local", "project"].includes(args.scope)) fail(`Unsupported scope: ${args.scope}`);
  if (!["native", "node", "powershell", "shell"].includes(args.runner)) fail(`Unsupported runner: ${args.runner}`);
  if (!Number.isFinite(args.timeout) || args.timeout <= 0) fail("--timeout must be a positive integer");
  args.events = validateEvents(args.runtime, args.events || defaultEvents(args.runtime));
  args.runner = resolveRunner(args.runner);
  return args;
}

function parseEvents(value) {
  const events = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (!events.length) fail("At least one event is required");
  return events;
}

function defaultEvents(runtime) {
  return runtime === "claude" ? [...CLAUDE_DEFAULT_EVENTS] : [...GEMINI_DEFAULT_EVENTS];
}

function validateEvents(runtime, events) {
  const allowed = runtime === "claude" ? CLAUDE_ALLOWED_EVENTS : GEMINI_ALLOWED_EVENTS;
  const invalid = events.filter((event) => !allowed.has(event));
  if (invalid.length) fail(`Unsupported ${runtime} event(s): ${invalid.join(", ")}`);
  return events;
}

function resolveRunner(runner) {
  if (runner !== "native") return runner;
  return process.platform === "win32" ? "powershell" : "shell";
}

function reasonForEvent(event) {
  if (event === "AfterAgent") return "done";
  if (event === "Elicitation" || event === "Notification" || event === "PermissionRequest") return "needs-input";
  if (event === "StopFailure") return "blocked";
  return "done";
}

function fail(message) {
  console.error(message);
  process.exit(2);
}

function settingsPath(runtime, scope, projectRoot) {
  const root = path.resolve(projectRoot);
  const home = require("os").homedir();
  if (runtime === "claude") {
    if (scope === "user") return path.join(home, ".claude", "settings.json");
    if (scope === "project-local") return path.join(root, ".claude", "settings.local.json");
    return path.join(root, ".claude", "settings.json");
  }
  if (scope === "user") return path.join(home, ".gemini", "settings.json");
  return path.join(root, ".gemini", "settings.json");
}

function loadSettings(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!data || Array.isArray(data) || typeof data !== "object") fail(`Settings top-level JSON must be an object: ${filePath}`);
    return data;
  } catch (error) {
    fail(`Cannot update invalid JSON settings file: ${filePath} (${error.message})`);
  }
}

function writeSettings(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function quoteForCommand(value) {
  const text = String(value);
  if (!/[ \t"'\\]/.test(text)) return text;
  if (process.platform === "win32") return `"${text.replace(/"/g, '\\"')}"`;
  return `'${text.replace(/'/g, "'\\''")}'`;
}

function buildCommandParts(args, event, output) {
  const reason = reasonForEvent(event);
  if (args.runner === "node") {
    return [
      args.nodeCommand,
      path.join(__dirname, "hook-runner.js"),
      "--mode",
      args.mode,
      "--intensity",
      args.intensity,
      "--output",
      output,
    ];
  }
  if (args.runner === "powershell") {
    return [
      "powershell.exe",
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      path.join(__dirname, "hook-runner.ps1"),
      "-Event",
      event,
      "-Reason",
      reason,
      "-Mode",
      args.mode,
      "-Intensity",
      args.intensity,
      "-Output",
      output,
    ];
  }
  return [
    "/bin/sh",
    path.join(__dirname, "hook-runner.sh"),
    "--event",
    event,
    "--reason",
    reason,
    "--mode",
    args.mode,
    "--intensity",
    args.intensity,
    "--output",
    output,
  ];
}

function buildHookEntry(args, event) {
  const output = args.runtime === "gemini" ? "gemini" : "none";
  const commandParts = buildCommandParts(args, event, output);
  if (args.runtime === "gemini") {
    return {
      name: STATUS_MESSAGE,
      type: "command",
      command: commandParts.map(quoteForCommand).join(" "),
      timeout: args.timeout * 1000,
      description: "Ring a non-blocking Agent Doorbell cue when the agent stops or needs attention.",
    };
  }
  return {
    type: "command",
    command: commandParts[0],
    args: commandParts.slice(1),
    async: true,
    timeout: args.timeout,
    statusMessage: STATUS_MESSAGE,
  };
}

function isDoorbellHook(hook) {
  if (!hook || typeof hook !== "object" || Array.isArray(hook)) return false;
  if (hook.statusMessage === STATUS_MESSAGE || hook.name === STATUS_MESSAGE) return true;
  if (Array.isArray(hook.args) && hook.args.some((arg) => /hook-runner\.(js|py|ps1|sh)$/.test(String(arg)))) {
    return true;
  }
  return typeof hook.command === "string" && /hook-runner\.(js|py|ps1|sh)/.test(hook.command);
}

function removeDoorbellHooks(settings) {
  const updated = structuredClone(settings);
  let removed = 0;
  if (!updated.hooks || typeof updated.hooks !== "object" || Array.isArray(updated.hooks)) {
    return { settings: updated, removed };
  }

  for (const event of Object.keys(updated.hooks)) {
    const groups = updated.hooks[event];
    if (!Array.isArray(groups)) continue;
    const keptGroups = [];
    for (const group of groups) {
      if (!group || typeof group !== "object" || !Array.isArray(group.hooks)) {
        keptGroups.push(group);
        continue;
      }
      const keptHooks = group.hooks.filter((hook) => !isDoorbellHook(hook));
      removed += group.hooks.length - keptHooks.length;
      if (keptHooks.length) keptGroups.push({ ...group, hooks: keptHooks });
    }
    if (keptGroups.length) {
      updated.hooks[event] = keptGroups;
    } else {
      delete updated.hooks[event];
    }
  }
  if (!Object.keys(updated.hooks).length) delete updated.hooks;
  return { settings: updated, removed };
}

function installHooks(settings, events, args) {
  const result = removeDoorbellHooks(settings);
  const updated = result.settings;
  if (!updated.hooks) updated.hooks = {};
  for (const event of events) {
    if (!updated.hooks[event]) updated.hooks[event] = [];
    if (!Array.isArray(updated.hooks[event])) fail(`Cannot update hooks.${event}: expected a list`);
    updated.hooks[event].push({ hooks: [structuredClone(buildHookEntry(args, event))] });
  }
  return { settings: updated, removed: result.removed };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = settingsPath(args.runtime, args.scope, args.projectRoot);
  const original = loadSettings(target);
  const result = args.action === "uninstall"
    ? removeDoorbellHooks(original)
    : installHooks(original, args.events, args);
  const changed = JSON.stringify(original) !== JSON.stringify(result.settings);

  if (!args.dryRun && changed) writeSettings(target, result.settings);

  console.log(JSON.stringify({
    action: args.action,
    runtime: args.runtime,
    runner: args.runner,
    scope: args.scope,
    settings_path: target,
    events: args.events,
    removed_existing_hooks: result.removed,
    hook_entries: Object.fromEntries(args.events.map((event) => [event, buildHookEntry(args, event)])),
    changed,
    dry_run: args.dryRun,
  }, null, 2));
}

main();
