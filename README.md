# Demon Agent Skill

Demon Agent Skill 是一个可复用的 agent skills 集合，面向 Codex 兼容的 agent 工作流。

这个仓库是 skill 的源仓库，不是最终安装目录。可安装 skill 放在 `skills/` 下，插件清单在 `.claude-plugin/plugin.json` 中，脚本负责列出、校验、同步和链接 skill。

## 快速开始

推荐使用 skills.sh 安装：

```bash
npx skills@latest add Demon673/demon-agent-skill
```

安装后重启或刷新 agent 会话，让新 skill 进入可用列表。

## 仓库地图

```text
AGENTS.md                         Agent 进入本仓库时的工作说明
README.md                         面向用户的仓库入口
.claude-plugin/plugin.json        可安装 skill manifest
requirements/skill-validation.txt skill 校验依赖
scripts/                          仓库维护脚本
skills/<category>/<skill-name>/   installable skill folders
```

每个包含 `SKILL.md` 的目录都是一个可安装 skill。`link-skills.ps1` 会按 skill 目录名扁平链接到 `%USERPROFILE%\.agents\skills`，所以不同分类下也不能复用同一个 skill 目录名。

个人学习资料、长期上下文和 session 记录不放在这个公开仓库里。这里应只保留可公开发布的 skill 源码、维护脚本和必要说明。

## Skill 分组

| 路径 | 职责 |
| --- | --- |
| `skills/agent/` | 通用 Agent 工作流技能 |
| `skills/roblox/` | 本仓库维护的 Roblox/Rojo/Luau 工作流技能 |
| `skills/roblox-assistant/` | 从 `Roblox/creator-docs` 同步的官方 Roblox Assistant skills |
| `skills/dota2/` | DOTA2 custom game 开发技能 |
| `skills/unreal/` | Unreal Blueprint 只读分析技能 |

`skills/roblox-assistant/` 是同步目标目录。同步脚本会重建该目录；修改这里的上游文件前，先确认是要保留本地 fork，还是应该改同步流程。

## 常用命令

列出 skill：

```powershell
.\scripts\list-skills.ps1
```

链接本地 skill 到安装目录：

```powershell
.\scripts\link-skills.ps1
```

校验单个 skill：

```powershell
.\scripts\validate-skills.ps1 -SkillPath "skills\agent\context-curator"
```

校验全仓：

```powershell
.\scripts\validate-skills.ps1
```

全仓校验默认跳过已知上游例外。使用 `-Strict` 可包含这些例外。

## 安装

也可以 clone 仓库后运行本地脚本：

```powershell
git clone https://github.com/Demon673/demon-agent-skill.git "$env:USERPROFILE\demon-agent-skill"
cd "$env:USERPROFILE\demon-agent-skill"
.\scripts\list-skills.ps1
.\scripts\link-skills.ps1
```

默认情况下，`link-skills.ps1` 会创建 Junction，让 Git 仓库继续作为源文件。安装为真实文件副本：

```powershell
.\scripts\link-skills.ps1 -Copy
```

替换已经存在的非链接 skill：

```powershell
.\scripts\link-skills.ps1 -Force
```

macOS / Linux / WSL:

```bash
./scripts/list-skills.sh
./scripts/link-skills.sh
```

Bash 脚本会把 skill 链接到 `${AGENT_SKILLS_DIR:-$HOME/.agents/skills}`。使用 `--copy` 可改为复制安装；使用 `--force` 可替换已经存在的非链接目标。

## 同步 Roblox Assistant Skills

Roblox 官方 Assistant skills 来自 `Roblox/creator-docs` 的 `skills/` 目录：

- 仓库：https://github.com/Roblox/creator-docs
- Skills 目录：https://github.com/Roblox/creator-docs/tree/main/skills

```powershell
.\scripts\sync-roblox-assistant-skills.ps1
.\scripts\link-skills.ps1
```

只同步文件但不更新 plugin manifest：

```powershell
.\scripts\sync-roblox-assistant-skills.ps1 -SkipManifest
```

## Skill 编写规则

New `SKILL.md` files should be written in English by default, especially the frontmatter `name` and `description`.

Descriptions should define behavior-based trigger conditions instead of relying on keyword lists from one natural language. Prefer concise skills; move detailed, conditional, or platform-specific material into directly linked files under `references/`.

## License

MIT License. See [LICENSE](LICENSE).
