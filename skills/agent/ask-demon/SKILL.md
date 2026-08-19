---
name: ask-demon
description: Ask which skill or flow fits your situation. A router over the docs/Agent-Note maintenance flow, the prose tool layer, and the standalone git and game skills in this pack.
disable-model-invocation: true
---

# Ask Demon

You don't remember every skill, so ask. This pack complements Matt's engineering skills: Matt owns the engineering loop (grill → spec → tickets → implement → code-review); this pack owns the documentation and Agent-Note maintenance loop and game-domain work.

A **flow** is a path through the skills. One **main flow** carries the documentation work; everything else is standalone, or a prose tool layer that runs underneath.

## The main flow: maintain a change

The route documentation work travels: review a change, simplify what it surfaces, archive what it supersedes, sync the bilingual pairs.

1. **`repo-standards-review`** — review a PR or branch against the repository's standards (skill frontmatter and body, docs, bilingual pairs, Agent Notes, scripts). Produces blockers plus suggestions. Run when a change is ready for review, or as a pre-push gate.
2. **`find-simplifications`** — take the dead, duplicated, speculative, or over-built surface the review surfaced, and turn the worthwhile ones into proposed Agent Notes or TODO markers. A review hands off here.
3. **`archive-agent-notes`** — when a change makes an owning note obsolete, classify and archive the superseded records. A simplification hands off here.
4. **`translate-docs`** — after the earlier steps touched docs or notes, sync their English↔Chinese pairs. The archive step hands off here when link repair edited a bilingual doc.

The flow cascades — `repo-standards-review → find-simplifications → archive-agent-notes → translate-docs` — and each step is also independently invocable.

## Prose tool layer

Three skills run beneath the flow and are reachable on their own when the prose, not the process, is the problem:

- **`prose-standard`** — the base: preserve the complete proposition, then remove reasoning transcripts, repetition, and decoration. Owns editorial judgment and coverage.
- **`trim-cot-leakage`** — one smell: prose whose vantage is the authoring session (dead citations, change narration, review choreography). Restate the facts, delete the transcript.
- **`prune-prompt-pollution`** — another smell: negation priming, absence declarations, stale meta-narrative, strawman warnings. Restate the positive target or the consequence.

## Standalone

Off the main flow; reach for each on its own trigger.

- **`pre-push-checks`** — before pushing, select the narrowest checks that cover the outgoing diff; protect history-rewriting pushes with `--force-with-lease`.
- **`merging-stacked-prs`** — land a stack of dependent GitHub PRs through `gh stack`; layers with Matt's `resolving-merge-conflicts`.
- **`workflow-capture`** — turn a proven or requested workflow into a reusable skill.
- **`agent-doorbell`** — install hook-based desktop/audio reminders for agent stop and attention events.
- **`dota2-custom-game-dev`** — DOTA2 custom game addons.
- **`roblox-luau-developer`** — Roblox Luau development, debugging, and Rojo sync.
- **`roblox-typescript-developer`** — Roblox TypeScript (roblox-ts) development.
- **`unreal-blueprint-analyzer`** — read-only Unreal Blueprint asset analysis.

## Setup

The maintenance flow needs a repository's conventions in place first — the Agent Note tree and the bilingual pairing contract. Run **`setup-demon-skills`** once to scaffold them and record where they live.
