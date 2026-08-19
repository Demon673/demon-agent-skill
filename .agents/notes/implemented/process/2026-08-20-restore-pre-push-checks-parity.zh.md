# Agent Note: 恢复 pre-push-checks 与 dsh-pre-push-checks 的功能对等

Status: implemented

[English](2026-08-20-restore-pre-push-checks-parity.md) | 中文

## 问题

发布的 `pre-push-checks` skill（技能）只保留了 `dsh-pre-push-checks`（deepseek-harness 仓库 `.agents/skills/dsh-pre-push-checks/SKILL.md`）的通用选择骨架：确认 checkout、列出通用的 skill/docs/双语/空白检查、force-with-lease，以及四步 push 流程。移植丢掉了证据选择机制——带 `--base`/`--head` 的 change-scope 报告、代码与行为证据条目、同时点名所属测试与所覆盖源码的单元覆盖率选择、完整本地预演、stack-sync 重写后的 post-sync 验证，以及 PR（Pull Request）CI 检查。两个 skill 不再共享行为，且该 skill 自己的描述——选择覆盖即将推送的 diff 的最小检查——已与一份无从计算该范围的正文不符。

## 决策

把 `pre-push-checks` 重写为已发布的通用检查与被恢复机制的并集，并把宿主引用参数化：仓库的 change-scope 工具（存在时）、其测试运行器与覆盖率标志、其校验器与文档 gate（门禁）、以及 `gh pr checks` 取代 deepseek-harness 的路径、命令与架构事实。具体的宿主事实只以清晰标注的具名示例保留（`pnpm --silent run change-scope --base <ref>`、Vitest `--coverage.include`、`gh stack sync`）。发布名称与调用默认值不变。正文保持 `SKILL.md` 自包含、不拆 `references/`，因为合并后正文为 100 行——低于约 110 行的预算——且每个被恢复的章节都是工作流步骤，不是条件性参考。本记录扩展而非推翻 [2026-08-18-publish-general-skills](2026-08-18-publish-general-skills.md) 记录的解耦决策：通用检查保留，被丢掉的机制以通用化形式回归。

## 备选方案

- **保留漂移后的正文。** 否决：用户要求与 `dsh-pre-push-checks` 功能一致并通用化，被丢的机制——change-scope、覆盖率选择、完整本地预演、post-sync 验证、PR CI——正是主要价值。
- **恢复机制但保留 deepseek-harness 专属写法。** 否决：本仓库发布可移植 skill，移植必须能在任何宿主仓库运行，因此路径、命令与架构事实变为参数化引用并附带具名示例。
- **把平台专属的命令示例拆进 `references/`。** 否决：dsh 原版自包含，对等规格要求证据选择工作流留在单一正文内；Vitest/pnpm/`gh` 调用均以具名示例出现。与 find-simplifications 的对等决策一致。
- **把条件性章节拆进 `references/`。** 否决：合并后正文低于约 110 行预算，且每个被恢复的章节都是每个分支都会到达的工作流步骤，不是条件性参考。

## 后果

- `skills/agent/pre-push-checks/SKILL.md` 从 50 行增至 100 行，重新从计算出的输出范围选择最小检查，而不再只列出通用检查。
- 本 skill 保持宿主无关：在 deepseek-harness 中运行会从同一份正文复现 dsh 风格的行为；在任何其他仓库中运行则把同一工作流套用到该宿主的工具上。
- 通用的 skill/docs/双语/空白检查保留，因此本 skill 仍能覆盖一个没有 change-scope 工具或 Vitest 的、只有文档与 skill 的仓库。
