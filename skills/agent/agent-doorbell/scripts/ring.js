#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");

const PATTERNS = {
  done: [
    [880, 120],
    [1175, 160],
  ],
  "needs-input": [
    [988, 90],
    [988, 90],
    [1319, 120],
  ],
  blocked: [
    [392, 160],
    [659, 120],
    [392, 220],
  ],
  cancelled: [
    [523, 120],
    [392, 180],
  ],
};

function parseArgs(argv) {
  const args = {
    agentName: "Agent",
    summary: "Agent stopped",
    reason: "done",
    mode: "both",
    intensity: "normal",
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === "--agent-name") {
      args.agentName = value || args.agentName;
      index += 1;
    } else if (arg === "--summary") {
      args.summary = value || args.summary;
      index += 1;
    } else if (arg === "--reason") {
      args.reason = value || args.reason;
      index += 1;
    } else if (arg === "--mode") {
      args.mode = value || args.mode;
      index += 1;
    } else if (arg === "--intensity") {
      args.intensity = value || args.intensity;
      index += 1;
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    }
  }

  return args;
}

function limitText(text, maxLength) {
  const value = String(text || "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
}

function patternSummary(reason) {
  return (PATTERNS[reason] || PATTERNS.done).map(([freq, duration]) => `${freq}x${duration}`).join(",");
}

function powershellCommand() {
  return process.platform === "win32" ? "powershell.exe" : "pwsh";
}

function runWindowsHelper(payload) {
  const script = path.join(__dirname, "ring.ps1");
  const result = spawnSync(
    powershellCommand(),
    [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      script,
      "-AgentName",
      payload.agent,
      "-Summary",
      payload.summary,
      "-Reason",
      payload.reason,
      "-Mode",
      payload.mode,
      "-Intensity",
      payload.intensity,
    ],
    { stdio: "ignore", windowsHide: true },
  );
  return result.status === 0;
}

function runDarwinCue(payload) {
  let delivered = false;
  if (payload.mode === "auto" || payload.mode === "toast" || payload.mode === "both") {
    const title = payload.title.replaceAll('"', '\\"');
    const message = payload.message.replaceAll('"', '\\"');
    const result = spawnSync("osascript", ["-e", `display notification "${message}" with title "${title}"`], {
      stdio: "ignore",
    });
    delivered = result.status === 0 || delivered;
  }
  if (payload.mode === "auto" || payload.mode === "sound" || payload.mode === "both") {
    const repeats = payload.intensity === "loud" ? "2" : "1";
    const result = spawnSync("osascript", ["-e", `beep ${repeats}`], { stdio: "ignore" });
    delivered = result.status === 0 || delivered;
  }
  return delivered;
}

function runLinuxCue(payload) {
  let delivered = false;
  if (payload.mode === "auto" || payload.mode === "toast" || payload.mode === "both") {
    const result = spawnSync("notify-send", [payload.title, payload.message], { stdio: "ignore" });
    delivered = result.status === 0 || delivered;
  }
  if (payload.mode === "auto" || payload.mode === "sound" || payload.mode === "both") {
    process.stdout.write("\u0007");
    delivered = true;
  }
  return delivered;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const agent = limitText(args.agentName, 48);
  const summary = limitText(args.summary, 180);
  const title = limitText(`${agent} stopped`, 64);
  const message = limitText(`${args.reason} - ${summary}`, 240);
  const payload = {
    agent,
    reason: args.reason,
    summary,
    mode: args.mode,
    intensity: args.intensity,
    pattern: patternSummary(args.reason),
    title,
    message,
  };

  if (args.dryRun) {
    console.log(JSON.stringify(payload));
    return;
  }

  let delivered = false;
  if (args.mode !== "none") {
    if (process.platform === "win32") {
      delivered = runWindowsHelper(payload);
    } else if (process.platform === "darwin") {
      delivered = runDarwinCue(payload);
    } else {
      delivered = runLinuxCue(payload);
    }
  }

  if (!delivered && args.mode !== "none") {
    console.log(`${title} - ${message}`);
  }
}

main();
