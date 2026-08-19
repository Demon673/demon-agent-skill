# Agent Note: 以完整对等吸收 dsh-doc-standards

Status: implemented

[English](2026-08-20-absorb-doc-standards.md) | 中文

## 问题

2026-08-19 的融合以"薄包装"为由删除了 `doc-standards`，并声称其文档侧手段折叠进了 `find-simplifications`。漂移审计证伪了这一说法：操作层——结构先于行文的放置工作流、四条放置成本约束、六条语料审计探测、预算变红的探测工作流——无处安家，且 `docs/AGENTS.md` 错误地把 `find-simplifications` 指认为 slop 清单审计者。

## 决策

以与 `dsh-doc-standards` 完整对等、泛化（不精简）的方式复活 `doc-standards`：所有跨 skill 与文档引用一律按名称而非仓库相对路径，且任何命令示例都不点名特定仓库的脚本，使该 skill 在任何宿主仓库中原样可用。具体包括：真源指针、五步结构审计、放置成本约束、六条语料审计探测、预算变红工作流、验证与 PR 卫生章节全部保留。并融入流程：`ask-demon` 的行文工具层扩展为四技能的"行文与文档"层，`setup-demon-skills` 脚手架它所应用的文档标准，`docs/AGENTS.md` 指向它负责放置、验证与 slop 审计。至此十一分之十一的维护 skill 吸收全部兑现，并部分取代融合笔记的 doc-standards 半部分（保持交叉链接）。

## 备选方案

- **精简版。** 否决：用户要求深度对等；操作探测与顺序规则正是价值所在。
- **把工作流并入 prose-standard。** 否决：文档结构不是行文；扩大 prose-standard 职责会稀释两者。
- **维持融合现状。** 否决：四组命题无处安家，且 docs/AGENTS.md 的失实指针会把真实审计导错方向。

## 后果

- 十一个 deepseek-harness 维护 skill 全部真正吸收；技能地图与融合笔记记录了这一反转。
- `doc-standards` 拥有放置、结构、语料审计与预算探测；`prose-standard` 拥有编辑判断；`find-simplifications` 拥有可移除表面调查。
- 新宿主仓库由 `setup-demon-skills` 脚手架文档标准，使 `doc-standards` 从第一天起就有标准可执行。
