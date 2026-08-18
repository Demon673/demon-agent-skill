# Agent Note: 发布三个通用 skill 并重命名 code-review

Status: implemented

[English](2026-08-18-publish-general-skills.md) | 中文

## 问题

内部的 `.agents/skills/` 里有四个具备通用内核、却耦合于本仓库的 skill：`prose-standard`、`trim-cot-leakage`、`pre-push-checks` 和 `code-review`。前三个引用了本仓库的 docs、scripts 以及彼此，因此无法装进 global skill 目录。`code-review` 还与全局安装的 `mattpocock/skill` 通用 `code-review` 同名冲突。

## 决策

把 [`prose-standard`](../../../../skills/agent/prose-standard/SKILL.md)、[`trim-cot-leakage`](../../../../skills/agent/trim-cot-leakage/SKILL.md) 和 [`pre-push-checks`](../../../../skills/agent/pre-push-checks/SKILL.md) 发布到 `skills/agent/` 下，各自解耦为自包含：跨 skill 引用改为内联，工具命令泛化为「你仓库的 …」。把内部的 [`code-review`](../../../../.agents/skills/repo-standards-review/SKILL.md) 重命名为 `repo-standards-review` 并保留在 `.agents/skills/` 下，使其不再遮蔽全局的 `code-review`。

## 备选方案

- **只解耦、留内部。** 否决：自包含的内部 skill 不是可安装到 global 的产物。
- **发布但保留跨引用。** 否决：装进 global 的 skill 无法解析本仓库的 docs、scripts 或同级 skill。
- **保留 `code-review` 名称。** 否决：与全局安装的 mattpocock `code-review` 冲突，后者审代码 diff，而非本仓库的文档纪律。

## 后果

- 发布清单从 12 增至 15 个 skill；内部集合从 9 减至 6 个。
- `repo-standards-review` 现在成为本仓库专属的产物评审 skill，与通用 `code-review` 区分开。
- 三个发布的 skill 自包含，可干净装进 global。
