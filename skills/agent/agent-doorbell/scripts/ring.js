#!/usr/bin/env node
const { spawnSync } = require("child_process");
const path = require("path");

const REASONS = ["done", "needs-input", "approval", "blocked", "failed", "cancelled"];

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

  if (!REASONS.includes(args.reason)) throw new Error(`Unsupported reason: ${args.reason}`);
  if (!["auto", "toast", "sound", "both", "none"].includes(args.mode)) throw new Error(`Unsupported mode: ${args.mode}`);
  if (!["quiet", "normal", "loud"].includes(args.intensity)) throw new Error(`Unsupported intensity: ${args.intensity}`);
  return args;
}

function limitText(text, maxLength) {
  const value = String(text || "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 3))}...`;
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
    const result = spawnSync("osascript", ["-", payload.title, payload.message], {
      input: "on run argv\n  display notification (item 2 of argv) with title (item 1 of argv)\nend run\n",
      stdio: ["pipe", "ignore", "ignore"],
    });
    delivered = result.status === 0 || delivered;
  }
  if (payload.mode === "auto" || payload.mode === "sound" || payload.mode === "both") {
    let result = spawnSync("afplay", [payload.sound], { stdio: "ignore" });
    if (result.status === 0 && payload.intensity === "loud") spawnSync("afplay", [payload.sound], { stdio: "ignore" });
    if (result.status !== 0) result = spawnSync("osascript", ["-e", "beep 1"], { stdio: "ignore" });
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
    let played = false;
    for (const player of ["paplay", "aplay"]) {
      const result = spawnSync(player, [payload.sound], { stdio: "ignore" });
      if (result.status === 0) {
        if (payload.intensity === "loud") spawnSync(player, [payload.sound], { stdio: "ignore" });
        played = true;
        break;
      }
    }
    if (!played) {
      try {
        require("node:fs").writeFileSync("/dev/tty", "\u0007");
      } catch (_error) {}
    }
    delivered = played || delivered;
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
    sound: args.reason === "cancelled" ? "" : path.join(__dirname, "..", "assets", `${args.reason}.wav`),
    title,
    message,
  };

  if (args.dryRun) {
    console.log(JSON.stringify(payload));
    return;
  }

  if (args.mode === "none" || args.reason === "cancelled") return;
  let delivered = false;
  if (process.platform === "win32") {
    delivered = runWindowsHelper(payload);
  } else if (process.platform === "darwin") {
    delivered = runDarwinCue(payload);
  } else {
    delivered = runLinuxCue(payload);
  }

  if (!delivered) {
    console.log(`${title} - ${message}`);
  }
}

main();
