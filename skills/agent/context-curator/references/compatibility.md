# Context Curator Compatibility

Use this guide to adapt `context-curator` to common Agent environments. No Agent runtime is assumed to support every feature automatically.

## General Rule

If an Agent cannot load skills automatically and the user wants it to reuse the context store, give it this instruction:

```text
Use the context-curator protocol. First read context-curator/INDEX.md if this project entrypoint tells you to, or when the current task asks to restore or reuse durable context. Then read only the relevant files under context-curator/. Before saving durable context, propose the exact record, destination, and reason, then ask for confirmation with choices such as save all, save selected IDs, rewrite then save, change destination, or do not save.
```

## Codex And Skills-Compatible Agents

- Use `SKILL.md` as the trigger and workflow entry.
- Keep trigger conditions in the frontmatter `description`.
- Use `references/core-spec.md` only when adapting or auditing behavior.
- Use structured choice UI when the runtime provides it; otherwise use the numbered text menu from `SKILL.md`.
- If the Agent supports workspace files, write durable context under `context-curator/`.

## Claude Code Style Repositories

- Prefer not to add `AGENTS.md` or `CLAUDE.md` pointers by default. When the user wants non-skill-aware agents to discover durable context automatically, offer to add a neutral pointer.

- If a pointer is requested, keep it neutral:

```md
## Reusable Context

- Durable workspace context lives under `context-curator/`.
- At task start, read `context-curator/INDEX.md` if it exists, then read only context files relevant to the current task.
- Do not write durable context without explicit user confirmation.
```

- Keep durable records under `context-curator/`, not inside the agent instruction file.
- Do not phrase the pointer as a skill invocation; it is a context discovery rule, not a skill trigger.

## Cursor, Copilot, And IDE Agents

- Prefer a visible project directory: `context-curator/`.
- Add a short pointer in the IDE's project rules file when the user wants that IDE Agent to discover durable context automatically.
- Ask the Agent to report which context files it read before acting on durable context.

## Agents Without File Write Access

- Use the protocol in memory or chat only.
- Ask the user to approve the proposed record through the same structured choices.
- Return the exact markdown block and destination path for the user or another tool to save.

## Agents With Cloud Memory

- Store cross-project defaults in memory only after explicit user confirmation.
- Store project facts, decisions, flows, and session summaries in workspace files when possible.
- Do not copy raw logs, secrets, or private identifiers into cloud memory.
