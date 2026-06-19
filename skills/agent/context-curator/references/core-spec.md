# Context Curator Core Spec

This is the platform-neutral behavior contract for the `context-curator` skill. Use it when an Agent does not support `SKILL.md` directly, or when adapting the workflow to another runtime.

## Purpose

Turn useful conversation context into durable, user-confirmed records without saving noise, secrets, or unverified assumptions.

## Operating Loop

1. Detect reusable context candidates.
2. Classify each candidate as Temporary, Preference, Fact, Decision, Flow, Learning record, Session, or Summary.
3. Reject unsafe, vague, one-off, or low-reuse candidates.
4. Rewrite accepted candidates into concise durable records.
5. Ask the user to confirm the exact wording and destination.
6. Save only confirmed records.
7. Read the smallest relevant context set on future tasks.
8. Update, supersede, compress, or delete context when it becomes stale.

## Detection Rule

Detect candidates from both explicit context-management requests and implicit durable guidance. Explicit requests include remember, save, collect, organize, update, forget, restore, compress, or reuse context. Implicit durable guidance includes future-facing instructions such as stable defaults, project conventions, repeated workflow rules, "next time" instructions, "from now on" instructions, and "do not do this again" corrections. Treat casual future-facing wording as trigger-worthy, including "going forward", "always", "by default", "next time", "以后", "后续", "之后", "默认", "一直", "每次", "下次", "不要再", and similar phrases.

Detection is not permission to save. Always ask for confirmation before writing durable context.

## Confirmation Protocol

Before saving, present candidates through a structured confirmation interface when available, or a numbered text menu otherwise. The protocol is platform-neutral; UI buttons, CLI prompts, and plain chat menus should carry the same information and choices.

Each candidate must include an ID, type, exact record text, destination, and reason. Supported choices are:

- save all
- save selected IDs
- rewrite then save
- change destination
- do not save

Ambiguous approval such as "ok" after a broad discussion is not enough to save. Save only when the user clearly chooses a save action, names candidate IDs, provides replacement wording, or directly asks to remember/save/write/update/delete a specific record.

## Storage Layout

Use a skill-owned directory at the workspace root:

```text
context-curator/
  INDEX.md
  FACTS.md
  DECISIONS.md
  FLOWS.md
  PREFS.md
  SESSION.md
  SUMMARIES.md
```

`INDEX.md` is the context-store entry point. Other files contain the durable context body. Do not require platform entry files such as `AGENTS.md` to point to `context-curator/INDEX.md` by default. When the user wants non-skill-aware agents to discover durable context automatically, offer to add a neutral entrypoint pointer that tells agents to read `context-curator/INDEX.md` as routing metadata and then read only task-relevant context files. Never duplicate durable context in an agent entrypoint.

Suggested entrypoint pointer:

```md
## Reusable Context

- Durable workspace context lives under `context-curator/`.
- At task start, read `context-curator/INDEX.md` if it exists, then read only context files relevant to the current task.
- Do not write durable context without explicit user confirmation.
```

## Record Shape

```md
- Statement: The durable fact, preference, decision, or flow rule.
  Scope: global | project | learning | current-workspace
  Source: user-confirmed YYYY-MM-DD, or file/path if derived from repo evidence
  Status: active | stale | superseded
  Applies when: concrete trigger or situation
  Does not apply when: known exception, if any
```

## Compression Rule

Save distilled lessons, not raw material. `SESSION.md` preserves current-task continuity. `SUMMARIES.md` preserves stage-level context that remains useful after the task ends.

Compression must preserve goals, active preferences, decisions, rationale, durable constraints, verified facts, evidence pointers, open risks, exceptions, and next actions.

## Field-Test Rule

Treat real use as the main validation path. Improve the skill only when a repeated failure pattern appears: missed useful context, noisy context capture, unsafe capture, stale reuse, wrong destination, or poor compression. Prefer the smallest rule, example, or verification update that prevents the failure from recurring.

## Conflict Rule

Follow the newest explicit user instruction first. Saved context is advisory unless it is also required by current task constraints, repository instructions, or safety rules.

## Teaching Boundary

Use teaching workspace files only for learning-track context: mission, glossary, resources, and learning records. Use `context-curator/` for ordinary workspace facts, decisions, flows, preferences, sessions, and summaries, even when the current topic is Agent skills.
