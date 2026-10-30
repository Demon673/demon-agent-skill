# Agent Note: 吸收 record-browser-gif

Status: implemented

[English](2026-08-20-absorb-record-browser-gif.md) | 中文

## 问题

本仓库没有任何把浏览器或 Web UI 交互录制成优化 GIF 的 skill（技能）。deepseek-harness 的 `record-browser-gif` skill 完整覆盖该流程——基于状态的帧捕获、确定性编码，以及 assets 分支发布——但它按宿主仓库书写：点名宿主的构建命令、`DSH_HOME`/`DSH_AGENTS_HOME` 状态根、"real API key and real model rounds"、宿主的 browser-control skill，以及宿主本地的 evidence-chain note。要在这里发布，就必须把它通用化，使其不点名任何宿主特定的路径、命令或架构事实。

## 决策

把它吸收为 `skills/agent/` 下的 [`record-browser-gif`](../../../../skills/agent/record-browser-gif/SKILL.md)，附带通用编码器、针对性的媒体测试、上游许可证，以及本地 `agents/openai.yaml`。该 skill 使用仓库自身的构建与浏览器控制流程、全新应用状态和真实服务端行为；发布的工作流不携带宿主专属构建命令、状态根或架构引用。保留：面向用户可见 GUI 的 PR（Pull Request）的 MUST-GIF 规则、staging 与证据规则、连续视频捕获及截图回退、时序披露、`GIF_SKILL_DIR` 编码器调用方式、产物验证，以及被演示 PR head 的复查。发布优先使用受支持的 `gh --attach`，回退到专用 assets 分支。[同步决策](2026-10-30-sync-upstream-skills.md)记录上游版本。

## 备选方案

- **原样保留宿主引用后移植。** 否决：skill 会点名宿主的构建命令和状态根，违反本仓库禁止宿主特定路径和命令的规则，且 evidence-chain 链接会失效。
- **改写成更薄的 skill。** 否决：该流程的价值在于其精确的 staging、帧与发布纪律；改写可能丢掉让录制可信的验证步骤。
- **跳过移植。** 否决：本仓库没有 GIF 录制 skill，而该流程对任何浏览器 UI 都通用，可直接在此复用。

## 后果

- 发布的 skill 集合增加一个：`record-browser-gif`。
- 编码器支持视频和截图输入；针对性的媒体测试固定时序、尺寸、大小限制、无效输入拒绝行为、目标文件保留、并发发布，以及带引号的帧路径。它按[维护安全决策](../bug-fix/2026-10-30-close-maintenance-gaps.md)验证同目录临时文件，再原子发布。
- 该 skill 不点名任何 deepseek-harness 特定的路径、命令或状态根；剩余的具体名称是具名示例（`.playwright-mcp/`、基于 GitHub 的 assets 分支工作流）与编码器声明的依赖，属于 skill 主题而非宿主耦合。通用化替换记录于此，供后续移植宿主耦合的 skill 复用。
