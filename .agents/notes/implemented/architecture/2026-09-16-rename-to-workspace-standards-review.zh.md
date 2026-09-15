# Agent Note: 把 repo-standards-review 重命名为 workspace-standards-review 并接通治理技能

Status: implemented

[English](2026-09-16-rename-to-workspace-standards-review.md) | 中文

## 问题

这个 skill 的名字和描述宣称了与 Matt 的 `code-review` 相同的触发条件——审查 pull request 或分支——而[技能地图](../../../../docs/skills-map.md)把 review 流程判给 Matt 的 skill，只把检查清单的内容留给它。两个 skill 对「review 我的分支」都能作答，但深度不同、严重度词汇不同，而两者的描述都无法让读者判断该跑哪一个。另外，这个 skill 把行文、记录、翻译的**文件**列为出处，却没有列出拥有它们的治理 **skill**，于是一次需要结构性文档处理、对应语言更新或记录替代检查的评审，找不到可点名交接的归属者。

## 决策

把该 skill 重命名为 [`workspace-standards-review`](../../../../skills/agent/workspace-standards-review/SKILL.md)，并把描述收窄到它真正拥有的面：针对本 workspace 成文标准的变更评审——skill 的 frontmatter 与正文、文档与双语配对、Agent Note、脚本——外加在双轴评审运行时提供 Standards 轴。流程级的触发条件留给 Matt 的 `code-review`。该 skill 自身的措辞用 "workspace"，而 [CONTEXT.md](../../../../CONTEXT.md) 为 pack 定义 **Workspace**（会话操作的根），**Host repository** 保留身份归属那一轴。

把治理 skill 接进 `## Sources of truth`，各就各位地挨着它拥有的产物：`doc-standards`（位置、结构、预算审计）、`archive-agent-notes`（替代与归档）、`translate-docs`（对应语言更新）、`setup-demon-skills`（脚手架，使缺失的约定被报告而不是被凭空发明）。`pre-push-checks` 被点名为「哪些检查覆盖某次 diff」的归属者，`writing-for-agents` 则在 Matt 的行文 pack 已安装时被点名为面向 agent 交付框架的归属者。

## 备选方案

- **保留名字，只收窄描述。** 否决：「repo standards」读起来就是 Matt 的 skill 已经拥有的、面向代码的 Standards 轴，而这正是要消除的撞车点。
- **退回 `repo-standards-review`，只保留收窄后的描述。** 否决：修复本就由描述承载，名字因而可以跟随评审实际运行所在的 harness 侧用词；退回去只是让 pack 维持单一词汇，并无收益。
- **在正文里声明双轴评审会加载这份清单。** 暂不采纳：描述已经承载了供给方向，而写给另一个 pack 的子 agent 的指令应属于那个 pack。
- **连参考文件一起改名**——`references/code-review-checklist.md` 与评审 skill 同名。保持原样：文件名说明了它承载什么，改名会牵动移植它的那条记录，却不改变行为。
- **只更新活引用，历史 Agent Note 继续沿用旧名。** 否决：implemented 记录要随已发布的名称与路径保持最新，而且目录移动已经破坏了它们的相对链接。

## 后果

- pack 的标准评审 skill 现为 `workspace-standards-review`；24 个文件中的 58 处提及——根 `AGENTS.md`、插件清单、技能地图双语对、`ask-demon`、`translate-docs`，以及八组历史 Agent Note 三件套——都带着当前的名称与路径。
- 发现路径按意图分开：Matt 的 `code-review` 拥有「审查自某个固定点以来的 diff」，带它的 Spec 轴与 smell 基线；本 skill 拥有本 workspace 的标准出处，以及标准审查所要加载的代码面检查清单。
- 文档治理集从评审即可触达：`doc-standards`、`translate-docs`、`archive-agent-notes`、`find-simplifications` 都在其判断适用的位置被点名。
- `CONTEXT.md` 在 **Host repository**（约定的归属）之外定义 **Workspace**——会话操作的根；术语表固定 `workspace（工作区）`。
