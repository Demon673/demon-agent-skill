# Agent Note: 镜像 show-me skill

Status: implemented

[English](2026-09-04-mirror-show-me-skill.md) | 中文

## 问题

这个仓库此前没有可视化解释能力：无法要求 agent（智能体）用简洁的图示、代码形状草图和聚焦的 HTML 产物来解释当前主题。对上游 skill（技能）的一次性复制会与来源产生漂移，并会丢失许可证。

## 决策

把上游 [`show-me` SKILL.md](../../../../skills/agent/show-me/SKILL.md) 逐字节发布到 `skills/agent/show-me`，将上游 [`LICENSE`](../../../../skills/agent/show-me/LICENSE.upstream) 保留为 `LICENSE.upstream`，并添加本地元数据：一个 [`agents/openai.yaml`](../../../../skills/agent/show-me/agents/openai.yaml) 以及插件[清单](../../../../.claude-plugin/plugin.json)中的一个条目。手动 [`sync-show-me.ps1`](../../../../scripts/sync-show-me.ps1) 将一个 ref（默认为 `main`）解析为当前提交，下载这两个文件、校验 SKILL.md，并检查两者的 SHA-256 哈希。`-Check` 检测漂移而不写入；正常运行只复制已更改或缺失的镜像文件，并保留本地新增。

## 备选方案

- **吸收并泛化该 skill。** 否决：该请求要求逐字节镜像，而非泛化的移植。
- **使用 git 子模块。** 否决：子模块为单个 skill 增加了打包和安装的复杂度。
- **调度 GitHub Action。** 否决：该请求要求的是手动同步。

## 后果

- 上游内容逐字节发布，因此嵌入 SKILL.md 的平台专属 `open` 命令未被修正。
- 同步是手动的；镜像会漂移，直到运行 `sync-show-me.ps1`。
- 保留上游许可证用于署名。
- 本地 Codex 元数据和插件清单条目不属于上游。
