# Demon Agent Skill

Demon Agent Skill 是一个可复用的 agent skills 集合，面向 Codex 兼容的 agent 工作流。

仓库参考 `mattpocock/skills` 的组织方式：所有 skill 放在 `skills/` 下，可安装的 skill 路径声明在 `.claude-plugin/plugin.json` 中，辅助脚本负责列出或链接 skill 到本机 agent skills 安装目录。

## 快速开始

推荐使用 skills.sh 安装：

```bash
npx skills@latest add Demon673/demon-agent-skill
```

安装后重启或刷新 agent 会话，让新 skill 进入可用列表。

## 手动安装

也可以 clone 仓库后运行本地安装脚本：

```powershell
git clone https://github.com/Demon673/demon-agent-skill.git "$env:USERPROFILE\demon-agent-skill"
cd "$env:USERPROFILE\demon-agent-skill"
.\scripts\list-skills.ps1
.\scripts\link-skills.ps1
```

## Windows

在已 clone 的仓库目录中运行：

```powershell
.\scripts\list-skills.ps1
.\scripts\link-skills.ps1
```

默认情况下，`link-skills.ps1` 会在以下目录创建 Junction：

```text
%USERPROFILE%\.agents\skills
```

这样可以让本 Git 仓库继续作为源文件，而 agent 仍从标准已安装 skill 目录读取。

安装为真实文件副本，而不是 Junction：

```powershell
.\scripts\link-skills.ps1 -Copy
```

替换已经存在的非链接 skill：

```powershell
.\scripts\link-skills.ps1 -Force
```

## macOS / Linux / WSL

```bash
./scripts/list-skills.sh
./scripts/link-skills.sh
```

Bash 脚本会把 skill 链接到 `${AGENT_SKILLS_DIR:-$HOME/.agents/skills}`。

使用 `--copy` 可改为复制安装；使用 `--force` 可替换已经存在的非链接目标。

## 更新

如果是通过本地 clone 安装，进入仓库后拉取最新提交，再重新运行链接脚本：

```powershell
git pull
.\scripts\link-skills.ps1
```

## 同步 Roblox Assistant skills

Roblox 官方 Assistant skills 来自 `Roblox/creator-docs` 的 `skills/` 目录。手动同步到本仓库：

- 仓库：https://github.com/Roblox/creator-docs
- Skills 目录：https://github.com/Roblox/creator-docs/tree/main/skills

```powershell
.\scripts\sync-roblox-assistant-skills.ps1
.\scripts\link-skills.ps1
```

同步目标目录是：

```text
skills/roblox-assistant
```

同步脚本会重建该目录，并更新 `.claude-plugin/plugin.json` 中的 skill 列表。只同步文件但不更新插件 manifest：

```powershell
.\scripts\sync-roblox-assistant-skills.ps1 -SkipManifest
```

## 结构

```text
.claude-plugin/plugin.json
scripts/list-skills.ps1
scripts/link-skills.ps1
scripts/sync-roblox-assistant-skills.ps1
scripts/list-skills.sh
scripts/link-skills.sh
skills/<category>/<skill-name>/SKILL.md
```

每个包含 `SKILL.md` 的目录都是一个可安装 skill。

## Skill authoring conventions

New `SKILL.md` files should be written in English by default, especially the frontmatter `description`.

Descriptions should define language-neutral trigger conditions instead of relying on keyword lists from one natural language. Prefer behavior-based wording, distinguish answer-only requests from constrained tasks, and state when the trigger must come from the latest user-authored request instead of assistant text, tool output, approval prompts, or older context.

## Skills

- `skills/roblox/roblox-gameplay-debugger`：Roblox 玩法、复制、性能和运行时问题诊断流程。
- `skills/roblox/roblox-luau-developer`：Roblox Luau 脚本、服务端/客户端分层、Remote、DataStore 和 ModuleScript 开发流程。
- `skills/roblox/roblox-rojo-workflow`：Rojo/Wally/Aftman 管理的 Roblox 项目结构、同步和本地验证流程。
- `skills/roblox-assistant/*`：从 `Roblox/creator-docs/skills` 手动同步的 Roblox Assistant 官方 skills。
- `skills/dota2/dota2-custom-game-dev`：DOTA2 自定义游戏开发流程，覆盖服务端 Lua、TypeScriptToLua/TSTL、SolidJS Panorama UI、Panorama JS/TS、CSS/XML、KV、NetTables、事件通信，并使用 `BigCiba/vscode-dota2-tools` 的 API references 快照。
- `skills/agent/answer-only`: Answer-only mode for conversation-only, advisory-only, or provided-context-only requests, with safeguards against assistant/tool/approval text accidentally interrupting active tasks.
- `skills/agent/context-curator`: Context curation workflow for capturing, confirming, storing, updating, and forgetting reusable user, project, workflow, decision, and learning context.
- `skills/unreal/unreal-blueprint-analyzer`：用于只读分析 Unreal Engine 蓝图资产，例如 `.uasset`、`.umap`、Widget Blueprint、Animation Blueprint、Behavior Tree 资产、Data Asset，以及插件或游戏项目自定义的蓝图文件。

## License

MIT License. See [LICENSE](LICENSE).
