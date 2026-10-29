# Agent Note: 规范生成的 Markdown 快照空白

Status: implemented

[English](2026-10-30-normalize-vendor-markdown.md) | 中文

## 问题

上游 Markdown 快照包含行尾空格和文件末尾空行，无法通过仓库的全量空白检查。只清理生成文件，会让同一缺陷在下次刷新时重现；排除 vendor 路径则会把已知失败留在检查范围之外。

## 决策

[刷新脚本](../../../../skills/dota2/dota2-custom-game-dev/scripts/update_references.ps1)把 Markdown 规范为 LF，移除行尾空格、制表符和文件末尾空行，并为非空内容保留一个结尾换行。JSON 快照仍逐字节复制。`UPSTREAM.json` 记录来源版本与规范化政策，具体约定见[来源地图](../../../../skills/dota2/dota2-custom-game-dev/references/upstream-source-map.md)。

这取代了[上游同步记录](../process/2026-10-30-sync-upstream-skills.md)中的空白例外，同时保留其来源基线与适配边界。隔离刷新回归测试运行真实 PowerShell 脚本，检查 UTF-8 文本、缩进、空 Markdown、JSON 字节不变，以及重复刷新的稳定性。

## 备选方案

**只编辑生成的快照。** 否决：下次刷新会重新复制上游空白。

**排除 vendor 路径或放宽 Git 空白规则。** 否决：完整差异必须通过现有检查。

## 后果

Markdown 快照采用可复现的本地格式，而非与上游逐字节一致。API 数据和非空白文本保持不变，全量空白检查包含生成的快照。既有同步记录保留独立的来源和 skill（技能）决策，继续保持活跃。
