---
name: workflow-capture
description: Capture a repeated or user-requested workflow into the right reusable artifact. Use when the latest user-authored request asks to preserve a workflow, reuse a workflow or process, formalize a repeated process, turn a process into a template, turn a process into a checklist, turn a process into a skill draft, or evaluate whether a completed or repeated process should become a reusable workflow, skill, plugin idea, MCP idea, or checklist. Do not use for ordinary task completion, generic summaries, durable facts/preferences/session state, decision rationale, critique, or direct skill creation when the target skill and requirements are already clear.
---

# Workflow Capture

Use this skill to turn a proven or explicitly requested process into a reusable artifact without prematurely making everything a formal skill.

## Core Rule

Capture workflows only when reuse is the user's goal. Do not interrupt ordinary task completion just because a task had multiple steps.

## Trigger Boundary

Trigger only from the latest user-authored natural-language request.

Do not trigger from assistant-authored suggestions, plans, final summaries, tool output, copied examples, repository docs, older conversation, or the mere presence of checklist/template language in files.

Use this skill when the user asks to:

- preserve a process for later reuse
- turn a completed workflow into a checklist, template, or repeatable process
- decide whether an experience should become a skill, plugin, MCP tool, or lightweight flow
- capture a repeated task pattern after successful use
- prepare a reusable workflow before deciding whether to publish it

Do not use this skill for:

- ordinary summaries, status updates, or final reports
- saving facts, preferences, decisions, or session state
- direct skill creation when the desired skill and requirements are already clear
- explaining why a decision was made
- criticizing a plan or implementation
- one-off tasks that are unlikely to recur

## Artifact Choice

Choose the smallest artifact that fits the reuse need:

| Artifact | Use when |
| --- | --- |
| Do not capture | The process is one-off, untested, too context-specific, or not worth maintaining. |
| Context flow | The process is a lightweight workspace habit or project-local operating rule. |
| Checklist | The process has stable steps but does not need a triggerable skill. |
| Workflow template | Future tasks need the same inputs, steps, checks, and done criteria. |
| Skill draft | The process has clear triggers, non-obvious execution knowledge, boundaries, and reusable instructions. |
| Plugin idea | Reuse needs bundled capabilities, UI, connectors, or multiple coordinated skills. |
| MCP idea | Reuse needs a structured tool, external system access, or deterministic automation. |

Prefer "do not capture" when the reuse value is unclear.

## Capture Workflow

1. Identify the process being captured and the evidence that it is reusable.
2. Decide the smallest suitable artifact.
3. Extract the trigger, inputs, steps, checks, approval points, failure boundaries, and done criteria.
4. Remove private context, local-only paths, secrets, and one-off details unless the artifact is explicitly private.
5. Propose the artifact and destination before writing when scope or destination is not already explicit.
6. Write only when the latest user request or a follow-up confirmation clearly specifies the artifact type, destination, and scope.
7. If the artifact is a skill draft, treat the next step as skill creation or update work using whatever authoring workflow is available.

## Capture Brief

When proposing a capture, keep it short:

```text
Reusable process: ...
Recommended artifact: checklist | workflow template | skill draft | plugin idea | MCP idea | context flow | do not capture
Trigger: ...
Core steps: ...
Checks: ...
Approval points: ...
Does not apply when: ...
Suggested destination: ...
```

Skip fields that do not add value.

## Destination Rules

Use the user's requested destination when it is safe. Otherwise follow the current workspace's existing conventions. Common destinations include:

- private workflow reviews: `skill-work/reviews/`
- early skill ideas: `skill-work/ideas/`
- skill designs ready for refinement: `skill-work/designs/`
- private skill drafts: `skill-work/drafts/`
- plugin ideas: `plugin-work/`
- MCP ideas: `mcp-work/`
- lightweight durable flows: an existing project flow store when the workspace already uses one
- mature public skill implementations: the user's chosen skill source repository, usually under `skills/<category>/<skill-name>/`

Do not create destination directories just because they appear above; ask before creating a new workspace convention. Do not copy private workshop context into a public skill. When publishing, extract only the reusable, non-private behavior.

## Independence

This skill has no dependency on other skills.

- If the user only wants to save durable facts, preferences, decisions, or session state, use the relevant context workflow instead.
- If the user wants decision rationale, record the rationale rather than capturing a workflow.
- If the user wants critique, review the plan or implementation rather than capturing it.
- If the user has already specified a concrete skill to create, treat the work as direct skill creation instead.

## Confirmation Rules

Before writing an artifact, confirm any missing or ambiguous part of:

- whether the process is worth capturing
- which artifact type to create
- where to save it
- whether the content is private or publishable
- whether any local paths, names, or sensitive details should be removed

If the latest user request already specifies the artifact type, destination, scope, and privacy/publish boundary, proceed without an extra confirmation round.
