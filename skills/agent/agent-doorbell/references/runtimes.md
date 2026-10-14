# Doorbell runtime adapters

Load this reference when choosing a runtime or changing event coverage. Use the selected runtime's documented hook schema; registering an event in another runtime's spelling does not make it fire. The runners emit main-agent reminders only, never approval decisions or instructions to continue an agent loop. Shared attention events are enabled only where the runtime documents child identity; other adapters expose completion events.

## Claude Code

[The hook reference](https://code.claude.com/docs/en/hooks) distinguishes the following events, all registered by the default installer:

| Event | Reminder | Meaning |
| --- | --- | --- |
| `Stop` | `done` | The main agent finishes responding; user interruption does not trigger it. |
| `StopFailure` | `failed` | An API error stops the response. This is not a documented catch-all event for child-process crashes. |
| `Elicitation` | `needs-input` | An MCP server requests form or URL input; ordinary questions in assistant text are not covered. |
| `PermissionRequest` | `approval` | Tool execution needs approval. Sandbox network approval is handled through notifications instead. |
| `Notification` | `needs-input` | Only the installed attention matcher below. |

[Common input fields](https://code.claude.com/docs/en/hooks#common-input-fields) define `agent_id` as the subagent or in-process teammate identifier. The runners suppress any payload carrying a nonempty `agent_id`; `agent_type` alone is allowed because a main session started with `--agent` can set it. Shared `PermissionRequest`, `Elicitation` and `Notification` calls require a valid JSON object. Missing or malformed shared-event input stays silent. PowerShell and Node use their built-in JSON parsers; POSIX uses `jq`. Without `jq`, the POSIX runner suppresses shared attention events and retains completion reminders.

The notification matcher is `permission_prompt|idle_prompt|elicitation_dialog|elicitation_url_dialog`. It excludes `agent_needs_input`, authentication success and routine notices. `SubagentStop`, `TeammateIdle` and `TaskCompleted` describe internal progress and are never installed as reminders; runners ignore these event names even when stale settings invoke them.

Permission or elicitation hooks can overlap with delayed notifications. Use `--events Elicitation,PermissionRequest,Stop,StopFailure` to omit delayed reminders. Older versions may lack newer events; select events supported by the installed version.

The current contract supports direct executable `command` plus `args`. Command hooks may run asynchronously, but async hooks cannot decide permissions, block completion or return agent instructions. The native runner starts playback separately and exits with no decision output. Non-interactive shutdown can terminate pending async hooks. Native notifications identify the main-agent event category.

Updating source alone does not add hooks to an existing installation. Preview and run the installer against the chosen settings scope after the source or installed skill has been updated. Updating hook settings is separate from installing the skill pack.

## Gemini CLI

[Gemini's hook reference](https://geminicli.com/docs/hooks/reference/) documents eleven events, including `AfterAgent` and `Notification`, but no independent `SubagentStop` or agent-failure event. The adapter registers `AfterAgent` for a completed response turn. It excludes the documented tool-permission `Notification` because that payload does not identify the emitting agent. The reference does not fully specify hook behavior inside children; verify deployed-version delivery if it differs from the documented turn lifecycle.

Hooks use a command string and a timeout in milliseconds. The runner emits only `{}` with exit code zero. It does not approve a tool, suppress a runtime notification, block a response or retry the agent.

[Subagents](https://geminicli.com/docs/core/subagents/) are invoked through tools bearing their agent names. Their tool completions stay silent; do not bridge `AfterTool` to a reminder for internal agent work.

## Codex

[Codex hooks](https://learn.chatgpt.com/docs/hooks) document main `Stop`, child `SubagentStop`, and `PermissionRequest`. The adapter registers `Stop` only. `SubagentStop` stays silent, and shared `PermissionRequest` is excluded because its documented payload does not identify the emitting agent. Its documented event set has no separate `Notification` or `StopFailure`, and stop payloads do not identify failure status. This adapter does not infer missing input or failure events from assistant prose.

The grouped command-hook schema uses seconds for timeout. User scope targets `~/.codex/hooks.json`; project scope targets `.codex/hooks.json`. Hooks are enabled by default in current Codex, but `[features] hooks = false` disables them and managed-only policy excludes user definitions. After installation, review unmanaged definitions in `/hooks` before they can execute; updating their contents can require review again. A correctly written JSON file alone does not establish that the runtime has enabled it.

## Copilot CLI

[Copilot's hook reference](https://docs.github.com/en/copilot/reference/hooks-reference) documents main and child completion, errors, permission requests and notifications. The adapter registers main-turn `agentStop` only; `subagentStop` stays silent. Shared `errorOccurred`, `permissionRequest` and `notification` payloads do not document an agent identity, so the adapter excludes them rather than ringing for child activity.

The adapter writes version-1 flat event arrays with direct `exec` and `args`; `timeoutSec` is in seconds. User scope writes `<COPILOT_HOME>/hooks/agent-doorbell.json` when that variable is set, otherwise `~/.copilot/hooks/agent-doorbell.json`. Project scope writes `.github/hooks/agent-doorbell.json`. Unrelated entries and files are preserved. The native Windows runner uses PowerShell, and macOS/Linux uses `/bin/sh`.

These executable-form hooks are supported by Copilot CLI, not the cloud agent. Cloud hooks use shell command fields and do not deliver the CLI notification event. Select this adapter for the CLI only; a project hook file should not be advertised as a portable cloud configuration. Hook stdout stays empty so it cannot insert context or restart an idle agent.

## Cursor

[Cursor hooks](https://cursor.com/docs/hooks) use version-1 flat event arrays in `~/.cursor/hooks.json` or project `.cursor/hooks.json`. This adapter registers main `stop` only, with timeout in seconds; `subagentStop` stays silent. The main payload has `status`: `completed` maps to `done`, `error` to `failed`, and `aborted` to silent `cancelled`. It does not register `afterAgentResponse`, which is a message event rather than a completed turn, or invent permission and input hooks.

Use the Node installer with the user's explicit `--runner node` choice. Node parses the status payload and launches the existing platform playback helper; the installer refuses implicit native installation instead of mislabelling failed main turns as successes. The runner always returns neutral `{}`, including aborted runs, and never emits `followup_message` to continue the agent. Windows command-string execution still needs real Cursor acceptance; local shell replay is not evidence of Cursor's delivery.

## Other runtimes

[OpenCode plugins](https://docs.opencode.ai/docs/plugins/) provide `session.idle`, `session.error` and permission events through JavaScript/TypeScript plugins, not this JSON hook schema. Supporting it requires an explicitly scoped plugin integration; writing an invented hooks file would not receive those events. For other runtimes, inspect their documented lifecycle interface and output rules before connecting the runner. If no such interface is documented, report the coverage limit instead of claiming automatic reminders.

## Coverage limits

| Runtime | Main completion | Input / approval | Main failure |
| --- | --- | --- | --- |
| Claude Code | `Stop` | Elicitation, permission and filtered attention | `StopFailure` |
| Codex | `Stop` | Excluded: no emitting-agent identity | No separate documented failure hook |
| Gemini CLI | `AfterAgent` | Excluded: no emitting-agent identity | No dedicated agent-failure event |
| Copilot CLI | `agentStop` | Excluded: no emitting-agent identity | Shared errors excluded |
| Cursor | `stop` | No equivalent adapter events | Stop payload `status: error` |
| OpenCode | Plugin integration needed | Plugin-specific | Plugin integration needed |

Child, teammate and intermediate task reminders are excluded across adapters.
