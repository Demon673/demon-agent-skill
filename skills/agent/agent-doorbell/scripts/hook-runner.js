#!/usr/bin/env node
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const REASON_BY_EVENT = {
  AfterAgent: "done",
  Elicitation: "needs-input",
  Notification: "needs-input",
  PermissionRequest: "approval",
  StopFailure: "failed",
  Stop: "done",
  agentStop: "done",
  stop: "done",
  errorOccurred: "failed",
  permissionRequest: "approval",
  notification: "needs-input",
};

function parseArgs(argv) {
  const args = { mode: "both", intensity: "normal", output: "none", dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === "--event") {
      args.event = value;
      index += 1;
    } else if (arg === "--reason") {
      args.reason = value;
      index += 1;
    } else if (arg === "--mode") {
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
    return null;
  }
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
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
  if (event.hook_event_name === "stop") {
    if (event.status === "error") return "failed";
    if (event.status === "aborted") return "cancelled";
  }
  return REASON_BY_EVENT[event.hook_event_name] || "done";
}

function inferSummary(event, reason) {
  const eventName = event.hook_event_name || "Agent stop";
  if (eventName === "AfterAgent") return limitText(eventMessage(event) || "Agent finished responding", 180);
  if (eventName === "Notification") return limitText(eventMessage(event) || "Agent notification needs attention", 180);
  if (eventName === "PermissionRequest") return limitText(`Waiting for permission to use ${event.tool_name || "tool"}`, 180);
  if (eventName === "Elicitation") return limitText(`Waiting for ${event.message || "external input"}`, 180);
  if (eventName === "StopFailure") return limitText(`Stopped because of ${event.error || "error"}`, 180);
  if (reason === "needs-input") return "Stopped and waiting for user input";
  if (reason === "blocked") return "Stopped because progress is blocked";
  if (reason === "cancelled") return "Stopped after cancellation or redirect";
  return limitText(eventMessage(event) || "Stopped and handed control back", 180);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const payload = readEvent();
  const valid = payload && !Array.isArray(payload) && typeof payload === "object";
  const input = valid ? payload : {};
  const event = { ...input, hook_event_name: args.event || input.hook_event_name || input.hookEventName };
  if (/^(SubagentStart|SubagentStop|TeammateIdle|TaskCreated|TaskCompleted)$/i.test(event.hook_event_name)
      || event.agent_id || ["agent_needs_input", "agent_completed"].includes(event.notification_type)
      || (/^(PermissionRequest|Elicitation|Notification|errorOccurred)$/i.test(event.hook_event_name) && !valid)) {
    if (args.dryRun) console.log(JSON.stringify({ event: event.hook_event_name, skipped: true }));
    else if (args.output === "gemini" || args.output === "cursor") console.log("{}");
    return;
  }
  const reason = args.output === "cursor" ? inferReason(event) : args.reason || inferReason(event);
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

  if (args.mode !== "none" && reason !== "cancelled") try {
    const child = spawn(command[0], command.slice(1), {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.on("error", () => {});
    child.unref();
  } catch (_error) {
    // Hooks must never block or fail the Agent response path.
  }

  if (args.output === "gemini" || args.output === "cursor") {
    console.log(JSON.stringify({}));
  }
}

main();
