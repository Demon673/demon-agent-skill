# Agent Note: 恢复 trim-cot-leakage 的非泄漏边界

Status: implemented

[English](2026-08-20-restore-trim-cot-leakage-boundaries.md) | 中文

## 问题

发布的 `trim-cot-leakage` skill（技能）保留了 `dsh-trim-cot-leakage` 的 taxonomy（分类法）、唯一测试，以及一份六条 keep（保留）清单，却压缩掉了「什么是非泄漏」中防止误报的边界项：运行时 old/new 状态、Agent Note（决策记录）变更叙事小节里的历史阶段名称、项目语气与体裁形式，以及作为受认可引用层的 postmortem（事故复盘）。工作流还丢掉了 `vendor/` 与录制 fixture（固定样例）、snapshot（快照）的排除，只保留封存 Agent Note。照此 skill 做一次未受辅助的遍历会删除持久引用、保留死引用——该 skill 针对这一失败模式的警告，连同它所命名的边界一起被删掉了。

## 决策

在 `skills/agent/trim-cot-leakage/SKILL.md` 中恢复完整的「什么是非泄漏」边界清单，并做通用化。宿主无关的措辞取代 deepseek-harness 的具体细节：lint-disable `-- reason` 子句、coverage-ignore 理由与 empty-catch 说明取代 oxlint 示例，design-artifact 名称（某个 Figma frame）与标准小节（RFC 9110 §10.1.5）并列为外部可解析的具名示例。8 类 taxonomy 与唯一测试保持不变。工作流排除改为「绝不触碰 `vendor/`、封存 Agent Note，或录制 fixture 与 snapshot」。边界清单保持内联——恢复后的正文为 44 行，低于把它挪进 `references/` 的约 60 行阈值。本记录恢复而非推翻 [2026-08-18-publish-general-skills](2026-08-18-publish-general-skills.md) 记录的解耦决策。

## 备选方案

- **保留六条清单、只靠唯一测试。** 否决：唯一测试只陈述可解析性，不陈述被列举的保留项；没有它们，一次遍历会把「旧连接排空后新连接才接收」当作变更叙事删除，并把 issue 引用搬进 Agent Note。
- **把边界清单挪进 `references/`。** 否决：恢复后的正文保持在约 60 行阈值以内，保留规则是 skill 防误报的核心契约而非条件性参考，源 skill 也把它们保持内联。
- **恢复源 skill 的「examples calibrate each」指引。** 否决：本仓库的 `references/examples.md` 是压缩版移植，没有「Keeps」一节，该指引会言过其实；保留规则本身已自包含。

## 后果

- `skills/agent/trim-cot-leakage/SKILL.md` 从 40 行增至 44 行，重新点名遍历必须保留的防误报边界项。
- 本 skill 保持宿主无关：被列举的保留项使用宿主无关示例（RFC 小节、Figma frame 名称、`vendor/`、`#1470`），而非 deepseek-harness 的路径或命令。
- 工作流排除现在覆盖 vendored 代码与录制 fixture、snapshot，而不只是封存 Agent Note。
