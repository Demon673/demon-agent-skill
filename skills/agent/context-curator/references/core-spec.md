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

`INDEX.md` is the entry point. Other files contain the durable context body. Do not require platform entry files such as `AGENTS.md` to point to `context-curator/INDEX.md`. Add a neutral pointer only when the user explicitly wants non-skill-aware agents to discover the context store. Never duplicate durable context in an agent entrypoint.

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
