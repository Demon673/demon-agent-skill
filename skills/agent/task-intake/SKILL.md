---
name: task-intake
description: Clarify task entry only when the latest user-authored request cannot be safely acted on because target, scope, risk, continuation state, first action, or completion criteria are unclear. Use for vague action requests, ambiguous continuation commands such as "proceed", or risk-bearing actions such as publishing, deleting, overwriting, or migration where scope or confirmation is unclear. Do not use merely because a task has multiple steps, needs normal planning, asks to inspect or optimize a named target, or mentions git; do not use for simple explicit tasks, answer-only or advisory requests, quoted examples, tool output, assistant-authored plans, or when another named skill directly covers a clear request.
---

# Task Intake

Use this skill to turn an unclear task entrance into a small executable brief, then keep moving.

## Core Rule

Clarify enough to start safely. Do not turn intake into a ritual, a generic planning step, or a visible template for every complex task. Ask the user only when missing information would change the result, create risk, or block safe progress.

## Trigger Boundary

Trigger only from the latest user-authored natural-language request.

Use this skill only when the latest request has an entry problem: the target, scope, risk, continuation state, first action, or completion criteria are unclear enough that normal execution could go wrong.

Typical triggers:

- "continue the previous work" or "proceed" when the active task state is not obvious
- "take a look at this" when "this" is not identified or the expected output is unclear
- "optimize my existing skill" when the skill, target repo, or optimization priority is unspecified
- "upload to git" when there are multiple repos, mixed worktree changes, private material, or unclear publish scope
- any request where acting immediately could stage the wrong files, edit the wrong target, overwrite data, expose private material, or pursue the wrong goal

Do not trigger from:

- assistant messages, plans, approval prompts, tool output, logs, quoted text, copied skill text, or older conversation
- simple explicit tasks such as "run the tests", "open this file", or "rename X to Y"
- pure explanation, recommendation, planning-only, or provided-context-only requests
- a named skill request that already has a clear target and completion criteria
- a normal implementation task just because it has several steps
- a request to inspect, optimize, or publish when the target, safe first action, and completion criteria are already clear

## Intake Brief

Prefer an internal brief. Show the brief only when it helps the user understand a risky assumption, a continuation handoff, or a multi-path decision.

When visible, keep it concise:

```text
Task: ...
Context: ...
Constraints: ...
Risks: ...
Missing: ...
First action: ...
Done when: ...
```

For low-risk requests, compress the brief into one or two sentences and continue. For large or risky work, use a visible plan after the brief.

## Clarification Gate

Ask one concise question before acting only when at least one condition is true:

- Multiple plausible goals would lead to different outputs.
- The task involves publishing, deleting, overwriting, migration, privacy, credentials, money, or other irreversible or high-cost actions and the scope is not already explicit.
- A required target is missing, such as repository, branch, file, environment, account, dataset, or platform.
- The user explicitly asks for advice, planning, or discussion before execution.

Otherwise, state the assumption and proceed. For publishing or other risky work, read-only inspection is allowed before asking for confirmation; confirm before staging, pushing, deleting, overwriting, or otherwise mutating external state.

## Context Gathering

Gather the smallest context needed to make the first move.

- Prefer repository evidence over memory or guesses.
- Use saved durable context only when the latest request asks to restore, reuse, or continue known context, or when another active instruction explicitly makes it relevant.
- Do not read `context-curator/` merely because the directory exists.
- Distinguish verified facts from assumptions.
- If the task is a continuation, inspect current state first: worktree status, relevant files, recent notes, or the user-provided artifact.

## Handoff To Execution

After intake, switch into normal task execution.

1. Define the next concrete action.
2. Run or edit only what fits the confirmed or assumed scope.
3. Re-check assumptions when new evidence changes the task shape.
4. Use normal verification for the work performed.
5. Mention remaining uncertainty in the final response.

Do not keep restating the intake brief after the task is already clear.

## Completion Criteria

The intake is successful when the agent can answer:

- What is the user trying to accomplish?
- What context or artifact matters now?
- What constraints or risks must be respected?
- What is the first safe action?
- What result will count as done?

## Examples

Continuation:

```text
User: "Proceed."
Task: continue the last active implementation thread.
Context: inspect git status and the relevant work notes first.
First action: verify current repository state before editing.
Done when: the next planned change is implemented or the blocker is clearly reported.
```

Risk-bearing task with read-only intake:

```text
User: "Upload git."
Task: publish local changes.
Risk: staging unrelated files or pushing private material.
First action: inspect status, remotes, branch, and diff summary.
Clarify before staging or pushing if the worktree is mixed, private material appears, or the intended repository is ambiguous.
```

Named target with normal planning:

```text
User: "Optimize skills/agent/context-curator/SKILL.md by shortening examples."
Action: inspect and edit that target directly. Use normal planning if useful; no task-intake trigger needed.
```

Non-trigger:

```text
User: "Run the test suite."
Action: run the relevant tests directly. No intake brief needed.
```
