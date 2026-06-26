---
name: agent-doorbell
description: Ring a clear, non-blocking desktop or audio cue every time an Agent is about to stop and hand control back to the user. Always use before any final response, blocked response, approval or decision wait, planned checkpoint pause, cancellation handoff, or other response where the Agent will stop instead of continuing work. Also use when project instructions enable Agent stop reminders or "doorbell" behavior, or when the user wants reliable runtime stop hooks for automatic Agent stop reminders.
---

# Agent Doorbell

Use this skill to ring the user's attention back when an Agent stops working and hands control back, without stealing focus or interrupting their current activity.

## Core Rule

Ring once every time the Agent is about to stop and hand control back to the user. This includes final responses, blocked responses, explicit handoffs, questions, approval/permission waits, planned phase/checkpoint pauses, cancellations, and tiny clarification stops. Do not ring during normal progress updates while the Agent will continue working. Keep the cue obvious and attributable, but non-blocking.

When a runtime lifecycle hook is installed for the current Agent surface, let the hook own stop reminders and do not also run the manual helper for the same stop event. If hook ownership is unknown or unavailable, use the manual workflow below.

## Stop Boundary Cheatsheet

| Situation | Ring? | Reason |
| --- | --- | --- |
| Requested work is complete and the Agent will stop | Yes | `done` |
| A planned phase/checkpoint is complete and the Agent waits for "continue" | Yes | `needs-input` |
| The Agent asks for approval, permission, credentials, or a decision needed to start or continue the requested task | Yes | `needs-input` |
| The Agent is blocked by an external issue and cannot proceed | Yes | `blocked` |
| The user cancels or redirects after work has started | Yes | `cancelled` |
| The Agent moves from one internal checklist item to the next and keeps working | No | none |
| The Agent asks a tiny clarifying question and then stops for the answer | Yes | `needs-input` |
| The user forbids sounds, notifications, tools, or shell commands for this turn | Skip the helper; use only allowed fallback behavior | none |

## Doorbell Contract

Every cue should include:

- Agent: the name or best available identity of the Agent that stopped.
- Stop reason: done, blocked, cancelled, or needs-input.
- Summary: a short human-readable note about what the Agent stopped on.
- Channel: desktop notification, generated tone pattern, system sound fallback, or a combination, depending on what the environment supports.

Do not include secrets, private identifiers, raw logs, or large output in the cue.

## Stop Workflow

1. Decide whether this stop is doorbell-worthy.
   - Ring before every response where the Agent will stop and wait for the user, regardless of task size.
   - Ring when a planned phase/checkpoint is completed and the Agent will not continue until the user says "continue", even if the overall task is not complete. Treat this as `needs-input`, not as an internal progress update.
   - Ring when the Agent stops to request approval, permission, credentials, a choice, or other user action needed to start or continue the requested task. Treat this as `needs-input`.
   - Do not ring for internal checklist progress when the Agent continues working without waiting for the user.
   - Ring at most once for the same stop event. Do not ring once for a question and again for the final text that asks the same question.
   - If project or user instructions say a runtime stop hook is installed and owns doorbells, skip the manual helper for final responses so the cue does not fire twice.
2. Choose an Agent name.
   - Prefer an explicit name from the user or thread.
   - Otherwise use the current Agent surface, role, or a concise fallback such as `Agent`.
3. Choose a stop reason.
   - `done`: requested work is complete, or this response ends the current run without waiting for user input.
   - `blocked`: the Agent cannot proceed without external change or permission.
   - `cancelled`: the user stopped or redirected the task.
   - `needs-input`: the Agent is stopping to wait for the user, including clarification questions, completed phase/checkpoint pauses, or approval/permission/choice requests needed to start or continue the requested task.
4. Run an available helper script before the final response when local shell access is available. Prefer the portable Python helper when Python is available:

