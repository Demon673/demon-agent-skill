# Agent Note: Rename repo-standards-review to workspace-standards-review and wire the governance skills

Status: implemented

English | [中文](2026-09-16-rename-to-workspace-standards-review.zh.md)

## Problem

The skill's name and description claimed the same trigger as Matt's `code-review` — review a pull request or a branch — while [the skills map](../../../../docs/skills-map.md) assigns the review flow to Matt's skill and leaves this one the checklist content. Two skills answered "review my branch" with different depth and different severity vocabularies, and neither description let a reader tell which to run. Separately, the skill named the prose, note, and translation *files* as sources of truth but not the governance *skills* that own them, so a review that needed a structural documentation pass, a counterpart translation, or a note supersession check had no named owner to hand to.

## Decision

Rename the skill to [`workspace-standards-review`](../../../../skills/agent/workspace-standards-review/SKILL.md), and narrow its description to what it owns: a change reviewed against this workspace's documented standards — skill frontmatter and bodies, docs and bilingual pairs, Agent Notes, scripts — plus supplying the Standards axis when a two-axis review runs. The flow trigger stays with Matt's `code-review`. The skill's own voice says "workspace", and [CONTEXT.md](../../../../CONTEXT.md) defines **Workspace** as the root a session operates in, with **Host repository** keeping the identity axis.

Wire the governance skills into `## Sources of truth`, each beside the artifact it owns: `doc-standards` (placement, structure, budget audits), `archive-agent-notes` (supersession and archival), `translate-docs` (counterpart updates), `setup-demon-skills` (the scaffold, so a missing convention is reported rather than invented). `pre-push-checks` is named as the owner of which checks cover a diff, and `writing-for-agents` as the owner of the agent-facing delivery frame when Matt's writing pack is installed.

## Alternatives considered

- **Keep the name and narrow only the description.** Rejected: "repo standards" reads as the code-facing Standards axis Matt's skill already owns, which is the collision being removed.
- **Revert to `repo-standards-review` and keep the narrowed description.** Rejected: the description already carries the fix, so the name is free to follow the harness-side word the review runs in; reverting keeps one vocabulary for the pack at no gain.
- **State in the body that a two-axis review loads this checklist.** Rejected for now: the description carries the supply direction, and an instruction addressed to another pack's sub-agent belongs in that pack.
- **Renaming the reference file too** — `references/code-review-checklist.md` shares a name with the review skill. Left as is: the file name states what it holds, and renaming it would touch the note that ported it without changing behaviour.
- **Updating only the live references and leaving historical Agent Notes naming the old skill.** Rejected: implemented notes are kept current with shipped names and paths, and the moved path broke their relative links.

## Consequences

- The pack's standards-review skill is `workspace-standards-review`; the current name and path are carried by root `AGENTS.md`, the plugin manifest, the skills map pair, `ask-demon`, `translate-docs`, and the historical Agent Note triplets.
- Discovery splits by intent: Matt's `code-review` owns a review of the diff since a fixed point, with its Spec axis and smell baseline; this skill owns the workspace's standards sources and the code-facing checklist a standards pass loads.
- The documentation-governance set is reachable from the review: `doc-standards`, `translate-docs`, `archive-agent-notes`, and `find-simplifications` are named where their judgment applies.
- `CONTEXT.md` defines **Workspace** — the root a session operates in — beside **Host repository**, which keeps conventions' ownership; the terminology table pins `workspace（工作区）`.
