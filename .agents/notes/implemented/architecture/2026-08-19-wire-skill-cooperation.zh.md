# Agent Note: 接通 skill 之间的配合边

Status: implemented

[English](2026-08-19-wire-skill-cooperation.md) | 中文

## 问题

各 skill 此前只靠各自触发；只有 `find-simplifications` → `archive-agent-notes` 这一处被接通。本该交接的相邻 skill——审查发现简化候选、归档动了双语对、push 前需要语义审查——都没有显式配合，流程依赖模型自己去猜下一步。

## 决策

接通四条配合边，同时保持每个 skill 独立可调用：description 不变，交接只是正文里的软指针，不是硬依赖。

- `repo-standards-review` → `find-simplifications`：审查发现死面、重复、投机或过度构建的表面时，把这些候选交给 `find-simplifications`。
- `repo-standards-review` → `trim-cot-leakage` 与 `prune-prompt-pollution`：这两个分别负责审查所检查的「推理转录」和「提示污染」两类臭味。
- `archive-agent-notes` → `translate-docs`：入链修复若编辑了活跃的双语文档，就把 counterpart 更新交给 `translate-docs`。
- `pre-push-checks` → `repo-standards-review`：因 `pre-push-checks` 是发布且自包含的 skill、不能引用内部的 `repo-standards-review`，这条边落在根 `AGENTS.md` 里，作为 push 前的语义门禁。

## 备选方案

- **单一固定顺序的线性管道。** 否决：每个 skill 有各自的触发且必须保持独立可调用；强行排成一个顺序会增加路由层，并把本可单独使用的 skill 耦合起来。
- **把 pre-push 边写进 `pre-push-checks`。** 否决：`pre-push-checks` 是发布且自包含的 skill；引用内部的 `repo-standards-review` 会破坏它在别处的安装，所以这条边落在根 `AGENTS.md`。

## 后果

- 配合图变得显式：审查 → 简化 → 归档 → 翻译，`prose-standard`/`trim-cot-leakage`/`prune-prompt-pollution` 作为共享的 prose 工具。
- 每个 skill 仍独立可调用；交接是正文里的软指针。
- `pre-push-checks` 保持通用；仓库本地的 push 前审查门禁记录在 `AGENTS.md`。
