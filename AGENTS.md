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
- Write `SKILL.md` in English by default. Frontmatter: `name` (hyphen-case) and `description` (behavior-based, trigger-focused — the discovery surface) are required; `license`, `allowed-tools`, `metadata`, `disable-model-invocation`, `user-invocable` are optional standard fields.
- Keep `SKILL.md` concise; move detailed, conditional, or platform-specific material into `references/`, loaded only when the skill fires.
- Invocation defaults to both model and user; `disable-model-invocation: true` makes a skill user-only and unreachable by other skills, so a flow step another skill fires stays default.
- Each skill carries `agents/openai.yaml` (Codex metadata) beside `SKILL.md`.
- Do not add auxiliary documentation inside a skill folder unless it directly supports the skill at runtime.
- Prefer existing repository patterns over inventing a new skill layout.

## Documentation and decisions

- Follow [docs/AGENTS.md](docs/AGENTS.md) for doc structure, placement, and writing rules.
- Every non-trivial change adds or updates an Agent Note under `.agents/notes/` ([rules](.agents/notes/README.md)).
- Content docs under `docs/` and active Agent Notes are bilingual triplets (`foo.md` + `foo.zh.md` + `foo.i18n.yaml`); `AGENTS.md` and `SKILL.md` stay English-only ([i18n](docs/i18n/README.md)).
- Use these skills for prose and review: [prose-standard](skills/agent/prose-standard/SKILL.md), [repo-standards-review](.agents/skills/repo-standards-review/SKILL.md).
- Skills default to both model and user invocation so a flow can cascade (one skill fires the next); mark `disable-model-invocation: true` only for a skill the model must never auto-fire and that no other skill needs to reach.

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

For a semantic review of a non-trivial change (skill bodies, docs, notes), run [repo-standards-review](.agents/skills/repo-standards-review/SKILL.md) before pushing.

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
