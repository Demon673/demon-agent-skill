# Agent Note: 保护维护输入与源数据

Status: implemented

[English](2026-10-30-protect-maintenance-inputs.md) | 中文

## 问题

安装目标可能通过目录别名指向技能源目录。不完整的上游刷新可能在保留旧引用文件的同时声明新版本。离线 API 查询可能打乱实参顺序、因 Windows 输出编码而失败，或为一个匹配的常量返回整个枚举。

## 决策

[PowerShell](../../../../scripts/link-skills.ps1) 和 [Bash](../../../../scripts/link-skills.sh) 安装器解析目标的父目录，在创建或替换已安装条目前，拒绝位于源目录内部或其祖先位置的目标。在 Windows 上，Bash 委托 PowerShell 使用相同的重解析点检查。已安装的链接仍可替换，且不跟随末级链接的目标。链接安装会立即反映源码编辑；复制安装需要重新安装，详见 [CONTRIBUTING](../../../../CONTRIBUTING.md)。

[引用刷新脚本](../../../../skills/dota2/dota2-custom-game-dev/scripts/update_references.ps1)在改变已打包输出前验证必需输入与来源版本，并随快照携带上游许可证。[来源映射](../../../../skills/dota2/dota2-custom-game-dev/references/upstream-source-map.md)定义文件清单与刷新政策。格式遵循[快照规范化决策](2026-10-30-normalize-vendor-markdown.md)；[同步决策](../process/2026-10-30-sync-upstream-skills.md)保留来源基线。

[查询助手](../../../../skills/dota2/dota2-custom-game-dev/scripts/search_dota2_api.py)保留上游实参位置，并输出 UTF-8 JSON。按常量值匹配时返回匹配的枚举成员；按枚举名匹配时保留整个枚举。真实 CLI 与隔离刷新测试验证这些行为，独立于调用方的输出编码和提交签名配置。

这些保护补充了[维护检查与发布决策](2026-10-30-close-maintenance-gaps.md)，后者继续定义钩子、翻译和 GIF 的归属规则。

## 备选方案

**信任目标路径的写法。** 否决：目录别名可以用另一条路径访问源目录，强制替换不能删除源数据。

**警告后发布不完整的刷新。** 否决：成功退出与新的提交标识会描述混合来源版本。

**返回匹配枚举的全部成员。** 否决：查询单个常量可能占用 agent 的大量上下文，却没有提供更多相关结果。

## 后果

不安全的安装目标与不完整的来源输入在改变现有输出前失败。普通链接和复制安装保留显式替换行为。枚举值结果更聚焦；需要完整枚举的调用方查询其名称。既有版本、格式和发布决策继续保持活跃，因为各自独立的保证仍然适用。
