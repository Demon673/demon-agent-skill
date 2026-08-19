# Agent Note: 恢复 prose-standard 与 dsh-prose-standard 的功能对等

Status: implemented

[English](2026-08-20-restore-prose-standard-parity.md) | 中文

## 问题

发布的 `prose-standard` skill（技能）只保留了 `dsh-prose-standard`（deepseek-harness 仓库 `.agents/skills/dsh-prose-standard/SKILL.md`）的 skill 与文档这一半。[2026-08-18-publish-general-skills](2026-08-18-publish-general-skills.md) 中的解耦把必填覆盖清单收窄到 skills、描述、指令文件、README、Agent Note（决策记录）、注释与字符串，丢掉了代码行文位置——JSDoc、内部与模块注释、测试、cookbook、postmortem、diagnostics 与配置注释——以及更完整的 inputs、exclusions、工作流与 borderline 处理。两个 skill 不再共享功能：这是功能漂移而非通用化，[吸收地图](../../../../docs/skills-map.md)「代码行文覆盖以并集恢复」的处置不再匹配交付的正文。

## 决策

把 [`prose-standard`](../../../../skills/agent/prose-standard/SKILL.md) 重写为并集：保留 skill/文档的必填覆盖各节，恢复代码行文位置，并把宿主引用泛化，使正文不出现任何 deepseek-harness 路径、命令或架构事实。逐位置的覆盖清单移入 [`references/coverage.md`](../../../../skills/agent/prose-standard/references/coverage.md)，两组示例合并进 [`references/examples.md`](../../../../skills/agent/prose-standard/references/examples.md)，使 `SKILL.md` 保持简洁且不丢失任何覆盖或示例。frontmatter 名称与调用默认值不变；描述新增代码行文的触发条件。本记录落实而非推翻 [2026-08-20-absorb-dsh-skill-set](2026-08-20-absorb-dsh-skill-set.md) 记录的吸收决策。

## 备选方案

- **保留漂移后的正文。** 否决：用户要求与 `dsh-prose-standard` 并集，被丢掉的代码行文位置——JSDoc、测试、diagnostics、postmortem——正是面向代码变更时契约保真最要紧之处。
- **把完整覆盖清单留在 `SKILL.md` 内。** 否决：合并后的清单横跨十五个位置，超过简洁默认值；仓库标准把详细、条件性材料移入 `references/`，仅在 skill 触发时加载。
- **改名为 `dsh-prose-standard`。** 否决：`dsh-` 前缀标记 deepseek-harness 内部 skill；本仓库以普通名称发布可移植 skill。

## 后果

- [`SKILL.md`](../../../../skills/agent/prose-standard/SKILL.md) 保留完整命题核心与「指导而非脚本」护栏，恢复代码行文覆盖与更完整的工作流，并把逐位置细节与示例指向 `references/`。
- [`references/coverage.md`](../../../../skills/agent/prose-standard/references/coverage.md) 承载并集覆盖清单；[`references/examples.md`](../../../../skills/agent/prose-standard/references/examples.md) 合并两组示例且无遗漏。
- 描述现在点名 JSDoc、代码与测试注释、diagnostics 与 CLI 或 UI 字符串，代码行文类请求可以触发本 skill。
- 本 skill 保持宿主无关：在 deepseek-harness 中运行会从同一份正文复现 dsh 风格行为；在任何其他仓库中运行则把同一工作流套用到该宿主的约定上。
