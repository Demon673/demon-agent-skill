# Agent Instructions

This repository is a public Agent skills source repository. Treat it as the source for creating, maintaining, validating, and publishing reusable skills.

## Project Shape

- `skills/<category>/<skill-name>/SKILL.md`: installable skills.
- `skills/<category>/<skill-name>/references/`: optional reference material loaded only when needed by the skill.
- `skills/<category>/<skill-name>/scripts/`: optional deterministic helpers for fragile or repeated operations.
- `.claude-plugin/plugin.json`: installable skill manifest.
- `scripts/`: repository maintenance scripts.
- `docs/`: the documentation standard and bilingual convention (see [docs/AGENTS.md](docs/AGENTS.md)).
- `.agents/notes/`: Agent Note decision records (see [.agents/notes/README.md](.agents/notes/README.md)).

## Skill Authoring Rules

- Keep each skill focused on one reusable capability.
- Write new `SKILL.md` files in English by default, especially `name` and `description`.
- Make `description` behavior-based and trigger-focused; it is the primary discovery surface.
- Keep `SKILL.md` concise. Move detailed, conditional, or platform-specific material into directly linked files under `references/`.
- Do not add auxiliary documentation inside a skill folder unless it directly supports the skill at runtime.
- Prefer existing repository patterns over inventing a new skill layout.

## Documentation and decisions

- Follow [docs/AGENTS.md](docs/AGENTS.md) for doc structure, placement, and writing rules.
- Every non-trivial change adds or updates an Agent Note under `.agents/notes/` ([rules](.agents/notes/README.md)).
- Content docs under `docs/` and active Agent Notes are bilingual triplets (`foo.md` + `foo.zh.md` + `foo.i18n.yaml`); `AGENTS.md` and `SKILL.md` stay English-only ([i18n](docs/i18n/README.md)).
- Use the maintenance skills for placement, prose, and review: [doc-standards](skills/agent/doc-standards/SKILL.md), [prose-standard](skills/agent/prose-standard/SKILL.md), [code-review](skills/agent/code-review/SKILL.md).

## Validation

Before considering a skill change done, run the targeted validator:

```powershell
.\scripts\validate-skills.ps1 -SkillPath "skills\agent\context-curator"
```

For a whole-repository pass, run:

```powershell
.\scripts\validate-skills.ps1
```

The default whole-repository pass may skip known upstream exceptions. Use `-Strict` only when intentionally cleaning those exceptions.

For documentation and Agent Note changes, run:

```bash
npm run doc-gates
```

## Quality Gate

When creating or updating a skill, inspect the changed skill for local paths, platform-specific metadata, runtime branding, and strong cross-skill dependencies before finishing:

```powershell
rg -n "C:\\|C:/|Users/|Users\\|\.agents|\.codex|OpenAI|Codex|Claude|Cursor|openai\.yaml|agents/openai|must use|must install|requires? .*skill|requires? .*installed|depends? on .*skill" "skills\<category>\<skill-name>"
```

If a match is legitimate, explain why it remains. Otherwise remove or neutralize it before validation.

## Installation

List skills:

```powershell
.\scripts\list-skills.ps1
```

Link local skills into the user's installed skills directory:

```powershell
.\scripts\link-skills.ps1
```

Use `-Copy` only when a real file copy is needed instead of a Junction.

## Context Policy

- Do not store private learning material, personal context, session state, or durable workspace notes in this public repository.
- Do not store durable project context in this file.
- Use `README.md` for user-facing repository documentation.
- Let the latest user request override saved context when they conflict.

## Iteration Policy

Do not expand a skill spec speculatively. Prefer this loop:

1. Use the skill on real tasks.
2. Notice repeated misses, noise, stale context, wrong destinations, or weak validation.
3. Make the smallest useful rule, example, reference, or script change.
4. Validate the changed skill.
5. Keep the worktree easy to review and commit.

When changing synced upstream skills, preserve upstream compatibility unless the user explicitly wants a local fork.
