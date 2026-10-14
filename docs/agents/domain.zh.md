# 领域文档

[English](domain.md) | 中文

本仓库采用单上下文布局。术语表是 [GLOSSARY.md](../../GLOSSARY.md)，架构决策位于 `docs/adr/` 下。

## 探索前，先读这些

- **术语表**：读取 [GLOSSARY.md](../../GLOSSARY.md)，了解本仓库的领域词汇。
- **ADR**：读取 `docs/adr/` 下与你要工作的区域相关的决策。

ADR 目录不存在时，继续使用已有文档。决策符合 `/domain-modeling` 的条件时，再通过该 skill 惰性创建 ADR。

## 文件结构

```
/
├── GLOSSARY.md
├── GLOSSARY.zh.md
├── GLOSSARY.i18n.yaml
└── docs/adr/
```

在本仓库使用 `/domain-modeling` 时，原位更新术语表及其双语三件套。

## 使用术语表的词汇

当你的输出命名领域概念（issue 标题、重构提案、假设或测试名）时，使用 [GLOSSARY.md](../../GLOSSARY.md) 定义的术语。遵守其 Avoid 条目对同义词的排除约定。

所需概念缺失时，检查它是否属于项目领域。把尚未明确的领域术语交给 `/domain-modeling`。

## 标记 ADR 冲突

如果你的输出与现有 ADR 矛盾，指出冲突，并说明为什么应重新讨论该决策。
