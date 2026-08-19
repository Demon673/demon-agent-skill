# Agent Note: 吸收 record-browser-gif

Status: implemented

[English](2026-08-20-absorb-record-browser-gif.md) | 中文

## 问题

本仓库没有任何把浏览器或 Web UI 交互录制成优化 GIF 的 skill（技能）。deepseek-harness 的 `record-browser-gif` skill 完整覆盖该流程——基于状态的帧捕获、确定性编码，以及 assets 分支发布——但它按宿主仓库书写：点名宿主的构建命令、`DSH_HOME`/`DSH_AGENTS_HOME` 状态根、"real API key and real model rounds"、宿主的 browser-control skill，以及宿主本地的 evidence-chain note。要在这里发布，就必须把它通用化，使其不点名任何宿主特定的路径、命令或架构事实。

## 决策

以 1:1 移植加下述通用化的方式，把它吸收为 `skills/agent/` 下的 [`record-browser-gif`](../../../../skills/agent/record-browser-gif/SKILL.md)。编码器 `scripts/encode_gif.py` 原样复制（它已通用），并按仓库约定新增 `agents/openai.yaml`。通用化处理：宿主的构建命令改为 "the repository's build commands for the recorded tree"；`DSH_HOME`/`DSH_AGENTS_HOME` 改为 "the application's fresh state roots"；"real API key and real model rounds" 改为 "a real server, real credentials, and real data flow (real model rounds where the app is model-backed)"；宿主的 browser-control skill 改为 "the repository's browser-control skill when available, otherwise the repository-declared Playwright dependency"；宿主的 evidence-chain note 链接被删除，因为 staging 规则已经陈述了该理由。保留：面向用户可见 GUI 的 PR（Pull Request）的 MUST-GIF 规则、staging 与证据规则、帧纪律、`GIF_SKILL_DIR` 编码器调用方式、验证步骤、带 `?raw=true` 的 assets 分支发布，以及 PR head 的复查。

## 备选方案

- **原样保留宿主引用后移植。** 否决：skill 会点名宿主的构建命令和状态根，违反本仓库禁止宿主特定路径和命令的规则，且 evidence-chain 链接会失效。
- **改写成更薄的 skill。** 否决：该流程的价值在于其精确的 staging、帧与发布纪律；改写可能丢掉让录制可信的验证步骤。
- **跳过移植。** 否决：本仓库没有 GIF 录制 skill，而该流程对任何浏览器 UI 都通用，可直接在此复用。

## 后果

- 发布的 skill 集合增加一个：`record-browser-gif`。
- 编码器逐字节保留，其时序、尺寸与大小检查原样迁移。
- 该 skill 不点名任何 deepseek-harness 特定的路径、命令或状态根；剩余的具体名称是具名示例（`.playwright-mcp/`、基于 GitHub 的 assets 分支工作流）与编码器声明的依赖，属于 skill 主题而非宿主耦合。通用化替换记录于此，供后续移植宿主耦合的 skill 复用。
