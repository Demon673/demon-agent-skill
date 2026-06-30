#!/usr/bin/env node
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const REASON_BY_EVENT = {
  AfterAgent: "done",
  Elicitation: "needs-input",
  Notification: "needs-input",
  PermissionRequest: "needs-input",
  StopFailure: "blocked",
  TeammateIdle: "done",
};

function parseArgs(argv) {
  const args = { mode: "both", intensity: "normal", output: "none", dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === "--mode") {
      args.mode = value || args.mode;
      index += 1;
    } else if (arg === "--intensity") {
      args.intensity = value || args.intensity;
      index += 1;
    } else if (arg === "--output") {
      args.output = value || args.output;
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

function readEvent() {
  let raw = "";
  try {
    raw = fs.readFileSync(0, "utf8");
  } catch (_error) {
    return {};
  }
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return { hook_event_name: "unknown" };
  }
}

function eventMessage(event) {
  for (const key of ["last_assistant_message", "prompt_response", "message", "summary", "content"]) {
    const value = event[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function inferAgentName(event) {
  if (event.agent_name) return event.agent_name;
  if (event.teammate_name) return event.teammate_name;
  if (event.agent_type) return event.agent_type;
  if (event.tool_name) return `Agent permission: ${event.tool_name}`;
  if (event.mcp_server_name) return `Agent input: ${event.mcp_server_name}`;
  return "Agent";
}

function inferReason(event) {
  const eventName = event.hook_event_name || "";
  if (REASON_BY_EVENT[eventName]) return REASON_BY_EVENT[eventName];

  const message = eventMessage(event).toLowerCase();
  if (["blocked", "can't proceed", "cannot proceed", "unable to proceed"].some((token) => message.includes(token))) {
    return "blocked";
  }
  if (["cancelled", "canceled", "stopped by user"].some((token) => message.includes(token))) {
    return "cancelled";
  }
  if (["?", "confirm", "approval", "permission", "choose", "which option"].some((token) => message.includes(token))) {
    return "needs-input";
  }
  return "done";
}

function inferSummary(event, reason) {
  const eventName = event.hook_event_name || "Agent stop";
  if (eventName === "AfterAgent") return limitText(eventMessage(event) || "Agent finished responding", 180);
  if (eventName === "Notification") return limitText(eventMessage(event) || "Agent notification needs attention", 180);
  if (eventName === "PermissionRequest") return limitText(`Waiting for permission to use ${event.tool_name || "tool"}`, 180);
  if (eventName === "Elicitation") return limitText(`Waiting for ${event.message || "external input"}`, 180);
  if (eventName === "StopFailure") return limitText(`Stopped because of ${event.error || "error"}`, 180);
  if (eventName === "SubagentStop") return limitText(eventMessage(event) || "Subagent stopped", 180);
  if (eventName === "TeammateIdle") return "Teammate became idle";
  if (reason === "needs-input") return "Stopped and waiting for user input";
  if (reason === "blocked") return "Stopped because progress is blocked";
  if (reason === "cancelled") return "Stopped after cancellation or redirect";
  return limitText(eventMessage(event) || "Stopped and handed control back", 180);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const event = readEvent();
  const reason = inferReason(event);
  const agentName = limitText(inferAgentName(event), 48);
  const summary = inferSummary(event, reason);
  const ringScript = path.join(__dirname, "ring.js");
  const command = [
    process.execPath,
    ringScript,
    "--agent-name",
    agentName,
    "--summary",
    summary,
    "--reason",
    reason,
    "--mode",
    args.mode,
    "--intensity",
    args.intensity,
  ];

  if (args.dryRun) {
    console.log(JSON.stringify({
      event: event.hook_event_name,
      agent: agentName,
      reason,
      summary,
      command,
    }));
    return;
  }

  try {
    const child = spawn(command[0], command.slice(1), {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
  } catch (_error) {
    // Hooks must never block or fail the Agent response path.
  }

  if (args.output === "gemini") {
    console.log(JSON.stringify({ suppressOutput: true }));
  }
}

main();
