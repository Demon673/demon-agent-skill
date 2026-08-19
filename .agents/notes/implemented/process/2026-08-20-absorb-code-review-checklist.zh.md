# Agent Note: 将 dsh-code-review checklist 并入 repo-standards-review

Status: implemented

[English](2026-08-20-absorb-code-review-checklist.md) | 中文

## 问题

`repo-standards-review` 针对仓库标准评审变更——skill（技能）frontmatter 与正文、文档与双语配对、Agent Note（决策记录）、脚本——但没有承载代码面的评审指导：生命周期、并发、invariant、disposal 及其他实现语义。deepseek-harness 的 `dsh-code-review` skill 恰好持有这份 checklist，通用化的 1:1 移植应放在这里，使代码面评审不丢失覆盖。

准备移植时发现 [fusion note](2026-08-19-fuse-find-simplifications.md) 有一处事实错误：它声称四个文档侧简化手段（一个事实一个归属、查重、手搓清单、变更史叙述）「能干净地并入」`find-simplifications`，但它们在后者中零存在。

## 决策

为 `repo-standards-review` 新增 [`references/code-review-checklist.md`](../../../../skills/agent/repo-standards-review/references/code-review-checklist.md)：一份通用化的 `dsh-code-review` 1:1 移植，保留全部六条 blocking requirement 与 manual check，同时参数化 deepseek-harness 的出处——standing order 与 package rule、defensive-patterns 文档、prose standard、testing 文档、change-scope 工具、invariant 与 disposal 约定、翻译规则与术语。在 `repo-standards-review/SKILL.md` 中加一行指针，使代码面评审加载该 reference。

就地更正 fusion note 的事实表述：四个文档侧手段位于 `docs/AGENTS.md` 的层级分类与 slop checklist，以及 `prose-standard`、`trim-cot-leakage`——不在 `find-simplifications` 里。融合决策后来被部分推翻：doc-standards 半部分已在 [2026-08-20-absorb-doc-standards](2026-08-20-absorb-doc-standards.md) 中以完整对等恢复；仅 find-simplifications 半部分保留。

## 备选方案

- **把代码面 checklist 留在 `repo-standards-review/SKILL.md`。** 否决：checklist 是仅代码面评审才需要的条件性参考，放在指针之后能让 skill 保持简洁。
- **不覆盖代码面评审。** 否决：生命周期、并发、invariant 与 disposal 评审正是 code review 的实质，且这份 checklist 已有现成可移植。
- **保留 fusion note 的错误表述。** 否决：它误述了这些手段的归属，而 implemented note 必须与交付的现实一致。

## 后果

- `repo-standards-review` 现在通过 `references/code-review-checklist.md` 覆盖代码面评审语义，由指针按需加载而非始终加载。
- fusion note 记录了四个文档侧手段的实际归属，读者不再去 `find-simplifications` 里找它们。
