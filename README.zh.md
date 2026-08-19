# Demon Agent Skill

[English](README.md) | 中文

Demon Agent Skill 是一个可复用的 agent skills 集合，面向 Codex 兼容的 agent 工作流。

这个仓库是 skill 的源仓库，不是最终安装目录。可安装 skill 放在 `skills/` 下，插件清单在 `.claude-plugin/plugin.json` 中，脚本负责列出、校验和链接 skill。

## 快速开始

推荐使用 skills.sh 安装：

```bash
npx skills@latest add Demon673/demon-agent-skill
```

安装后重启或刷新 agent 会话，让新 skill 进入可用列表。

## 仓库地图

| 路径 | 职责 |
|---|---|
| `AGENTS.md` | Agent 进入本仓库时的工作说明 |
| `README.md` | 面向用户的仓库入口 |
| `.claude-plugin/plugin.json` | 可安装 skill manifest |
| `requirements/skill-validation.txt` | skill 校验依赖 |
| `scripts/` | 仓库维护脚本 |
| `skills/<category>/<skill-name>/` | installable skill folders |
| `docs/` | 文档标准与双语约定 |
| `.agents/notes/` | Agent Note 决策记录 |

每个包含 `SKILL.md` 的目录都是一个可安装 skill。`link-skills.ps1` 会按 skill 目录名扁平链接到 `%USERPROFILE%\.agents\skills`，所以不同分类下也不能复用同一个 skill 目录名。

个人学习资料、长期上下文和 session 记录不放在这个公开仓库里。这里应只保留可公开发布的 skill 源码、维护脚本和必要说明。

## Skill 分组

| 路径 | 职责 |
|---|---|
| `skills/agent/` | 通用 Agent 工作流技能 |
| `skills/roblox/` | 本仓库维护的 Roblox Luau 与 TypeScript (roblox-ts) 工作流技能 |
| `skills/dota2/` | DOTA2 custom game 开发技能 |
| `skills/unreal/` | Unreal Blueprint 只读分析技能 |

## 文档与决策记录

仓库遵循一套从官方 deepseek-harness 忠实移植的文档规范（Node ESM 门禁脚本复用官方 mdast/GFM 解析器）——见 [`docs/AGENTS.md`](docs/AGENTS.md)：一个事实一个归属、教程/参考分类、写作规则和 slop 清单。

- 内容文档和活跃的 Agent Note 都是双语三件套（`foo.md` + `foo.zh.md` + `foo.i18n.yaml`，见 [`docs/i18n/README.md`](docs/i18n/README.md)）；`AGENTS.md` 指令文件和 `SKILL.md` 保持英文。
- 决策记录（Agent Note）放在 `.agents/notes/`，按 `生命周期/分类/日期-主题` 组织（见 [.agents/notes/README.md](.agents/notes/README.md)）。
- 事故复盘放在 [`docs/postmortem/`](docs/postmortem/README.md)；防御模式见 [`docs/defensive-patterns.md`](docs/defensive-patterns.md)，领域词汇见 [`docs/glossary.md`](docs/glossary.md)，翻译语体样例见 [`docs/i18n/style-samples.md`](docs/i18n/style-samples.md)。
- `.agents/skills/` 下保留 4 个仓库内部维护类 skill（不对外发布）：`archive-agent-notes`、`find-simplifications`、`repo-standards-review`、`translate-docs`。

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
.\scripts\validate-skills.ps1 -SkillPath "skills\agent\prose-standard"
```

校验全仓：

```powershell
.\scripts\validate-skills.ps1
```

校验文档门禁（配对 / 格式 / 预算 / 链接 / 换行 / 封存）：

```bash
npm install   # install mdast/GFM deps before first run
npm run doc-gates
```

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

## Skill 编写规则

新的 `SKILL.md` 文件默认用英文书写，尤其是 frontmatter 中的 `name` 和 `description`。

描述应定义基于行为的触发条件，而不是依赖某种自然语言的关键词列表。优先保持 skill 简洁；把详细、有条件或平台特定的材料移到 `references/` 下直接链接的文件中。

## License

MIT License。参见 [LICENSE](LICENSE)。
