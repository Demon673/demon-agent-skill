---
name: setup-demon-agent-skill
description: 安装 Demon Agent Skill 后的引导和自检流程。Use after installing Demon673/demon-agent-skill, when the user asks how to use this skill library, wants to verify the installation, or needs help updating, linking, or locating installed skills.
---

# Demon Agent Skill 安装引导

用于安装后的第一步引导。目标是确认 skill 已可用，并告诉用户下一步怎么调用。

## 什么时候使用

- 用户刚运行 `npx skills@latest add Demon673/demon-agent-skill`。
- 用户询问这个 skill 库是否安装成功。
- 用户想知道有哪些 skill、怎么更新、怎么重新链接本地安装。
- 用户安装后不知道该如何触发 `unreal-blueprint-analyzer`。

## 流程

1. 简要说明本库当前包含的 skill：
   - `unreal-blueprint-analyzer`：只读分析 Unreal Engine 蓝图资产。
2. 告诉用户重启或刷新 agent 会话后，skill 列表通常才会更新。
3. 如可运行命令，优先检查以下位置是否存在：
   - 当前工作区 `.agents/skills/unreal-blueprint-analyzer/SKILL.md`
   - 用户目录 `$HOME/.agents/skills/unreal-blueprint-analyzer/SKILL.md`
4. 如果用户是通过 clone 安装，提示可在仓库目录运行：

```powershell
git pull
.\scripts\link-skills.ps1
```

5. 给出使用示例：

```text
分析这个蓝图：Content/Blueprints/BP_Door.uasset
解析 Asset/Blueprint/Prefabs/UI/MercenaryShop.uasset 是干嘛的
```

## 输出格式

保持简短：

- **安装状态**：是否发现已安装 skill。
- **可用 Skill**：列出当前库中的 skill。
- **下一步**：告诉用户如何触发或更新。

不要把这个 setup skill 当成全局项目配置工具；它只负责安装后引导和轻量自检。
