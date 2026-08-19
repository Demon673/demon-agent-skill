# 领域文档

[English](domain.md) | 中文

工程 skills 在探索代码库时如何消费本仓库的领域文档。

## 探索前，先读这些

- 根目录的 **`CONTEXT.md`**，或
- 若根目录存在 **`CONTEXT-MAP.md`**：它指向每个上下文的 `CONTEXT.md`。读取与主题相关的每一个。
- **`docs/adr/`**：读取与你要工作的区域相关的 ADR。多上下文仓库还要检查 `src/<context>/docs/adr/` 里的上下文级决策。

若这些文件都不存在，**静默继续**。不要标记它们的缺失；不要主动建议创建。`/domain-modeling` skill（经 `/grill-with-docs` 与 `/improve-codebase-architecture` 触达）会在术语或决策真正落定时惰性创建它们。

## 文件结构

单上下文仓库（多数仓库）：

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

多上下文仓库（根目录存在 `CONTEXT-MAP.md`）：

```
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
└── src/
    ├── ordering/
    │   ├── CONTEXT.md
    │   └── docs/adr/                  ← context-specific decisions
    └── billing/
        ├── CONTEXT.md
        └── docs/adr/
```

## 使用术语表的词汇

当你的输出命名一个领域概念（issue 标题、重构提案、假设、测试名），使用 `CONTEXT.md` 中定义的术语。不要漂移到术语表明确回避的同义词。

如果你需要的概念还不在术语表里，那是一个信号：要么你在发明项目不使用的语言（重新考虑），要么存在真实缺口（记下来交给 `/domain-modeling`）。

## 标记 ADR 冲突

如果你的输出与现有 ADR 矛盾，明确标出而不是静默覆盖：

> _Contradicts ADR-0007 (event-sourced orders), but worth reopening because…_
