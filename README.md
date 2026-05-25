# Personal Agent Skills

Personal reusable skills for Codex-compatible agents.

## Skills

- `unreal-blueprint-analyzer`: Read-only analysis workflow for Unreal Engine Blueprint assets such as `.uasset`, `.umap`, widget blueprints, animation blueprints, behavior tree assets, data assets, and plugin/game-specific Blueprint files.

## Install A Skill Manually

Clone this repository, then copy the skill folder you need into your local skills directory.

Windows PowerShell example:

```powershell
git clone <repo-url> "$env:USERPROFILE\personal-agent-skills"
New-Item -ItemType Directory -Force "$env:USERPROFILE\.agents\skills" | Out-Null
Copy-Item -Recurse -Force "$env:USERPROFILE\personal-agent-skills\unreal-blueprint-analyzer" "$env:USERPROFILE\.agents\skills\unreal-blueprint-analyzer"
```

Restart the agent session after installing or updating skills.

## Repository Layout

Each top-level directory that contains a `SKILL.md` file is one installable skill.
