# Context Curator Index

This directory stores reusable context managed by the `context-curator` skill.

- `FACTS.md`: Durable workspace facts, environment notes, important paths, commands, constraints, and known setup traps.
- `DECISIONS.md`: Confirmed decisions, rationale, rejected alternatives, and status.
- `FLOWS.md`: Repeatable Agent workflows with triggers, steps, checks, approval points, and done criteria.
- `PREFS.md`: Workspace-local user preferences and defaults.
- `SESSION.md`: Current task state summary for short-term continuity.
- `SUMMARIES.md`: Stage-level compressed summaries that remain useful after the current task ends.

When restoring context, read this file first, then read only the files relevant to the current task.
