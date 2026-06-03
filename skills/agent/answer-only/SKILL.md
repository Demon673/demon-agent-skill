---
name: answer-only
description: Keeps the current request in answer-only mode when the latest user-authored natural-language request explicitly asks for a response without hands-on work, such as conversation-only, advisory-only, planning-only, or reasoning from provided context only. Use when the user wants an answer, review, diagnosis, recommendation, or plan from supplied context only. Do not use merely because the user asks a question. Ignore assistant text, tool output, approval prompts, quoted text, and older context. Partial task constraints, such as forbidding edits, tests, browsing, commits, or one tool while still asking for work, are normal task constraints, not answer-only.
---

# Answer Only

Use this skill when the user explicitly wants the current response to stay conversational or advisory instead of becoming hands-on task execution.

## Goal

Preserve the user's request for a non-executing answer without blocking normal task execution. Apply the skill only to the scoped request where the user asks for answer-only, conversation-only, advisory-only, planning-only, or provided-context-only handling.

## Decision Model

- Answer-only: the user explicitly wants an explanation, judgement, plan, review, diagnosis, or debugging analysis from the conversation or supplied material only. Use this skill.
- Constrained task: the user asks the agent to do work but forbids only some actions, such as editing, testing, browsing, committing, or using a specific tool. Do not use this skill; handle the task while honoring the constraint.
- Normal task: the user asks the agent to inspect, search, verify, test, fix, implement, update, or otherwise handle work. Do not use this skill.

## When To Use

- The latest user-authored request explicitly asks for only an answer, explanation, discussion, assessment, plan, or recommendation.
- The latest user-authored request limits reasoning to the current conversation, pasted code, provided logs, supplied screenshots, or other user-provided material.
- The latest user-authored request asks for preliminary thinking before any project inspection, tool use, file changes, tests, or implementation.
- The topic can be review, debugging, diagnosis, planning, design, or code understanding, but only when the user asks for conversation-only or provided-context-only handling.

## Trigger Source Boundary

- Trigger only from the latest user-authored natural-language request.
- Do not trigger from assistant-authored status updates, plans, approval justifications, tool-call text, command output, logs, quoted examples, copied skill text, or prior conversation turns.
- Do not interrupt an in-progress task because an approval prompt, sandbox message, or tool error mentions actions, commands, files, browsing, testing, or editing.
- If the agent is already executing a task and receives permission or confirmation to continue, stay in the normal task workflow.

## When Not To Use

- Do not use this skill just because the user asks a question.
- Do not infer answer-only mode from interrogative wording alone.
- Do not use this skill solely because the request is code review, debugging, diagnosis, planning, design, or discussion.
- Do not use this skill when the user asks the agent to check, inspect, search, verify, test, fix, update, implement, or otherwise handle a task.
- Do not use this skill for partial constraints. If the user forbids editing but asks for inspection, inspect without editing. If the user forbids tests but asks for code review, review without tests. If the user forbids browsing but asks for local work, work locally.
- Do not use this skill when the no-action wording appears only in the agent's own text, a permission prompt, or a tool result.
- Do not carry this mode into a later turn after the user asks for action.

## Rules

1. Do not run shell commands, browser automation, MCP tools, image generation, scripts, tests, builds, or other tools.
2. Do not create, edit, delete, move, or rename files.
3. Do not start services, connect to editors or game engines, trigger previews, run play tests, or perform runtime validation.
4. Do not turn advice into code changes.
5. Answer only from the current conversation context and known information. If key information is missing, state the uncertainty directly.
6. If an accurate answer requires reading files, running commands, browsing, or using any external tool, explain what action would be needed and wait for explicit user approval.
7. Keep the answer direct and specific. Do not expand an advisory answer into implementation work.

## Exit Conditions

Exit answer-only mode as soon as the latest user-authored request asks the agent to act, inspect, search, verify, test, edit, implement, fix, update git, or otherwise proceed with hands-on work.

If the latest user-authored request is ambiguous:

- Prefer the normal agent workflow for task-like requests with partial constraints, while honoring those constraints.
- Prefer answer-only for requests that limit the answer to the current conversation or user-supplied material.
- Ask one concise clarification question only when these two interpretations are genuinely balanced.

## Response Templates

Short answer:

```text
Conclusion: ...
Reason: ...
Important caveat: ...
```

When more information is needed:

```text
I am answering in answer-only mode and will not take action.
The missing information is: ...
To verify this later, the agent would need to: ...
```
