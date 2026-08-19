# Agent Note（决策记录）

[English](README.md) | 中文

这里存放一种设计文档。**Agent Note** 记录影响本仓库的决策或提案——代码和 skill 无法承载的*为什么*和*放弃了什么*。本文件定义 Agent Note 的位置、何时撰写以及文件内格式。

## 布局与命名

每个 Agent Note 有两个维度，都编码在**路径** `{lifecycle}/{class}/yyyy-mm-dd-topic-title.md` 中：

- **Lifecycle**（顶层目录）是 note 的状态，状态变化时 note 会在目录之间移动：
  - **`proposed/`** —— 实现前评审的提案；尚未实现（或仅部分实现）。
  - **`implemented/`** —— 决策已落地。文件记录决定了什么、否定了什么，并且**与实际落地内容保持同步**：当仓库后来重命名某个 skill 或更改某个默认值时，note 在同一次变更中同步更新（仅事实——路径、名称、默认值——而非决策本身）。参见 [implemented/AGENTS.md](implemented/AGENTS.md)。
  - **`rejected/`** —— 提案经审议被否决。仅当其理由仍能防止一个有诱惑力、有意义的错误时才保留；否则删除完整的三件套。
- **Class**（嵌套目录）是决策的*类型*——见下文的分类一节。

文件名中的日期是主题**首次提出**的时间。交叉引用使用相对 Markdown 链接，绝不使用裸文件名或 note 编号，这样既能被检查，也能在目录间移动后仍然有效。不要建立中心索引；直接浏览 lifecycle/class 目录。

## 分类

每个 note 归属于以下封闭集合中的一个路径编码类型：

| 类型 | 覆盖内容 |
|---|---|
| `feature` | 新的用户或 agent 可感知能力。 |
| `bug-fix` | 修正缺陷，或补齐事后复盘暴露的缺口。 |
| `simplification` | 在不增加能力的前提下移除表面、行文或代码。 |
| `architecture` | 关于仓库组织方式以及 skill 之间关系的结构性决策。 |
| `process` | 围绕仓库的工具、政策或工作流——门禁、命名、发布——而非运行时行为。 |
| `testing` | 校验与策略。 |

`architecture` / `process` 的分界线：**architecture** 关乎仓库结构；**process** 是外围的工具与工作流。

## 封存与删除

当已实现的决策完整落地、其理由不太可能再指导后续工作时，封存该 implemented note。当它的备选方案、所有权边界、负面保证或重新引入条件仍然有用时，保持活跃。提案类 note 永不封存：废弃的提案应予以否决。仅当被否决的 note 仍能防止一个似是而非的错误时才保留；否则将完整的三件套一起删除。使用 [`archive-agent-notes`](../../skills/agent/archive-agent-notes/SKILL.md) 来做判断，而不是依赖字数、时长或配额。

封存路径编码为 `archived/{class}/yyyy-mm-dd-topic-title.md`；之所以刻意没有 `implemented`，是因为只有 implemented note 才能进入封存。封存变更会移动完整的三件套，保留 `Status: implemented`，并在两种语言文件中的该状态行正下方插入相同的 `Archived: YYYY-MM-DD` 行，同时修复或删除入站链接。这些是封存期间仅允许的内容变更。一旦封存，归档的三件套即被冻结：永不编辑、翻译、重排或删除，也永不将其视为当前行为的权威。

## 何时撰写

每个非平凡的变更都**必须**在同一 PR 中新增或更新至少一个 Agent Note。当变更改变了某个 skill 的行为、仓库的结构或约定、流程或工具，或其他维护者可能重新审视的决策时，它就是非平凡的。为后续重大工作提出的提案从 `proposed/` 开始；已经做出的决策从 `implemented/` 开始。更新已拥有该决策的 note 即可满足规则；不要创建重复项。纯粹的机械或局部编辑，只要不改变行为、结构、流程或理由，即可豁免。

note 绝不改写成*另一个决策*：用新 note 取代它，并让两者互相交叉链接。完全被取代的 note 可在保留其独特理由、备选方案和后果、并修复入站链接后，合并进当前拥有者并删除；部分取代则让两者保持交叉链接。

## 文件内格式

每个活跃 note 遵循统一的文件内格式。

### 头部块

前三行严格为：

```markdown
# Agent Note: <title>

Status: <status>
```

之后是一个空行。`Status:` 取以下三种形式之一，且必须与 lifecycle 目录一致：

- `Status: proposed`
- `Status: implemented`
- `Status: rejected — <why, in one line>`

状态不携带日期：文件名保存首次提出的日期。被否决的原因是有内容的那一种状态，因为被否决 note 的结论正是读者要看的重点。

### 正文骨架

每个 note 的正文以 `## Problem` 开头——动机，独立于解决方案而成立。重复出现的章节使用这些规范名称；真正专门的技术章节在必需章节之间保持自由形式。

#### `proposed/`

```markdown
## Problem
## Proposal
…bespoke sections…
## Alternatives considered
## Acceptance criteria
## Risks
```

`## Proposal` 可以用将来时表述——在尚未实现时，计划与迁移步骤属于这里。`## Acceptance criteria` 说明怎样的可观察状态算完成。`## Risks` 覆盖可能出错的地方，以及该变更明知放弃的东西。

#### `implemented/`

```markdown
## Problem
## Decision
…bespoke sections…
## Alternatives considered
## Consequences
```

`## Decision` 用现在时描述已落地的现实。`## Consequences` 记录这个取舍付出了什么、换来了什么。implemented note 中不得出现提案期的标题（`## Proposal`、`## Plan`、`## Acceptance criteria`）。

#### `rejected/`

被否决的 note 保留提案期原有的章节，结论记录在 `Status:` 行。

### Alternatives considered —— 必需

每个 note 都带有 `## Alternatives considered` 章节：每个真实的备选方案及其落败原因，每个备选方案一个加粗开头的段落。一个没有记录它击败了什么的决策，会招致重新争论。

### 在生命周期之间移动

在生命周期目录之间移动文件，意味着在同一次变更中更新 `Status:` 行并重新满足该目录的骨架。`proposed/` → `implemented/` 会把 `## Proposal` 改写为现在时的 `## Decision`，并把 `## Acceptance criteria` 和 `## Risks` 合并进 `## Consequences`。`proposed/` → `rejected/` 仅在 `Status:` 行添加原因并冻结文件。

### 中文对应版本

`.zh.md` 对应版本按照 [i18n 契约](../../docs/i18n/README.md) 逐节镜像英文原文；机器检查的头部标记（`# Agent Note: ` 与 `Status:`）保持英文原文。配对门禁（`node scripts/verify-translation-pairing.mjs`）执行三件套的完整性、记录的 blob 哈希、切换链接和结构签名；内容一致性和翻译质量由评审负责。
