# Agent Note: 采纳 dsh 文档标准与门禁工具链

Status: implemented

[English](2026-08-17-adopt-dsh-documentation-standards.md) | 中文

## 问题

仓库已经发布了 skill、`AGENTS.md` 和 README，但没有明确的文档标准：没有规定某个事实该放在哪里的规则、没有决策记录格式、也没有双语约定。每个新 skill 和文档都是临时编写，导致定位、详略程度和英文/中文覆盖逐渐偏离。

上游 DeepSeek Harness 仓库有一套成熟的文档体系——文档标准、双语配对契约、Agent Note 决策记录格式和维护类 skill——并由一套基于官方 mdast/GFM 解析器的 pnpm 门禁工具链强制执行。

## 决策

采纳 DeepSeek Harness 的文档约定，并把它的 pnpm 门禁工具链移植为复用官方 mdast/GFM 解析器的 Node ESM 脚本：

- 位于 [`docs/AGENTS.md`](../../../../docs/AGENTS.md) 的文档标准：教程/参考分类、一个事实一个归属的分层法、写作规则、字数预算上限和冗余清单。
- 位于 [`docs/i18n/README.md`](../../../../docs/i18n/README.md) 的双语配对契约：英文 `foo.md` 加中文 `foo.zh.md`，再加一份保存两侧 git blob 哈希的 `foo.i18n.yaml` 一致性记录，配相互切换链接和机器检查的 mdast 结构签名；[`translation-rules.md`](../../../../docs/i18n/translation-rules.md) 和 [`terminology.md`](../../../../docs/i18n/terminology.md) 补齐 i18n 文档。
- 位于 [`.agents/notes/`](../../README.md) 的 Agent Note 决策记录体系：路径编码的 `{lifecycle}/{class}/date-topic`、固定头部块和按生命周期的骨架，以及必需的 Alternatives considered 章节。
- 由上游 pnpm 门禁移植而来的 Node ESM 门禁脚本，使用官方 mdast/GFM 解析器：[`verify-translation-pairing.mjs`](../../../../scripts/verify-translation-pairing.mjs) 配 `scripts/lib/{markdown,record,git}.mjs`（`--list` / `--write` / `--check`），外加 `verify-agent-note-format`、`verify-md-wrap`、`verify-md-links`、`verify-doc-budgets` 和 `verify-archived-agent-notes`，由 [`run-doc-gates.mjs`](../../../../scripts/run-doc-gates.mjs) 编排为 `npm run doc-gates`。
- 位于 [`skills/agent/`](../../../../skills/agent/) 的八个维护类 skill，由上游 `dsh-*` skill 改造而来，改为通用前缀并限定于本仓库。

名为 `AGENTS.md` 的指令文件和 `SKILL.md` 文件保持纯英文；`docs/` 下的内容文档和活跃的 Agent Note 为双语三件套。

## 备选方案

- **用上游的 TypeScript/pnpm workspace 重实现门禁。** 否决：仓库不是 Node workspace；同样的检查可以移植为纯 Node ESM，配相同的 mdast/GFM 解析器和最小的三个包依赖。
- **纯英文，不设双语约定。** 否决：仓库的 README 和受众是双语的，内容文档需要中文对应版本。
- **保留 `dsh-*` skill 名称。** 否决：这些名称及其正文针对上游 harness，而非本仓库；通用名称既限定于此，又保持可复用。
- **逐字复制整个 `docs/` 语料。** 否决：其中大部分记录的是 harness 的 TypeScript 包，在本仓库没有对应物。

## 后果

- 文档现在遵循一个事实一个归属、可评审的双语约定，以及机器可检查的决策记录格式。
- `npm run doc-gates` 强制执行配对（三件套、哈希、mdast 结构）、note 格式、预算、链接、换行和封存封印；内容一致性和翻译质量仍由评审负责。
- 门禁脚本在不依赖 TypeScript workspace 的前提下，承载了与上游相同的 mdast/GFM 结构签名。
