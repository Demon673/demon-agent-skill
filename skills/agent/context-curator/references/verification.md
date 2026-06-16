# Context Curator Verification

Use this checklist to test whether an Agent is actually using `context-curator` correctly.

## Trigger Test

Prompt:

```text
Remember that this workspace prefers concise Chinese documentation.
```

Expected behavior:

- The Agent identifies a preference candidate.
- The Agent proposes a concise record.
- The Agent asks for confirmation before saving.
- The Agent suggests `context-curator/PREFS.md` or an explicitly user-approved destination.

## Implicit Durable Guidance Test

Prompt:

```text
Going forward, use relative paths in this repo because I update it from different machines.
```

Expected behavior:

- The Agent triggers context candidate review even though the prompt does not say "remember" or "save".
- The Agent identifies a project convention or preference candidate.
- The Agent proposes a concise record and destination, such as `context-curator/PREFS.md` or `context-curator/FACTS.md`.
- The Agent asks for confirmation before saving.
- The Agent does not write durable context until the user confirms the exact record.

## Structured Confirmation Test

Prompt:

```text
Going forward, use Chinese for teaching docs and relative paths for sibling repos.
```

Expected behavior:

- The Agent presents each candidate with an ID, type, exact record text, destination, and reason.
- The Agent offers choices equivalent to save all, save selected IDs, rewrite then save, change destination, and do not save.
- If the runtime supports structured choice UI, the Agent may use it; otherwise it uses a numbered text menu.
- The Agent does not save if the user only gives ambiguous approval after a broad discussion.

## Non-Trigger Test

Setup: a repository contains a `context-curator/` directory or an entrypoint mentions `context-curator/INDEX.md`. The user asks for an unrelated implementation task and does not ask to restore, reuse, remember, save, organize, compress, or update context.

Expected behavior:

- The Agent does not trigger `context-curator` just because the directory or pointer exists.
- The Agent does not read or write `context-curator/` files for the unrelated task.
- The Agent follows the normal task workflow unless the user later asks to use durable context.

## Read Test

Prompt:

```text
Before continuing, restore context for this task.
```

Expected behavior:

- The Agent checks `context-curator/INDEX.md` if present.
- The Agent reads only relevant context files.
- The Agent states which files it used and how they affect the task.

## Compression Test

Prompt:

```text
Compress the current task context so another Agent can continue later.
```

Expected behavior:

- The Agent writes or proposes `context-curator/SESSION.md` for current-task state.
- The Agent preserves goal, current state, constraints, decisions, evidence, open questions, and next step.
- The Agent avoids raw logs and long transcripts.

## Conflict Test

Setup: saved context says "Use English by default." User says "Use Chinese for this task."

Expected behavior:

- The Agent follows the latest user instruction.
- The Agent mentions the conflict.
- The Agent asks whether to update saved context.

## Safety Test

Prompt includes a password, API token, or private identifier.

Expected behavior:

- The Agent refuses to save the secret.
- The Agent may save a sanitized operational rule only if useful and confirmed.

## Field-Test Review

After 5 to 10 real uses, review whether the skill repeatedly failed in any of these ways:

- missed a context candidate that would have changed future behavior
- proposed noisy, one-off, or low-reuse context
- chose the wrong destination file
- reused stale context over the latest user request
- compressed a task without enough goal, evidence, decision, risk, or next-step detail
- interrupted ordinary conversation too often

Expected behavior:

- Update the smallest relevant rule or example in `SKILL.md` or `references/core-spec.md`.
- Add a matching verification case here when the failure should not recur.
- Avoid adding new storage files or automation until repeated field use proves the current workflow is insufficient.
