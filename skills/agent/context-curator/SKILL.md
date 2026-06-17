---
name: context-curator
description: Curate reusable user, project, and learning context from conversation into durable records with explicit user confirmation. Use when the latest user request asks to remember, save, collect, organize, update, forget, restore, compress, or reuse context, preferences, decisions, workflows, project facts, or learning progress. Also use when the latest user request gives durable guidance for future turns, defaults, project conventions, repeated workflows, corrections, or cross-session continuity; trigger on phrases like going forward, from now on, next time, always, by default, do not do this again, 以后, 后续, 之后, 默认, 一直, 每次, 下次, 不要再, or 这个项目以后.
---

# Context Curator

Use this skill to turn daily conversation into reliable reusable context without saving noise, secrets, or unconfirmed assumptions.

## Core Rule

Never write durable context from ordinary conversation without explicit user confirmation. Detect candidates proactively when the latest user request either asks for context management or gives durable future-facing guidance that appears meant to affect later turns, sessions, projects, or learning. Casual phrasing still counts when it changes future behavior: "next time", "always", "by default", "do not do this again", "以后", "后续", "默认", "下次", and similar wording are trigger-worthy. Candidate detection is not consent to save: propose the exact record and ask for confirmation before writing. Do not infer consent or trigger this skill from the existence of a `context-curator/` directory, from older conversation alone, or from an entrypoint pointer alone.

## Context Types

- Temporary: applies only to the current turn or task. Do not save.
- Preference: a stable user style, default behavior, language, workflow preference, or risk tolerance.
- Fact: a durable fact about a repo, workspace, product, domain, environment, or current initiative.
- Decision: a confirmed choice, tradeoff, or policy and the reason it was chosen.
- Flow: a repeatable process the user wants the agent to follow again.
- Learning record: evidence that the user learned or already knows something that should steer future teaching.

Use these exact type names when classifying candidates: Temporary, Preference, Fact, Decision, Flow, Learning record, Session, and Summary.

## Useful Context Signals

Useful context usually changes future behavior, prevents repeated explanation, or preserves a decision that would be costly to rediscover.

Prefer saving:

- stable user defaults: language, tone, verbosity, risk tolerance, implementation style, review style
- repeatable flows: triggers, steps, required checks, completion criteria, approval points
- facts: repo purpose, important paths, frameworks, local commands, environment quirks, generated files, ignored noise
- durable constraints: privacy boundaries, budget, platform, permissions, compatibility requirements
- decisions: chosen direction, rejected alternatives, rationale, owner, date if relevant
- domain language: canonical terms, aliases to avoid, project-specific meanings
- repeated failure patterns: common tool errors, diagnostic noise, known setup traps, workaround policy
- learning state: prior knowledge, demonstrated understanding, corrected misconceptions, current learning mission

Proactively propose a context candidate when the latest user-authored request gives future-facing guidance, even if it does not say "remember" or "save":

- stable defaults: "use this by default", "always prefer...", "do not do this again"
- project conventions: "in this repo/workspace/project, use..."
- repeated workflow rules: "next time, follow this process"
- durable corrections: "when this happens, treat it as..."
- cross-session intent: "I will continue this on another machine/session"
- Chinese durable cues: "以后", "后续", "之后", "默认", "一直", "每次", "下次", "不要再", "这个项目以后"

Do not save by default:

- raw logs, raw code, pasted documents, or large transcripts
- one-off task instructions
- unconfirmed guesses or brainstorming
- short-lived plans, status, mood, or preferences
- secrets, credentials, tokens, payment details, private identifiers, or sensitive personal details
- facts about other people unless clearly necessary and explicitly approved

## Candidate Filter

Use these checks before proposing or saving context. A candidate may be proposed before consent, but it must not be saved until consent is explicit.

- Stability: likely to remain useful beyond the current task.
- Reuse value: likely to change future behavior or save repeated explanation.
- Clarity: can be rewritten as a concise, testable statement.
- Safety: does not contain secrets, credentials, private identifiers, or sensitive personal details.

Treat these as temporary unless the user says otherwise:

- one-off instructions
- speculative ideas
- transient mood or preference
- short-lived plans
- raw logs, pasted code, or large documents
- credentials, tokens, passwords, payment details, or private identifiers

## Record Format

Save distilled lessons, not raw material. Prefer one concise record over pasted transcripts, logs, or long explanations.

Use this shape when adding records to context files:

```md
- Statement: The durable fact, preference, decision, or flow rule.
  Scope: global | project | learning | current-workspace
  Source: user-confirmed YYYY-MM-DD, or file/path if derived from repo evidence
  Status: active | stale | superseded
  Applies when: concrete trigger or situation
  Does not apply when: known exception, if any
```

For `context-curator/DECISIONS.md`, also include rejected alternatives and rationale when known. For `context-curator/FLOWS.md`, include trigger, steps, required checks, approval points, and done criteria.

## Curation Workflow

