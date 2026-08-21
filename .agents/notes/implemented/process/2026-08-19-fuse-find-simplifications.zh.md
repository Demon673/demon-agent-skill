# Agent Note: 将 find-simplifications 与 doc-standards 融合为一个通用 skill

Status: implemented

[English](2026-08-19-fuse-find-simplifications.md) | 中文

## 问题

`find-simplifications` 有通用内核——survey 死面/重复/投机/过度构建的表面、用消费方证据证明或否决、并记录有价值的候选——但它的「记录」半段耦合了本仓库的 Agent Note 格式和 `archive-agent-notes`。`doc-standards` 持有文档侧的简化手段（一个事实一个归属、查重、手搓清单、变更史叙述），而它的仓库专属部分（层级分类、预算、门禁）本就写在 `docs/AGENTS.md` 里，使该 skill 只剩一层薄薄的 wrapper。

## 决策

把两者融合为一个发布、自包含的 [`find-simplifications`](../../../../skills/agent/find-simplifications/SKILL.md)，放在 `skills/agent/` 下：它 survey 代码、文档和 skill，用消费方证据证明或否决每个候选，并把提案记录到宿主仓库的决策记录系统或行内 `TODO(tag)` 标记。find-simplifications 半部分成立；doc-standards 半部分由 [2026-08-20-absorb-doc-standards](2026-08-20-absorb-doc-standards.md) 取代——它以完整对等恢复为已发布 skill。

## 备选方案

- **两者都保留，只发布 find-simplifications。** 否决：`doc-standards` 只是 `docs/AGENTS.md` 的薄 wrapper，两个重叠的维护 skill 正是本 note 要取代的打包。
- **保留内部 doc-standards、丢弃 find-simplifications。** 否决：survey+证明 流程才是值钱的一半，且它是通用的；文档侧手段已由 `docs/AGENTS.md`（层级分类与 slop checklist）以及 `prose-standard`、`trim-cot-leakage` 承载，保留 `doc-standards` 只会重复这些归属。

## 后果

- 一个自洽的通用「找简化」skill 覆盖代码、文档和 skill，且无任何跨引用。
- doc-standards 重新成为已发布的流程 skill（见吸收它的笔记）；本记录剩余的声明仅为 find-simplifications 的融合。
- 文档的定位与预算由 `docs/AGENTS.md` 直接管辖；文档侧手段住在 `docs/AGENTS.md` 的层级分类与 slop checklist，以及 `prose-standard`、`trim-cot-leakage` 中。
