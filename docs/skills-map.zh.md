# 技能地图：deepseek-harness 吸收状态

[English](skills-map.md) | 中文

本参考文档把每个 deepseek-harness skill（技能）对应到它在本仓库的处置结果。一个能力一个归属：Matt 的 pack 已拥有的能力，本 pack 只记录 seam（边界）而不造第二个 skill。吸收的含义是：1:1 移植、泛化（除具名示例外不保留 deepseek-harness 路径、命令或架构事实）、普通命名、以及一条 implemented Agent Note（决策记录）记录处置。

| deepseek-harness skill | 处置 | 本仓库对应物 | 记录 |
|---|---|---|---|
| dsh-find-simplifications | 已吸收；对等已验证 | skills/agent/find-simplifications/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-find-simplifications-parity.md) |
| dsh-pre-push-checks | 已吸收；证据选择机制已恢复 | skills/agent/pre-push-checks/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-pre-push-checks-parity.md) |
| dsh-prose-standard | 已吸收；代码行文覆盖以并集恢复 | skills/agent/prose-standard/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-prose-standard-parity.md) |
| dsh-translate-docs | 已吸收；简报与门禁机制已恢复；调用保持默认（dsh 为仅用户） | skills/agent/translate-docs/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-translate-docs-parity.md) |
| dsh-archive-agent-notes | 已吸收；i18n sidecar 步骤已恢复 | skills/agent/archive-agent-notes/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-archive-agent-notes-sidecar.md) |
| dsh-trim-cot-leakage | 已吸收；非泄漏边界清单已恢复 | skills/agent/trim-cot-leakage/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-restore-trim-cot-leakage-boundaries.md) |
| dsh-merging-stacked-prs | 已吸收；保留轻微泛化 | skills/agent/merging-stacked-prs/SKILL.md | — |
| dsh-code-review | 仅吸收检查清单；review（审查）流程归 Matt 的 code-review | skills/agent/repo-standards-review/references/code-review-checklist.md | [note](../.agents/notes/implemented/process/2026-08-20-absorb-code-review-checklist.md) |
| dsh-doc-standards | 已吸收；操作工作流以完整对等恢复为 doc-standards | skills/agent/doc-standards/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-absorb-doc-standards.md) |
| dsh-doc-site-sync | 暂缓：等某宿主仓库有文档站点投影时再移植 | — | — |
| record-browser-gif | 已吸收（含确定性编码器） | skills/agent/record-browser-gif/SKILL.md | [note](../.agents/notes/implemented/process/2026-08-20-absorb-record-browser-gif.md) |
| cordis-plugin-development | 不吸收：deepseek-harness 产品域；用其仓库原版 | — | — |
| editing-cordis-compositions | 不吸收：同上 | — | — |
| dsh-badge | 不吸收：deepseek-harness 品牌标识 | — | — |

## seam

- Matt 的 pack 拥有工程循环（grill → spec → tickets → implement → code-review）；本 pack 拥有仓库维护流（repo-standards-review → find-simplifications → archive-agent-notes → translate-docs）、行文工具层与独立工具。ask-demon 负责路由两者。
- code-review：Matt 的 code-review 是唯一 review 入口。deepseek-harness 的 review 检查清单已泛化进 repo-standards-review 的 references，任何 Standards 轴审查在面向代码的变更时都可以加载它。
- translate-docs：deepseek-harness 原版仅用户可触发；此处保持 model+user 可达，因为维护流级联需要它。
- writing：Matt 的写作技能（`writing-for-agents` 及其同族）拥有 agent-facing 交付框架——指针措辞、信息层级、渐进披露、剪枝；`prose-standard` 拥有 agent-facing 文档必须说什么。