```bash
python scripts/ring.py --agent-name "Agent" --summary "Stopped after finishing the requested work" --reason done --mode both
```

Use the PowerShell helper on Windows when that is the available shell:

```powershell
.\scripts\ring.ps1 -AgentName "Agent" -Summary "Stopped after finishing the requested work" -Reason done -Mode both
```

Resolve helper paths relative to this `SKILL.md`. If neither helper can run, use the local operating system's non-blocking notification mechanism with the same Agent, reason, and summary fields.

5. Continue even if the cue fails. Report the failure briefly in the final response only when it matters.

## User Experience Rules

- Prefer a desktop notification plus a short generated tone pattern.
- Use distinct patterns for different stop reasons: `done` should sound like a light two-note doorbell, `needs-input` like a short attention pattern, `blocked` like a more obvious warning, and `cancelled` like a descending stop cue.
- Do not open a browser, terminal window, modal dialog, or foreground app just to notify.
- Do not steal keyboard or mouse focus.
- Do not loop sounds indefinitely.
- Keep sound short; use a louder pattern only when the user explicitly wants stronger reminders.
- Fall back to system sounds if generated tones are unavailable.
- Keep text short enough to scan from a distance.
- Respect explicit turn-level constraints. If the user says not to use tools, shell commands, sounds, desktop notifications, or doorbells for the turn, do not run a helper.

## Runtime Hook Setup

Use a runtime hook when the user wants every stop event to be automatic instead of depending on the Agent remembering to call this skill. Prefer local user or project-local hook settings, because hook commands usually contain machine-local executable and skill paths.

For Claude Code, run the installer from this skill directory. Start with a dry run:

```bash
python scripts/install-claude-hook.py --dry-run --scope user
```

Install for all local Claude Code projects on this machine:

```bash
python scripts/install-claude-hook.py --scope user
```

Install only for the current project on this machine:

```bash
python scripts/install-claude-hook.py --scope project-local --project-root .
```

Remove the installed Agent Doorbell hooks:

```bash
python scripts/install-claude-hook.py --scope user --remove
```

By default the installer configures async command hooks for `Stop`, `StopFailure`, `SubagentStop`, `TeammateIdle`, `PermissionRequest`, and `Elicitation`. Narrow the event list when a surface is too noisy:

```bash
python scripts/install-claude-hook.py --scope user --events Stop,StopFailure,PermissionRequest
```

Use settings-based hooks for guaranteed stop reminders. Do not rely on skill or subagent frontmatter hooks for this behavior, because those hooks are active only while that skill or subagent component is active.

For other Agent runtimes, configure the equivalent stop/finalize/permission-wait lifecycle event to call either:

```bash
python scripts/hook-runner.py --mode both
```

with the runtime event JSON on stdin, or call `scripts/ring.py` directly if the runtime cannot pass event JSON.

## Enablement Snippet

If the user wants doorbells to happen automatically in a project, offer to add a small project entrypoint rule like this:

```md
## Agent Doorbell

- Every time an Agent is about to stop and hand control back to the user, use `agent-doorbell` to send a non-blocking cue naming the Agent and stop reason.
- If a runtime stop hook is installed and owns doorbells for this Agent surface, let the hook send the cue and do not manually ring again for the same stop event.
- If a planned phase/checkpoint is complete and the Agent will wait for the user to say "continue", ring once and use `needs-input`.
- If the Agent stops to ask for approval, permission, or a decision needed to start or continue the requested task, ring once and use `needs-input`.
- Do not ring for internal checklist progress when the Agent continues working without waiting.
- Respect explicit turn-level requests for silence, no notifications, or no tool/shell use.
- Prefer desktop notification plus a short generated tone pattern when available.
- Do not open windows, steal focus, loop sounds, or include secrets in the cue.
```

This snippet enables the behavior for future Agent stops; it is not consent to ring during every tiny conversational reply.

## Verification

For test commands and expected behavior, see `references/verification.md`.
