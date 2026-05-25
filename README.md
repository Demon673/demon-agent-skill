# Demon Agent Skill

个人可复用 agent skills 仓库，面向 Codex 兼容的 agent 工作流。

本仓库参考 `mattpocock/skills` 的组织方式：所有 skill 放在 `skills/` 下，可安装的 skill 路径声明在 `.claude-plugin/plugin.json` 中，辅助脚本负责列出或链接 skill 到本机 agent skills 安装目录。

## 快速开始

当前仓库地址：

```text
https://github.com/Demon673/demon-agent-skill
```

如果仓库保持 private，推荐先 clone 到本地，再运行安装脚本：

```powershell
git clone https://github.com/Demon673/demon-agent-skill.git "$env:USERPROFILE\demon-agent-skill"
cd "$env:USERPROFILE\demon-agent-skill"
.\scripts\list-skills.ps1
.\scripts\link-skills.ps1
```

如果仓库改为 public，也可以通过 skills.sh 流程安装：

```bash
npx skills@latest add Demon673/demon-agent-skill
```

随后选择需要安装的 skill。

## Windows 本地安装

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

如果想安装为真实文件副本，而不是 Junction：

```powershell
.\scripts\link-skills.ps1 -Copy
```

如果要替换已经存在的非链接 skill：

```powershell
.\scripts\link-skills.ps1 -Force
```

## macOS / Linux / WSL 本地安装

```bash
./scripts/list-skills.sh
./scripts/link-skills.sh
```

Bash 脚本会把 skill 链接到 `${AGENT_SKILLS_DIR:-$HOME/.agents/skills}`。

使用 `--copy` 可改为复制安装；使用 `--force` 可替换已经存在的非链接目标。

## 仓库结构

```text
.claude-plugin/plugin.json
scripts/list-skills.ps1
scripts/link-skills.ps1
scripts/list-skills.sh
scripts/link-skills.sh
skills/<category>/<skill-name>/SKILL.md
```

每个包含 `SKILL.md` 的目录都是一个可安装 skill。

## 当前 Skills

- `skills/unreal/unreal-blueprint-analyzer`：用于只读分析 Unreal Engine 蓝图资产，例如 `.uasset`、`.umap`、Widget Blueprint、Animation Blueprint、Behavior Tree 资产、Data Asset，以及插件或游戏项目自定义的蓝图文件。