1. Identify candidate context from the latest user-authored request and relevant conversation. Include implicit durable guidance when it is future-facing, repeated, or cross-session.
2. Classify each candidate as Temporary, Preference, Fact, Decision, Flow, Learning record, Session, or Summary.
3. Discard unsafe, unclear, or low-reuse candidates.
4. Rewrite each remaining candidate into a durable one-sentence record.
5. Ask the user to confirm the exact record before saving.
6. Save confirmed records to the appropriate location.
7. On later related tasks, read only the relevant context files before acting.
8. Support updates, supersession, and deletion when the user says context is stale or wrong.

## Confirmation Format

Before saving, use a structured confirmation protocol. If the Agent runtime offers a choice UI, present the same choices through that UI. If it only supports text, present a numbered menu.

Each candidate must show:

- ID: a stable number for this confirmation round
- Type: Preference, Fact, Decision, Flow, Learning record, Session, or Summary
- Record: the exact text that would be saved
- Destination: the suggested file or memory store
- Reason: why this is durable enough to keep

For multiple candidates, use this shape:

```text
I found these context candidates:

1. Preference
   Record: "Use Chinese by default for learning documents."
   Destination: context-curator/PREFS.md
   Reason: This changes future teaching and documentation behavior.

2. Flow
   Record: "For complex tasks, first summarize context, identify missing information, then propose the first action."
   Destination: context-curator/FLOWS.md
   Reason: This is a repeatable workflow rule.

Choose one:
- save all
- save selected IDs
- rewrite then save
- change destination
- do not save
```

For one high-value candidate, use a compact version:

```text
I found one context candidate:
- ID: 1
- Type: Preference
- Record: "Use relative paths when referencing sibling repositories in this workspace."
- Destination: context-curator/PREFS.md
- Reason: You update this repository from different machines.

Save this record?
```

Do not save if the user only says "ok" ambiguously after a broad discussion. Save when the user clearly chooses a save action, names candidate IDs to save, provides replacement wording, or directly says to remember, save, write, record, update, forget, delete, or apply a specific item.

For ordinary conversation, batch context capture instead of interrupting repeatedly. Prefer a brief end-of-topic prompt such as:

```text
Before we move on, I found 3 reusable context candidates. Do you want to review them?
```

## Storage Selection

Use the most local durable store available:

- Scope rule:
  - Current task only: do not save.
  - One repo, workspace, project, or initiative: save under that workspace's `context-curator/` directory.
  - One learning track: save in the teaching workspace.
  - Cross-project user default: use global memory only after an explicit remember/save request.
  - User-named destination: use that destination if it is safe and available.
- Skill-owned workspace store:
  - `context-curator/INDEX.md`: entry point and routing map for all context files.
  - `context-curator/FACTS.md`: durable facts about project, environment, paths, commands, constraints, and known setup traps.
  - `context-curator/DECISIONS.md`: confirmed decisions, rationale, rejected alternatives, and status.
  - `context-curator/FLOWS.md`: repeatable Agent workflows with triggers, steps, checks, approval points, and done criteria.
  - `context-curator/PREFS.md`: workspace-local user preferences and defaults.
  - `context-curator/SESSION.md`: current task state summary for short-term continuity; overwrite or replace as the task evolves.
  - `context-curator/SUMMARIES.md`: stage-level compressed summaries that should remain useful after the current task ends.
- Teaching workspace:
  - `MISSION.md`: long-term learning mission.
  - `GLOSSARY.md`: terms the user can already use correctly.
  - `RESOURCES.md`: trusted learning resources and communities.
  - `learning-records/NNNN-slug.md`: demonstrated learning, prior knowledge, corrected misconceptions, or mission shifts.
- Project or repo workspace:
  - Prefer existing local convention only when the user names it or when the repo already has a clear agent-context convention.
  - Do not add or update `AGENTS.md`, `CLAUDE.md`, or the platform's equivalent by default.
  - When the user wants automatic discovery by non-skill-aware agents, proactively offer to add a neutral entrypoint pointer. After confirmation, add or update only a small section like:

```md
## Reusable Context

- Durable workspace context lives under `context-curator/`.
- At task start, read `context-curator/INDEX.md` if it exists, then read only context files relevant to the current task.
- Do not write durable context without explicit user confirmation.
```

  - Keep durable records under `context-curator/`, not inside the agent entrypoint.
- Global memory:
  - Use only when the user explicitly asks to remember a stable cross-project preference or fact.
  - Follow the platform memory rules for where and how global memory updates are written.

If the right file does not exist, create it only after confirmation. Keep new files short and structured.

## Teaching Boundary

Use teaching workspace files only when the context affects a learning track:

- Use `MISSION.md` for why the user is learning a topic.
- Use `GLOSSARY.md` for terms the user can already use correctly.
- Use `RESOURCES.md` for trusted learning sources and communities.
- Use `learning-records/` for demonstrated learning, prior knowledge, corrected misconceptions, or mission shifts.

Use `context-curator/` for ordinary workspace facts, decisions, flows, preferences, sessions, and summaries, even when the topic being discussed is Agent skills. Do not duplicate the same durable record in both places unless the user explicitly asks for it.

## Conflict Priority

When context conflicts, follow this priority order:

