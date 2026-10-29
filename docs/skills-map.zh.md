# 技能地图：deepseek-harness 吸收状态

[English](skills-map.md) | 中文

本参考文档把 deepseek-harness 在版本 [`f3803c9`](https://github.com/deepseek-ai/deepseek-harness/tree/f3803c96974ad4a94195fb97e5c637e9c2a3afe3/.agents/skills) 中的 skill（技能）对应到本仓库的处置结果。已吸收的 skill 是可移植的适配版本，而非逐字镜像；[同步决策](../.agents/notes/implemented/process/2026-10-30-sync-upstream-skills.md)记录保留的差异。治理概念——absorption（吸收）、seam（边界）、host repository（宿主仓库）——定义在 [GLOSSARY.md](../GLOSSARY.md)。

| deepseek-harness skill | 处置 | 本仓库对应物 | 记录 |
|---|---|---|---|
| dsh-find-simplifications | 已吸收；要求生效路径与使用方证据 | skills/agent/find-simplifications/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-find-simplifications-parity.md) |
| dsh-pre-push-checks | 已吸收；证据选择机制已恢复 | skills/agent/pre-push-checks/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-pre-push-checks-parity.md) |
| dsh-prose-standard | 已吸收；代码行文覆盖以并集恢复 | skills/agent/prose-standard/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-prose-standard-parity.md) |
| dsh-translate-docs | 已吸收；简报与门禁机制已恢复；调用保持默认（dsh 为仅用户） | skills/agent/translate-docs/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-translate-docs-parity.md) |
| dsh-archive-agent-notes | 已吸收；i18n sidecar 步骤已恢复 | skills/agent/archive-agent-notes/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-archive-agent-notes-sidecar.md) |
| dsh-trim-cot-leakage | 已吸收；非泄漏边界清单已恢复 | skills/agent/trim-cot-leakage/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-trim-cot-leakage-boundaries.md) |
| dsh-merging-stacked-prs | 已吸收；保留轻微泛化 | skills/agent/merging-stacked-prs/SKILL.md | — |
| dsh-code-review | 仅吸收检查清单；review（审查）流程归 Matt 的 code-review | skills/agent/workspace-standards-review/references/code-review-checklist.md | [note](../.agents/notes/archived/process/2026-08-20-absorb-code-review-checklist.md) |
| dsh-doc | 已吸收可移植的放置规则与操作验证；不引入宿主模板和站点投影 | skills/agent/doc-standards/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-absorb-doc-standards.md) |
| record-browser-gif | 已吸收（含确定性编码器） | skills/agent/record-browser-gif/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-absorb-record-browser-gif.md) |
| dsh-ci-test-reliability | 暂缓作为独立 skill；可移植的审查问题已纳入推送前检查和代码审查 | — | — |
| dsh-error-handling | 暂缓：新增 trigger（触发条件）前，先与现有诊断和审查流程核对 | — | — |
| dsh-speed-up-perf | 暂缓：需要单独设计可移植的性能分析流程 | — | — |
| dsh-pr-description | 不吸收：宿主 PR（Pull Request）政策；入口归已安装的 pr skill | — | — |
| dsh-create-upgrade-guide | 不吸收：宿主版本发布与兼容性记录 | — | — |
| dsh-client-ui-ux | 不吸收：宿主客户端约定与组件 | — | — |
| dsh-responsive-ui | 不吸收：宿主客户端布局与输入约定 | — | — |
| dsh-session-projection | 不吸收：宿主 Session 服务与持久化 | — | — |
| dsh-official-plugin-artwork | 不吸收：宿主插件品牌与元数据 | — | — |
| cordis-styling-nitpicking | 不吸收：宿主 Cordis 生命周期审查 | — | — |
| agent-experience | 不吸收：从其包链接的宿主预设 skill | — | — |

## seam

- Matt 的 pack 拥有工程循环（grill → spec → tickets → implement → code-review）；本 pack 拥有仓库维护流（workspace-standards-review → find-simplifications → archive-agent-notes → 配对验证）、行文工具层与独立工具。ask-demon 负责路由两者。
- code-review：Matt 的 code-review 是唯一 review 入口。deepseek-harness 的 review 检查清单已泛化进 workspace-standards-review 的 references，任何 Standards 轴审查在面向代码的变更时都可以加载它。
- translate-docs：deepseek-harness 原版仅用户可触发；此处保持 model+user 可达，用于明确的翻译任务。常规对应版本编辑随其所属变更直接完成，不调用扩展工作流。
- writing：Matt 的写作技能（`writing-for-agents` 及其同族）拥有 agent-facing 交付框架——指针措辞、信息层级、渐进披露、剪枝；`prose-standard` 拥有 agent-facing 文档必须说什么。
