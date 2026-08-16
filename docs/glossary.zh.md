# 术语表

[English](glossary.md) | 中文

本仓库的领域词汇中，每个概念使用一个规范术语。术语链接到其所属文档；实现细节放在 skill 和 Agent Note 中。

## documentation（文档）

- **one home per fact（一个事实一个归属）** — 每个事实恰好归属于一个层级、并在别处通过链接引用的规则；文档标准的核心。
- **slop（冗余）** — 重复某条规则、叙述变更历史、复述源码、或泄漏推理转录的行文；文档标准列出了要排查的类别。
- **tier（层级）** — 文档分类法中的一行（根 `AGENTS.md`、skill、`references/`、Agent Note、`README.md`、`docs/`），各自有职责和「不该放这里」的清单。

## skills（技能）

- **skill（技能）** — `skills/<category>/<name>/SKILL.md` 下可复用、可安装的任务指令集。
- **description（描述）** — frontmatter 中作为主要发现面的字段；以行为为基础、以触发为焦点。
- **trigger（触发）** — 应导致 agent 加载该 skill 的一个独立分支；每个分支一个，在描述中前置。
- **references（参考）** — skill 的渐进披露参考材料，仅在 skill 指针触发时加载。

## agent-notes（决策记录）

- **Agent Note（决策记录）** — `.agents/notes/` 下的持久提案或决策记录，保留理由、备选方案、后果和所需验证。
- **lifecycle（生命周期）** — 编码状态的顶层 note 目录：`proposed/`、`implemented/`、`rejected/`、`archived/`。
- **class（分类）** — 编码决策类型的嵌套目录：feature、bug-fix、simplification、architecture、process、testing。
- **supersession（取代）** — 新 note 拥有旧 note 记录的决策；完全取代则合并，部分取代则交叉链接。

## pairing（配对）

- **pair（配对）** — 一个双语文档的三个同级文件：`foo.md`、`foo.zh.md` 和 `foo.i18n.yaml` 一致性记录。
- **counterpart（对应版本）** — 英文文档的中文 `.zh.md` 同级文件，或反之。
- **sidecar（副件）** — 保存两侧 git blob 哈希的 `foo.i18n.yaml` 一致性记录。
- **switcher（切换链接）** — 每侧携带的语言切换链接：`English | [中文](foo.zh.md)` 和 `[English](foo.md) | 中文`。
- **blob hash（blob 哈希）** — 一侧的 `git hash-object` 内容哈希，记录在副件中。
- **structural signature（结构签名）** — 由 mdast 派生的文档有序形状（标题层级、代码块、表格、列表、链接目标），在配对两侧之间比较。

## gates（门禁）

- **gate（门禁）** — 一个确定性的文档检查（配对、note 格式、预算、链接、换行、封存），由 `npm run doc-gates` 运行。
- **mdast** — 这些门禁通过官方 GFM 解析器构建结构签名所用的 Markdown AST。