1. Latest explicit user instruction.
2. Current task constraints and safety rules.
3. Repository or workspace instructions.
4. Workspace context under `context-curator/`.
5. Global user preferences or memory.
6. Inferences from older conversation.

Never let stale saved context override the user's latest explicit request. If a durable record appears stale, follow the latest request and ask whether to update the record.

## Lifecycle

Treat context as living documentation:

- Mark tool commands, dependency behavior, environment paths, and external facts with `Last verified: YYYY-MM-DD` when useful.
- Prefer `Status: stale` or `Status: superseded by ...` for old decisions and learning records that explain how understanding changed.
- Remove sensitive, mistaken, or user-requested deletions directly when permitted.
- Prune duplicated or low-value records during updates.
- Do not expand context files with raw evidence; link or summarize the evidence instead.

## Field-Test Loop

After first deployment, prefer real use over speculative expansion.

- Use the skill in normal conversations before adding new storage files, automation, or cross-agent mechanisms.
- Watch for repeated misses: useful context not proposed, noisy context proposed, unsafe context proposed, stale context reused, wrong destination chosen, or compressed summaries that fail to restore the task.
- Treat a single awkward use as feedback, not a design mandate. Change the skill when the same failure pattern appears repeatedly or blocks real work.
- Make the smallest durable improvement: clarify a rule, add one example, adjust a storage rule, or add a verification case.
- Update `references/verification.md` whenever a new failure mode becomes important enough to protect against.
- Avoid adding large abstractions until field use shows that the simpler confirmation-and-file workflow is insufficient.

## Context Compression

Use compression to preserve continuity without carrying raw conversation forever.

- Use `context-curator/SESSION.md` for the current task's working state:
  - Goal
  - Current state
  - Constraints
  - Decisions made
  - Evidence checked
  - Open questions
  - Next step
- Use `context-curator/SUMMARIES.md` for durable stage summaries after a long task, milestone, or topic shift.
- Preserve: user goal, active preferences, confirmed decisions, rationale, durable constraints, verified facts, evidence pointers, open risks, exceptions, and next actions.
- Compress or discard: greetings, repeated explanations, dead-end guesses, completed one-off steps, raw logs, large pasted code, and stale short-term plans.
- After compression, report what was kept, what was omitted, and what needs confirmation.
- Do not treat compressed summaries as stronger than source records. If precision matters, read the original cited file or record.

## Update And Forget

When the user asks to update context:

1. Find the existing record if possible.
2. Show the current record and proposed replacement.
3. Apply the smallest edit that preserves useful history.

When the user asks to forget context:

1. Identify where the context is stored.
2. Confirm whether to remove, supersede, or mark stale.
3. Remove sensitive or mistaken context directly when requested and permitted.
4. Prefer superseding learning records instead of deleting them when they describe an evolved understanding.

## Reading Context

When a task relates to known durable context:

0. Read context when this skill is triggered, when the latest request asks to restore or reuse context, or when a user-approved project entrypoint tells agents to read `context-curator/INDEX.md`. A directory alone is not enough. An entrypoint pointer may justify reading `INDEX.md` as routing metadata, but it is not consent to write context or load every context file.
1. Read `context-curator/INDEX.md` first when it exists.
2. Read the smallest relevant context file set.
3. Briefly state what context is being used.
4. Prefer targeted search over loading every context file.
5. If context seems stale or conflicts with the user's latest request, let the latest user request win and ask whether to update the durable record.

## Portable Agent Support

This skill should remain useful outside one Agent runtime. Keep `SKILL.md` as the skills-ecosystem trigger and use the reference files for portable behavior:

- `references/core-spec.md`: platform-neutral context curation rules.
- `references/compatibility.md`: how to adapt the skill to common Agent environments.
- `references/verification.md`: checklist for testing whether an Agent really reads, confirms, writes, and reuses context.

## Examples

- "Use Chinese for teaching docs by default." -> Preference, save after confirmation.
- "In this repo, generated `sourcemap.json` is local-only." -> Fact in `context-curator/FACTS.md`, save after confirmation.
- "We chose single-agent flows before multi-agent orchestration." -> Decision, save with rationale if known.
- "For complex tasks, first summarize context, identify missing information, then propose the first action." -> Flow.
- "I already understand the difference between temporary context and durable context." -> Learning record, save only if demonstrated or explicitly stated.
- "Here is a long error log." -> Do not save raw; extract the reusable failure pattern if one emerges.
- "I feel tired today." -> Temporary unless the user explicitly asks to track it.

## Response Templates

Context capture:

```text
I found one context candidate:
- ID: 1
- Type: Preference
- Record: "..."
- Destination: context-curator/PREFS.md
- Reason: ...

Choose one:
- save selected IDs: 1
- rewrite then save
- change destination
- do not save
```

Context use:

```text
I am using these saved context files: context-curator/FACTS.md and context-curator/FLOWS.md.
Current task interpretation: ...
```

Context conflict:

```text
Saved context says "...", but your latest request says "...".
I will follow the latest request. Should I update the saved context?
```
