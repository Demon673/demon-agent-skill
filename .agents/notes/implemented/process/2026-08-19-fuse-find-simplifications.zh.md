# Agent Note: 将 find-simplifications 与 doc-standards 融合为一个通用 skill

Status: implemented

[English](2026-08-19-fuse-find-simplifications.md) | 中文

## 问题

`find-simplifications` 有通用内核——survey 死面/重复/投机/过度构建的表面、用消费方证据证明或否决、并记录有价值的候选——但它的「记录」半段耦合了本仓库的 Agent Note 格式和 `archive-agent-notes`。`doc-standards` 持有文档侧的简化手段（一个事实一个归属、查重、手搓清单、变更史叙述），而它的仓库专属部分（层级分类、预算、门禁）本就写在 `docs/AGENTS.md` 里，使该 skill 只剩一层薄薄的 wrapper。

## 决策

把两者融合为一个发布、自包含的 [`find-simplifications`](../../../../skills/agent/find-simplifications/SKILL.md)，放在 `skills/agent/` 下：它 survey 代码、文档和 skill，用消费方证据证明或否决每个候选，并把提案记录到宿主仓库的决策记录系统或行内 `TODO(tag)` 标记。删除内部 `doc-standards`；它的定位与预算规则保留在 `docs/AGENTS.md` 里，根 `AGENTS.md` 已指向该文件。

## 备选方案

- **两者都保留，只发布 find-simplifications。** 否决：`doc-standards` 只是 `docs/AGENTS.md` 的薄 wrapper，两个重叠的维护 skill 正是本 note 要取代的打包。
- **保留内部 doc-standards、丢弃 find-simplifications。** 否决：survey+证明 流程才是值钱的一半，且它是通用的；文档侧手段已由 `docs/AGENTS.md`（层级分类与 slop checklist）以及 `prose-standard`、`trim-cot-leakage` 承载，保留 `doc-standards` 只会重复这些归属。

## 后果

- 发布清单从 16 增至 17 个 skill；内部集合从 5 减至 3 个。
- 一个自洽的通用「找简化」skill 覆盖代码、文档和 skill，且无任何跨引用。
- 文档的定位与预算由 `docs/AGENTS.md` 直接管辖，不再靠 wrapper skill；文档侧手段保留在 `docs/AGENTS.md` 的层级分类与 slop checklist，以及 `prose-standard`、`trim-cot-leakage` 中。
