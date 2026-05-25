# Personal Agent Skills

Personal reusable skills for Codex-compatible agents.

This repository follows the same broad shape as `mattpocock/skills`: skills live under `skills/`, installable skill paths are declared in `.claude-plugin/plugin.json`, and helper scripts can list or link skills into the local agent skills directory.

## Quickstart

After this repository is on GitHub, install with the skills.sh flow:

```bash
npx skills@latest add <github-user>/personal-agent-skills
```

Then select the skills you want to install.

## Local Install On Windows

From a cloned checkout:

```powershell
.\scripts\list-skills.ps1
.\scripts\link-skills.ps1
```

By default, `link-skills.ps1` creates Junctions in:

```text
%USERPROFILE%\.agents\skills
```

That keeps this Git repository as the source of truth while the agent reads the normal installed-skill location.

To install physical copies instead of Junctions:

```powershell
.\scripts\link-skills.ps1 -Copy
```

To replace an existing non-link installed skill:

```powershell
.\scripts\link-skills.ps1 -Force
```

## Local Install On macOS / Linux / WSL

```bash
./scripts/list-skills.sh
./scripts/link-skills.sh
```

The Bash script links skills into `${AGENT_SKILLS_DIR:-$HOME/.agents/skills}`.

Use `--copy` to copy instead of symlink, or `--force` to replace an existing non-link target.

## Repository Layout

```text
.claude-plugin/plugin.json
scripts/list-skills.ps1
scripts/link-skills.ps1
scripts/list-skills.sh
scripts/link-skills.sh
skills/<category>/<skill-name>/SKILL.md
```

Each directory containing a `SKILL.md` file is one installable skill.

## Current Skills

- `skills/unreal/unreal-blueprint-analyzer`: Read-only analysis workflow for Unreal Engine Blueprint assets such as `.uasset`, `.umap`, widget blueprints, animation blueprints, behavior tree assets, data assets, and plugin/game-specific Blueprint files.