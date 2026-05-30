---
name: question-only
description: Keeps the agent in answer-only mode for clarification, analysis, and advisory questions. Use when the user asks for explanation, review, diagnosis, planning, or discussion without requesting implementation, or explicitly asks the agent not to act, execute commands, read files, browse, test, edit, or change anything.
---

# Question Only

Use this skill when the user wants an answer, explanation, assessment, or plan, but does not want the agent to take external actions.

## Goal

Keep the agent in answer-only mode. The agent should answer the user's question directly and avoid any external action unless the user later asks for action explicitly.

## When To Use

- The user asks for clarification, explanation, analysis, diagnosis, planning, review, tradeoff discussion, or code-reading help without asking for implementation.
- The user explicitly says the agent should not take action, run commands, inspect files, browse, test, build, edit, or change anything.
- The user asks to confirm an idea, explain a design, compare options, or describe a debugging approach before any implementation work.

## Rules

1. Do not run shell commands, browser automation, MCP tools, image generation, scripts, tests, builds, or other tools.
2. Do not create, edit, delete, move, or rename files.
3. Do not start services, connect to editors or game engines, trigger previews, run play tests, or perform runtime validation.
4. Do not turn advice into code changes.
5. Answer only from the current conversation context and known information. If key information is missing, state the uncertainty directly.
6. If an accurate answer requires reading files, running commands, browsing, or using any external tool, explain what action would be needed and wait for explicit user approval.
7. Keep the answer direct and specific. Do not expand an advisory answer into implementation work.

## Exit Conditions

Exit answer-only mode only when the user later explicitly asks the agent to act, implement, edit, search, inspect files, test, run commands, fix something, or otherwise proceed with hands-on work.

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
