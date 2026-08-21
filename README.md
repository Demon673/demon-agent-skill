# Demon Agent Skill

English | [中文](README.zh.md)

Demon Agent Skill is a reusable collection of agent skills for Codex-compatible agent workflows.

This repository is the skill source, not the install directory. Installable skills live under `skills/`, the plugin manifest is `.claude-plugin/plugin.json`, and the scripts list, validate, and link skills.

## Quick start

Install with skills.sh:

```bash
npx skills@latest add Demon673/demon-agent-skill
```

Restart or refresh the agent session afterward so the new skills enter the available list.

## Repository map

| Path | Purpose |
|---|---|
| `AGENTS.md` | Agent working instructions for this repository |
| `README.md` | User-facing repository entry |
| `.claude-plugin/plugin.json` | Installable skill manifest |
| `requirements/skill-validation.txt` | Skill validation dependencies |
| `scripts/` | Repository maintenance scripts |
| `skills/<category>/<skill-name>/` | Installable skill folders |
| `docs/` | Documentation standard and bilingual convention |
| `.agents/notes/` | Agent Note decision records |

Every directory containing a `SKILL.md` is an installable skill. `link-skills.ps1` links skills flat by directory name into `%USERPROFILE%\.agents\skills`, so a skill directory name cannot be reused across categories.

Private learning material, long-term context, and session records do not belong in this public repository; keep only publishable skill source, maintenance scripts, and the necessary docs here.

## Skill groups

| Path | Purpose |
|---|---|
| `skills/agent/` | General agent workflow skills |
| `skills/roblox/` | Roblox Luau and TypeScript (roblox-ts) workflow skills maintained by this repository |
| `skills/dota2/` | DOTA2 custom game development skills |
| `skills/unreal/` | Read-only Unreal Blueprint analysis skills |

## Documentation and decisions

The documentation standard lives in [`docs/AGENTS.md`](docs/AGENTS.md); bilingual pairing rules in [`docs/i18n/README.md`](docs/i18n/README.md); Agent Note rules in [.agents/notes/README.md](.agents/notes/README.md).

- Incident post-mortems live under [`docs/postmortem/`](docs/postmortem/README.md); defensive patterns are in [`docs/defensive-patterns.md`](docs/defensive-patterns.md), domain vocabulary in [`docs/glossary.md`](docs/glossary.md), and translation style samples in [`docs/i18n/style-samples.md`](docs/i18n/style-samples.md).

## Common commands

List skills:

```powershell
.\scripts\list-skills.ps1
```

Link local skills into the install directory:

```powershell
.\scripts\link-skills.ps1
```

Validate one skill:

```powershell
.\scripts\validate-skills.ps1 -SkillPath "skills\agent\prose-standard"
```

Validate the whole repository:

```powershell
.\scripts\validate-skills.ps1
```

Run the documentation gates (pairing / format / budgets / links / wrap / archive):

```bash
npm install   # install mdast/GFM deps before first run
npm run doc-gates
```

## Installation

Or clone the repository and run the local scripts:

```powershell
git clone https://github.com/Demon673/demon-agent-skill.git "$env:USERPROFILE\demon-agent-skill"
cd "$env:USERPROFILE\demon-agent-skill"
.\scripts\list-skills.ps1
.\scripts\link-skills.ps1
```

By default `link-skills.ps1` creates a Junction so the Git repository stays the source. Install as real file copies:

```powershell
.\scripts\link-skills.ps1 -Copy
```

Replace an existing non-link skill:

```powershell
.\scripts\link-skills.ps1 -Force
```

macOS / Linux / WSL:

```bash
./scripts/list-skills.sh
./scripts/link-skills.sh
```

The Bash scripts link skills into `${AGENT_SKILLS_DIR:-$HOME/.agents/skills}`. Use `--copy` to copy instead of link; use `--force` to replace an existing non-link target.

## Skill writing rules

Skill authoring rules live in the root [AGENTS.md](AGENTS.md).

## License

MIT License. See [LICENSE](LICENSE).
