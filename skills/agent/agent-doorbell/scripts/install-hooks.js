#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const CLAUDE_DEFAULT_EVENTS = ["Elicitation", "PermissionRequest", "Stop", "StopFailure", "Notification"];
const GEMINI_DEFAULT_EVENTS = ["AfterAgent"];
const CODEX_DEFAULT_EVENTS = ["Stop"];
const COPILOT_DEFAULT_EVENTS = ["agentStop"];
const CURSOR_DEFAULT_EVENTS = ["stop"];
// Only Claude payloads identify the emitting agent, so the other adapters expose completion events only.
const CLAUDE_ALLOWED_EVENTS = new Set(CLAUDE_DEFAULT_EVENTS);
const CODEX_ALLOWED_EVENTS = new Set(CODEX_DEFAULT_EVENTS);
const COPILOT_ALLOWED_EVENTS = new Set(COPILOT_DEFAULT_EVENTS);
const CURSOR_ALLOWED_EVENTS = new Set(CURSOR_DEFAULT_EVENTS);
const GEMINI_ALLOWED_EVENTS = new Set(GEMINI_DEFAULT_EVENTS);
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
  if (!["claude", "gemini", "codex", "copilot", "cursor"].includes(args.runtime)) fail(`Unsupported runtime: ${args.runtime}`);
  if (!["user", "project-local", "project"].includes(args.scope)) fail(`Unsupported scope: ${args.scope}`);
  if (["codex", "copilot", "cursor"].includes(args.runtime) && args.scope === "project-local") fail(`${args.runtime} does not have a project-local hooks file; use user or project scope`);
  if (args.runtime === "cursor" && args.runner !== "node") fail("Cursor status-aware hooks require an explicit --runner node selection");
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
  if (runtime === "claude") return [...CLAUDE_DEFAULT_EVENTS];
  if (runtime === "codex") return [...CODEX_DEFAULT_EVENTS];
  if (runtime === "copilot") return [...COPILOT_DEFAULT_EVENTS];
  if (runtime === "cursor") return [...CURSOR_DEFAULT_EVENTS];
  return [...GEMINI_DEFAULT_EVENTS];
}

function validateEvents(runtime, events) {
  const allowed = { claude: CLAUDE_ALLOWED_EVENTS, codex: CODEX_ALLOWED_EVENTS, gemini: GEMINI_ALLOWED_EVENTS, copilot: COPILOT_ALLOWED_EVENTS, cursor: CURSOR_ALLOWED_EVENTS }[runtime];
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
  if (event === "Elicitation" || event === "Notification" || event === "notification") return "needs-input";
  if (event === "PermissionRequest" || event === "permissionRequest") return "approval";
  if (event === "StopFailure" || event === "errorOccurred") return "failed";
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
  if (runtime === "codex") {
    return scope === "user" ? path.join(home, ".codex", "hooks.json") : path.join(root, ".codex", "hooks.json");
  }
  if (runtime === "copilot") return scope === "user" ? path.join(process.env.COPILOT_HOME || path.join(home, ".copilot"), "hooks", "agent-doorbell.json") : path.join(root, ".github", "hooks", "agent-doorbell.json");
  if (runtime === "cursor") return path.join(scope === "user" ? home : root, ".cursor", "hooks.json");
  if (scope === "user") return path.join(home, ".gemini", "settings.json");
  return path.join(root, ".gemini", "settings.json");
}

function loadSettings(filePath) {
  if (!fs.existsSync(filePath)) return {};
  try {
    const text = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    const data = JSON.parse(text);
    if (!data || Array.isArray(data) || typeof data !== "object") fail(`Settings top-level JSON must be an object: ${filePath}`);
    return data;
  } catch (error) {
    fail(`Cannot update invalid JSON settings file: ${filePath} (${error.message})`);
  }
}

function assertHooksShape(settings) {
  if (!Object.prototype.hasOwnProperty.call(settings, "hooks")) return;
  if (!settings.hooks || typeof settings.hooks !== "object" || Array.isArray(settings.hooks)) {
    fail("Cannot update hooks: expected an object");
  }
  for (const [event, groups] of Object.entries(settings.hooks)) {
    if (!Array.isArray(groups)) fail(`Cannot update hooks.${event}: expected a list`);
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
  const output = args.runtime === "gemini" ? "gemini" : args.runtime === "cursor" ? "cursor" : "none";
  const commandParts = buildCommandParts(args, event, output);
  if (args.runtime === "copilot") return {
    type: "command",
    exec: commandParts[0],
    args: commandParts.slice(1),
    timeoutSec: args.timeout,
    ...(event === "notification" ? { matcher: "elicitation_dialog" } : {}),
  };
  if (args.runtime === "cursor") return { type: "command", command: commandParts.map(quoteForCommand).join(" "), timeout: args.timeout };
  if (args.runtime === "gemini" || args.runtime === "codex") {
    return {
      type: "command",
      command: commandParts.map(quoteForCommand).join(" "),
      timeout: args.runtime === "gemini" ? args.timeout * 1000 : args.timeout,
      ...(args.runtime === "gemini"
        ? { name: STATUS_MESSAGE, description: "Ring a non-blocking Agent Doorbell cue when the agent stops or needs attention." }
        : { statusMessage: STATUS_MESSAGE }),
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
  if (Array.isArray(hook.args) && hook.args.some(isDoorbellRunnerReference)) {
    return true;
  }
  return typeof hook.command === "string" && isDoorbellRunnerReference(hook.command);
}

function isDoorbellRunnerReference(value) {
  const text = String(value).replace(/\\/g, "/");
  return /(^|\/)agent-doorbell\/scripts\/hook-runner\.(js|py|ps1|sh)(["'\s]|$)/.test(text);
}

function removeDoorbellHooks(settings, flat = false) {
  const updated = structuredClone(settings);
  let removed = 0;
  assertHooksShape(updated);
  if (!updated.hooks) {
    return { settings: updated, removed };
  }

  for (const event of Object.keys(updated.hooks)) {
    const groups = updated.hooks[event];
    if (flat) {
      const kept = groups.filter(hook => !isDoorbellHook(hook));
      removed += groups.length - kept.length;
      if (kept.length) updated.hooks[event] = kept;
      else delete updated.hooks[event];
      continue;
    }
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
  const flat = args.runtime === "copilot" || args.runtime === "cursor";
  const result = removeDoorbellHooks(settings, flat);
  const updated = result.settings;
  if (flat) updated.version = 1;
  if (!updated.hooks) updated.hooks = {};
  for (const event of events) {
    if (!updated.hooks[event]) updated.hooks[event] = [];
    if (!Array.isArray(updated.hooks[event])) fail(`Cannot update hooks.${event}: expected a list`);
    const entry = structuredClone(buildHookEntry(args, event));
    updated.hooks[event].push(flat ? entry : {
      ...(args.runtime === "claude" && event === "Notification" ? { matcher: "permission_prompt|idle_prompt|elicitation_dialog|elicitation_url_dialog" } : {}),
      hooks: [entry],
    });
  }
  return { settings: updated, removed: result.removed };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const target = settingsPath(args.runtime, args.scope, args.projectRoot);
  const original = loadSettings(target);
  const flat = args.runtime === "copilot" || args.runtime === "cursor";
  if (flat && original.version !== undefined && original.version !== 1) fail("Unsupported hooks file version; expected version 1");
  const result = args.action === "uninstall"
    ? removeDoorbellHooks(original, flat)
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
